# Cortexo DevOps Platform — AI Session Quick Start

> **Read this file at the start of EVERY AI session to load full project context.**
> **Works on ANY system — everything is inside this project folder.**

---

## 🚀 Step 1: Load Context

```
Read @[path-to-Cortexo]/.agent/AI_SESSION_START.md — I want to work on Cortexo.
```

For deep feature understanding, also read `docs/01_PRD.md`.

---

## 📁 Project Structure

```
Cortexo/                          Turborepo monorepo (npm workspaces)
│
├── apps/
│   ├── web/                      Next.js 16 frontend (:3000)
│   │   ├── app/(dashboard)/      Dashboard pages (pipelines, deploys, errors, projects)
│   │   ├── app/(auth)/           Login, register, forgot-password
│   │   ├── app/api/              NextAuth handler (auth only)
│   │   ├── components/           Sidebar, topbar, providers
│   │   └── lib/                  Auth config, API client, utils
│   │
│   └── api/                      Node.js + Fastify 5 backend (:4000)
│       └── src/
│           ├── routes/           20 route files (56+ endpoints)
│           ├── lib/              DB, Redis, LLM Judge, Pattern DB, etc.
│           └── middleware/       Auth (JWT)
│
├── packages/
│   ├── db/                       Drizzle ORM schemas (22 tables)
│   │   └── src/schema/           organizations, users, auth, projects, pipelines, errors, agent, operations...
│   └── config/                   Shared TypeScript config
│
├── docs/                         Product documentation
│   ├── 01_PRD.md                 Product Requirements (v4.0, 111 features)
│   ├── 02_tech_architecture.md   System architecture
│   ├── 03_ui_ux_design.md        Design system + UI spec
│   ├── 04_sdk_api_reference.md   SDK & API reference
│   └── 05_roadmap_gtm.md        Roadmap & go-to-market
│
└── .agent/                       AI agent memory (gitignored)
    ├── AI_SESSION_START.md       ← YOU ARE HERE
    ├── config/                   Orchestration + risk levels
    ├── memory/                   Learned patterns (Phase 5)
    └── audits/                   Skill comparison docs
```

---

## 🔑 Key Facts

| Item | Value |
|:---|:---|
| **PRD Status** | AUDITED v4.0 — 111 active features / 21 categories |
| **Frontend** | Next.js 16 (App Router, Turbopack) + Tailwind CSS 4 |
| **Backend** | Node.js + Fastify 5 + Zod validation |
| **Database** | MariaDB 10.11 (MySQL-compatible, local) |
| **ORM** | Drizzle ORM (22 tables defined) |
| **Auth** | NextAuth.js v5 (GitHub/Google OAuth + Credentials) |
| **Cache/Queue** | Redis 7 (via podman-compose) |
| **Monorepo** | Turborepo + npm workspaces |
| **Deployment** | SSH/SFTP (primary, single-server per client) |
| **Clients** | 70+ bullion trading panels |
| **Existing Stack** | PHP CodeIgniter 3→4, jQuery, Bootstrap |
| **OS** | Fedora Linux 43 (KDE Plasma) |

---

## 📊 Backend API (Fastify :4000) — 20 Route Files, 56+ Endpoints

| Route File | Key Endpoints |
|---|---|
| `health.ts` | GET `/v1/health`, `/v1/health/ready` |
| `auth.ts` | POST `/v1/auth/register`, `/v1/auth/login`, GET `/v1/auth/github` |
| `projects.ts` | GET/POST/PUT `/v1/projects` |
| `pipelines.ts` | GET/POST/PUT/DELETE `/v1/pipelines` |
| `pipeline-runs.ts` | GET/POST `/v1/pipeline-runs` |
| `deployments.ts` | GET/POST `/v1/deployments`, rollback |
| `deploy-targets.ts` | CRUD `/v1/deploy-targets` |
| `errors.ts` | GET/POST/PUT/PATCH `/v1/errors`, `/v1/ingest/error` |
| `root-causes.ts` | GET/POST `/v1/root-causes` |
| `canary.ts` | CRUD `/v1/canary` |
| `agent-engine.ts` | 27 routes (orchestration, context, skills, deprecation) |
| `agent-memory.ts` | CRUD `/v1/agent/memory` |
| `integrations.ts` | CRUD `/v1/integrations` (Slack/GitHub/Jira/Discord) |
| `billing.ts` | Stripe subscriptions + usage |
| `org.ts` | Team RBAC (invite, roles, permissions) |
| `notifications.ts` | GET/POST notifications |
| `webhooks.ts` | GitHub + GitLab webhooks |
| `postmortem.ts` | Incident reports |
| `log-stream.ts` | SSE live log streaming |

