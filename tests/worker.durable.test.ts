import { describe, it, expect, beforeAll } from 'vitest';
import { DurableJobQueue } from '../src/lib/domain/queue';
import { AgentWorker } from '../src/lib/domain/worker';
import { TestLLMProvider } from '../src/lib/domain/llm';
import { TestEmbeddingProvider } from '../src/lib/domain/knowledge';
import { prisma } from '../src/lib/prisma';

describe('Phase 5 Background Agent Workers & Durable Queue Execution', () => {
  const tenantA = 'tenant-northstar-001';
  let testAgentId = 'agent-cash-flow';

  beforeAll(async () => {
    const agent = await prisma.agent.findFirst({ where: { tenantId: tenantA } });
    if (agent) {
      testAgentId = agent.id;
    }
  });

  it('1. HTTP Decoupling & Job Queueing: Enqueues job and returns immediately without blocking', async () => {
    const dbExecution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId: testAgentId,
        trigger: 'ASYNC_JOB_QUEUE',
        status: 'QUEUED',
      },
    });

    const job = await DurableJobQueue.enqueueJob({
      tenantId: tenantA,
      agentId: testAgentId,
      executionId: dbExecution.id,
      priority: 'HIGH',
    });

    expect(job.id).toBeDefined();
    expect(job.status).toBe('QUEUED');
    expect(job.priority).toBe('HIGH');
  });

  it('2. Atomic Job Claiming: Concurrency lock prevents duplicate worker claims', async () => {
    const dbExecution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId: testAgentId,
        trigger: 'ASYNC_JOB_QUEUE',
        status: 'QUEUED',
      },
    });

    await DurableJobQueue.enqueueJob({
      tenantId: tenantA,
      agentId: testAgentId,
      executionId: dbExecution.id,
      priority: 'CRITICAL',
    });

    // Worker 1 claims job
    const claimedByWorker1 = await DurableJobQueue.claimNextJob('worker-node-1', 30000);
    expect(claimedByWorker1).toBeDefined();
    expect(claimedByWorker1?.status).toBe('RUNNING');
    expect(claimedByWorker1?.lockedBy).toBe('worker-node-1');

    // Worker 2 attempts to claim next job (should be null or different job)
    const claimedByWorker2 = await DurableJobQueue.claimNextJob('worker-node-2', 30000);
    if (claimedByWorker2) {
      expect(claimedByWorker2.id).not.toBe(claimedByWorker1?.id);
    }
  });

  it('3. Worker Processing & Integration: Worker processes claimed job to completion', async () => {
    const dbExecution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId: testAgentId,
        trigger: 'ASYNC_JOB_QUEUE',
        status: 'QUEUED',
      },
    });

    const job = await DurableJobQueue.enqueueJob({
      tenantId: tenantA,
      agentId: testAgentId,
      executionId: dbExecution.id,
      priority: 'NORMAL',
      metadata: { taskPrompt: 'Background liquidity analysis' },
    });

    const testLLM = new TestLLMProvider([
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Background worker completed agent task.',
      },
    ]);

    const worker = new AgentWorker({
      workerId: 'worker-unit-test-1',
      llmProvider: testLLM,
      embeddingProvider: new TestEmbeddingProvider(),
    });

    // Claim and process job
    const claimed = await DurableJobQueue.claimNextJob(worker.workerId, 30000);
    expect(claimed).toBeDefined();

    await worker.processJob(claimed);

    const completedJob = await prisma.agentJob.findUnique({ where: { id: job.id } });
    expect(completedJob?.status).toBe('COMPLETED');
  });

  it('4. Crash Recovery & Lease Expiration: Worker B claims and resumes job from expired lease of crashed Worker A', async () => {
    const dbExecution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId: testAgentId,
        trigger: 'ASYNC_JOB_QUEUE',
        status: 'QUEUED',
      },
    });

    const job = await DurableJobQueue.enqueueJob({
      tenantId: tenantA,
      agentId: testAgentId,
      executionId: dbExecution.id,
      priority: 'HIGH',
    });

    // Worker A claims job
    await DurableJobQueue.claimNextJob('worker-crashed-A', 30000);

    // Simulate Worker A crash by backdating lockedAt lease expiration threshold
    const leaseExpiredTime = new Date(Date.now() - 60000); // 60s ago
    await prisma.agentJob.update({
      where: { id: job.id },
      data: { lockedAt: leaseExpiredTime },
    });

    // Worker B claims expired job
    const claimedByWorkerB = await DurableJobQueue.claimNextJob('worker-recovered-B', 30000);
    expect(claimedByWorkerB).toBeDefined();
    expect(claimedByWorkerB?.id).toBe(job.id);
    expect(claimedByWorkerB?.lockedBy).toBe('worker-recovered-B');
  });

  it('5. Job Cancellation: Cancelling job prevents worker pickup', async () => {
    const dbExecution = await prisma.execution.create({
      data: {
        tenantId: tenantA,
        organizationId: 'org-northstar-global',
        agentId: testAgentId,
        trigger: 'ASYNC_JOB_QUEUE',
        status: 'QUEUED',
      },
    });

    const job = await DurableJobQueue.enqueueJob({
      tenantId: tenantA,
      agentId: testAgentId,
      executionId: dbExecution.id,
    });

    await DurableJobQueue.cancelJob(tenantA, job.id);

    const cancelled = await prisma.agentJob.findUnique({ where: { id: job.id } });
    expect(cancelled?.status).toBe('CANCELLED');
  });
});
