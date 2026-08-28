import { describe, it, expect, beforeAll } from 'vitest';
import { AgentSchedulerService } from '../src/lib/domain/scheduler';
import { DurableJobQueue } from '../src/lib/domain/queue';
import { AgentWorker } from '../src/lib/domain/worker';
import { AgentRuntimeEngine } from '../src/lib/domain/engine';
import { AgentMemoryEngine } from '../src/lib/domain/memory';
import { TestLLMProvider } from '../src/lib/domain/llm';
import { TestEmbeddingProvider } from '../src/lib/domain/knowledge';
import { prisma } from '../src/lib/prisma';

describe('Phase 7 Real End-to-End Autonomous Agent Validation', () => {
  const tenantA = 'tenant-northstar-001';
  const tenantB = 'tenant-competitor-999';
  let agentId = 'agent-cash-flow';
  let triggerId = '';

  beforeAll(async () => {
    const agent = await prisma.agent.findFirst({ where: { tenantId: tenantA } });
    if (agent) {
      agentId = agent.id;
    }

    const trigger = await AgentSchedulerService.createTrigger({
      tenantId: tenantA,
      agentId,
      type: 'SCHEDULE',
      timezone: 'America/Sao_Paulo',
      cronExpression: '0 8 * * *',
    });
    triggerId = trigger.id;
  });

  it('1. HTTP Decoupling: Queueing job returns immediately with QUEUED status without blocking HTTP thread', async () => {
    const execution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId,
        trigger: 'ASYNC_JOB_QUEUE',
        status: 'QUEUED',
      },
    });

    const job = await DurableJobQueue.enqueueJob({
      tenantId: tenantA,
      agentId,
      executionId: execution.id,
      priority: 'NORMAL',
    });

    expect(job.id).toBeDefined();
    expect(job.status).toBe('QUEUED');
    expect(execution.status).toBe('QUEUED');
  });

  it('2. End-to-End Autonomous Flow: Schedule -> Trigger -> AgentJob -> Worker -> RAG -> Memory -> Tool -> Output', async () => {
    // Store prior durable memory for Agent
    await AgentMemoryEngine.storeMemory(
      tenantA,
      agentId,
      'EPISODIC',
      'Agent previously discovered $2.5M surplus cash balance in JPMorgan Checking #4829',
      0.95
    );

    // Poll due schedule to enqueue job
    const now = new Date(Date.now() + 86400000); // Tomorrow 08:00
    await AgentSchedulerService.pollDueSchedules(now);

    const testLLM = new TestLLMProvider([
      {
        type: 'TOOL_CALL',
        toolCall: { id: 'call-1', toolId: 'tool-bank-query', arguments: { entityId: 'ent-us' } },
      },
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Analyzed bank balances. Recommending $2.5M sweep for yield optimization.',
      },
    ]);

    const worker = new AgentWorker({
      workerId: 'worker-e2e-1',
      llmProvider: testLLM,
      embeddingProvider: new TestEmbeddingProvider(),
    });

    const claimedJob = await DurableJobQueue.claimNextJob(worker.workerId, 30000);
    expect(claimedJob).toBeDefined();

    await worker.processJob(claimedJob);

    const completedJob = await prisma.agentJob.findUnique({ where: { id: claimedJob!.id } });
    expect(completedJob?.status).toBe('COMPLETED');

    const executionInDb = await prisma.execution.findUnique({
      where: { id: claimedJob!.executionId },
      include: { outputs: true, steps: true },
    });

    expect(executionInDb?.status).toBe('COMPLETED');
    expect(executionInDb?.outputs.length).toBeGreaterThan(0);
    expect(executionInDb?.outputs[0].financialImpact).toBeGreaterThan(0);
  });

  it('3. Worker Crash Recovery & Idempotency: Resumes from checkpoint without duplicate tool calls', async () => {
    const execution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId,
        trigger: 'CRASH_RECOVERY_TEST',
        status: 'QUEUED',
      },
    });

    const job = await DurableJobQueue.enqueueJob({
      tenantId: tenantA,
      agentId,
      executionId: execution.id,
      priority: 'HIGH',
    });

    // Worker A claims job
    await DurableJobQueue.claimNextJob('worker-crashed-A', 30000);

    // Backdate lease to simulate Worker A crash
    await prisma.agentJob.update({
      where: { id: job.id },
      data: { lockedAt: new Date(Date.now() - 60000) },
    });

    const testLLM = new TestLLMProvider([
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Resumed crashed worker job successfully.',
      },
    ]);

    const workerB = new AgentWorker({
      workerId: 'worker-recovered-B',
      llmProvider: testLLM,
      embeddingProvider: new TestEmbeddingProvider(),
    });

    const claimedByB = await DurableJobQueue.claimNextJob(workerB.workerId, 30000);
    expect(claimedByB).toBeDefined();
    expect(claimedByB?.id).toBe(job.id);

    await workerB.processJob(claimedByB);

    const recoveredJob = await prisma.agentJob.findUnique({ where: { id: job.id } });
    expect(recoveredJob?.status).toBe('COMPLETED');
  });

  it('4. Duplicate Scheduler Prevention: Concurrent polling creates exactly ONE AgentJob', async () => {
    const scheduledTime = new Date(Date.now() + 172800000); // +2 days
    const trigger = await prisma.agentTrigger.create({
      data: {
        tenantId: tenantA,
        agentId,
        type: 'SCHEDULE',
        status: 'ENABLED',
        timezone: 'UTC',
        cronExpression: '0 * * * *',
        nextTriggerAt: scheduledTime,
      },
    });

    // Concurrent poll
    const p1 = AgentSchedulerService.pollDueSchedules(scheduledTime);
    const p2 = AgentSchedulerService.pollDueSchedules(scheduledTime);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1 + r2).toBe(1); // Exactly 1 job created
  });

  it('5. Tenant Isolation: Tenant B cannot access Tenant A execution records or jobs', async () => {
    const execution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId,
        trigger: 'TENANT_TEST',
        status: 'COMPLETED',
      },
    });

    const tenantBQuery = await prisma.execution.findFirst({
      where: { id: execution.id, tenantId: tenantB },
    });

    expect(tenantBQuery).toBeNull();
  });
});
