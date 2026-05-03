# 🐛 Bug Patterns & Detection Library — WinBull Trade

> **IDP Recipe Engine seed data** | 19 patterns + 59 deep-scan bugs + 110 Zoho bugs
> Last Updated: 2026-05-01

---

## Pattern Library (19 Patterns)

### System Patterns (SYS)

| ID | Pattern | Detection | Severity | Fix Template | Found In |
|---|---|---|---|---|---|
| SYS-001 | Raw `$_POST/$_GET` | `grep "$_POST["` | P0 | `$this->input->post('field', TRUE)` | 54+ files |
| SYS-002 | `trans_commit()` without `trans_status()` | `grep "trans_commit()" \| grep -v "trans_status()"` | P0 | Add `if ($this->db->trans_status() === FALSE) { trans_rollback(); }` | scan needed |
| SYS-003 | Missing AJAX error handler | `$.ajax()` without `error:` | P1 | Add `error: function(xhr) { showToast('error','Server error'); }` | scan needed |
| SYS-004 | GET-based delete (CSRF) | `<a href="/delete/id">` | P0 | POST + `showConfirmModal()` + CSRF token | scan needed |
| SYS-005 | Mobile API zero auth | No auth check in `__construct()` | P0 | Add auth middleware | 86 endpoints |
| SYS-006 | `mkdir` with 0777 | `grep "mkdir(.*, 0777"` | P1 | Use `0755` for dirs, `0644` for files | scan needed |
| SYS-007 | Debug artifacts | `echo`, `print_r`, `var_dump`, `exit` | P2 | Remove or `log_message('debug', ...)` | scan needed |

### Architecture Patterns (ARCH)

| ID | Pattern | Detection | Severity | Fix Template | Found In |
|---|---|---|---|---|---|
| ARCH-001 | N+1 query | SQL inside `foreach`/`for` loop | P2 | Batch query with `where_in()` | scan needed |
| ARCH-002 | Hardcoded AJAX URLs | `url: '/admin/...'` in `$.ajax()` | P2 | Use `base_url` variable | scan needed |
| ARCH-003 | Select2 not on dynamic elements | `.select2()` called once, rows added dynamically | P2 | Init Select2 AFTER append | scan needed |
| ARCH-004 | Event handler fires multiple times | `.on('change')` bound inside repeating function | P1 | `.off('change').on('change')` or delegate | scan needed |
| ARCH-005 | MyISAM in transaction block | MyISAM table inside `trans_start()` | P1 | `ALTER TABLE x ENGINE=InnoDB` | scan needed |
| ARCH-006 | Cartesian JOIN | JOIN with no/wrong ON clause | P1 | Add proper ON condition | scan needed |

### Business Patterns (BIZ)

| ID | Pattern | Detection | Severity | Fix Template | Found In |
|---|---|---|---|---|---|
| BIZ-001 | JS calc ≠ PHP calc | Compare rate formulas JS vs PHP | P0 | Ensure identical formula both layers | scan needed |
| BIZ-002 | Rate not validated server-side | Form rate used directly in INSERT | P0 | Re-fetch rate server-side (KNOWN GAP) | systemic |
| BIZ-003 | Missing `parseFloat()` | Arithmetic on `.val()` without parseFloat | P1 | `parseFloat(val) \|\| 0` | scan needed |
| BIZ-004 | Missing `toFixed()` | Currency without `.toFixed(2)` | P2 | `.toFixed(2)` for currency, `.toFixed(3)` for weight | scan needed |
| BIZ-005 | Socket without client prefix | `emit()`/`on()` without `$client` prefix | P0 | Prefix all: `clientPrefix + ':event'` | scan needed |
| BIZ-006 | NaN propagation | Calc chain without `isNaN()` guard | P1 | `var val = parseFloat(x) \|\| 0;` | scan needed |

**Stats**: 19 patterns — 7 P0 Critical, 7 P1 Major, 5 P2 Minor

---

## Cross-Module Pattern Status

| Pattern ID | Severity | Affected Count | Auto-Fix? | Status |
|---|---|---|---|---|
| P-SQL | 🔴 Critical | 52 models + 2 controllers | ❌ Manual | ⚠️ 2 fixed |
| P-PERM | 🟠 High | 19 controllers | ⚠️ Verify | ⏳ 1 fixed |
| P-LOG | 🟠 High | 53 controllers | ⚠️ Verify | 🟡 3/5 fixed |
| P-ALERT | 🟠 High | 20 views | ✅ Safe | ⏳ Not fixed |
| P-CONFIRM | 🟠 High | 3 views | ✅ Safe | ⏳ Not fixed |
| P-DELCHECK | 🟡 Medium | 16 models | ⚠️ Verify | ⏳ Not fixed |
| P-DUP | 🟡 Medium | 39 models | ⚠️ Verify | ⏳ Not fixed |
| P-LOADER | 🟡 Medium | 22 views | ✅ Safe | ⏳ Not fixed |
| P-SEARCH | 🟡 Medium | 48 views | ✅ Safe | ⏳ Not fixed |
| P-BLOCKED | 🟡 Medium | ~52 models | ✅ After DELCHECK | ⏳ Not fixed |

