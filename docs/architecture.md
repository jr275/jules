# Uncle Scrooge Architecture Overview

## 1. Executive Summary
Uncle Scrooge is an enterprise Financial AI Operating System. Its primary objective is continuous identification, quantification, prioritization, capture, verification, and learning of **Economic Value** across enterprise domains (Treasury, Working Capital, Revenue, Pricing, Procurement, Banking, Risk).

## 2. Conceptual Hierarchy
```
TENANT (Security Boundary)
  └─ ORGANIZATION (Corporate Group)
       └─ ENTITY (Legal Entity, e.g., Northstar USA)
            └─ WORKER (Autonomous Financial Unit)
                 ├─ SKILLS (Capabilities)
                 ├─ TOOLS / CONNECTORS (System Adapters)
                 └─ EXECUTIONS (State Machine Runs)
                      └─ BUSINESS OUTPUT
                           ├─ ECONOMIC VALUE (Cost Saving, Cash Released)
                           ├─ OPPORTUNITY (Ranked Pipeline)
                           ├─ DECISION (Explainable Audit Trace)
                           └─ ACTION (Policy-Gated Disbursements)
```

## 3. Technology Stack & Layer Separation
- **Presentation Layer**: Next.js 14 App Router, Server Components, Tailwind CSS, Lucide icons, Design Tokens, Command Palette (⌘K).
- **Domain Layer**: Strongly typed TypeScript domain abstractions (`src/lib/domain/`), deterministic policy engine, tenant isolation guards, and permission matrix.
- **Persistence Layer**: Relational Database via Prisma ORM v5.22.0 (`prisma/schema.prisma`), SQLite for dev/test environment, fully indexed tenant boundaries.
- **Testing & Verification**: Vitest unit test suite (`src/__tests__/domain.test.ts`), Next.js production build compiler, TypeScript strict checking (`tsc --noEmit`).

## 4. Operational Loop
`OBSERVE` → `UNDERSTAND` → `QUANTIFY` → `SIMULATE` → `DECIDE` → `APPROVE` → `EXECUTE` → `VERIFY` → `RECONCILE` → `LEARN` → `OPTIMIZE`
