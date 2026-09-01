import { describe, it, expect, beforeAll } from 'vitest';
import { AgentRuntimeEngine } from '../src/lib/domain/engine';
import { DefaultLLMProvider } from '../src/lib/domain/llm';
import { OpenAIEmbeddingProvider } from '../src/lib/domain/knowledge';
import { prisma } from '../src/lib/prisma';

const hasRealKeys =
  !!process.env.UNCLE_SCROOGE_LLM_API_KEY ||
  !!process.env.ANTHROPIC_API_KEY ||
  !!process.env.OPENAI_API_KEY;

describe('Phase 7 Real Autonomous Agent E2E Smoke Tests', () => {
  const tenantId = 'tenant-northstar-001';
  let testAgentId = 'agent-cash-flow';

  beforeAll(async () => {
    const agent = await prisma.agent.findFirst({ where: { tenantId } });
    if (agent) {
      testAgentId = agent.id;
    }
  });

  if (!hasRealKeys) {
    it('REAL AGENT STATUS: BLOCKED (No UNCLE_SCROOGE_LLM_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY configured in environment)', () => {
      console.log('REAL AGENT E2E STATUS: BLOCKED — API key not present in environment.');
      expect(hasRealKeys).toBe(false);
    });
  } else {
    it('Real E2E Test: Executes real Agent task with real LLM Provider and real Embeddings', async () => {
      const realLLM = new DefaultLLMProvider();
      const realEmbedding = new OpenAIEmbeddingProvider();

      expect(realLLM.isConfigured()).toBe(true);

      const result = await AgentRuntimeEngine.executeTask({
        tenantId,
        agentId: testAgentId,
        taskPrompt: 'Analyze available financial data and calculate expected yield improvement.',
        autonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
        llmProvider: realLLM,
        embeddingProvider: realEmbedding,
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.executionId).toBeDefined();
      expect(result.businessOutputId).toBeDefined();
    });
  }
});
