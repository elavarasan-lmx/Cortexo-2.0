# Cortexo Project Rules

## 🏗 Architecture

Cortexo is a **Turborepo monorepo** with 3 packages:

| Package | Tech | Purpose |
|---------|------|---------|
| `apps/web` | Next.js 14 (App Router) | Dashboard UI |
| `apps/api` | Fastify + TypeScript | REST API |
| `packages/db` | Drizzle ORM + PostgreSQL | Shared DB schema |

### Core Principles
- **Project-centric**: Everything revolves around Projects. No standalone client/source models.
- **DB is source of truth**: Menu items, permissions, configs — all from database.
- **Single schema package**: `@cortexo/db` is the ONLY place for table definitions.

---

## 📁 File Organization

### API (`apps/api/src/`)
```
routes/        → One file per feature (e.g. deployments.ts, servers.ts)
lib/           → Shared utilities (db.ts, env.ts, engines)
middleware/    → Auth, rate limiting, usage limits
```

### Web (`apps/web/`)
```
app/(dashboard)/   → Dashboard pages (Next.js App Router)
components/        → Shared React components
components/layout/ → Sidebar, header, shell
lib/               → API client, stores (Zustand), utilities
```

### DB (`packages/db/src/schema/`)
```
One file per domain (e.g. pipelines.ts, infrastructure.ts)
index.ts           → Central re-export of ALL schemas
```

---

## 🔧 Coding Standards

### TypeScript
- Strict mode enabled
- Use `type` imports for type-only imports
- No `any` unless absolutely necessary (mark with comment why)
- Export types alongside schemas: `export type { Project, NewProject }`

### API Routes
- Every route file exports a single `async function xxxRoutes(app: FastifyInstance)`
- Register in `apps/api/src/index.ts` with `{ prefix: '/v1' }`
- Always validate request body before processing
- Return consistent shapes: `{ data }`, `{ success: true }`, or `{ error: string }`

### Frontend
- Use **Zustand** for state management (no Redux)
- Use **`api.ts`** client for ALL API calls — never raw `fetch`
- Pages go in `app/(dashboard)/feature-name/page.tsx`
- Shared components in `components/` — no inline component files in pages

### Database
- Schema files in `packages/db/src/schema/`
- Always export from `schema/index.ts`
- Use Drizzle's `pgTable` — no raw SQL in schema definitions
- Column naming: `snake_case` in DB, `camelCase` in TypeScript
- Always add `createdAt` and `updatedAt` timestamps
- Run `npm run db:push` to sync schema changes

---

## 🚫 DO NOT

1. **DO NOT** create standalone pages without a corresponding API route
2. **DO NOT** hardcode menu items — use DB (`menu_items` table)
3. **DO NOT** add files to `apps/api/dist/` — it's gitignored build output
4. **DO NOT** import directly from `packages/db/src/schema/file.ts` — use `@cortexo/db/schema`
5. **DO NOT** create `worker/` or `workers/` directories — use API route handlers
6. **DO NOT** add unused dependencies — audit before adding
7. **DO NOT** commit `.env` files or secrets
8. **DO NOT** create duplicate components (check `components/` first)

---

## ✅ ALWAYS DO

1. **Register** new routes in `apps/api/src/index.ts`
2. **Export** new schemas from `packages/db/src/schema/index.ts`
3. **Add** API client methods in `apps/web/lib/api.ts` for new endpoints
4. **Add** new sidebar items via `POST /v1/menu-items` (DB-driven)
5. **Commit** with conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
6. **Test** API routes exist before creating frontend pages
7. **Use** `nav-config.ts` ONLY as fallback — DB is primary source

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `apps/api/src/index.ts` | API route registration (single entry point) |
| `apps/api/src/lib/db.ts` | Database connection singleton |
| `apps/api/src/lib/env.ts` | Environment variable validation |
| `apps/web/lib/api.ts` | Frontend API client (all endpoints) |
| `apps/web/lib/nav-config.ts` | Sidebar fallback config |
| `apps/web/lib/sidebar-features.ts` | DB-driven sidebar state (Zustand) |
| `packages/db/src/schema/index.ts` | Schema central export |

---

## 🚀 Commands

```bash
npm run dev          # Start all (turbo)
npm run dev:web      # Frontend only
npm run dev:api      # API only
npm run build        # Production build
npm run db:push      # Sync schema to DB
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
```

---

## 🌐 Infrastructure

- **Production**: AWS EC2 via SSHFS mount through `13.201.238.28` jump host
- **Database**: PostgreSQL 18.3
- **Auth**: JWT tokens with refresh
- **Deployment**: Git push → manual deploy via Cortexo's own deploy engine

---

## 👤 Team Context

- **Solo developer** workflow — no PR reviews needed
- Focus on **practical utility** over theoretical features
- If a feature has no real-world use case, **don't build it**
- Keep the codebase **lean** — remove dead code aggressively
