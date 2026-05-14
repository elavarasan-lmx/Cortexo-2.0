# /scan-cross-module Workflow (v1.0)

> After fixing a bug in one module, check ALL other modules for the same pattern.
> Copy-paste development = if one module has a bug, others likely do too.

## Usage
Say: `/scan-cross-module [pattern or bug ID]`
Auto-triggered: Called by `/fix-bug` Step 8 after every fix.

---

## Prerequisites

- Bug fix completed via `/fix-bug`
- Pattern ID known (e.g., SYS-001, BIZ-002)
- Read `brain/winbull/11_bug_patterns.md` for detection rules

---

## Step 1: Extract Detection Pattern

From the fix just applied:
- What grep would find this same bug?
- Example: `$_POST[` for raw POST (SYS-001)
- Example: `trans_commit()` without `trans_status()` for SYS-002

Check `11_bug_patterns.md` — does this match an existing pattern?
- YES → use existing detection rule
- NO → create new detection rule + add to `11_bug_patterns.md`

---

## Step 2: Scan All Modules

```bash
# For controller bugs
grep -rn "{PATTERN}" /path/to/admin/application/controllers/
grep -rn "{PATTERN}" /path/to/application/controllers/
grep -rn "{PATTERN}" /path/to/mobileapi/controllers/

# For model bugs
grep -rn "{PATTERN}" /path/to/admin/application/models/
grep -rn "{PATTERN}" /path/to/application/models/

# For JS bugs
grep -rn "{PATTERN}" /path/to/admin/assets/js/
```

---

## Step 3: Filter Results

1. Remove false positives (comments, already-fixed instances)
2. Remove the module that was just fixed
3. Group by module

---

## Step 4: Report Findings

```
🔍 Cross-Module Scan: {PATTERN_NAME}
   Source: {BUG_ID} fixed in {FIXED_MODULE}

   Found same pattern in {N} other modules:
   ├── {Module_A}: {file}:L{line} — {code snippet}
   ├── {Module_B}: {file}:L{line} — {code snippet}
   └── {Module_C}: {file}:L{line} — {code snippet}

   Clean modules: {list}
```

---

## Step 5: Prioritize

- P0 patterns in financial modules → fix first
- P1 patterns in customer-facing modules → fix second
- P2/P3 → add to backlog in `7_bugs_and_issues.md`

---

## Output

```
✅ Cross-Module Scan complete
   Pattern: {PATTERN_NAME}
   Modules scanned: {N}
   New findings: {N} in {N} modules
   Next: /bug-intake for each new finding
```
