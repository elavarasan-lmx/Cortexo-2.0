# Winbull Staging — Admin Panel

## Controller Map (`admin/application/controllers/`)

### C_main.php — Admin Dashboard & Auth
| Method | Purpose |
|--------|---------|
| `index($error)` | Admin login page |
| `login_validation()` | Admin login POST |
| `logout()` | Admin logout |
| `load_mainpage()` | Dashboard view |
| `get_datagraph()` | Dashboard chart data |
| `load_data()` | Dashboard summary data |
| `bookings_request()` | Pending bookings count |
| `delivered_bookings()` | Delivered bookings count |
| `cus_data()` | Customer summary |
| `pending_request()` | Pending orders count |
| `pendingorder_list()` | Pending order listing |
| `pending_delivery()` | Pending delivery list |
| `load_terminatesession()` | Session termination page |
| `terminate_usersession()` | Force terminate user session |
| `enable_trade($status,$clear)` | Enable/disable trading globally |
| `get_graphdata()` | Historical graph data |
| `get_booking_trends()` | Booking trend analytics |

### C_customerDelivery.php — Trade & Delivery Management (GOD CONTROLLER 🚨)
**Lines: 868+ | Most complex admin controller**
| Method | Purpose |
|--------|---------|
| `open_listingform()` | Delivery listing |
| `open_customerbalancelisting()` | Customer balance view |
| `grid_dataload(...)` | Grid data with date/commodity/type filters |
| `deliverygrid_dataload($model,$id)` | Delivery grid for specific customer |
| `open_delivery_entryform(...)` | Delivery entry form |
| `open_delivery_viewform(...)` | View delivery detail |
| `close_record(...)` | Close a trade record |
| `print_record($type,...)` | Print trade/delivery receipt |
| `DB_Controller(...)` | Master CRUD handler (insert/update/delete) |
| `listing($type)` | Report listing page |
| `coverup_record(...)` | Cover-up trade (hedging) |
| `customerdetailmargin_report(...)` | Margin detail report |
| `unfix_booking_report(...)` | Unfixed booking report |
| `outstanding_report()` | Outstanding positions |
| `todays_trade(...)` | Today's trade filter |
| `tradingStatus_dataload(...)` | Trading status grid |
| `customerdelivery_dataload(...)` | Delivery data grid |
| `update_invoiceno()` | Update invoice number |
| `delete_booking(...)` | Delete a booking record |
| `revert_delivery(...)` | Revert a delivery |
| `deal_transfer()` | Transfer deal between customers |
| `delete_selectedRecords()` | Bulk delete records |
| `save_booknarration($type)` | Save booking narration/notes |
| `save_manualhedge($type)` | Manual hedge entry |
| `mt5_hedge(...)` | MT5 hedge data |
| `delete_mt5hedge(...)` | Delete MT5 hedge |
| `todayinline_update()` | Inline edit today's trade |
| `deliveryinline_update()` | Inline edit delivery |
| `updatefix_unfix()` | Toggle fix/unfix status |
| `avg_rate_update()` | Update average rate |
| `inactive_user(...)` | Inactive user listing |
| `auto_inactive_nonbooking()` | Auto-inactivate non-booking users |

### C_userregistration.php — Customer Management
| Method | Purpose |
|--------|---------|
| `open_listingform($cus_type)` | Customer listing (filtered by type) |
| `open_entryform(...)` | Customer add/edit form |
| `open_activateentryform(...)` | Activate customer form |
| `delete_multiple_customer(...)` | Bulk delete |
| `activateMultipleCustomers()` | Bulk activate |
| `disableMultipleCustomers()` | Bulk disable |
| `DB_Controller(...)` | Master CRUD |
| `send_notifications(...)` | Send activation notifications |
| `customer_confirmation(...)` | Confirm customer account |
| `validateUserName()` | AJAX username validation |
| `check_email()` | AJAX email validation |
| `check_phoneno()` | AJAX phone validation |
| `get_number()` / `get_pan()` / `get_gst()` | Field-level AJAX checks |
| `check_customer_limits()` | Customer limit validation |

### C_commodity.php — Commodity Master Management
| Method | Purpose |
|--------|---------|
| `open_entryform(...)` | Commodity add/edit |
| `DB_Controller(...)` | Commodity CRUD |
| `getrpanelcommodities()` | Get R-Panel commodities |
| `inline_update()` | Inline grid edit |
| `update_weight()` | Weight update |
| `validateCommodityInput(...)` | Input validation (private) |
| `logCommodityOperation(...)` | Audit logging (private) |
| `check_duplicate()` | Duplicate check |
| `get_comName()` | Get commodity name |
| `get_orderNo()` | Get order sequence |
| `check_commodity_limits()` | Commodity limits |

