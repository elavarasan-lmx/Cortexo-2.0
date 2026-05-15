# Booking Model (Cross-Module - SHARED)

> File: `application/models/Booking_model.php`
> Used by: Web (C_booking, C_ajax, C_sendorderstatus, C_client_main)
> Status: **DOCUMENTED** | Updated: 2026-05-14

---

## Overview

**Booking_model** is the **most used shared model** in the entire platform. Used by 4 different controllers across web and admin.

---

## Used By (Cross-Module)

| Module | Controller | Usage |
|--------|------------|-------|
| Web | `C_booking.php` | Main booking |
| Web | `C_ajax.php` | AJAX operations |
| Web | `C_sendorderstatus.php` | Order status |
| Web | `C_client_main.php` | Customer dashboard |
| Admin | `C_booking.php` | Admin booking management |

---

## Key Methods

### CRUD Operations

| Method | Purpose |
|--------|---------|
| `insert_booking()` | Create new booking |
| `update_booking()` | Update booking details |
| `delete_booking()` | Soft delete |
| `get_booking_by_id()` | Get single booking |

### Query Methods

| Method | Purpose |
|--------|---------|
| `get_all_bookings()` | List all |
| `get_pending_orders()` | Pending order list |
| `get_confirmed_orders()` | Confirmed list |
| `get_customer_bookings()` | By customer ID |
| `get_booking_report()` | Report generation |

### Calculations

| Method | Purpose |
|--------|---------|
| `calculate_margin()` | Margin calculation |
| `calculate_total()` | Total amount |

---

## Database Table: `dt_booking`

```sql
book_id         INT PRIMARY KEY
book_no         VARCHAR(50) UNIQUE
book_date       DATETIME
cus_id          INT (FK)
com_id          INT (FK)
book_type       ENUM('buy','sell','limit')
book_qty        DECIMAL(10,3)
book_rate       DECIMAL(12,2)
book_amount     DECIMAL(15,2)
book_margin     DECIMAL(12,2)
book_status     ENUM('pending','confirmed','cancelled','delivered')
created_at      DATETIME
updated_at      DATETIME
```

---

## Bugs Found

| Bug ID | Issue | Severity |
|--------|-------|----------|
| ARCH-001 | N+1 query potential in loops | P2 |
| BIZ-001 | JS calc may differ from PHP | P1 |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| Trade | Uses Booking_model |
| Login | Customer validation |
| Rate Engine | Live rates for booking |

---

*Part of Core Module - Shared Models*