# 🗄️ DATABASE SCHEMA — WinBull Trade
> Auto-generated from `winbull.sql` | 94 Tables | Last Updated: 2026-03-14

---

## 📊 TABLE INDEX (94 Tables)

### 🔐 Session & Auth (5)
| Table | PK | Purpose |
|-------|-----|---------|
| `ci_sessions` | `id` | CI session storage (customer portal) |
| `ci_usersessions` | `id` | CI user session storage |
| `dt_adminsessions` | `session_id` | Admin panel sessions |
| `dt_usersessions` | — | User session tracking |
| `dt_admin_user` | `admin_user_id` | Admin login credentials, IP restrict, validity, 2FA |

### 👥 Customer Management (8)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_customer` | `cus_id` | **CORE** — Customer master (name, mobile, KYC, status, login) |
| `dt_customergroup` | `cusgrp_id` | Customer group categories |
| `dt_customergroupitems` | composite | Customer-to-group mapping |
| `dt_customerservicegroup` | — | Service group assignment for customers |
| `dt_comgroupcustomerservice` | composite | Commodity group ↔ customer service link |
| `dt_cus_commodity` | composite(`cus_com_cus_id`, `cus_com_id`) | Per-customer commodity config (MOQ, buy/sell active, open qty) |
| `dt_cusdel_members` | — | Delivery members for customer |
| `dt_user_device` | — | Mobile device tokens for push notifications |

### 📦 Commodity & Contract (10)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_com_master` | `com_id` | **CORE** — Commodity master (name, weight, unit, tax, margin, purity) |
| `dt_commoditytype` | `ctp_id` | Commodity types (Gold=1, Silver=2) |
| `dt_contractmaster` | `contract_id` | **CORE** — Rate contract display config (symbol, bid/ask diff, display order) |
| `dt_contractsymbol` | `contract_id` | Available contract symbols for selection |
| `dt_contractmaslit` | `contract_id` | Contract master lite version |
| `dt_mcxcontractmaster` | — | MCX contract master |
| `dt_com_group_master` | `com_group_id` | Commodity group (e.g., "Default") |
| `dt_com_group_com` | composite | Group-to-commodity mapping with premiums, trade settings |
| `dt_com_group_tracking` | `tracking_id` | Audit trail for commodity group changes |
| `dt_com_group_wt` | `com_wtgroup_id` | Commodity weight group |

### 📈 Rate Panel (7)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_rpanel` | — | **CORE** — Live rate panel data |
| `dt_rpanelcommodities` | — | R-Panel commodity configuration |
| `dt_rpanelcontract` | — | R-Panel contract mapping |
| `dt_rpanelcontract_tracking` | — | Audit trail for rpanel contract changes |
| `dt_rpanel_settings` | — | R-Panel display settings |
| `dt_rpanelbank` | — | Bank rate panel data |
| `dt_r_panel` | — | Additional rate panel data |
| `dt_r_panel_tracking` | — | Rate panel change tracking |
| `dt_bankcontractmaster` | `bcontract_id` | Bank contract config (symbol, conversion value, extra charges) |

### 📋 Booking & Trading (6)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_booking` | `book_no` | **CORE** — Order/booking master (80+ columns: customer, commodity, qty, rate, margin, status, device info) |
| `dt_booking_tracking` | `tracking_id` | Audit trail for booking changes |
| `dt_unfix` | — | Unfix order operations |
| `dt_knockoff` | — | Knock-off settlement operations |
| `dt_coverupmcx` | `cov_sno` | MCX cover-up tracking (buy/sell qty by commodity type) |
| `order_logs` | — | Order execution logs |

### 💰 Financial (4)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_marginmanagement` | — | **CORE** — Customer margin/balance management |
| `dt_fundtransfer` | — | Fund transfer records |
| `dt_transaction` | — | Transaction records |
| `dt_quotation` | — | Price quotation records |

### 🚚 Delivery (3)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_customerdelivery` | — | Customer delivery records |
| `dt_customer_deliveryinvoice` | — | Delivery invoice details |
| `dt_deliverytype` | — | Delivery type configuration |

### 🏢 Company & Branch (4)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_clients` | `id_client` | **MULTI-TENANT** — Client/company master (rate alerts, API URLs, OneSignal keys) |
| `dt_comp_branch` | `branch_code` | Company branches (name, address, GST, HSN) |
| `dt_branch_group` | `id_branchrights` | Branch access rights per admin user |
| `dt_info` | — | Company information |

