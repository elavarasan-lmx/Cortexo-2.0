# Postmortem Log — Cortexo

> What went wrong, why, and what we learned. Fed by `/learn-and-improve`.

---

## PM-CX-001: Infinite Redirect Loop (2026-05-16)

**What happened**: Dashboard kept redirecting login → dashboard → login infinitely.

**Root cause**: `UNSAFE_DEV_AUTH` environment guard in auth middleware was checking `NODE_ENV` but local dev wasn't setting it consistently. The middleware detected "production" environment and rejected the dev auth bypass.

**Fix**: Verified `.env.local` has `UNSAFE_DEV_AUTH=true` and auth middleware reads it correctly.

**Lesson**: Environment variables in auth paths must be explicitly tested after any auth-related change.

**Added to**: `DIAGNOSTIC_PLAYBOOK.md` → RULE-CX-002

---

## PM-CX-002: ChunkLoadError After Build (recurring)

**What happened**: After code changes, Next.js shows "ChunkLoadError: Loading chunk failed".

**Root cause**: Stale `.next` build cache contains references to old chunk hashes that no longer exist.

**Fix**: `rm -rf apps/web/.next && npm run dev`

**Lesson**: Always clear `.next` when switching branches or after significant code changes. This is a Next.js known issue, not a code bug.

**Added to**: `DIAGNOSTIC_PLAYBOOK.md` → RULE-CX-001

---

## PM-CX-003: Port 3000 Already In Use (recurring)

**What happened**: `npm run dev` fails with "EADDRINUSE: address already in use :::3000".

**Root cause**: Previous dev server process didn't clean up. `.next` directory may hold lock files.

**Fix**: `kill $(lsof -ti:3000)` or `fuser -k 3000/tcp`

**Lesson**: Check for stale processes before starting dev server, especially after crashes.

**Added to**: `DIAGNOSTIC_PLAYBOOK.md` → RULE-CX-003

---

## Template

```markdown
## PM-CX-XXX: Title (Date)

**What happened**: (symptom)
**Root cause**: (why it happened)
**Fix**: (what was done)
**Lesson**: (what to remember)
**Added to**: (which brain artifact was updated)
```

---

*Last updated: 2026-05-16*
