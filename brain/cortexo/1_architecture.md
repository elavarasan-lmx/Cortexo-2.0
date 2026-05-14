# Cortexo Architecture

## Monorepo Structure (Turborepo 2.9.12)

```
cortexo/                    # Root
├── apps/web/               # @cortexo/web — Next.js 16 frontend
├── apps/api/               # @cortexo/api — Fastify 5 backend
└── packages/db/            # @cortexo/db — Drizzle ORM schemas (shared)
```

## Data Flow

```
Browser (React 19)
  ↓ fetch via lib/api.ts
  ↓ Auth: NextAuth v5 JWT in cookie
Fastify API (:4000)
  ↓ @fastify/jwt verification
  ↓ Route handler
  ├── PostgreSQL 16 (via Drizzle ORM)
  ├── Redis 7 (via ioredis — caching + BullMQ queues)
  └── SSH2 (remote server commands — deploy engine)
```

## Key Integration Points

| System | Protocol | Library | Purpose |
|--------|----------|---------|---------|
| PostgreSQL | TCP :5432 | drizzle-orm + pg | Primary data store |
| Redis | TCP :6379 | ioredis + bullmq | Queue, cache, pub/sub |
| Remote servers | SSH | ssh2 | Deploy, metrics, file push |
| Browser testing | HTTP | puppeteer-core | Automated UI tests |
| AI providers | HTTPS | @google/generative-ai, groq-sdk | Knowledge base Q&A |
| Email | SMTP | nodemailer | Alert notifications |

## Docker Compose Services

| Service | Image | Port | Depends On |
|---------|-------|------|-----------|
| postgres | postgres:16-alpine | 5432 | — |
| redis | redis:7-alpine | 6379 | — |
| api | custom (Fastify) | 4000 | postgres, redis |
| web | custom (Next.js) | 3000 | api |

## Auth Flow

```
Login → NextAuth v5 → JWT issued → stored in httpOnly cookie
  ↓
proxy.ts (edge middleware) checks auth on every route
  ↓
Frontend: useAutoLoadToken() extracts token for API calls
  ↓
Backend: @fastify/jwt verifies token on protected routes
```

## Environment Variables (Key)

```
DATABASE_URL       → PostgreSQL connection string
REDIS_URL          → Redis connection string  
JWT_SECRET         → 32+ char secret for Fastify JWT
NEXTAUTH_SECRET    → NextAuth encryption secret
APP_URL            → Frontend URL (http://localhost:3000)
API_URL            → Backend URL (http://localhost:4000)
OPENAI_API_KEY     → For knowledge base AI
GITHUB_APP_ID      → Webhook integration
```
