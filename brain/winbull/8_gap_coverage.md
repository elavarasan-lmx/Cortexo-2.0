# Winbull Staging — Gap Coverage: Limit Orders, Hedging, Margin, Unfix

## 1. LIMIT ORDER ENGINE (Complete Flow)

### How Limit Orders Work (End-to-End)

```
Customer places booking with ordertype=1 (limit order) via mobile
  → Stored in dt_booking with orderstatus=0 (pending)
  → Lumen createratealert() stores in Redis: WLratealertclients_winbullstaging
  → Every rate tick: execute_ratealert() fires
    → Checks each pending alert's book_rate vs current rate
    → If condition met → dispatch RateExecutedJob (updates CI DB via curl)
    → Admin mobile app confirmLimitorder_post() used to manually confirm too
```

### Rate Match Conditions in `execute_ratealert()` (Lumen)

| book_type | alert_type | Trigger Condition | Action |
|-----------|-----------|-------------------|--------|
| `0` (Sell) | `0` (Limit Order) | `book_rate >= selling_rate` | Execute limit order → `RateExecutedJob` |
| `0` (Sell) | `1` (Alert) | `book_rate >= selling_rate` | Send alert notification → `RateAlertExecutedJob` |
| `0` (Sell) | `2` (Stop Loss) | `book_rate <= selling_rate` | Execute stop loss → `RateExecutedJob` |
| `2` (Retail Sell) | `0` | `book_rate >= retail_rate` | Execute order |
| `1` (Buy) | `0` | `book_rate <= buying_rate` | Execute buy order |
| `1` (Buy) | `2` (Stop Loss) | `book_rate >= buying_rate` | Execute stop loss |

### Redis Keys Used
| Key | Purpose |
|-----|---------|
| `WLratealertclients_winbullstaging` | Active limit orders/rate alerts JSON array |
| `WLclientsrates_winbullstaging` | Current rates per client per commodity |
| `WLclienttradestatus-{client}` | Trade status, on/off times, limit expiry config |
| `WLupdown-{client}` | Last gold/silver price for up/down alerts |
| `WLHolidays` | Holiday list (JSON array of "dd-mm-yyyy" strings) |
| `WLBaseRatesUpdated_winbullstaging` | Timestamp of last rate update |
| `WLMCXUpdatetime` | MCX update timestamp |

### Limit Order Auto-Expiry (check_client_update_trade)
```
If clienttradingstatus_details['limit_expire'] == 1
  AND current time == limit_expire_time
  → Remove all pending alerts for that client from Redis
  → Dispatch OrderStatusUpdatedJob (mark expired in DB)
```

### Lumen Missing Routes Found
```
POST /api/v1/wlcreatelimitorder → WinbullliteController@createlimitorder
POST /api/v1/wlupdatelimitorder → WinbullliteController@updatelimitorder
```
⚠️ These routes exist in `web.php` but `createlimitorder()` and `updatelimitorder()` are NOT visible in the grep scan of WinbullliteController.php — they may be private or inherited. Used to push limit orders from CI → Lumen Redis.

### confirmLimitorder_post() — Full Logic (Lines 297–720)
This is the admin mobile confirmation of a limit order. Steps:
1. Fetch order details from `dt_booking` via `get_orderdetails(book_no)`
2. Calculate `totalcost = (book_rate / book_comweight) * booked_qty * 1000`
3. **Margin Check**: If `display_margin == 1`, validate `available_balance >= margin_hold`
   - `margin_hold = totalcost * com_margin_value / 100` (if type=percentage)
   - `margin_hold = booked_qty * com_margin_value` (if type=per-unit)
4. **DB Update**: `UPDATE dt_booking set book_status=1, orderstatus=1 WHERE book_no AND ordertype=1 AND orderstatus=0`
5. **MT5 Hedge** (if `is_hedge=1` and `confirmation_for=1`) — commented out, uses `dt_generalsettings`
6. **Remove from Redis**: cURL to `cancelratealert` Lumen endpoint
7. **Margin Deduction**: Insert into `dt_transaction` with `trans_payment_type=1`
8. **Margin Reversal** (if `margin_reverse_type=0`): 
   - Find opposite-type bookings with remaining margin
   - Calculate and reverse proportional margin
   - Insert `dt_transaction` with `trans_payment_type=2`
