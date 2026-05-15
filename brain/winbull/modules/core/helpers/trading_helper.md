# Trading Helper (CRITICAL - Cross-Module)

> File: `system/helpers/lmx/classes/trading_helper.php`
> Lines: **4,564** | ⚠️ **DANGEROUS FILE** 
> Used by: Web, Admin, Mobile
> Status: **DOCUMENTED** | Updated: 2026-05-14

---

## ⚠️ WARNING - DANGER ZONE

**This is a core trading engine file.** From brain/0_session_start.md:

| File | Why Dangerous |
|------|---------------|
| `system/application/helpers/trading_helper.php` | Core trading engine — 4,531 lines. One wrong line takes down ALL clients |

**NEVER modify this file without explicit approval.**

---

## Overview

The Trading class is the **core trading engine** used by all modules:
- Web bookings
- Admin order management  
- Mobile API trading
- Rate calculations

---

## Key Methods

### Margin & Calculation

| Method | Purpose |
|--------|---------|
| `calculate_margin()` | Calculate required margin |
| `get_margin_percentage()` | Get margin % from settings |
| `calculate_total_amount()` | Total = qty × rate |

### TDS/TCS (KNOWN BUG)

| Method | Issue |
|--------|-------|
| `get_tdsvalue()` | ❌ Reads `tcs_value` key instead of `tds_value` - BUG |
| `get_tcsvalue()` | Works correctly |

### Booking

| Method | Purpose |
|--------|---------|
| `create_booking()` | Insert new booking |
| `update_booking()` | Update booking status |
| `cancel_booking()` | Cancel order + reverse |

### Rate

| Method | Purpose |
|--------|---------|
| `get_live_rate()` | Fetch current rate |
| `apply_premium()` | Add MCX/bank premium |
| `convert_currency()` | Currency conversion |

---

## Tables Used

| Table | Purpose |
|-------|---------|
| `dt_booking` | Main booking table |
| `dt_customer` | Customer info |
| `dt_com_master` | Commodity master |
| `dt_prem_group_master` | Premium groups |

---

## Known Bugs

| Bug ID | Issue | Status |
|--------|-------|--------|
| BUG-TDS-001 | `get_tdsvalue()` reads wrong column | **OPEN** |
| BUG-RATE-001 | Rate not re-validated server-side | **OPEN** |

---

## Usage

```php
// Load in any controller
$this->load->helper('trading_helper');

$margin = calculate_margin($amount);
$booking_id = create_booking($data);
```

---

## Security Notes

| Issue | Severity | Status |
|-------|----------|--------|
| 4,564 lines of core logic | P0 | ⚠️ High risk |
| Used by ALL modules | P0 | If broken = entire platform down |
| TDS bug | P1 | Wrong tax calculation |

---

*Part of Core Module - See 0_session_start.md for danger zones*