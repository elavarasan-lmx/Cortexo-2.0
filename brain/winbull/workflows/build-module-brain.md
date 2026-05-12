# /build-module-brain Workflow

> Build a complete knowledge base for any Winbull module before auditing or fixing.
> Purpose: Reduce bug diagnosis time by ~60%. MANDATORY before running /audit-module on a new module.

## Usage
Say: `/build-module-brain [MODULE_NAME]`

Examples: `Booking`, `Margin`, `MobileAPI`, `Admin`, `RateEngine`, `Socket`

---

## Output Structure

```
brain/winbull/modules/{MODULE_NAME}/
├── MODULE_BRAIN.md        ← Master brain (architecture, routes, risks)
├── METHOD_INDEX.md        ← Alphabetical method lookup + table mapping
├── DATA_FLOW.md           ← Save/Edit/Cancel/Delete flows with line numbers
├── BUSINESS_RULES.md      ← Extracted formulas and constraints
├── CROSS_MODULE_MAP.md    ← Dependencies on other modules/shared tables
├── SCHEMA_ANALYSIS.md     ← DB tables (columns, types, indexes, risks)
├── FLOW_RISK_MATRIX.md    ← Handoff contracts + reversal audit
├── FORENSIC_TEMPLATE.md   ← Layer-by-layer investigation cheat sheet
└── COVERAGE_TRACKER.md   ← Round-by-round coverage progress
```

---

## Step 0: Existing Brain Check

Before building, check if brain already exists:
```bash
ls brain/winbull/modules/{MODULE_NAME}/ 2>/dev/null
```

**If NOT exists** → Build from scratch (Step 1+)

**If EXISTS** → Choose mode:

| Mode | When | What Happens |
|------|------|-------------|
| **Refresh** | Code changed since brain was built | Re-scan, MERGE new findings. Keep fix history + anti-patterns |
| **Upgrade** | Major code update | Diff old vs new. Add new methods. Flag removed ones |
| **Force Rebuild** | Brain is wrong/corrupt | Back up, wipe, regenerate |

---

## Step 1: Project Skeleton

1. List ALL files the module touches:
   - Controller(s): count lines and methods
   - Model(s): count lines and methods
   - JS file(s): count lines
   - View file(s): list all

2. Document connection flow:
```
Browser → JS ({js_file})
       → AJAX → Controller ({controller_file})
       → Model ({model_file})
       → DB (list tables)
       → View ({view_dir})
```

3. Note file sizes — largest file = highest risk

---

## Step 1.5: Constructor Analysis

Read the controller's `__construct()`:
| Model/Library | Purpose |
|---|---|
| `{model_name}` | {purpose} |

Document:
- Session gate (authentication check)
- All loaded models
- Any middleware or hooks

---

## Step 2: Entry Points & Routes

Create table of ALL controller methods:

| URL Path | HTTP Method | Controller Method | Lines | Type | Purpose |
|---|---|---|---|---|---|
| /web/{module}/save | POST | save() | L100-200 | AJAX | Save new record |
| /admin/{module}/list | GET | index() | L10-50 | Page | Load listing |

Separate page loads vs AJAX endpoints vs utility methods.

---

## Step 3: Data Flow Traces

Trace these 3 flows minimum with exact function names + line numbers:

### Flow 1: SAVE (Create New)
1. JS function on submit button?
2. Validation that runs?
3. Data collected from form?
4. AJAX endpoint?
5. Controller method?
6. Model methods called (in order)?
7. Tables written (in order)?
8. Response to browser?

### Flow 2: EDIT (Update Existing)
1. How is data loaded? (model method, tables)
2. Delete-then-Insert or actual UPDATE?
3. Which child tables updated?
4. Fields in SELECT but NOT in UPDATE? (data loss risk)

### Flow 3: CANCEL / DELETE
1. GET or POST? (GET = CSRF risk)
2. Which tables cleaned up?
3. ALL tables from SAVE reversed? (BR-CX001)
4. Soft delete or hard delete?

**Output**: `modules/{MODULE_NAME}/DATA_FLOW.md`

---

## Step 3b: Flow Risk Matrix

After Step 3, build `FLOW_RISK_MATRIX.md`:

### State Machine
Document all status field transitions for the module's primary table:
```
| State | Value | Set By | Transitions To | Guard |
```

### Reversal Contracts (Cancel-Reversal Check — BR-CX001)
```
| Operation | Tables from SAVE | Restored in CANCEL? | Method & Line | Gap? |
```
Any table written during SAVE but NOT restored during CANCEL = ⚠️ gap.

### Flow Risk Checklist
```
| ID | Scenario | Expected | Priority | Verified? |
| FR-{MOD}-001 | CANCEL → verify ALL save tables restored | Full restore | 🔴 HIGH | ❌ |
| FR-{MOD}-002 | Edit after downstream consumed record | REJECT or warn | 🔴 HIGH | ❌ |
```

**Output**: `modules/{MODULE_NAME}/FLOW_RISK_MATRIX.md`

---

## Step 4: Business Rules Extraction

For every calculation or constraint:
```
RULE-{MOD}-001: {Rule Name}
Formula: {plain-English formula}
Implementation: JS function L{N} + PHP method L{N}
Validation: Client-side / Server-side / Both
Edge cases: {known edge cases}
```

