# Order Status Module Brain (Artifact M-ORDER)

> Comprehensive documentation for Order Status module.
> Controller: `C_sendorderstatus.php` | Model: `Adminlog_model.php`
> Status: **DOCUMENTED** | Last Updated: 2026-05-14

---

## Overview

The Order Status module handles sending rate alerts, order status notifications, limit order expiry, and trade on/off controls.

---

## Files

| File | Path | Purpose |
|------|------|---------|
| Controller | `application/controllers/C_sendorderstatus.php` | Order notifications |
| Model | `application/models/Adminlog_model.php` | Audit logging |

---

## Controller Methods

### `send_ratealertStatus()`
- **Route**: `/C_sendorderstatus/send_ratealertStatus`
- **Purpose**: Send rate alert notifications to customers
- **Process**: Query customers with active rate alerts, send SMS/Email

### `send_orderStatus()`
- **Route**: `/C_sendorderstatus/send_orderStatus`
- **Purpose**: Send order status updates
- **Process**: Check order status changes, notify customers
- **Note**: Largest method (500+ lines)

### `limit_expire()`
- **Route**: `/C_sendorderstatus/limit_expire`
- **Purpose**: Process expired limit orders
- **Process**: Find expired limits, update status, notify users
- **Logged**: `log_admin_add('Limit Expire', ...)`

### `update_tradeonoff()`
- **Purpose**: Enable/disable trading for specific customers
- **Trigger**: Admin action or system event

---

## Database Tables

### Primary Table: `dt_booking`
```sql
SELECT * FROM dt_booking 
WHERE book_type = 'limit' 
AND book_status = 'pending'
AND book_rate <= NOW();  -- expired
```

### Admin Log Table: `dt_admin_log`
```sql
CREATE TABLE dt_admin_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    log_action VARCHAR(100),
    log_module VARCHAR(50),
    log_data TEXT,
    log_admin_id INT,
    created_at DATETIME
);
```

---

## Status Notification Types

| Type | Channel | Trigger |
|------|---------|---------|
| Rate Alert | SMS, Push | Market rate matches target |
| Order Confirmed | SMS, Email | Admin confirms |
| Order Delivered | SMS, Email | Delivery scheduled |
| Limit Expiring | SMS | 24h before expiry |
| Margin Call | SMS, Push | Margin < threshold |

---

## Transaction Pattern

```php
// In send_orderStatus() - has N+1 query issues
foreach ($execOrders as $orders) {
    // Query inside loop - ARCH-001 pattern
    $details = $this->db->get_where('dt_booking', ...);
}
```

**Issue**: N+1 query pattern detected

---

## Security Issues

| Issue | Severity | Status |
|-------|----------|--------|
| N+1 queries in loop | P2 | Optimize with batch query |
| Raw `$_POST` in limit_expire | P1 | Use `$this->input->post()` |

---

## Bug Patterns

- **ARCH-001**: N+1 query in foreach → Use batch query with where_in()
- **SYS-001**: Raw POST → Replace with `$this->input->post()`

---

## Rate Alert Flow

```
1. Customer sets rate alert (mobile/web)
2. Rate engine broadcasts live rates
3. send_ratealertStatus() checks matches
4. Send notification (Twilio SMS / SendGrid Email)
5. Log action in dt_admin_log
```

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| Trade | Order data source |
| Rate Engine | Live rates for alerts |
| Admin Panel | Manual overrides |

---

## Next Steps

1. ✅ Document created
2. ☐ Fix N+1 queries in send_orderStatus()
3. ☐ Add rate alert batch processing

---

*Part of Winbull Brain*