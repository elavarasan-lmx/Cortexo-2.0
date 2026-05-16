# Fix Velocity — Cortexo

> Tracks time-to-fix for each bug. Helps estimate future work.
> Updated via `/fix-bug` and `/verify-fix` workflows.

---

## Completed Fixes

| ID | Summary | Complexity | Time to Fix | Time to Verify | Total |
|----|---------|:----------:|:-----------:|:--------------:|:-----:|
| CX-001 | Infinite redirect loop | Medium | ~30 min | 10 min | 40 min |
| CX-002 | Dashboard modularization | Large | ~2 hrs | 15 min | 2h 15m |
| CX-003 | Dead schema cleanup | Medium | ~1 hr | 10 min | 1h 10m |
| CX-004 | `as any` removal (4 modules) | Medium | ~1.5 hrs | 20 min | 1h 50m |

---

## Averages

| Complexity | Avg Fix Time | Avg Verify Time | Sample Size |
|:----------:|:------------:|:---------------:|:-----------:|
| Small | — | — | 0 |
| Medium | ~1 hr | ~13 min | 3 |
| Large | ~2 hrs | ~15 min | 1 |

---

## Notes
- Verification includes build check + manual browser test
- "Large" = multi-file refactoring or architectural change
- "Medium" = 2-5 files, clear scope
- "Small" = 1 file, obvious fix

---

*Last updated: 2026-05-16*
