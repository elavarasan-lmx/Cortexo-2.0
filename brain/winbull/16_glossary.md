# Winbull — Domain Glossary (Brain Artifact 16)

> 40 business and system terms used across the codebase.
> When user asks "what is X?" for any trading/business term → check here first.

---

## Trading Terms

| Term | Meaning |
|------|---------|
| **MCX** | Multi Commodity Exchange — India's commodity exchange |
| **Spot Rate** | Current market price (SPOT-GOLD, SPOT-SILVER, SPOT-INR) |
| **Bid/Ask** | Bid = buyer offers, Ask = seller offers. Spread = Ask - Bid |
| **Premium** | Extra charge added to base rate per commodity group |
| **Purity** | Gold purity factor (e.g., 0.995 = 99.5% pure) |
| **Lot Size** | Minimum tradeable quantity per commodity |
| **Market Order** | Execute immediately at current price |
| **Limit Order** | Execute when price reaches customer's target |
| **Hedge** | Offsetting trade on MCX via Motilal Oswal API |
| **Unfix** | Reverse/cancel a confirmed booking |

---

## Rate Terms

| Term | Meaning |
|------|---------|
| **R-Panel** | Rate Panel — admin controls which commodities are tradeable |
| **rpsg** | Rate Panel Spot Gold — gold rate config |
| **rpss** | Rate Panel Spot Silver — silver rate config |
| **rpsg_roundoff** | Gold rounding precision (e.g., 0.05) |
| **Bank Rate** | Manually entered rate by admin (vs MCX live rate) |
| **Rate Alert** | Customer sets target price → SMS when reached |
| **Lightstreamer** | External service providing real-time MCX rate feed |

---

## Financial Terms

| Term | Meaning |
|------|---------|
| **Margin** | Deposit customer puts up before trading |
| **Available Balance** | Total margin - locked margins from pending orders |
| **TCS** | Tax Collected at Source (Indian tax on seller) |
| **TDS** | Tax Deducted at Source (Indian tax on buyer) |
| **GST** | Goods & Services Tax (Indian) |
| **Octroi** | Municipal tax on goods entering a city |
| **Stamp Duty** | Tax on transaction documents |

---

## Customer Terms

| Term | Meaning |
|------|---------|
| **KYC** | Know Your Customer — identity verification (Aadhaar, PAN) |
| **cus_id** | Customer primary key in `dt_customer` |
| **book_type** | `0` = Buy (customer buys FROM company), `1` = Sell (customer sells TO company) ⚠️ counterintuitive |
| **cus_type** | `0` = buy+sell, `1` = buy only, `2` = sell only |
| **Premium Group** | Customer's assigned price group (determines premium markup) |
| **Commodity Group** | Which commodities a customer can trade |

---

## System Terms

| Term | Meaning |
|------|---------|
| **Globals** | `global_configs.php` — per-client configuration class |
| **`$client`** | Client identifier (e.g., `lmxtrade`) — Redis prefix + socket channel |
| **Menu Code** | Integer ID for each admin module — used in permission table |
| **DB_Controller** | CI routing pattern: `/C_module/DB_Controller/model_name/action/id` |
| **Flashdata** | CI session flash message — shown once after redirect |
| **General.js** | Admin JS library — `showToast()`, `showConfirmModal()`, `validateForm()` |

---

## File Naming Conventions

| Pattern | Example | Meaning |
|---------|---------|---------|
| `C_*.php` | `C_booking.php` | Controller |
| `*_model.php` | `Booking_model.php` | Model |
| `*_listing.php` | `booking_listing.php` | DataTable view |
| `*_entry.php` | `booking_entry.php` | Form view |
| `dt_*` | `dt_booking` | Database table |

---

## Key DB Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `dt_customer` | Customer master |
| `dt_booking` | All booking/order records |
| `dt_generalsettings` | Admin general settings (single row) |
| `dt_commodity` | Commodity master |
| `dt_prem_group` | Premium group definitions |
| `dt_commodity_group` | Commodity groups |
| `dt_rpanel` | Rate panel settings |
| `dt_margin` | Customer margin balances |
| `admin_log` | Audit log for all admin actions |
