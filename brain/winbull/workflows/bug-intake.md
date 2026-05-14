# /bug-intake Workflow (v1.0)

> Standardize how bugs enter the pipeline. Entry point for ALL bugs.

## Usage
Say: `/bug-intake [description of bug]`

---

## Prerequisites

- Read `brain/winbull/0_session_start.md` first
- Read `brain/winbull/11_bug_patterns.md` to check if bug matches known pattern
- Read `brain/winbull/7_bugs_and_issues.md` to verify bug isn't already documented

---

## Step 1: Collect Bug Report

| Field | Required |
|---|---|
| Reporter (who found it) | ✅ |
| Module (which module) | ✅ |
| Steps to Reproduce | ✅ |
| Expected vs Actual Behavior | ✅ |
| Environment (Prod/Staging/Dev) | ✅ |

---

## Step 2: Assign Severity

| Level | Criteria | Fix Target |
|---|---|---|
| **P0 — Critical** | Data loss, security breach, wrong rate/price, system down | Same day |
| **P1 — Major** | Wrong data display, broken business rules, orphan records | ≤ 3 days |
| **P2 — Minor** | UX issues, missing validations, code quality | Next sprint |
| **P3 — Cosmetic** | Debug artifacts, styling, dead code | Backlog |

> **Rule**: If bug causes **money/rate/weight to be wrong** → P0. If it shows **wrong info** → P1.

---

## Step 3: Assign Track

| Track | When |
|---|---|
| **Track A — System** | Security, transaction, query, schema, variable, performance |
| **Track B — Business** | Rate calculation, booking logic, margin, weight, GST |

---

## Step 4: Category

Pick ONE:

| Category | Signals |
|---|---|
| Logic | Wrong calculations, missing business rules |
| Validation | No null/range/type checks, client-only validation |
| Database | SQL injection, missing indexes, orphan records |
| Security | CSRF, XSS, missing sanitization, zero auth |
| Performance | N+1 queries, no pagination |
| Integration | AJAX error handling, socket disconnect |

---

## Step 5: Duplicate Check

1. Search `7_bugs_and_issues.md` for similar keywords
2. If duplicate → link to existing, don't create new

---

## Step 6: Priority

| Priority | Source |
|---|---|
| 1st 🔴 | Client-reported / production bugs |
| 2nd 🟠 | User's direct suggestions |
| 3rd 🟡 | Code scan findings |
| 4th ⚪ | Cosmetic / low impact |

---

## Output

```
✅ Bug {ID} triaged
   Module: {module}
   Severity: P{N}
   Track: {A/B}
   Category: {Category}
   Next: /fix-bug {ID}
```
