# /system-health Workflow (v2.0)

> Cross-module risk heatmap, brain coverage, and systemic pattern analysis.
> Purpose: Before sprint planning or management reporting — see WHERE the real risk is.
> When to use: Weekly, before any major change, or when deciding which module to audit next.
> Differs from: `/overall-bug-dashboard` (bug-status focused), `/sprint-status` (sprint-level only)

## Usage
Say: `/system-health`

---

## Prerequisites
- At least 2 modules have been audited via `/audit-module`
- `7_bugs_and_issues.md` is up to date
- `11_bug_patterns.md` exists

---

## Step 1: Scan All Bug Data

Read `brain/winbull/7_bugs_and_issues.md`:
- Extract all bugs by module, severity, and status
- Group: P0 / P1 / P2 / P3 per module
- Count: Fixed ✅ / Applied ⚠️ / Open 🔴

---

## Step 2: Scan Pattern Library

Read `brain/winbull/11_bug_patterns.md`:
- For each pattern, note which modules it appears in
- Count: patterns found in 1 module / 2 modules / 3+ modules (systemic)
- Systemic = fix once, template reusable across all modules

---

## Step 3: Generate Risk Heatmap

```markdown
# System Health Report — {DATE}

## Module Risk Heatmap

| Module | Total Bugs | P0 | P1 | P2 | P3 | Fixed | Open | Risk Score |
|---|---|---|---|---|---|---|---|---|
| Booking | {N} | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Margin | {N} | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| MobileAPI | {N} | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Admin | {N} | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Web Frontend | {N} | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Rate Engine | {N} | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| Socket Layer | {N} | {N} | {N} | {N} | {N} | {N} | {N} | 🔴/🟡/🟢 |
| **TOTAL** | | | | | | | | |

**Risk Score**: 🔴 = any open P0, 🟡 = open P1s, 🟢 = P2/P3 only or all fixed

## Category Distribution (System-Wide)

| Category | Count | Modules Affected | Most Common Fix |
|---|---|---|---|
| Security | {N} | {list} | {PAT-ID or description} |
| Transaction | {N} | {list} | |
| Logic/Calc | {N} | {list} | |
| Validation | {N} | {list} | |
| Query | {N} | {list} | |
| Variable | {N} | {list} | |
| Integration | {N} | {list} | |
| Performance | {N} | {list} | |

## Systemic Patterns (Found in 3+ Modules)

| Pattern | ID | Modules | Severity | Status |
|---|---|---|---|---|
| {Pattern Name} | {PAT-ID} | {list of modules} | {P0/P1/P2} | {N fixed, M open} |

> ⚠️ Systemic patterns should be prioritized — fixing them once creates a template for all modules.

## Brain Coverage Status

| Module | Brain Built? | Last Updated | Audit Done? | Coverage % | Ready for Fix? |
|---|---|---|---|---|---|
| Booking | ✅/❌ | {date} | ✅/❌ | {N}% | ✅/❌ |
| Margin | ✅/❌ | {date} | ✅/❌ | {N}% | ✅/❌ |
| MobileAPI | ✅/❌ | {date} | ✅/❌ | {N}% | ✅/❌ |
| Admin | ✅/❌ | {date} | ✅/❌ | {N}% | ✅/❌ |
| Web Frontend | ✅/❌ | {date} | ✅/❌ | {N}% | ✅/❌ |
| Rate Engine | ✅/❌ | {date} | ✅/❌ | {N}% | ✅/❌ |

## Security Danger Zones (Always Check)

| Risk | Status | Module | Action |
|---|---|---|---|
| SYS-005: 86 unauthenticated Mobile API endpoints | 🔴 OPEN | MobileAPI | WhiteListDomainMiddleware disabled |
| SYS-008: OTP == comparison | Check | All | grep for `== $otp` |
| BR-CX001: Cancel-reversal gaps | Check | Booking/Margin | Run audit |

## Unaudited Modules

| Module | Brain Exists? | Estimated Risk | Recommended Action |
|---|---|---|---|
| {MODULE} | Yes/No | High/Medium/Low | Build brain → Audit / Audit next / Low priority |

**Risk estimation for unaudited modules**:
- If similar modules have high bug counts → estimate high
- If module handles money/inventory → estimate high
- If module is rarely used → estimate low

## Recommendations

1. **Next module to audit**: {MODULE} — {reason}
2. **Systemic fix priority**: {PATTERN} — affects {N} modules
3. **Quick wins**: {N} bugs with fix templates ready across all modules
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
4. Brain staleness/coverage warnings
5. Unaudited modules with estimated risk

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

   Brain coverage:
   ├── Built: {N} modules
   ├── ≥80% coverage: {N} modules (audit-ready)
   └── No brain: {N} modules

   Systemic patterns: {N} (affecting 3+ modules)
   Quick wins available: {N} (templates in 11_bug_patterns.md)

   Report saved: brain/winbull/_SYSTEM/SYSTEM_HEALTH_{DATE}.md
```
