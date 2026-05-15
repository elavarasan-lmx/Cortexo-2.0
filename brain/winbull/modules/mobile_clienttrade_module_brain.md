# Mobile Client Trade Module Brain (Artifact M-MOBILE-CLIENT)

> Comprehensive documentation for Mobile Client Trade API.
> Controller: `C_mobileclienttrade.php`
> Status: **DOCUMENTED** | Last Updated: 2026-05-14

---

## Overview

The Mobile Client Trade module provides trade operations for mobile app customers. Handles booking, orders, reports, and profile management.

---

## Files

| File | Path | Purpose |
|------|------|---------|
| Controller | `mobileapi/application/controllers/C_mobileclienttrade.php` | Mobile trade API |
| Extends | `REST_Controller` | Base REST class |

---

## Controller Methods

### `__construct()`
- **Note**: **NO AUTH CHECK** — Security Issue (SEC-004)

### Trading Operations

#### `gettradecommodities_get()`
- **Route**: GET `/mobileapi/client/commodities`
- **Purpose**: Get available commodities for trading

#### `bookingRequest_post()`
- **Route**: POST `/mobileapi/client/booking`
- **Purpose**: Submit new booking
- **Process**: Validate input, calculate margin, create booking
- **Params**: com_id, book_type, book_qty, book_rate

#### `updatebookRequest_post()`
- **Purpose**: Update booking (modify quantity/rate)

#### `notifyBooking_post()`
- **Purpose**: Send booking notification

### Orders

#### `trade_summery_get()`
- **Route**: GET `/mobileapi/client/summary`
- **Purpose**: Get trade summary (today's trades)

#### `customerAllOpenorders_get()`
- **Route**: GET `/mobileapi/client/open-orders`
- **Purpose**: Get all pending orders

#### `customerOrderCancel_get()`
- **Route**: GET `/mobileapi/client/cancel-order`
- **Purpose**: Cancel order

### Reports

#### `booking_report_get()`
- **Route**: GET `/mobileapi/client/booking-report`
- **Purpose**: Booking history report

#### `order_report_get()`
- **Route**: GET `/mobileapi/client/order-report`
- **Purpose**: Order history report

#### `pendingdelv_report_get()`
- **Purpose**: Pending delivery report

#### `customer_transactions_get()`
- **Purpose**: Transaction history

### Account

#### `tradable_status_get()`
- **Purpose**: Check if customer can trade (KYC, margin)

#### `changePassword_post()`
- **Purpose**: Change password

#### `updateProfile_post()`
- **Purpose**: Update profile

#### `userdeviceregister_post()`
- **Purpose**: Register device for push notifications

#### `MobileMessages_get()`
- **Purpose**: Get mobile messages/notifications

---

## Database Tables

### Primary Tables
- `dt_booking` — Booking records
- `dt_customer` — Customer info
- `dt_com_master` — Commodities

---

## API Response Format

```json
{
  "status": true,
  "data": { ... },
  "message": "Success"
}
```

---

## Security Issues — CRITICAL

| Issue | Severity | Status |
|-------|----------|--------|
| **No auth in __construct** | P0 | ⚠️ ALL ENDPOINTS EXPOSED |
| Raw `$_POST` usage | P0 | Fix: `$this->input->post()` |
| OTP `==` comparison | P0 | Fix: `===` |
| No token validation | P0 | Add token check |

---

## Bug Patterns (from Brain)

- **SEC-004**: Mobile API missing auth → Add token verification
- **SEC-002**: OTP `==` → Use `===`
- **SYS-001**: Raw POST → Use `$this->input->post()`

---

## Fix Required

```php
class C_mobileclienttrade extends REST_Controller {
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

## Next Steps

1. ✅ Document created
2. ☐ **FIX IMMEDIATELY**: Add auth to __construct
3. ☐ Fix raw POST/GET usage
4. ☐ Add rate re-validation before booking

---

*Part of Winbull Brain*