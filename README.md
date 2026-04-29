# Cortexo — The Brain for Your Code

> AI-powered DevOps platform for small teams managing 70+ client deployments.  
> Deploy. Detect. Debug. All in one platform.

---

## 📁 Project Structure

```
Cortexo/
│
│  ─── Root Config ────────────────────────
├── package.json              Monorepo root (npm workspaces)
├── turbo.json                Turborepo pipeline config
├── docker-compose.yml        MySQL 8.0 + Redis 7
├── .env.example              Environment template
├── .gitignore                Git rules
│
│  ─── Documentation ─────────────────────
├── docs/
│   ├── 00_MASTER_REFERENCE.md
│   ├── 01_PRD.md                Product Requirements (v4.0)
│   ├── 02_tech_architecture.md  System architecture
│   ├── 03_ui_ux_design.md       Design system + UI spec
│   ├── 04_sdk_api_reference.md  SDK & API reference
│   └── 05_roadmap_gtm.md        Roadmap & go-to-market
│
│  ─── Applications ──────────────────────
├── apps/
│   ├── web/                  Next.js 16 Dashboard (:3000)
│   │   ├── app/              App Router (pages + API)
│   │   ├── components/       UI components
│   │   └── lib/              Utilities + API client
│   │
│   └── api/                  Fastify 5 Backend (:4000)
│       └── src/
│           ├── routes/       REST API handlers (16 routes)
│           ├── lib/          DB + Redis connections
│           └── middleware/   Auth + validation
│
│  ─── Shared Packages ───────────────────
├── packages/
│   ├── db/                   Database schemas (Drizzle ORM)
│   │   └── src/schema/       14 tables across 3 phases
│   │
│   └── config/               Shared TypeScript config
│
│  ─── AI Agent (gitignored) ─────────────
└── .agent/
    ├── AI_SESSION_START.md   Session context for AI assistants
    ├── AGENTS.md             Agent rules (Cursor)
    ├── CLAUDE.md             Agent rules (Claude)
    ├── config/               Orchestration + risk levels
    ├── memory/               Learned patterns + preferences
    ├── context/              Active session state
    └── audits/               AI skill comparisons
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start everything (frontend + backend)
npm run dev

# Or start individually
npm run dev:web     # Next.js on :3000
npm run dev:api     # Fastify on :4000

# Database
npm run db:push     # Push schemas to MySQL
npm run db:studio   # Open Drizzle Studio
```

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16 + Tailwind 4 | Dashboard UI |
| Backend | Fastify 5 + Zod | REST API |
| Database | MariaDB / MySQL 8 | Data persistence |
| ORM | Drizzle ORM | Type-safe queries |
| Auth | NextAuth.js v5 | OAuth + credentials |
| Cache | Redis 7 | Job queues + caching |
| Monorepo | Turborepo + npm workspaces | Build orchestration |

---

## 📊 API Endpoints

Base URL: `http://localhost:4000/v1`

| Route | Method | Purpose |
|---|---|---|
| `/health` | GET | Liveness probe |
| `/health/ready` | GET | Readiness (DB + Redis) |
| `/projects` | GET, POST | Project management |
| `/pipelines` | GET, POST | Pipeline configuration |
| `/pipelines/:id/run` | POST | Trigger pipeline run |
| `/deployments` | GET, POST | Deploy management |
| `/deployments/:id/rollback` | POST | Rollback deploy |
| `/deploy-targets` | GET, POST | SSH server configs |
| `/errors` | GET, PATCH | Error tracking |
| `/ingest/error` | POST | SDK error ingestion |
| `/webhooks/github` | POST | GitHub webhook handler |

---

## 📈 Status

- [x] Phase 1: Foundation (monorepo, auth, design system)
- [x] Phase 2: CI/CD Engine scaffolding (schemas, UI, API)
- [x] Phase 3: Bug Detection scaffolding (schemas, UI, API)
- [ ] Phase 4: AI Root Cause Analysis
- [ ] Phase 5: Agent Intelligence