### ⚙️ Settings & Config (6)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_generalsettings` | — | General application settings |
| `dt_generalrpsettings` | — | General R-Panel settings |
| `dt_email_settings` | — | Email configuration (SMTP) |
| `dt_sms_settings` | — | SMS gateway settings |
| `dt_smsappsettings` | — | SMS app integration settings |
| `dt_whatsapp_settings` | — | WhatsApp settings |
| `dt_whatsappmeta_settings` | — | WhatsApp Meta API settings |
| `email_config` | — | Email configuration |

### 🔒 Permissions & Logging (4)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_userrights` | — | Admin user permission matrix (menu_code × action) |
| `dt_menu` | — | Admin menu structure |
| `dt_admin_log` | `log_id` | Admin activity log (type, description, IP, user agent) |
| `dt_admininfo` | `ai_sno` | Admin notification/info messages |

### 🔔 Alerts & Notifications (1)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_ratealert` | — | Customer rate alert configuration |

### 📊 Hedging (4)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_hedging` | — | Hedging records |
| `dt_hedgemaster` | — | Hedge master configuration |
| `dt_hedge_log` | — | Hedging activity log |
| `dt_mt5_hedgedata` | — | MT5 hedge data integration |

### 📊 Rates & History (2)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_historicaldata` | — | Historical rate data |
| `dt_historical_avg` | — | Historical rate averages |

### 🏪 Premium Groups (2)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_prem_group_master` | — | Premium group master |
| `dt_prem_group_com` | — | Premium group commodity mapping |

### 🛒 Service Groups (4)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_serv_master` | — | Service master |
| `dt_serv_group` | — | Service group |
| `dt_serv_group_com` | — | Service group commodity mapping |
| `dt_serv_group_master` | — | Service group master config |
| `dt_serv_rate_group` | — | Service rate group |

### 🏪 E-Commerce / Product (4)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_category` | `cat_id` | Product categories (Gold Coins, Silver, etc.) |
| `dt_product` | — | Product catalog |
| `dt_purchase` | — | Purchase records |
| `dt_localstock` | — | Local stock management |
| `dt_grn` | — | Goods Received Note |
| `dt_supplier` | — | Supplier master |
| `dt_metals` | — | Metals master data |

### 📢 Content & UI (6)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_news` | — | News articles |
| `dt_gallery` | — | Image gallery |
| `dt_advertisements` | `adv_id` | Advertisement banners |
| `dt_marqueetext` | — | Scrolling marquee text |
| `dt_popup` | — | Popup messages |
| `dt_events` | — | Calendar events |
| `dt_appevents` | `appeven_id` | Mobile app events |
| `dt_appvideos` | `appvideo_id` | App video tutorials |
| `dt_com_weight` | composite | Commodity weight tracking |

### 🌍 Geography (3)
| Table | PK | Purpose |
|-------|-----|---------|
| `dt_area` | `ar_sno` | Area/region master |
| `dt_city` | `city_id` | Indian cities with state mapping (1500+ cities) |
| `dt_state` | — | Indian states |
| `dt_country` | `ct_id` | Countries with phone codes (239 countries) |

---

## 🔑 CRITICAL TABLES — Column Detail

### `dt_booking` (Order Master) — 80+ columns
```
book_no (PK), book_cusid, book_datetime, book_comid, book_type,
book_comtype, book_qty, book_bar_type (0=grams, 1=kg),
book_no_bar, book_rate, book_comweight, book_totalcost,
book_marginhold, book_margin, book_margintype, book_status,
book_fixtype, orderplacedtime, ordervalidity, ordertype,
orderstatus, delete_status, book_by, book_transfer,
order_liveprice, order_actualprice, book_liveprice,
remarks, book_usercomment, book_deviceid, user_agent,
book_useripaddress, book_adminipaddress, book_adminuser,
is_unfix, email_sent, entry_date, purity, book_branch,
book_pricefrom (0=Manual, 1=MCX, 2=Bank),
book_bnkfixtype, book_ozvalue, book_ozpremium,
book_bnkconv, book_bnkinrval, book_bnktaxval,
dollar_fixedrate, inr_fixedrate, book_deliverydate,
book_hedgemanual (0=Auto, 1=Manual), unfix, book_unfixclose
```

### `dt_customer` — Customer Master
```
cus_id (PK), cus_name, cus_mobile, cus_password, cus_email,
cus_gst, cus_pan, cus_aadhar, cus_address, cus_city,
cus_state, cus_country, cus_pincode, cus_dob,
cus_kyc_status, cus_status, cus_active, cus_area,
cus_customergroup, cus_branch, cus_approved_by,
cus_approved_date, cus_login_otp, cus_google2fa_secret,
cus_2fa_enabled, cus_blocked
```

