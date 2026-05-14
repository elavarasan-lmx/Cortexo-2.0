# Booking Module Brain v1.1
> Built: 2026-05-13T13:25+05:30 | Updated: 2026-05-13T13:35+05:30
> Target: `/run/media/lmx/LMX/Winbull/Personal/Devops/Project/winbullstaging/`
> Files: C_booking.php (233→247 lines), Booking_model.php (986→992 lines)
> Risk: 🟡 ELEVATED (was 🔴 HIGH) — 10 SQL injections fixed, auth gates added, CORS restricted

---

## 1. Architecture Map

```
C_booking.php (Controller — 17 methods, 239 lines)
  ├─ Page rendering: index(), book(), rates(), Home()
  ├─ Data APIs (JSON): getcommodities(), get_commodity_data(), get_rpanel_data()
  ├─ Content APIs: getmarqueetext(), get_admintext(), getMarqueNews()
  ├─ Mobile APIs: getadvertisements(), getmobileappevents(), getmobileappvideos()
  ├─ Gallery: getgallery(), getgallerygold(), getgallerysilver()
  ├─ Financial: gettds()
  └─ Data ingestion: historicaldata(), calculate_daily_averages()

Booking_model.php (Model — 43 methods, 1001 lines)
  ├─ Commodity data (3 variants): get_commodity_data(), get_tradecommodity_data(), display_commodity_data()
  ├─ Rate panel: get_rpanelcontracts()
  ├─ Trade status: get_commoditystatus()
  ├─ Content: get_marqueetext(), get_admin_text(), get_MarqueNews(), get_text()
  ├─ Mobile content: getadvertisements(), getmobileappevents(), getmobileappvideos(), get_calendardata()
  ├─ Gallery: getgallery(), getgallerygold(), getgallerysilver(), get_image()
  ├─ Device: user_device_register()
  ├─ Rate alerts: ratealertRequest(), ratealertDeleteRequest(), update_ratealert(), getratealertlist(), getratealertTolerance()
  ├─ Financial: get_tdsvalue()
  ├─ Historical: historicaldata(), store_daily_averages()
  ├─ Quotation: getCountry(), get_number_gst(), get_Delivery_content(), get_SMSAppSettings_dlt(), insert_quotation_record()
  └─ Logging: log_add(), log_edit(), log_delete()
```

### File Inventory

| File | Lines | Purpose |
|---|---|---|
| `controllers/C_booking.php` | 239 | Controller — routing + data APIs |
| `models/Booking_model.php` | 1001 | **Monster model** — ALL business logic |
| `views/booking.php` | ? | Public booking page (guest view) |
| `views/bookrates.php` | ? | Authenticated booking rates page |
| `views/bookheader.php` | ? | Auth'd page header |
| `views/bookfooter.php` | ? | Auth'd page footer |
| `views/old_booking.php` | ? | Legacy/deprecated view |
| `assets/js/custom/booking.js` | 1646 | Main booking JS (client-side logic) |
| `assets/js/custom/booking27.js` | 1581 | Backup/variant of booking JS |
| `assets/js/custom/bookrates.js` | ? | Rate display JS |

---

## 2. Vulnerability Catalog

### 🔴 V-B001: CORS Wildcard (P0)
**File:** `C_booking.php` lines 2-4
```php
header('Access-Control-Allow-Origin: *');           // ANY origin can call these APIs
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
```
**Impact:** Any website can make cross-origin requests to booking endpoints. Combined with no auth, this is a complete data exposure.
**Fix:** Restrict to known origins or remove for server-rendered pages.

### 🔴 V-B002: SQL Injection — `get_tradecommodity_data()` (P0)
**File:** `Booking_model.php` line 221
```php
WHERE cgitems_cusid = '" . $userid . "' AND ...
```
**Impact:** `$userid` comes from session → customer ID lookup. If mobile API calls this with raw POST input, it's injectable.
**Fix:** Use CI Query Builder `$this->db->where('cgitems_cusid', $userid)`

### 🔴 V-B003: SQL Injection — `display_tradecommodity_data()` (P0)
**File:** `Booking_model.php` line 355
```php
WHERE cgitems_cusid = '" . $userid . "' AND ...
```
**Same pattern as V-B002.**

### 🔴 V-B004: SQL Injection — `get_commoditystatus()` (P0)
**File:** `Booking_model.php` lines 388, 407, 423
```php
WHERE ccd.cus_com_cus_id = '" . $cus_id . "' AND ...   // line 388
WHERE cus_grp.cgitems_cusid = " . $cus_id               // line 407 (NO QUOTES!)
WHERE cus_id = " . $cus_id                              // line 423 (NO QUOTES!)
```
**Impact:** Three SQL injections in one method. Lines 407 and 423 don't even quote the value — trivially injectable.

