# /system-health Workflow

> Cross-module risk heatmap and system-wide bug analysis.
> Purpose: Before sprint planning or management reporting — see WHERE the real risk is.
> When to use: Weekly, before any major change, or when deciding which module to audit next.

## Usage
Say: `/system-health`

---

## Prerequisites
- At least 2 modules have been audited via `/audit-module`
- `7_bugs_and_issues.md` is up to date

---

## Step 1: Scan All Bug Data

Read `7_bugs_and_issues.md`:
- Extract all bugs by module, severity, and status
- Group: P0 / P1 / P2 / P3 per module
- Count: Fixed ✅ / Applied ⚠️ / Open 🔴

---

## Step 2: Scan Pattern Library

Read `11_bug_patterns.md`:
- For each pattern, note which modules it appears in
- Count: patterns found in 1 module / 2 modules / 3+ modules (systemic)
- Systemic = fix once, template reusable across all modules

---

## Step 3: Generate Risk Heatmap

```markdown
# System Health Report — {DATE}

## Module Risk Heatmap

| Module | Total Bugs | P0 | P1 | P2 | Fixed | Open | Risk |
|---|---|---|---|---|---|---|---|
| Booking | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Margin | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| MobileAPI | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Admin | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Web Frontend | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Rate Engine | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Socket Layer | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| **TOTAL** | | | | | | | |

**Risk**: 🔴 = any open P0 | 🟡 = open P1 only | 🟢 = P2/P3 or all fixed

## Category Distribution (System-Wide)

| Category | Count | Modules Affected | Pattern ID |
|---|---|---|---|
| Security | {N} | {list} | SYS-00x |
| Transaction | {N} | {list} | SYS-00x |
| Business Logic | {N} | {list} | BIZ-00x |
| Validation | {N} | {list} | SYS-00x |
| Query/DB | {N} | {list} | SYS-00x |
| Performance | {N} | {list} | ARCH-00x |

## Systemic Patterns (Found in 3+ Modules)

| Pattern | ID | Modules | Severity | Action |
|---|---|---|---|---|
| {Pattern Name} | PAT-XXX | {list} | P0/P1 | Fix template ready → /fix-bug |

> ⚠️ Systemic patterns = highest ROI fixes. One fix template covers all modules.

## Brain Coverage Status

| Module | Brain Built? | Last Updated | Audit Done? | Ready for Fix? |
|---|---|---|---|---|
| Booking | ✅/❌ | {date} | ✅/❌ | ✅/❌ |
| Margin | ✅/❌ | {date} | ✅/❌ | ✅/❌ |
| MobileAPI | ✅/❌ | {date} | ✅/❌ | ✅/❌ |
| Admin | ✅/❌ | {date} | ✅/❌ | ✅/❌ |
| Web Frontend | ✅/❌ | {date} | ✅/❌ | ✅/❌ |
| Rate Engine | ✅/❌ | {date} | ✅/❌ | ✅/❌ |

## Security Danger Zones (Always Check)

| Risk | Status | Module | Action |
|---|---|---|---|
| SYS-005: 86 unauthenticated Mobile API endpoints | 🔴 OPEN | MobileAPI | WhiteListDomainMiddleware disabled |
| SYS-008: OTP == comparison | Check | All | grep for `== $otp` |
| BR-CX001: Cancel-reversal gaps | Check | Booking/Margin | Run audit |

## Recommendations

1. **Next module to audit**: {MODULE} — reason: {open P0s / no brain / highest risk}
2. **Systemic fix priority**: {PATTERN} — affects {N} modules, template ready
3. **Quick wins**: {N} bugs with fix templates already in 11_bug_patterns.md
4. **Danger zone**: {DZ-00x} — {status}
```

---

## Step 4: Save Report

Save to: `brain/winbull/_SYSTEM/SYSTEM_HEALTH_{DATE}.md`

Keep last 5 reports for trend comparison.

---

## Step 5: Present Summary

Highlight to user:
1. Any P0 bugs still open → action required NOW
2. Which module has highest risk → audit that next
3. Any systemic patterns with templates ready → quick wins
4. Brain staleness warnings

---

## Completion Report

```
✅ System Health Report — {DATE}

   Modules with bugs: {N}
   Total open bugs: {N} ({N} P0, {N} P1, {N} P2, {N} P3)
   Fixed this sprint: {N}

   🔴 Highest Risk: {MODULE} ({N} open P0s)
   🟡 Watch: {MODULE} ({N} open P1s)
   🟢 Clean: {MODULE} (all fixed or P2/P3 only)

   Systemic patterns: {N} (affecting 3+ modules)
   Quick wins available: {N} (templates in 11_bug_patterns.md)

   Report saved: brain/winbull/_SYSTEM/SYSTEM_HEALTH_{DATE}.md
```
