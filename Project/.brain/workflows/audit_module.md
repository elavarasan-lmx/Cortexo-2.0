# 🔍 Audit Module Workflow

> 6-round deep scan for any module. Finds bugs; `fix_bug.md` fixes them.
> Adapted from old `.agent/workflows/audit-module.md`
> Last Updated: 2026-05-03

---

## Prerequisites
- Module name identified
- `.brain/rules/business_rules.md` loaded
- `.brain/03_bug_patterns.md` loaded

## Variables
- `{MODULE}` — e.g., booking, trading, customer
- `{LAYER}` — admin, web, mobileapi
- `{CTRL}` — e.g., `Web/admin/application/controllers/C_Booking.php`
- `{MODEL}` — e.g., `Web/admin/application/models/Booking_model.php`
- `{JS}` — e.g., `Web/assets/js/custom/booking.js`
- `{VIEW}` — e.g., `Web/admin/application/views/booking/`

---

## Round 0: Pattern Pre-Scan
Run ALL 19 detection patterns from `03_bug_patterns.md` against module files:
```
grep each SYS/ARCH/BIZ pattern → count matches → create preliminary bugs
```

## Round 1: Controller Analysis
- [ ] Every `if/else` branch in save/update/delete
- [ ] `trans_begin()`/`trans_commit()`/`trans_rollback()` pairing
- [ ] `$_POST` vs `$this->input->post()`
- [ ] `has_rights()` permission checks
- [ ] Debug statements (`echo`, `print_r`, `var_dump`)
- [ ] Missing child table cleanup on delete

## Round 2: Model & Data Flow
- [ ] SQL injection via column name in LIKE/ORDER BY
- [ ] Missing `GROUP BY` with aggregates
- [ ] Variable typos
- [ ] Fields in SELECT but missing in UPDATE
- [ ] `log_action()` after every CRUD
- [ ] Missing WHERE scope filters (branch, company, status)

## Round 3: DB Schema Cross-Reference
- [ ] Column type mismatches (PHP decimal → DB int)
- [ ] MyISAM tables in `trans_begin()` blocks (won't rollback!)
- [ ] Missing indexes on JOIN/WHERE columns
- [ ] Missing foreign key constraints

## Round 4: JS/View Layer
- [ ] Save handler validation completeness
- [ ] Duplicate HTML IDs
- [ ] XSS (unescaped `echo $var`)
- [ ] `showToast()` not `alert()`
- [ ] Submit button disabled during AJAX
- [ ] Loader div `#ajax_loader` present

## Round 5: JS Calculations (Financial)
- [ ] `parseFloat()` on all form values
- [ ] `toFixed(2)` on currency, `toFixed(3)` on weight
- [ ] `isNaN()` / `|| 0` guards
- [ ] Division by zero guards
- [ ] Server vs client calc parity
- [ ] Copy-paste errors between similar functions

## Round 6: Validation & AJAX
- [ ] Missing `return false` after validation fail
- [ ] Missing AJAX `error:` handler
- [ ] `trans_commit()` on failure branch
- [ ] Raw `$_POST` in AJAX endpoints
- [ ] Missing JSON error response

---

## Track Classification

| Track | When | Examples |
|-------|------|---------|
| **A — System** | Code error, security, performance | SQL injection, CSRF, N+1 |
| **B — Business** | Wrong business output | Wrong rate, missing margin check |

> Code runs but wrong results → **Track B**. Everything else → **Track A**.

---

## Auto-Fix (No Approval Needed)
- Missing validation attributes
- `alert()` → `showToast()`
- Missing `log_action()`
- Missing loader div
- `$_POST` → `$this->input->post()`

## DO NOT Auto-Fix (Needs Jerry's Approval)
- Rate/margin/financial calculations
- Tax computations
- DB schema changes
- Unclear business logic

---

## Output Format
```
✅ Audit: {MODULE}
   Round 0 (Patterns): {N} matches
   Round 1 (Controller): {N} bugs
   Round 2 (Model): {N} bugs
   Round 3 (Schema): {N} bugs
   Round 4 (JS/View): {N} bugs
   Round 5 (JS Calc): {N} bugs
   Round 6 (Validation): {N} bugs
   ─────────────────────
   Total: {TOTAL} | Track A: {N} | Track B: {N}
```
