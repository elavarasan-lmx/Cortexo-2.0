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

## Rate Calculation Pipeline

```
Lightstreamer MCX Feed → Lumen API → Redis → Socket.IO → Client JS → Display
```

### Core Conversion Functions
```javascript
gold_conversion(value)     = (value / 10) × rpsg_weight     // MCX gold Rs/10g → display
silver_conversion(value)   = (value / 1000) × rpss_weight    // MCX silver Rs/KG → display
manual_roundoff(value, type, com_type):
  ask → Math.ceil(value / roundoff) × roundoff    // SELL = ceiling
  bid → Math.floor(value / roundoff) × roundoff   // BUY = floor
```

### Bank Rate (8-Step Formula)
```
Step 1: base = (CONTRACT_ASK + Premium + AskDiff) × (SPOT-INR_ASK + RupeePremium)
Step 2: ± Conversion (troy oz → KG etc)
Step 3: ± Extra Charges
Step 4: + Custom (flat duty)
Step 5: × Tax (GST %)
Step 6: × TCS (%)
Step 7: ÷ 0.995 (if Pure=Yes → 995→999 purity)
Step 8: 1KG Rate = result | 1Grm Rate = result ÷ 1000
```

### R-Panel Commodity Rates (3 Modes)
| Mode | `tradetype` | How Rate Is Calculated |
|---|---|---|
| **Future (MCX)** | 0 | `gold_conversion(MCX_ASK) + sell_diff → roundoff → ×GST → ×TCS` |
| **Bank-based** | 1 | `gold_spotrateconversion(BANK_KGRATE) + sell_diff → roundoff` |
| **Manual** | 2 | Admin enters sell_rate directly. Buy = sell - diff |

### Client Booking Rate
```
Sell Rate = MCX Live + prem_sel_premium (from customer's premium group)
Buy Rate  = MCX Live - prem_buy_premium
Total Cost = Rate × Quantity × com_weight
Margin = Total Cost × (margin_value / 100)  OR  flat per unit
```

### Rate Delivery Methods
| Type | Method |
|---|---|
| `0` | HTTP Polling (POST every 1s) |
| `1` | Encrypted HTTP (legacy) |
| `2` | **WebSocket** (Socket.IO `rateUpdate` — production) |

---

## Key Business Rules

| Rule | Detail |
|---|---|
| **book_type** | 0=Buy (customer buys FROM company), 1=Sell (counterintuitive!) |
| **Gold weight** | Stored in KG, displayed in Grams |
| **Rate validation** | Server does NOT re-validate rate on order submission — client rate trusted ⚠️ |
| **Sell roundoff** | Ceiling (round UP) |
| **Buy roundoff** | Floor (round DOWN) |
| **Purity** | ÷0.995 applied BEFORE roundoff |
| **GST** | 3% for gold, 5% for silver (configurable) |
| **market_status** | 0=OPEN, 1=CLOSED (counterintuitive!) |

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
