# AGENTS.md — Cortexo-2.0 Workspace

> Master instruction file for all AI agents working in this workspace.
> Read this FIRST before any code changes.

---

## 🏗️ Workspace Overview

This workspace manages **two major projects** + infrastructure:

| Project | Tech | Path | Brain |
|---------|------|------|-------|
| **Cortexo** | Next.js 16 + Fastify 5 + PostgreSQL + Redis | `cortexo/` | `brain/cortexo/` |
| **Winbull Staging** | CodeIgniter 3 + Lumen 10 + Node.js WS + MySQL | `Project/winbullstaging/` | `brain/winbull/` |
| **Winbull Mobile** | Flutter (migrating from Ionic) | External repo | `brain/winbull/modules/` |

**Owner**: Elavarasan — Solo DevOps Engineer @ Logimax India

---

## 📋 Before ANY Code Change

1. **Check `.agent/config.md`** — scan rules & ignore patterns
2. **Read the project's brain** — `brain/{project}/0_session_start.md`
3. **Check `.agent/skills/{project}-dev/SKILL.md`** — coding conventions
4. **Never touch dangerous files** without explicit approval (listed in each brain)

---

## 🚫 Global Rules (All Projects)

### Never Do
- Scan `node_modules/`, `.next/`, `.turbo/`, `dist/`, `platforms/`, `plugins/`
- Scan `Project/` directory (SSHFS mounts — **causes hangs**)
- Commit secrets, credentials, or `.env` files
- Say "Fixed" — say "Applied — please verify"
- Make more than 3-5 changes per session without checkpointing

### Always Do
- Read the brain's session start file before touching code
- One commit per bug/feature with descriptive message
- Grep for imports before deleting any file
- Track B (business logic) changes need human confirmation
- Use the project's established patterns (see skills)

---

## 🧠 Knowledge System Architecture

```
.agent/                          ← AI behavior config (THIS FILE)
├── AGENTS.md                    ← Master instructions (you are here)
├── config.md                    ← Scan rules, ignore patterns, entry points
└── skills/                      ← Project-specific coding rules
    ├── ui-ux-pro-max/           ← Design system skill
    ├── winbull-dev/             ← Winbull PHP coding conventions
    └── cortexo-dev/             ← Cortexo TypeScript conventions

brain/                           ← Deep domain knowledge
├── winbull/                     ← 19 artifacts + workflows + modules
│   ├── 0_session_start.md       ← START HERE for Winbull work
│   └── ...
└── cortexo/                     ← Cortexo platform brain
    ├── 0_session_start.md       ← START HERE for Cortexo work
    └── ...

~/.gemini/.../knowledge/         ← Cross-session summaries (auto-managed)
├── cortexo-project/             ← Cortexo KI (lightweight pointers)
└── winbull-staging-platform/    ← Winbull KI (lightweight pointers)
```

---

## 🔀 Routing: How to Know Which Project

| User Says | Project | Read First |
|-----------|---------|------------|
| "winbull", "staging", "bullion", "booking", "admin panel" | Winbull | `brain/winbull/0_session_start.md` |
| "cortexo", "dashboard", "deploy engine", "testing hub" | Cortexo | `brain/cortexo/0_session_start.md` |
| "mobile app", "flutter", "ionic" | Winbull Mobile | `brain/winbull/modules/booking_module_brain.md` |
| "server", "nginx", "pm2", "aws" | Infrastructure | `brain/cortexo/` + Server/ configs |
| "deploy script", "webhook" | DevOps Automation | `scripts/` directory |

---

## 📊 Quick Stats

- **Cortexo**: Next.js 16 monorepo, 32 API routes, 18 DB schemas, 11 dashboard modules
- **Winbull**: CodeIgniter 3, 294 endpoints, 31+ known bugs, 20 bug patterns cataloged
- **Servers managed**: 7 AWS servers across multiple clients
- **Clients**: Winbull, Vijay Bullion, MNT Traders, KVT Jewellers, Ruby Silver

---

*Last updated: 2026-05-13*
