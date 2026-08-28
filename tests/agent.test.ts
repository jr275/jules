import { describe, it, expect } from 'vitest';
import { AgentService } from '../src/lib/domain/agent';
import { ToolRegistry } from '../src/lib/domain/tools';
import { SUPPORTED_CONNECTORS, ConnectorService } from '../src/lib/domain/connectors';
import { KnowledgeService } from '../src/lib/domain/knowledge';
import { BusinessOutputFormatter } from '../src/lib/domain/outputs';

describe('Agent Service & Metrics', () => {
  it('should calculate observatory metrics correctly', () => {
    const executions = [
      { status: 'COMPLETED', startedAt: new Date('2026-08-28T01:00:00Z'), completedAt: new Date('2026-08-28T01:00:02Z') },
      { status: 'COMPLETED', startedAt: new Date('2026-08-28T02:00:00Z'), completedAt: new Date('2026-08-28T02:00:04Z') },
    ];
    const outputs = [{ financialImpact: 216300 }];

    const metrics = AgentService.calculateMetrics(executions, outputs, 2, 3);
    expect(metrics.totalExecutions).toBe(2);
    expect(metrics.successRate).toBe(100);
    expect(metrics.averageExecutionTimeMs).toBe(3000);
    expect(metrics.totalEconomicImpactUSD).toBe(216300);
  });

  it('should generate versioning payload cleanly', () => {
    const payload = AgentService.createNewVersionPayload(1, 'Added Google Sheets connector', { varianceThreshold: 0.05 });
    expect(payload.version).toBe(2);
    expect(payload.changelog).toBe('Added Google Sheets connector');
  });
});

describe('Tool Registry & Security', () => {
  it('should retrieve registered tools', () => {
    const tool = ToolRegistry.getTool('tool-bank-query');
    expect(tool.name).toBe('Bank Account Balance Query');
    expect(tool.category).toBe('BANKING');
  });

  it('should throw error when tool is not registered', () => {
    expect(() => ToolRegistry.getTool('unregistered-tool')).toThrowError(
      "Tool 'unregistered-tool' is not registered"
    );
  });
});

describe('Connector Framework & Credentials Isolation', () => {
  it('should contain supported connector definitions for Google & Microsoft', () => {
    const googleSheet = SUPPORTED_CONNECTORS.find((c) => c.type === 'GOOGLE_SHEETS');
    expect(googleSheet).toBeDefined();
    expect(googleSheet?.category).toBe('GOOGLE');
  });

  it('should map connector statuses safely without returning secrets', () => {
    const status = ConnectorService.getStatusDisplay('CONNECTED');
    expect(status.text).toBe('CONNECTED');
    expect(status.color).toBe('bg-emerald-500');
  });
});

describe('Knowledge Provenance & Structured Outputs', () => {
  it('should format provenance attribution for trust auditing', () => {
    const attr = KnowledgeService.formatProvenanceAttribution('Revenue', '$4.82M', {
      sourceType: 'GOOGLE_SHEETS',
      sourceId: 'FY26_Forecast_Sheet',
      retrievedAt: new Date('2026-08-28T04:00:00Z'),
      qualityScore: 1.0,
    });

    expect(attr).toContain('Revenue: $4.82M');
    expect(attr).toContain('GOOGLE_SHEETS');
  });

  it('should sanitize and format structured business output', () => {
    const formatted = BusinessOutputFormatter.formatStructuredOutput({
      executiveSummary: 'Cash liquidity optimal',
      financialImpactUSD: 216300,
      whyThisHappened: 'High checking balance',
      recommendation: 'Sweep to money market',
      expectedImpactUSD: 205485,
      riskLevel: 'LOW',
      confidenceScore: 0.95,
      evidenceSources: ['JPMorgan Checking #4829'],
      proposedActions: ['Rebalance $4.2M'],
    });

    expect(formatted.confidenceScore).toBe(0.95);
    expect(formatted.financialImpactUSD).toBe(216300);
  });
});