Check against `12_business_rules.md` — link to existing rules, don't duplicate.

**Output**: `modules/{MODULE_NAME}/BUSINESS_RULES.md`

---

## Step 5: Cross-Module Mapping

| External Module | Direction | Tables/Methods | What Data | Risk |
|---|---|---|---|---|
| Booking | Read | dt_booking | Order status | Could be cancelled |
| Margin | Write | dt_margin | Margin deduct | Wrong amount propagates |

Include Mermaid dependency graph.

**Output**: `modules/{MODULE_NAME}/CROSS_MODULE_MAP.md`

---

## Step 6: DB Schema Analysis

For each table owned by this module:
- Column names, types, indexes
- MyISAM vs InnoDB (MyISAM = transactions don't work)
- Missing indexes on JOIN/WHERE columns
- Decimal vs int mismatch risks

Verification queries:
1. Pull complete transaction by ID
2. Calculate expected total from raw DB values
3. Check for orphan records
4. Check integrity issues

**Output**: `modules/{MODULE_NAME}/SCHEMA_ANALYSIS.md`

---

## Step 7: METHOD_INDEX.md

**Most critical AI optimization step.**

### 7a. Controller Methods (alphabetical)
| Method | Lines | Tables Read | Tables Written | JS Caller |
|---|---|---|---|---|

### 7b. Model Methods (alphabetical)
| Method | Lines | Tables Read | Tables Written | Called By |
|---|---|---|---|---|

### 7c. JS → Controller AJAX Map
| JS Line | JS Context | AJAX URL | Controller Method |
|---|---|---|---|

### 7d. Table → Methods Reverse Map
| Table | Read By | Written By |
|---|---|---|

**Output**: `modules/{MODULE_NAME}/METHOD_INDEX.md`

---

## Step 8: MODULE_BRAIN.md Assembly

Sections (keep under 400 lines — move detail to sub-files):
1. Module Overview + file map + connection diagram
2. Constructor — loaded models, session gate
3. Entry Points — route table from Step 2
4. Data Flow Summary → link to DATA_FLOW.md
5. Key Tables — list with purpose
6. Business Rules Summary → link to BUSINESS_RULES.md
7. Cross-Module Dependencies → link to CROSS_MODULE_MAP.md
8. Known Risks — pre-identified risk areas
9. DB Verification Queries
10. Anti-Patterns Register (empty initially — updated after each bug fix)

---

## Step 9: Coverage Tracker [MANDATORY — Every Round]

Count from codebase:
```bash
grep -c "function " {controller_file}   # controller method count
grep -c "function " {model_file}        # model method count
grep -c "url:" {js_file}               # AJAX endpoint count
```

Coverage thresholds:
- 0% → ⬜ Not started
- 1–79% → 🟡 Partial
- 80–99% → 🟢 Complete
- 100% verified → 🔵 Verified

**Output**: `modules/{MODULE_NAME}/COVERAGE_TRACKER.md`

---

## Step 10: Forensic Template

Layer-by-layer cheat sheet for future bug investigations:

1. **Layer 1 — Symptoms**: Module-specific symptom checklist
2. **Layer 2 — Reproduce**: Step-by-step reproduction checklist
3. **Layer 3 — Client-Side**: JS console points, variables to inspect, Network tab checks
4. **Layer 4 — Server-Side**: Controller trace table (symptom → file → method → line)
5. **Layer 5 — DB Verification**: Module-specific diagnostic SQL queries
6. **Layer 6 — Root Cause Classification**: Category × risk table

Add specialized layers if module has:
- Financial transactions → **Layer 7: Transaction Integrity** (trans_begin/trans_complete)
- Rate/socket data → **Layer 7: Rate Data Trace** (socket event → PHP → DB → display)
- Print/invoice output → **Layer 7: Print Template Trace** (BR-PR001)

**Output**: `modules/{MODULE_NAME}/FORENSIC_TEMPLATE.md`

---

## Completion Report

```
✅ Module Brain — Round {N} complete for {MODULE_NAME}

   📊 COVERAGE PROGRESS:
   ┌──────────────────────────┬──────────┬──────────┬──────────┐
   │ Metric                   │ Covered  │ Total    │ Coverage │
   ├──────────────────────────┼──────────┼──────────┼──────────┤
   │ Controller methods       │ {N}      │ {N}      │ {N}%     │
   │ Model methods            │ {N}      │ {N}      │ {N}%     │
   │ JS AJAX endpoints        │ {N}      │ {N}      │ {N}%     │
   │ DB tables (owned)        │ {N}      │ {N}      │ {N}%     │
   │ Business rules           │ {N}      │ —        │ —        │
   │ Data flows               │ {N}      │ {N}      │ {N}%     │
   │ Flow risk contracts      │ {N}      │ {N}      │ {N}%     │
   ├──────────────────────────┼──────────┼──────────┼──────────┤
   │ OVERALL                  │          │          │ {N}%     │
   └──────────────────────────┴──────────┴──────────┴──────────┘

   Ready for: /audit-module (when overall ≥ 80%)
   Brain location: brain/winbull/modules/{MODULE_NAME}/
```

## Time Estimate
- Simple module (< 3K lines, < 5 tables): ~20 min
- Medium module (3–10K lines, 5–10 tables): ~45 min
- Complex module (Booking/Margin, 10K+ lines): ~90 min
