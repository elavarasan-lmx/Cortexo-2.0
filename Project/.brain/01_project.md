# 🏗️ WinBull Trade — Project Overview

> **Load this file FIRST every session** | Last Updated: 2026-05-01
> Gold/silver commodity trading platform | 77+ clients | Every fix affects ALL clients

---

## What is WinBull Trade?

A **commodity trading platform** for gold, silver, and bullion. Customers book orders at live MCX rates with premium adjustments. Admins manage master data, customer accounts, rates, and reporting.

- **Developer**: Logimax India Pvt Ltd
- **Clients**: 77+ (70 migrating + 7 new) — every fix affects ALL
- **Scale**: 94 tables, ~94,000 lines of code, 54 admin controllers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP CodeIgniter 3.x |
| Database | MySQL (separate DB per client) |
| Admin Frontend | Bootstrap + jQuery + DataTables |
| Customer Portal | Bootstrap + jQuery + AJAX |
| Mobile App | Ionic / Angular (REST API) |
| Rate Engine | Lumen (Laravel micro) + Redis |
| Real-time | Socket.IO (Node.js) |
| Live Rates | Lightstreamer (MCX feed) |
| Notifications | Toastr.js, SweetAlert2, SMS, WhatsApp, Push |

---

## Project Structure

```
WinBullSource/
├── admin/           ← Admin panel (54 controllers, 57 models, ~66K lines)
├── application/     ← Customer portal (10 controllers, 11 models, ~11K lines)
├── mobileapi/       ← Mobile REST API (4 controllers, ~7K lines)
├── app/             ← Ionic mobile app (44 pages, ~8K lines)
├── api/             ← Public API endpoints (23 raw PHP files, ~1.5K lines)
├── client/          ← Client-side JS (rate display)
├── lmxtrade/        ← Socket.IO + Lumen rate server
├── system/          ← CodeIgniter 3 core (NEVER EDIT)
├── assets/          ← CSS/JS/images
└── global_configs.php ← Per-client config (ALL credentials)
```

---

## 📂 Workspace Directory Mapping (Local Disk)

> **Root:** `/run/media/lmx/LMX/Winbull/Personal/Devops/`

```
Devops/                              ← WORKSPACE ROOT (Git repo)
├── .git/                            ← Version control
├── .github/                         ← GitHub Actions/CI
├── .gitignore
│
├── Project/                         ← 🏗️ WinBull Trade Platform
│   ├── .brain/                      ← 🧠 Agent brain files
│   │   ├── 00_index.md              ← Quick lookup
│   │   ├── 01_project.md            ← THIS FILE
│   │   ├── 02_modules.md            ← 82-module registry
│   │   ├── 03_bug_patterns.md       ← 19 bug patterns + security vulns
│   │   ├── 05_db_schema.md          ← 94-table MySQL schema + dependencies
│   │   ├── rules/                   ← Business rules, rate formula, validation
│   │   ├── workflows/               ← Audit + fix-bug procedures
│   │   ├── templates/               ← Module brain template
│   │   └── modules/                 ← Per-module brains (created during audits)
│   │
│   ├── Web/                         ← 🌐 WEB SOURCE (PHP CodeIgniter)
│   │   ├── admin/                   ← Admin panel controllers/models/views
│   │   ├── application/             ← Customer portal
│   │   ├── mobileapi/               ← Mobile REST API
│   │   ├── api/                     ← Public API endpoints
│   │   ├── client/                  ← Client-side JS (rate display)
│   │   ├── lmxtrade/                ← Socket.IO + Lumen rate server
│   │   ├── assets/                  ← CSS/JS/images
│   │   ├── system/                  ← CodeIgniter 3 core (NEVER EDIT)
│   │   └── global_configs.php       ← Per-client config
│   │
│   └── android/                     ← 📱 MOBILE APP SOURCE (Ionic/Angular)
│       ├── src/                     ← TypeScript source (pages, providers, etc)
│       ├── platforms/               ← Native platform builds
│       ├── plugins/                 ← Cordova plugins
│       ├── resources/               ← Icons, splash screens
│       ├── www/                     ← Built web assets
│       ├── config.xml               ← Cordova config
│       ├── package.json             ← Dependencies
│       └── ionic.config.json        ← Ionic CLI config
│
└── cortexo/                         ← 🤖 CORTEXO 2.0 (Project Mgmt + DevOps)
    ├── apps/
    │   ├── web/                     ← Next.js dashboard (Turborepo)
    │   └── api/                     ← Backend API
    ├── packages/                    ← Shared packages
    ├── docs/                        ← Documentation
    ├── e2e/                         ← Playwright E2E tests
    ├── sources/                     ← Data sources
    ├── IDP_Architecture/            ← Architecture docs
    ├── UI_Screens/                  ← Design screenshots
    ├── docker-compose.yml           ← Docker setup
    ├── Dockerfile                   ← Container build
    ├── turbo.json                   ← Turborepo config
    └── package.json                 ← Monorepo root
```

### Quick Reference Paths

