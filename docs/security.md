# Uncle Scrooge Security & Governance Model

## 1. Strict Multi-Tenant Isolation
Server-side assertion enforced by `assertTenantAccess(context, resourceTenantId)` on every domain request. Cross-tenant access throws an immediate `AUTHORIZATION_ERROR`.

## 2. Financial Safety Boundary
```
AI Analyzes & Recommends
         ↓
Deterministic Policy Evaluates
         ↓
Approval Requirements Checked
         ↓
Human Authorization (e.g., CFO Role)
         ↓
Execution Adapter Dispatches
         ↓
Verification & Reconciliation
```

## 3. Credential Vault Boundary
- Plaintext API keys and OAuth tokens are strictly prohibited in database records, application logs, browser bundles, and LLM prompts.
- Connectors reference credentials via opaque vault pointers (`credentialReference: "cred_vault_jpm_9921"`).

## 4. Role-Based Authorization Matrix
Permissions (`VIEW`, `CREATE`, `EDIT`, `APPROVE`, `EXECUTE`, `MANAGE_POLICIES`, `MANAGE_CREDENTIALS`) are explicitly checked at application/domain boundaries.
