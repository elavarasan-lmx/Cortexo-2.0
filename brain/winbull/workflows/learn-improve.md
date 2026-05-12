# /learn-improve Workflow

> Run AFTER every approved bug fix.
> This is what makes the brain get smarter over time.
> Purpose: capture patterns, log postmortems, track velocity.

## Usage
Say: `/learn-improve [BUG_ID]`

---

## When to Run
- Automatically triggered at end of `/fix-bug` Step 8
- After any user-confirmed ✅ fix in `7_bugs_and_issues.md`

---

## Step 1: Pattern Library Update

1. Open `11_bug_patterns.md`
2. Did this bug match an **existing pattern?**
   - YES → Add the module name to the pattern's "Found In" note
   - YES + fix template was different → Update the fix template with improved version
3. Was this a **genuinely new pattern?**
   - YES → Add new entry:
     ```
     ### SYS/ARCH/BIZ-NNN: {Pattern Name}
     **Detection**: {grep command or check}
     **Risk**: {what can go wrong}
     **Severity**: P0/P1/P2
     **Fix Template**:
     [before/after code]
     ```
   - Update Statistics at bottom of `11_bug_patterns.md`

---

## Step 2: Postmortem Capture (Only if diagnosis was WRONG)

If the final root cause was **different** from your initial diagnosis:

Add entry to `7_bugs_and_issues.md` → Postmortem section (create if not exists):

```
### POST-{NNN}: {BUG_ID} — {Date}
- **Symptom**: What was reported
- **What I Diagnosed First (WRONG)**: {incorrect root cause}
- **What Was Actually Wrong**: {real root cause}
- **Why I Was Wrong**: {thinking failure — e.g., didn't check model, assumed JS was the issue}
- **Correct Approach**: {what to do next time}
- **Lesson**: **{one-sentence rule in bold}**
```

> This is how the system learns from mistakes without re-making them.

---

## Step 3: Fix Velocity Log

Record how long the fix took. After 10+ entries, this enables sprint estimates.

Append to bottom of `7_bugs_and_issues.md` → Velocity section (create if not exists):

```
| {BUG_ID} | {Module} | {Severity} | {Track A/B} | {Minutes taken} | {Date} |
```

**Estimate categories** (update as data accumulates):
- Pattern-match bugs (template ready): avg ~15 min
- Novel Track A (system): avg ~30–45 min
- Track B (business, needs human): avg ~60+ min

---

## Step 4: Brain Staleness Check

1. For the module just fixed, check:
   - Was the affected file modified more recently than the brain artifact?
   - If YES → flag: `⚠️ Brain may be stale for {module} — consider re-reading source`
2. If the fix changed **documented behavior** → update the relevant artifact:
   - New validation rule → `13_validation_rules.md`
   - New business rule discovered → `12_business_rules.md`
   - New warning code used → `14_warning_standards.md`
   - UI pattern changed → `15_ui_blueprint.md`

---

## Step 5: Cross-Module Pattern Propagation

If a new pattern was added in Step 1:
1. Check if `/scan-cross-module` was already run for this pattern
2. If NOT → trigger: "Run `/scan-cross-module {pattern_name}` to find all other occurrences"
3. Log count: "Pattern found in {N} other modules — add to audit queue"

---

## Completion Report

```
✅ Learn & Improve cycle complete for {BUG_ID}
   Pattern: {Existing PAT-XXX updated / NEW pattern SYS-NNN added / No pattern}
   Postmortem: {Added POST-NNN / No diagnosis error}
   Velocity: {N} minutes logged
   Brain staleness: {Up to date / ⚠️ Stale: check {artifact}}
   Cross-module: {N} other modules may have same pattern → scan queued
```
