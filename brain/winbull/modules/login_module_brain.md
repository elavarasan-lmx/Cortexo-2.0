# Login Module Brain — C_client_main + Login_model
> Module: Login/Authentication
> Source: `WTWeb-Rubyprecious/application/controllers/C_client_main.php` (1099 lines)
> Model: `WTWeb-Rubyprecious/application/models/Login_model.php` (440 lines)
> Brain Version: 1.0
> Created: 2026-05-13

---

## 1. Module Overview

C_client_main.php is the **master customer-facing controller** — it handles authentication, page rendering, contact forms, quotations, rate alerts, and static pages. It's NOT just a "login" controller — it's a **God Controller** with 40+ public methods handling 8 different business domains.

### Responsibilities
1. **Authentication** — login, logout, session termination, forgot password, change password
2. **Static Pages** — About, Terms, Privacy, FAQ, Contact, Gallery, Gold, Silver, Careers, etc.
3. **Rate Alerts** — CRUD for rate alert subscriptions (JSON via php://input)
4. **Contact/Enquiry** — Form submissions with captcha + email notifications
5. **Careers** — Job application with file upload + DB insert
6. **Quotation** — OTP-based quotation flow with SMS/WhatsApp
7. **Rate Data** — Encrypted BSE rate decryption + MJDTA rate transformation
8. **Push Notifications** — OneSignal push via booking_model helpers

---

## 2. Method Inventory (40 methods)

### Authentication (CRITICAL — Security-Sensitive)
| Method | Line | HTTP | Auth? | Purpose |
|---|---|---|---|---|
| `index()` | 14 | GET | ❌ | Landing — redirects guest/logged-in users |
| `login()` | 50 | GET | ❌ | Render login form |
| `login_validation()` | 996 | POST | ❌ | **🔴 SQL INJECTION** — validates user+pass, creates session |
| `terminate_usersession()` | 1065 | POST | ❌ | **🔴 SQL INJECTION** — terminates existing sessions |
| `logout()` | 64 | GET | Session | Destroys session + redirects |
| `load_mainpage()` | 72 | GET | Session | Post-login session check + redirect |
| `load_terminatesession()` | 86 | GET | Session | Renders terminate session view |
| `forgotpassword()` | 92 | GET/POST | ❌ | SMS/email password recovery |
| `changepassword()` | 156 | GET/POST | Session | **🟡 SENDS PASSWORD IN EMAIL** (line 182) |

### Static Pages (Low Risk — No Input Processing)
| Method | Line | Purpose |
|---|---|---|
| `Aboutus()` | 216 | Static page |
| `Terms()` | 223 | Static page |
| `Disclaimer()` | 230 | Static page |
| `Privacy()` | 237 | Static page |
| `Process()` | 244 | Static page |
| `Bank()` | 251 | Static page |
| `Faq()` | 258 | Static page |
| `Contactus()` | 265 | Static page |
| `Gallery()` | 272 | Static page |
| `Gold()` | 279 | Static page |
| `Silver()` | 286 | Static page |
| `Coin()` | 293 | DB query (direct `$this->db->query()`) |
| `Careers()` | 306 | Static page |
| `Home()` | 313 | Static page |
| `Product()` | 320 | Static page |
| `Enquiry()` | 327 | Static page |
| `News()` | 334 | Static page |
| `Overview()` | 341 | Static page |
| `Messages()` | 348 | DB query via booking_model |
| `MobileMessages()` | 358 | **🟡 No auth** — returns JSON messages |
| `calendar()` | 367 | Static page |
| `tcs_tds_calc()` | 373 | DB query via booking_model |
| `accountdelete()` | 761 | **🟡 DOES NOTHING** — just echoes text |

### Contact/Enquiry (Medium Risk — Raw $_POST)
| Method | Line | Risk | Issue |
|---|---|---|---|
| `contactussubmitt()` | 560 | 🔴 HIGH | **Raw $_POST** — `$_POST['name']`, no sanitization, no captcha |
| `contactussubmit()` | 612 | 🟡 MED | Has captcha, but still uses raw `$_POST['name']` |

### Rate Alert APIs (Medium Risk — php://input)
| Method | Line | HTTP | Auth? | Input |
|---|---|---|---|---|
| `getratealerttollarance()` | 694 | GET/POST | ❌ | None |
| `ratealertRequest()` | 700 | POST | ❌ | `php://input` → JSON |
| `ratealertDelete()` | 712 | POST | ❌ | `php://input` → JSON |
| `getratealertlist()` | 720 | POST | ❌ | `php://input` → JSON |
| `ratealertTolerance()` | 728 | GET | ❌ | None |

### Quotation Flow (Medium Risk — New Code)
| Method | Line | HTTP | Auth? | Input |
|---|---|---|---|---|
| `Quotation()` | 768 | GET | ❌ | `cus_country` from POST/GET |
| `quotation_confirm()` | 780 | POST | ❌ | `php://input` → array |
| `get_number_gst()` | 798 | POST | ❌ | `php://input` → array |
| `delivery_otp_verify()` | 808 | POST | ❌ | `php://input` → OTP check |
| `quotation_otp_send()` | 831 | POST | ❌ | `php://input` → mobile |

### Rate Data & Misc
| Method | Line | Purpose | Risk |
|---|---|---|---|
| `getRate()` | 864 | BSE rate decryption + MJDTA rates | **🔴 HARDCODED KEY** (line 879) |
| `get_captcha()` | 383 | Generates captcha image | Low risk |
| `career_submit()` | 442 | Job application + file upload | 🟡 Captcha check, but raw `$_POST` in error msg (line 557) |
| `get_entryeventdata()` | 685 | Calendar events | **🔴 UNSAFE** — user controls model name |
| `create_pushnotification()` | 735 | OneSignal push | Internal only |
| `getPremiumGroup()` | 839 | Premium group data | No auth |

---

## 3. Security Vulnerabilities (Confirmed)

### 🔴 V-001: SQL Injection in login_validation() (Line 1029)
```php
$userdata = $this->db->query("select * from dt_customer where cus_login_name='".$this->input->post('user_name')."' and cus_login_password='".$this->input->post('user_password')."'");
```
**Impact**: Full database compromise. Attacker can dump all customer data, passwords, financial records.
**Fix**: Use CI Query Builder: `$this->db->where('cus_login_name', $username)->where('cus_login_password', $password)->get('dt_customer')`

### 🔴 V-002: SQL Injection in terminate_usersession() (Line 1068)
```php
$userdata = $this->db->query("select * from dt_customer where cus_login_name='".$this->input->post('user_name')."' and cus_sec_code='".$this->input->post('user_sec_code')."'");
```
**Same pattern** — raw concatenation.

### 🔴 V-003: SQL Injection in Login_model.php (PERVASIVE)
Found in **14 separate methods** across Login_model.php:
- `check_user()` — Line 105
- `check_user_status()` — Lines 142-143
- `check_to_clear_session()` — Lines 152-154
- `delete_session()` — Line 165
- `insert_current_login()` — Lines 178, 188
- `GetCustomerID()` — Line 210
- `GetCustomer()` — Line 219
- `check_mobileuser()` — Line 229
- `check_mobileuser_status()` — Lines 317-318
- `terminate_existingsession()` — Lines 349, 356, 362, 414, 418

### 🔴 V-004: Plaintext Password Storage
```php
// Login_model.php line 105:
$resultset = $this->db->query("select * from dt_customer where ... cus_login_password='".$password."'");
```
Passwords are stored in plaintext in `dt_customer.cus_login_password`. No hashing.

### 🔴 V-005: Plaintext Password Sent in Email (Line 182)
```php
'<td>' . trim($this->input->post('new_password')) . '</td>'
```
When user changes password, the NEW password is sent via email in plaintext HTML.

### 🔴 V-006: Hardcoded Encryption Key (Line 879)
```php
$encryptionKey = '12@^tyh8901tt56789012345$y89012';
```
BSE rate decryption key is hardcoded in source code.

### 🔴 V-007: Raw $_POST Without Sanitization (Lines 563-566)
```php
$name = $_POST['name'];
$emailid = $_POST['email'];
$phone = $_POST['phone'];
$comments = $_POST['comments'];
```
`contactussubmitt()` uses raw `$_POST` — potential XSS in email content.

### 🔴 V-008: Unsafe Dynamic Model Loading (Line 688)
```php
$this->load->model($model);
$data = $this->$model->get_calendardata();
```
`get_entryeventdata($model)` loads ANY model name from URL path. Attacker can call any model's methods.

### 🟡 V-009: OTP Comparison Uses `!=` (Line 824)
```php
if ($user_otp != $session_otp) {
```
Type juggling vulnerability — `"0" != null` is false in PHP. Should use `!==`.

### 🟡 V-010: No CSRF Protection
No CSRF token validation on ANY POST endpoint. Forms use standard POST without tokens.

### 🟡 V-011: No Brute-Force Protection
`login_validation()` has no rate limiting, account lockout, or delay after failed attempts.

### 🟡 V-012: dt_r_panel UPDATE Without WHERE (Line 1047)
```php
$this->db->update('dt_r_panel', $updatedata);
```
No `where()` clause — updates ALL rows in dt_r_panel table.

### 🟡 V-013: Duplicate contactussubmit Methods
Two methods: `contactussubmitt()` (line 560, no captcha) and `contactussubmit()` (line 612, with captcha). The typo version has no protection.

---

## 4. Login_model.php — Key Methods

| Method | Line | Purpose | SQL Injection? |
|---|---|---|---|
| `check_user()` | 101 | Main auth check — plaintext password compare | ✅ YES |
| `check_user_status()` | 140 | Multi-session detection | ✅ YES (2 queries) |
| `check_to_clear_session()` | 149 | Session validity check | ✅ YES |
| `delete_session()` | 163 | Clean empty sessions | ✅ YES |
| `insert_current_login()` | 175 | Login history tracking | ✅ YES (3 queries) |
| `get_booking()` | 197 | Check booking flag | ❌ Safe |
| `GetCustomerID()` | 207 | Get customer ID by name | ✅ YES |
| `check_mobileuser()` | 226 | Mobile app login | ✅ YES |
| `check_mobileuser_status()` | 314 | Mobile session check | ✅ YES (2 queries) |
| `terminate_existingsession()` | 344 | Kill existing sessions | ✅ YES (5+ queries) |
| `trigger_socket_termination()` | 429 | WebSocket logout | ❌ Safe (uses Globals) |

### Login Flow Diagram
```
User → login_validation() → Login_model.check_user() → DB plaintext check
  ├─ result=0 → "Invalid credentials" → redirect /login
  ├─ result=2 → "Account inactive"
  ├─ result=3 → "Account expired"
  └─ result=1 → terminate_existingsession() → kill old sessions
       └─ Raw SQL: "select * from dt_customer where cus_login_name='$name' and cus_login_password='$pass'"
            └─ Set session → dt_r_panel UPDATE (no WHERE!) → redirect /book
```

---

## 5. Database Tables Used

| Table | Usage | Risk |
|---|---|---|
| `dt_customer` | Auth, user data, UUID | Contains plaintext passwords |
| `dt_r_panel` / `dt_rpanel` | Rate panel timestamp | Updated WITHOUT where clause |
| `dt_usersessions` / `ci_usersessions` | Session storage | Raw SQL throughout |
| `dt_prev_login` | Login history | Raw SQL inserts |
| `dt_generalsettings` | Feature flags | Read-only |
| `dt_news` | News events | Read-only |
| `job_applications` | Career submissions | Created on-the-fly (line 449) |

---

## 6. Fix Priority (Sprint 1 Queue)

| Priority | Vuln | Method | Pattern | Fix Effort |
|---|---|---|---|---|
| 🔴 1 | V-001 | login_validation() | SYS-001 | 15 min |
| 🔴 2 | V-002 | terminate_usersession() | SYS-001 | 15 min |
| 🔴 3 | V-003 | Login_model (14 queries) | SYS-001 | 60 min (batch) |
| 🔴 4 | V-004 | Plaintext passwords | Novel | 2-4 hrs (migration) |
| 🔴 5 | V-008 | get_entryeventdata() | Novel | 10 min (whitelist models) |
| 🟡 6 | V-007 | contactussubmitt() | SYS-001 | 10 min |
| 🟡 7 | V-012 | dt_r_panel update | DZ-009 | 5 min |
| 🟡 8 | V-009 | OTP type juggling | SYS-008 | 5 min |
| 🟡 9 | V-005 | Password in email | Novel | 10 min |
| 🟡 10 | V-006 | Hardcoded key | Novel | 15 min (env var) |

---

## 7. Cross-Platform Impact

| Vulnerability | Web | Flutter | Admin |
|---|---|---|---|
| V-001 SQL Injection login | ✅ Direct | ❌ Uses mobileapi | ❌ |
| V-003 SQL Injection model | ✅ Direct | ✅ Via mobileapi | ✅ Admin uses same model |
| V-004 Plaintext passwords | ✅ Direct | ✅ Same DB | ✅ Same DB |
| V-008 Dynamic model load | ✅ Direct | ❌ | ❌ |
| Rate alert (no auth) | ✅ Direct | ✅ Uses same endpoints | ❌ |

---

*Login Module Brain v1.0 — Ready for `/fix-bug` workflow*
