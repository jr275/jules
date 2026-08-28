# UNCLE SCROOGE FINANCIAL AI OS — ENVIRONMENT VARIABLES REFERENCE

This document details every environment variable used across the Uncle Scrooge codebase, including its requirement status, consumption point, secret classification, and expected format.

---

## 1. ENVIRONMENT VARIABLES AUDIT MATRIX

| Variable Name | Required? | Consumed By | Format / Example | Secret? | Production Required? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | YES | Prisma ORM (`prisma/schema.prisma`, `src/lib/prisma.ts`) | `file:./dev.db` (Dev) or `postgresql://user:pass@host:5432/scrooge_db?sslmode=require` (Prod) | YES | YES |
| `CREDENTIAL_ENCRYPTION_KEY` | YES | `src/lib/domain/credentials.ts` | 64 hex characters (32 bytes AES-256 key) | YES | YES |
| `LLM_PROVIDER` | YES | `src/lib/domain/llm.ts` | `anthropic` or `openai` | NO | YES |
| `LLM_MODEL` | OPTIONAL | `src/lib/domain/llm.ts` | `claude-3-5-sonnet-20241022` or `gpt-4o` | NO | YES |
| `UNCLE_SCROOGE_LLM_API_KEY` | YES (or provider key) | `src/lib/domain/llm.ts` | `sk-ant-api03-...` or `sk-proj-...` | YES | YES |
| `ANTHROPIC_API_KEY` | OPTIONAL | `src/lib/domain/llm.ts` | `sk-ant-api03-...` | YES | NO (if UNCLE_SCROOGE_LLM_API_KEY set) |
| `OPENAI_API_KEY` | YES (Embeddings) | `src/lib/domain/llm.ts`, `src/lib/domain/knowledge.ts` | `sk-proj-...` | YES | YES (if Embeddings/RAG enabled) |
| `GOOGLE_CLIENT_ID` | YES (Google Connector) | `src/app/api/connectors/google/*`, `src/lib/domain/connectors.ts` | `123456789-abc.apps.googleusercontent.com` | NO | YES (for Google Sheets pilot) |
| `GOOGLE_CLIENT_SECRET` | YES (Google Connector) | `src/app/api/connectors/google/*`, `src/lib/domain/connectors.ts` | `GOCSPX-abc123xyz...` | YES | YES (for Google Sheets pilot) |
| `GOOGLE_REDIRECT_URI` | OPTIONAL | `src/app/api/connectors/google/*` | `http://localhost:3000/api/connectors/google/callback` | NO | YES |
| `NEXT_PUBLIC_APP_URL` | YES | Client/Server redirect builder (`src/lib/domain/connectors.ts`) | `https://app.unclescrooge.ai` or `http://localhost:3000` | NO | YES |
| `WORKER_CONCURRENCY` | OPTIONAL | `src/lib/domain/worker.ts` | Integer (`1`, `2`, `4`) | NO | NO (Default: 2) |
| `WORKER_LEASE_DURATION_MS` | OPTIONAL | `src/lib/domain/worker.ts`, `src/lib/domain/queue.ts` | Milliseconds (`30000`) | NO | NO (Default: 30000) |
| `WORKER_POLL_INTERVAL_MS` | OPTIONAL | `src/lib/domain/worker.ts` | Milliseconds (`2000`) | NO | NO (Default: 2000) |

---

## 2. GOOGLE OAUTH PRODUCTION REDIRECT URI

When configuring Google Cloud Console OAuth 2.0 Credentials:
* **Authorized Redirect URI:** `${NEXT_PUBLIC_APP_URL}/api/connectors/google/callback`
* **Example Production Value:** `https://app.unclescrooge.ai/api/connectors/google/callback`

---

## 3. MASTER CREDENTIAL ENCRYPTION KEY GENERATION

Generate a cryptographically secure 32-byte key formatted as a 64-character hexadecimal string using Node.js:
```bash
node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
```
