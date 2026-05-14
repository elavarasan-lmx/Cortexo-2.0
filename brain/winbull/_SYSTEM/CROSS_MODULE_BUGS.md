# Cross-Module Bug Tracker

> Bugs that affect shared tables or span multiple modules.
> Updated by: /learn-and-improve Step 1d (when fix touches shared tables)

---

## Known Cross-Module Risks

| Bug ID | Primary Module | Other Modules Affected | Shared Table | Status |
|---|---|---|---|---|
| #12 | Login (C_client_main) | All modules | dt_r_panel | 🔴 OPEN — UPDATE without WHERE |
| #13 | Booking | MobileAPI | dt_booking | 🔴 OPEN — Race condition |
| #14 | MobileAPI | MobileAPI | Both mobile controllers | 🟡 OPEN — Duplicate changePassword |
| #26 | Lumen (WinbullliteController) | All socket-dependent | WhatsApp alerts | 🟡 OPEN — Wrong curl var |
| #27 | MobileAdmin | iOS App | dt_app_version | 🟡 OPEN — Wrong platform code |
| #30 | Booking (confirmLimitorder) | Margin | dt_transaction | 🟡 OPEN — Margin reversal gap |

---

## Resolved

_(No cross-module bugs resolved yet.)_