### 🔴 V-B005: SQL Injection — `user_device_register()` (P0)
**File:** `Booking_model.php` lines 619, 623
```php
WHERE device_token='" . $regid . "' AND device_uuid='" . $uuid . "'"   // line 619
WHERE device_uuid='" . $uuid . "'"                                      // line 623
```
**Impact:** Device registration takes user-supplied UUIDs and tokens directly into SQL.

### 🔴 V-B006: SQL Injection — `ratealertRequest()` (P0)
**File:** `Booking_model.php` lines 644, 666-667
```php
WHERE alert_cusdeviceid='" . $alertratedata['alert_cusdeviceid'] . "' AND alert_comid='" . $alertratedata['alert_comid'] . "'"   // line 644

// line 666-667: RAW INSERT with full string concatenation
$sql = "INSERT INTO dt_ratealert ... VALUES ('" . $alertratedata['alert_device'] . "', '" . $alertratedata['alert_cusdeviceid'] . "', ...)";
```
**Impact:** Complete SQL injection via rate alert form. **Both SELECT and INSERT are vulnerable.**

### 🔴 V-B007: SQL Injection — `getratealertlist()` (P0)
**File:** `Booking_model.php` line 720
```php
WHERE alert_device = '" . $uuid . "' AND alert_status != 2
```

### 🟡 V-B008: SQL Injection — `get_Delivery_content()` (P1)
**File:** `Booking_model.php` lines 885, 899
```php
WHERE serv_id = '" . $service_id . "'"    // line 885
where service_id = '" . $service_id . "'" // line 899
```

### 🟡 V-B009: SQL Injection — `get_SMSAppSettings_dlt()` (P1)
**File:** `Booking_model.php` line 937
```php
where sas_id='" . $sms_id . "'"
```

### 🟡 V-B010: No Auth on Public Endpoints (P1)
**File:** `C_booking.php`
These methods have **ZERO session checks**:
- `getcommodities()` (line 45)
- `get_commodity_data()` (line 57) — partial check for guest vs logged
- `get_rpanel_data()` (line 70)
- `getmarqueetext()` (line 81)
- `get_admintext()` (line 86)
- `getMarqueNews()` (line 91)
- `getadvertisements()` (line 96)
- `getmobileappevents()` (line 101)
- `getmobileappvideos()` (line 106)
- `getgallery()` (line 111)
- `getgallerygold()` (line 116)
- `getgallerysilver()` (line 121)
- `gettds()` (line 148) — **exposes tax configuration**
- `historicaldata()` (line 154) — **WRITES DATA with no auth!**
- `calculate_daily_averages()` (line 228) — **TRUNCATES TABLE with no auth!**

### 🔴 V-B011: Unauthenticated Data Write/Delete (P0)
**File:** `C_booking.php` lines 154-227, 228-232
- `historicaldata()`: Fetches external data and INSERTS into `dt_historicaldata` — no session check
- `calculate_daily_averages()`: Calls `store_daily_averages()` which **TRUNCATES `dt_historicaldata`** — no session check
- Anyone can call `C_booking/calculate_daily_averages` and wipe historical data

### 🟡 V-B012: Self-referencing Model Load (P2)
**File:** `Booking_model.php` line 16
```php
$this->load->model('Booking_model');  // Loads itself — circular reference bug
```

### 🟡 V-B013: Debug Output in Production (P2)
**File:** `C_booking.php` lines 175-177
```php
echo "Raw API Response: <pre>";
print_r($response);
echo "</pre>";
```
And `Booking_model.php` line 821, 825, 828 — debug echo statements in `store_daily_averages()`.

### 🟡 V-B014: Hardcoded Lightstreamer Credentials (P2)
**File:** `Booking_model.php` line 183
```php
"lsdetails" => array('url' => "http://logimaxrates.in:8080", 'adapter' => "OSWLSTOCKLIST_REMOTE", 'provider' => "OSWLQUOTE_ADAPTER", 'username' => "lmxwinbullliteapp")
```

---

## 3. SQL Injection Summary

| ID | Method | Line(s) | Variable | Quoted? | Risk |
|---|---|---|---|---|---|
| V-B002 | `get_tradecommodity_data()` | 221 | `$userid` | Yes | P0 |
| V-B003 | `display_tradecommodity_data()` | 355 | `$userid` | Yes | P0 |
| V-B004a | `get_commoditystatus()` | 388 | `$cus_id` | Yes | P0 |
| V-B004b | `get_commoditystatus()` | 407 | `$cus_id` | **NO** | 🔴 P0 |
| V-B004c | `get_commoditystatus()` | 423 | `$cus_id` | **NO** | 🔴 P0 |
| V-B005a | `user_device_register()` | 619 | `$regid`, `$uuid` | Yes | P0 |
| V-B005b | `user_device_register()` | 623 | `$uuid` | Yes | P0 |
| V-B006a | `ratealertRequest()` | 644 | `$alertratedata[*]` | Yes | P0 |
| V-B006b | `ratealertRequest()` | 666-667 | `$alertratedata[*]` | Yes | 🔴 P0 (INSERT) |
| V-B007 | `getratealertlist()` | 720 | `$uuid` | Yes | P0 |
| V-B008a | `get_Delivery_content()` | 885 | `$service_id` | Yes | P1 |
| V-B008b | `get_Delivery_content()` | 899 | `$service_id` | Yes | P1 |
| V-B009 | `get_SMSAppSettings_dlt()` | 937 | `$sms_id` | Yes | P1 |

