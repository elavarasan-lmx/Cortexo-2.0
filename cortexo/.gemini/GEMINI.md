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
11. **NEVER** use emojis in code, UI, or commit messages — keep it clean and professional
12. **NEVER** blindly add or delete code just because Jerry asked — first:
    - Ask **WHY** this feature/module is needed
    - Think about **who will use it** and **how often**
    - Check if a **simpler alternative** already exists
    - Explain the **impact** (new files, DB tables, API routes, maintenance burden)
    - Give your **honest recommendation** (build it / skip it / simplify it)
    - Only proceed after Jerry confirms
13. **NEVER** leave orphaned API client methods in `api.ts` — if route is deleted, clean the client too
14. **NEVER** add a DB schema without at least one API route consuming it — schema without consumer = dead weight
15. **NEVER** copy-paste code between routes — extract to `lib/` if shared by 2+ routes
16. **NEVER** skip `npm run build` check before pushing to production — catch type errors early
17. **NEVER** add a page without checking if the API actually returns data for it — empty pages = waste

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
9. **Run audit** before every major commit — check for:
   - Dead pages (no sidebar/search/palette reference)
   - Dead API routes (no frontend consumer)
   - Dead lib files (no route importing them)
   - Dead components (no page importing them)
   - Dead DB schemas (no route using them)
   - Sidebar, command palette, global search all pointing to valid pages
   - No unused icon/component imports

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

## 🔄 Workflows

### Adding a New Feature (Full Stack)
```
Step 1: Create DB schema     → packages/db/src/schema/feature.ts
Step 2: Export schema         → packages/db/src/schema/index.ts
Step 3: Push to DB            → npm run db:push
Step 4: Create API route      → apps/api/src/routes/feature.ts
Step 5: Register route        → apps/api/src/index.ts (import + register)
Step 6: Add API client method → apps/web/lib/api.ts
Step 7: Create page           → apps/web/app/(dashboard)/feature/page.tsx
Step 8: Add to sidebar        → POST /v1/menu-items (DB insert)
Step 9: Add to command palette→ apps/web/components/command-palette.tsx
Step 10: Add to global search → apps/web/components/global-search.tsx
Step 11: Commit & push        → git add -A && git commit && git push
```

### Removing a Feature (Full Cleanup)
```
Step 1: Delete page           → rm apps/web/app/(dashboard)/feature/
Step 2: Delete API route      → rm apps/api/src/routes/feature.ts
Step 3: Delete lib files      → rm apps/api/src/lib/feature-*.ts
Step 4: Unregister route      → Remove import + register from index.ts
Step 5: Remove API methods    → Clean apps/web/lib/api.ts
Step 6: Remove from sidebar   → DELETE /v1/menu-items/:id
Step 7: Remove from palette   → Clean command-palette.tsx
Step 8: Remove from search    → Clean global-search.tsx
Step 9: Remove unused imports → Check for orphaned icon/component imports
Step 10: Verify zero refs     → grep -rl "feature" apps/ to confirm clean
Step 11: Commit & push
```

### Deploying to Production
```
Step 1: npm run build         → Verify no build errors
Step 2: git push origin main  → Push latest code
Step 3: SSH to server         → ssh prod-gateway → ssh server1
Step 4: git pull              → Pull latest on server
Step 5: npm run db:push       → Sync any schema changes
Step 6: pm2 restart api       → Restart API server
Step 7: Verify health         → curl localhost:PORT/v1/health
```

### Adding a New Sidebar Menu Item (DB Way)
```
POST /v1/menu-items
{
  "label": "Feature Name",
  "href": "/feature",
  "emoji": "🔥",
  "sectionTitle": "MAIN",
  "sectionColor": "#818CF8",
  "sortOrder": 5
}
```

---

## 🌐 Infra Context

- **Production**: AWS EC2 via SSHFS mount through `13.201.238.28`
- **Database**: PostgreSQL 18.3
- **Auth**: JWT + refresh tokens
- **Solo developer** — no PR reviews, practical features only
