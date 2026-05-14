# /fingerprint-scan Workflow (v1.0)

> Auto-scan the Winbull codebase for known bug patterns.
> Generates P0–P3 hit list in ~30 seconds. No manual file-reading needed.
> Adapted from: eTail AI_Bug_Fix_System/fingerprint/fingerprint.php

## Usage
Say: `/fingerprint-scan` or run directly:

```bash
cd /run/media/lmx/LMX/Winbull/Personal/Devops
php scripts/winbull_scan.php [OPTIONS]
```

---

## Prerequisites

- Read `brain/winbull/11_bug_patterns.md` to understand patterns being scanned
- Codebase cloned at `/run/media/lmx/LMX/Winbull/Personal/Devops/Server/winbullstaging/`
- PHP CLI available for running scan scripts

---
```

---

## Prerequisites

SSHFS must be mounted:
```bash
# Check if mounted
ls Project/winbullstaging/application/controllers/ | head -5

# If empty — mount it first:
sshfs prod-gateway:/var/www/html/winbullstaging Project/winbullstaging -o reconnect
```

---

## Scan Modes

| Command | What It Does |
|---|---|
| `php winbull_scan.php` | Full scan — all 14 patterns, all 5 zones |
| `php winbull_scan.php --severity=P0` | Only P0 CRITICAL patterns |
| `php winbull_scan.php --security` | Only security patterns |
| `php winbull_scan.php --output=report.json` | Custom output path |
| `php winbull_scan.php --no-color` | Plain text output (for piping) |

---

## What It Scans

### 5 Scan Zones
| Zone | Path |
|---|---|
| `web_controllers` | `application/controllers/*.php` |
| `web_models` | `application/models/*.php` |
| `mobile_controllers` | `mobileapi/application/controllers/*.php` |
| `mobile_models` | `mobileapi/application/models/*.php` |
| `lumen_engine` | `lmxtrade/winbullliteapi/*.php` |

### 14 Pattern Checks
| ID | Pattern | Priority |
|---|---|---|
| SEC-001 | SQL injection via raw POST | P0 |
| SEC-002 | OTP loose comparison `==` (SYS-008) | P0 |
| SEC-003 | No auth on destructive operation | P0 |
| SEC-004 | Direct `$_POST` usage | P2 |
| TXN-001 | trans_commit on failure branch | P1 |
| TXN-002 | trans_complete() wrong usage | P1 |
| CANCEL-001 | cancel_ functions — verify BR-CX001 | P0 |
| PRINT-001 | print/invoice functions — verify BR-PR001 | P1 |
| FILE-001 | file_put_contents without json_encode | P0 |
| DEAD-001 | Date-suffixed dead method | P2 |
| DEAD-002 | Commented-out function body | P3 |
| LOOP-001 | Variable used outside foreach | P1 |
| AUTH-001 | Missing session gate in constructor | P1 |
| RATE-001 | Hardcoded rate/price value | P2 |

---

## Output

### Terminal Output
Color-coded hit list grouped by P0 → P1 → P2 → P3.
For each hit: file path, line number, code preview.
MANUAL CHECK patterns flagged with ⚠ — need human verification.

### JSON Report
Saved automatically to:
```
brain/winbull/_SYSTEM/scan_reports/scan_{DATE}.json
```

---

## After The Scan — Next Steps

1. **For each P0 hit** — run `/bug-intake` immediately:
   ```
   /bug-intake SEC-002 application/controllers/Login.php L45
   ```

2. **For MANUAL CHECK patterns** (CANCEL-001, PRINT-001, AUTH-001):
   - Open the flagged file
   - Check the context described
   - If confirmed bug → `/bug-intake`
   - If false positive → note it and skip

3. **Log all confirmed bugs** into `7_bugs_and_issues.md` via `/bug-intake`

4. **Fix in priority order** — P0 → P1 → P2
   ```
   /fix-bug [BUG_ID]
   ```

---

## Adding New Patterns

Edit `scripts/winbull_bug_patterns.json`:
```json
{
    "id": "NEW-001",
    "name": "Pattern Name",
    "severity": "HIGH",
    "priority": "P1",
    "category": "Security|Transaction|Business|Logic|Maintenance",
    "description": "What this finds and why it's dangerous",
    "regex": "your_regex_here",
    "regex_flags": "i",
    "fix_ref": "SYS-XXX or BIZ-XXX or ARCH-XXX"
}
```

Regex tips:
- `"regex_flags": "i"` → case-insensitive
- Use `"grep_string"` instead of `"regex"` for plain text search
- Use `"context_check"` to flag patterns needing manual verification

---

## Scan Results Interpretation

| Hits | Meaning |
|---|---|
| 0 hits on a pattern | Pattern not found — good, or codebase uses different naming |
| 1–5 hits | Isolated issue — targeted fix |
| 5+ hits | Systemic pattern — use fix template from `11_bug_patterns.md` |
| MANUAL CHECK | Scanner found the function signature — you must verify the body |