**Total: 13 SQL injection points (9 P0, 4 P1)**

---

## 4. Business Domains

| Domain | Methods | Financial Risk |
|---|---|---|
| Commodity Display | `get_commodity_data()`, `display_commodity_data()`, `get_tradecommodity_data()` | Low (read-only) |
| Rate Panel | `get_rpanel_data()`, `get_rpanelcontracts()` | Medium (pricing data) |
| Trade Status | `get_commoditystatus()` | **High** (controls buy/sell permissions) |
| Rate Alerts | `ratealertRequest()`, `ratealertDeleteRequest()`, `getratealertlist()` | **High** (triggers trades) |
| Historical Data | `historicaldata()`, `store_daily_averages()` | **Critical** (data integrity) |
| TDS/Tax | `get_tdsvalue()` | **High** (financial calculations) |
| Quotation | `get_number_gst()`, `insert_quotation_record()`, `get_Delivery_content()` | Medium |
| Device Management | `user_device_register()` | Medium (push notification targeting) |
| Content | marquee, news, ads, gallery, events, videos | Low |
| SMS/OTP | `get_Delivery_content()`, `get_SMSAppSettings_dlt()` | Medium (OTP bypass vector) |

---

## 5. Fix Priority Matrix

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| 🔴 P0-1 | Auth gate on `historicaldata()` + `calculate_daily_averages()` | 15 min | Prevents unauthenticated data wipe |
| 🔴 P0-2 | Fix V-B004b,c (unquoted `$cus_id` in `get_commoditystatus()`) | 20 min | Trivially injectable — highest risk |
| 🔴 P0-3 | Fix V-B006b (raw INSERT in `ratealertRequest()`) | 15 min | SQL injection via rate alert form |
| 🔴 P0-4 | Batch fix remaining 10 SQL injections | 45 min | Same pattern as Login_model fixes |
| 🟡 P1-1 | Remove CORS `*` wildcard | 5 min | Prevents cross-origin API abuse |
| 🟡 P1-2 | Remove debug output (V-B013) | 5 min | Prevents info disclosure |
| 🟡 P2-1 | Fix self-referencing model load | 2 min | Prevents memory issues |

**Total estimated effort: ~2 hours**

---

## 6. Database Tables Touched

| Table | Operations | Module |
|---|---|---|
| `dt_com_master` | SELECT | Commodity display |
| `dt_com_group_com` | SELECT | Commodity groups |
| `dt_customergroupitems` | SELECT | Customer group items |
| `dt_cus_commodity` | SELECT | Customer commodity config |
| `dt_prem_group_master` | SELECT | Premium group master |
| `dt_prem_group_com` | SELECT | Premium group commodities |
| `dt_rpanelcommodities` | SELECT | Rate panel commodities |
| `dt_rpanelcontract` | SELECT | Rate panel contracts |
| `dt_contractmaster` | SELECT | Contract master |
| `dt_bankcontractmaster` | SELECT | Bank contract master |
| `dt_rpanelbank` | SELECT | Rate panel bank |
| `dt_r_panel` | SELECT | Rate panel settings |
| `dt_generalrpsettings` | SELECT | General rate panel settings |
| `dt_generalsettings` | SELECT | General settings (TDS, max qty, etc) |
| `dt_marqueetext` | SELECT | Marquee text |
| `dt_admininfo` | SELECT | Admin info text |
| `dt_news` | SELECT | News/messages |
| `dt_advertisements` | SELECT | Advertisements |
| `dt_appevents` | SELECT | Mobile app events |
| `dt_appvideos` | SELECT | Mobile app videos |
| `dt_gallery` | SELECT | Gallery images |
| `dt_events` | SELECT | Calendar events |
| `dt_popup` | SELECT | Popup images |
| `dt_user_device` | SELECT, INSERT, UPDATE | Device registration |
| `dt_ratealert` | SELECT, INSERT, UPDATE | Rate alerts |
| `dt_historicaldata` | SELECT, INSERT, **TRUNCATE** | Historical rate data |
| `dt_historical_avg` | INSERT | Daily averages |
| `dt_booking` | (declared but not directly used in model!) | Booking records |
| `dt_customer` | SELECT | Customer data (via trade status) |
| `dt_quotation` | SELECT, INSERT | Quotation records |
| `dt_serv_master` | SELECT | Service master |
| `dt_sms_settings` | SELECT | SMS settings |
| `dt_smsappsettings` | SELECT | SMS app settings |
| `dt_country` | SELECT | Country codes |

---

*Booking Module Brain v1.0 — 43 methods, 14 vulnerabilities, 13 SQL injections mapped*
