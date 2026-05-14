# Email Settings Module Brain (Artifact M-EMAIL)

> Comprehensive documentation for Email Settings module.
> Controller: `C_email_settings.php` | Model: `Email_settings_model.php`
> Status: **DOCUMENTED** | Last Updated: 2026-05-14

---

## Overview

The Email Settings module handles admin configuration of email templates, SMTP settings, and notification preferences.

---

## Files

| File | Path | Purpose |
|------|------|---------|
| Controller | `application/controllers/C_email_settings.php` | Email config handling |
| Model | `application/models/Email_settings_model.php` | Database operations |

---

## Controller Methods

### `index()`
- **Route**: `/C_email_settings/index`
- **Purpose**: Show email settings list

### `open_listingform()`
- **Route**: `/C_email_settings/open_listingform`
- **Purpose**: Display email templates list

### `open_entry_form($model_name, $type, $id)`
- **Route**: `/C_email_settings/open_entry_form/{id}`
- **Purpose**: Add/Edit email template form

### `DB_Controller($model_name, $status, $id)`
- **Route**: POST `/C_email_settings/DB_Controller`
- **Purpose**: Save email settings

---

## Database Tables

### Primary Table: `dt_email_settings`
```sql
CREATE TABLE dt_email_settings (
    email_id INT PRIMARY KEY AUTO_INCREMENT,
    email_type VARCHAR(50),  -- booking_confirmation, order_status, etc.
    email_subject VARCHAR(255),
    email_body TEXT,
    email_from VARCHAR(100),
    email_from_name VARCHAR(100),
    is_active ENUM('yes','no'),
    created_at DATETIME,
    updated_at DATETIME
);
```

### SMTP Config Table: `dt_smtp_config`
```sql
CREATE TABLE dt_smtp_config (
    smtp_id INT PRIMARY KEY AUTO_INCREMENT,
    smtp_host VARCHAR(100),
    smtp_port INT,
    smtp_user VARCHAR(100),
    smtp_pass VARCHAR(255),  -- encrypted
    smtp_from VARCHAR(100),
    smtp_from_name VARCHAR(100),
    is_default ENUM('yes','no')
);
```

---

## Email Types

| Type | Purpose | Trigger |
|------|---------|---------|
| `booking_confirmation` | Booking created | On booking save |
| `order_status` | Order status change | On status update |
| `payment_received` | Payment confirmation | On payment |
| `delivery_scheduled` | Delivery details | On delivery |
| `kyc_approved` | KYC verified | On KYC approval |
| `limit_alert` | Limit threshold | On margin check |

---

## Transaction Pattern

```php
$this->db->trans_begin();

$email_id = $this->Email_settings_model->save($data);

if ($this->db->trans_status() === TRUE) {
    $this->db->trans_commit();
} else {
    $this->db->trans_rollback();
}
```

**Note**: Uses correct transaction pattern.

---

## Security Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Raw `$_POST` | P0 | ⚠️ Fix: `$this->input->post()` |
| Raw `$_GET` in open_entry_form | P2 | ⚠️ Fix: `$this->input->get()` |

---

## Bug Patterns

- **SYS-001**: Raw POST without sanitization → Fix: `$this->input->post()`
- **SEC-005**: Debug echo in controller → Remove or use log_message()

---

## Next Steps

1. ✅ Document created
2. ☐ Fix raw POST/GET usage
3. ☐ Add email template validation

---

*Part of Winbull Brain*