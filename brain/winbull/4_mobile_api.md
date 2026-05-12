# Winbull Staging — Mobile API

## Framework
- CodeIgniter 3 + **REST_Controller** library (Phil Sturgeon's rest-server)
- All endpoints follow `_get()` / `_post()` suffix convention for auto-routing

## Controllers (`mobileapi/application/controllers/`)

### C_mobileclient.php — Client Auth & Profile
| Method | Type | Purpose |
|--------|------|---------|
| `CheckAppVersion_get()` | GET | App version check + force update |
| `user_login_post()` | POST | Mobile login |
| `terminate_usersession_post()` | POST | Force terminate existing session |
| `user_sessioncheck_post()` | POST | Session heartbeat |
| `user_registration_post()` | POST | Full registration flow |
| `validate_registration($data)` | Internal | Validate registration data |
| `validate_password($password)` | Internal | Password strength check |
| `resendotp_get()` | GET | Resend OTP |
| `user_registration_withotp_post()` | POST | Register with OTP verification |
| `forgotPassword_post()` | POST | Forgot password email/SMS |
| `changePassword_post()` | POST | Change password |
| `logout_post()` | POST | Mobile logout |
| `MarqueNews_get()` | GET | Marquee + news combined |
| `userviewbylogin_get()` | GET | User profile by login name |
| `mobilenumbervalidation_get()` | GET | Phone number validation |
| `checkusername_get()` | GET | Username availability |
| `userdata_get()` | GET | Full user data |
| `mobilemessages_get()` | GET | Mobile messages/notifications |

### C_mobileclienttrade.php — Trading Operations
| Method | Type | Purpose |
|--------|------|---------|
| `gettradecommodities_get()` | GET | Get tradeable commodities |
| `bookingRequest_post()` | POST | Place booking order |
| `updatebookRequest_post()` | POST | Update existing booking |
| `notifyBooking_post()` | POST | Trigger booking notification |
| `trade_summery_get()` | GET | Trade summary/dashboard |
| `customerAllOpenorders_get()` | GET | All open orders |
| `customerOrderCancel_get()` | GET | Cancel order (misnamed - should be POST) |
| `booking_report_get()` | GET | Booking history report |
| `order_report_get()` | GET | Order history report |
| `pendingdelv_report_get()` | GET | Pending deliveries |
| `customer_transactions_get()` | GET | Transaction history |
| `tradable_status_get()` | GET | Trading status check |
| `changePassword_post()` | POST | Change password (duplicate!) |
| `check_currentuser_session_post()` | POST | Session validation |
| `updateProfile_post()` | POST | Update user profile |
| `userdeviceregister_post()` | POST | Register push device token |
| `MobileMessages_get()` | GET | Messages list |
| `getratealerttollarance_get()` | GET | Rate alert tolerance |
| `ratealertlist_post()` | POST | Rate alert list |
| `advertisements_get()` | GET | Advertisements |
| `ratealertRequest_post()` | POST | Create rate alert |
| `ratealertDelete_post()` | POST | Delete rate alert |
| `ratehistory_report_get()` | GET | Rate history |
| `dateratehistory_report_get()` | GET | Date-filtered rate history |
| `unfixreport_get()` | GET | Unfix report |
| `historical_report_get()` | GET | Historical report |
| `chart_data_post()` | POST | Chart/graph data |

### C_mobileadmintrade.php — Admin Mobile App
| Method | Type | Purpose |
|--------|------|---------|
| `CheckAppVersion_post()` | POST | Admin app version check |
| `login_post()` | POST | Admin mobile login |
| `dologin_get()` | GET | Admin login (GET variant) |
| `dashboarddetails_get()` | GET | Admin dashboard data |
| `commodityGroupCommodityList_get()` | GET | Commodity group list |
| `updateCommodityGroupByComId_post()` | POST | Update commodity group |
| `updateLimitorder_post()` | POST | Update limit order |
| `updateTodayorder_post()` | POST | Update today's order |
| `confirmLimitorder_post()` | POST | Confirm limit order (LINE 297-720!) |
| `cancelLimitorder_post()` | POST | Cancel limit order |
| `menurights_get()` | GET | Admin menu rights |
| `rpanelContracts_get()` | GET | R-Panel contracts |
| `rpanelContractById_get()` | GET | Contract by ID |
| `updateRpanelContractById_post()` | POST | Update contract |
| `bankPremiumDetails_get()` | GET | Bank premium details |
| `updateBankPremium_post()` | POST | Update bank premium |
| `activeRpanelContracts_get()` | GET | Active contracts |
| `updateMarketStatus_post()` | POST | Market open/close |
| `updateTradeStatus_post()` | POST | Trade enable/disable |
| `customerList_get()` | GET | Customer listing |
| `customertradedetailByID_get()` | GET | Customer trade details |
| `updateRateDisplay_post()` | POST | Rate display settings |
| `updateHedgestat_post()` | POST | Hedge status update |
| `updateDashboardTimings_post()` | POST | Dashboard timings |
| `companyBranchList_get()` | GET | Branch listing |
| `outstandingList_get()` | GET | Outstanding positions |
| `dealRegisterList_get()` | GET | Deal register |
| `hedgeList_get()` | GET | Hedge list |
| `todaytradeList_get()` | GET | Today's trades |

### C_tradeapi.php — External Trade API
| Method | Type | Purpose |
|--------|------|---------|
| `gettodaytrade_get()` | GET | Today's trade data |
| `gettodaytradebydate_get()` | GET | Trade data by date range |

## Models (`mobileapi/application/models/`)
| Model | Size | Purpose |
|-------|------|---------|
| `M_mobileclient.php` | 22KB | Client auth, profile, OTP, registration |
| `M_mobiletrade.php` | 86KB | Trading operations, bookings, reports, rate alerts |
| `M_mobileadmintrade.php` | 91KB | Admin trade operations, commodity management |
| `M_tradeapi.php` | 4KB | External trade data queries |
| `Adminlog_model.php` | 5KB | Admin activity logging |

## Key Issues
- `customerOrderCancel_get()` — Uses GET for a destructive operation (should be POST/DELETE)
- `changePassword_post()` exists in both `C_mobileclient` and `C_mobileclienttrade` (duplicate)
- `dologin_get()` — Login via GET exposes credentials in URL
- `confirmLimitorder_post()` — 420+ lines long (god method)
