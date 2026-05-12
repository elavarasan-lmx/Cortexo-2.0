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

## Brain Building (Prerequisites Before Audit)

| Slash Command | File | Purpose |
|---|---|---|
| `/build-module-brain` | `workflows/build-module-brain.md` | Build 9-doc knowledge base for a module (REQUIRED before /audit-module) |
| `/build-system-brain` | `workflows/build-system-brain.md` | Cross-module brain: shared tables, DANGER_ZONES, DIAGNOSTIC_PLAYBOOK |

## Audit & Discovery

| Slash Command | File | Purpose |
|---|---|---|
| `/audit-module` | `workflows/audit-module.md` | 6-round deep audit on a single module (needs /build-module-brain first) |
| `/scan-cross-module` | `workflows/scan-cross-module.md` | After fixing a bug, scan ALL other modules for same pattern |

## Bug Lifecycle

| Slash Command | File | Purpose |
|---|---|---|
| `/bug-intake` | `workflows/bug-intake.md` | Classify a new bug → severity, track, category |
| `/fix-bug` | `workflows/fix-bug.md` | Fix one bug — with Confidence Gate, Ripple Check, Approval Gate |
| `/learn-and-improve` | `workflows/learn-and-improve.md` | Post-fix: anti-patterns, postmortem capture, velocity, DIAGNOSTIC_PLAYBOOK update |
| `/verify-fix` | `workflows/verify-fix.md` | Post-fix checklist before marking as applied |

## Reporting & Health

| Slash Command | File | Purpose |
|---|---|---|
| `/system-health` | `workflows/system-health.md` | Cross-module risk heatmap — module risk scores, systemic patterns, quick wins |
| `/overall-bug-dashboard` | `workflows/overall-bug-dashboard.md` | Full project bug dashboard — sprint progress, velocity, open P0s, security status |

## Git & Deploy

| Slash Command | File | Purpose |
|---|---|---|
| `/git-push` | `workflows/git-push.md` | Commit and push after a fix (one commit per bug) |

---

## Execution Order (Recommended)

```
/build-module-brain → /audit-module → /bug-intake → /fix-bug → /learn-and-improve → /git-push
                                                                             ↑
/build-system-brain (after 3+ modules) → /system-health (weekly)
                                       → /overall-bug-dashboard (weekly/sprint review)
```
