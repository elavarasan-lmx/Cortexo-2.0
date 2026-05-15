# Admin Module Brain Index

> Folder: `modules/admin/`
> Purpose: Document all admin panel controllers
> Updated: 2026-05-14

---

## How to Add New Admin Module

When you work on an admin controller:

1. Create folder: `modules/admin/{module_name}/`
2. Create `controller.md` - Document all methods
3. Create `bugs.md` - Any bugs found
4. Create `workflow.md` - How to use this module
5. Update this index

---

## Current Admin Modules

**Status**: 0/57 documented

### Priority Modules (Create When Needed)

| Module | Controller | Priority | When to Create |
|--------|------------|----------|----------------|
| Customers | C_customers.php | P0 | Working on customer mgmt |
| Bookings | C_booking.php | P0 | Working on admin orders |
| Settings | C_generalsettings.php | P0 | Working on config |
| Reports | C_booking_report.php | P0 | Working on reports |
| Commodity | C_commodity_master.php | P1 | Working on products |
| R-Panel | C_rpanel.php | P1 | Working on trading config |
| Margin | C_marginmanagement.php | P1 | Working on margins |
| Hedge | C_hedgemaster.php | P1 | Working on hedge logic |

### Lower Priority (Create When Needed)

| Module | Controller | Priority |
|--------|------------|----------|
| Advertisements | C_advertisements.php | P2 |
| News | C_news.php | P2 |
| Gallery | C_gallery.php | P2 |
| SMS | C_sms_settings.php | P2 |
| Email | C_email_settings.php | P2 |
| WhatsApp | C_whatsapp_settings.php | P2 |
| Others | ... | P3 |

---

## Template for New Admin Module

```markdown
# {Module Name} Module

## Files
- Controller: C_{module}.php
- Model: {module}_model.php
- View: {module}.php

## Methods
| Method | Purpose | Params |
|--------|---------|--------|
| index() | List | - |
| add() | Add new | POST data |
| edit() | Edit | ID |
| delete() | Remove | ID |

## Database Table
- Table: dt_{module}

## Bugs Found
- (list bugs here)

## Related Modules
- (related modules)
```

---

## Rule: Don't Pre-Create Everything

**Only create admin modules when you actually work on them.** This keeps your brain focused on what's relevant.

---

*Part of Winbull Brain*