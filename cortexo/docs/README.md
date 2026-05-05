# Cortexo DevOps Platform — Documentation

> **Status:** Production-ready MVP | 90+ API endpoints | 18 DB schemas | 37 dashboard pages
> **Monorepo:** `cortexo/` (Turborepo + npm workspaces)
> **Last Updated:** 2026-05-05

---

## 📁 Documentation Structure

```
docs/
├── README.md                 ← You are here
├── planning/                 ← Product & design specs
│   ├── 01_PRD.md             ← THE source of truth (111 features, 21 categories)
│   ├── 03_ui_ux_design.md    ← Design tokens, 22 page wireframes, 3 user flows
│   ├── 04_sdk_api_reference.md ← 5 SDKs, 90+ API endpoints, webhook payloads
│   └── 05_roadmap_gtm.md    ← 7-phase roadmap, GTM strategy, budget
├── architecture/             ← System architecture (7 deep-dive docs)
│   ├── 01_architecture_overview.md  ← Executive summary, control/data plane
│   ├── 02_module_design.md          ← 12 modules with failure modes
│   ├── 03_workflows.md              ← CI/CD, promotion, incident workflows
│   ├── 04_data_model.md             ← PostgreSQL schema (50+ tables)
│   ├── 05_tradeoffs_risks_security.md ← Trade-offs, risk register
│   ├── 06_roadmap.md                ← Phased implementation roadmap
│   └── 07_ui_ux.md                  ← Command center, dashboards
├── features/                 ← Feature-level deep dives
│   └── server_mount_deep_analysis.md ← SSHFS implementation (462 lines)
└── screenshots/              ← 45 dashboard screenshots
    ├── 01_Dashboard.png
    ├── 02_Deployments.png
    └── ... (45 PNGs)
```

---

## 🚀 Quick Start for New Sessions

**Say this to the AI in any new session:**

```
Read the Cortexo knowledge item and docs/planning/01_PRD.md — I want to continue working on Cortexo.
```

---

## 🏗️ Tech Stack (Current — as of May 2026)

### Existing (70+ Client Panels)
```
PHP 7.4→8.2 (CodeIgniter 3→4) + MySQL 8.0 + jQuery/Bootstrap
Flutter + Ionic (mobile)
SSH/SFTP deployment (single-server per client)
```

### Cortexo Platform
```
Next.js 16 + React 19 + TypeScript (strict)
Fastify 5 + Zod + JWT + Helmet
PostgreSQL 16 (primary DB) + Drizzle ORM
Redis 7 + BullMQ (job queues)
Vitest (testing) + GitHub Actions (CI/CD)
Docker Compose (local dev)
```

> ⚠️ **Note:** Some planning docs still reference MySQL 8.0 and Next.js 14.
> These were written during initial planning. The actual implementation uses **PostgreSQL 16** and **Next.js 16**.

---

## 📊 Current State

| Component | Details |
|:---|:---|
| **Dashboard** | Next.js 16 — 37 pages (App Router) |
| **API** | Fastify 5 — 90+ REST endpoints across 32 route files |
| **Database** | PostgreSQL 16 — 18 Drizzle ORM schema groups |
| **Auth** | JWT + GitHub OAuth, scrypt hashing, rate limiting (5 req/min on auth) |
| **Workers** | BullMQ pipeline worker with health endpoint (:4001) |
| **SDKs** | JS (browser), Node.js (server), PHP (server) |
| **Real-time** | WebSocket + SSE for live logs and metrics |
| **CI/CD** | GitHub Actions (lint → build → test) |
| **Tests** | Vitest integration tests (health, auth, projects) |
| **Security** | Helmet, CORS, env validation, structured error codes |
| **Docs** | Swagger UI at `/docs`, 45 UI screenshots |

---

## 🔑 Key Patterns

| Pattern | Details |
|:---|:---|
| **Error handling** | Use `apiError()` from `lib/error-codes.ts` — never raw strings |
| **Auth rate limiting** | Use `authRateLimit` config for any new auth routes (5 req/min) |
| **Type safety** | Zero `any` in auth routes — use `unknown` + type guards |
| **Env validation** | `lib/env.ts` validates required vars at startup |
| **Components** | Deploy form uses modular `components/deploy/` directory |

---

## 📈 Phases

- [x] Phase 1: Foundation (monorepo, auth, design system)
- [x] Phase 2: CI/CD Engine (pipelines, deployments, canary)
- [x] Phase 3: Bug Detection (error tracking, fingerprinting)
- [x] Phase 4: AI Root Cause Analysis
- [x] Phase 5: Agent Intelligence
- [x] Phase 6-9: Operations, Sync, Infrastructure
- [x] Phase 10-13: Permissions, Audit, Profiles, Sources
- [x] Phase 14-16: Automation, Alerts, Testing
- [ ] Phase 17: Production hardening + performance optimization

---

## 🔗 Historical Planning

```
Original PRD session: fb6f6300-4c3e-493b-bf76-ea1ab34d4092 (Windows era)
```

> PRD and architecture were finalized in that session. Project has since moved to Fedora Linux.
> Migrated from MySQL 8.0 → PostgreSQL 16, Next.js 14 → Next.js 16.
