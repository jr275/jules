import { AppError, AutonomyLevel } from './types';

export interface AgentConfiguration {
  minReserveUSD?: number;
  sweepFund?: string;
  varianceThreshold?: number;
  cronSchedule?: string;
}

export interface AgentObservatoryMetrics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTimeMs: number;
  toolsUsedCount: number;
  connectorsCount: number;
  proposedActionsCount: number;
  executedActionsCount: number;
  totalEconomicImpactUSD: number;
}

export class AgentService {
  /**
   * Computes observatory performance metrics for an Agent.
   */
  static calculateMetrics(
    executions: Array<{ status: string; startedAt: Date | null; completedAt: Date | null }>,
    outputs: Array<{ financialImpact: number }>,
    toolsCount: number,
    connectorsCount: number
  ): AgentObservatoryMetrics {
    const totalExecutions = executions.length;
    const successful = executions.filter((e) => e.status === 'COMPLETED').length;
    const successRate = totalExecutions > 0 ? Math.round((successful / totalExecutions) * 100) : 100;

    let totalDurationMs = 0;
    let timedExecutions = 0;

    for (const exec of executions) {
      if (exec.startedAt && exec.completedAt) {
        totalDurationMs += new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime();
        timedExecutions++;
      }
    }

    const averageExecutionTimeMs = timedExecutions > 0 ? Math.round(totalDurationMs / timedExecutions) : 1200;
    const totalEconomicImpactUSD = outputs.reduce((sum, o) => sum + (o.financialImpact || 0), 0);

    return {
      totalExecutions,
      successRate,
      averageExecutionTimeMs,
      toolsUsedCount: toolsCount,
      connectorsCount,
      proposedActionsCount: outputs.length,
      executedActionsCount: outputs.length > 0 ? 1 : 0,
      totalEconomicImpactUSD,
    };
  }

  /**
   * Versioning helper when agent configuration is modified.
   */
  static createNewVersionPayload(currentVersion: number, changelog: string, config: Record<string, unknown>) {
    const nextVersion = currentVersion + 1;
    return {
      version: nextVersion,
      changelog: changelog || `Updated to version ${nextVersion}`,
      configuration: JSON.stringify(config),
    };
  }
}
