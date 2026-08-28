# Architectural Decision Records (ADRs)

## ADR 001: Selection of Modular Monolith
**Decision**: Start as a clean modular monolith using Next.js App Router, Prisma ORM, and domain layer separation.
**Rationale**: Avoids premature microservices complexity while maintaining clean domain boundaries (`src/lib/domain/`) that allow future service extraction without architectural rewrites.

## ADR 002: Economic Value as First-Class Primary Metric
**Decision**: Technical telemetry (tokens, latency, prompts) is secondary to Business Economic Value Created ($ Cost Savings, $ Cash Released, NPV Created).
**Rationale**: Enterprise CFOs and finance leaders measure OS success by balance sheet and P&L impact.

## ADR 003: Deterministic Policy Engine vs LLM Autonomy
**Decision**: LLMs generate recommendations and candidate execution plans, but policy evaluation and disbursement execution MUST pass through a deterministic rules engine and explicit role-based approvals.
**Rationale**: Financial regulatory compliance and fiduciary duty require deterministic, auditable authorization boundaries.
