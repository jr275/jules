# UNCLE SCROOGE — Security Architecture & Boundaries

## Multi-Tenancy Security
1. **Server-Side Isolation**: All database queries and server actions strictly enforce `tenantId` filtering via `withTenantWhere` and `enforceTenantIsolation`.
2. **No Frontend Reliance**: Client components never control or override tenant parameters or authorization context.

## Credential Safety Boundary
1. **Zero Secret Leak Guarantee**: Plaintext API keys, passwords, and tokens are never saved in database application tables, browser bundles, prompts, or audit logs.
2. **Credential References**: Connectors and Workers store only abstract `credentialReference` keys.
3. **NOT_CONFIGURED Handling**: When integrations lack valid credentials, adapters explicitly report `NOT_CONFIGURED` without fabricating responses.

## Role-Based Access Control (RBAC)
Server-side permission enforcement maps enterprise roles (`OWNER`, `ADMIN`, `CFO`, `FINANCE_MANAGER`, `TREASURY`, `CONTROLLER`, `ANALYST`, `PROCUREMENT`, `VIEWER`) to explicit fine-grained permissions.

## Auditability
All material system events (`worker.created`, `decision.approved`, `action.executed`, etc.) emit immutable `AuditEvent` records tagged with tenant, actor, timestamp, resource ID, and sanitized non-sensitive metadata.
