# /learn-and-improve Workflow

> Post-fix knowledge capture — update brain, patterns, postmortem, and velocity.
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

> Always update: Anti-patterns register, Pattern library, Bug status in 7_bugs_and_issues.md

---

## Step 0b: Capture Fix Velocity

Record timing for sprint planning:
1. Note the timestamp when the bug fix was started
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

### 1b. Field-Level Data Flow (if applicable)

If the bug involved a field flowing across layers, document:
```markdown
| Field        | DB Column          | PHP Variable     | JS Variable | HTML Element    |
|--------------|--------------------|------------------|-------------|-----------------|
| {field_name} | `{table}.{column}` | `$data['{key}']` | `{js_var}`  | `#{element_id}` |
```

### 1c. Update _SYSTEM/ (if cross-module impact)

If `brain/winbull/_SYSTEM/` exists AND fix touched a shared table or DANGER_ZONE:
1. Update `CROSS_MODULE_BUGS.md` — add resolved bug entry
2. If cancel-reversal gap fixed → update `CLEANUP_GAPS.md` (mark resolved)
3. If security pattern fixed → update `DANGER_ZONES.md` (mark resolved)
4. If new cross-module risk discovered → add to appropriate `_SYSTEM/` doc

---

## Step 2: Update Bug Pattern Library

Read `brain/winbull/artifacts/11_bug_patterns.md`.

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

1. Find the bug entry in `brain/winbull/artifacts/7_bugs_and_issues.md`
2. Update status to `✅ Fixed` with fix date
3. Add one-line fix summary to the entry

---

## Step 4: Post-Fix Closure Checklist

Verify ALL items before calling the bug CLOSED:

- [ ] Anti-pattern added to MODULE_BRAIN.md (Step 1a)
- [ ] 11_bug_patterns.md updated or new pattern added (Step 2)
- [ ] 7_bugs_and_issues.md status updated to ✅ Fixed (Step 3)
- [ ] Fix velocity captured in FIX_VELOCITY.md (Step 0b)
- [ ] If new business rule discovered → added to 12_business_rules.md
- [ ] If cancel-reversal gap fixed → CLEANUP_GAPS.md updated
- [ ] If DANGER_ZONE violation fixed → DANGER_ZONES.md updated
- [ ] If cross-module tables touched → _SYSTEM/ updated (Step 1c)
- [ ] If AI was wrong → POSTMORTEM_LOG.md entry added (Step 2b)
- [ ] DIAGNOSTIC_PLAYBOOK.md updated if new symptom→suspect found (Step 2c)
- [ ] **Bug is officially CLOSED** ✅

---

## Step 5: Monthly Metrics Review

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

## Step 6: Brain Staleness Check

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
   Bug velocity captured: {N} min
   Postmortem: {YES — POST-{NNN} / NO}
   DIAGNOSTIC_PLAYBOOK: {N} rules updated/added

   7_bugs_and_issues.md: {BUG_ID} → ✅ Fixed
   Total fixed this sprint: {N}/{TOTAL}

   Staleness check:
   ├── Up-to-date: {list}
   └── Stale (needs refresh): {list}
```
