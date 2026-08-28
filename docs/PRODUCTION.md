# Uncle Scrooge Financial AI OS — Production Deployment Guide

## 1. Architecture Topology
```
                ┌────────────────┐
                │   Next.js API  │
                │    Vercel      │
                └───────┬────────┘
                        │
                        ▼
                ┌────────────────┐
                │   PostgreSQL   │
                │ Database Vault │
                └───────┬────────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
      Agent Worker            Scheduler
      persistent              persistent
             │                     │
             └──────────┬──────────┘
                        ▼
                  Agent Engine
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
            LLM        RAG       Connectors
```

## 2. Required Production Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://user:pass@host:5432/scrooge_db?sslmode=require`)
- `CREDENTIAL_ENCRYPTION_KEY`: 32-byte AES-256-GCM master vault key
- `UNCLE_SCROOGE_LLM_API_KEY`: Anthropic or OpenAI API Key
- `LLM_PROVIDER`: `anthropic` or `openai`
- `LLM_MODEL`: `claude-3-5-sonnet-20241022` or `gpt-4o`
- `GOOGLE_CLIENT_ID`: Google OAuth2 Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 Client Secret
- `GOOGLE_REDIRECT_URI`: `https://app.unclescrooge.ai/api/connectors/google/callback`

## 3. Deployment Commands
- **Database Migrations:** `npx prisma migrate deploy`
- **Application Build & Start:** `npm run build` / `npm run start`
- **Persistent Background Worker:** `npm run worker`