9. **Notifications**: Email + WhatsApp + OneSignal push to admin
10. **Socket Update**: cURL to `bookupdate` Lumen endpoint

### cancelLimitorder_post() Logic (Lines 721–776)
1. `UPDATE dt_booking set orderstatus=3 WHERE book_no AND orderstatus=0 AND ordertype=1`
2. Call `notifyBooking()` — sends cancel notification
3. cURL to remove from Redis (cancelratealert endpoint)
4. cURL to limitupdate Lumen endpoint

---

## 2. HEDGE INTEGRATIONS

### MT5 (MetaTrader 5) — `Mt5_model.php` (STATUS: PARTIALLY DISABLED)
- **Purpose**: Auto-hedge customer bookings on MT5 broker platform
- **Status**: `autoHedge()` function is entirely commented out
- **Active part**: `execute()` sends a cURL GET to `$hedge_url` (URL from `dt_generalsettings`)
- `updateautoheadgedata($response)` — processes MT5 JSON response (expects array of 11 elements)
  - Inserts into `dt_mt5_hedgedata`: dealid, orderid, volume, price, bid, ask, symbol
  - If MT5 response has wrong format → auto-disables hedge (`UPDATE dt_generalsettings set is_hedge=0`)
  - Sends WhatsApp alerts to admin on failure
- **Log file**: `logs/mt5hedge_log` (written every request)

### Motilal Oswal Angel One — `Motilal_model.php` (STATUS: PRODUCTION READY)
- **Purpose**: Auto-hedge via Angel One (Motilal Oswal) broker API
- **Integration**: Angel One SmartAPI
- **Auth**: Google Authenticator TOTP (`GoogleAuthenticator.php` library) + `Globals::$secret_key`
- **Credentials** (from global_configs): `$clientcode`, `$hedge_password`, `$twoFA`, `$ApiKey`, `$authapi`, `$placeorder`

#### `login_motilal_oswal()` Flow
```
1. Generate TOTP via GoogleAuthenticator
2. POST to $authapi with userid, password, 2FA, totp
3. Get AuthToken from response
4. Calculate lots: calculate_gold_lots(booked_qty * 1000)
   - >= 100g → Gold Mega lots (100g each)
   - < 100g  → Gold Mini lots (10g each, min 6g)
5. place_order() for Mega lots and Mini lots separately
```

#### `place_order()` Flow
```
POST to $placeorder (Angel One order API):
  - exchange: MCX
  - ordertype: MARKET
  - producttype: NORMAL  
  - orderduration: DAY
  - buyorsell: BUY or SELL
  - quantityinlot: calculated lots

On success → dt_hedge_log insert + dt_booking.book_ishedge = 1
On failure → log error
```

#### 🚨 SECURITY BUG in Motilal_model.php
- Hardcoded MAC address: `7A-14-01-88-B0-B1`
- Hardcoded IP: `82.60.76.112` in API headers
- These are sent to Angel One API — if IP changes, hedge will fail silently

---

## 3. MARGIN MANAGEMENT

### Controller: `C_marginmanagement.php`
**EXISTS** — not orphaned.

| Method | Purpose |
|--------|---------|
| `open_listingform($cus_type)` | Customer margin listing |
| `open_entryform(...)` | Margin deposit/withdrawal entry form |
| `open_activateentryform(...)` | Activate customer margin account |
| `DB_Controller(...)` | Insert/update/delete margin transactions |
| `get_availablebalance($cus_id)` | Get available margin balance for customer |

### Margin Model (`Marginmanagement_model.php`)
| Method | Purpose |
|--------|---------|
| `get_data($params)` | Margin listing with filters |
| `load_customer($id)` | Load customer margin details |
| `empty_record()` | New margin entry template |
| `get_entry_record($id)` | Get margin entry by ID |
| `delete_record($id)` | Delete margin entry |
| `insert_record($id)` | Insert new margin transaction |
| `update_record($id)` | Update margin record |
| `get_availablebalance($cus_id)` | Available balance query |

