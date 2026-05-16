# Diagnostic Playbook — Cortexo

> Symptom → Suspect mapping rules. When you see a symptom, check suspects in order.
> Built from real debugging sessions and post-fix learnings.

---

## RULE-CX-001: "ChunkLoadError / Module not found after build"
**SUSPECT FIRST**: Stale `.next` build cache
**CHECK**: `ls -la apps/web/.next/` — check timestamp, clear if old
**FIX**: `rm -rf apps/web/.next && npm run dev`
**NEVER DO**: Change import paths blindly — the error is almost always cached artifacts

## RULE-CX-002: "Infinite redirect loop on dashboard"
**SUSPECT FIRST**: `UNSAFE_DEV_AUTH` guard in auth middleware checking production env
**CHECK**: Does `proxy.ts` detect the environment correctly?
**ALSO CHECK**: Token expired but redirect sends back to login which redirects to dashboard
**FIX**: Verify `UNSAFE_DEV_AUTH=true` is set in `.env.local` for local dev
**NEVER DO**: Disable auth entirely — fix the environment detection

## RULE-CX-003: "Port 3000 already in use"
**SUSPECT FIRST**: Stale Next.js process from previous session
**CHECK**: `lsof -ti:3000` or `fuser 3000/tcp`
**FIX**: `kill $(lsof -ti:3000)` then restart
**ALSO CHECK**: `.next` directory lock files
**NEVER DO**: Change the port — fix the stale process

## RULE-CX-004: "API calls return 401 / fail silently"
**SUSPECT FIRST**: Missing `useAutoLoadToken()` hook in the page component
**CHECK**: Does the page component call `useAutoLoadToken()` in its body?
**ALSO CHECK**: Token expiry — is the session still valid?
**FIX**: Add `useAutoLoadToken()` as first line in page component
**NEVER DO**: Skip auth and hardcode tokens — add the hook

## RULE-CX-005: "Toast notification not showing"
**SUSPECT FIRST**: Using React Context instead of Zustand store for toasts
**CHECK**: Is the code using `useToastStore.getState().success()` or `useToastStore.getState().error()`?
**FIX**: Replace any Context-based toast with `useToastStore.getState().*` pattern
**NEVER DO**: Use React Context for toasts — Zustand is the standard

## RULE-CX-006: "TypeScript 'as any' build warnings"
**SUSPECT FIRST**: API response not typed properly
**CHECK**: Look at the API response handler — is it using `as any` to silence types?
**FIX**: Create proper TypeScript interfaces for the API response shape
**ALSO CHECK**: Is the same `as any` pattern in other modules? (grep for `as any`)
**NEVER DO**: Add more `as any` — create proper types

## RULE-CX-007: "Auth breaks after file rename/move"
**SUSPECT FIRST**: `proxy.ts` renamed to `middleware.ts` or vice versa
**CHECK**: Is the auth middleware file named exactly `proxy.ts`? (Next.js 16 convention)
**FIX**: Rename back to `proxy.ts` immediately
**NEVER DO**: Rename `proxy.ts` to `middleware.ts` — Next.js 16 requires the proxy name

## RULE-CX-008: "Dashboard module shows blank / 404"
**SUSPECT FIRST**: Route not registered in sidebar menu or missing `page.tsx`
**CHECK**: Does the `(dashboard)/[module]/page.tsx` file exist?
**ALSO CHECK**: Is the module listed in the sidebar configuration?
**ALSO CHECK**: Does the module's `page.tsx` have `useAutoLoadToken()`?
**NEVER DO**: Create a route without adding it to the sidebar config

---

## Rules Pending (will be added as issues are resolved)

_This section grows automatically as debugging sessions are completed._

---

*Created: 2026-05-16*
*Source: Debugging sessions from May 13-16, 2026*
