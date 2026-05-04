# 🧠 BRAIN — WinBull Trade Platform

> Last Updated: 2026-05-03

---

## 🎯 Purpose — Why This Brain Exists

WinBull is a **shared codebase** serving **77+ clients**. One wrong fix = ALL clients break.

This brain exists to:
1. **Prevent mistakes** — Know dangerous files, business rules, and edge cases BEFORE touching code
2. **Find bugs systematically** — 19 detection patterns + 6-round audit workflow
3. **Maintain consistency** — Same rules for Indian AND foreign clients
4. **Save context between sessions** — No re-learning the codebase every time

### Without Brain → ❌
- Forget `book_type 0=Buy, 1=Sell` → wrong logic
- Edit `trading_helper.php` without knowing it's 4,531 lines → break ALL clients
- Apply Indian GST to Malaysian client → wrong tax
- Fix bug in admin, forget web portal → half-fix

### With Brain → ✅
- Read rules first → code correctly
- Check dangerous files list → ask before touching
- Run audit workflow → find bugs systematically
- Foreign client rules → handle any country

---

## 🔄 Workflow — How To Use This Brain

### Session Start (Every Time)
```
1. Read 00_index.md → orient yourself
2. Read 01_project.md → project context + dangerous files
3. If working on a module → check modules/{module}/brain.md (if exists)
4. If financial logic → read rules/rate_formula.md + rules/business_rules.md
5. If foreign client → read rules/foreign_client_rules.md
```

### Finding & Fixing Bugs
```
1. Pick module → run workflows/audit_module.md (6-round scan)
2. Bugs found → classify Track A (System) or Track B (Business)
3. Fix ONE bug → follow workflows/fix_bug.md
4. Track A → fix + show diff to Jerry
5. Track B → propose fix → WAIT for Jerry's approval
6. Update module brain with bug status
```

### Adding a Foreign Client
```
1. Read rules/foreign_client_rules.md → understand differences
2. Follow setup checklist at bottom of that file
3. Update 01_project.md client registry
```

### When to Update Brain Files
| Event | Update What |
|-------|------------|
| New module audited | Create `modules/{module}/brain.md` from template |
| Bug found & fixed | Update module brain's bug table |
| New business rule discovered | Add to `rules/business_rules.md` |
| New foreign client onboarded | Add to `01_project.md` client registry |
| New bug pattern found | Add to `03_bug_patterns.md` |
| Rate formula changed | Update `rules/rate_formula.md` |
| New validation added | Update `rules/validation_rules.md` |

---

## 📂 File Map

### Root Docs (4 files)

| File | What | When to Read |
|------|------|-------------|
| `01_project.md` | Project overview, tech stack, client registry, dangerous files | Every session start |
| `02_modules.md` | 82 modules across 6 layers | When picking a module to work on |
| `03_bug_patterns.md` | 19 detection patterns + security vulns + known issues | During audits |
| `04_db_schema.md` | 94 MySQL tables + dependencies + relationships | When touching DB queries |

### Rules (4 files)

| File | What | When to Read |
|------|------|-------------|
| `rules/business_rules.md` | 25+ BR rules, order flow, edge cases | Before any business logic change |
| `rules/rate_formula.md` | 8-step bank rate, 3 modes, booking calc | Before rate/financial code |
| `rules/validation_rules.md` | 12 keypress types, form validation patterns | Before form/input changes |
| `rules/foreign_client_rules.md` | Tax, currency, KYC, rate feed for non-Indian clients | Before foreign client work |

### Workflows (2 files)

| File | What | When to Use |
|------|------|------------|
| `workflows/audit_module.md` | 6-round deep scan procedure | Auditing any module |
| `workflows/fix_bug.md` | Surgical fix with rollback plan | Fixing any bug |

### Templates & Modules

| File | Purpose |
|------|---------|
| `templates/module_brain.md` | Copy to `modules/{layer}/{module}/brain.md` |
| `modules/` | Per-module brains — created during audits |

---

## 🔍 Quick Find

| I need to... | Read |
|---|---|
| Start a new session | `01_project.md` |
| Find a module | `02_modules.md` |
| Scan for bugs | `03_bug_patterns.md` + `workflows/audit_module.md` |
| Check DB tables | `04_db_schema.md` |
| Understand rate calc | `rules/rate_formula.md` |
| Check business rules | `rules/business_rules.md` |
| Add foreign client | `rules/foreign_client_rules.md` |
| Fix a bug | `workflows/fix_bug.md` |
| Know dangerous files | `01_project.md` (bottom section) |
