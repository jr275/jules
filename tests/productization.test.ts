import { describe, it, expect } from 'vitest';
import { ConnectorService, SUPPORTED_CONNECTORS } from '../src/lib/domain/connectors';
import { KnowledgeService } from '../src/lib/domain/knowledge';
import { BusinessOutputFormatter } from '../src/lib/domain/outputs';
import { CredentialManager } from '../src/lib/domain/credentials';

describe('Enterprise Connectors Hub & Safe Credential Vault', () => {
  it('should include Google Workspace and PostgreSQL connector definitions', () => {
    const googleSheets = SUPPORTED_CONNECTORS.find((c) => c.type === 'GOOGLE_SHEETS');
    const postgres = SUPPORTED_CONNECTORS.find((c) => c.type === 'POSTGRESQL');

    expect(googleSheets).toBeDefined();
    expect(googleSheets?.category).toBe('GOOGLE');
    expect(postgres).toBeDefined();
    expect(postgres?.category).toBe('DATA');
  });

  it('should format connector status display without leaking credentials', () => {
    const connectedDisplay = ConnectorService.getStatusDisplay('CONNECTED');
    expect(connectedDisplay.text).toBe('CONNECTED');
    expect(connectedDisplay.color).toBe('bg-emerald-500');

    const notConnectedDisplay = ConnectorService.getStatusDisplay('NOT_CONNECTED');
    expect(notConnectedDisplay.text).toContain('NOT CONFIGURED');
  });

  it('should return safe vault credential summaries', () => {
    const summary = ConnectorService.getSafeCredentialSummary('vault-ref-sec-9920148123');
    expect(summary).toContain('Vault Ref: vault-ref-sec-99');
    expect(summary).not.toContain('plaintext_password');
  });

  it('should sanitize payloads containing secret keys', () => {
    const rawPayload = {
      username: 'admin',
      apiKey: 'sk_live_9920148102391023',
      host: 'db.internal.northstar.com',
    };
    const sanitized = CredentialManager.sanitizePayload(rawPayload);
    expect(sanitized.username).toBe('admin');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.host).toBe('db.internal.northstar.com');
  });
});

describe('Knowledge Provenance & Confidence Metrics', () => {
  it('should calculate confidence scores weighted by data quality and freshness', () => {
    const scoreFresh = KnowledgeService.calculateConfidenceScore(0.95, 98, 0);
    expect(scoreFresh).toBeGreaterThan(0.90);

    const scoreDecayed = KnowledgeService.calculateConfidenceScore(0.95, 98, 20);
    expect(scoreDecayed).toBeLessThan(scoreFresh);
  });

  it('should format complete provenance audit strings', () => {
    const attribution = KnowledgeService.formatProvenanceAttribution(
      'Idle Treasury Sweep Value',
      '$112,500 USD',
      {
        sourceType: 'BANK_API',
        sourceId: 'JPMorgan Checking #4829',
        retrievedAt: new Date('2026-08-28T05:00:00Z'),
        qualityScore: 0.98,
        coveragePercent: 100,
      }
    );

    expect(attribution).toContain('Idle Treasury Sweep Value: $112,500 USD');
    expect(attribution).toContain('BANK_API (JPMorgan Checking #4829)');
    expect(attribution).toContain('Quality: 98%');
  });
});

describe('Structured Business Outputs & Value Calculations', () => {
  it('should format and bound confidence scores', () => {
    const formatted = BusinessOutputFormatter.formatStructuredOutput({
      executiveSummary: 'Sweep $2.5M to yield 4.5% money market',
      financialImpactUSD: 112500,
      whyThisHappened: 'Idle funds in checking account yielding 0%',
      recommendation: 'Execute automated sweep',
      expectedImpactUSD: 112500,
      riskLevel: 'LOW',
      confidenceScore: 1.4, // Out of bounds
      evidenceSources: ['Bank Balance API', 'Google Sheets Q1 Liquidity Model'],
      proposedActions: ['Transfer $2.5M to Money Market Fund #9102'],
    });

    expect(formatted.confidenceScore).toBe(1.0); // Clamped to 1.0
    expect(formatted.financialImpactUSD).toBe(112500);
  });
});
