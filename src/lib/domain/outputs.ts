export interface StructuredOutputPayload {
  executiveSummary: string;
  financialImpactUSD: number;
  whyThisHappened: string;
  recommendation: string;
  expectedImpactUSD: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number; // 0.0 to 1.0
  evidenceSources: string[];
  proposedActions: string[];
}

export class BusinessOutputFormatter {
  /**
   * Formats structured output to prevent unstructured wall-of-text responses.
   */
  static formatStructuredOutput(payload: StructuredOutputPayload): StructuredOutputPayload {
    return {
      ...payload,
      confidenceScore: Math.min(1.0, Math.max(0.0, payload.confidenceScore)),
    };
  }
}
