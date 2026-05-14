---
name: cortexo-dev
description: Coding conventions and rules for Cortexo DevOps Platform (Next.js 16 + Fastify 5 monorepo). Use when working on any Cortexo TypeScript code.
---

# Cortexo Dev Skill

## When to Activate
- User mentions: cortexo, dashboard, deploy engine, testing hub, knowledge base
- Working on files in: `cortexo/apps/`, `cortexo/packages/`
- Working on: Fastify routes, Next.js pages, Drizzle schemas

## First Step — ALWAYS
```
Read: brain/cortexo/0_session_start.md
```

## Critical Rules

### ⛔ NEVER Do
- Rename `proxy.ts` → `middleware.ts` (breaks auth — Next.js 16 convention)
- Use React Context for toasts (use Zustand: `useToastStore`)
- Forget `useAutoLoadToken()` in dashboard pages (API calls fail silently)
- Edit `apps/web/lib/api.ts` without checking all callers (50KB, every page depends on it)
- Edit `apps/api/src/lib/ssh-executor.ts` without testing (52KB core deploy engine)

### ✅ Always Do
- Clear `.next` on ChunkLoadError: `rm -rf apps/web/.next`
- Grep for imports before deleting any file
- Follow the module creation workflow: Schema → Route → Page → API Client
- Use established patterns (see brain/cortexo/4_conventions.md)

## Tech Stack
```
Turborepo 2.9.12
├── Next.js 16.2.4 + React 19 + Turbopack (frontend)
├── Fastify 5 (backend)
├── PostgreSQL 16 + Drizzle ORM (database)
├── Redis 7 + BullMQ (queue)
├── NextAuth v5 (auth)
└── Zustand 5 (state)
```

## Code Patterns

### Toast
```typescript
useToastStore.getState().success('Title', 'Message')
```

### API Call
```typescript
const { data, loading } = useApiData(() => api.getProjects())
```

### Auth Token (EVERY page)
```typescript
useAutoLoadToken()
```

### New Feature Workflow
1. Schema: `packages/db/src/schema/module.ts` → export from `index.ts`
2. Route: `apps/api/src/routes/module.ts` → register in `src/index.ts`
3. Page: `apps/web/app/(dashboard)/module/page.tsx`
4. API Client: Add methods to `apps/web/lib/api.ts`

## Key Files by Size (Watch Out)
| File | Size | Risk |
|------|------|------|
| `devops-docs.ts` | 91KB | All runbook content inline |
| `testing.ts` | 87KB | Full test engine logic |
| `ssh-executor.ts` | 52KB | Core deploy engine |
| `api.ts` (frontend) | 50KB | ALL API client methods |
| `globals.css` | 47KB | Full design system |
| `deploy-form.tsx` | 38KB | Complex deploy UI |
