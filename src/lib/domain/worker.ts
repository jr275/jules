import { DurableJobQueue } from './queue';
import { AgentRuntimeEngine } from './engine';
import { ExecutionStateMachine } from './execution';
import { LLMProvider } from './llm';
import { EmbeddingProvider } from './knowledge';

export interface WorkerOptions {
  workerId?: string;
  concurrency?: number;
  pollIntervalMs?: number;
  leaseDurationMs?: number;
  llmProvider?: LLMProvider;
  embeddingProvider?: EmbeddingProvider;
}

export class AgentWorker {
  public workerId: string;
  public concurrency: number;
  public pollIntervalMs: number;
  public leaseDurationMs: number;
  private isRunning = false;
  private activeJobsCount = 0;
  private llmProvider?: LLMProvider;
  private embeddingProvider?: EmbeddingProvider;

  constructor(options: WorkerOptions = {}) {
    this.workerId = options.workerId || `worker-${process.pid || 1}-${Math.random().toString(36).substring(2, 7)}`;
    this.concurrency = options.concurrency || 2;
    this.pollIntervalMs = options.pollIntervalMs || 1000;
    this.leaseDurationMs = options.leaseDurationMs || 30000;
    this.llmProvider = options.llmProvider;
    this.embeddingProvider = options.embeddingProvider;
  }

  /**
   * Starts worker polling loop for background jobs.
   */
  public start(): void {
    this.isRunning = true;
    this.pollLoop();
  }

  /**
   * Graceful worker shutdown.
   */
  public stop(): void {
    this.isRunning = false;
  }

  private async pollLoop(): Promise<void> {
    while (this.isRunning) {
      if (this.activeJobsCount < this.concurrency) {
        try {
          const claimedJob = await DurableJobQueue.claimNextJob(this.workerId, this.leaseDurationMs);
          if (claimedJob) {
            this.activeJobsCount++;
            // Process job asynchronously without blocking poll loop
            this.processJob(claimedJob)
              .catch(() => {})
              .finally(() => {
                this.activeJobsCount = Math.max(0, this.activeJobsCount - 1);
              });
          }
        } catch {
          // Poll error handling
        }
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
  }

  /**
   * Process a claimed job by resuming/executing AgentRuntimeEngine from checkpoints.
   */
  public async processJob(job: any): Promise<void> {
    const meta = JSON.parse(job.metadata || '{}');

    try {
      const runtimeResult = await AgentRuntimeEngine.executeTask({
        tenantId: job.tenantId,
        agentId: job.agentId,
        taskPrompt: meta.taskPrompt || 'Execute background agent task',
        autonomyLevel: meta.autonomyLevel || 'LEVEL_2_PREPARE',
        llmProvider: this.llmProvider,
        embeddingProvider: this.embeddingProvider,
      });

      if (runtimeResult.status === 'WAITING_APPROVAL') {
        await DurableJobQueue.pauseForApproval(job.id);
      } else if (runtimeResult.status === 'COMPLETED') {
        await DurableJobQueue.completeJob(job.id);
      } else if (runtimeResult.status === 'FAILED') {
        const isRetryable = ExecutionStateMachine.isRetryableError(runtimeResult.error || 'Execution failed');
        await DurableJobQueue.failOrRetryJob(job.id, runtimeResult.error || 'Execution failed', isRetryable);
      }
    } catch (err: any) {
      const isRetryable = ExecutionStateMachine.isRetryableError(err.message || 'Worker processing error');
      await DurableJobQueue.failOrRetryJob(job.id, err.message || 'Worker processing error', isRetryable);
    }
  }
}