---

## Deep Scan Bugs (59 total)

### trading_helper.php — 20 Bugs
| ID | Bug | Severity | Status |
|---|---|---|---|
| BUG-TH-01 | 30+ raw `db->query()` — SQL injection | 🔴 | ⏳ |
| BUG-TH-02 | `changePassword()` plaintext comparison | 🔴 | ⏳ |
| BUG-TH-03 | `insert_record()` no DB transaction (400L) | 🔴 | ⏳ |
| BUG-TH-04 | `str_replace()` wrong args | 🔴 | ✅ Fixed |
| BUG-TH-14 | Wrong value in log | 🔴 | ⏳ |
| BUG-TH-15 | `mysql_error()` fatal on PHP7+ | 🔴 | ⏳ |
| BUG-TH-16 | Undefined `$sms_url` | 🔴 | ⏳ |
| BUG-TH-20 | Unsanitized SQL in session check | 🔴 | ⏳ |
| BUG-TH-05 | 29× raw `$_POST/$_GET` | 🟠 | ⏳ |
| BUG-TH-06 | Hardcoded Lightstreamer creds | 🟠 | ⏳ |
| BUG-TH-07 | Log file no rotation | 🟠 | ⏳ |
| BUG-TH-17 | `strpos() == false` should be `===` | 🟠 | ⏳ |
| BUG-TH-08 to BUG-TH-13, 18-19 | Various medium/low issues | 🟡 | ⏳ |

### Mobile API — 18 Bugs
| ID | Bug | Severity |
|---|---|---|
| BUG-API-01 | **ZERO auth ALL 86 endpoints** | 🔴🔴 |
| BUG-API-02 | OTP returned in response | 🔴 |
| BUG-API-03 | Admin login via GET (password in URL) | 🔴 |
| BUG-API-04/05 | SQL injection (2 locations) | 🔴 |
| BUG-API-06 | Plaintext password registration | 🔴 |
| BUG-API-09 | CORS wildcard `*` | 🟠 |
| BUG-API-07/08 | Empty stub functions | 🟠 |
| BUG-API-10-18 | Various medium issues | 🟠/🟡 |

### Customer Portal — 11 Bugs
| ID | Bug | Severity |
|---|---|---|
| BUG-WEB-01 | 127 raw `db->query()` (47 in Booking_model!) | 🔴🔴 |
| BUG-WEB-02 | 155 raw `$_POST/$_GET` | 🔴 |
| BUG-WEB-03 | 5 controllers zero session check | 🔴 |
| BUG-WEB-04 | 7 models plaintext password | 🔴 |
| BUG-WEB-06/07 | Plaintext password in forgot/login | 🔴 |
| BUG-WEB-09 | KYC upload no auth | 🔴 |

### R-Panel — 10 Bugs
| ID | Bug | Severity |
|---|---|---|
| BUG-RP-01 | SQL injection | 🔴 |
| BUG-RP-02 | Rate API creds in browser JS | 🔴 |
| BUG-RP-07 | Delete-then-insert no transaction | 🔴 |
| BUG-RP-03-10 | Various medium issues | 🟠/🟡 |

---

## Zoho Customer Bugs (110 total)

| Category | Count | Status |
|---|---|---|
| Web bugs (BZ-01 to BZ-109) | 76 | ❌ Code changed, NOT browser-verified |
| Mobile bugs (BZ-66 to BZ-113) | 34 | ⏳ On hold per owner |
| **Total** | **110** | |

### Top priority Zoho modules:
- C_customerDelivery: 10 bugs
- C_booking: 6 bugs
- C_userregistration: 5 bugs
- C_marginmanagement: 5 bugs
- Customer Portal: 10 bugs
- C_phonebooking: 4 bugs

GitHub Issues: #65-#119 at `github.com/elavarasan-lmx/WinBullSource/issues`

---

## Critical Dev Rules (From Bug History)

1. **DUAL-SIDE FIX**: Always fix BOTH admin AND web controllers
2. **VALIDATION**: Add to BOTH `keyup` AND `submit` handlers
3. **`accountdelete()`**: NO-OP stub — do NOT modify
4. **Fix priority**: 🔴 Zoho client bugs → 🟠 User suggestions → 🟡 UI fixes → ⚪ Scan findings
