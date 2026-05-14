# Winbull Staging — Lumen Rate Engine

## Framework
- **Laravel Lumen 10** (`lmxtrade/winbullliteapi/`)
- Redis-backed queue + event system
- IP-whitelisted middleware for internal API calls

## Controllers

### WinbullliteController.php (93KB — MEGA CONTROLLER 🚨)
The core business logic engine. Handles rate calculations, alerts, client management.

#### Rate Management
| Method | Purpose |
|--------|---------|
| `getcurrentrates()` | Get current calculated rates |
| `createrates()` | Generate rates for all clients |
| `get_current_baserates()` | Fetch base rates from LightStreamer/API |
| `allclients_current_rates()` | All client rates |
| `client_current_rates(Request)` | Specific client rates |
| `updateratefeed()` | Update rate feed source |
| `checkrateupdatefeed()` | Validate rate feed health |
| `check_rate_update()` | Cron: check if rates are stale (weekdays only) |
| `check_rpaneldata(Request)` | Validate R-Panel configuration |

#### Rate Calculation Engine
| Method | Purpose |
|--------|---------|
| `calculate_client_commodities($commodities,$ccode)` | Calculate per-client commodity pricing |
| `calculate_mcx_rates($base,$commodity,$ccode)` | Apply MCX premiums, tax, spreads |
| `calculate_bank_rates($base,$commodity,$ccode)` | Apply bank premiums, forex, conversions |
| `calculate_manual_rates($base,$commodity)` | Manual/fixed rate calculation |
| `gold_spotrateconversion($value,$weight)` | Gold spot rate conversion |
| `gold_conversion($value,$weight)` | Gold weight conversion |
| `silver_conversion($value,$weight)` | Silver weight conversion |
| `manual_roundoff($value,$method,$type)` | Rate rounding logic |

#### Client Management
| Method | Purpose |
|--------|---------|
| `createclient(Request)` | Register new client in rate engine |
| `updateclienttradestatus(Request)` | Enable/disable client trading |
| `getallclients()` | List all registered clients |
| `reteriveclientrequest(Request)` | Get specific client data |
| `removeclient(Request)` | Remove client from engine |
| `clients_commodities()` | All client commodity configs |
| `clients_details()` | All client details |
| `show_client_trade_details(Request)` | Client trade details |
| `show_client_details(Request)` | Client details |

#### Rate Alerts
| Method | Purpose |
|--------|---------|
| `createratealert(Request)` | Create rate alert |
| `removeclientratealertrequest(Request)` | Remove client's rate alert |
| `updateratealert(Request)` | Update rate alert |
| `viewallclientsratesrequest()` | View all rate alerts |
| `removeratealertrequest(Request)` | Remove specific alert |
| `execute_ratealert()` | Execute triggered rate alerts |
| `remove_executed_ratealert($executed)` | Cleanup executed alerts |

#### High/Low & Up/Down Alerts
| Method | Purpose |
|--------|---------|
| `createclientupdownalerts()` | Create up/down alerts |
| `updateclientupdownalerts()` | Update up/down alerts |
| `executehighlowalerts()` | Execute high/low alerts |
| `execute_highlowalerts($client)` | Process per-client high/low |
| `execute_client_updown_alerts($alerts)` | Process up/down alerts |

#### Trade Control
| Method | Purpose |
|--------|---------|
| `executeratealerts()` | Master alert executor |
| `check_client_update_trade()` | Check client trade permissions |
| `getTradable()` | Get tradeable status |
| `update_client_executed_rates($rates)` | Update executed rate data |
| `update_client_executed_alerts($rates)` | Update executed alert data |

#### Misc
| Method | Purpose |
|--------|---------|
| `updateholiday(Request)` | Holiday calendar management |
| `holidaylist(Request)` | List holidays |
| `sendmail()` | Send email via Mailgun |
| `sendwhatsapp()` | Send WhatsApp message |

