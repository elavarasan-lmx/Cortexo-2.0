# 🚀 Cortexo — Session Starter (Read This First)

> If user says **"Load Cortexo brain"** → read this file first.
> This is the single entry point for every Cortexo development session.

---

## What Is Cortexo?

**Cortexo** is a self-hosted DevOps intelligence platform built for small teams.
It replaces manual SSH deployments, blind code pushes, scattered credentials, and zero testing with a unified dashboard.

- **Built by**: Elavarasan (solo DevOps engineer @ Logimax India)
- **Workspace path**: `/run/media/lmx/LMX/Winbull/Personal/Devops/cortexo/`
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **Swagger**: `http://localhost:4000/docs`

---

## Tech Stack

```
Turborepo 2.9.12 (monorepo orchestrator)
├── Next.js 16.2.4 + Turbopack (frontend)
├── Fastify 5 (backend API)
├── PostgreSQL 16 + Drizzle ORM (database)
├── Redis 7 + BullMQ (queue + cache)
├── NextAuth v5 (authentication)
├── Zustand 5 (state management)
└── Vitest 4 (testing)
```

---

## Brain Artifact Index

| Question Type | Read This |
|---------------|-----------|
| Architecture, monorepo structure, docker | `1_architecture.md` |
| API routes, endpoints, Fastify plugins | `2_api_routes.md` |
| DB schemas, Drizzle tables, migrations | `3_db_schema.md` |
| Coding conventions, patterns, gotchas | `4_conventions.md` |

---

## ⛔ Critical Rules — NEVER Break These

| Rule | Why |
|------|-----|
| **Use `proxy.ts` NOT `middleware.ts`** | Next.js 16 convention — renaming breaks auth |
| **Zustand toasts, NOT Context** | `useToastStore.getState().success()` — never `useContext(Toast)` |
| **`useAutoLoadToken()` in every page** | Missing = API calls fail silently |
| **Clear `.next` on ChunkLoadError** | `rm -rf apps/web/.next` then restart |
| **Never edit `apps/web/lib/api.ts` without checking all callers** | 50KB file, every page depends on it |

---

## Project Structure (Key Files)

```
cortexo/
├── apps/
│   ├── web/                         # Next.js 16 frontend
│   │   ├── proxy.ts                 # ⚠️ Auth middleware — DO NOT rename
│   │   ├── lib/
│   │   │   ├── api.ts               # API client (50KB — ALL endpoints)
│   │   │   ├── hooks.ts             # useApiData, useAutoLoadToken, etc.
│   │   │   ├── auth.ts              # NextAuth v5 config
│   │   │   ├── toast-store.ts       # Zustand toast store
│   │   │   ├── nav-config.ts        # Sidebar navigation config
│   │   │   └── sidebar-features.ts  # Feature toggles
│   │   ├── components/
│   │   │   ├── layout/sidebar.tsx   # Main sidebar component
│   │   │   ├── layout/topbar.tsx    # Top navigation bar
│   │   │   ├── deploy-form.tsx      # 38KB deploy form
│   │   │   ├── modal-provider.tsx   # Global confirm dialog
│   │   │   └── ui/                  # Primitives: Button, Card, Badge, Toggle
│   │   └── app/(dashboard)/         # All 11 dashboard route groups
│   │       ├── dashboard/
│   │       ├── projects/
│   │       ├── deployments/
│   │       ├── servers/
│   │       ├── pipelines/
│   │       ├── bug-tracker/
│   │       ├── testing/
│   │       ├── knowledge-base/
│   │       ├── devops-docs/
│   │       ├── audit-log/
│   │       └── settings/
│   └── api/                         # Fastify 5 backend
│       ├── src/
│       │   ├── index.ts             # Server entry — plugin registration
│       │   ├── routes/              # 32 route files
│       │   ├── middleware/auth.ts    # JWT verification
│       │   ├── middleware/usage-limits.ts
│       │   └── lib/
│       │       ├── ssh-executor.ts  # 52KB — SSH deploy engine (core!)
│       │       ├── browser-test-engine.ts  # Puppeteer test runner
│       │       ├── db.ts            # Drizzle DB connection
│       │       ├── redis.ts         # Redis + BullMQ setup
│       │       ├── crypto.ts        # AES-256 encryption (vault)
│       │       └── email.ts         # Email notifications
│       └── .vault/                  # Encrypted credentials storage
└── packages/
    └── db/                          # @cortexo/db — Drizzle ORM
        └── src/schema/              # 18 schema files
```

---

## 11 Dashboard Modules

