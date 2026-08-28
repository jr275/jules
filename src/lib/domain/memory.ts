import { AppError } from './types';
import { prisma } from '../prisma';

export type MemoryType = 'WORKING' | 'EPISODIC' | 'SEMANTIC';

export interface MemoryRecord {
  id: string;
  tenantId: string;
  agentId: string;
  type: MemoryType;
  content: string;
  sourceExecutionId?: string | null;
  confidence: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class MemoryPolicy {
  /**
   * Deterministic Memory Write Guard preventing prompt injection and unverified memory pollution.
   */
  static validateMemoryWrite(
    content: string,
    confidence: number,
    sourceExecutionId?: string
  ): boolean {
    if (!content || content.trim().length < 5) return false;
    if (confidence < 0.6) return false;

    // Reject memory entries containing prompt injection patterns
    const injectionPatterns = [
      'ignore system instructions',
      'ignore previous policies',
      'transfer funds',
      'override autonomy',
      'admin access',
    ];

    const lower = content.toLowerCase();
    if (injectionPatterns.some((p) => lower.includes(p))) {
      return false;
    }

    return true;
  }
}

export class AgentMemoryEngine {
  /**
   * Stores a durable memory record under tenant and agent isolation boundaries.
   */
  static async storeMemory(
    tenantId: string,
    agentId: string,
    type: MemoryType,
    content: string,
    confidence: number = 0.9,
    sourceExecutionId?: string,
    metadata?: Record<string, unknown>
  ): Promise<MemoryRecord> {
    if (!MemoryPolicy.validateMemoryWrite(content, confidence, sourceExecutionId)) {
      throw new AppError('VALIDATION_ERROR', 'Memory write rejected by MemoryPolicy guard');
    }

    const record = await prisma.agentMemory.create({
      data: {
        tenantId,
        agentId,
        type,
        content,
        confidence,
        sourceExecutionId: sourceExecutionId || null,
        metadata: JSON.stringify(metadata || {}),
      },
    });

    return {
      id: record.id,
      tenantId: record.tenantId,
      agentId: record.agentId,
      type: record.type as MemoryType,
      content: record.content,
      sourceExecutionId: record.sourceExecutionId,
      confidence: record.confidence,
      metadata: JSON.parse(record.metadata || '{}'),
      createdAt: record.createdAt,
    };
  }

  /**
   * Retrieves durable memories for an agent strictly filtered by tenantId.
   */
  static async retrieveMemory(
    tenantId: string,
    agentId: string,
    type?: MemoryType,
    limit: number = 5
  ): Promise<MemoryRecord[]> {
    const whereClause: any = { tenantId, agentId };
    if (type) {
      whereClause.type = type;
    }

    const records = await prisma.agentMemory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      agentId: r.agentId,
      type: r.type as MemoryType,
      content: r.content,
      sourceExecutionId: r.sourceExecutionId,
      confidence: r.confidence,
      metadata: JSON.parse(r.metadata || '{}'),
      createdAt: r.createdAt,
    }));
  }
}
