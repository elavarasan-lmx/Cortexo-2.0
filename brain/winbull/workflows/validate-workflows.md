# /validate-workflows Workflow (v1.0)

> Self-test the workflow system for internal consistency, cross-references, and missing files.
> Purpose: Ensure all workflow files exist, reference each other correctly, and have required supporting docs.
> When to use: After modifying any workflow, before onboarding, or monthly health check.

## Usage
Say: `/validate-workflows`

---

## Step 0: Pre-Flight Auto-Setup

> Auto-detects machine-specific values and saves them to `brain/winbull/_SYSTEM/.env`.
> If `.env` already exists with all values populated, **skip to Step 1**.

#### 0a. Detect PROJECT_ROOT

```bash
git rev-parse --show-toplevel
```
Save result as `PROJECT_ROOT`.

#### 0b. Detect PHP_PATH

```bash
which php
```
- If found → save as `PHP_PATH`
- If not found → WARN: "PHP not found in PATH. Set PHP_PATH manually."

#### 0c. Detect ISSUE_PLATFORM from Git Remote

```bash
git remote -v
```
Parse the remote URL:
- Contains `github.com` → `ISSUE_PLATFORM=github`
  - Parse owner/repo: `github.com/{OWNER}/{REPO}.git` → save `REPO_OWNER`, `REPO_NAME`
- Contains other host → `ISSUE_PLATFORM=gitea`
  - Parse accordingly

#### 0d. Display Setup Summary

```
✅ Environment auto-configured:
   Project root:  {PROJECT_ROOT}
   PHP:           {PHP_PATH}
   Platform:      {ISSUE_PLATFORM} ({REPO_OWNER}/{REPO_NAME})

   Saved to: brain/winbull/_SYSTEM/.env
```

---

## Step 1: Check All Workflow Files Exist

List all `.md` files in `brain/winbull/workflows/`. Verify these core workflows exist:

| #   | Workflow                 | File                          | Status |
| --- | ------------------------ | ----------------------------- | ------ |
| 1   | Build Module Brain       | `build-module-brain.md`       | ✅/❌ |
| 2   | Module Bug Audit         | `module-bug-audit.md`         | ✅/❌ |
| 3   | Bug Intake & Triage      | `bug-intake-triage.md`        | ✅/❌ |
| 4   | Fix Single Bug           | `fix-single-bug.md`           | ✅/❌ |
| 5   | Fix Architecture Bug     | `fix-architecture-bug.md`     | ✅/❌ |
| 6   | Fix Business Bug         | `fix-business-bug.md`         | ✅/❌ |
| 7   | Test & Verify            | `test-and-verify.md`          | ✅/❌ |
| 8   | Learn & Improve          | `learn-and-improve.md`        | ✅/❌ |
| 9   | Manage Bug Patterns      | `manage-bug-patterns.md`      | ✅/❌ |
| 10  | GitHub Bug Tracking      | `github-bug-tracking.md`      | ✅/❌ |
| 11  | Sprint Status            | `sprint-status.md`            | ✅/❌ |
| 12  | System Health            | `system-health.md`            | ✅/❌ |
| 13  | Overall Bug Dashboard    | `overall-bug-dashboard.md`    | ✅/❌ |
| 14  | Validate Workflows       | `validate-workflows.md`       | ✅/❌ |

---

## Step 2: Check Cross-References

Scan all workflow files for `/workflow-name` references. Verify each referenced workflow exists:

Common references to check:

- `/fix-single-bug` → should reference `/bug-intake-triage`, `/fix-architecture-bug`, `/fix-business-bug`, `/test-and-verify`, `/learn-and-improve`
- `/learn-and-improve` → should reference `/fix-bug`, `/github-bug-tracking`
- `/module-bug-audit` → should reference `/build-module-brain`, `/fix-single-bug`
- `/bug-intake-triage` → should reference `/github-bug-tracking`
- `/overall-bug-dashboard` → should reference `/sprint-status`, `/system-health`

---

## Step 3: Check File Path References

Scan for hardcoded file paths in workflows. Flag any that don't use config variables:

| Pattern | Should Be |
|---|---|
| Hardcoded server paths | `{PROJECT_ROOT}` |
| Hardcoded repo names | `{REPO_NAME}` |
| Hardcoded repo owners | `{REPO_OWNER}` |

---

## Step 4: Check Supporting Files

Verify all referenced files/templates exist:

| File | Purpose | Required | Status |
|---|---|---|---|
| `brain/winbull/7_bugs_and_issues.md` | Bug tracker | ✅ | |
| `brain/winbull/11_bug_patterns.md` | Pattern library | ✅ | |
| `brain/winbull/12_business_rules.md` | Business rules | ✅ | |
| `brain/winbull/_SYSTEM/FIX_VELOCITY.md` | Fix timing | Optional | |
| `brain/winbull/_SYSTEM/ACTIVE_BUGS.md` | Active bug tracker | Optional | |
| `brain/winbull/_SYSTEM/DANGER_ZONES.md` | Security risks | ✅ | |
| `brain/winbull/_SYSTEM/DIAGNOSTIC_PLAYBOOK.md` | Diagnosis rules | Optional | |
| `brain/winbull/_SYSTEM/POSTMORTEM_LOG.md` | AI learning log | Optional | |
| `brain/winbull/_SYSTEM/CROSS_MODULE_BUGS.md` | Cross-module issues | Optional | |

---

## Step 5: Version Check

For each workflow file:
- [ ] Has version header (e.g., `v1.0`, `v2.0`)
- [ ] Has clear "Usage" section
- [ ] Has "Completion Report" section

---

## Step 6: Generate Validation Report

```markdown
# Workflow Validation Report — {DATE}

## Files

- Workflow files found: {N}/14
- Missing: {list or "None"}

## Cross-References

- Total references checked: {N}
- Broken references: {list or "None"}

## Hardcoded Paths

- Hardcoded paths found: {N}
- {list of files with hardcoded paths}

## Supporting Files

- Required files present: {N}/{TOTAL_REQUIRED}
- Missing required: {list or "None"}
- Optional missing: {list or "None — all created"}

## Version Headers

- With version: {N}/14
- Without version: {list}

## Overall: {✅ PASS / ⚠️ WARNINGS / ❌ FAIL}
```

---

## Completion Report

```
✅ Workflow Validation — {DATE}

   Workflows: {N}/14 present
   Cross-references: {N} checked, {N} broken
   Hardcoded paths: {N} found
   Supporting files: {N}/{N} required present
   Version headers: {N}/{N}

   Overall: {✅ PASS / ⚠️ WARNINGS / ❌ FAIL}
   {List any issues found}
```
