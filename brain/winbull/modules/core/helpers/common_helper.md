# Common Helper (Cross-Module)

> File: `application/helpers/common_helper.php`
> Used by: Web, Admin, Mobile
> Status: **DOCUMENTED** | Updated: 2026-05-14

---

## Overview

Common helper functions used across all modules (web + admin + mobile). Provides UI rendering, form helpers, and utility functions.

---

## Functions

### UI Rendering

| Function | Purpose | Used By |
|----------|---------|---------|
| `render_radio_group()` | Render radio button groups | Booking, Trade |
| `render_radio_group_with_onchange()` | Radio with onchange event | Forms |
| `render_checkbox_group()` | Checkbox groups | Settings |
| `render_dropdown()` | Select dropdown | Many forms |

### Form Helpers

| Function | Purpose |
|----------|---------|
| `form_input()` | Generate text input |
| `form_dropdown()` | Generate select |
| `form_datepicker()` | Date picker input |
| `form_file_upload()` | File upload input |

### Utility Functions

| Function | Purpose |
|----------|---------|
| `format_currency()` | Format INR currency |
| `format_date()` | Format date display |
| `calculate_gst()` | GST calculation |
| `generate_otp()` | OTP generation |

---

## Usage Example

```php
// In any controller/view
$this->load->helper('common');

echo render_radio_group('book_type', ['buy' => 'Buy', 'sell' => 'Sell'], 'buy');
```

---

## Bugs Found (from Scanner)

| Bug ID | Issue | Severity |
|--------|-------|----------|
| None | Helper is clean | ✅ |

---

*Part of Core Module - Cross-module helpers*