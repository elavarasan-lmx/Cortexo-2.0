# Login Model (Cross-Module - SHARED)

> File: `application/models/Login_model.php`
> Used by: Web (C_ajax, C_userregistration, C_mobile, C_client_main)
> Status: **DOCUMENTED** | Updated: 2026-05-14

---

## Overview

**Login_model** handles authentication and session management. Used by 4 different controllers.

---

## Used By (Cross-Module)

| Module | Controller | Usage |
|--------|------------|-------|
| Web | `C_client_main.php` | Customer login |
| Web | `C_ajax.php` | Session validation |
| Web | `C_userregistration.php` | Registration |
| Web | `C_mobile.php` | Mobile login |

---

## Key Methods

### Authentication

| Method | Purpose |
|--------|---------|
| `validate_login()` | Verify credentials |
| `check_password()` | Password verification |
| `generate_token()` | Session token |

### Session Management

| Method | Purpose |
|--------|---------|
| `create_session()` | Start session |
| `destroy_session()` | Logout |
| `get_session_data()` | Get session vars |
| `check_to_clear_session()` | Session expiry check |

### Customer

| Method | Purpose |
|--------|---------|
| `get_customer_by_id()` | Get customer |
| `get_booking()` | Check booking status |

---

## Database Table: `dt_customer`

```sql
cus_id          INT PRIMARY KEY
cus_name         VARCHAR(100)
cus_email        VARCHAR(100) UNIQUE
cus_mobile       VARCHAR(15) UNIQUE
cus_password     VARCHAR(255) -- hashed
cus_status       ENUM('active','inactive','pending')
created_at      DATETIME
updated_at      DATETIME
```

---

## Security Issues

| Bug ID | Issue | Severity |
|--------|-------|----------|
| SEC-002 | OTP `==` comparison (in related code) | P0 |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| Booking | Customer must be active |
| Trade | Trading allowed for active customers |
| KYC | KYC status affects login |

---

*Part of Core Module - Shared Models*