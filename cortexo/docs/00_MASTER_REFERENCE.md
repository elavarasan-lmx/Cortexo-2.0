# Cortexo DevOps Platform — Master Reference

> **Status:** Production-ready MVP | 90+ API endpoints | 18 DB schemas | 37 dashboard pages
> **Monorepo:** `cortexo/` (Turborepo + npm workspaces)
> **Last Updated:** 2026-05-05

---

## 🚀 Quick Start for New Sessions

**Say this to the AI in any new session:**

```
Read the Cortexo knowledge item and cortexo/docs/01_PRD.md — I want to continue working on Cortexo.
```

Or for specific work:

```
Read the Cortexo KI. I need to work on [specific feature/task].
```

---

## 📁 File Map — Where Everything Lives

### 1. Source of Truth (in project)

| File | What It Contains | When to Read |
|:---|:---|:---|
| `README.md` | Quick start, architecture diagram, tech stack, API table | Always read first |
| `cortexo/docs/01_PRD.md` | **THE PRD** — 111 features, 21 categories | For feature planning |

### 2. Architecture Docs (in project)

| Doc | Path | Contents |
|:---|:---|:---|
| **Tech Architecture** | `docs/02_tech_architecture.md` | System design, agent subsystem, security *(note: SQL examples are MySQL-era, actual DB is PostgreSQL 16)* |
| **UI/UX Design** | `docs/03_ui_ux_design.md` | Design system, 22 screens, 3 user flows |
| **SDK & API** | `docs/04_sdk_api_reference.md` | SDKs (PHP/JS/Node), API reference *(note: now 90+ endpoints, doc shows ~50)* |
| **Roadmap & GTM** | `docs/05_roadmap_gtm.md` | 7 phases (24 weeks), go-to-market, risks |
| **IDP Architecture** | `docs/idp-architecture/` | 7 deep-dive docs (architecture, modules, workflows, data model, security, roadmap, UI/UX) |
| **Server Mounts** | `docs/server_mount_deep_analysis.md` | SSHFS implementation deep dive |

### 3. UI Screenshots

> 45 dashboard screenshots in `docs/ui-screens/` covering all major pages.

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

> ⚠️ **Note:** Some docs (01_PRD, 02_tech_architecture) still reference MySQL 8.0 and Next.js 14.
> These were written during initial planning. The actual implementation uses **PostgreSQL 16** and **Next.js 16**.

---

## 📊 Current State

### What's Built

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

### Key Patterns

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