### Margin Transaction Table (`dt_transaction`)
| Column | Purpose |
|--------|---------|
| `trans_cuscode` | Customer ID |
| `trans_date` | Transaction date |
| `trans_code` | Booking number |
| `trans_payment_type` | `1`=Deduct, `2`=Reverse-on-booking, `3`=Reverse-on-delivery |
| `trans_amount` | Amount in ₹ |
| `trans_actype` | `1`=Debit, `0`=Credit |
| `trans_margin_qty` | Quantity in the transaction |
| `trans_book_type` | `0`=Sell, `1`=Buy |
| `trans_comtype` | `0`=Gold, `1`=Silver |

---

## 4. UNFIX / ADMIN UNFIX FLOW

### Controller: `C_admin_unfix.php` (EXISTS)
| Method | Purpose |
|--------|---------|
| `open_listingform(...)` | Listing of unfix eligible bookings |
| `open_entryform(...)` | Unfix entry form |
| `DB_Controller(...)` | Unfix CRUD operations |
| `open_listingform_unfix()` | Unfix-specific listing |
| `open_listingcus_form()` | Customer listing for unfix |
| `cus_unfix_payment($id)` | Process unfix payment |
| `close_btn1()` | Step 1 close (partial unfix) |
| `close_btn2()` | Step 2 close (full delivery) |

### Unfix Model (`Unfix_model.php`)
| Method | Purpose |
|--------|---------|
| `get_data($id)` | Get unfixed booking data |
| `empty_record()` | New unfix record template |
| `get_entry_record($id)` | Get specific unfix entry |
| `delete_record($id)` | Delete unfix record |
| `delete_sub_record(...)` | Delete unfix sub-record |
| `update_record($id,$post)` | Update unfix |
| `getcustomerall_data()` | All customers |
| `getcustomer_data($id)` | Specific customer |
| `save_entry_record($post)` | Save new unfix |
| `get_customer_bookingdata($id)` | Customer's bookings for unfix |
| `close_btn1($id)` | Mark as partially unfixed |
| `close_btn2($id)` | Mark as fully delivered |
| `insert_record($id)` | Insert unfix record |
| `updateLog(...)` | Log unfix changes |

### Business Flow
```
Admin identifies fixable booking → opens unfix entry form
  → close_btn1: partial unfix (fix type toggle)
  → close_btn2: full delivery (booking closed)
  → Each action logs via updateLog() for audit trail
```

---

## 5. PURCHASE / INVENTORY MODEL (`Purchase_model.php` — 32KB)
**No corresponding admin controller found** — functions called from `C_customerDelivery`.

| Method | Purpose |
|--------|---------|
| `get_data(...)` | Purchase listing with type/date filters |
| `empty_record()` | New purchase template |
| `get_entry_record($id)` | Purchase entry by ID |
| `load_qty()` | Calculate quantity |
| `get_coverupReport($type)` | Cover-up/cover purchase report |
| `close_hedging()` | Close an open hedge position |
| `get_hedging_data($com_type)` | Get hedging positions |
| `delete_hedging_data($id)` | Delete hedge entry |
| `insert_record($id)` | Insert purchase |
| `update_record($id)` | Update purchase |

---

## 6. KEY BUGS FOUND IN GAP COVERAGE

### Bug 26: sendwhatsapp() uses wrong variable
```php
// WinbullliteController.php line 1923
curl_close($ch); // ← $ch is never defined! Should be $curl
```
**Impact**: Rate failure WhatsApp alerts silently fail, PHP notice thrown on production.

### Bug 27: iOS version check uses Android platform code
```php
// C_mobileadmintrade.php line 81
}else if($data['platform'] == 1){ //IOS ← should be platform == 2
```
**Impact**: iOS version check NEVER executes — iOS app update force will never trigger.

### Bug 28: Hardcoded IP in Motilal Hedge Headers
```php
'ClientLocalIp: 82.60.76.112',
'ClientPublicIp: 82.60.76.112',
```
**Impact**: Angel One API receives wrong IP — may cause hedge orders to fail validation.

### Bug 29: MT5 response parsing uses `sizeof == 11` fragile check
```php
if(sizeof($mt5response) == 11)
```
**Impact**: If MT5 API changes response format (even adds one field), auto-hedge silently disables itself.

### Bug 30: Margin reversal missing for margin_reverse_type != 0
In `confirmLimitorder_post()`, margin reversal logic only runs when `margin_reverse_type == 0`. If type is `1` or `2`, no reversal happens — potential margin leak.
