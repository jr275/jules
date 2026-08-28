import { AppError } from './types';

export type ProvenanceSourceType = 'GOOGLE_SHEETS' | 'GOOGLE_DRIVE' | 'BANK_API' | 'ERP' | 'POSTGRES' | 'FILE_UPLOAD' | 'USER_INPUT' | 'MODEL_ESTIMATE';

export interface KnowledgeProvenanceInfo {
  sourceType: ProvenanceSourceType | string;
  sourceId: string;
  retrievedAt: Date;
  qualityScore: number;
  coveragePercent?: number;
}

export class KnowledgeService {
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
