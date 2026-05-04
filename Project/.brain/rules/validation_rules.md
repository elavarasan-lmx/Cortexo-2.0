# ✅ Validation Rules — WinBull Trade

> Source: `admin/assets/js/General.js` (699 lines)
> Extracted from old `.agent/rules/validation_rules.md`
> Last Updated: 2026-05-03

---

## ⚠️ No HTML5 Validation — All Toast-Based

General.js auto-disables native validation on ALL forms. Everything uses `showToast()`.

---

## Two Validation Systems

1. **`validateKeyPress()`** — Real-time (prevents typing bad chars)
2. **`validateForm()`** — Submit-time (checks required, patterns)

---

## validateKeyPress Types

Usage: `onkeypress="validateKeyPress(event, this, TYPE)"`

| Type | Name | Allowed | Use For |
|:----:|------|---------|---------|
| 1 | Integer | `0-9` | Qty, ID |
| 2 | Decimal | `0-9.` (max 3dp) | Rate, amount |
| 3 | Signed Decimal | `0-9.-` | Premium (negative ok) |
| 4 | Alphanumeric | `A-Za-z0-9` + space | Name, title |
| 5 | Alpha Only | `A-Za-z` + single space | Person name |
| 6 | Alphanumeric+ | `A-Za-z0-9$().-` + space | Address |
| 7 | Alphanum+Hyphen | `A-Za-z0-9-` (no space) | Code, slug |
| 8 | Alphanum+Punct | `A-Za-z0-9-.,` + space | Description |
| 9 | Mixed Required | `A-Za-z0-9-` + space (must have letters) | Mixed input |
| 10 | URL/API | `A-Za-z0-9:/._?=&%+-` | URL, webhook |
| 11 | Email | `A-Za-z0-9.@` | Email field |
| 12 | Letters Only | `A-Za-z` (no space/numbers) | Initials |

---

## data-validate Patterns

| Pattern | Regex | Error |
|---------|-------|-------|
| `mobile` | `/^[6-9]\d{9}$/` | Invalid Mobile (10 digits) |
| `email` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Invalid Email |
| `pan` | `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` | Invalid PAN |
| `gst` | `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/` | Invalid GST |
| `ifsc` | `/^[A-Z]{4}0[A-Z0-9]{6}$/` | Invalid IFSC |
| `pincode` | `/^[1-9][0-9]{5}$/` | Invalid Pincode |

---

## General.js Utility Functions

| Function | Purpose |
|----------|---------|
| `showToast(msg, type, delay)` | Toast notification (success/danger/warning/info) |
| `showConfirmModal(title, msg, cb)` | Confirm dialog |
| `showDeleteBlockedModal(msg)` | FK blocked delete |
| `checkAlreadyExists(table, col, val)` | AJAX duplicate check |
| `showLoader()` / `hideLoader()` | AJAX spinner |

---

## 🚫 BANNED

| ❌ Never Use | ✅ Use Instead |
|-------------|---------------|
| `alert()` | `showToast(msg, 'danger')` |
| `confirm()` | `showConfirmModal()` |
| `toastr.success()` | `showToast(msg, 'success')` |
| `Swal.fire()` | `showConfirmModal()` |
