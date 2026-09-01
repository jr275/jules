import { describe, it, expect, beforeAll } from 'vitest';
import { AgentSchedulerService } from '../src/lib/domain/scheduler';
import { DurableJobQueue } from '../src/lib/domain/queue';
import { prisma } from '../src/lib/prisma';

describe('Phase 6 Autonomous Agent Triggers & Scheduler Engine', () => {
  const tenantA = 'tenant-northstar-001';
  const tenantB = 'tenant-competitor-999';
  let testAgentId = 'agent-cash-flow';

  beforeAll(async () => {
    const agent = await prisma.agent.findFirst({ where: { tenantId: tenantA } });
    if (agent) {
      testAgentId = agent.id;
    }
  });

  it('1. Schedule Trigger Creation & Next Run Calculation: Calculates UTC next run timestamp', async () => {
    const trigger = await AgentSchedulerService.createTrigger({
      tenantId: tenantA,
      agentId: testAgentId,
      type: 'SCHEDULE',
      timezone: 'America/Sao_Paulo',
      cronExpression: '0 8 * * *', // Daily at 8:00 AM
    });

    expect(trigger.id).toBeDefined();
    expect(trigger.type).toBe('SCHEDULE');
    expect(trigger.status).toBe('ENABLED');
    expect(trigger.timezone).toBe('America/Sao_Paulo');
    expect(trigger.nextTriggerAt).toBeDefined();
  });

  it('2. Occurrence Idempotency & Scheduler Polling: Creates ONE AgentJob for due schedule', async () => {
    const pastTime = new Date(Date.now() - 60000); // 1 min ago (Due)
    const trigger = await prisma.agentTrigger.create({
      data: {
        tenantId: tenantA,
        agentId: testAgentId,
        type: 'SCHEDULE',
        status: 'ENABLED',
        timezone: 'America/New_York',
        cronExpression: '0 * * * *', // Hourly
        nextTriggerAt: pastTime,
      },
    });

    // First Poll
    const jobsCreated1 = await AgentSchedulerService.pollDueSchedules(new Date());
    expect(jobsCreated1).toBeGreaterThan(0);

    // Second Poll (Occurrence key already recorded -> 0 duplicate jobs created)
    const jobsCreated2 = await AgentSchedulerService.pollDueSchedules(new Date());
    expect(jobsCreated2).toBe(0);
  });

  it('3. Event-Driven Trigger & Event Loop Protection: Prevents recursive trigger loops > depth 3', async () => {
    const eventTrigger = await AgentSchedulerService.createTrigger({
      tenantId: tenantA,
      agentId: testAgentId,
      type: 'EVENT',
      configuration: {
        topic: 'BUSINESS_OUTPUT_CREATED',
        condition: { field: 'value', operator: 'GT', value: 50000 },
      },
    });

    // Valid Event
    const jobsTriggered = await AgentSchedulerService.processEvent({
      tenantId: tenantA,
      topic: 'BUSINESS_OUTPUT_CREATED',
      eventData: { value: 100000 },
      triggerDepth: 1,
    });

    expect(jobsTriggered).toBeGreaterThan(0);

    // Deep Event Cascade (> 3) -> Blocked by event loop protection
    const blockedCascade = await AgentSchedulerService.processEvent({
      tenantId: tenantA,
      topic: 'BUSINESS_OUTPUT_CREATED',
      eventData: { value: 100000 },
      triggerDepth: 4,
    });

    expect(blockedCascade).toBe(0);
  });

  it('4. Run Now Execution: Creates immediate critical priority AgentJob', async () => {
    const trigger = await AgentSchedulerService.createTrigger({
      tenantId: tenantA,
      agentId: testAgentId,
      type: 'MANUAL',
    });

    const jobId = await AgentSchedulerService.runNow(tenantA, trigger.id);
    expect(jobId).toBeDefined();

    const jobInDb = await prisma.agentJob.findUnique({ where: { id: jobId } });
    expect(jobInDb?.priority).toBe('CRITICAL');
  });

  it('5. Tenant Isolation: Tenant B cannot execute Tenant A triggers', async () => {
    const trigger = await AgentSchedulerService.createTrigger({
      tenantId: tenantA,
      agentId: testAgentId,
      type: 'MANUAL',
    });

    await expect(AgentSchedulerService.runNow(tenantB, trigger.id)).rejects.toThrowError();
  });
});
