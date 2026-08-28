import { describe, it, expect, beforeAll } from 'vitest';
import { AgentRuntimeEngine } from '../src/lib/domain/engine';
import { ToolRegistry } from '../src/lib/domain/tools';
import { TestLLMProvider } from '../src/lib/domain/llm';
import { prisma } from '../src/lib/prisma';

describe('Real LLM-Driven Agent Runtime Engine', () => {
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

  it('Test A: User asks question requiring no tools -> LLM produces final answer', async () => {
    const testLLM = new TestLLMProvider([
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Cash reserves are in compliance with operating target policies.',
      },
    ]);

    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'What is our treasury reserve policy?',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
      llmProvider: testLLM,
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.iterationsRun).toBe(1);
    const completedEvent = result.events.find((e) => e.type === 'execution_completed');
    expect(completedEvent).toBeDefined();
  });

  it('Test B: User task requiring a tool -> LLM proposes tool call -> Tool executes -> LLM final answer', async () => {
    const testLLM = new TestLLMProvider([
      {
        type: 'TOOL_CALL',
        toolCall: {
          id: 'call-1',
          toolId: 'tool-bank-query',
          arguments: { entityId: 'ent-us' },
        },
      },
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Total cash balance across checking accounts is $4,820,000 USD.',
      },
    ]);

    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Query real-time bank account balances',
      autonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
      llmProvider: testLLM,
    });

    expect(result.status).toBe('COMPLETED');
    const toolEvent = result.events.find((e) => e.type === 'tool_completed');
    expect(toolEvent).toBeDefined();
    expect(toolEvent?.metadata?.toolResult).toBeDefined();
  });

  it('Test C: Multi-step tool execution (Tool A -> Result -> Tool B -> Result -> Final Answer)', async () => {
    const testLLM = new TestLLMProvider([
      {
        type: 'TOOL_CALL',
        toolCall: {
          id: 'call-1',
          toolId: 'tool-bank-query',
          arguments: { entityId: 'ent-us' },
        },
      },
      {
        type: 'TOOL_CALL',
        toolCall: {
          id: 'call-2',
          toolId: 'tool-yield-calculator',
          arguments: { amountUSD: 2500000, rateDelta: 0.045 },
        },
      },
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Recommended $2.5M sweep for +$112,500 annual yield lift.',
      },
    ]);

    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Analyze cash and calculate sweep yield',
      autonomyLevel: 'LEVEL_3_EXECUTE_WITHIN_POLICY',
      llmProvider: testLLM,
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.iterationsRun).toBe(3);
  });

  it('Test D: Unauthorized tool proposal -> Server security rejects tool call', async () => {
    const testLLM = new TestLLMProvider([
      {
        type: 'TOOL_CALL',
        toolCall: {
          id: 'call-unauthorized',
          toolId: 'tool-unauthorized-action',
          arguments: { action: 'delete' },
        },
      },
    ]);

    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Try unauthorized action',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
      llmProvider: testLLM,
    });

    const rejectEvent = result.events.find((e) => e.type === 'tool_unauthorized');
    expect(rejectEvent).toBeDefined();
  });

  it('Test E: Approval-required tool -> Policy evaluation -> WAITING_APPROVAL (Tool execution blocked)', async () => {
    const testLLM = new TestLLMProvider([
      {
        type: 'TOOL_CALL',
        toolCall: {
          id: 'call-large-sweep',
          toolId: 'tool-bank-query',
          arguments: { amountUSD: 2500000 },
        },
      },
    ]);

    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Execute $2.5M sweep',
      autonomyLevel: 'LEVEL_2_PREPARE', // Requires CFO approval
      llmProvider: testLLM,
    });

    expect(result.status).toBe('WAITING_APPROVAL');
    const approvalEvent = result.events.find((e) => e.type === 'approval_required');
    expect(approvalEvent).toBeDefined();
  });

  it('Test F: Missing LLM credential -> LLM_NOT_CONFIGURED status without fake execution', async () => {
    const result = await AgentRuntimeEngine.executeTask({
      tenantId,
      organizationId,
      agentId: testAgentId,
      taskPrompt: 'Execute with unconfigured LLM',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
    });

    expect(result.status).toBe('LLM_NOT_CONFIGURED');
    expect(result.iterationsRun).toBe(0);
  });
});
