# 🛠️ Workflow: Setup Foreign Client

This document standardizes the process for onboarding new foreign clients (Malaysia, UAE, etc.) on the WinBull platform.

## 📋 Prerequisites

1.  **Client Info**: Name, Domain, Country, Currency, Timezone.
2.  **Database**: Create a new MySQL DB (e.g., `kvt_malaysia`).
3.  **OneSignal**: Keys for Customer and Admin apps.

## 🚀 Execution Steps

### 1. Generate Configuration

Use the `config_generator.py` script to create a validated `global_configs.php`.

**Command:**
```bash
python3 Project/.brain/scripts/config_generator.py \
  Project/.brain/scripts/client_config.json \
  Project/.brain/templates/global_configs.template.php \
  output/global_configs.php
```

### 2. Update Database (Foreign Rules)

Foreign clients have different defaults than Indian clients. Apply the following SQL adjustments:

- **Timezone**: Ensure `dt_settings` has the correct timezone offset.
- **Tax**: Update `dt_commodity_masters` with local tax (e.g., SST 6%).
- **KYC**: Update labels in `dt_customer_fields` (Passport/MyKad instead of Aadhaar/PAN).

### 3. Deploy to Server

1.  Mount the target server using `server.sh`.
2.  Upload `global_configs.php` to the client's web root.
3.  Restart the Socket.IO service (if prefix changed).

### 4. Verification Checklist (21-Point)

Refer to `Project/.brain/rules/foreign_client_rules.md` for the full checklist.
Key checks:
- [ ] Admin login works.
- [ ] Live rates are ticking (International source).
- [ ] Booking calculation matches local tax rules.
- [ ] Mobile app points to correct staging/production URL.

---
*Created by Antigravity (Agent Tom) | Date: 2026-05-04*
