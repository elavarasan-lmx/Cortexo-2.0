# Mobile Trade API Module Brain (Artifact M-MOBILE-TRADEAPI)

> Comprehensive documentation for Mobile Trade API.
> Controller: `C_tradeapi.php`
> Status: **DOCUMENTED** | Last Updated: 2026-05-14

---

## Overview

The Mobile Trade API module provides lightweight trade operations for the mobile application. Smaller than C_mobileclienttrade, focused on core trading.

---

## Files

| File | Path | Purpose |
|------|------|---------|
| Controller | `mobileapi/application/controllers/C_tradeapi.php` | Trade API |

---

## Controller Methods

### `__construct()`
- **Note**: **NO AUTH CHECK** — Security Issue (SEC-004)

### Trade Operations

#### `gettodaytrade_get()`
- **Route**: GET `/mobileapi/trade/today`
- **Purpose**: Get today's trades

#### `gettodaytradebydate_get()`
- **Route**: GET `/mobileapi/trade/by-date`
- **Purpose**: Get trades by specific date
- **Params**: date (optional)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `dt_booking` | Trade bookings |
| `dt_customer` | Customer info |

---

## API Response Format

```json
{
  "status": true,
  "data": [ ... ],
  "message": "Success"
}
```

---

## Security Issues — CRITICAL

| Issue | Severity | Status |
|-------|----------|--------|
| **No auth in __construct** | P0 | ⚠️ ENDPOINTS EXPOSED |
| No token validation | P0 | Add token check |

---

## Fix Required

```php
class C_tradeapi extends REST_Controller {
    function __construct() {
        parent::__construct();
        
        // ADD AUTH CHECK
        $token = $this->input->post('token') ?: $this->input->get('token');
        if (!$this->verify_token($token)) {
            $this->response(['status' => FALSE, 'message' => 'Unauthorized'], 401);
            exit;
        }
    }
}
```

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| C_mobileclienttrade | Full-featured version |
| C_mobileadmintrade | Admin mobile API |

---

## Next Steps

1. ✅ Document created
2. ☐ **FIX**: Add auth to __construct

---

*Part of Winbull Brain*