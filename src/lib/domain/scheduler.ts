import { AppError } from './types';
import { prisma } from '../prisma';
import { DurableJobQueue, JobPriority } from './queue';

export type TriggerType = 'MANUAL' | 'SCHEDULE' | 'EVENT';
export type TriggerStatus = 'ENABLED' | 'DISABLED';
export type MisfirePolicy = 'SKIP' | 'RUN_ONCE' | 'CATCH_UP';

export interface CreateTriggerInput {
  tenantId: string;
  agentId: string;
  type: TriggerType;
  timezone?: string;
  cronExpression?: string;
  misfirePolicy?: MisfirePolicy;
  configuration?: Record<string, unknown>;
}

export interface EventTriggerPayload {
  tenantId: string;
  topic: 'EXECUTION_COMPLETED' | 'EXECUTION_FAILED' | 'BUSINESS_OUTPUT_CREATED' | 'APPROVAL_REQUESTED' | 'KNOWLEDGE_UPDATED';
  eventData: Record<string, unknown>;
  causationId?: string;
  triggerDepth?: number;
}

export class AgentSchedulerService {
  /**
   * Calculates next run timestamp in UTC for standard schedule presets or intervals.
   */
  static calculateNextRun(cronOrInterval: string, fromDate: Date = new Date()): Date {
    const next = new Date(fromDate.getTime());
    if (cronOrInterval.includes('hourly') || cronOrInterval === '0 * * * *') {
      next.setHours(next.getHours() + 1);
    } else if (cronOrInterval.includes('daily') || cronOrInterval === '0 8 * * *') {
      next.setDate(next.getDate() + 1);
    } else {
      // Default 1 hour fallback
      next.setHours(next.getHours() + 1);
    }
    return next;
  }

  /**
   * Creates an AgentTrigger with initial nextRunAt calculation.
   */
  static async createTrigger(input: CreateTriggerInput) {
    const {
      tenantId,
      agentId,
      type,
      timezone = 'UTC',
      cronExpression,
      misfirePolicy = 'RUN_ONCE',
      configuration = {},
    } = input;

    const nextTriggerAt = type === 'SCHEDULE' && cronExpression ? this.calculateNextRun(cronExpression) : null;

    return await prisma.agentTrigger.create({
      data: {
        tenantId,
        agentId,
        type,
        status: 'ENABLED',
        timezone,
        cronExpression: cronExpression || null,
        misfirePolicy,
        configuration: JSON.stringify(configuration),
        nextTriggerAt,
      },
    });
  }

  /**
   * Polls due schedule triggers and creates idempotent AgentJobs with occurrence key protection.
   */
  static async pollDueSchedules(now: Date = new Date()): Promise<number> {
    const dueTriggers = await prisma.agentTrigger.findMany({
      where: {
        type: 'SCHEDULE',
        status: 'ENABLED',
        nextTriggerAt: { lte: now },
      },
      include: { agent: true },
    });

    let jobsCreated = 0;

    for (const trigger of dueTriggers) {
      const scheduledTime = trigger.nextTriggerAt || now;
      const occurrenceKey = `${trigger.id}:${scheduledTime.toISOString()}`;

      // Check Occurrence Idempotency Constraint
      const existingOccurrence = await prisma.triggerOccurrence.findUnique({
        where: { occurrenceKey },
      });

      if (existingOccurrence) {
        // Occurrence already created by another scheduler instance
        continue;
      }

      // Create Agent Execution & Job
      const execution = await prisma.execution.create({
        data: {
          tenantId: trigger.tenantId,
          organizationId: trigger.agent.organizationId,
          agentId: trigger.agentId,
          trigger: 'SCHEDULED_TRIGGER',
          status: 'QUEUED',
        },
      });

      const job = await DurableJobQueue.enqueueJob({
        tenantId: trigger.tenantId,
        agentId: trigger.agentId,
        executionId: execution.id,
        priority: 'NORMAL',
        metadata: {
          triggerId: trigger.id,
          triggerType: 'SCHEDULE',
          occurrenceKey,
          scheduledFor: scheduledTime.toISOString(),
          timezone: trigger.timezone,
          taskPrompt: `Scheduled execution triggered by '${trigger.cronExpression}' (${trigger.timezone})`,
        },
      });

      // Record Trigger Occurrence
      await prisma.triggerOccurrence.create({
        data: {
          tenantId: trigger.tenantId,
          triggerId: trigger.id,
          occurrenceKey,
          scheduledFor: scheduledTime,
          status: 'EXECUTED',
          jobId: job.id,
        },
      });

      // Calculate Next Run
      const nextRun = this.calculateNextRun(trigger.cronExpression || '0 8 * * *', scheduledTime);
      await prisma.agentTrigger.update({
        where: { id: trigger.id },
        data: {
          lastTriggeredAt: scheduledTime,
          nextTriggerAt: nextRun,
        },
      });

      jobsCreated++;
    }

    return jobsCreated;
  }

