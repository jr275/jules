// Domain Types for Uncle Scrooge Enterprise Financial AI OS

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';

export type UserRole =
  | 'OWNER'
  | 'ADMIN'
  | 'CFO'
  | 'FINANCE_MANAGER'
  | 'TREASURY'
  | 'CONTROLLER'
  | 'ANALYST'
  | 'PROCUREMENT'
  | 'VIEWER';

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

export type SkillCategory =
  | 'TREASURY'
  | 'REVENUE'
  | 'PRICING'
  | 'WORKING_CAPITAL'
  | 'PROCUREMENT'
  | 'BANKING'
  | 'RISK'
  | 'ANALYTICS';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ToolType =
  | 'DATABASE_QUERY'
  | 'HTTP_API'
  | 'ERP_QUERY'
  | 'BANK_API'
  | 'PAYMENT_API'
  | 'EMAIL'
  | 'CALENDAR'
  | 'SEARCH'
  | 'FILE_PROCESSING';

export type ConnectorType =
  | 'ERP'
  | 'BANK'
  | 'ACCOUNTING'
  | 'PAYMENT_PROCESSOR'
  | 'CRM'
  | 'EMAIL';

export type ConnectorStatus = 'NOT_CONFIGURED' | 'CONNECTED' | 'ERROR' | 'DISCONNECTED';

export type CredentialType = 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH' | 'CERTIFICATE' | 'TOKEN';

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

export type EconomicValueType =
  | 'COST_SAVING'
  | 'REVENUE_UPLIFT'
  | 'CASH_RELEASED'
  | 'FINANCING_COST_REDUCED'
  | 'RISK_REDUCED'
  | 'MARGIN_IMPROVEMENT'
  | 'NPV_CREATED'
  | 'OTHER';

export type OpportunityCategory =
  | 'WORKING_CAPITAL'
  | 'TREASURY'
  | 'REVENUE'
  | 'PRICING'
  | 'PROCUREMENT'
  | 'BANKING'
  | 'RISK';

export type ActionType =
  | 'PAYMENT_EXECUTION'
  | 'FX_HEDGE'
  | 'PRICING_UPDATE'
  | 'INVOICE_DISCOUNT'
  | 'VENDOR_TERMS'
  | 'CASH_TRANSFER';

export type ActionStatus = 'PLANNED' | 'SUBMITTED' | 'EXECUTING' | 'EXECUTED' | 'FAILED';
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'RECONCILED' | 'DISCREPANCY';

export type RiskCategory =
  | 'LIQUIDITY'
  | 'CREDIT'
  | 'COUNTERPARTY'
  | 'FX'
  | 'CONCENTRATION'
  | 'OPERATIONAL'
  | 'OTHER';

export type ForecastType =
  | 'ACTUAL'
  | 'FORECAST'
  | 'ESTIMATE'
  | 'SIMULATION'
  | 'DEMO'
  | 'EXTERNAL_BENCHMARK'
  | 'USER_PROVIDED';

export type SourceType =
  | 'BANK_API'
  | 'ERP'
  | 'ACCOUNTING'
  | 'USER_INPUT'
  | 'MODEL_ESTIMATE'
  | 'EXTERNAL_BENCHMARK'
  | 'SIMULATION'
  | 'DEMO_DATA';

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyRule {
  id: string;
  field: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'IN' | 'CONTAINS';
  value: string | number | boolean | string[];
  action: 'REQUIRE_APPROVAL' | 'REJECT' | 'ALLOW';
  requiredRole?: UserRole;
}

export interface PolicyDefinition {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  rules: PolicyRule[];
}

export interface PriorityScoreInput {
  economicImpact: number;
  probability: number;
  urgency: number;
  feasibility: number;
  reversibility: number;
  risk: number;
  effort: number;
}

export interface ProvenanceInfo {
  sourceType: SourceType;
  sourceId: string;
  retrievedAt: Date;
  method: string;
  quality: number;
  coverage: number;
}