### C_rpanelcommodity.php — R-Panel Rate Source Config
| Method | Purpose |
|--------|---------|
| `open_listingform(...)` | R-Panel commodity listing |
| `open_entryform(...)` | R-Panel add/edit |
| `DB_Controller(...)` | R-Panel commodity CRUD |
| `inline_update()` | Inline edit |

### C_rpanelbank.php — Bank Rate Source Config
| Method | Purpose |
|--------|---------|
| `open_listingform(...)` | Bank listing |
| `open_entryform(...)` | Bank add/edit |
| `DB_Controller(...)` | Bank CRUD |
| `Chk_Name_Exist()` | Name uniqueness check |
| `Chk_Seq_Exist()` | Sequence uniqueness check |

### C_contract_master.php — Contract/Symbol Expiry
| Method | Purpose |
|--------|---------|
| `open_entryform(...)` | Contract add/edit |
| `get_rpanel_data()` | Get R-Panel data |
| `enable_rpanelrateon/off($status)` | Toggle rate source |
| `DB_Controller(...)` | Contract CRUD |

### C_contractsymbol.php — Contract Symbol Mapping
| Method | Purpose |
|--------|---------|
| `open_listingform(...)` | Symbol listing |
| `open_entryform(...)` | Symbol add/edit |
| `DB_Controller(...)` | Symbol CRUD |
| `check_duplicate()` | Duplicate check |

### C_phonebooking.php — Admin Phone Booking
| Method | Purpose |
|--------|---------|
| `getcommodities()` | Get tradeable commodities |
| `get_commodity_data()` | Commodity detail |
| `booking_request()` | Place booking on behalf of customer |
| `notifyBooking()` | Send booking notification |
| `get_tradingstatus()` | Trading status check |
| `get_tolerance()` | Tolerance value |

### C_prem_group.php — Premium Group Management
| Method | Purpose |
|--------|---------|
| `open_listingform(...)` | Premium group listing |
| `send_premium_notification(...)` | Send premium change notification |
| `open_entryform(...)` | Premium group add/edit |
| `DB_Controller(...)` | Premium CRUD |
| `check_prem_limits()` | Premium limit validation |

### Settings Controllers (CRUD Pattern)
| Controller | Domain |
|-----------|--------|
| `C_generalsettings.php` | General settings (single form, view: `admingeneral_entry.php`) |
| `C_email_settings.php` | Email configuration |
| `C_sms_settings.php` | SMS provider settings |
| `C_sms_api.php` | SMS API configuration |
| `C_whatsapp_settings.php` | WhatsApp integration |
| `C_whatsappmeta_settings.php` | WhatsApp Meta API settings |
| `C_rpanel_settings.php` | Rate panel settings |
| `C_maintenance_settings.php` | Maintenance mode settings |
| `C_logo_settings.php` | Logo/branding (upload handlers) |
| `C_serv_master.php` | Service master settings |
| `C_serv_group.php` | Service group management |

### General Settings — Field Map (`admingeneral_entry.php` → `dt_generalsettings`)

#### Section: Quantity Limits
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Gold Min Qty / Book | `gold_min_qty` (enabled by `has_gminqty`) | Min grams per gold booking |
| Gold Max Qty / Book | `gold_max_qty` (enabled by `has_gmaxqty`) | Max grams per gold booking |
| Silver Min Qty / Book | `silver_min_qty` (enabled by `has_sminqty`) | Min grams per silver booking |
| Silver Max Qty / Book | `silver_max_qty` (enabled by `has_smaxqty`) | Max grams per silver booking |
| Gold Max Alloted Qty | `gold_allot_qty` (enabled by `has_gallot_qty`) | Total gold stock allotment ceiling |
| Silver Max Alloted Qty | `silver_allot_qty` (enabled by `has_sallot_qty`) | Total silver stock allotment ceiling |
| Max. allowed limit orders | `max_order` | Max active limit orders per user |

#### Section: Schedule (shown only when `lite_trade == 1`)
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Limit Cancellation | `limit_cancellation` | `0`=Manual, `1`=Auto cancel limit orders |
| Time | `limitcancel_time` | Time to auto-cancel limits |
| Trade On | `trade_on` | `0`=Manual, `1`=Auto enable trading |
| Trade On Time | `trade_on_time` | Auto trade start time |
| Trade Off | `trade_off` | `0`=Manual, `1`=Auto disable trading |
| Trade Off Time | `trade_off_time` | Auto trade stop time |

#### Section: Market Schedule
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Market On | `market_on` | `0`=Manual, `1`=Auto market open |
| Market On Time | `market_on_time` | Auto market open time |
| Market Off | `market_off` | `0`=Manual, `1`=Auto market close |
| Market Off Time | `market_off_time` | Auto market close time |

