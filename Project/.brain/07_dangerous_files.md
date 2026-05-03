# 🚨 DANGEROUS FILES — Do NOT Touch Without Approval

> **Purpose**: Single consolidated list of files that must NEVER be edited without explicit user approval.
> This replaces the scattered NEVER-Touch lists in `skill.md`, `session_memory.md`, and `RULES.md`.
> 
> **Last Updated**: 2026-03-16

---

## ⛔ ABSOLUTE — Never Edit Without User in the Room

| File | Why Dangerous | Size | Rule |
|------|-------------|------|------|
| `system/application/helpers/trading_helper.php` | **Core trading engine** — booking, margin, hedge, rate, order processing. One wrong line takes down ALL 77 clients immediately | 4,531 lines (231KB) | Rule 6 |
| `application/controllers/C_booking.php` (`phone_booking` method) | **Phone booking flow** — 128KB monolith. Every IF branch has specific behavior. Callers, watchers, and socket events depend on exact flow | ~3,200 lines | Rule 6 |
| `global_configs.php` | **All client credentials** — DB host, DB user, DB name, encryption keys, API keys, socket URLs. Wrong edit exposes data for ALL 77 clients | 190 lines | Rule 12 |

---

## ⚠️ HIGH RISK — Ask Before Touching

| File / Area | Why Risky | What to Do |
|-------------|----------|-----------|
| Any rate calculation code | Rate formula affects all 77 clients simultaneously. Read `rate_formula.md` first | Ask user |
| Any margin / hedge logic | Financial calculations — wrong value = financial loss for customers | Ask user |
| Any `dt_booking` INSERT / UPDATE queries | Transaction records — corrupt one, corrupt a customer's balance | Show plan first |
| `global_configs.php` values | Per-client config — test on WinBullSource before touching | Read-only by default |
| Any SQL migration (ALTER TABLE, CREATE TABLE) | Every client's DB is separate — migration must run on ALL 77 DBs | Ask user |
| `application/views/customer/trading.php` | Core customer-facing trading UI. JS rate feed is tightly coupled | Read module_memory first |

---

## 📝 ALWAYS SAFE (No Approval Needed)

| File Type | Safe Because |
|-----------|-------------|
| `.agent/*.md` brain files | Documentation only — auto-commit allowed |
| View files (display only, no DB writes) | Low business risk — still browser test |
| CSS / JS assets | Low risk — browser test after |
| Log files | Read-only |

---

## How to Check Before Editing

1. Is the file in this list? → **Ask user first**
2. Does it contain rate/margin/hedge logic? → **Read `rate_formula.md` first**
3. Does it do DB INSERT/UPDATE on financial tables? → **Ask user first**
4. If still unsure → **Rule 2: ASK Before Assume**

---

## ⚙️ CodeIgniter Core — DO NOT EDIT system/

The system/ directory is **stock CodeIgniter 3** code.

**NEVER edit files in system/** — your changes will be overwritten if CI is ever updated.

### ✅ Correct way to extend CI core:
| CI System File | Override file to create |
|---------------|------------------------|
| system/libraries/Profiler.php | dmin/application/libraries/MY_Profiler.php |
| system/libraries/Session/ | dmin/application/libraries/MY_Session.php |
| system/core/Input.php | dmin/application/core/MY_Input.php |
| system/core/Controller.php | dmin/application/core/MY_Controller.php |

CI automatically loads MY_* files in preference to its own core files.

