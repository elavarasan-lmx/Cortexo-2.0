# Winbull — Bug Pattern Library (Brain Artifact 11)

> 19 recurring bug patterns with grep detection rules + PHP/JS fix templates.
> Before ANY audit → Read this file first.
> Before ANY fix → Check if a fix template already exists here.
> After ANY fix → Add this module to the "Found In" list of the matching pattern.

---

## SYSTEM LEVEL PATTERNS

### SYS-001: Raw $_POST/$_GET Without Sanitization
**Detection**: Grep for `$_POST[` or `$_GET[` without `$this->input->post()`
**Risk**: SQL Injection, XSS
**Severity**: P0
**Scale**: 155 raw uses across web + mobile
**Fix Template**:
```php
// BEFORE (unsafe)
$name = $_POST['name'];
// AFTER (safe — CodeIgniter sanitized input)
$name = $this->input->post('name', TRUE);
```

---

### SYS-002: trans_commit() Without trans_status() Check
**Detection**: Grep for `trans_commit()` without `trans_status()` check nearby
**Risk**: Committing failed transactions → data corruption
**Severity**: P0
**Fix Template**:
```php
if ($this->db->trans_status() === FALSE) {
    $this->db->trans_rollback();
    return ['status' => 0, 'message' => 'Database error. Transaction rolled back.'];
} else {
    $this->db->trans_commit();
}
```

---

### SYS-003: Missing AJAX Error Handler
**Detection**: `$.ajax()` call without `error:` callback
**Risk**: User gets frozen screen on server error — no feedback
**Severity**: P1
**Fix Template**:
```javascript
error: function(xhr) {
    showToast('Server error. Please try again.', 'error');
    console.error('AJAX Error:', xhr.status, xhr.responseText);
    btn.prop('disabled', false).text(btnText);
    $("#ajax_loader").removeClass("show");
}
```

---

### SYS-004: GET-Based Delete (CSRF Vulnerable)
**Detection**: Delete action triggered via `<a href="/delete/id">` GET link
**Risk**: CSRF attack can delete records by tricking user to click a link
**Severity**: P0
**Fix Template**: Change to POST with `showConfirmModal()`:
```javascript
function deleteRecord(id) {
    showConfirmModal('Delete Confirmation', 'Are you sure?', function() {
        $.ajax({ url: base_url + 'index.php/C_Module/DB_Controller/model/delete/' + id, type: 'POST', ... });
    });
}
```

---

### SYS-005: Mobile API Zero Auth
**Detection**: Controller methods in `mobileapi/` without auth check in constructor
**Risk**: Any user can call any API endpoint — 0 authentication
**Severity**: P0
**Scale**: 86 endpoints across 4 controllers
**Fix Template**:
```php
public function __construct() {
    parent::__construct();
    $this->load->library('auth');
    if (!$this->auth->verify_token()) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
}
```

---

### SYS-006: mkdir with 0777 Permissions
**Detection**: Grep for `mkdir(.*, 0777`
**Risk**: World-writable directories — security vulnerability
**Severity**: P1
**Fix Template**: Use `0755` for directories, `0644` for files

---

### SYS-007: Debug Artifacts in Production
**Detection**: `echo`, `print_r`, `var_dump`, `exit` in controller/model code
**Risk**: Breaks AJAX responses, exposes internal data
**Severity**: P2
**Fix Template**: Remove or replace with `log_message('debug', ...)`

---

### SYS-008: OTP Weak Comparison (`==` instead of `===`)
**Detection**: Grep for `$_POST.*otp.*==` or `$otp ==` (double equals on OTP check)
**Risk**: PHP type juggling bypasses OTP — `"0" == false` is `true` → attacker submits `0` and gets in
**Severity**: P0
**Applies to**: Password change OTP, high-value order OTP, admin action OTP
**Fix Template**:
```php
// BEFORE (unsafe — type juggling bypass)
if ($submitted_otp == $stored_otp) { ... }

// AFTER (safe — strict type check)
if ($submitted_otp === $stored_otp) { ... }

// Also sanitize before comparison
$submitted_otp = trim($this->input->post('otp', TRUE));
```

---

## ARCHITECTURE LEVEL PATTERNS

### ARCH-001: N+1 Query Pattern
**Detection**: SQL query inside `foreach` or `for` loop
**Risk**: 100 items = 101 queries instead of 2
**Severity**: P2
**Fix Template**: Batch query outside loop, build lookup array with `where_in()`:
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

