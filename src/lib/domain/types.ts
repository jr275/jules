export type Role =
  | 'OWNER'
  | 'ADMIN'
  | 'CFO'
  | 'FINANCE_MANAGER'
  | 'TREASURY'
  | 'CONTROLLER'
  | 'ANALYST'
  | 'PROCUREMENT'
  | 'VIEWER';

export const ALL_ROLES: Role[] = [
  'OWNER',
  'ADMIN',
  'CFO',
  'FINANCE_MANAGER',
  'TREASURY',
  'CONTROLLER',
  'ANALYST',
  'PROCUREMENT',
  'VIEWER',
];

export type Permission =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'APPROVE'
  | 'EXECUTE'
  | 'CONFIGURE'
  | 'MANAGE_CREDENTIALS'
  | 'MANAGE_POLICIES'
  | 'VIEW_AUDIT';

export type AutonomyLevel =
  | 'LEVEL_0_OBSERVE'
  | 'LEVEL_1_RECOMMEND'
  | 'LEVEL_2_PREPARE'
  | 'LEVEL_3_EXECUTE_WITHIN_POLICY'
  | 'LEVEL_4_AUTONOMOUS_OPTIMIZATION';

export const AUTONOMY_LEVEL_NUMBERS: Record<AutonomyLevel, number> = {
  LEVEL_0_OBSERVE: 0,
  LEVEL_1_RECOMMEND: 1,
  LEVEL_2_PREPARE: 2,
  LEVEL_3_EXECUTE_WITHIN_POLICY: 3,
  LEVEL_4_AUTONOMOUS_OPTIMIZATION: 4,
};

export type SkillCategory =
  | 'TREASURY'
  | 'REVENUE'
  | 'PRICING'
  | 'WORKING_CAPITAL'
  | 'PROCUREMENT'
  | 'BANKING'
  | 'RISK'
  | 'ANALYTICS';

export type ExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type ExecutionStepType =
  | 'TRIGGER'
  | 'CONTEXT'
  | 'DATA'
  | 'PLAN'
  | 'ANALYSIS'
  | 'SIMULATION'
  | 'POLICY_CHECK'
  | 'APPROVAL'
  | 'EXECUTION'
  | 'VERIFICATION'
  | 'RECONCILIATION'
  | 'LEARNING';

export type BusinessOutputType =
  | 'ECONOMIC_IMPACT'
  | 'OPPORTUNITY'
  | 'DECISION'
  | 'RISK'
  | 'FORECAST'
  | 'ACTION'
  | 'SCENARIO'
  | 'ANOMALY';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'POLICY_VIOLATION'
  | 'INTEGRATION_ERROR'
  | 'EXECUTION_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