| What | Path |
|------|------|
| **Web Source** | `Project/Web/` |
| **Admin Panel** | `Project/Web/admin/` |
| **Customer Portal** | `Project/Web/application/` |
| **Mobile API** | `Project/Web/mobileapi/` |
| **Rate Engine** | `Project/Web/lmxtrade/` |
| **Global Config** | `Project/Web/global_configs.php` |
| **Mobile App Source** | `Project/android/src/` |
| **Cortexo Dashboard** | `cortexo/apps/web/` |
| **Cortexo API** | `cortexo/apps/api/` |
| **Agent Brain** | `Project/.brain/` |

---

## Coding Standards (CodeIgniter 3)

| Rule | Detail |
|---|---|
| **Controllers** | `C_ModuleName.php` → extends `CI_Controller` |
| **Models** | `ModuleName_model.php` → extends `CI_Model` |
| **Views** | `modulename_listing.php`, `modulename_entry.php` |
| **URLs** | `/admin/C_module/method` |
| **Input** | Always `$this->input->post()` — NEVER raw `$_POST` |
| **Queries** | Active Record `$this->db->` — NEVER raw SQL unless impossible |
| **AJAX** | `echo json_encode(['status'=>'success/error','message'=>'...','data'=>...])` |
| **Strings** | Single quotes in PHP, double quotes in JS |
| **Logic** | Business logic in MODELS, not controllers |
| **No duplicates** | Same logic in 2+ places → extract to helper method |
| **No magic numbers** | Never `where('status', 1)` without comment |
| **Toasters** | Use `showToast()`, `showConfirmModal()` — BANNED: `alert()`, `confirm()` |

---

## 📎 Detailed References

> These topics are documented in detail in dedicated files:

| Topic | File |
|-------|------|
| Rate calculation pipeline (8-step formula, 3 modes) | `rules/rate_formula.md` |
| Business rules (25+ BR rules, order flow, edge cases) | `rules/business_rules.md` |
| Validation patterns (keypress types, form validation) | `rules/validation_rules.md` |
| Bug detection patterns + security vulns | `03_bug_patterns.md` |
| DB schema + dependency map | `04_db_schema.md` |
| Module audit procedure (6-round scan) | `workflows/audit_module.md` |
| Bug fix procedure (surgical + rollback) | `workflows/fix_bug.md` |

### Quick Reminders

| Rule | Detail |
|---|---|
| **book_type** | 0=Buy, 1=Sell (counterintuitive!) |
| **market_status** | 0=OPEN, 1=CLOSED (counterintuitive!) |
| **Gold weight** | Stored KG, displayed Grams |
| **Purity** | ÷0.995 BEFORE roundoff |
| **Sell roundoff** | Ceiling (UP) |
| **Buy roundoff** | Floor (DOWN) |

---

## 🚨 Dangerous Files — Do NOT Touch Without Approval

### ⛔ ABSOLUTE — Never Edit Without Jerry

| File | Why | Size |
|------|-----|------|
| `system/application/helpers/trading_helper.php` | Core trading engine — one wrong line = ALL 77 clients down | 4,531 lines |
| `C_booking.php` (`phone_booking` method) | 128KB monolith, every IF branch matters | ~3,200 lines |
| `global_configs.php` | ALL client credentials — DB, keys, URLs | 190 lines |

### ⚠️ HIGH RISK — Ask Before Touching

| Area | What to Do |
|------|-----------|
| Rate calculation code | Read `rules/rate_formula.md` first, then ask |
| Margin / hedge logic | Financial calcs — ask Jerry |
| `dt_booking` INSERT/UPDATE | Show plan first |
| SQL migrations (ALTER TABLE) | Must run on ALL 77 DBs — ask Jerry |
| `trading.php` view | Core trading UI, JS tightly coupled |

### ✅ ALWAYS SAFE

| Type | Why |
|------|-----|
| `.brain/*.md` files | Documentation only |
| View files (display only) | No DB writes |
| CSS/JS assets | Low risk, browser test after |

### CodeIgniter Core — NEVER EDIT `system/`

Override via: `admin/application/core/MY_*.php` or `admin/application/libraries/MY_*.php`

---

## Bug Fix Discipline

1. **Brain-First**: Read module brain BEFORE touching code
2. **MAX 3-5 fixes per session**. One fix → one test → one commit
3. **Never mark ✅ Fixed** — only ⚠️ Applied (user verifies)
4. **Root cause first** — never patch symptoms
5. **No duplicate functions** — add condition to existing, never clone
6. **Cross-module scan** after every fix — same bug likely exists in 81 other modules
7. **Rollback plan BEFORE applying** any fix
8. **Track A (System)** vs **Track B (Business)** — business bugs need human approval

---

## Glossary