### ARCH-002: Hardcoded URLs in AJAX Calls
**Detection**: `url: '/admin/...'` hardcoded string in `$.ajax()`
**Risk**: Breaks when deployed on different subdirectory or domain
**Severity**: P2
**Fix Template**: Use `base_url` variable passed from PHP:
```javascript
// In PHP view: <script>var base_url = '<?= base_url(); ?>';</script>
url: base_url + 'index.php/C_Module/method'
```

---

### ARCH-003: Select2 Not Initialized on Dynamic Elements
**Detection**: `.select2()` called once on page load, but rows added dynamically via JS
**Risk**: New dropdown rows have no search/typeahead UI
**Severity**: P2
**Fix Template**: Initialize Select2 AFTER appending the row to DOM:
```javascript
var newRow = $(rowHtml).appendTo('#tableBody');
newRow.find('.select2-target').select2({ width: '100%' });
```

---

### ARCH-004: Event Handler Fires Multiple Times
**Detection**: `.on('change', ...)` bound inside a function that runs multiple times
**Risk**: Event fires N times = duplicate AJAX calls, wrong calculations
**Severity**: P1
**Fix Template**:
```javascript
// BEFORE (fires multiple times)
function initRow() { $('.dynamic-el').on('change', handler); }
// AFTER (safe)
$(document).on('change', '.dynamic-el', handler);
// OR
$('.dynamic-el').off('change').on('change', handler);
```

---

### ARCH-005: MyISAM Table Inside Transaction Block
**Detection**: Table engine is MyISAM but used inside `trans_start()`/`trans_complete()`
**Risk**: Transaction has NO effect — rollback does nothing on MyISAM
**Severity**: P1
**Fix Template**: Convert to InnoDB: `ALTER TABLE {table} ENGINE=InnoDB;`

---

### ARCH-006: Cartesian JOIN (Missing ON Condition)
**Detection**: JOIN with no ON clause, or ON clause that matches all rows
**Risk**: Result set explodes — row count = table1 × table2
**Severity**: P1
**Fix Template**: Add proper ON condition with FK relationship

---

## BUSINESS LEVEL PATTERNS (Trading-Specific)

### BIZ-001: JS Calculation ≠ PHP Calculation
**Detection**: Compare rate/weight/price formulas in JS file vs PHP model for same field
**Risk**: Screen shows one value (JS), DB stores different value (PHP)
**Severity**: P0
**Fix Template**: Ensure identical formula in both layers, or remove JS calc and use server response only

---

### BIZ-002: Rate Not Re-Validated Server-Side
**Detection**: Customer-submitted rate from form used directly in order/booking insert
**Risk**: Manipulated rate accepted — customer pays less than market rate
**Severity**: P0
**Known Gap**: Winbull's server does NOT re-validate rate on order submission — systemic issue (by design decision)
**Fix Template**: Re-fetch live rate server-side before saving, compare against submitted rate within tolerance

---

### BIZ-003: parseFloat() Missing on Form Values
**Detection**: Arithmetic on `$('#field').val()` without `parseFloat()` wrapper
**Risk**: String concatenation instead of addition: `"10" + "5" = "105"` instead of `15`
**Severity**: P1
**Fix Template**: `parseFloat($('#field').val()) || 0`

---

### BIZ-004: toFixed() Missing on Currency/Weight Display
**Detection**: Financial amount displayed without `.toFixed(2)` or `.toFixed(3)` for weight
**Risk**: Shows `10.1` instead of `10.10`, or `5.12345` instead of `5.123`
**Severity**: P2
**Fix Template**: `.toFixed(2)` for currency, `.toFixed(3)` for weight

---

### BIZ-005: Socket Event Without Client Prefix
**Detection**: Socket.IO `emit()` or `on()` without `Globals::$client` channel prefix
**Risk**: Cross-client data leak — Client A sees Client B's rates
**Severity**: P0
**Fix Template**: Prefix all socket events: `socket.on(clientPrefix + ':rate_update', handler)`

---

### BIZ-006: NaN Propagation in Financial Calc
**Detection**: Chain of calculations without `isNaN()` guard
**Risk**: One `NaN` input poisons entire row → wrong rate/total displayed
**Severity**: P1
**Fix Template**:
```javascript
var val = parseFloat(x) || 0;
if (isNaN(val)) val = 0;
// Then use val safely
```

---

## Statistics
- **Total patterns**: 20
- **System (SYS)**: 8 | **Architecture (ARCH)**: 6 | **Business (BIZ)**: 6
- **P0 Critical**: 8 → SYS-001, SYS-002, SYS-004, SYS-005, SYS-008, BIZ-001, BIZ-002, BIZ-005
- **P1 Major**: 7 | **P2 Minor**: 5
- *SYS-008 added 2026-05-12 — sourced from eTail ERP scan (Logimax retail project)*
