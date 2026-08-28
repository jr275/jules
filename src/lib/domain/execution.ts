import { ExecutionStatus, ExecutionStepType, AppError } from './types';

export interface OpportunityScoreInput {
  economicImpact: number;
  probability: number;
  urgencyMultiplier: number;
  feasibilityMultiplier: number;
  reversibilityMultiplier: number;
  riskPenalty: number;
}

export class OpportunityScorer {
  static calculateScore(input: OpportunityScoreInput): number {
    const rawValue =
      input.economicImpact *
      input.probability *
      input.urgencyMultiplier *
      input.feasibilityMultiplier *
      input.reversibilityMultiplier;

    const netScore = rawValue * (1 - Math.min(0.8, Math.max(0, input.riskPenalty)));
    return Math.round(netScore * 100) / 100;
  }
}

export interface EconomicValueInput {
  amount: number;
  currency: string;
  type: 'COST_SAVING' | 'REVENUE_UPLIFT' | 'CASH_RELEASED' | 'FINANCING_COST_REDUCED' | 'RISK_REDUCED' | 'MARGIN_IMPROVEMENT' | 'NPV_CREATED' | 'OTHER';
  confidence: number;
}

export class EconomicValueCalculator {
  static calculateExpectedValue(input: EconomicValueInput): number {
    if (input.confidence < 0 || input.confidence > 1) {
      throw new AppError('VALIDATION_ERROR', 'Confidence score must be between 0.0 and 1.0');
    }
    return Math.round(input.amount * input.confidence * 100) / 100;
  }
}

export type ExtendedExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'WAITING_TOOL'
  | 'WAITING_RETRY'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export class ExecutionStateMachine {
  private static VALID_TRANSITIONS: Record<ExtendedExecutionStatus, ExtendedExecutionStatus[]> = {
    QUEUED: ['RUNNING', 'CANCELLED', 'FAILED'],
    RUNNING: ['WAITING_APPROVAL', 'WAITING_TOOL', 'WAITING_RETRY', 'COMPLETED', 'FAILED', 'CANCELLED'],
    WAITING_APPROVAL: ['RUNNING', 'COMPLETED', 'CANCELLED', 'FAILED'],
    WAITING_TOOL: ['RUNNING', 'WAITING_RETRY', 'COMPLETED', 'CANCELLED', 'FAILED'],
    WAITING_RETRY: ['RUNNING', 'CANCELLED', 'FAILED'],
    COMPLETED: [],
    FAILED: ['QUEUED', 'RUNNING'],
    CANCELLED: [],
  };

  static canTransition(current: ExtendedExecutionStatus, next: ExtendedExecutionStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  static transition(current: ExtendedExecutionStatus, next: ExtendedExecutionStatus): ExtendedExecutionStatus {
    if (!this.canTransition(current, next)) {
      throw new AppError(
        'EXECUTION_ERROR',
        `Invalid execution status transition from '${current}' to '${next}'`
      );
    }
    return next;
  }

  /**
   * Classifies execution errors into Retryable vs Non-retryable
   */
  static isRetryableError(error: Error | string): boolean {
    const message = (typeof error === 'string' ? error : error.message || '').toLowerCase();
    const retryablePatterns = ['timeout', 'http 429', 'rate limit', '503', '502', '504', 'econnreset', 'transient'];
    return retryablePatterns.some((pattern) => message.includes(pattern));
  }
}
