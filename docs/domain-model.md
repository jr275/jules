# Uncle Scrooge Domain Model Specification

## Core Domain Entities

### 1. Tenant
Security boundary of a customer. Every customer-owned record MUST belong to a `tenantId`.

### 2. Organization & Entity
Represent corporate groups and legal entities (e.g. Northstar Holdings -> Northstar USA LLC, Northstar Brasil Ltda).

### 3. User & Role
Enterprise roles:
- `OWNER`
- `ADMIN`
- `CFO`
- `FINANCE_MANAGER`
- `TREASURY`
- `CONTROLLER`
- `ANALYST`
- `PROCUREMENT`
- `VIEWER`

### 4. Worker & Skill
- **Worker**: Autonomous financial operating unit (e.g. Cash Optimization Worker).
- **Skill**: Reusable first-class capability object with inputs, outputs, dependencies, risk level, and autonomy requirements.

### 5. Connector & Credential
- **Connector**: Adapter for ERP, Bank, Accounting, or Payment processor integrations.
- **Credential**: Safe vault pointer token (`reference`). Plaintext secrets are NEVER stored or passed to client-side code.

### 6. Policy & Autonomy
- **Autonomy Levels**:
  - `LEVEL_0_OBSERVE`
  - `LEVEL_1_RECOMMEND`
  - `LEVEL_2_PREPARE`
  - `LEVEL_3_EXECUTE_WITHIN_POLICY`
  - `LEVEL_4_AUTONOMOUS_OPTIMIZATION`
- **Policy Engine**: Deterministic rules evaluator. AI is NEVER permitted to authorize transactions directly.

### 7. Execution & Business Output
- **Execution**: State machine tracking `PENDING` → `RUNNING` → `WAITING_APPROVAL` → `COMPLETED`.
- **Business Output**: Normalized result separate from technical telemetry, generating `EconomicValue`, `Opportunity`, `Decision`, and `Action`.
