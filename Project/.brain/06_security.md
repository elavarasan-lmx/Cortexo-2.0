# 🔒 Security Profile — WinBull Trade

> Vulnerability inventory + scan methodology | Last Updated: 2026-05-01

---

## Vulnerability Summary

| # | Category | Count | Severity | Priority |
|---|---|---|---|---|
| 1 | Mobile API zero auth | 86 endpoints | 🔴 Critical | #1 |
| 2 | SQL injection (raw `db->query()`) | 127+ queries | 🔴 Critical | #2 |
| 3 | Plaintext passwords | 7 files | 🔴 Critical | #3 |
| 4 | Raw `$_POST/$_GET` | 155 uses | 🟠 High | #4 |
| 5 | CORS wildcard `*` | 12 controllers | 🟠 High | #5 |
| 6 | Missing session check | 5 controllers | 🔴 Critical | #6 |
| 7 | Missing rights check | 19 controllers | 🟠 High | #7 |
| 8 | Missing audit log | 53 controllers | 🟠 High | #8 |

---

## Deep Scan Rules

### How to Scan a Module
```
1. Load common_bug_patterns.md — run ALL 19 detection rules
2. Round 1: Controller — transactions, CSRF, permissions, debug artifacts
3. Round 2: Model — SQL injection, JOINs, NULL dereferences, data loss
4. Round 3: DB Schema — type mismatches, MyISAM, missing indexes
5. Round 4: JS Save — validation, XSS, duplicate IDs
6. Round 5: JS Financial — parseFloat, toFixed, NaN guards, formula parity
7. Round 6: AJAX — error handlers, raw POST, response format
```

### Detection Commands
```bash
# SQL Injection
grep -rn "db->query(" admin/application/models/ --include="*.php"

# Raw POST/GET
grep -rn '\$_POST\[' admin/application/ --include="*.php"
grep -rn '\$_GET\[' admin/application/ --include="*.php"

# Missing auth
grep -rL "has_rights\|session->userdata" admin/application/controllers/ --include="*.php"

# Debug artifacts
grep -rn "echo \|print_r\|var_dump\|exit;" admin/application/controllers/ --include="*.php"

# alert() usage
grep -rn "alert(" admin/application/views/ --include="*.php"

# CORS wildcard
grep -rn "Access-Control-Allow-Origin.*\*" --include="*.php"

# Plaintext passwords
grep -rn "password.*=.*\$_POST\|plaintext\|md5(" --include="*.php"
```

---

## Known Issues (By Design — Do NOT Fix)

| Issue | Why It's By Design |
|---|---|
| `accountdelete()` is empty | Intentional no-op for mobile API compliance |
| book_type 0=Buy, 1=Sell | Counterintuitive but all 77 clients depend on this |
| market_status 0=Open, 1=Closed | Same — legacy design, cannot change |
| Server doesn't re-validate rate | KNOWN GAP — systemic issue, not a bug to "fix" |
| BZ-32 negative margin values | By design — shows credit balance correctly |
| Some Zoho bugs marked "already fixed" | Were fixed in an older branch — verify in current |

---

## Security Fix Priority

1. **Mobile API auth** (86 endpoints, ZERO protection)
2. **SQL injection** (127+ queries, 52 models)
3. **Plaintext passwords** (7 files — Login_model, MLogin_model, etc.)
4. **Raw `$_POST`** (155 uses across 10+ files)
5. **CORS wildcard** (12 controllers — allows any domain)
6. **Session checks** (5 controllers with no auth)
7. **Rights checks** (19 controllers allow any admin)
8. **Audit logging** (53 controllers with no log_action)
