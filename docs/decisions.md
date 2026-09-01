# UNCLE SCROOGE — Architectural Decision Records (ADRs)

## ADR 1: Modular Monolith Foundation over Premature Microservices
- **Context**: Uncle Scrooge requires complex domain interactions between Workers, Skills, Policies, Executions, and Financial Outputs.
- **Decision**: Build as a modular monolith in Next.js App Router with TypeScript. Clean domain directory boundaries (`src/lib/domain/*`) allow seamless extraction into microservices if needed later.

## ADR 2: Deterministic Policy Engine for Financial Safety
- **Context**: LLM non-determinism presents unacceptable risk for direct financial transactions.
- **Decision**: Separate AI analytical output from policy enforcement. Financial execution must pass deterministic rules evaluated by `PolicyEngine` and `AutonomyEngine`.

## ADR 3: Relational Persistence Strategy
- **Context**: Financial relationships require strict referential integrity, strong index constraints, and transaction capabilities.
- **Decision**: Use relational database architecture via Prisma ORM (SQLite in dev, Postgres in production) with domain entity tables instead of generic JSON blobs.

## ADR 4: Priority Economic Measurement System
- **Context**: Enterprise finance leadership evaluates AI on tangible economic value created.
- **Decision**: Treat `EconomicValue` and `Opportunity` priority scoring as primary first-class domain models in both database and executive UI hierarchy.
