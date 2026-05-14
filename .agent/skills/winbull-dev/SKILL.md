---
name: winbull-dev
description: Coding conventions and rules for Winbull Staging (CodeIgniter 3 bullion trading platform). Use when working on any Winbull PHP/JS code.
---

# Winbull Dev Skill

## When to Activate
- User mentions: winbull, staging, bullion, booking, admin panel, CodeIgniter
- Working on files in: `Project/winbullstaging/`, `Server/Clients/winbullsource/`
- Working on: `scripts/winbull_deploy.sh`, `brain/winbull/`

## First Step — ALWAYS
```
Read: brain/winbull/0_session_start.md
```
This file routes you to the correct brain artifact for your task.

## Critical Rules

### ⛔ NEVER Touch Without Approval
- `global_configs.php` — ALL client DB credentials
- `application/helpers/trading_helper.php` — 4,531 line trading engine
- `application/controllers/C_booking.php` → `phone_booking` — 128KB monolith
- Any rate calculation, margin/hedge logic, `dt_booking` INSERT/UPDATE

### ✅ Always Follow
- **One commit per bug** — with bug ID in message
- **Track B (business logic) bugs need human confirmation** before coding
- **Never say "Fixed"** — say "Applied — please verify in browser"
- **Max 3-5 bugs per session** — quality over quantity
- **Cross-scan after every fix** — same bug may exist in other modules

## Tech Stack
```
CodeIgniter 3 (Web + Admin + Mobile API)
+ Laravel Lumen 10 (Rate Engine)
+ Node.js Native WS (Socket Server)
+ MySQL on AWS RDS
+ Redis on AWS ElastiCache
```

## Brain Artifacts Available
| # | Topic |
|---|-------|
| 0 | Session Start (routing table) |
| 1-6 | Architecture, Web, Admin, Mobile API, Lumen, Socket |
| 7 | Known bugs (31+) |
| 8 | Gap coverage |
| 9-10 | Admin forms, Web forms |
| 11 | Bug patterns (20 with grep + fix templates) |
| 12 | Business rules (financial formulas) |
| 13-14 | Validation rules, Warning standards |
| 15-16 | UI blueprint, Glossary |
| 17 | Workflows index |

## Workflows Available
- `/audit-module [name]` — 7-round deep audit
- `/bug-intake [description]` — Classify new bug
- `/fix-bug [ID]` — Fix with Confidence Gate
- `/scan-cross-module [pattern]` — Find same bug across modules
