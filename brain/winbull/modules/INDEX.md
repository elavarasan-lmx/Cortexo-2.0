# Winbull Brain - Modules Index

> All module documentation in one place.
> Updated: 2026-05-14

---

## Structure

```
modules/
├── web/                    ← Customer-facing (10 modules)
├── admin/                  ← Admin panel (57 controllers)
├── mobile/                 ← Mobile API (4 controllers)
├── core/                   ← Cross-module files
│   ├── helpers/
│   ├── libraries/
│   └── shared_models/
└── (legacy modules)
```

---

## Web Modules (10)

| Module | Location | Status |
|--------|----------|--------|
| Login | web/login/ | ✅ |
| Booking | web/booking/ | ✅ |
| Trade | web/trade/ | ✅ |
| KYC | web/kyc/ | ✅ |
| User Registration | web/user_registration/ | ✅ |
| Email Settings | web/email_settings/ | ✅ |
| Order Status | web/order_status/ | ✅ |
| Mobile Client | mobile/client/ | ✅ |
| Mobile AdminTrade | mobile/admin_trade/ | ✅ |
| Mobile TradeAPI | mobile/tradeapi/ | ✅ |

---

## Admin Modules

See: [modules/admin/INDEX.md](admin/INDEX.md)

**Status**: Create as needed (don't pre-create all 57)

---

## Core Modules (Cross-Module)

| Module | Type | Status |
|--------|------|--------|
| common_helper | Helper | ✅ |
| trading_helper | Helper (DANGEROUS) | ✅ |
| Booking_model | Shared Model | ✅ |
| Login_model | Shared Model | ✅ |

---

## How to Use This Brain

### 1. Start Session
```bash
# Read session start
cat brain/winbull/0_session_start.md
```

### 2. Find Your Module
```bash
# Find module in brain
grep -r "C_booking" brain/winbull/
```

### 3. Add New Module
```bash
# Create new module brain
# Follow template in modules/admin/INDEX.md
```

### 4. Verify Coverage
```bash
# Check verification
cat brain/winbull/_SYSTEM/COVERAGE_VERIFICATION.md
```

---

## Coverage Stats

| Category | Covered | Total | % |
|----------|---------|-------|---|
| Web | 10 | 10 | 100% |
| Admin | 0 | 57 | 0% (create as needed) |
| Mobile | 4 | 4 | 100% |
| Core | 4 | 4 | 100% |

---

*Part of Winbull Brain*