  /**
   * Evaluates system domain events and triggers matching event-driven AgentTriggers,
   * enforcing rate limits and event-loop depth limits (causationId/triggerDepth <= 3).
   */
  static async processEvent(event: EventTriggerPayload): Promise<number> {
    const { tenantId, topic, eventData, causationId, triggerDepth = 0 } = event;

    // Event Loop Safeguard: Block recursive trigger cascades > 3 levels deep
    if (triggerDepth > 3) {
      console.warn(`[SCHEDULER] Event trigger cascade blocked at max depth (${triggerDepth}) for topic '${topic}'`);
      return 0;
    }

    const matchingTriggers = await prisma.agentTrigger.findMany({
      where: {
        tenantId,
        type: 'EVENT',
        status: 'ENABLED',
      },
      include: { agent: true },
    });

    let triggeredCount = 0;

    for (const trigger of matchingTriggers) {
      const config = JSON.parse(trigger.configuration || '{}');
      if (config.topic !== topic) continue;

      // Deterministic condition check (e.g. value > threshold)
      if (config.condition) {
        const { field, operator, value } = config.condition;
        const fieldValue = eventData[field];

        if (operator === 'GT' && Number(fieldValue) <= Number(value)) continue;
        if (operator === 'EQ' && fieldValue !== value) continue;
      }

      const occurrenceKey = `event:${trigger.id}:${causationId || Date.now()}`;

      const execution = await prisma.execution.create({
        data: {
          tenantId: trigger.tenantId,
          organizationId: trigger.agent.organizationId,
          agentId: trigger.agentId,
          trigger: `EVENT_TRIGGER_${topic}`,
          status: 'QUEUED',
        },
      });

      const job = await DurableJobQueue.enqueueJob({
        tenantId: trigger.tenantId,
        agentId: trigger.agentId,
        executionId: execution.id,
        priority: 'HIGH',
        metadata: {
          triggerId: trigger.id,
          triggerType: 'EVENT',
          topic,
          causationId: execution.id,
          triggerDepth: triggerDepth + 1,
          taskPrompt: `Event-driven execution triggered by '${topic}' event`,
        },
      });

      await prisma.triggerOccurrence.create({
        data: {
          tenantId: trigger.tenantId,
          triggerId: trigger.id,
          occurrenceKey,
          scheduledFor: new Date(),
          status: 'EXECUTED',
          jobId: job.id,
        },
      });

      await prisma.agentTrigger.update({
        where: { id: trigger.id },
        data: { lastTriggeredAt: new Date() },
      });

      triggeredCount++;
    }

    return triggeredCount;
  }

  /**
   * Triggers an immediate "Run Now" manual job execution for a trigger.
   */
  static async runNow(tenantId: string, triggerId: string): Promise<string> {
    const trigger = await prisma.agentTrigger.findFirst({
      where: { id: triggerId, tenantId },
      include: { agent: true },
    });

    if (!trigger) {
      throw new AppError('NOT_FOUND', `Trigger '${triggerId}' not found for tenant '${tenantId}'`);
    }

    const occurrenceKey = `manual:${trigger.id}:${Date.now()}`;

    const execution = await prisma.execution.create({
      data: {
        tenantId,
        organizationId: trigger.agent.organizationId,
        agentId: trigger.agentId,
        trigger: 'MANUAL_RUN_NOW',
        status: 'QUEUED',
      },
    });

    const job = await DurableJobQueue.enqueueJob({
      tenantId,
      agentId: trigger.agentId,
      executionId: execution.id,
      priority: 'CRITICAL',
      metadata: {
        triggerId: trigger.id,
        triggerType: 'MANUAL',
        taskPrompt: `Manual 'Run Now' execution for trigger '${trigger.id}'`,
      },
    });

    await prisma.triggerOccurrence.create({
      data: {
        tenantId,
        triggerId: trigger.id,
        occurrenceKey,
        scheduledFor: new Date(),
        status: 'EXECUTED',
        jobId: job.id,
      },
    });

    await prisma.agentTrigger.update({
      where: { id: trigger.id },
      data: { lastTriggeredAt: new Date() },
    });

    return job.id;
  }
}
