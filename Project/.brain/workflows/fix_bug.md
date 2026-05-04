# 🐛 Fix Bug Workflow

> ONE bug at a time. Surgical precision. Documentation first.
> Adapted from old `.agent/workflows/fix-bug.md`
> Last Updated: 2026-05-03

---

## Core Principles
1. **Isolation** — Each bug = own change, linked to Bug ID
2. **Traceability** — Every commit references Bug ID
3. **Reversibility** — Rollback plan BEFORE fix
4. **Surgical** — Minimal fix, no opportunistic refactoring

---

## Step 0: Duplicate Guard
1. Check module `bugs.md` — already fixed?
2. Check if another bug touches same file/method → resolve order

## Step 1: Diagnose
1. Read module brain: `modules/{layer}/{module}/`
2. Read `rules/business_rules.md` for rule context
3. Identify: root cause + affected files + which business rule violated

## Step 2: Locate
1. Open affected file, confirm bug still exists
2. Trace: `JS → Controller → Model → DB`

## Step 3: Track Route

| Track | When | AI Role | Jerry's Role |
|-------|------|---------|-------------|
| **A — System** | Security, transaction, query, schema | Full fix + test | Approve diff |
| **B — Business** | Wrong calc, missing rule, rate | Propose fix | Validate logic FIRST |

> Wrong business results → **Track B**. Everything else → **Track A**.

## Step 4: Plan & Fix

### PHP Controller/Model:
1. Check `03_bug_patterns.md` for matching pattern → adapt template
2. Apply **minimal** fix only
3. Add comment: `// Bug fix: {BUG_ID} — {description}`

### JavaScript:
1. JS files are 30K+ lines — surgical precision!
2. Financial calcs happen client-side — verify parity
3. Changes must work for both Add and Edit modes

### DB Schema:
1. Generate ALTER TABLE + rollback SQL
2. **DO NOT EXECUTE** — present to Jerry

## Step 5: Syntax Check
```bash
php -l {affected_php_file}
```

## Step 6: Test
- [ ] Create/save works
- [ ] Edit/update preserves data
- [ ] Delete cleans child records
- [ ] Negative test — bad input rejected

## Step 7: Approval Gate
```
Bug: {BUG_ID} — {Title}
Track: {A/B} | Risk: {Low/Med/High}
Changed: {file}:{lines} — {description}
Rollback: {instruction}
Approve? (yes / modify / reject)
```

## Step 8: Close
1. Update module `bugs.md` → mark ⚠️ Applied (Jerry marks ✅)
2. Check same bug in other modules
3. Git commit — one per fix