### `dt_com_master` — Commodity Master
```
com_id (PK), com_name (UNIQUE), com_type, com_weight,
com_unit (0=default), com_other_charges, com_display_purity,
com_correction_type, com_order_number, com_active,
com_isregion, com_calpurity, com_tax, com_octroi,
com_stamduty, com_is_coin, com_area, com_bar_quantity,
com_margin_type (0=Percentage, 1=Value), com_margin_value,
com_roundoff, allowed_decimals, bar_selection (0=manual, 1=select),
com_bar_no, com_bar_type, hsn_no, com_rest_wt
```

### `dt_contractmaster` — Rate Contract
```
contract_id (PK), contract_symbol, displayname,
biddiff, askdiff, showdiff, 
ctype (1=MCX, 2=Bank, 3=Others),
displayorder, status, userpage_status,
userpage_displayname, userpage_disp_order,
round_off, aribitchart_status, com_type
```

### `dt_admin_log` — Activity Log
```
log_id (PK), log_datetime, log_type (0=Trading, 1=CommodityGroup,
2=RpanelUpdate, 3=RpanelStatus, 4=CommodityMaster,
5=PremiumGroup, 6=ContractMaster, 7=TradeOnOff),
log_description, log_pre_data, log_update_data,
log_book_deviceid, log_user_agent, log_book_useripaddress,
log_book_adminipaddress, log_book_adminuser, log_admin_id
```

### `dt_clients` — Multi-Tenant Client Config
```
id_client (PK), client (UNIQUE), ratealert, highlow,
status, code (UNIQUE), baseurl, orderexeurl, name,
onesignalid, onesignalapi, firebaseserverkey,
smssenderid, limitexpireurl, tradeonoffurl,
higlowalertsettings_gold_up/down,
higlowalertsettings_silver_up/down,
gold_contract, silver_contract, alertfor (1=Ounce, 2=MCX),
bank_gold_contract, bank_silver_contract,
exchange_rate, alert_from, alert_to
```

---

## 🔗 KEY RELATIONSHIPS

```
dt_customer.cus_customergroup → dt_customergroup.cusgrp_id
dt_customer.cus_area → dt_area.ar_sno
dt_booking.book_cusid → dt_customer.cus_id
dt_booking.book_comid → dt_com_master.com_id
dt_com_master.com_type → dt_commoditytype.ctp_id
dt_com_group_com.com_group_id → dt_com_group_master.com_group_id
dt_com_group_com.com_id → dt_com_master.com_id
dt_cus_commodity.cus_com_cus_id → dt_customer.cus_id
dt_cus_commodity.cus_com_id → dt_com_master.com_id
dt_contractmaster → dt_contractsymbol (symbol mapping)
dt_bankcontractmaster.bcontract_rate → dt_contractsymbol
dt_admin_log.log_admin_id → dt_admin_user.admin_user_id
dt_userrights → dt_admin_user + dt_menu
dt_branch_group → dt_admin_user + dt_comp_branch
```

---

## ⚠️ IMPORTANT FIELD VALUES

### `dt_booking.book_status`
- Varies by business logic — check `trading_helper.php`

### `dt_booking.book_type`
- Buy/Sell type indicator

### `dt_booking.book_pricefrom`
- `0` = Manual price
- `1` = MCX rate
- `2` = Bank rate

### `dt_booking.book_by`
- Source of order (admin, customer, mobile, etc.)

### `dt_com_master.com_margin_type`
- `0` = Percentage
- `1` = Fixed Value

### `dt_admin_log.log_type`
- `0` = Trading
- `1` = Commodity Group
- `2` = Rpanel Update
- `3` = Rpanel Status
- `4` = Commodity Master
- `5` = Premium Group
- `6` = Contract Master
- `7` = Trade On/Off

### `dt_contractmaster.ctype`
- `1` = MCX
- `2` = Bank
- `3` = Others

### `dt_bankcontractmaster.bconvert_value_type`
- `1` = Add
- `2` = Subtract
- `3` = Multiply
- `4` = Divide

---

> **Source**: `winbull.sql` (400KB, 3133 lines)
> **Note**: Table prefix is `dt_` (data table). Session tables use `ci_` prefix.

---

## 🔍 SCHEMA VALIDATION GUIDE

### Foreign Keys to Check
| Parent Table | Child Table | FK Column |
|-------------|-------------|-----------|
| `dt_customer` | `dt_booking` | `book_cusid` → `cus_id` |
| `dt_customer` | `dt_transaction` | `trans_cuscode` → `cus_id` |
| `dt_com_master` | `dt_booking` | `book_comid` → `com_id` |
| `dt_admin_user` | `dt_admin_log` | `log_admin_id` → `admin_user_id` |

