# 🔶 Ruby Staging — Session Starter (Read This First)

> If user says **"Ruby"**, **"ruby staging"**, or **"Ruby Precious Metals"** → read this file first.
> This is the single entry point for every Ruby Staging development session.

---

## What Is Ruby Staging?

**Ruby Staging** is the staging environment for **Ruby Precious Metals** — a white-label bullion trading platform cloned from the Winbull codebase, deployed on Server 7.

- **Client**: Ruby Precious Metals
- **Staging URL**: `https://staging.rubypreciousmetals.com/`
- **Production URL**: `https://rubypreciousmetals.com/`
- **Server**: Server 7 (AWS EC2)
- **Server Path**: `/var/www/html/ruby_staging/`
- **GitHub Repo**: `Logimax-Technologies/WTWeb-Rubyprecious` (branch: `ruby_staging`)
- **Database**: `ruby_staging` on AWS RDS

---

## Tech Stack

Same as Winbull (see `brain/winbull/1_architecture.md`):
```
CodeIgniter 3 (web/admin/mobile)
├── Web Frontend      → /application/
├── Admin Panel       → /admin/application/
├── Mobile API        → /mobileapi/application/
└── Lumen 10          → /lmxtrade/winbullliteapi/ (rate engine)
    └── Controller    → RUBYSTAGINGController.php
```

### Key Differences from Winbull
| Config | Winbull | Ruby Staging |
|--------|---------|-------------|
| Database | `winbullstaging` | `ruby_staging` |
| Lumen Controller | `WINBULLSTAGINGController.php` | `RUBYSTAGINGController.php` |
| Socket Event Prefix | `WINBULLSTAGING` | `RUBYSTAGING` |
| Rate File | `winbullstaging.txt` / `.enc` | `ruby_staging.txt` / `.enc` |
| Admin Environment | `production` | `production` |

---

## Critical Files

| File | Risk | Notes |
|------|------|-------|
| `global_configs.php` | 🔴 HIGH | DB credentials, encryption keys — shared pattern with Winbull |
| `RUBYSTAGINGController.php` | 🟠 MED | Rate engine — Redis stores `request_data['commodity']` (fixed May 14) |
| `bookrates.js` | 🟠 MED | WebSocket rate display — jQuery `noConflict()` required |
| `bookrates.php` | 🟡 LOW | Rate display view — synced with booking.php layout May 15 |

---

## Recent Work Log

| Date | What Changed |
|------|-------------|
| 2026-05-14 | Full deployment: DB created, git repo initialized, Lumen controller fix, rate feed confirmed live |
| 2026-05-15 | Web frontend: bookrates.php/js rate display fixed, login flow working, UI parity with booking page |
| 2026-05-15 | Rubysilver (production): bookrates.php/js view layout and rate display aligned |

---

## Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| Nginx domain config pending | 🟡 Open | SSL certificate + domain routing for staging.rubypreciousmetals.com |
| Booking flow untested | 🟡 Open | Login works, rate display works — buy/sell flow not verified on staging |
| All Winbull danger zones apply | 🔴 Inherited | Same codebase = same DZ-001 through DZ-009 vulnerabilities |

---

## Quick Commands

```bash
# SSH to Server 7
ssh -i ~/.ssh/server7_key ec2-user@<server7-ip>

# Navigate to Ruby Staging
cd /var/www/html/ruby_staging/

# Check rate feed (Lumen logs)
tail -f /var/www/html/ruby_staging/lmxtrade/winbullliteapi/storage/logs/lumen-$(date +%Y-%m-%d).log

# Git operations
cd /var/www/html/ruby_staging/
git status
git pull origin ruby_staging
```

---

## Cross-References

- **Parent Brain**: `brain/winbull/` — Ruby uses the same codebase, patterns, and danger zones
- **Lumen Rate Engine**: `brain/winbull/5_lumen_engine.md`
- **Socket Architecture**: `brain/winbull/6_socket_layer.md`
- **Danger Zones**: `brain/winbull/_SYSTEM/DANGER_ZONES.md` — all apply to Ruby
- **Flutter App**: `brain/mkrsilver/0_session_start.md` (separate Flutter client for different clients)

---

*Created: 2026-05-16*
*Maintained by: Elavarasan @ Logimax India*
