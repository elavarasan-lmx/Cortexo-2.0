# /git-push Workflow (v1.0)

> One commit per bug fix. Never bundle unrelated changes.

## Usage
Say: `/git-push [BUG_ID]`

---

## Prerequisites

- Bug fix completed via `/fix-bug`
- Changes tested locally
- No uncommitted secrets or credentials
- Git remote configured

---

## Step 1: Verify Only One Bug's Files Are Changed

```bash
git diff --name-only
```
- If unrelated files appear → separate them first
- Each bug fix = its own commit

---

## Step 2: Commit Message Format

```
fix(module): [BUG_ID] brief description

- Root cause: {1 line}
- Fix: {1 line}
- Files: {list}
```

**Examples:**
```
fix(booking): [BUG-SQL-01] raw $_POST in C_booking save handler
fix(model): [BUG-TRANS-03] missing trans_status check in delete_record
fix(ui): [BUG-JS-07] parseFloat missing on rate calculation
```

---

## Step 3: Push

```bash
git add {changed files only}
git commit -m "fix(module): [BUG_ID] description"
git push origin {branch}
```

---

## Output

```
✅ Pushed: fix(module): [BUG_ID] {description}
   Files: {list}
   Branch: {branch}
   Next: User browser-tests the fix → marks ✅ if confirmed
```
