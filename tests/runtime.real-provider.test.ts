import { describe, it, expect, beforeAll } from 'vitest';
import { AgentRuntimeEngine } from '../src/lib/domain/engine';
import { DefaultLLMProvider } from '../src/lib/domain/llm';
import { prisma } from '../src/lib/prisma';

const hasLLMKey =
  !!process.env.UNCLE_SCROOGE_LLM_API_KEY ||
  !!process.env.LLM_API_KEY ||
  !!process.env.ANTHROPIC_API_KEY ||
  !!process.env.OPENAI_API_KEY;

describe('Phase 3A.2 Real LLM Provider Smoke Tests', () => {
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

  if (!hasLLMKey) {
    it('REAL PROVIDER STATUS: BLOCKED (No UNCLE_SCROOGE_LLM_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY in environment)', () => {
      const realProvider = new DefaultLLMProvider();
      expect(realProvider.isConfigured()).toBe(false);
      console.log('REAL PROVIDER TEST STATUS: BLOCKED — credential not configured in environment.');
    });
  } else {
    it('Real Smoke Test 1 (No Tool Required): Direct answer from real LLM Provider', async () => {
      const realProvider = new DefaultLLMProvider();
      expect(realProvider.isConfigured()).toBe(true);

      const result = await AgentRuntimeEngine.executeTask({
        tenantId,
        organizationId,
        agentId: testAgentId,
        taskPrompt: 'Explain what a cash balance of $4.82M means for liquidity planning. Do not use any tools.',
        autonomyLevel: 'LEVEL_1_RECOMMEND',
        llmProvider: realProvider,
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.iterationsRun).toBeGreaterThan(0);
      const completedEvent = result.events.find((e) => e.type === 'execution_completed');
      expect(completedEvent).toBeDefined();
    });

    it('Real Smoke Test 2 (Tool Required): Real LLM selects tool dynamically', async () => {
      const realProvider = new DefaultLLMProvider();
      expect(realProvider.isConfigured()).toBe(true);

      const result = await AgentRuntimeEngine.executeTask({
        tenantId,
        organizationId,
        agentId: testAgentId,
        taskPrompt: 'Inspect the available financial data and calculate the expected yield improvement.',
        autonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
        llmProvider: realProvider,
      });

      expect(result.status).toBe('COMPLETED');
      const toolEvent = result.events.find((e) => e.type === 'tool_completed' || e.type === 'tool_selected');
      expect(toolEvent).toBeDefined();
    });
  }
});