### Column Type Risks
| Table.Column | Code Expects | Risk |
|-------------|-------------|------|
| `dt_customer.cus_login_password` | Plaintext VARCHAR | ⚠️ No hashing — stores plaintext |
| `dt_booking.book_rate` | DECIMAL with precision | If FLOAT → rounding errors |
| `dt_transaction.trans_amount` | DECIMAL(15,2) | If INT → no decimals |

### Missing Indexes to Check
| Table | Column | Query Pattern |
|-------|--------|--------------|
| `dt_booking` | `book_cusid` | `WHERE book_cusid = ?` |
| `dt_booking` | `book_datetime` | `WHERE DATE(book_datetime) BETWEEN` |
| `dt_admin_log` | `log_datetime` | `ORDER BY log_datetime` |
| `dt_transaction` | `trans_cuscode` | `WHERE trans_cuscode = ?` |

### Validation SQL
```sql
-- Check FK constraints
SELECT * FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'winbullSource' AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check indexes
SHOW INDEX FROM dt_booking;

-- Check column types
DESCRIBE dt_booking;
```

---

# 🔗 DEPENDENCY MAP

> Merged from dependencies.md | Verified against actual source code

---

## 🗄️ Core Table Dependencies

#### `dt_customer` → Used By: `C_clients`, `C_booking`, `C_marginmanagement`, `C_userregistration`, `C_phonebooking`, `C_admin_unfix`, Mobile API
#### `dt_booking` → Used By: `C_booking`, `C_booking_report`, `C_admin_unfix`, `C_phonebooking`, `C_customerdelivery`, Mobile API, `trading_helper.php` (20+ functions)
#### `dt_com_master` → Used By: `C_commodity_master`, `C_booking`, `C_rpanel`, `C_rpanelcommodity`, `C_contract_master`, Mobile API, `trading_helper.php`
#### `dt_transaction` → Used By: `C_marginmanagement`, `C_booking`, `C_phonebooking`, Mobile API, `trading_helper.php`
#### `dt_generalsettings` → Used By: ALL modules (single row — trade on/off, min/max qty, hedge config)

---

## 🔧 Shared Helpers

### `common_helper.php` (admin/application/helpers/)
`log_admin_add()`, `log_admin_edit()`, `log_admin_delete()`, `get_changed_fields()`, `render_radio_group()`, `render_checkbox_input()`, `renderMobileInput()`, `disable_autocomplete_script()`
→ Used By: ALL admin controllers

### `trading_helper.php` (system/helpers/lmx/classes/) — 74 functions
Key: `insert_record()`, `get_commodity_data()`, `notifyBooking()`, `get_availablebalance()`
→ Used By: ALL booking/trading controllers

### `General.js` (admin/assets/js/) — 12 functions
`selectAll()`, `validateKeyPress()`, `Argument()`, `showToast()`, `showConfirmModal()`, `showLoader()`, `validateForm()`, `showDeleteBlockedModal()`
→ Used By: ALL admin forms

---

## 🔄 Circular Dependencies (⚠️ Watch Out!)

- **dt_booking ↔ dt_transaction**: Booking checks balance, then inserts transaction. No DB transaction wrapping = race condition.
- **dt_r_panel ↔ dt_booking**: R-panel rates feed booking, limit orders trigger on rate changes. Rate lock timing issues.

---

## 📦 Shared Models Risk

| Model | Used By | Risk |
|-------|---------|:----:|
| **General_model** | ALL 54 admin controllers | 🔴 |
| **Login_model** | C_main, C_client_main | 🔴 |
| **Booking_model** | C_booking (admin+web), C_phonebooking | 🔴 |
| Popup_model | C_popup only | 🟢 |
| Area_model | C_area only | 🟢 |
| Gallery_model | C_gallery only | 🟢 |

---

## 🚨 Critical Dependencies (Breaking = System Down)

1. `dt_customer` — No login/orders if corrupted
2. `dt_r_panel` — No rates = no trading
3. `dt_transaction` — Wrong = financial loss
4. `trading_helper.php` — Broken = all trading stops

## 🔧 Safe Modification Zones

**Low Risk**: `C_news`, `C_gallery`, `C_advertisements`, `C_marqueetext`, `C_popup`, `C_area`, `C_categories`
**High Risk**: `C_clients`, `C_booking`, `C_rpanel`, `trading_helper.php`, `common_helper.php`
