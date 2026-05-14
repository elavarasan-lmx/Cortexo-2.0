# Brain Usage Guide

> How to use the knowledge base in this directory.

---

## Quick Start

When user says "load brain" or starts a new session:

1. Check context (cortexo or winbull)
2. Read respective `*/0_session_start.md`
3. Reference workflows index if needed

---

## Directory Structure

```
brain/
├── CLAUDE.md              ← You are here
├── cortexo/              ← Cortexo DevOps platform brain
│   ├── 0_session_start.md
│   ├── 1_architecture.md
│   ├── 2_api_routes.md
│   ├── 3_db_schema.md
│   ├── 4_conventions.md
│   ├── 5_api_patterns.md
│   ├── 6_ssh_executor.md
│   ├── 7_testing_engine.md
│   ├── 8_frontend_patterns.md
│   └── 9_devops_patterns.md
├── winbull/              ← Winbull trading platform brain
│   ├── 0_session_start.md   ← START HERE
│   ├── 1_architecture.md
│   ├── *_module_brain.md    ← Module knowledge bases
│   ├── workflows/            ← All slash command workflows
│   │   ├── start-session.md
│   │   ├── end-session.md
│   │   ├── status.md
│   │   ├── build-module-brain.md
│   │   ├── audit-module.md
│   │   ├── bug-intake.md
│   │   ├── fix-bug.md
│   │   ├── verify-fix.md     ← NEW
│   │   ├── learn-and-improve.md
│   │   ├── git-push.md
│   │   ├── deploy.md
│   │   └── ...
│   └── _SYSTEM/           ← Dynamic state files
│       ├── ACTIVE_BUGS.md
│       ├── CROSS_MODULE_BUGS.md
│       └── ...
└── workflows/              ← Shared workflows
    ├── start-session.md    ← NEW
    ├── end-session.md       ← NEW
    ├── status.md           ← NEW
    └── verify-fix.md       ← NEW
```

---

## Workflow Execution Order

### Typical Bug Fix Session
```
/start-session → /bug-intake → /fix-bug → /verify-fix → /learn-and-improve → /git-push → /deploy
```

### Module Audit Session
```
/start-session → /build-module-brain → /audit-module → /scan-cross-module
```

### System Health Check
```
/start-session → /system-health → /overall-bug-dashboard
```

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Session notes | `SESSION_YYYY-MM-DD.md` | `SESSION_2026-05-14.md` |
| Bug fixes | `FIX_YYYY-MM-DD.md` | `FIX_2026-05-14.md` |
| System health | `SYSTEM_HEALTH_DATE.md` | `SYSTEM_HEALTH_2026-05-14.md` |
| Module brain | `{Module}_module_brain.md` | `login_module_brain.md` |
| Dashboard reports | `bug_dashboard_DATE.md` | `bug_dashboard_2026-05-14.md` |

---

## Key Rules

1. **Read `0_session_start.md` first** for any Winbull or Cortexo session
2. **Reference dangerous files** before touching any PHP/TS files
3. **Follow workflows** — they encode best practices
4. **Never say "Fixed"** — say "Applied, please verify"
5. **One bug per commit** — use `/git-push` workflow

---

## Updating the Brain

After completing tasks:
- Update `0_session_start.md` Update Log
- Add new bugs to `_SYSTEM/ACTIVE_BUGS.md`
- Log fixes to `_SYSTEM/FIX_VELOCITY.md`
- Update module brain docs if patterns discovered

---

## Cross-Reference

- [brain/winbull/0_session_start.md](brain/winbull/0_session_start.md) — Winbull entry point
- [brain/cortexo/0_session_start.md](brain/cortexo/0_session_start.md) — Cortexo entry point
- [brain/winbull/17_workflows_index.md](brain/winbull/17_workflows_index.md) — All workflows
- [brain/winbull/11_bug_patterns.md](brain/winbull/11_bug_patterns.md) — Bug patterns + grep rules

---

*Last updated: 2026-05-14*
*Maintained by: Elavarasan @ Logimax India*