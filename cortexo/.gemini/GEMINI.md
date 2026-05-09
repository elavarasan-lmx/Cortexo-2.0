# Cortexo — AI Assistant Rules

> These rules are for the AI coding assistant. Follow them strictly when working on this project.

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

## 📁 Where to Put Things

- **New API route** → `apps/api/src/routes/feature-name.ts` → register in `index.ts`
- **New DB table** → `packages/db/src/schema/feature-name.ts` → export from `schema/index.ts`
- **New page** → `apps/web/app/(dashboard)/feature-name/page.tsx`
- **New component** → `apps/web/components/feature-name.tsx`
- **New API client method** → `apps/web/lib/api.ts`
- **New sidebar item** → Insert into DB via `POST /v1/menu-items` (NOT hardcode)

---

## 🚫 NEVER DO

1. **NEVER** create a page without its API route existing first
2. **NEVER** hardcode menu items in nav-config.ts — DB (`menu_items` table) is primary
3. **NEVER** add files to `apps/api/dist/` — it's build output
4. **NEVER** import schemas directly — use `@cortexo/db/schema`
5. **NEVER** create `worker/` or `workers/` dirs — use route handlers
6. **NEVER** commit `.env`, secrets, or `node_modules`
7. **NEVER** create duplicate components — check `components/` first
8. **NEVER** leave dead code — if unused, delete it immediately
9. **NEVER** use raw `fetch` in frontend — use `api.ts` client
10. **NEVER** create features Jerry won't actually use (he's a solo dev managing bullion apps)

---

## ✅ ALWAYS DO

1. **Register** new routes in `apps/api/src/index.ts`
2. **Export** new schemas from `packages/db/src/schema/index.ts`
3. **Add** API client methods in `apps/web/lib/api.ts` for new endpoints
4. **Use** Zustand for state management (no Redux)
5. **Commit** with conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
6. **Ask** before adding any new npm dependency
7. **Verify** a feature is actually needed before building it
8. **Clean up** any orphaned files when removing a feature (page + route + lib + schema exports + sidebar entry + command palette + global search)

---

## 🔑 Key Files (Know These!)

| File | What It Does |
|------|-------------|
| `apps/api/src/index.ts` | ALL route registrations live here |
| `apps/api/src/lib/db.ts` | DB connection singleton |
| `apps/api/src/lib/env.ts` | Env var validation |
| `apps/web/lib/api.ts` | Frontend API client (ALL endpoints) |
| `apps/web/lib/nav-config.ts` | Sidebar FALLBACK config (DB is primary) |
| `apps/web/lib/sidebar-features.ts` | DB-driven sidebar state (Zustand) |
| `apps/web/components/layout/sidebar.tsx` | Sidebar UI component |
| `apps/web/components/command-palette.tsx` | Cmd+K palette |
| `apps/web/components/global-search.tsx` | Global search entries |
| `packages/db/src/schema/index.ts` | Central schema export |

---

## 🚀 Commands

```bash
npm run dev          # Start all (turbo)
npm run dev:web      # Frontend only
npm run dev:api      # API only
npm run build        # Production build
npm run db:push      # Sync schema to DB
npm run db:generate  # Generate migrations
```

---

## 🌐 Infra Context

- **Production**: AWS EC2 via SSHFS mount through `13.201.238.28`
- **Database**: PostgreSQL 18.3
- **Auth**: JWT + refresh tokens
- **Solo developer** — no PR reviews, practical features only
