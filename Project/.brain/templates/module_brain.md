# 📦 Module Brain Template

> Copy this to `.brain/modules/{layer}/{module}/brain.md` for each module.

---

```markdown
# 📦 MODULE — [Module Name]

> Priority: Critical/High/Medium/Low | Last Scanned: [Date] | Bugs: X

---

## 📁 FILES

| File | Path | Lines |
|------|------|:-----:|
| Controller | `Web/admin/application/controllers/C_[name].php` | X |
| Model | `Web/admin/application/models/[Name]_model.php` | X |
| View (Listing) | `Web/admin/application/views/[name]_listing.php` | X |
| View (Entry) | `Web/admin/application/views/[name]_entry.php` | X |
| JS | `Web/assets/js/custom/[name].js` | X |

---

## 🎯 PURPOSE

**What it does**: [1-2 sentences]

**User flow**:
1. Admin navigates to [Menu] > [Submenu]
2. Sees listing of [records]
3. Can add/edit/delete [records]
4. Changes affect [which tables/logic]

---

## 🔧 KEY FUNCTIONS

### Controller
| Function | Purpose | Risk |
|----------|---------|:----:|
| `open_listingform()` | Show listing | 🟢 |
| `open_entryform()` | Show add/edit | 🟢 |
| `save_record()` | Insert/update | 🟡 |
| `delete_record()` | Delete | 🔴 |

### Model
| Function | Purpose | SQL Type | Risk |
|----------|---------|----------|:----:|
| `get_all()` | Fetch all | SELECT | 🟢 |
| `save()` | Insert/update | INSERT/UPDATE | 🟡 |
| `delete()` | Delete | DELETE | 🔴 |

---

## 🗄️ DATABASE

**Main table**: `dt_[name]`

**Key columns**:
- `id` (PK, auto_increment)
- `status` (tinyint: 0=inactive, 1=active)
- Document ALL integer value meanings!

**Foreign keys**:
- References: [list]
- Referenced by: [list]

---

## 💼 BUSINESS RULES

| Rule ID | Description | Enforced Where |
|---------|-------------|----------------|
| BR-XX-01 | [Rule] | Model L100 |

---

## 🔗 DEPENDENCIES

### Depends On
| Module/File | How | Why |
|-------------|-----|-----|
| `trading_helper.php` | Calls function | [reason] |

### Depended On By
| Module | Impact if Changed |
|--------|-------------------|
| `booking` | Booking flow breaks |

---

## 🐛 BUG SUMMARY

| Severity | Count | Fixed | Pending |
|----------|:-----:|:-----:|:-------:|
| 🔴 Critical | 0 | 0 | 0 |
| 🟠 High | 0 | 0 | 0 |
| 🟡 Medium | 0 | 0 | 0 |
| 🟢 Low | 0 | 0 | 0 |

---

## ⚠️ GOTCHAS & NOTES

- [Quirks, edge cases, performance notes]
```
