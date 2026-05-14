# /start-session — Begin New Session

> Load brain, orient context, declare what we're working on.

---

## Step 1: Determine Context

| User Input | Context |
|------------|---------|
| "load brain" (no qualifier) | Check recent project activity |
| "load winbull brain" | Winbull Staging platform |
| "load cortexo brain" | Cortexo DevOps platform |

Check git status for active project:
```bash
cd /run/media/lmx/LMX/Winbull/Personal/Devops && git status --short
```

---

## Step 2: Read Session Starter

| Context | File to Read |
|---------|--------------|
| Winbull | `brain/winbull/0_session_start.md` |
| Cortexo | `brain/cortexo/0_session_start.md` |

Extract:
- Active critical bugs (top 3)
- Dangerous files list
- Recent updates log

---

## Step 3: Check In-Progress Work

Check for any active bug fixes or work in progress:
```bash
find brain -name "*.md" -newer brain/winbull/0_session_start.md 2>/dev/null | head -10
```

Look in:
- `brain/winbull/_SYSTEM/ACTIVE_BUGS.md`
- `brain/winbull/_SYSTEM/CROSS_MODULE_BUGS.md`

---

## Step 4: Declare Session Intent

Ask user (or parse intent from input):
1. **What** are we working on? (module name, bug ID, feature)
2. **Why** does it matter? (business priority)
3. **What's the goal** for this session? (ship X bugs, audit Y module)

---

## Step 5: Update Session Memory

Create/update session note at:
```
brain/{context}/_SYSTEM/SESSION_{DATE}.md
```

Template:
```markdown
# Session — {YYYY-MM-DD}

## Intent
- Goal: {what}
- Why: {why}
- Success criteria: {what done looks like}

## Starting State
- Active bugs: {count}
- In progress: {none / list}
- Last session: {date}

## Plan
- [ ] Task 1
- [ ] Task 2
```

---

## Step 6: Confirm Ready

Report to user:
```
✅ Brain loaded for {context}
📋 Intent: {goal}
📊 Active bugs: {count}
🔴 Critical: {top 3}
```

---

*This workflow ensures every session starts with context, not from zero.*