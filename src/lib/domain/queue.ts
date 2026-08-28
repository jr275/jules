import { AppError } from './types';
import { prisma } from '../prisma';

export type JobPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'WAITING_APPROVAL' | 'WAITING_RETRY' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface EnqueueJobInput {
  tenantId: string;
  agentId: string;
  executionId: string;
  priority?: JobPriority;
  maxAttempts?: number;
  metadata?: Record<string, unknown>;
}

export class DurableJobQueue {
  private static PRIORITY_ORDER: Record<JobPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    NORMAL: 2,
    LOW: 1,
  };

  /**
   * Enqueues a durable background job linked to an Execution ID.
   */
  static async enqueueJob(input: EnqueueJobInput) {
    const {
      tenantId,
      agentId,
      executionId,
      priority = 'NORMAL',
      maxAttempts = 3,
      metadata = {},
    } = input;

    return await prisma.agentJob.create({
      data: {
        tenantId,
        agentId,
        executionId,
        status: 'QUEUED',
        priority,
        maxAttempts,
        metadata: JSON.stringify(metadata),
      },
    });
  }

  /**
   * Atomic Job Claiming with Lease Expiration Recovery.
   * Prevents two workers from claiming the same job simultaneously.
   */
  static async claimNextJob(workerId: string, leaseDurationMs: number = 30000) {
    const now = new Date();
    const leaseExpirationThreshold = new Date(now.getTime() - leaseDurationMs);

    // 1. Find claimable candidate (QUEUED or Expired RUNNING lease)
    const candidateJobs = await prisma.agentJob.findMany({
      where: {
        OR: [
          { status: 'QUEUED', availableAt: { lte: now } },
          { status: 'WAITING_RETRY', availableAt: { lte: now } },
          { status: 'RUNNING', lockedAt: { lte: leaseExpirationThreshold } }, // Lease expired crash recovery
        ],
      },
      orderBy: [
        { availableAt: 'asc' },
        { createdAt: 'asc' },
      ],
      take: 10,
    });

    if (candidateJobs.length === 0) return null;

    // Sort in-memory by priority (CRITICAL -> HIGH -> NORMAL -> LOW)
    candidateJobs.sort((a, b) => {
      const pA = this.PRIORITY_ORDER[a.priority as JobPriority] || 2;
      const pB = this.PRIORITY_ORDER[b.priority as JobPriority] || 2;
      return pB - pA;
    });

    const targetJob = candidateJobs[0];

    // 2. Atomic Lease Update (verifying status/lockedAt hasn't changed)
    const updated = await prisma.agentJob.updateMany({
      where: {
        id: targetJob.id,
        status: targetJob.status,
        lockedAt: targetJob.lockedAt, // Concurrency lock condition
      },
      data: {
        status: 'RUNNING',
        lockedAt: now,
        lockedBy: workerId,
        attempts: targetJob.attempts + 1,
      },
    });

    if (updated.count === 0) {
      // Race condition lost to another worker; return null to poll again
      return null;
    }

    return await prisma.agentJob.findUnique({ where: { id: targetJob.id } });
  }

  static async completeJob(jobId: string) {
    return await prisma.agentJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        lockedAt: null,
        lockedBy: null,
      },
    });
  }

  static async failOrRetryJob(
    jobId: string,
    errorMsg: string,
    isRetryable: boolean,
    backoffMs: number = 5000
  ) {
    const job = await prisma.agentJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    if (isRetryable && job.attempts < job.maxAttempts) {
      const nextAvailable = new Date(Date.now() + backoffMs * Math.pow(2, job.attempts - 1));
      return await prisma.agentJob.update({
        where: { id: jobId },
        data: {
          status: 'WAITING_RETRY',
          availableAt: nextAvailable,
          lockedAt: null,
          lockedBy: null,
          lastError: errorMsg,
        },
      });
    }

    return await prisma.agentJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        lockedAt: null,
        lockedBy: null,
        lastError: errorMsg,
      },
    });
  }

  static async pauseForApproval(jobId: string) {
    return await prisma.agentJob.update({
      where: { id: jobId },
      data: {
        status: 'WAITING_APPROVAL',
        lockedAt: null,
        lockedBy: null,
      },
    });
  }

  static async cancelJob(tenantId: string, jobId: string) {
    return await prisma.agentJob.updateMany({
      where: { id: jobId, tenantId },
      data: {
        status: 'CANCELLED',
        lockedAt: null,
        lockedBy: null,
      },
    });
  }
}
