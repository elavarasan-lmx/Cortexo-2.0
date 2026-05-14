# /status — Quick Dashboard

> Show open bugs, what's in progress, what's next.

---

## Step 1: Determine Context

Check which brain to use:
```bash
cd /run/media/lmx/LMX/Winbull/Personal/Devops && git status --short | grep -E "^( M|M )" | head -5
```

If changes in `cortexo/` → cortexo brain
If changes in `Server/winbullstaging/` → winbull brain

---

## Step 2: Load Active Bugs

Read from:
```
brain/{context}/_SYSTEM/ACTIVE_BUGS.md
```

Format output as table:
| ID | Bug | Severity | Status | Module |
|----|-----|----------|--------|--------|
| P0-001 | {desc} | 🔴 P0 | Open | {mod} |

---

## Step 3: Check In-Progress

Look for session files:
```bash
ls -lt brain/*/_SYSTEM/SESSION_*.md 2>/dev/null | head -3
```

Show most recent session with its tasks.

---

## Step 4: Show Next Actions

From workflow state:
- Any pending `/bug-intake` → needs triage
- Any pending `/fix-bug` → needs work
- Any pending `/audit-module` → needs completion

---

## Step 5: Quick Stats

```
📊 {Context} Status

🔴 Critical (P0): {count}
🟠 High (P1): {count}
🟡 Medium (P2): {count}
🟢 Low (P3): {count}

In Progress: {count}
Last Session: {date}
Next: {action}
```

---

## Example Output

```
📊 Winbull Status

🔴 Critical (P0): 2
🟠 High (P1): 5
🟡 Medium (P2): 12

In Progress: /fix-bug P0-002 (WhiteListDomainMiddleware)
Last Session: 2026-05-14

Next: Complete P0-002 fix → /learn-and-improve → /git-push
```

---

*Run /status at start of any session to reorient.*