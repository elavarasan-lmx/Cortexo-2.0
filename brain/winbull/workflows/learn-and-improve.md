# /learn-and-improve Workflow (v2.0)

> Post-fix knowledge capture — update brain, patterns, postmortem, velocity, and GitHub Issue.
> Purpose: Make the system faster on every iteration. This is what prevents the same bug from appearing again.
> When to run: After EVERY approved fix via /fix-bug. Also monthly for metrics review.

## Usage
Say: `/learn-and-improve [BUG_ID]`

---

## Step 0: Quick Impact Assessment

Before updating, assess what changed:

| Change Type | If Yes → Update | If No → Skip |
|---|---|---|
| Method signature/behavior changed? | METHOD_INDEX.md | Skip method update |
| Data flow / AJAX endpoint changed? | DATA_FLOW.md | Skip flow update |
| Business rule corrected or added? | 12_business_rules.md + BUSINESS_RULES.md | Skip |
| Cancel-reversal gap fixed? | CLEANUP_GAPS.md (in _SYSTEM/) | Skip |
| Security pattern fixed? | 11_bug_patterns.md + DANGER_ZONES.md | Skip |
| Cross-module tables/models touched? | _SYSTEM/ documents | Skip |

> Always update: Anti-patterns register, Pattern library, Bug status in 7_bugs_and_issues.md, Fix velocity, GitHub Issue

---

## Step 0b: Capture Fix Velocity

Record timing for sprint planning:
1. Note the timestamp when the bug fix was started (from ACTIVE_BUGS.md)
2. Calculate duration: `{NOW} - {Started}`
3. Append to `brain/winbull/_SYSTEM/FIX_VELOCITY.md` (create if not exists):
```
| {BUG_ID} | {MODULE} | {SEVERITY} | {TRACK} | {CATEGORY} | {duration_minutes} | {DATE} |
```
4. After 10+ entries, velocity data enables sprint time estimates:
   - "Transaction bugs average X minutes"
   - "Business bugs average Y minutes"

---

## Step 1: Update Module Brain

### 1a. Anti-Pattern Entry

If a module brain exists (`brain/winbull/modules/{MODULE}/`), add to `MODULE_BRAIN.md` → Anti-Patterns Register:

```markdown
### {BUG_ID}: {Bug Title} ✅ FIXED

| Bug ID   | Anti-Pattern              | Fix Applied               | Date   |
|----------|---------------------------|---------------------------|--------|
| {BUG_ID} | {What was wrong — 1 line} | {What was fixed — 1 line} | {date} |

**Prevention**: {What coding practice would have prevented this?}
```

### 1b. "Why It Was Done This Way" Note

If the fix reveals **developer intent** that wasn't obvious, add a note:

```markdown
> **Note ({BUG_ID})**: The `DELETE-then-INSERT` pattern in estimation edit
> was intentional to avoid UPDATE complexity with variable-length child arrays.
> However, it creates a data-loss window if the INSERT fails after DELETE.
```

### 1c. Field-Level Data Flow (if applicable)

If the bug involved a field flowing across layers, document:
```markdown
| Field        | DB Column          | PHP Variable     | JS Variable | HTML Element    |
|--------------|--------------------|------------------|-------------|-----------------|
| {field_name} | `{table}.{column}` | `$data['{key}']` | `{js_var}`  | `#{element_id}` |
```

### 1d. Update _SYSTEM/ (if cross-module impact)

If `brain/winbull/_SYSTEM/` exists AND fix touched a shared table or DANGER_ZONE:
1. Update `CROSS_MODULE_BUGS.md` — add resolved bug entry with date and fix summary
2. If cancel-reversal gap fixed → update `CLEANUP_GAPS.md` (mark resolved)
3. If security pattern fixed → update `DANGER_ZONES.md` (mark resolved)
4. If hardcoded value replaced with config → update `HARDCODED_VALUES.md` (mark resolved)
5. If new cross-module risk discovered → add to appropriate `_SYSTEM/` doc
6. If `_SYSTEM/` does NOT exist → skip this step

---

## Step 2: Update Bug Pattern Library

Read `brain/winbull/11_bug_patterns.md`.

**If it matched an existing pattern** (SYS-00x / BIZ-00x / ARCH-00x):
- Confirm the module is listed under "Modules Found In"
- If fix deviated from template → update the fix template with the improved version

**If it's a genuinely new pattern:**
Generate next Pattern ID: `SYS-{N+1}` / `BIZ-{N+1}` / `ARCH-{N+1}`

Add full entry:
```markdown
## SYS-{N}: {Pattern Name}
**Severity**: P0/P1/P2
**Category**: Security / Transaction / Logic / Validation