| Module | Frontend Route | Backend Route | Key File |
|--------|---------------|---------------|----------|
| Dashboard | `dashboard/` | aggregated | `page.tsx` + `components/` (modularized May 15) |
| Projects | `projects/` | `projects.ts` (14KB) | CRUD |
| Deployments | `deployments/` | `deployments.ts` (28KB) | SSH deploy |
| Servers | `servers/` | `servers.ts` (13KB) | Infrastructure |
| Pipelines | `pipelines/` | `pipelines.ts` (8KB) | CI/CD builder |
| Bug Tracker | `bug-tracker/` | `errors.ts` (24KB) | Error monitoring |
| Testing Hub | `testing/` | `testing.ts` (87KB!) | 3-level engine + smoke module |
| Knowledge Base | `knowledge-base/` | `knowledge.ts` (16KB) | AI Q&A |
| DevOps Docs | `devops-docs/` | `devops-docs.ts` (90KB!) | Runbook hub |
| Audit Log | `audit-log/` | `audit.ts` (6KB) | Activity trail |
| Settings | `settings/` | multiple routes | 6 sub-tabs |

### Dashboard Component Split (May 15-16)
The dashboard page was modularized from a single god-component into:
```
dashboard/
├── page.tsx                  ← Orchestrator (layout + data fetching)
└── components/
    ├── index.ts              ← Barrel export
    ├── stat-cards.tsx        ← KPI stat cards row
    ├── deployment-chart.tsx  ← Deployment activity chart
    └── activity-feed.tsx     ← Recent activity feed
```

---

## 18 Database Schemas

| Schema | What It Stores |
|--------|---------------|
| `users.ts` | User accounts |
| `auth.ts` | Sessions, tokens |
| `organizations.ts` | Multi-tenant orgs |
| `projects.ts` | Software projects |
| `infrastructure.ts` | Servers, mounts, metrics |
| `automation.ts` | Deploy configs, targets, pipelines |
| `testing.ts` | Test suites, cases, runs |
| `errors.ts` | Error tracking, bug reports |
| `knowledge.ts` | Knowledge base articles |
| `notifications.ts` | Alerts, channels |
| `audit.ts` | Audit trail entries |
| `profiles.ts` | User profiles, preferences |
| `custom-docs.ts` | Custom documentation |
| `pipelines.ts` | Pipeline definitions |
| `menu-items.ts` | Dynamic navigation |
| `menu-permissions.ts` | Role-based access |
| `winbull-configs.ts` | Winbull-specific configs |

---

## Common Tasks

| Task | Where to Look |
|------|--------------|
| Add a new API route | `apps/api/src/routes/` → register in `src/index.ts` |
| Add a new page | `apps/web/app/(dashboard)/module/page.tsx` |
| Add DB table | `packages/db/src/schema/` → export from `index.ts` |
| Add API client method | `apps/web/lib/api.ts` (bottom of file) |
| Deploy via Docker | `docker-compose.yml` at cortexo root |
| Run tests | `npm run test` or `npm run test:coverage` |
| Clear cache | `rm -rf apps/web/.next && npm run dev` |
| Check Swagger | `http://localhost:4000/docs` |

---

## Dev Commands

```bash
npm run dev          # Start everything (Turborepo)
npm run dev:web      # Frontend only → :3000
npm run dev:api      # Backend only → :4000
npm run db:push      # Push Drizzle schema to PostgreSQL
npm run db:studio    # Open Drizzle Studio GUI
npm run clean        # Nuke all caches + node_modules
npm run seed         # Populate demo data
```

---

## Code Patterns

```typescript
// ✅ Toast notification
useToastStore.getState().success('Deployed', 'Server is live')

// ✅ Confirm dialog
const { confirm } = useModal()
await confirm({ title: 'Delete?', message: 'This cannot be undone' })

// ✅ API call in component
const { data, loading } = useApiData(() => api.getProjects())

// ✅ Auth token (REQUIRED in every dashboard page)
useAutoLoadToken()
```

---

## Cross-References

- **Winbull Brain**: `brain/winbull/` — The primary platform Cortexo manages
- **Winbull Deploy Automation**: `apps/api/src/routes/winbull-deploy.ts` (23KB)
- **Winbull Configs Schema**: `packages/db/src/schema/winbull-configs.ts`
- **Ruby Staging Brain**: `brain/ruby/0_session_start.md`
- **MKR Silver Brain**: `brain/mkrsilver/0_session_start.md`
- **Infrastructure Map**: `brain/infrastructure.md`
- **Client Roster**: `brain/clients.md`
- **Diagnostic Playbook**: `brain/cortexo/_SYSTEM/DIAGNOSTIC_PLAYBOOK.md`

---

## Update Log

| Date | Change |
|------|--------|
| 2026-05-13 | Initial brain created |
| 2026-05-15 | Dashboard modularized: stat-cards, deployment-chart, activity-feed components extracted |
| 2026-05-15 | Dead schemas removed: reports, organizations, security, code-audit |
| 2026-05-15 | `as any` cleanup across projects, servers, testing, knowledge-base modules |
| 2026-05-16 | Auto-refresh infinite redirect loop fixed (UNSAFE_DEV_AUTH env guard) |
| 2026-05-16 | Smoke testing module UI integrated with Testing Hub |
| 2026-05-16 | Cross-references + Diagnostic Playbook added |

---

*Last updated: 2026-05-16*
