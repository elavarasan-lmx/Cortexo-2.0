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
| 1   | Build Module Brain       | `build-module-brain.md`       | ✅ EXISTS |
| 2   | Module Bug Audit         | `audit-module.md`             | ✅ EXISTS |
| 3   | Bug Intake & Triage      | `bug-intake.md`               | ✅ EXISTS |
| 4   | Fix Single Bug           | `fix-bug.md`                  | ✅ EXISTS |
| 5   | Scan Cross Module        | `scan-cross-module.md`        | ✅ EXISTS |
| 6   | Fingerprint Scan         | `fingerprint-scan.md`         | ✅ EXISTS |
| 7   | Learn & Improve          | `learn-and-improve.md`       | ✅ EXISTS |
| 8   | GitHub Bug Tracking      | `github-bug-tracking.md`      | ✅ EXISTS |
| 9   | Git Push                 | `git-push.md`                 | ✅ EXISTS |
| 10  | Deploy                   | `deploy.md`                   | ✅ EXISTS |
| 11  | Sprint Status            | `sprint-status.md`            | ✅ EXISTS |
| 12  | System Health            | `system-health.md`           | ✅ EXISTS |
| 13  | Overall Bug Dashboard    | `overall-bug-dashboard.md`    | ✅ EXISTS |
| 14  | Validate Workflows       | `validate-workflows.md`       | ✅ EXISTS |

**Note**: If additional workflows exist beyond the 14 core above, they are optional enhancements.

---

## Step 2: Check Cross-References

Scan all workflow files for `/workflow-name` references. Verify each referenced workflow exists:

Common references to check:

- `/fix-bug` → should reference `/bug-intake`, `/learn-and-improve`, `/git-push`
- `/audit-module` → should reference `/build-module-brain`, `/fix-bug`
- `/learn-and-improve` → should reference `/fix-bug`, `/github-bug-tracking`
- `/bug-intake` → should reference `/github-bug-tracking`
- `/overall-bug-dashboard` → should reference `/sprint-status`, `/system-health`
- `/system-health` → should reference `/audit-module`, `/overall-bug-dashboard`

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
- [ ] Has clear "Usage" section with how to invoke
- [ ] Has "Completion Report" section with summary
- [ ] Has "Prerequisites" section listing what must exist first

**Note**: Recommended version format: `v{Major}.{Minor}` (e.g., v1.0, v2.1)

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
