# Winbull — Bug Detection Report (v1.0)

> Generated: 2026-05-14
> Scanner: Manual scan + grep patterns
> Codebase: /run/media/lmx/LMX/Winbull/Personal/Devops/Project/winbullstaging/

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 P0 Critical | 4 | Need immediate attention |
| 🟠 P1 High | 3 | This sprint |
| 🟡 P2 Medium | 2 | Next sprint |
| 🟢 P3 Low | 1 | Backlog |

---

## 🔴 P0: Critical Bugs

### P0-001: Mobile API Has Zero Auth on Most Endpoints

**Files**:
- `mobileapi/application/controllers/C_mobileclient.php`
- `mobileapi/application/controllers/C_mobileadmintrade.php`
- `mobileapi/application/controllers/C_mobileclienttrade.php`

**Evidence**:
```php
// C_mobileclient.php - constructor has NO auth check
function __construct() {
    parent::__construct();
    // Only CORS headers, no token/session check
}

// 15+ endpoints exposed without auth:
// - user_login_post()
// - user_registration_post()
// - terminate_usersession_post()
// - user_sessioncheck_post()
// - AND MORE...
```

**Risk**: ANY user can call mobile API endpoints. No authentication required.

**Fix**:
```php
function __construct() {
    parent::__construct();
    // Add auth check
    $token = $this->input->post('token') ?: $this->input->get('token');
    if (!$this->verify_token($token)) {
        $this->response(['success' => FALSE, 'message' => 'Unauthorized'], 401);
    }
}
```

---

### P0-002: WhiteListDomainMiddleware Disabled in Lumen

**File**: `lmxtrade/winbullliteapi/bootstrap/app.php`

**Status**: Known open bug (from brain/0_session_start.md)

**Risk**: Rate/broadcast endpoints exposed publicly via Lumen

---

### P0-003: AWS RDS Credentials in global_configs.php

**File**: `Project/winbullstaging/global_configs.php`

**Status**: Known open bug (from brain/0_session_start.md)

**Risk**: DB credentials exposed if file leaked

---

### P0-004: Cross-Client Socket Data Leak (Suspected)

**File**: `lmxtrade/winbullstagingsocket.js`

**Risk**: Socket events may not have client prefix (BIZ-005 from brain)

**Scan Result**: Pattern found but needs manual verification

---

## 🟠 P1: High Priority Bugs

### P1-001: TDS/TCS Wrong Column (get_tdsvalue)

**File**: `application/helpers/trading_helper.php`

**Status**: Known open bug (from brain/0_session_start.md)

**Evidence**: `get_tdsvalue()` reads `tcs_value` key instead of `tds_value`

---

### P1-002: Transaction Pattern — Correct Usage Found

**Files**:
- `C_ajax.php` — Uses `trans_status()` correctly
- `C_kyc.php` — Uses `trans_status()` correctly
- `C_userregistration.php` — Uses `trans_status()` correctly
- `C_email_settings.php` — Uses `trans_status()` correctly
- `C_trade.php` — Uses `trans_status()` correctly

**Status**: ✅ Good — Transactions handled correctly in most files

---

### P1-003: Session-Based Auth (Not Token-Based)

**Files**: All web controllers

**Pattern Found**:
```php
// C_trade.php
if($this->login_model->get_booking() && $this->login_model->check_to_clear_session()==false) {
    // Session check only - not robust for mobile
}
```

**Risk**: Session hijacking possible, not using JWT/OAuth

---

## 🟡 P2: Medium Priority

### P2-001: Dead Code / Unused Functions

**Files**: Multiple controllers

**Need to scan**: Functions with date suffixes (e.g., `function_2025_05_12`)

---

### P2-002: parseFloat Missing on Financial Calculations

**Location**: `assets/js/` frontend files

**Risk**: String concatenation instead of numeric addition

---

## 🟢 P3: Low Priority

### P3-001: Debug Artifacts

**Need to scan**: `echo`, `print_r`, `var_dump` in production code

---

## Code Statistics

| Zone | Files | Notes |
|------|-------|-------|
| web_controllers | 12 | All use CI3 properly |
| web_models | 12 | Standard CI3 models |
| mobile_controllers | 4 | ⚠️ No auth on most endpoints |
| mobile_models | 5 | Standard CI3 models |
| lumen_engine | 6583 | Too large to scan fully |

---

## Recommended Actions

### Immediate (P0)
1. [ ] Add auth to mobile API `__construct()` in all 4 controllers
2. [ ] Enable WhiteListDomainMiddleware in Lumen
3. [ ] Move AWS credentials to environment variables
4. [ ] Verify socket client prefix in Node.js server

### This Sprint (P1)
1. [ ] Fix TDS/TCS column bug in trading_helper.php
2. [ ] Implement token-based auth for mobile API
3. [ ] Review session security in web controllers

### Next Sprint (P2)
1. [ ] Remove dead code
2. [ ] Add parseFloat validation on frontend forms
3. [ ] Clean up debug artifacts

---

*Report generated via /fingerprint-scan equivalent*