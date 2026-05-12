# /audit-module Workflow

> Run a complete 6-round deep audit on any module.
> This is the **Bug Discovery** phase — it finds bugs. Use /fix-bug to fix them.

## Usage
Say: `/audit-module [ModuleName]`
Example: `/audit-module C_booking` or `/audit-module Booking_model`

---

## Step 0: Pre-Flight

1. Read `11_bug_patterns.md` — load all 20 detection patterns
2. Read `12_business_rules.md` — load business constraints
3. Read `13_validation_rules.md` — load validation standards
4. Read `15_ui_blueprint.md` — load UI standards
5. Check `7_bugs_and_issues.md` — note any existing bugs for this module (skip already-known ones)

---

## Step 1: Round 0 — Pattern Pre-Scan

Run EVERY detection rule from `11_bug_patterns.md` against module files:

For each pattern (SYS-001 → BIZ-006, SYS-008):
1. Grep/search against controller, model, JS files
2. If match → create preliminary bug entry with fix template ready
3. Track: matches found / patterns scanned

```
Round 0 Summary:
├── Patterns scanned: 20
├── Matches found: {N}
└── Instant bugs (fix template ready): {list}
```

---

## Step 2: Round 1 — Controller Analysis

Focus areas:
- [ ] Save/update/delete paths — trace every `if/else` branch
- [ ] `trans_begin()`/`trans_commit()`/`trans_rollback()` pairing (SYS-002)
- [ ] Debug statements `echo`, `print_r`, `var_dump`, `exit` (SYS-007)
- [ ] `$_POST` vs `$this->input->post()` usage (SYS-001)
- [ ] GET-based delete endpoints (SYS-004)
- [ ] Missing `has_rights()` / permission checks
- [ ] Missing child table cleanup on delete
- [ ] **Cancel-reversal completeness** (BR-CX001): Count tables save writes to. Cancel must reverse ALL of them.
- [ ] OTP comparison uses `===` not `==` (SYS-008)

---

## Step 3: Round 2 — Model & Data-Flow

Focus areas:
- [ ] SQL injection via raw `$this->db->query("... $var ...")` (SYS-001)
- [ ] Cartesian JOINs — missing ON condition (ARCH-006)
- [ ] Missing `GROUP BY` with aggregate functions
- [ ] Edit lifecycle data loss — fields in SELECT but not in UPDATE
- [ ] Missing WHERE scope filters (status, branch, company)
- [ ] `log_action()` / `admin_log` insert after every CRUD (BR-U003)

---

## Step 4: Round 3 — DB Schema Cross-Reference

Focus areas:
- [ ] Column type mismatches (PHP sends decimal, DB column is int)
- [ ] MyISAM engine on tables used within transaction blocks (ARCH-005)
- [ ] Missing indexes on JOIN/WHERE columns
- [ ] Soft-delete filter (`status`, `is_deleted`) always applied

---

## Step 5: Round 4 — JS & View Layer

Focus areas:
- [ ] `alert()` / `confirm()` instead of `showToast()` / `showConfirmModal()` (BANNED)
- [ ] Missing AJAX `error:` handler (SYS-003)
- [ ] Duplicate HTML `id` attributes in view files
- [ ] XSS — unescaped `echo $var` in view
- [ ] Missing `#ajax_loader` div in entry view
- [ ] Submit button not disabled during AJAX
- [ ] Hardcoded URLs in AJAX calls (ARCH-002)

---

## Step 6: Round 5 — JS Financial Calculations

Focus areas:
- [ ] `parseFloat()` missing on form values (BIZ-003)
- [ ] `.toFixed(2)` missing on currency display (BIZ-004)
- [ ] `isNaN()` / `|| 0` guards on every calc (BIZ-006)
- [ ] Division by zero — no guard on denominator
- [ ] JS calc ≠ PHP calc (same formula in both?) (BIZ-001)
- [ ] Copy-paste variable mismatch between similar functions
- [ ] **Print ≠ Save** (BR-PR001): Read save formula → read invoice/print view → confirm identical formula

---

## Step 7: Round 6 — Validation & AJAX Endpoints

Focus areas:
- [ ] Missing `return false` after validation failure in JS
- [ ] Missing AJAX `error:` handler (SYS-003)
- [ ] Raw `$_POST` in AJAX endpoints (SYS-001)
- [ ] `trans_commit()` on failure branch (SYS-002)
- [ ] Missing JSON error response

---

## Step 8: Classify Every Bug (Track A or B)

| Track | When | AI Role |
|---|---|---|
| **Track A — System** | Security, query, schema, variable, performance | Full fix + test |
| **Track B — Business** | Wrong rate, wrong weight, missing business rule | Propose fix, get user confirmation |

---

## Completion Report

```
✅ Audit complete for {MODULE_NAME}
   Round 0 (Patterns): {N} matches from 20 patterns
   Round 1 (Controller + Cancel): {N} bugs
   Round 2 (Model): {N} bugs
   Round 3 (Schema): {N} bugs
   Round 4 (JS/View): {N} bugs
   Round 5 (JS Calc + Print=Save): {N} bugs
   Round 6 (Validation): {N} bugs
   ─────────────────────────────
   Total: {TOTAL} bugs
   Track A (System): {N} | Track B (Business): {N}
   Auto-fixable (no approval): {N}
   Needs approval: {N}

   Next: /bug-intake → /fix-bug
```
