# Brain Usage Guide

> How to use the knowledge base in this directory.

---

## Current Focus (Week of May 12–16)

- **Primary**: Cortexo dashboard modularization + TypeScript hardening
- **Secondary**: Ruby Staging deployment + MKR Silver Flutter fixes
- **Blocked**: Winbull security danger zones (pending business approval)
- **Completed**: Dashboard component split, `as any` cleanup, dead schema removal

> ⚡ Update this section weekly to orient new AI sessions instantly.

---

## Quick Start

When user says "load brain" or starts a new session:

1. Check context (cortexo, winbull, ruby, or mkrsilver)
2. Read respective `*/0_session_start.md`
3. Reference workflows index if needed

---

## Directory Structure

```
brain/
├── CLAUDE.md              ← You are here
├── infrastructure.md      ← Server map — all 7 servers, RDS, Redis, ports
├── clients.md             ← Client roster — 6 clients → servers → codebases
├── cortexo/              ← Cortexo DevOps platform brain (10 artifacts)
│   ├── 0_session_start.md
│   ├── 1_architecture.md
│   ├── 2_api_routes.md
│   ├── 3_db_schema.md
│   ├── 4_conventions.md
│   ├── 5_api_patterns.md
│   ├── 6_ssh_executor.md
│   ├── 7_testing_engine.md
│   ├── 8_frontend_patterns.md
│   ├── 9_devops_patterns.md
│   └── _SYSTEM/
│       ├── COVERAGE_ANALYSIS.md
│       └── DIAGNOSTIC_PLAYBOOK.md  ← NEW: 8 symptom→fix rules
├── winbull/              ← Winbull trading platform brain (18 artifacts)
│   ├── 0_session_start.md   ← START HERE
│   ├── 1_architecture.md
│   ├── *_module_brain.md    ← Module knowledge bases (10 complete)
│   ├── workflows/            ← All slash command workflows (15 files)
│   └── _SYSTEM/           ← Dynamic state files (14 files)
├── ruby/                 ← Ruby Staging brain (Server 7)
│   └── 0_session_start.md   ← NEW: staging.rubypreciousmetals.com
├── mkrsilver/            ← MKR Silver Flutter brain (Singapore)
│   └── 0_session_start.md   ← NEW: com.lmx.mkrjewellery
└── workflows/              ← Shared workflows
    ├── start-session.md
    ├── end-session.md
    ├── status.md
    └── verify-fix.md
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

### Platform Brains
- [cortexo/0_session_start.md](cortexo/0_session_start.md) — Cortexo DevOps platform
- [winbull/0_session_start.md](winbull/0_session_start.md) — Winbull trading platform
- [ruby/0_session_start.md](ruby/0_session_start.md) — Ruby Staging (Server 7)
- [mkrsilver/0_session_start.md](mkrsilver/0_session_start.md) — MKR Silver Flutter (Singapore)

### Infrastructure
- [infrastructure.md](infrastructure.md) — Server map, RDS, Redis, SSH access
- [clients.md](clients.md) — Client roster, platform matrix, onboarding checklist

### Workflows & Patterns
- [winbull/17_workflows_index.md](winbull/17_workflows_index.md) — All workflows
- [winbull/11_bug_patterns.md](winbull/11_bug_patterns.md) — Bug patterns + grep rules

### Diagnostics
- [cortexo/_SYSTEM/DIAGNOSTIC_PLAYBOOK.md](cortexo/_SYSTEM/DIAGNOSTIC_PLAYBOOK.md) — Cortexo symptom→fix rules
- [winbull/_SYSTEM/DIAGNOSTIC_PLAYBOOK.md](winbull/_SYSTEM/DIAGNOSTIC_PLAYBOOK.md) — Winbull symptom→fix rules
- [winbull/_SYSTEM/DANGER_ZONES.md](winbull/_SYSTEM/DANGER_ZONES.md) — 9 security risk areas

---

*Last updated: 2026-05-16*
*Maintained by: Elavarasan @ Logimax India*