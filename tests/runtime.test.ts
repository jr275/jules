import { describe, it, expect, beforeAll } from 'vitest';
import { AgentRuntimeEngine } from '../src/lib/domain/engine';
import { ToolRegistry } from '../src/lib/domain/tools';
import { PolicyEngine, PolicyRule } from '../src/lib/domain/policy';
import { prisma } from '../src/lib/prisma';

describe('Genuinely Agentic Runtime Engine', () => {
  const tenantId = 'tenant-northstar-001';
  let organizationId = 'org-northstar-global';
  let testAgentId = 'agent-cash-flow';

  beforeAll(async () => {
    const agent = await prisma.agent.findFirst({ where: { tenantId } });
    if (agent) {
      testAgentId = agent.id;
      organizationId = agent.organizationId;
    }
  });

  it('should execute a multi-step agent task end-to-end and emit structured events', async () => {
    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Analyze bank balances and optimize idle liquidity yield',
      autonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
      maxIterations: 3,
    });

    expect(result.executionId).toBeDefined();
    expect(result.iterationsRun).toBeGreaterThan(0);
    expect(result.iterationsRun).toBeLessThanOrEqual(3);
    expect(result.events.length).toBeGreaterThan(3);

    const eventTypes = result.events.map((e) => e.type);
    expect(eventTypes).toContain('execution_started');
    expect(eventTypes).toContain('planning_started');
    expect(eventTypes).toContain('policy_evaluated');
    expect(eventTypes).toContain('output_created');
  });

  it('should execute authorized tool in ToolRegistry cleanly', async () => {
    const result = await ToolRegistry.executeTool('tool-bank-query', { entityId: 'ent-us' }, {
      tenantId,
      organizationId,
      agentId: testAgentId,
    });

    expect(result.totalCashUSD).toBe(4820000);
    expect(result.accounts).toBeDefined();
  });

  it('should evaluate policy thresholds and pause execution when approval is required', async () => {
    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Sweep $2,500,000 cash balance',
      autonomyLevel: 'LEVEL_2_PREPARE', // Requires approval for > $500k
      maxIterations: 3,
    });

    expect(result.status).toBe('WAITING_APPROVAL');
    const approvalEvent = result.events.find((e) => e.type === 'approval_required');
    expect(approvalEvent).toBeDefined();
    expect(approvalEvent?.metadata?.requiredRole).toBe('CFO');
  });

  it('should prevent infinite loops by respecting maxIterations constraint', async () => {
    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Complex multi-step yield optimization task',
      autonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
      maxIterations: 1, // Cap at 1 iteration
    });

    expect(result.iterationsRun).toBe(1);
  });

  it('should reject unregistered tool calls safely', () => {
    expect(() => ToolRegistry.getTool('non-existent-tool')).toThrowError(
      "Tool 'non-existent-tool' is not registered"
    );
  });

  it('should persist execution steps and business outputs in database', async () => {
    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Persist execution trace test',
      autonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
      maxIterations: 2,
    });

    const executionInDb = await prisma.execution.findUnique({
      where: { id: result.executionId },
      include: { steps: true, outputs: true },
    });

    expect(executionInDb).toBeDefined();
    expect(executionInDb?.steps.length).toBeGreaterThan(0);
    expect(executionInDb?.outputs.length).toBeGreaterThan(0);
    expect(executionInDb?.outputs[0].financialImpact).toBeGreaterThan(0);
  });
});