#### Section: Margin
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Enable Margin | `display_margin` | `1`=Yes, `0`=No — enables margin system |
| Margin squareoff | `margin_reverse_type` | `0`=Yes squareoff, `1`=No |

#### Section: Display
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Display trade history (days) | `expire_history` + `days_expire` | How many days of trade history to show users |
| Auto Refresh | `auto_refresh` | Page refresh interval in minutes |
| Display Limit order Page | `limit_enable` | `1`=Yes, `0`=No — show limit order page |
| Display Client Limit | `clientlimit_enable` | `1`=Yes, `0`=No — show client limit page |

#### Section: Tax
| Field | DB Column | Purpose |
|-------|-----------|---------|
| TCS/TDS Hint | `admin_tcstdshint` | Help text shown on TCS/TDS calculator page |

#### Section: Stock
| Field | DB Column | Purpose |
|-------|-----------|---------|
| **Stock Manage** | `admin_stockmanage` | Minimum stock threshold quantity. ⚠️ Field is stored but NOT enforced in booking logic in current build — dead field risk |

#### Section: Booking Alerts (admin notification mobiles)
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Mobile 1–5 | `admin_mob1`–`admin_mob5` + `is_admin_mob1`–`5` | Admin mobile numbers for booking SMS/WhatsApp alerts |
| Enquiry mail to | `admin_mail` | Email address for enquiry notifications |

#### Section: MJDTA Difference
| Field | DB Column | Purpose |
|-------|-----------|---------|
| MJDTA Gold Difference | `mjdta_gold_diff` | Gold rate adjustment vs MJDTA source |
| MJDTA Silver Difference | `mjdta_silver_diff` | Silver rate adjustment vs MJDTA source |

#### Section: Tolerance (in %)
| Field | DB Column | Purpose |
|-------|-----------|---------|
| High (Gold) | `tol_gold_high` | Max % deviation allowed for gold orders |
| Low (Gold) | `tol_gold_low` | Min % deviation allowed for gold orders |
| High (Silver) | `tol_silver_high` | Max % deviation allowed for silver orders |
| Low (Silver) | `tol_silver_low` | Min % deviation allowed for silver orders |
| Order cancellation limit Gold | `limitcancel_goldtol` | Max ₹ diff before gold limit auto-cancelled |
| Order cancellation limit Silver | `limitcancel_silvertol` | Max ₹ diff before silver limit auto-cancelled |

#### Section: Hedging (shown only when `lite_trade == 1`)
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Enable Gold Hedge | `is_hedge_gold` | `1`=Yes — enables gold MCX hedging |
| Enable Silver Hedge | `is_hedge_silver` | `1`=Yes — enables silver MCX hedging |
| Gold Hedge Min Lot | `gold_hedge_lot_qty` | Minimum lot size in grams to trigger hedge |
| Silver Hedge Min Lot | `silver_hedge_lot_qty` | Minimum lot size in grams to trigger hedge |
| Gold Hedge Adjusted Qty | `gold_booking_adjusted_qty` | Rounding unit for gold hedge (e.g. 53g→50g) |
| Silver Hedge Adjusted Qty | `silver_booking_adjusted_qty` | Rounding unit for silver hedge |

#### Section: Admin User Payment Alert (in `adminuser_entry.php` / `dt_admin_users`)
| Field | DB Column | Purpose |
|-------|-----------|---------|
| Payment Alert | `admin_showalert` | Checkbox — enables login-time payment reminder |
| Alert before (In days) | `admin_alertdays` | Start showing alert N days before validity expires |
| Alert message | `admin_alertmessage` | Message shown to admin at login |
| Validate till | `admin_validity_date` | Account expiry date |


### Content Management Controllers
| Controller | Domain |
|-----------|--------|
| `C_news.php` | News articles CRUD |
| `C_marquee.php` | Marquee text management |
| `C_popup.php` | Popup management |
| `C_gallery.php` | Image gallery + push notifications |
| `C_other_pages.php` | CMS pages (editor, slider, file manager) |
| `C_advertisement.php` | Advertisement management |

### Other Controllers
| Controller | Domain |
|-----------|--------|
| `C_customergroup.php` | Customer group management |
| `C_customerservice.php` | Customer service config |
| `C_customersms.php` | SMS notification composer |
| `C_product.php` | Product type management |
| `C_hedgemaster.php` | Hedge master data |
| `C_rate_history.php` | Rate history management |
| `C_ratealert_report.php` | Rate alert reports |
| `C_userevent.php` | User event management |
| `C_user.php` | Admin user management |

### Admin Controller Pattern (Consistent CRUD)
All admin controllers follow this pattern:
```
open_listingform()  → Display list with grid
open_entryform()    → Display add/edit form
DB_Controller()     → Handle insert/update/delete/activate
grid_dataload()     → Server-side grid data (where applicable)
```
