import { AppError } from './types';

export interface KnowledgeProvenanceInfo {
  sourceType: string; // e.g. GOOGLE_SHEET, BANK_API, ERP
  sourceId: string;   // URI or File ID
  retrievedAt: Date;
  qualityScore: number;
}

export class KnowledgeService {
  /**
   * Formats provenance attribution answer for executive auditability.
   */
  static formatProvenanceAttribution(
    numberLabel: string,
    value: string | number,
    provenance: KnowledgeProvenanceInfo
  ): string {
    return `${numberLabel}: ${value} | Source: ${provenance.sourceType} (${provenance.sourceId}) [Retrieved: ${provenance.retrievedAt.toISOString()}]`;
  }
}