---

## 🗄️ Database Schema (22 tables)

| Phase | Tables |
|---|---|
| Phase 1 | organizations, users, accounts, sessions, verification_tokens, projects, notifications, audit_logs |
| Phase 2 | pipelines, pipeline_runs, deploy_targets, deployments, canary_deploys |
| Phase 3 | errors, error_events, root_causes |
| Phase 5 | agent_sessions, agent_memories, skill_registry, bug_patterns |
| Phase 6 | integrations, postmortems |

---

## ✅ Completed

- [x] Monorepo scaffolding (Turborepo, npm workspaces)
- [x] All 22 DB schemas (Drizzle ORM — 11 schema files)
- [x] Next.js 16 app with App Router (35 dashboard pages)
- [x] Design system (10 theme variants, dark/light mode)
- [x] Auth pages (login, register, forgot-password)
- [x] NextAuth.js v5 (GitHub/Google/Credentials, JWT 7-day)
- [x] Landing page (hero, features, FAQ, footer)
- [x] Dashboard page (stats, activity feed, quick actions, server status)
- [x] Pipelines page (cards, editor with 5 templates, runs history)
- [x] Deployments page (table with rollback, canary releases)
- [x] Projects page (cards with health scores, detail + new project)
- [x] Errors page (severity, event counts, AI RCA button, detail view)
- [x] Sidebar + Topbar components (28 nav links, 7 categories)
- [x] Fastify API server (20 route files, 56+ endpoints)
- [x] 7 SDKs (PHP, Browser, Node, Python, Flutter, React Native, JS)
- [x] Root cause analysis (AI-powered, LLM Judge scoring)
- [x] Agent engine (orchestration, context, memory, skills)
- [x] Deprecation engine (CI3→CI4, PHP 7→8 migration planning)
- [x] Billing (Stripe subscriptions + usage limits)
- [x] Team management (invite, RBAC, org settings)
- [x] Analytics + Reports pages
- [x] Onboarding wizard (4-step guided setup)
- [x] MySQL optimizer page
- [x] Integrations (Slack, GitHub, Jira, GitLab, Discord)
- [x] Postmortem incident reports
- [x] Canary deployments (phased rollout)
- [x] Agent marketplace, skill library, context monitor, performance dashboard
- [x] Documentation site, scan results, settings pages
- [x] Docker + docker-compose for self-hosting
- [x] Playwright E2E testing infrastructure
- [x] Production guardrails (all 8 implemented)

## ⏳ In Progress / Next

- [ ] MariaDB: `npm run db:push` (schema ready, DB needs creation)
- [ ] Connect remaining frontend pages to live API data
- [ ] BullMQ worker bootstrap (pipeline-executor + ssh-deployer wiring)
- [ ] OAuth app registration (GitHub/Google)
- [ ] E2E test suite authoring

---

## 🛡️ Production Guardrails

1. **2-Action Rule** — Persist findings after every 2 external operations
2. **3-5 Sub-agent Cap** — Max 5 sub-agents per supervisor
3. **15x Token Budget** — Multi-agent costs 15x single agent
4. **70% Compaction** — Trigger context compaction at 70%
5. **Iron Law** — 5-step verification before completion claims
6. **Risk Levels** — See `.agent/config/risk-levels.yaml`

---

## ⚡ Commands

```bash
npm run dev         # Start everything (Turborepo)
npm run dev:web     # Next.js only (:3000)
npm run dev:api     # Fastify only (:4000)
npm run db:push     # Push schemas to MariaDB
npm run db:studio   # Open Drizzle Studio (DB browser)
```

---

## 🔐 Environment

All secrets are in `.env` (gitignored). Key vars:
- `DATABASE_URL` — MariaDB connection
- `NEXTAUTH_SECRET` — Auth encryption key
- `GITHUB_PAT` — GitHub API access
- `SSH_PUBLIC_KEY` — Deploy key
- `NEXT_PUBLIC_API_URL` — Frontend → Backend URL
