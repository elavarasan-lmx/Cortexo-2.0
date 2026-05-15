# User Registration Module Brain (Artifact M-REGISTER)

> Comprehensive documentation for User Registration module.
> Controller: `C_userregistration.php` | Model: `Userregistration_model.php`
> Status: **DOCUMENTED** | Last Updated: 2026-05-14

---

## Overview

The User Registration module handles customer registration, OTP verification, email confirmation, and account activation.

---

## Files

| File | Path | Purpose |
|------|------|---------|
| Controller | `application/controllers/C_userregistration.php` | Registration handling |
| Model | `application/models/Userregistration_model.php` | Database operations |

---

## Controller Methods

### `index()`
- **Route**: `/C_userregistration/index`
- **Purpose**: Registration form display

### `open_listingform($db_error_msg)`
- **Route**: `/C_userregistration/open_listingform`
- **Purpose**: List registered users

### `open_entryform($model_name, $type, $id, $error)`
- **Route**: `/C_userregistration/open_entryform/{id}`
- **Purpose**: Registration form (add/edit)

### `open_activateentryform($model_name, $id)`
- **Purpose**: Activate/deactivate user

### `feedback($model_name)`
- **Purpose**: User feedback collection

### `check_captcha()`
- **Purpose**: CAPTCHA validation

### `send_emailtoclient()`
- **Purpose**: Send confirmation email

### `customer_confirmation($id, $con_id)`
- **Purpose**: Email confirmation link handler

### `chech_email()` / `chech_phoneno()`
- **Purpose**: Duplicate check (email/phone)

### `checkuserunique()`
- **Purpose**: Unique user validation

### `DB_Controller($status, $form_type)`
- **Route**: POST `/C_userregistration/DB_Controller`
- **Purpose**: Save registration data

### `generateOTP()`
- **Purpose**: Generate OTP for verification

### `validate_registration($data)`
- **Purpose**: Server-side validation

---

## Database Tables

### Primary Table: `dt_customer`
```sql
CREATE TABLE dt_customer (
    cus_id INT PRIMARY KEY AUTO_INCREMENT,
    cus_name VARCHAR(100),
    cus_email VARCHAR(100) UNIQUE,
    cus_mobile VARCHAR(15) UNIQUE,
    cus_password VARCHAR(255),  -- hashed
    cus_status ENUM('pending','active','inactive'),
    email_verified ENUM('yes','no'),
    mobile_verified ENUM('yes','no'),
    otp VARCHAR(10),
    otp_expires_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);
```

---

## Registration Flow

```
1. User fills form → open_entryform()
2. CAPTCHA check → check_captcha()
3. Email/Phone uniqueness → chech_email(), chech_phoneno()
4. Save to DB → DB_Controller()
5. Generate OTP → generateOTP()
6. Send confirmation email → send_emailtoclient()
7. User clicks link → customer_confirmation()
8. Account activated
```

---

## Transaction Pattern

```php
$this->db->trans_begin();

$cus_id = $this->Userregistration_model->insert($data);

if ($this->db->trans_status() === TRUE) {
    $this->db->trans_commit();
} else {
    $this->db->trans_rollback();
}
```

**Note**: Uses correct transaction pattern.

---

## OTP Verification

```php
// In generateOTP()
$otp = rand(100000, 999999);
$this->db->where('cus_id', $cus_id);
$this->db->update('dt_customer', ['otp' => $otp, 'otp_expires_at' => time() + 300]);
```

---

## Security Issues

| Issue | Severity | Status |
|-------|----------|--------|
| OTP `==` comparison | P0 | ⚠️ Use `===` |
| Raw `$_POST` | P0 | ⚠️ Use `$this->input->post()` |
| Password in plain text (potential) | P1 | Check hashing |
| No CSRF token | P1 | Add form token |

---

## Bug Patterns

- **SEC-002**: OTP `==` instead of `===` → Fix: strict comparison
- **SYS-001**: Raw POST → Replace with `$this->input->post()`

---

## Validation Rules

```php
$this->form_validation->set_rules('cus_name', 'Name', 'required');
$this->form_validation->set_rules('cus_email', 'Email', 'required|valid_email');
$this->form_validation->set_rules('cus_mobile', 'Mobile', 'required|regex_match[/^[0-9]{10}$/]');
$this->form_validation->set_rules('cus_password', 'Password', 'required|min_length[6]');
```

---

## Next Steps

1. ✅ Document created
2. ☐ Fix OTP loose comparison (SEC-002)
3. ☐ Add CSRF protection

---

*Part of Winbull Brain*