**Description**: {What the bug is and why it's dangerous}

**Detection**:
\```bash
grep -r "{pattern}" Project/winbullstaging/
\```

**Fix Template**:
Before:
\```php
// Wrong code
\```

After:
\```php
// Fixed code
\```

**Modules Found In**: {MODULE_NAME}
```

---

## Step 2b: Postmortem Capture (if AI was wrong)

If the final root cause differs from the initial diagnosis:

Add to `brain/winbull/_SYSTEM/POSTMORTEM_LOG.md` (create if not exists):

```markdown
### POST-{NNN}: {BUG_ID} — {Date}

- **Symptom**: What was reported
- **What AI Suggested (WRONG)**: The incorrect diagnosis/fix
- **What Was Actually Wrong**: The real root cause
- **Why AI Was Wrong**: What thinking pattern failed
- **Correct Approach**: What should have been done
- **Lesson**: **{One-sentence rule in bold}**
```

> This is how the system learns WITHOUT interviewing senior developers.
> Every wrong diagnosis becomes a rule that prevents the same mistake.

---

## Step 2c: Update DIAGNOSTIC_PLAYBOOK.md

If this fix reveals a new **symptom → suspect mapping**:

1. Open `brain/winbull/_SYSTEM/DIAGNOSTIC_PLAYBOOK.md`
2. Does the symptom match an existing RULE-DX-{NNN}?
   - **Yes**: Add this module/scenario to the existing rule's examples
   - **No**: Add new rule:
     ```
     ### RULE-DX-{NNN}: {Symptom Category}
     SUSPECT FIRST: {What to check first}
     CHECK: {Exact file/method/line}
     NEVER DO: {Wrong approaches}
     Ripple check: {downstream systems to verify}
     ```
3. If a new NEVER rule discovered → add to `DANGER_ZONES.md`

---

## Step 3: Update 7_bugs_and_issues.md

1. Find the bug entry in `brain/winbull/7_bugs_and_issues.md`
2. Update status to `✅ Fixed` with fix date
3. Add one-line fix summary to the entry

---

## Step 4: Generate Fix Report Entry

Append to `brain/winbull/_SYSTEM/FIX_REPORTS/{MODULE}_FIX_REPORT.md` (create if doesn't exist):

```markdown
---
### Fix: {BUG_ID} — {BUG_TITLE}
- **Date:** {TODAY}
- **Track:** A (System) / B (Business)
- **Category:** {category}
- **Severity:** {P0/P1/P2/P3}
- **Files Changed:** {list}
- **Root Cause:** {brief}
- **Fix Applied:** {brief}
- **Tests:** {PASS/FAIL — N tests, M assertions}
- **Pattern:** {PAT-XXX matched / NEW pattern added / N/A}
- **Rollback:** {reference to rollback plan}
---
```

---

## Step 4b: Close GitHub Issue (if tracked)

> Uses GitHub MCP server for Winbull issues tracked on GitHub.

1. Find the GitHub Issue number from the local bug entry or ACTIVE_BUGS.md
2. If no GitHub Issue exists → skip this step
3. Add close comment via `github-mcp-server`:
   ```
   mcp_github-mcp-server_add_issue_comment(
     owner: "WTWeb-VijayBullion" or repo owner,
     repo: "{REPO_NAME}",
     issue_number: {N},
     body: "✅ Bug Fixed\n\n**Fix Summary**: {summary}\n**Files Changed**: {list}\n**Root Cause**: {brief}\n**Pattern**: {PAT-ID or Novel}\n\nFixed by: {developer}\nFix Date: {TODAY}"
   )
   ```
4. Close issue:
   ```
   mcp_github-mcp-server_update_issue(
     owner: ..., repo: ..., issue_number: {N},
     state: "closed"
   )
   ```

---

## Step 4c: Update Active Bug Tracker

1. Open `brain/winbull/_SYSTEM/ACTIVE_BUGS.md` (create if not exists)
2. Move the bug from **In-Progress** to **Recently Completed**:
   ```
   | {BUG_ID} | {MODULE} | {SEVERITY} | {1-line fix summary} | {NOW} | {duration} |
   ```
3. Keep only the last 10 entries in Recently Completed (archive older ones)

---

## Step 5: Post-Fix Closure Checklist

Verify ALL items before calling the bug CLOSED:

- [ ] Anti-pattern added to MODULE_BRAIN.md (Step 1a)
- [ ] 11_bug_patterns.md updated or new pattern added (Step 2)
- [ ] 7_bugs_and_issues.md status updated to ✅ Fixed (Step 3)
- [ ] Fix report entry generated (Step 4)
- [ ] Fix velocity captured in FIX_VELOCITY.md (Step 0b)
- [ ] GitHub Issue closed with fix summary (Step 4b) — if tracked
- [ ] Active Bug Tracker updated (Step 4c)
- [ ] If new business rule discovered → added to 12_business_rules.md
- [ ] If cancel-reversal gap fixed → CLEANUP_GAPS.md updated
- [ ] If DANGER_ZONE violation fixed → DANGER_ZONES.md updated
- [ ] If cross-module tables touched → _SYSTEM/ updated (Step 1d)
- [ ] If AI was wrong → POSTMORTEM_LOG.md entry added (Step 2b)
- [ ] DIAGNOSTIC_PLAYBOOK.md updated if new symptom→suspect found (Step 2c)
- [ ] **Bug is officially CLOSED** ✅

---

## Step 6: Monthly Metrics Review

Run monthly (after completing a sprint):

| Metric | Target | Current |
|---|---|---|
| Time to fix P0 | Same day | — |
| Time to fix P1 | ≤ 3 business days | — |
| First-fix success rate | ≥ 90% (no regressions) | — |
| Bugs per module per month | Trending ↓ | — |
| Pattern library reuse rate | Trending ↑ | — |

Monthly checklist:
- [ ] Review FIX_VELOCITY.md — which bug categories are slowest?
- [ ] Identify top 3 buggiest modules → prioritize brain building
- [ ] Identify recurring patterns → add to 11_bug_patterns.md
- [ ] Check if any module brain is stale (code changed but brain not updated)
- [ ] Archive completed sprint entries in 7_bugs_and_issues.md

---

## Step 7: Brain Staleness Check

For each module with a brain in `brain/winbull/modules/`:
1. Check if controller/model/JS files were modified since the brain was last updated
2. If stale → flag: "Module Brain for {MODULE_NAME} may be outdated — re-run /build-module-brain (Refresh mode)"
3. Priority: modules with active bugs get updated first

---

## Completion Report

```
✅ Learn & Improve cycle complete — {BUG_ID}

   Brain updates: {N} modules updated
   Anti-patterns added: {N} entries
   Pattern library: {N} existing patterns updated, {M} new patterns added
   Fix report: Generated in _SYSTEM/FIX_REPORTS/
   Bug velocity captured: {N} min
   Postmortem: {YES — POST-{NNN} / NO}
   DIAGNOSTIC_PLAYBOOK: {N} rules updated/added
   GitHub Issue: {#{N} closed / N/A (not tracked)}

   7_bugs_and_issues.md: {BUG_ID} → ✅ Fixed
   ACTIVE_BUGS.md: Moved to Recently Completed
   Total fixed this sprint: {N}/{TOTAL}

   Staleness check:
   ├── Up-to-date: {list}
   └── Stale (needs refresh): {list}
```
