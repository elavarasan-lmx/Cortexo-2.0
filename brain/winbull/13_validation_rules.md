# Winbull — Validation Rules / General.js Reference (Brain Artifact 13)

> Source: `admin/assets/js/General.js` (699 lines) — single source of truth for client-side validation.
> Read before adding/fixing any form field or validation logic.

---

## ⚠️ CRITICAL: NO HTML5 Validation Bubbles
General.js auto-disables native browser validation on ALL forms:
```javascript
document.querySelectorAll('form').forEach(form => form.setAttribute('novalidate', true));
```
All validation uses **`showToast()`** — never browser bubbles.

---

## 1. validateKeyPress() — Real-time Input Restriction

Usage: `onkeypress="validateKeyPress(event, this, TYPE)"`

| Type | Name | Allowed Characters | Use For |
|:----:|------|-------------------|---------| 
| 1 | Integer | `0-9` only | Quantity, ID, count |
| 2 | Decimal | `0-9` + `.` (max 3dp) | Rate, amount, price |
| 3 | Signed Decimal | `0-9` + `.` + `-` | Premium (can be negative) |
| 4 | Alphanumeric | `A-Z a-z 0-9` + space | Name, title |
| 5 | Alpha Only | `A-Z a-z` + single space | Person name |
| 6 | Alphanumeric+ | `A-Z a-z 0-9 $ ( ) . -` + space | Address |
| 7 | Alphanum + Hyphen | `A-Z a-z 0-9 -` (no space) | Code, slug |
| 8 | Alphanum + Punctuation | `A-Z a-z 0-9 - . ,` + space | Description |
| 9 | Mixed Required | `A-Z a-z 0-9 -` + space | Must have letters |
| 10 | URL/API | `A-Z a-z 0-9 : / . _ ? = & % + -` | URL, webhook |
| 11 | Email Chars | `A-Z a-z 0-9 . @` | Email field |
| 12 | Letters Only | `A-Z a-z` (no space, no numbers) | Initials |

### Parameters
```
validateKeyPress(event, input, type, maxLength, decimalLength)
```
- `max="100"` — prevents value exceeding max (types 1, 2, 3)
- `data-no-spaces` — blocks space key entirely

### Quick Examples
```html
<!-- Rate: decimal, max 10 chars, 2 decimal places -->
<input type="text" name="rate" onkeypress="validateKeyPress(event, this, 2, 10, 2)">

<!-- Name: alphabets + space -->
<input type="text" name="name" onkeypress="validateKeyPress(event, this, 5)" maxlength="100">

<!-- Premium: signed decimal (negative allowed) -->
<input type="text" name="premium" onkeypress="validateKeyPress(event, this, 3)">

<!-- Quantity: integer, max 10000 -->
<input type="text" name="qty" onkeypress="validateKeyPress(event, this, 1)" max="10000">
```

---

## 2. validateForm() — Auto Submit Validation

Automatically runs on EVERY form submit. No setup needed.

| # | Check | Triggered By | Toast Message |
|:-:|-------|-------------|---------------|
| 1 | Required | `required` attribute | `"[Label] is required!"` |
| 2 | Min Length | `minlength="3"` | `"[Label] must be at least 3 characters"` |
| 3 | Min Value | `min="1"` | `"[Label] must be at least 1"` |
| 4 | No Numbers Only | `data-no-numbers-only` | `"[Label] must contain letters!"` |
| 5 | No Spaces | `data-no-spaces` | `"[Label] cannot contain spaces!"` |
| 6 | URL Check | `data-is-url` | `"[Label] must start with http://"` |
| 7 | Pattern Match | `data-validate="TYPE"` | Pattern-specific message |

Smart label detection: `<label>` text → placeholder → field name

---

## 3. data-validate Patterns

| Pattern | Regex | Error |
|---------|-------|-------|
| `mobile` | `/^[6-9]\d{9}$/` | "Invalid Mobile Number (10 digits)" |
| `email` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Invalid Email Address" |
| `pan` | `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` | "Invalid PAN Number format" |
| `gst` | `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/` | "Invalid GST Number format" |
| `ifsc` | `/^[A-Z]{4}0[A-Z0-9]{6}$/` | "Invalid IFSC Code" |
| `pincode` | `/^[1-9][0-9]{5}$/` | "Invalid Pincode" |

### Negative Checks
- `no-consecutive-dots` — rejects `..` in value
- `no-repeats` — rejects `AAAAAAA` (5+ same char)

---

## 4. Key General.js Functions

| Function | Usage |
|----------|-------|
| `showToast(msg, type, delay)` | `showToast('Saved!', 'success')` |
| `showConfirmModal(title, msg, cb)` | `showConfirmModal('Delete?', 'Sure?', fn)` |
| `showFlashMessage(success, error)` | Auto-called in listing pages |
| `showDeleteBlockedModal(msg)` | When `response.type === 'blocked'` |
| `checkAlreadyExists(table, col, val)` | AJAX duplicate check |
| `showLoader()` / `hideLoader()` | Before/after AJAX calls |

### showToast Types
```javascript
showToast('Saved.', 'success');   // ✅ Green
showToast('Failed.', 'danger');   // ❌ Red
showToast('Low margin.', 'warning'); // ⚠️ Yellow
showToast('Processing...', 'info');  // ℹ️ Blue
```

---

## 🚫 BANNED — Never Use These

| ❌ Banned | ✅ Use Instead |
|-----------|---------------|
| `alert('message')` | `showToast(msg, 'danger')` |
| `confirm('sure?')` | `showConfirmModal(title, msg, cb)` |
| `toastr.success()` | `showToast(msg, 'success')` |
| `Swal.fire()` | `showConfirmModal()` |
| `validateRequired()` | Use `required` attribute |
| `validateMobile()` | Use `data-validate="mobile"` |
| Manual per-field JS validation | Use attributes + `validateForm()` auto |
