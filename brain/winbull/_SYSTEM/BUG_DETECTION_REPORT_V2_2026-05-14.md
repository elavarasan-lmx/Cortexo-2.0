# Winbull — Bug Detection Report v2.0

> Generated: 2026-05-14
> Scanner: winbull_scan_v2.php (22 patterns)
> Codebase: /run/media/lmx/LMX/Winbull/WTWeb/WTWeb-Winbulltradeversion/

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 P0 Critical | 162 | Fix IMMEDIATELY |
| 🟡 P1 High | 220 | This sprint |
| 🔵 P2 Medium | 315 | Next sprint |
| ⚪ P3 Low | 0 | - |

**Total Bugs Detected**: 697

---

## 🔴 P0 — Critical (162 hits)

### SEC-001: SQL Injection via Raw POST
**Priority**: P0 | **Category**: Security | **Hits**: 156

Raw `$_POST` values used without CodeIgniter's `$this->input->post()` sanitization.

**Files Affected**:
```
application/controllers/C_ajax.php
application/controllers/C_booking.php
application/controllers/C_client_main.php
application/controllers/C_kyc.php
application/controllers/C_trade.php
mobileapi/application/models/M_mobileadmintrade.php
```

**Fix Template**:
```php
// BEFORE (unsafe)
$name = $_POST['name'];

// AFTER (safe)
$name = $this->input->post('name', TRUE);
```

---

### SEC-002: OTP Bypass via Loose Comparison
**Priority**: P0 | **Category**: Security | **Hits**: 4

OTP check uses `==` instead of `===` — vulnerable to PHP type juggling attack.

**Files**:
```
mobileapi/application/controllers/C_mobileclient.php:L293
  if ($data['receivedotp'] == $data['verifyotp']) {

application/controllers/C_mobile.php:L151
  if($resendotp['status'] == 1) {

application/models/Booking_model.php:L903
  if ($field_name[$i] == 'otp') {

application/models/MLogin_model.php:L314
```

**Fix Template**:
```php
// BEFORE (vulnerable)
if ($submitted_otp == $stored_otp) { ... }

// AFTER (secure)
if ($submitted_otp === $stored_otp) { ... }
```

---

### SEC-004: Mobile API Missing Auth
**Priority**: P0 | **Category**: Security | **Hits**: 4

All 4 mobile API controllers have NO authentication in `__construct`.

**Controllers**:
1. `mobileapi/application/controllers/C_mobileadmintrade.php`
2. `mobileapi/application/controllers/C_mobileclient.php`
3. `mobileapi/application/controllers/C_mobileclienttrade.php`
4. `mobileapi/application/controllers/C_tradeapi.php`

**Risk**: ANY user can call mobile API endpoints without login.

**Fix Template**:
```php
class C_mobileclient extends REST_Controller {
    function __construct() {
        parent::__construct();
        
        // ADD THIS CHECK
        $token = $this->input->post('token') ?: $this->input->get('token');
        if (!$this->verify_token($token)) {
            $this->response([
                'status' => FALSE,
                'message' => 'Unauthorized'
            ], 401);
            exit;
        }
    }
}
```

---

## 🟡 P1 — High Priority (220 hits)

### TXN-001: trans_commit Without trans_status Check
**Priority**: P1 | **Category**: Transaction | **Hits**: 35

`trans_commit()` called without verifying `trans_status() === TRUE` first.

**Files**:
```
mobileapi/application/controllers/C_mobileadmintrade.php (26 occurrences)
application/controllers/C_ajax.php (3 occurrences)
application/controllers/C_email_settings.php (1)
application/controllers/C_kyc.php (1)
```

**Note**: Many of these ARE correct (have trans_status check nearby). Manual verification needed.

---

### ARCH-005: Cartesian JOIN Detection
**Priority**: P1 | **Category**: Architecture | **Hits**: 185

Pattern detected JOINs — many are legitimate but need verification.

**Files**:
```
mobileapi/application/models/M_mobileadmintrade.php (many)
application/models/Booking_model.php (many)
application/controllers/C_sendorderstatus.php
```

**Manual Check Required**: Verify each JOIN has proper ON condition.

---

## 🔵 P2 — Medium Priority (315 hits)

### SEC-005: Debug Artifacts in Production
**Priority**: P2 | **Category**: Security | **Hits**: 153

`echo`, `print_r`, `var_dump` found in production code.

**Top Files**:
```
application/controllers/C_ajax.php (many)
mobileapi/application/controllers/C_mobileadmintrade.php (9)
application/controllers/C_trade.php
```

**Fix Template**:
```php
// BEFORE (breaks AJAX)
echo json_encode($data);

// AFTER (log instead)
log_message('debug', 'Response: ' . json_encode($data));
// or remove entirely
```

---

### ARCH-001: N+1 Query Pattern
**Priority**: P2 | **Category**: Architecture | **Hits**: 162

SQL queries inside foreach loops — 100 items = 101 queries.

**Files**:
```
mobileapi/application/controllers/C_mobileadmintrade.php (many)
application/controllers/C_ajax.php
application/controllers/C_booking.php
application/controllers/C_client_main.php
```

**Fix Template**:
```php
// BEFORE (N+1)
foreach ($bookings as $booking) {
    $customer = $this->db->get_where('dt_customer', ['cus_id' => $booking['cus_id']])->row_array();
}

// AFTER (1 query)
$cus_ids = array_column($bookings, 'cus_id');
$customers = $this->db->where_in('cus_id', $cus_ids)->get('dt_customer')->result_array();
$customer_map = array_column($customers, null, 'cus_id');
```

---

## Statistics by Zone

| Zone | Files | P0 | P1 | P2 | Total |
|------|-------|----|----|----|-------|
| mobile | 9 | 6 | 159 | 93 | 258 |
| web | 26 | 156 | 61 | 222 | 439 |
| **Total** | **35** | **162** | **220** | **315** | **697** |

---

## Recommended Fix Order

### Phase 1: Immediate (Today)
1. [ ] Fix SEC-004: Add auth to 4 mobile controllers
2. [ ] Fix SEC-002: Change OTP `==` to `===` in 4 files

### Phase 2: This Week
3. [ ] Fix SEC-001: Replace raw `$_POST` with `$this->input->post()`
4. [ ] Audit TXN-001: Verify trans_commit patterns are correct

### Phase 3: Next Sprint
5. [ ] Fix SEC-005: Remove debug artifacts (153 hits)
6. [ ] Optimize ARCH-001: Fix N+1 queries in critical paths

### Phase 4: Backlog
7. [ ] ARCH-005: Verify JOINs have proper ON conditions

---

## Files Created by This Scan

- Scanner: `scripts/winbull_scan_v2.php`
- Patterns: `scripts/winbull_bug_patterns_v2.json`
- Report: `brain/winbull/_SYSTEM/scan_reports/scan_v2_2026-05-14.json`

---

## Next Steps

1. Run: `/bug-intake [pattern_id] [file] [line]` for each confirmed bug
2. Run: `/fix-bug [BUG_ID]` to fix
3. Run: `/scan-cross-module [pattern]` after each fix

---

*Generated via /fingerprint-scan workflow*