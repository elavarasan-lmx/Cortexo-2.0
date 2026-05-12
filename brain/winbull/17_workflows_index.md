# Winbull — Workflows Index (Brain Artifact 17)

> All workflows in execution order.
> Say the slash command and I will follow that workflow step-by-step.

---

## Session Management

| Slash Command | File | Purpose |
|---|---|---|
| `/start-session` | `workflows/start-session.md` | Load brain, orient context, declare what we're working on |
| `/end-session` | `workflows/end-session.md` | Capture progress, update session memory, wrap up |
| `/status` | `workflows/status.md` | Quick dashboard — open bugs, what's in progress, what's next |

## Audit & Discovery

| Slash Command | File | Purpose |
|---|---|---|
| `/audit-module` | `workflows/audit-module.md` | 6-round deep audit on a single module |
| `/scan-cross-module` | `workflows/scan-cross-module.md` | After fixing a bug, scan ALL other modules for same pattern |

## Bug Lifecycle

| Slash Command | File | Purpose |
|---|---|---|
| `/bug-intake` | `workflows/bug-intake.md` | Classify a new bug → severity, track, category |
| `/fix-bug` | `workflows/fix-bug.md` | Fix one bug — with Confidence Gate, Ripple Check, Approval Gate |
| `/learn-improve` | `workflows/learn-improve.md` | Post-fix: update patterns, log postmortem, capture velocity |
| `/verify-fix` | `workflows/verify-fix.md` | Post-fix checklist before marking as applied |

## Git & Deploy

| Slash Command | File | Purpose |
|---|---|---|
| `/git-push` | `workflows/git-push.md` | Commit and push after a fix (one commit per bug) |
