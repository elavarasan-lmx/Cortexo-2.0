# Trade Module Brain (Artifact M-TRADE)

> Comprehensive documentation for Trading module.
> Controller: `C_trade.php` | Model: `Trade_model.php`
> Status: **DOCUMENTED** | Last Updated: 2026-05-14

---

## Overview

The Trade module handles all trading operations including booking requests, order management, limit orders, and delivery processing. This is the core revenue-generating module.

---

## Files

| File | Path | Purpose |
|------|------|---------|
| Controller | `application/controllers/C_trade.php` | Trade operations |
| Model | `application/models/Trade_model.php` | Database operations |
| View | Multiple views | Trade UI |

---

## Controller Methods

### `booking_request()`
- **Route**: POST `/C_trade/booking_request`
- **Purpose**: Submit new booking
- **Process**: Validates input, calculates margin, creates booking record

### `booking_request_update()`
- **Route**: POST `/C_trade/booking_request_update`
- **Purpose**: Update existing booking (activate/deactivate)
- **Params**: booking ID, status

### `booking_request_cancel()`
- **Route**: POST `/C_trade/booking_request_cancel`
- **Purpose**: Cancel a booking
- **Process**: Reverse all related transactions

### `notifyBooking()`
- **Purpose**: Send booking notifications (SMS/Email)

### `get_tradingdatas()`
- **Route**: AJAX `/C_trade/get_tradingdatas`
- **Purpose**: Get live trading data

### `load_pendingorders()`
- **Purpose**: Load pending order list

### `viewreport()`
- **Route**: `/C_trade/viewreport`
- **Purpose**: Trade reporting view

### `get_booking_report($model_name, $type, $fromdate, $todate, $comType)`
- **Purpose**: Generate booking reports

### `pendingdelv_report($model_name, $type, $fromdate, $todate, $comType)`
- **Purpose**: Pending delivery report

### `get_pending_order($model_name, $type, $code, $fromdate, $todate, $comType)`
- **Purpose**: Get pending orders filtered

### `get_clientlimit($model_name, $code)`
- **Purpose**: Get customer's trading limit

### `get_customertransactions()`
- **Purpose**: Get customer transaction history

---

## Database Tables

### Primary Table: `dt_booking`
```sql
CREATE TABLE dt_booking (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    book_no VARCHAR(50) UNIQUE,
    book_date DATETIME,
    cus_id INT,
    com_id INT,
    book_type ENUM('buy','sell','limit'),
    book_qty DECIMAL(10,3),
    book_rate DECIMAL(12,2),
    book_amount DECIMAL(15,2),
    book_margin DECIMAL(12,2),
    book_status ENUM('pending','confirmed','cancelled','delivered'),
    created_at DATETIME,
    updated_at DATETIME
);
```

### Related Tables
- `dt_customer` — Customer info
- `dt_com_master` — Commodity info
- `dt_prem_group_master` — Premium groups

---

## Booking Types

| Type | Description | Flow |
|------|-------------|------|
| `buy` | Buy order at market rate | Immediate execution |
| `sell` | Sell order at market rate | Immediate execution |
| `limit` | Limit order at specified rate | Execute when rate matches |

---

## Transaction Flow

```php
$this->db->trans_begin();

$book_id = $this->Trade_model->insert_booking($data);

if ($this->db->trans_status() === TRUE) {
    $this->db->trans_commit();
    // Update customer limit, send notifications
} else {
    $this->db->trans_rollback();
}
```

---

## Margin Calculation

```php
$margin = $booking_amount * $margin_percentage;

// From brain/12_business_rules.md:
// margin = total_amount * 0.10 (10% default)
// Minimum margin: Rs 1000
```

---

## API Endpoints (Mobile)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/mobileapi/booking` | Create booking |
| GET | `/mobileapi/orders` | List orders |
| POST | `/mobileapi/cancel` | Cancel order |

---

## Security Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Raw `$_POST` usage | P0 | Fix: `$this->input->post()` |
| Raw `$_GET` usage | P1 | Fix: `$this->input->get()` |
| Transaction without status check | P1 | Check in each method |

---

## Bug Patterns (from Brain)

- **BIZ-001**: JS vs PHP calc mismatch → Check if margin calc differs
- **BIZ-002**: Rate not re-validated → Ensure server re-fetches rate
- **SYS-001**: Raw POST → Replace with `$this->input->post()`

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| Login | Customer authentication |
| Booking | Related to Trade |
| Rate Engine | Live rates for execution |
| Admin | Order confirmation |

---

## Validation Rules

```php
$this->form_validation->set_rules('book_qty', 'Quantity', 'required|greater_than[0]');
$this->form_validation->set_rules('book_rate', 'Rate', 'required|greater_than[0]');
$this->form_validation->set_rules('com_id', 'Commodity', 'required');
```

---

## Status Flow

```
pending → confirmed → delivered
    ↓
cancelled
```

---

## Next Steps

1. ✅ Document created (this file)
2. ☐ Fix raw POST in controller
3. ☐ Verify margin calculation matches spec

---

*Part of Winbull Brain — See 0_session_start.md for full index*