# 🚀 Winbull Staging — Session Starter (Read This First)

> If user says **"Load brain"** → read this file + skim all artifact headers below.
> This file is the single entry point for every Winbull session.

---

## What Is This Platform?

**Winbull Staging** is a white-label bullion (gold/silver) trading platform.
- **Operated by**: Logimax Bullion (client)
- **Staging URL**: `bullionstaging_v4.logimaxindia.com`
- **Project path**: `/run/media/lmx/LMX/Winbull/Personal/Devops/Server/winbullstaging/`
- **DevOps managed via**: Cortexo platform at `/run/media/lmx/LMX/Winbull/Personal/Devops/cortexo/`

---

## Tech Stack (One-Line)

```
CodeIgniter 3 (Web + Admin + Mobile API)
+ Laravel Lumen 10 (Rate Engine)
+ Node.js Native WS (Socket Server)
+ MySQL on AWS RDS
+ Redis on AWS ElastiCache
```

---

## Brain-First Rule ⚠️

**BEFORE touching any source file, check the brain artifact below.**

| Question Type | Read This Artifact First |
|--------------|--------------------------|
| Architecture, DB, config, infrastructure | `1_architecture.md` |
| Web controllers, models, customer functions | `2_web_frontend.md` |
| Admin controllers, models, General Settings fields | `3_admin_panel.md` |
| Mobile API endpoints | `4_mobile_api.md` |
| Rate engine, Lumen, jobs, events | `5_lumen_engine.md` |
| WebSocket, socket server, push rates | `6_socket_layer.md` |
| Known bugs, security issues, by-design list | `7_bugs_and_issues.md` |
| Limit orders, unfix, hedge, margin | `8_gap_coverage.md` |
| **Admin form field meaning** | `9_admin_form_fields.md` |
| **Web/customer form field meaning** | `10_web_form_fields.md` |
| **Bug patterns** (grep rules + fix templates for 19 patterns) | `11_bug_patterns.md` |
| **Business rules** (rate formula, margin, KYC, order flow) | `12_business_rules.md` |
| **Validation rules** (General.js types, data-validate patterns) | `13_validation_rules.md` |
| **Warning standards** (W-codes, severity, response format) | `14_warning_standards.md` |
| **UI blueprint** (buttons, DataTable, AJAX, delete, form template) | `15_ui_blueprint.md` |
| **Domain glossary** (MCX, TCS, book_type, Globals, dt_ tables) | `16_glossary.md` |

---

## Key People & Roles

| Name | Role |
|------|------|
| **Elavarasan** | Solo DevOps Engineer @ Logimax India. Manages all servers |
| **Logimax Bullion** | Client company running winbullstaging |

---

## ⛔ Dangerous Files — NEVER Touch Without Approval

| File | Why Dangerous |
|------|---------------|
| `system/application/helpers/trading_helper.php` | Core trading engine — 4,531 lines. One wrong line takes down ALL clients |
| `application/controllers/C_booking.php` → `phone_booking` method | 128KB monolith — every IF branch has specific behavior |
| `global_configs.php` | ALL client credentials — DB host, encryption keys, API keys |

**High Risk (Ask Before Touching)**: any rate calc, margin/hedge logic, `dt_booking` INSERT/UPDATE, SQL migrations

---

## Active Critical Bugs (Top 3 — Do Not Forget)

| # | Bug | Risk | Status |
|---|-----|------|--------|
| 🔴 1 | `WhiteListDomainMiddleware` disabled in Lumen | Rate/broadcast endpoints exposed publicly | **Open** |
| 🔴 2 | AWS RDS credentials hardcoded in `global_configs.php` | DB access on any file leak | **Open** |
| 🟠 3 | `get_tdsvalue()` reads `tcs_value` key for TDS (wrong column) | TDS calc shows TCS rate | **Open** |

---

## Platform Flow (30-Second Mental Model)

```
Customer logs in (mobile = username)
  → Sees live gold/silver rates (from Node.js WS → Socket.io → browser)
  → Places booking (Market rate OR Limit order)
  → Admin reviews / confirms booking
  → TDS or TCS calculated on total
  → Delivery / delivery scheduled
```

---

## Admin Panel Entry Point

- URL: `/admin/index.php/C_admin_user/login`
- Super admin has access to all modules
- Key forms: General Settings, Commodity, Customer, R-Panel, SMS/Email/WhatsApp

---

## Common Shortcuts

| Task | Where to look |
|------|--------------|
| Rate pipeline debug | `5_lumen_engine.md` → `RateController` |
| Customer can't login | `2_web_frontend.md` → `C_client_main/login_validation()` |
| Booking not going through | `2_web_frontend.md` + `7_bugs_and_issues.md` |
| Admin field purpose | `9_admin_form_fields.md` (Form 1–10 index at top) |
| Web field purpose | `10_web_form_fields.md` (Quick Lookup table at top) |
| TDS/TCS logic | `3_admin_panel.md` → TCS/TDS section |
| Socket not pushing | `6_socket_layer.md` |
| Security audit | `7_bugs_and_issues.md` |

---

## Bug Fix Protocol (Use Every Time)

| Step | Action |
|------|--------|
| 1. Triage | P0→P3 severity, Track A (system) or B (business) |
| 2. Check Brain | Read `11_bug_patterns.md` — fix template may already exist |
| 3. Check `7_bugs_and_issues.md` | Confirm it's not already documented or "by design" |
| 4. Fix | Minimal change, add `// Bug fix: {ID}` comment |
| 5. Cross-scan | Check if same pattern exists in other modules |
| 6. Never say "Fixed" | Say "Applied — please verify in browser" |
| 7. Max 3-5 bugs per session | Quality over quantity |

---

## Update Log (Latest Changes)

| Date | Change |
|------|--------|
| 2026-05-12 | Added Artifacts 11–16 from Devops_Tool/agent scan |
| 2026-05-12 | Artifact 11 — 19 Bug Patterns with grep rules + fix templates |
| 2026-05-12 | Artifact 12 — Business Rules (financial, KYC, order, commodity) |
| 2026-05-12 | Artifact 13 — Validation Rules (General.js complete reference) |
| 2026-05-12 | Artifact 14 — Warning Standards (W-codes, severity, response format) |
| 2026-05-12 | Artifact 15 — UI Blueprint (buttons, DataTable, AJAX, form templates) |
| 2026-05-12 | Artifact 16 — Glossary (40 trading/system terms) |
| 2026-05-12 | Artifact 0 — Dangerous files + bug fix protocol added |
| 2026-05-12 | Artifact 10 — Web Form Fields (all 9 customer forms) |
| 2026-05-12 | Artifact 9 — Admin Form Fields (all 10 admin forms) |
| 2026-05-12 | Artifact 3 — General Settings full field map |
| 2026-05-12 | TDS/TCS bug documented (tcs_value key mismatch) |
