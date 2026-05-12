# Winbull — Warning Standards (Brain Artifact 14)

> Warning types, severity levels, warning codes, and UI implementation patterns.
> Read before adding any user-facing error, alert, confirmation, or warning message.

---

## 🚦 Severity Levels

| Level | Color | When to Use |
|-------|-------|-------------|
| 🔴 CRITICAL | Red `#dc3545` | Data loss risk, security breach, financial error |
| 🟠 HIGH | Orange `#fd7e14` | Business rule violation, delete blocked, account issue |
| 🟡 MEDIUM | Yellow `#ffc107` | Low margin, duplicate attempt, validation warning |
| 🔵 LOW / INFO | Blue `#17a2b8` | Reminder, tip, non-critical notice |

---

## 📋 Warning Code Registry

### 🔴 CRITICAL
| Code | Trigger | Message | Action |
|------|---------|---------|--------|
| W-C001 | Financial calculation error | "Rate calculation failed. Please refresh and try again." | Block order |
| W-C002 | DB transaction failure | "Database error occurred. Data may not be saved." | Rollback |
| W-C003 | Session security violation | "Your session is invalid. Please login again." | Force logout |
| W-C004 | Permission bypass attempt | "Unauthorized action detected. This has been logged." | Log + redirect |
| W-C005 | Negative margin | "Critical: Customer margin is negative." | Block all orders |

### 🟠 HIGH
| Code | Trigger | Message |
|------|---------|---------|
| W-H001 | Delete blocked — in use | "Cannot delete. This record is linked to [X] active records." |
| W-H002 | Customer inactive | "This customer account is inactive. Reactivate before proceeding." |
| W-H003 | KYC not approved | "Customer KYC is not approved. Orders cannot be placed." |
| W-H004 | Insufficient margin | "Customer does not have sufficient margin for this order." |
| W-H005 | Cancellation window closed | "Cancellation window has passed. Admin override required." |
| W-H006 | Rate panel offline | "Rate panel is currently offline. Live rates unavailable." |
| W-H007 | Commodity deactivated | "This commodity is currently deactivated." |
| W-H008 | Duplicate login | "Your account is already logged in from another device." |

### 🟡 MEDIUM
| Code | Trigger | Message |
|------|---------|---------|
| W-M001 | Low margin | "Customer margin is below the recommended level." |
| W-M002 | Duplicate entry | "A record with this name/value already exists." |
| W-M003 | Max qty exceeded | "Order quantity exceeds the maximum allowed limit." |
| W-M004 | Rate alert near target | "Rate is approaching customer's alert threshold." |
| W-M005 | Bulk delete | "You are about to delete [N] records. This cannot be undone." |
| W-M006 | Large order value | "This is an unusually large order (above ₹[X]). Please verify." |

### 🔵 LOW / INFO
| Code | Trigger | Message |
|------|---------|---------|
| W-L001 | Session expiring | "Your session will expire in 5 minutes. Save your work." |
| W-L002 | Unsaved changes | "You have unsaved changes. Are you sure you want to leave?" |
| W-L003 | No records found | "No records match your search criteria." |
| W-L004 | Upload reminder | "Please upload required documents for KYC verification." |
| W-L005 | Rate refresh needed | "Rates displayed may be outdated. Click to refresh." |

---

## 💻 Implementation Patterns

### Pattern 1: Toast (Non-blocking — medium/low)
```javascript
showToast('Customer margin is low. Proceed with caution.', 'warning');
```

### Pattern 2: Confirm Modal (Blocking — high/critical)
```javascript
showConfirmModal('Are you sure?', 'This will affect 15 customer records.', function() {
    // proceed
});
```

### Pattern 3: Inline Field Warning (Validation)
```javascript
function showFieldWarning(fieldId, message) {
    $('#' + fieldId).addClass('is-invalid').css('border-color', '#dc3545');
    $('#' + fieldId + '_error').text(message).css('color', '#dc3545');
}
function clearFieldWarning(fieldId) {
    $('#' + fieldId).removeClass('is-invalid').css('border-color', '');
    $('#' + fieldId + '_error').text('');
}
```

### Pattern 4: Page-Level Alert Banner
```html
<div class="alert alert-warning alert-dismissible fade show" id="marginWarning" style="display:none;">
    <strong>⚠️ Warning!</strong> <span id="marginWarningMsg"></span>
    <button type="button" class="close" data-dismiss="alert">×</button>
</div>
```

### Pattern 5: Delete Blocked Warning
```javascript
if (res.status === 'error' && res.type === 'blocked') {
    showDeleteBlockedModal(res.message);
} else {
    showToast(res.message, 'danger');
}
```

---

## 📊 Server-Side Response Formats

### Delete Blocked
```php
echo json_encode([
    'status'  => 'error',
    'type'    => 'blocked',
    'message' => 'Cannot delete. Record is in use.',
    'used_by' => 'contract_master (3 contracts), booking (12 orders)',
    'code'    => 'W-H001'
]);
```

### Insufficient Margin
```php
echo json_encode([
    'status'           => 'error',
    'type'             => 'margin_error',
    'message'          => 'Insufficient margin balance.',
    'required_margin'  => 15000,
    'available_margin' => 8500,
    'shortfall'        => 6500,
    'code'             => 'W-H004'
]);
```

---

## 🔕 Warning Suppression Rules

| Warning | Can Be Suppressed? | Logged? |
|---------|-------------------|---------|
| Critical warnings | ❌ Never | ✅ Always |
| Delete blocked | ❌ No | ✅ Always |
| Insufficient margin | Admin override only (Superadmin) | ✅ Always |
| Low margin | ✅ Yes, with confirmation | ✅ Yes |
| Duplicate entry | ❌ No | ✅ Yes |
| Unsaved changes | ✅ User can dismiss | ❌ No |
