# UNCLE SCROOGE — Architecture Overview

## Executive Architecture Summary
Uncle Scrooge is an enterprise **Financial AI Operating System**. It is architected as a clean **Modular Monolith** designed to continuously perform the core operational loop:

```
OBSERVE → UNDERSTAND → QUANTIFY → SIMULATE → DECIDE → APPROVE → EXECUTE → VERIFY → RECONCILE → LEARN → OPTIMIZE
```

The fundamental unit of value measured across Uncle Scrooge is **ECONOMIC OUTCOME** (dollars saved, cash released, yield captured, financing costs reduced, risk mitigated) rather than technical telemetry (tokens, latency, API calls).

---

## Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **UI Architecture**: Tailwind CSS, Lucide Icons, Custom Design Token System
- **Database**: Relational SQLite via Prisma ORM (configurable to PostgreSQL in production)
- **Validation**: Zod schema validation
- **Testing**: Vitest + React Testing Library

---

## Architectural Hierarchy
Uncle Scrooge enforces a strict, un-interchangeable domain hierarchy:

```
TENANT
  └─ ORGANIZATION
       └─ ENTITY
            └─ WORKER
                 ├─ SKILLS
                 │    └─ TOOLS / CONNECTORS
                 └─ EXECUTION
                      └─ BUSINESS OUTPUT
                           └─ OPPORTUNITY / DECISION / ACTION
                                └─ ECONOMIC OUTCOME
```

1. **Tenant**: Customer security and isolation boundary.
2. **Organization**: Corporate group / holding company.
3. **Entity**: Legal or operational entity (e.g., US, Brazil, Europe subsidiaries).
4. **Worker**: Autonomous financial operating unit (e.g., Cash Optimization Worker).
5. **Skill**: Reusable, typed capability (e.g., Liquidity & Cash Forecasting).
6. **Tool**: Executable capability (e.g., ERP Payables Scanner, Bank Balance Query).
7. **Connector**: External integration definition (e.g., SAP, Stripe, JPMorgan API).
8. **Execution & ExecutionStep**: Auditable, step-by-step pipeline execution model.
9. **Business Output**: Normalized financial findings, separate from technical logs.
10. **Economic Value**: First-class dollar measurement system.

---

## Financial AI Safety Boundary
LLMs do **NOT** determine financial authorization or execute transactions directly.

The system enforces a strict deterministic pipeline:
```
AI Analysis / Recommendation
      ↓
Deterministic Policy Engine Evaluation (Rules, Thresholds, Role Checks)
      ↓
Autonomy Boundary Engine Gate Check
      ↓
Human Approval (if required by Policy or Autonomy Level < 3)
      ↓
Execution Adapter (Deterministic Execution & Verification)
```
