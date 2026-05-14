# /fix-bug Workflow (v1.0)

> Fix ONE bug at a time. Surgical precision. One commit per fix.
> Core principle: Documentation first → Plan → Fix → Ripple Check → Test → Approve → Close

## Usage
Say: `/fix-bug [BUG_ID or description]`

---

## Prerequisites

- Bug must be triaged via `/bug-intake` first
- Read `brain/winbull/0_session_start.md` — check dangerous files list
- Read `brain/winbull/11_bug_patterns.md` — check if fix template exists
- Track B (business logic) bugs require human confirmation before coding
- Max 3-5 bugs per session — quality over quantity

---

## Step 0: Duplicate Guard

1. Search `7_bugs_and_issues.md` — is it already marked fixed?
2. If yes → WARN: "This bug was already fixed on {date}. Re-open / Skip?"

---

## Step 1: Diagnose

1. Check `7_bugs_and_issues.md` — confirm bug exists and is not "by design"
2. Read `12_business_rules.md` — identify which business rule is violated
3. Check `11_bug_patterns.md` — does a named pattern match this symptom?
4. Identify:
   - Root cause (not just symptom)
   - Affected file(s) and line number(s)
   - Business rule violated (in plain English)

---

## Step 1b: CONFIDENCE GATE ⚠️ [Mandatory — Never Skip]

After diagnosis, rate confidence level:

### 🟢 HIGH (80%+)
- Pattern match found in `11_bug_patterns.md`
- Root cause is clear, scope is small, no cross-module impact
- → **Proceed to Step 2**

### 🟡 MEDIUM (50–80%)
- Partial pattern match, or root cause has 2–3 possible explanations
- → **Present TOP 3 possible causes WITH evidence for each**
- → Wait for user to choose direction. Do NOT guess.

### 🔴 LOW (<50%)
- Novel bug, unfamiliar code area, no pattern match, or crosses multiple modules
- → **STOP. Do NOT propose a fix.**
- → Present to user:
  1. What symptom you see
  2. What areas you checked
  3. What you DON'T know yet
  4. 2–3 possible causes ranked by likelihood
  5. "Please guide which direction to investigate"

### 🔴 AUTOMATIC LOW CONFIDENCE — Always stop for these:
- Any booking/order financial calculation bug
- Margin / TCS / TDS calculation issues
- Cancel or rollback operations
- Cross-module impact (booking + margin + socket + mobile)
- Socket/rate data mismatch

---

## Step 2: Classify — Track A or B?

| Track | When | AI Role | Human Role |
|---|---|---|---|
| **Track A — System** | Security, transaction, query, schema, performance | Full fix + test | Approve diff |
| **Track B — Business** | Wrong calculation, missing rule, rate formula | Propose fix | Validate business logic BEFORE code |

> **Rule**: Code runs but produces **wrong business results** → Track B. Everything else → Track A.

**Track B** → Present findings first, get business rule confirmation, THEN code.

---

## Step 3: Check Bug Patterns

1. Read `11_bug_patterns.md` — does a fix template already exist for this pattern?
2. If YES → adapt the template (faster + consistent)
3. If NO → write fix from scratch → add new pattern after (in Step 8)

---

## Step 4: Plan & Document Rollback

**Before writing a single line of code**, state:
```
Bug: {ID/title}
Track: A/B
Root cause: {1 line}
Fix: {1 line}
Files to change: {list}
Tables touched: {list — for cancel-reversal check}
Rollback: {1 line — how to undo}
```

---

## Step 5: Apply Fix

- **PHP**: Minimal change. Add comment: `// Bug fix: {ID} — {description}`
- **JS**: Surgical edit. Verify fix doesn't affect counterpart functions (both Add and Edit mode use same JS)
- **DB Schema**: Generate `ALTER TABLE` + rollback SQL. **DO NOT EXECUTE** — present to user.

---

## Step 5b: RIPPLE CHECK [Mandatory — Before Approval Gate]

> A fix is NOT complete until all downstream consumers are verified.

After applying fix, trace ALL affected consumers:

### For Booking / Financial Calculation fixes:
- [ ] JS calculation correct?
- [ ] PHP calculation matches JS? (both layers — BIZ-001)
- [ ] Display shows the corrected value?
- [ ] Save sends corrected value to DB?
- [ ] Admin panel shows same value?
- [ ] Invoice/print view uses same formula? (BR-PR001)

### For Cancel / Rollback fixes:
- [ ] `dt_booking` status updated?
- [ ] `dt_margin` margin restored?
- [ ] `admin_log` cancellation logged?
- [ ] SMS notification sent?
- [ ] If limit order: rate alert re-enabled? (BR-CX001)

### For Rate / Socket fixes:
- [ ] Socket emits correct value?
- [ ] Web frontend receives and displays correctly?
- [ ] Mobile API returns correct value?
- [ ] Admin panel rate feed shows correctly?

### For Status / Permission fixes:
- [ ] Status changed in correct table?
- [ ] All modules that read this status still work?
- [ ] Log entry created?
- [ ] UI reflects new state?

---

## Step 6: Syntax Check

```bash
php -l {affected_php_file}
```
- If syntax error → fix → re-run before proceeding

---

## Step 7: Approval Gate

Present to user:
```
Bug: {ID} — {Title}
Track: {A/B} | Risk: {Low/Medium/High}
Confidence: 🟢/🟡/🔴

Changed:
  {file}:{lines} — {1-line description}

Ripple Check: ✅ Verified {N} consumers
  {what was checked}

Rollback:
  {1-line rollback instruction}

Approve? (yes / modify / reject)
```

---

## Step 8: Close & Update + Learn Loop

1. Mark bug in `7_bugs_and_issues.md` → ⚠️ Applied (NOT ✅ — user marks that after browser test)
2. Run `/scan-cross-module` — check if same pattern exists in other modules
3. Run `/git-push` — one commit, one bug
4. **Learn Loop** → Run `/learn-improve [BUG_ID]`:
   - Was a new pattern found? → Add to `11_bug_patterns.md`
   - Was the diagnosis wrong at first? → Log in postmortem
   - Was fix velocity captured? (how long did it take)
   - Update `7_bugs_and_issues.md` stats

---

## Completion Report
```
⚠️ Bug {ID} — {TITLE} — Applied (pending user browser verification)
   Track: {A/B}
   Confidence: 🟢/🟡/🔴
   Fix: {1-line summary}
   File: {path}:{lines}
   Ripple: {N} consumers verified
   Rollback: {1-line}
   Next: User browser tests → mark ✅ if confirmed → /learn-improve
```
