# Brain Coverage Verification

> Generated: 2026-05-14
> Project: winbullstaging

---

## 1. CONTROLLER COVERAGE

### Web Controllers (12 total)

| # | Controller | Brain Location | Status |
|---|------------|---------------|--------|
| 1 | C_ajax.php | 2_web_frontend.md | ✅ |
| 2 | C_booking.php | modules/web/booking/ | ✅ |
| 3 | C_client_main.php | modules/web/login/ | ✅ |
| 4 | C_email_settings.php | modules/web/email_settings/ | ✅ |
| 5 | C_kyc.php | modules/web/kyc/ | ✅ |
| 6 | C_mobile.php | 2_web_frontend.md | ⚠️ Partial |
| 7 | C_rates.php | 2_web_frontend.md | ⚠️ Partial |
| 8 | C_sendorderstatus.php | modules/web/order_status/ | ✅ |
| 9 | C_trade.php | modules/web/trade/ | ✅ |
| 10 | C_userregistration.php | modules/web/user_registration/ | ✅ |
| 11 | Email_model.php | (not a controller) | - |
| 12 | Welcome.php | (default CI) | - |

**Status**: 9/10 (90%) - Good

---

### Admin Controllers (57 total)

| # | Controller | Brain Location | Status |
|---|------------|---------------|--------|
| 1 | C_advertisements.php | ? | ❌ |
| 2 | C_ajax.php | ? | ❌ |
| 3 | C_appevents.php | ? | ❌ |
| 4 | C_appvideos.php | ? | ❌ |
| 5 | C_area.php | ? | ❌ |
| 6 | C_booking.php | ? | ❌ |
| 7 | C_booking_delivery.php | ? | ❌ |
| 8 | C_booking_report.php | ? | ❌ |
| 9 | C_career_applications.php | ? | ❌ |
| 10 | C_categories.php | ? | ❌ |
| 11 | C_change_psw.php | ? | ❌ |
| 12 | C_clients.php | ? | ❌ |
| 13 | C_com_group.php | ? | ❌ |
| 14 | C_commodity_master.php | ? | ❌ |
| 15 | C_commoditygroupcustomer.php | ? | ❌ |
| 16 | C_contract_master.php | ? | ❌ |
| 17 | C_contractsymbol.php | ? | ❌ |
| 18 | C_customerDelivery.php | ? | ❌ |
| 19 | C_customergroup.php | ? | ❌ |
| 20 | C_customerservice.php | ? | ❌ |
| 21 | C_customersms.php | ? | ❌ |
| 22 | C_email_settings.php | ? | ❌ |
| 23 | C_gallery.php | ? | ❌ |
| 24 | C_generalsettings.php | ? | ❌ |
| 25 | C_hedgemaster.php | ? | ❌ |
| 26 | C_logo_settings.php | ? | ❌ |
| 27 | C_main.php | ? | ❌ |
| 28 | C_maintenance_settings.php | ? | ❌ |
| 29 | C_marginmanagement.php | ? | ❌ |
| 30 | C_marqueetext.php | ? | ❌ |
| 31 | C_news.php | ? | ❌ |
| 32 | C_other_pages.php | ? | ❌ |
| 33 | C_phonebooking.php | ? | ❌ |
| 34 | C_popup.php | ? | ❌ |
| 35 | C_prem_group.php | ? | ❌ |
| 36 | C_product.php | ? | ❌ |
| 37 | C_ratealert_report.php | ? | ❌ |
| 38 | C_rate_history.php | ? | ❌ |
| 39 | C_rpanel.php | ? | ❌ |
| 40 | C_rpanelbank.php | ? | ❌ |
| 41 | C_rpanelcommodity.php | ? | ❌ |
| 42 | C_rpanel_settings.php | ? | ❌ |
| 43 | C_serv_group.php | ? | ❌ |
| 44 | C_serv_master.php | ? | ❌ |
| 45 | C_sms_api.php | ? | ❌ |
| 46 | C_sms_settings.php | ? | ❌ |
| 47 | C_userevent.php | ? | ❌ |
| 48 | C_user.php | ? | ❌ |
| 49 | C_userregistration.php | ? | ❌ |
| 50 | C_whatsapp_settings.php | ? | ❌ |
| 51 | C_whatsappmeta_settings.php | ? | ❌ |
| 52 | C_admininfo.php | ? | ❌ |
| 53 | C_admin_log.php | ? | ❌ |
| 54 | C_adminlog.php | ? | ❌ |
| 55 | C_admin_rpanel.php | ? | ❌ |
| 56 | C_admin_unfix.php | ? | ❌ |
| 57 | C_admin_user.php | ? | ❌ |

**Status**: 0/57 (0%) - **BIG GAP**

---

### Mobile Controllers (4 total)

| # | Controller | Brain Location | Status |
|---|------------|---------------|--------|
| 1 | C_mobileadmintrade.php | 4_mobile_api.md | ✅ |
| 2 | C_mobileclient.php | modules/mobile/client/ | ✅ |
| 3 | C_mobileclienttrade.php | modules/mobile/clienttrade/ | ✅ |
| 4 | C_tradeapi.php | modules/mobile/tradeapi/ | ✅ |

**Status**: 4/4 (100%) - Excellent

---

## 2. BUSINESS RULES COVERAGE

| Rule | Documented In | Status |
|------|---------------|--------|
| Margin Calculation | 12_business_rules.md | ✅ |
| TDS/TCS Calculation | 12_business_rules.md | ✅ (has bug) |
| KYC Validation | modules/kyc/ | ✅ |
| Rate Calculation | 5_lumen_engine.md | ✅ |
| Booking Flow | modules/booking/ | ✅ |
| Order Cancellation | 7_bugs_and_issues.md | ✅ |

**Status**: 6/6 (100%) - Good

---

## 3. VALIDATION RULES COVERAGE

| Validation | Documented In | Status |
|------------|---------------|--------|
| Email Format | 13_validation_rules.md | ✅ |
| Mobile Number | 13_validation_rules.md | ✅ |
| OTP Validation | 11_bug_patterns.md (SEC-002) | ✅ |
| Required Fields | 13_validation_rules.md | ✅ |
| Password Strength | 13_validation_rules.md | ✅ |

**Status**: 5/5 (100%) - Good

---

## 4. CROSS-MODULE FILES COVERAGE

| File | Type | Brain Location | Status |
|------|------|---------------|--------|
| common_helper.php | Helper | modules/core/helpers/ | ✅ |
| trading_helper.php | Helper (Danger!) | modules/core/helpers/ | ✅ |
| Booking_model.php | Model (shared) | modules/core/shared_models/ | ✅ |
| Login_model.php | Model (shared) | modules/core/shared_models/ | ✅ |

**Status**: 4/4 (100%) - Good

---

## SUMMARY

| Category | Covered | Total | Percentage |
|----------|---------|-------|------------|
| Web Controllers | 9 | 10 | 90% |
| Admin Controllers | 0 | 57 | 0% |
| Mobile Controllers | 4 | 4 | 100% |
| Business Rules | 6 | 6 | 100% |
| Validation Rules | 5 | 5 | 100% |
| Cross-Module | 4 | 4 | 100% |

---

## GAPS TO FILL

1. **Admin Controllers** - Add to brain as you work on them
2. **Mobile API patterns** - Already 100%
3. **Cross-module files** - Already 100%

---

## HOW TO VERIFY NEW MODULES

```bash
# Check if controller is in brain
grep -r "C_xyz" brain/winbull/

# If not found, create module brain
```

---

*Verification generated 2026-05-14*