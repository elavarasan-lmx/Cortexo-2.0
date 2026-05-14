# Danger Zones — NEVER Modify Without Full Protocol

> Files and patterns that have caused production incidents or carry extreme risk.
> Before touching ANY of these: read the rule, check the brain, and verify with a senior developer.

---

## 🔴 DZ-001: SQL Injection in Login Flow
- **File**: `C_client_main.php` — `login_validation()` (Line 876)
- **Rule**: NEVER concatenate `$_POST` into SQL. ALWAYS use query bindings.
- **Pattern**: SYS-001
- **Status**: 🔴 OPEN

## 🔴 DZ-002: Mobile API Zero Authentication
- **File**: All controllers in `mobileapi/`
- **Rule**: NEVER deploy a mobile API endpoint without auth middleware in `__construct()`.
- **Pattern**: SYS-005
- **Scale**: 86 unauthenticated endpoints
- **Status**: 🔴 OPEN

## 🔴 DZ-003: OTP Type Juggling
- **File**: Any file comparing OTP values
- **Rule**: NEVER use `==` for OTP comparison. ALWAYS use `===` (strict).
- **Pattern**: SYS-008
- **Status**: 🔴 OPEN — Needs grep audit

## 🔴 DZ-004: Plaintext Password Storage
- **File**: `dt_customer.cus_login_password`
- **Rule**: NEVER store passwords without hashing. Use `password_hash()` / `password_verify()`.
- **Status**: 🔴 OPEN

## 🟡 DZ-005: Encryption Key Hardcoded
- **File**: `global_configs.php`, `C_client_main.php`
- **Rule**: NEVER hardcode encryption keys. Use environment variables.
- **Status**: 🟡 OPEN — Key: `12@^tyh8901tt56789012345$y89012`

## 🟡 DZ-006: Socket Token Endpoint Unprotected
- **File**: Node.js socket server, port 57134 `/token`
- **Rule**: NEVER expose auth tokens via unauthenticated GET endpoints.
- **Status**: 🟡 OPEN

## 🟡 DZ-007: HTTPS Disabled via .htaccess
- **File**: `.htaccess`
- **Rule**: NEVER redirect HTTPS to HTTP in production.
- **Status**: 🟡 OPEN

## 🟡 DZ-008: Hardcoded IP in Hedge API
- **File**: `Motilal_model.php`
- **Rule**: NEVER hardcode IPs in API headers. Use config/env vars.
- **Status**: 🟡 OPEN — IP: `82.60.76.112`, MAC: `7A-14-01-88-B0-B1`

## 🟡 DZ-009: dt_r_panel UPDATE Without WHERE
- **File**: `C_client_main.php` (Line 894)
- **Rule**: NEVER run UPDATE without a WHERE clause.
- **Status**: 🟡 OPEN

---

## Statistics
- **Total Danger Zones**: 9
- **🔴 Critical (P0)**: 4
- **🟡 High (P1)**: 5
- **Resolved**: 0
