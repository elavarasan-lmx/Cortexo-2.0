# Cortexo — Project Rules

## Tech Stack (DO NOT ASSUME OLDER VERSIONS)
- Next.js 16 with Turbopack (NOT 14/15)
- Fastify 5 API backend
- Drizzle ORM + PostgreSQL 16
- Zustand for state management
- NextAuth v5

## NEVER DO
1. Never rename `proxy.ts` — it is the Next.js 16 middleware convention
2. Never create Context-based toast/providers — we use Zustand stores
3. Never delete/rename files without first grepping all imports
4. Never assume Next.js conventions from older versions — always check `package.json` version first
5. Never install new dependencies without asking first
6. Never use emojis in code, comments, documentation, or responses

## ALWAYS DO
1. Before any file deletion: `grep -rn "filename" apps/ packages/` to verify zero references
2. Before any rename: check framework docs for the CURRENT version
3. After any structural change: clear `.next/` cache and test dev server
4. Use inline styles with CSS variables: `rgb(var(--primary))`
5. Use `lucide-react` for icons — only import what you use

## Patterns
- Toast: `useToastStore.getState().success('Title', 'Message')`
- Modal: `const { confirm } = useModal()`
- API data: `useApiData('/endpoint')` from `lib/hooks.ts`
- Auth: `useAutoLoadToken()` from `lib/hooks.ts`

## File Conventions
- `apps/web/proxy.ts` = auth middleware (Next.js 16 convention)
- `apps/web/lib/toast-store.ts` = Zustand toast (the ONLY toast system)
- `apps/web/components/toast.tsx` = ToastContainer renderer
