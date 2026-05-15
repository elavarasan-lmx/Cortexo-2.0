# Core Module Index (Cross-Module Files)

> This folder contains cross-module documentation - files shared by multiple modules.
> Updated: 2026-05-14

---

## Structure

```
core/
├── helpers/              ← PHP Helper files
│   ├── common_helper.md
│   └── trading_helper.md
├── libraries/           ← PHP Library files
│   └── (to be added)
└── shared_models/       ← Models used by multiple controllers
    ├── booking_model.md
    └── login_model.md
```

---

## Cross-Module Files Summary

| File | Type | Used By | Status |
|------|------|---------|--------|
| `common_helper.php` | Helper | All | ✅ |
| `trading_helper.php` | Helper (4,564 lines) | All (DANGEROUS) | ✅ |
| `Booking_model.php` | Model | 4 controllers | ✅ |
| `Login_model.php` | Model | 4 controllers | ✅ |

---

## How to Add More

When you find a file used by multiple modules:

1. Identify the type: helper, library, or model
2. Create documentation in appropriate folder
3. Add to this index
4. Update verification checklist

---

## Key Rules

1. **Trading helper is DANGEROUS** - never modify without approval
2. **Shared models** - document all key methods
3. **Cross-module bugs** - document in each module that uses it

---

*Part of Winbull Brain*