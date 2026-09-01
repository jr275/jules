import { AutonomyLevel, AUTONOMY_LEVEL_NUMBERS, AppError } from './types';
import { PolicyEvaluationResult } from './policy';

export interface AutonomyGateCheckInput {
  workerAutonomyLevel: AutonomyLevel;
  skillAutonomyLevel: AutonomyLevel;
  policyResult: PolicyEvaluationResult;
  isFinancialTransaction: boolean;
}

export interface AutonomyGateCheckOutput {
  canExecuteAutonomous: boolean;
  requiresHumanApproval: boolean;
  approvalRoleRequired?: string;
  reason: string;
}

export class AutonomyEngine {
  static checkGate(input: AutonomyGateCheckInput): AutonomyGateCheckOutput {
    const workerLevelNum = AUTONOMY_LEVEL_NUMBERS[input.workerAutonomyLevel];
    const skillLevelNum = AUTONOMY_LEVEL_NUMBERS[input.skillAutonomyLevel];
    const effectiveLevelNum = Math.min(workerLevelNum, skillLevelNum);

    if (input.policyResult.action === 'PROHIBIT') {
      return {
        canExecuteAutonomous: false,
        requiresHumanApproval: false,
        reason: 'Policy check explicitly prohibited this execution',
      };
    }

    if (input.policyResult.action === 'REQUIRE_APPROVAL') {
      return {
        canExecuteAutonomous: false,
        requiresHumanApproval: true,
        approvalRoleRequired: input.policyResult.requiredRole || 'CFO',
        reason: 'Deterministic policy evaluation mandated human approval',
      };
    }

    if (input.isFinancialTransaction && effectiveLevelNum < 3) {
      return {
        canExecuteAutonomous: false,
        requiresHumanApproval: true,
        approvalRoleRequired: 'FINANCE_MANAGER',
        reason: `Effective autonomy level (${effectiveLevelNum}) is insufficient for autonomous financial execution (requires level 3+)`,
      };
    }

    if (effectiveLevelNum < 3) {
      return {
        canExecuteAutonomous: false,
        requiresHumanApproval: false,
        reason: `Autonomy level (${effectiveLevelNum}) generates recommendation or prepared proposal only`,
      };
    }

    return {
      canExecuteAutonomous: true,
      requiresHumanApproval: false,
      reason: 'Execution meets policy criteria and effective autonomy level permissions',
    };
  }
}
