# KYC Module Brain (Artifact M-KYC)

> Comprehensive documentation for KYC (Know Your Customer) module.
> Controller: `C_kyc.php` | Model: `KYC_model.php`
> Status: **DOCUMENTED** | Last Updated: 2026-05-14

---

## Overview

The KYC module handles customer verification and compliance data collection. Critical for regulatory compliance (SEBI, RBI guidelines).

---

## Files

| File | Path | Purpose |
|------|------|---------|
| Controller | `application/controllers/C_kyc.php` | KYC form handling |
| Model | `application/models/KYC_model.php` | Database operations |
| View | `application/views/kyc.php` | KYC form UI |

---

## Controller Methods

### `index()`
- **Route**: `/C_kyc/index` or `/kyc`
- **Purpose**: Display KYC form
- **Access**: Public (no auth required)
- **Loads**: header, kyc, footer views

### `DB_Controller()`
- **Route**: POST `/C_kyc/DB_Controller`
- **Purpose**: Process KYC form submission
- **Process**:
  1. Validate CAPTCHA (`$_POST['answer']` vs `$_SESSION['6_letters_code']`)
  2. Load KYC_model
  3. Begin transaction: `$this->db->trans_begin()`
  4. Insert record: `$this->$model_name->insert_record()`
  5. Check status: `$this->db->trans_status() === TRUE`
  6. Commit or rollback

---

## KYC Form Fields

| Field | Database Column | Validation | Required |
|-------|----------------|------------|----------|
| Company Name | `cus_company_name` | Required | Yes |
| Address | `cus_address` | Required | Yes |
| Proprietor Name | `cus_name1` | Required | Yes |
| Mobile | `cus_mobile1` | Required, 10 digits | Yes |
| Office Phone | `cus_phone1` | Optional | No |
| Email | `cus_email` | Required, valid email | Yes |
| Bank Name | `cus_bnkname` | Required | Yes |
| Branch | `cus_branch` | Required | Yes |
| Account No | `cus_accno` | Required | Yes |
| IFSC Code | `ifsccode` | Required | Yes |
| TAN No | `cus_tin_no` | Required | Yes |
| PAN No | `cus_panno` | Required | Yes |
| Address Proof | `addr_proof` | File upload | Yes |
| PAN Copy | `panno_copy` | File upload | Yes |
| TAN Copy | `tinno_copy` | File upload | Yes |
| Deed Copy | `deed_copy` | File upload (Partnership) | Conditional |

---

## Database Tables

### Primary Table: `dt_kyc`
```sql
CREATE TABLE dt_kyc (
    kyc_id INT PRIMARY KEY AUTO_INCREMENT,
    cus_id INT,  -- FK to dt_customer
    cus_company_name VARCHAR(255),
    cus_name1 VARCHAR(100),
    cus_name2 VARCHAR(100),
    cus_address TEXT,
    cus_mobile1 VARCHAR(15),
    cus_mobile2 VARCHAR(15),
    cus_phone1 VARCHAR(15),
    cus_phone2 VARCHAR(15),
    cus_email VARCHAR(100),
    cus_bnkname VARCHAR(100),
    cus_branch VARCHAR(100),
    cus_accno VARCHAR(50),
    ifsccode VARCHAR(20),
    cus_tin_no VARCHAR(50),
    cus_panno VARCHAR(20),
    cus_aadhar varchar(20),
    addr_proof VARCHAR(255),  -- file path
    panno_copy VARCHAR(255),
    tinno_copy VARCHAR(255),
    deed_copy VARCHAR(255),
    kyc_status ENUM('pending','approved','rejected'),
    created_at DATETIME,
    updated_at DATETIME
);
```

---

## Transaction Pattern

```php
$this->db->trans_begin();

$kyc_id = $this->KYC_model->insert_record();

if ($this->db->trans_status() === TRUE) {
    $this->db->trans_commit();
    // Success
} else {
    $this->db->trans_rollback();
    // Failure
}
```

**Note**: Uses CodeIgniter transactions correctly — checks `trans_status()` before commit.

---

## Validation Rules

### Server-Side (CodeIgniter Form Validation)
```php
$this->form_validation->set_rules('fv[cus_company_name]', 'Company Name', 'required');
$this->form_validation->set_rules('fv[cus_address]', 'Address', 'required');
$this->form_validation->set_rules('fv[cus_email]', 'Email', 'required|valid_email');
$this->form_validation->set_rules('fv[cus_panno]', 'Pan No', 'required');
$this->form_validation->set_rules('fv[ifsccode]', 'Bank IFSC', 'required');
```

### Client-Side
- CAPTCHA verification (6 letters)
- File type validation for uploads (PDF, JPG, PNG only)
- Max file size: 2MB per document

---

## KYC Status Flow

```
New Submission → Pending → [Admin Review] → Approved/Rejected
                                      ↓
                               Rejection Reason
```

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `pending` | Submitted, awaiting review | Admin reviews |
| `approved` | KYC verified | Customer can trade |
| `rejected` | Documents invalid | Customer resubmits |

---

## Security Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| Raw `$_POST` usage | P0 | ⚠️ Use `$this->input->post()` |
| Raw `$_SESSION` usage | P1 | ⚠️ Use `$this->session` |
| No CSRF token on form | P1 | Needs implementation |
| File upload validation | P2 | Check file types |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| Customer | KYC linked to `dt_customer.cus_id` |
| Booking | KYC must be approved before booking |
| Admin Panel | KYC review in admin interface |

---

## Bug Patterns (from Brain Artifact 11)

- **SYS-001**: Raw `$_POST` without sanitization → Fix: `$this->input->post()`
- **SYS-002**: Transaction without status check → Already fixed (uses correctly)
- **ARCH-001**: N+1 query potential → Check model queries

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/C_kyc/index` | Show KYC form |
| POST | `/C_kyc/DB_Controller` | Submit KYC |

---

## Next Steps for This Module

1. ✅ Document created (this file)
2. ☐ Add CSRF protection to form
3. ☐ Fix raw `$_POST` in controller
4. ☐ Add file upload virus scanning

---

*Part of Winbull Brain — See 0_session_start.md for full index*