# 📦 Module Registry — WinBull Trade

> Consolidated from 282 module memory files | Last Updated: 2026-05-01
> **82 modules across 6 layers**

---

## Summary

| Layer | Controllers | Models | Lines | Key Modules |
|---|---|---|---|---|
| Admin | 54 | 57 | ~66,000 | booking, customerDelivery, marginmanagement, userregistration |
| Customer Portal | 10 | 11 | ~11,000 | C_client_main (894L), C_booking, C_trade |
| Mobile API | 4 | 4 | ~7,000 | C_mobileclient (1200L), C_mobileclienttrade (1500L) |
| Ionic App | 44 pages | — | ~8,000 | booking, login, home, registration |
| Public API | 23 files | — | ~1,500 | apirate, rates, get_rpanel_rates |
| Socket/Lumen | 6+ | — | ~2,000 | lmxtradewinlitesocket.js, rate push scripts |

---

## Admin Modules (54 controllers)

| # | Module | Lines | Risk | Bugs | Purpose |
|---|---|---|---|---|---|
| 1 | **booking** | 602 | 9/10 | 13 | Core trading — buy/sell orders, limit orders, margin, settlements |
| 2 | **customerDelivery** | 911 | 9/10 | 30 | Full delivery lifecycle — pending → physical delivery → invoice |
| 3 | **admin_unfix** | 186 | 9/10 | 16 | Unfix payments — reverse commodity positions |
| 4 | **main** | 302 | 9/10 | 15 | Dashboard, login/logout, session management |
| 5 | **client_main** | 894 | 9/10 | 28 | Customer portal — login, booking, rates, quotations |
| 6 | **userregistration** | 384 | 8/10 | 5 | Customer registration, KYC, activation |
| 7 | **premiumgroup** | 113 | 8/10 | 10 | Premium groups (buy/sell discount per commodity) |
| 8 | **adminuser** | 113 | 7/10 | 8 | Admin user management + per-menu permissions |
| 9 | **marginmanagement** | 167 | 6/10 | 5 | Customer margin accounts |
| 10 | **generalsettings** | 54 | 6/10 | 7 | System-wide config (trade ON/OFF, qty limits) |
| 11 | **phonebooking** | 129 | 5/10 | 7 | Admin places orders on behalf of customer |
| 12 | **commodity_master** | 419 | — | 3 | Commodity CRUD (gold, silver variants) |
| 13 | **contractsymbol** | 279 | 2/10 | 4 | MCX contract symbol mapping |
| 14 | **rpanelcommodity** | 222 | — | 3 | R-Panel commodity configuration |
| 15 | **rpanelbank** | 306 | — | 2 | Bank rate contracts |
| 16 | **rpanel** | 52 | 3/10 | 2 | Live rate panel display |
| 17 | **customergroup** | 127 | 3/10 | 4 | Customer group assignments |
| 18 | **customerservice** | 138 | — | 24 | Newsletter/SMS group management |
| 19 | **com_group** | 122 | 3/10 | 4 | Commodity group CRUD |
| 20 | **commoditygroupcustomer** | 138 | 3/10 | 5 | Customer-commodity group mapping |
| 21-54 | Other modules | varies | 2-4/10 | 0-5 | Standard CRUD (news, gallery, popup, SMS, email, etc.) |

### Critical Shared Files

| File | Lines | Size | Why Dangerous |
|---|---|---|---|
| `trading_helper.php` | 4,531 | 231KB | Core engine — booking, margin, hedge, rate, ALL orders |
| `phone_booking.php` | ~3,200 | 128KB | Phone booking monolith — every IF branch matters |
| `Booking_model.php` (web) | ~984 | 51KB | 47 raw SQL queries! |
| `Customerdelivery_model.php` | — | 81KB | Largest model file |
| `Userregistration_model.php` | — | 60KB | Registration + KYC logic |

---

## Customer Portal Modules (10 controllers)

| # | Module | Lines | Purpose |
|---|---|---|---|
| 1 | **C_client_main** | 864 | All portal logic — login, auth, booking, CMS, quotation, OTP |
| 2 | **C_sendorderstatus** | 630 | Order SMS notifications (⚠️ NO AUTH!) |
| 3 | **C_mobile** | 605 | Mobile-specific portal endpoints |
| 4 | **C_kyc** | 217 | KYC upload (⚠️ NO AUTH + raw $_POST!) |
| 5 | **C_trade** | 202 | Trade history and reports |
| 6 | **C_booking** | 189 | Customer booking interface |
| 7 | **C_ajax** | 175 | AJAX endpoints |
| 8 | **C_userregistration** | 98 | Registration form |
| 9 | **C_email_settings** | 72 | Email config |
| 10 | **C_rates** | 101 | Rate display |

---

## Mobile API (4 controllers — ALL ZERO AUTH)

| # | Module | Lines | Purpose |
|---|---|---|---|
| 1 | **C_mobileclienttrade** | ~1,500 | Trading operations — buy/sell/limit/cancel |
| 2 | **C_mobileclient** | ~1,200 | Customer ops — login/register/KYC/alerts |
| 3 | **C_mobileadmintrade** | ~800 | Admin mobile — confirm orders/manage margin |
| 4 | **C_tradeapi** | ~400 | Public trade API |

---

## API Endpoint Map

### Admin Panel — 54 Controllers
URL Pattern: `/admin/C_modulename/method`
- CRUD: `index` (listing), `add` (form), `save`, `edit`, `update`, `delete`
- Special: `C_booking/confirmation`, `C_phonebooking/phone_booking_view`
- Reports: `C_booking_report/index`, `C_ratealert_report/index`

### Customer Portal — 10 Controllers
URL Pattern: `/C_modulename/method`
- Auth: `C_client_main/login_validation`, `C_client_main/logout`
- Trading: `C_booking/booking`, `C_rates/index`
- KYC: `C_kyc/upload_document`

### Mobile API — REST (Lumen)
URL Pattern: `POST /mobileapi/C_modulename/method`
- Auth: `C_mobileclient/login_post`, `C_mobileclient/register_post`
- Trade: `C_mobileclienttrade/placeOrder_post`, `confirmOrder_post`
- Data: `C_mobileclienttrade/commodityList_get`, `orderHistory_get`

### Public API (Raw PHP)
URL Pattern: `/api/filename.php`
- Rates: `apirate.php`, `rates.php`, `get_rpanel_rates.php`
- Info: `bankdetails.php`, `contactusdetails.php`, `getsettings.php`

---

## Module Dependencies

```
trading_helper.php (4531L) ← Used by: C_booking, C_phonebooking, C_customerDelivery, C_admin_unfix
    ↓
Booking_model.php ← Used by: C_booking (admin + web), C_phonebooking
    ↓
Customerdelivery_model.php ← Used by: C_customerDelivery
    ↓
Marginmanagement_model.php ← Used by: C_marginmanagement, C_booking (margin check)
    ↓
General_model.php ← Used by: Most controllers (shared CRUD helper)
```

### Shared JS Files (change = affects ALL modules)
- `General.js` — `showToast()`, `showConfirmModal()`, `validateForm()`
- `common.js` — Rate conversion functions (shared admin + web)
- `lmx.js` — DataTable helpers, filter logic
- `booking.js` — Client booking rate display
- `liverate.js` — Lightstreamer subscription