### BroadcastRatesController.php — Rate Broadcasting
| Method | Purpose |
|--------|---------|
| `getMergedRates()` | Merge base + premium rates |
| `updatesourcerates(Request)` | Receive MCX/bank source rates → write to TSV + encrypted file |
| `finalupdateclientrates(Request)` | Final rate update trigger |
| `finalupdateprice(Request)` | Process & write final rates to disk |
| `updateclientrates(Request)` | Update client-specific rates |

### WINBULLSTAGINGController.php — Socket Event Bridge
| Method | Purpose |
|--------|---------|
| `updatecommoditygroup(Request)` | Trigger commodity group socket event |
| `updaterpanel(Request)` | Trigger R-Panel update socket event |
| `updatenews(Request)` | Trigger news socket event |
| `updatemarquee(Request)` | Trigger marquee socket event |
| `updatelimit(Request)` | Trigger limit order socket event |
| `updatebook(Request)` | Trigger booking socket event |
| `updateusertermination(Request)` | Trigger user termination socket event |

### ApisourceController.php — External API
| Method | Purpose |
|--------|---------|
| `getcurrentrates()` | Get rates for external consumers |
| `updateeconomicapi()` | Update economic data from external API |

## Events (`app/Events/`)
| Event | Trigger |
|-------|---------|
| `MCXRateUpdates` | MCX rate data received |
| `WINBULLSTAGINGBookUpdates` | Booking created/updated |
| `WINBULLSTAGINGCommodityUpdates` | Commodity config changed |
| `WINBULLSTAGINGLimitUpdates` | Limit order triggered |
| `WINBULLSTAGINGMarqueeUpdates` | Marquee text changed |
| `WINBULLSTAGINGNewsUpdates` | News published |
| `WINBULLSTAGINGRpanelUpdates` | R-Panel config changed |
| `WINBULLSTAGINGUserUpdates` | User status changed |
| `WLTradeStatusUpdate` | Trade status toggled |

## Jobs (`app/Jobs/`)
| Job | Purpose |
|-----|---------|
| `UpdateBaseRatesJob` | Background rate fetch from source |
| `RateExecutedJob` | Process executed rate data |
| `RateAlertExecutedJob` | Process executed rate alerts → notify |
| `HighLowExecuteJob` | Process high/low alert execution |
| `OrderStatusUpdatedJob` | Order status change handler |
| `TradingStatusUpdateJob` | Trade status update handler |
| `SMSJobWC` | WhatsApp/SMS job (1.8KB — contains API integration) |

---

## Rate Calculation Formulas

### MCX Rate Calculation
```php
// calculate_mcx_rates($base, $commodity, $client_code)
$final_rate = $base_mcx_rate 
    + $mcx_premium           // MCX exchange premium
    + $gst_on_premium        // 18% GST on premium
    + $brokerage_charge      // Brokerage per lot
    + $conversion_spread;    // Conversion spread
```

### Bank Rate Calculation
```php
// calculate_bank_rates($base, $commodity, $client_code)
$final_rate = $bank_base_rate
    + $forex_markup          // USD/INR conversion markup
    + $bank_premium          // Bank-specific premium
    + $processing_fee        // Processing fee
    + $gst_on_fees;          // GST on all fees
```

### Manual Rate (Fixed)
```php
// calculate_manual_rates($base, $commodity)
$final_rate = $manual_base_rate  // Admin-set fixed rate
    + $fixed_premium;           // Admin-set premium
```

### Weight Conversion
```php
// gold_conversion($value, $weight)
$grams = $weight * 10;           // Tola to grams
$spot_value = $spot_rate * $grams;
$final_value = $spot_value + $making_charge;
```

---

## Key Issues
- **93KB single controller** — `WinbullliteController.php` is a god class
- Rate calculation logic (MCX, bank, manual) is deeply intertwined and hard to test
- No unit tests for rate calculation accuracy
- Multiple rate alert systems (ratealert + highlow + updown) with overlapping logic
