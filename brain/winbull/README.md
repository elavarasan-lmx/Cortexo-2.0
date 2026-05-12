# Winbull Staging — Dev Brain 🧠

> AI-assisted knowledge base for the Winbull bullion trading platform.
> Built and maintained by the Logimax DevOps team.

---

## What Is This?

This folder contains structured documentation about the Winbull Staging platform.
It is used by the AI coding assistant (Antigravity) to:
- Understand business rules before touching code
- Detect bugs using known patterns
- Follow consistent workflows for bug fixing and auditing

**Rule**: Before making ANY change to winbullstaging, read `0_session_start.md` first.

---

## File Map

| File | What It Contains |
|------|-----------------|
| `0_session_start.md` | **START HERE** — routing table, dangerous files, bug fix protocol |
| `1_architecture.md` | System overview — CI3 + Lumen + Socket layers |
| `2_web_frontend.md` | Web frontend modules and structure |
| `3_admin_panel.md` | Admin panel modules, General Settings fields |
| `4_mobile_api.md` | Mobile API endpoints and auth patterns |
| `5_lumen_engine.md` | Rate engine service (Lumen) |
| `6_socket_layer.md` | Socket.IO layer and event architecture |
| `7_bugs_and_issues.md` | Known bugs (31+), their status and priority |
| `8_gap_coverage.md` | What's documented vs what's missing |
| `9_admin_form_fields.md` | All 10 admin forms — field-level documentation |
| `10_web_form_fields.md` | All 9 customer-facing forms |
| `11_bug_patterns.md` | 20 recurring bug patterns with grep detection + fix templates |
| `12_business_rules.md` | Financial formulas, margin, KYC, order, cancel rules |
| `13_validation_rules.md` | Frontend validation — General.js reference |
| `14_warning_standards.md` | W-codes and server response format standards |
| `15_ui_blueprint.md` | Button, DataTable, AJAX handler, delete modal standards |
| `16_glossary.md` | 40 trading and system terms defined |
| `17_workflows_index.md` | All slash commands — quick reference |

---

## Slash Commands (Workflows)

| Command | Purpose |
|---------|---------|
| `/audit-module [name]` | 7-round deep audit on any module |
| `/bug-intake [description]` | Classify and prioritize a new bug |
| `/fix-bug [ID]` | Fix one bug with Confidence Gate + Ripple Check |
| `/learn-improve [ID]` | Post-fix: update patterns, log postmortem, track velocity |
| `/scan-cross-module [pattern]` | Find same bug across all modules after a fix |
| `/git-push [ID]` | One commit per bug, standard message format |

---

## How to Use With AI

1. Open a new AI chat
2. Say: **"Read /run/media/lmx/LMX/Winbull/Personal/Devops/brain/winbull/0_session_start.md first"**
3. Tell the AI what you want to do

The AI will follow the documented workflows automatically.

---

## Key Rules

- ⛔ Never modify `global_configs.php`, `rate_helper.php`, or `Booking_model.php` without explicit approval
- ⛔ Never commit directly to main without a bug ID in the commit message
- ✅ Every bug fix = one commit, one bug ID
- ✅ Track B (business logic) bugs require human confirmation before coding

---

*Maintained by: Elavarasan — Logimax Technologies*
*Last updated: 2026-05-12*
