# UNCLE SCROOGE FINANCIAL AI OS — LIVE PILOT ENVIRONMENT SETUP

## 1. REQUIRED ENVIRONMENT VARIABLES AUDIT

| Variable | Required? | Server-Only? | Purpose | Where Consumed | Safe Example Format | Current Environment Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | YES | YES | Connection string to PostgreSQL / SQLite database | `prisma/schema.prisma`, `src/lib/prisma.ts` | `postgresql://user:pass@host:5432/scrooge_db?sslmode=require` | CONFIGURED (`file:./dev.db`) |
| `CREDENTIAL_ENCRYPTION_KEY` | YES | YES | 32-byte AES-256-GCM master vault key for secret encryption | `src/lib/domain/credentials.ts` | `a1b2c3d4e5f678901234567890abcdef12345678901234567890abcdef1234` | CONFIGURED (Fallback default key active) |
| `LLM_PROVIDER` | YES | YES | Explicit LLM provider selection (`anthropic` or `openai`) | `src/lib/domain/llm.ts` | `anthropic` | CONFIGURED (Defaults to `anthropic` or `openai`) |
| `LLM_MODEL` | OPTIONAL | YES | Explicit LLM model override | `src/lib/domain/llm.ts` | `claude-3-5-sonnet-20241022` | CONFIGURED (`claude-3-5-sonnet-20241022` / `gpt-4o`) |
| `UNCLE_SCROOGE_LLM_API_KEY` | YES | YES | Anthropic or OpenAI API key for real LLM tool calling | `src/lib/domain/llm.ts` | `sk-ant-api03-...` | NOT_CONFIGURED |
| `ANTHROPIC_API_KEY` | OPTIONAL | YES | Alternative Anthropic API key variable | `src/lib/domain/llm.ts` | `sk-ant-api03-...` | NOT_CONFIGURED |
| `OPENAI_API_KEY` | OPTIONAL | YES | Alternative OpenAI API key for LLM and Embeddings | `src/lib/domain/llm.ts`, `src/lib/domain/knowledge.ts` | `sk-proj-...` | NOT_CONFIGURED |
| `GOOGLE_CLIENT_ID` | YES (Google) | YES | Google OAuth2 Client ID for Google Sheets integration | `src/app/api/connectors/google/*`, `src/lib/domain/connectors.ts` | `123456789-abc.apps.googleusercontent.com` | NOT_CONFIGURED |
| `GOOGLE_CLIENT_SECRET` | YES (Google) | YES | Google OAuth2 Client Secret for token exchange and refresh | `src/app/api/connectors/google/*`, `src/lib/domain/connectors.ts` | `GOCSPX-abc123xyz...` | NOT_CONFIGURED |
| `GOOGLE_REDIRECT_URI` | OPTIONAL | YES | Google OAuth2 callback URL | `src/app/api/connectors/google/*` | `https://app.unclescrooge.ai/api/connectors/google/callback` | CONFIGURED (Defaults to `http://localhost:3000/api/connectors/google/callback`) |
| `GOOGLE_TEST_SPREADSHEET_ID` | YES (Smoke) | YES | Target Google Sheet ID for real integration smoke tests | `tests/connectors.google.real.test.ts` | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` | NOT_CONFIGURED |
| `WORKER_CONCURRENCY` | OPTIONAL | YES | Maximum background jobs processed concurrently per worker | `src/lib/domain/worker.ts` | `4` | CONFIGURED (Default: 2) |
| `WORKER_LEASE_DURATION_MS`| OPTIONAL | YES | Lease expiration lock threshold for crash recovery | `src/lib/domain/worker.ts`, `src/lib/domain/queue.ts` | `30000` | CONFIGURED (Default: 30000) |
