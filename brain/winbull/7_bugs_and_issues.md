# Winbull Staging — Bugs & Security Issues

## 🔴 CRITICAL — SQL Injection

### 1. C_client_main.php `login_validation()` (Line 876)
```php
$this->db->query("select * from dt_customer where cus_login_name='"
    .$this->input->post('user_name')."' and cus_login_password='"
    .$this->input->post('user_password')."'");
```
**Impact**: Full database compromise via login form. An attacker can extract all customer data, passwords, and trading history.
**Fix**: Use CI query bindings: `$this->db->query("SELECT * FROM dt_customer WHERE cus_login_name=? AND cus_login_password=?", [$username, $password]);`

### 2. C_client_main.php `terminate_usersession()` (Line 915)
```php
$this->db->query("select * from dt_customer where cus_login_name='"
    .$this->input->post('user_name')."' and cus_sec_code='"
    .$this->input->post('user_sec_code')."'");
```
**Impact**: Same as above — injectable via session termination flow.

### 3. Likely widespread in admin controllers
Many admin controllers use `DB_Controller()` patterns — need systematic audit of all `$this->db->query()` calls with concatenated input.

---

## 🔴 CRITICAL — Authentication & Passwords

### 4. Plaintext Password Storage
Passwords are stored as-is in `dt_customer.cus_login_password`. No hashing whatsoever.
**Impact**: If DB is breached, all passwords are immediately exposed. Users who reuse passwords across sites are compromised.
**Fix**: Migrate to `password_hash()` / `password_verify()` (bcrypt).

### 5. No CSRF Protection
No CSRF tokens on forms. POST requests can be forged from external sites.
**Fix**: Enable CI's CSRF protection in `config.php` (`csrf_protection = TRUE`).

### 6. No Brute-Force Protection on Login
No rate limiting or account lockout after failed attempts.
**Impact**: Automated credential stuffing attacks.

### 7. Session Fixation Risk
`session_write_close()` called at line 905 before redirect, but session ID not regenerated after successful login.
**Fix**: Call `$this->session->sess_regenerate()` after login.

---

## 🟡 HIGH — Security Exposure

### 8. Encryption Key Hardcoded (Multiple Locations)
- `global_configs.php`: `$key = '12@^tyh8901tt56789012345$y89012'`
- `C_client_main.php`: Same key duplicated in `getRate()`
**Impact**: Key compromised if code leaks → all encrypted rate data readable.

### 9. Token Endpoint Exposes Socket Auth
`GET /token` on port 57134 returns the SHA-256 auth token to anyone.
**Impact**: Any unauthenticated user can obtain the WebSocket token and connect.
**Fix**: Remove `/token` endpoint or restrict to localhost.

### 10. HTTPS Disabled via .htaccess
`.htaccess` redirects HTTPS to HTTP. All traffic including passwords transmitted in cleartext.
**Impact**: Man-in-the-middle attacks can intercept all credentials and rate data.

### 11. Database Credentials in Version Control
`global_configs.php` contains RDS hostname, username, password in plaintext.
**Fix**: Use environment variables or AWS Secrets Manager.

---

## 🟡 HIGH — Logic & Data Integrity

### 12. dt_r_panel Updated Without WHERE Clause (Line 894)
```php
$this->db->update('dt_r_panel', $updatedata);
// No WHERE clause — updates ALL rows!
```
**Impact**: Every login updates all R-Panel records with the same timestamp. Unintended mass update.

### 13. Race Condition in Booking
No database-level locking on `booknow()`. Under concurrent load, same commodity rate could be booked at stale prices.
**Fix**: Use `SELECT ... FOR UPDATE` or optimistic locking.

### 14. Duplicate changePassword Function
`changePassword_post()` exists in both `C_mobileclient.php` and `C_mobileclienttrade.php`. Which one is active depends on routing — potential inconsistency.

### 15. GET Used for Destructive Operations
`customerOrderCancel_get()` in mobile API uses GET to cancel orders. Can be triggered by link prefetching or search engine crawlers.
**Fix**: Change to POST/DELETE method.

### 16. Admin Login via GET
`dologin_get()` in `C_mobileadmintrade.php` — admin credentials passed via URL query params.
**Impact**: Credentials logged in server access logs, browser history, proxy logs.

---

## 🟠 MEDIUM — Code Quality

### 17. God Controllers
- `WinbullliteController.php`: 93KB, 50+ methods — unmaintainable
- `C_customerDelivery.php`: 868+ lines, 30+ methods
- `M_mobileadmintrade.php`: 91KB model
- `M_mobiletrade.php`: 86KB model

### 18. Dead/Commented Code
- `C_client_main.php` lines 780-841: Old login logic commented out but not removed
- Multiple `/* ... */` blocks across controllers containing old implementations

### 19. Inconsistent Table Names
- `dt_r_panel` vs `dt_rpanel` (line 894 vs 933 in C_client_main.php) — possibly different tables or a bug
- `updatedata['userupdatetime']` vs `updatedata['silver_lgd_ltp']` — different column names for same operation

### 20. No Input Validation on Critical Fields
Commodity IDs, booking amounts, and customer IDs accepted without type checking or bounds validation in many controllers.

### 21. XML File Manipulation in Login Flow
`terminate_usersession()` writes to `admin/rpanel_xml/ratexml.xml` during login — mixing rate data with auth flow is a separation of concerns violation.

---

## 🔵 LOW — Maintenance

### 22. No Error Handling in cURL Calls
`curl_helper()` calls throughout the codebase with no retry logic or timeout handling.

### 23. No Logging/Audit Trail
Critical operations (bookings, cancellations, rate changes) lack structured logging.

### 24. No Automated Tests
Zero unit tests, integration tests, or API tests across the entire platform.

### 25. PHP 8.1 Deprecation Warnings (Potential)
CodeIgniter 3 uses patterns deprecated in PHP 8.1 (e.g., `${var}` string interpolation, `null` to non-nullable parameters).
