import { AppError } from './types';
import { prisma } from '../prisma';
import crypto from 'crypto';

export type ProvenanceSourceType =
  | 'GOOGLE_SHEETS'
  | 'GOOGLE_DRIVE'
  | 'BANK_API'
  | 'ERP'
  | 'POSTGRES'
  | 'FILE_UPLOAD'
  | 'USER_INPUT'
  | 'MODEL_ESTIMATE';

export interface KnowledgeProvenanceInfo {
  sourceType: ProvenanceSourceType | string;
  sourceId: string;
  retrievedAt: Date;
  qualityScore: number;
  coveragePercent?: number;
}

export interface EmbeddingProvider {
  id: string;
  dimensions: number;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

/**
 * Deterministic Test Embedding Provider for Unit & Integration Tests (1536 dimensions)
 */
export class TestEmbeddingProvider implements EmbeddingProvider {
  public id = 'test-embedding-provider';
  public dimensions = 1536;

  public async embed(text: string): Promise<number[]> {
    const hash = crypto.createHash('sha256').update(text).digest();
    const vec: number[] = [];
    for (let i = 0; i < this.dimensions; i++) {
      const val = (hash[i % hash.length] / 255) * 2 - 1;
      vec.push(val);
    }
    // Normalize vector length
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return vec.map((v) => v / norm);
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}

/**
 * OpenAI / Anthropic Real Embedding Provider
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  public id = 'text-embedding-3-small';
  public dimensions = 1536;
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.UNCLE_SCROOGE_LLM_API_KEY || process.env.OPENAI_API_KEY || null;
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public async embed(text: string): Promise<number[]> {
    const batch = await this.embedBatch([text]);
    return batch[0];
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.isConfigured()) {
      throw new AppError('INTEGRATION_ERROR', 'OpenAI Embedding Provider is NOT_CONFIGURED. Set OPENAI_API_KEY.');
    }

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.id,
        input: texts,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new AppError('INTEGRATION_ERROR', `OpenAI Embedding API returned HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.data.map((item: any) => item.embedding);
  }
}

export interface KnowledgeSearchResult {
  chunkId: string;
  knowledgeSourceId: string;
  sourceName: string;
  content: string;
  similarityScore: number;
  provenance: KnowledgeProvenanceInfo;
}

export class KnowledgeService {
  /**
   * Computes Cosine Similarity between two normalized vector embeddings.
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Splits a document into structural, paragraph-aware text chunks.
   */
  static chunkDocument(text: string, maxChunkSize: number = 500): Array<{ content: string; hash: string }> {
    const paragraphs = text.split(/\n\n+/);
    const chunks: Array<{ content: string; hash: string }> = [];

    let currentChunk = '';

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      if ((currentChunk + '\n\n' + trimmed).length > maxChunkSize && currentChunk.length > 0) {
        const hash = crypto.createHash('sha256').update(currentChunk).digest('hex');
        chunks.push({ content: currentChunk, hash });
        currentChunk = trimmed;
      } else {
        currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
      }
    }

    if (currentChunk.length > 0) {
      const hash = crypto.createHash('sha256').update(currentChunk).digest('hex');
      chunks.push({ content: currentChunk, hash });
    }

    return chunks;
  }

  /**
   * Ingests a KnowledgeSource document idempotently with content hashing and embeddings.
   */
  static async ingestDocument(
    tenantId: string,
    knowledgeSourceId: string,
    documentText: string,
    embeddingProvider: EmbeddingProvider = new TestEmbeddingProvider()
  ): Promise<{ chunksIngested: number; sourceId: string }> {
    const ks = await prisma.knowledgeSource.findFirst({
      where: { id: knowledgeSourceId, tenantId },
    });

    if (!ks) {
      throw new AppError('NOT_FOUND', `KnowledgeSource '${knowledgeSourceId}' not found for tenant '${tenantId}'`);
    }

    const rawChunks = this.chunkDocument(documentText);
    let chunksIngested = 0;

    for (let i = 0; i < rawChunks.length; i++) {
      const { content, hash } = rawChunks[i];

      // Idempotency check via content hash
      const existing = await prisma.knowledgeChunk.findFirst({
        where: { tenantId, knowledgeSourceId, contentHash: hash },
      });

      if (!existing) {
        const embedding = await embeddingProvider.embed(content);
        await prisma.knowledgeChunk.create({
          data: {
            tenantId,
            knowledgeSourceId,
            chunkIndex: i,
            content,
            contentHash: hash,
            embeddingJson: JSON.stringify(embedding),
            metadata: JSON.stringify({ sourceName: ks.name, uri: ks.uri }),
          },
        });
        chunksIngested++;
      }
    }

    return { chunksIngested, sourceId: knowledgeSourceId };
  }

  /**
   * Semantic Vector Search filtered strictly by tenantId and authorized agent KnowledgeSources.
   */
  static async search(
    tenantId: string,
    query: string,
    authorizedSourceIds?: string[],
    topK: number = 3,
    minSimilarityThreshold: number = 0.1,
    embeddingProvider: EmbeddingProvider = new TestEmbeddingProvider()
  ): Promise<KnowledgeSearchResult[]> {
    const queryEmbedding = await embeddingProvider.embed(query);

    const whereFilter: any = { tenantId };
    if (authorizedSourceIds && authorizedSourceIds.length > 0) {
      whereFilter.knowledgeSourceId = { in: authorizedSourceIds };
    }

    const dbChunks = await prisma.knowledgeChunk.findMany({
      where: whereFilter,
      include: { knowledgeSource: true },
    });

    const scoredResults: KnowledgeSearchResult[] = [];

    for (const chunk of dbChunks) {
      const chunkEmbedding: number[] = JSON.parse(chunk.embeddingJson || '[]');
      const score = this.cosineSimilarity(queryEmbedding, chunkEmbedding);

      if (score >= minSimilarityThreshold) {
        scoredResults.push({
          chunkId: chunk.id,
          knowledgeSourceId: chunk.knowledgeSourceId,
          sourceName: chunk.knowledgeSource.name,
          content: chunk.content,
          similarityScore: Math.round(score * 1000) / 1000,
          provenance: {
            sourceType: chunk.knowledgeSource.type,
            sourceId: chunk.knowledgeSource.uri,
            retrievedAt: new Date(),
            qualityScore: 0.95,
            coveragePercent: 100,
          },
        });
      }
    }

    // Sort by cosine similarity score descending and pick Top-K
    scoredResults.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredResults.slice(0, topK);
  }

  /**
   * Evaluates the data confidence score based on provenance quality and freshness.
   */
  static calculateConfidenceScore(qualityScore: number, coveragePercent: number = 100, ageInHours: number = 0): number {
    const freshnessDecay = Math.max(0, 1 - ageInHours * 0.01);
    const score = (qualityScore * 0.6 + (coveragePercent / 100) * 0.4) * freshnessDecay;
    return Math.min(0.99, Math.max(0.1, Number(score.toFixed(3))));
  }

  /**
   * Formats provenance attribution for executive decision audit trails.
   */
  static formatProvenanceAttribution(
    numberLabel: string,
    value: string | number,
    provenance: KnowledgeProvenanceInfo
  ): string {
    const formattedVal = typeof value === 'number' ? value.toLocaleString() : value;
    const coverage = provenance.coveragePercent !== undefined ? `, Coverage: ${provenance.coveragePercent}%` : '';
    return `${numberLabel}: ${formattedVal} | Provenance: ${provenance.sourceType} (${provenance.sourceId}) [Quality: ${(provenance.qualityScore * 100).toFixed(0)}%${coverage}]`;
  }
}