| Term | Meaning |
|---|---|
| MCX | Multi Commodity Exchange (India) |
| Spot Rate | Current market price |
| Premium | Extra charge added to base rate per customer group |
| Purity | Gold purity factor (0.995 = 99.5%) |
| Margin | Customer deposit before trading |
| KYC | Know Your Customer (Aadhaar, PAN verification) |
| R-Panel | Rate Panel — admin rate configuration UI |
| TCS/TDS | Tax Collected/Deducted at Source (Indian tax) |
| Hedge | Offsetting trade on MCX via Motilal Oswal API |
| Unfix | Reverse/cancel a confirmed booking |
| `$client` | Client identifier — Redis prefix + socket channel |
| Globals | `global_configs.php` per-client config class |
| General.js | Admin JS library: `showToast()`, `showConfirmModal()`, `validateForm()` |
| `dt_*` | Database table prefix |
| `C_*` | Controller prefix |
| `*_model.php` | Model suffix |

---

## 🌍 Client Registry

> **Same codebase, different `global_configs.php` per client**
> Every client gets their own: domain, database, socket channel, notification keys, timezone

### What Differs Per Client (`global_configs.php`)

| Config Category | Fields | Example (Maharaj) |
|----------------|--------|-------------------|
| **Identity** | `$client`, `$web_title`, `$web_copyright` | `maharaj`, `Maharaj Gold Smith` |
| **URLs** | `$web_base_url`, `$app_base_url`, `$admin_base_url` | `maharajgoldsmith.com` |
| **Database** | `$hostname`, `$username`, `$password`, `$database` | RDS endpoint, `maharaj` DB |
| **Socket** | `$socket_base_url`, `$rate_socketurl`, `$nativesocketurl` | `ws://maharajgoldsmith.com/ws` |
| **Socket Events** | `$evt_commupdate`, `$evt_bookupdate`, etc. | `maharajupdate*` prefix |
| **Broadcast** | `$bcclient`, `$bcusername`, `$bcpassword` | `maharaj`, `maharaj-trade` |
| **Rate Feed** | `$bcrateType`, `$rateFeed`, `$websocket_type` | 2 (websocket), 4 (native), 2 |
| **Notifications** | `$app_id`, `$onesignalauth`, `$notification_title` | OneSignal keys |
| **Timezone** | `$timezone` | `Asia/Kolkata` (India) / varies |
| **Currency** | Implicit via DB locale settings | INR / MYR / AED etc. |
| **Encryption** | `$key`, `$path` | Per-client enc key + file path |
| **Versions** | `$web_version`, `$VERSIONNAME`, `$IOSVERSIONNAME` | May differ per client |
| **WhatsApp** | `$whatsappurl`, `$instanceid` | Per-client instance |
| **Hedge (Motilal)** | `$clientcode`, `$ApiKey`, etc. | Only Indian clients |

### 🇮🇳 Indian Clients

| # | Client | Domain | DB Name | Status | Notes |
|---|--------|--------|---------|--------|-------|
| 1 | Maharaj Gold Smith | maharajgoldsmith.com | maharaj | ✅ Active | Reference config in repo |
| — | *70+ migrating clients* | varies | varies | 🔄 Migrating | Same template, different credentials |
| — | *7 new clients* | varies | varies | 🆕 New | Being onboarded |

### 🌏 Foreign Clients

| # | Client | Country | Currency | Domain | Staging | Status | Special Notes |
|---|--------|---------|----------|--------|---------|--------|---------------|
| 1 | KVT Jewellers | 🇲🇾 Malaysia | MYR | kvtjewellers.com | stagingwt.kvtjewellers.com | 🔧 Staging | Timezone: `Asia/Kuala_Lumpur`, No MCX hedge, Different tax rules |

### ⚠️ Foreign Client Differences (vs Indian)

| Feature | Indian Client | Foreign Client |
|---------|--------------|----------------|
| **Currency** | INR (₹) | MYR (RM), AED (د.إ), etc. |
| **Timezone** | `Asia/Kolkata` | `Asia/Kuala_Lumpur`, etc. |
| **Tax** | GST 3%/5%, TCS/TDS | Local tax rules (Malaysia SST, etc.) |
| **KYC** | Aadhaar + PAN | Passport / MyKad / IC Number |
| **Hedge (Motilal)** | ✅ Available | ❌ Not applicable |
| **Rate Feed** | MCX India | International spot / LBMA |
| **Weight Units** | Grams/KG/Tola | Grams/KG/Troy Oz |
| **SMS Provider** | Indian SMS gateway | International gateway |
| **WhatsApp** | Indian instance | International instance |
| **App Store** | India region | Malaysia/UAE region |

### Adding a New Client Checklist

```
1. [ ] Clone global_configs.php → update ALL URLs, DB, socket events
2. [ ] Create new MySQL database (same schema, empty data)
3. [ ] Run seed data (commodity masters, admin user, settings)
4. [ ] Configure Socket.IO channel with new $client prefix
5. [ ] Setup OneSignal app (customer + admin)
6. [ ] Configure domain + SSL
7. [ ] Update Lumen rate broadcast for new client
8. [ ] Test: Admin login → Commodity setup → Rate display → Customer booking
9. [ ] Build & publish mobile app (update config.xml, package name)
10. [ ] Add client to this registry ⬆️
```
