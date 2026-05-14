# /end-session — Wrap Up Session

> Capture progress, update session memory, wrap up.

---

## Step 1: Review Session Goals

Check session file at:
```
brain/{context}/_SYSTEM/SESSION_{DATE}.md
```

For each planned task:
- ✅ Completed
- 🔄 In progress (move to next session)
- ❌ Not started (document why)

---

## Step 2: Document What Changed

| Category | What to Record |
|----------|----------------|
| **Files touched** | List of files modified |
| **Bugs fixed** | Bug IDs + one-line summary |
| **Bugs found** | New bugs discovered (add to ACTIVE_BUGS.md) |
| **Docs updated** | Brain files updated |
| **Questions** | Unanswered questions for next session |

---

## Step 3: Update System Files

### If bugs were fixed:
```bash
# Update FIX_VELOCITY.md
echo "- {date} | {bug_id} | {module} | {time_taken}" >> brain/winbull/_SYSTEM/FIX_VELOCITY.md
```

### If new bugs found:
```bash
# Add to ACTIVE_BUGS.md
# Use /bug-intake format
```

### If docs changed:
```bash
# Update 0_session_start.md "Update Log" section
```

---

## Step 4: Clean Up Temp Files

```bash
# Remove temp files in _SYSTEM/
rm -f brain/winbull/_SYSTEM/TEMP_*
rm -f brain/cortexo/_SYSTEM/TEMP_*
```

---

## Step 5: Write Session Summary

Create `brain/{context}/_SYSTEM/SESSION_SUMMARY_{DATE}.md`:

```markdown
# Session Summary — {YYYY-MM-DD}

## Goals
| Goal | Status |
|------|--------|
| {goal 1} | ✅ Done |
| {goal 2} | 🔄 In Progress |
| {goal 3} | ❌ Not done |

## Completed
- {item 1}
- {item 2}

## Found (New Bugs)
- {bug_id}: {description} → add to ACTIVE_BUGS.md

## Notes for Next Session
- {carryover item}
- {question to resolve}
```

---

## Step 6: Report Summary

```
📊 Session Complete — {date}

✅ Done: {n} tasks
🔄 Carryover: {n} items
🆕 Found: {n} new bugs
📝 Next: {one-line next step}
```

---

*Always end sessions with a written summary. Don't trust memory.*