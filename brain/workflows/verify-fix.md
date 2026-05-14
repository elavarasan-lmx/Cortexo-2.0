# /verify-fix — Post-Fix Verification Checklist

> Before marking a bug as "applied", verify the fix is correct.

---

## Step 1: Code Review Gate

| Check | Pass? |
|-------|-------|
| Change matches bug ID in commit message | ☐ |
| No unintended side effects (check diff) | ☐ |
| Follows existing code style | ☐ |
| Added `// Bug fix: {ID}` comment | ☐ |

---

## Step 2: Local Testing

Run applicable tests:
```bash
# For PHP (Winbull)
cd /run/media/lmx/LMX/Winbull/Personal/Devops/Server/winbullstaging
php -l application/controllers/*.php

# For TypeScript (Cortexo)
cd /run/media/lmx/LMX/Winbull/Personal/Devops/cortexo
npm run lint
```

---

## Step 3: Pattern Cross-Scan

Run `/scan-cross-module {pattern}` to ensure same bug doesn't exist elsewhere.

Example patterns to check:
- `null` vs `undefined` confusion
- Missing `$this->`
- Wrong column names (like `tcs_value` bug)

---

## Step 4: Browser Verification (Winbull)

If UI-related fix:
1. Open staging URL
2. Reproduce original bug scenario
3. Verify fix works
4. Check for regression in related flows

---

## Step 5: For Critical Bugs (P0-P1)

| Additional Check | Action |
|-----------------|--------|
| Check related logs | `tail -100 /var/log/application.log` |
| Verify DB state | Query affected tables |
| Check dependent modules | Test downstream impact |

---

## Step 6: Sign-Off

If all checks pass:
```
✅ Verification Complete — {bug_id}
- Code review: Pass
- Local tests: Pass
- Cross-scan: No regressions found
- Ready for: /learn-and-improve → /git-push → /deploy
```

If any check fails:
```
❌ Verification Failed — {bug_id}
- Issue: {description}
- Action: Return to /fix-bug
```

---

## Never Skip

- P0 bugs: ALL 6 steps
- P1 bugs: Steps 1-4
- P2-P3 bugs: Steps 1-2 minimum

*Verification isn't paranoia — it's professionalism.*