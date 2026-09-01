# UNCLE SCROOGE — Domain Model Specification

## Core Domain Entities

### 1. Tenant
Represents the isolation boundary of a customer enterprise.
- `id`: String (UUID)
- `name`: String
- `status`: ACTIVE | INACTIVE

### 2. Organization
Represents corporate holdings or company groups under a tenant.
- `tenantId`: Foreign key to Tenant
- `name`: String

### 3. Entity
Legal or business operating entity.
- `tenantId`, `organizationId`: Tenant/Org scoping
- `name`, `country`, `currency`: Geographic & financial context

### 4. User & Role
Enterprise access and RBAC authorization framework.
- Roles: `OWNER`, `ADMIN`, `CFO`, `FINANCE_MANAGER`, `TREASURY`, `CONTROLLER`, `ANALYST`, `PROCUREMENT`, `VIEWER`

### 5. Worker
Autonomous financial operating unit.
- `autonomyLevel`: `LEVEL_0_OBSERVE` to `LEVEL_4_AUTONOMOUS_OPTIMIZATION`
- `configuration`: JSON settings

### 6. Skill
First-class reusable domain capability.
- Categories: `TREASURY`, `REVENUE`, `PRICING`, `WORKING_CAPITAL`, `PROCUREMENT`, `BANKING`, `RISK`, `ANALYTICS`

### 7. Policy
Deterministic rule set for financial authorization and safety.
- Defines conditions on transaction amount, risk level, counterparty type, and required role approvals.

### 8. Business Output & Economic Value
- `type`: `ECONOMIC_IMPACT`, `OPPORTUNITY`, `DECISION`, `RISK`, `FORECAST`, `ACTION`
- `EconomicValue`: Amount, currency, period, value type (`COST_SAVING`, `REVENUE_UPLIFT`, `CASH_RELEASED`, etc.), and confidence rating.

### 9. Opportunity
- Scored using Priority Score = `(Economic Impact * Probability * Urgency * Feasibility * Reversibility) * (1 - Risk Penalty)`
