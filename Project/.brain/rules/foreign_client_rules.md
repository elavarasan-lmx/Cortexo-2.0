# 🌍 Foreign Client Rules — WinBull Trade

> Common rules for ALL non-Indian clients (Malaysia, UAE, Singapore, etc.)
> Same codebase, different `global_configs.php` — this doc covers WHAT changes.
> Last Updated: 2026-05-03

---

## 🔑 Core Difference: Indian vs Foreign

| Area | 🇮🇳 Indian Client | 🌍 Foreign Client |
|------|-------------------|-------------------|
| **Currency** | INR (₹) | MYR, AED, SGD, USD, etc. |
| **Timezone** | `Asia/Kolkata` (fixed) | Varies: `Asia/Kuala_Lumpur`, `Asia/Dubai`, etc. |
| **Tax** | GST 3% gold / 5% silver + TCS/TDS | Local tax rules (Malaysia SST, UAE VAT, etc.) |
| **KYC Documents** | Aadhaar + PAN (mandatory) | Passport / MyKad / IC Number / Emirates ID |
| **Hedge (Motilal)** | ✅ Available (MCX) | ❌ Not applicable |
| **Rate Feed** | MCX India (Lightstreamer) | International spot / LBMA / local exchange |
| **Weight Units** | Grams, KG, Tola | Grams, KG, Troy Oz |
| **SMS Provider** | Indian gateway (MSG91, etc.) | International gateway |
| **WhatsApp** | Indian instance | International instance |
| **App Store** | India region | Country-specific region |
| **Bank Rate Source** | Indian banks | Local banks / LBMA |

---

## ⚙️ `global_configs.php` — What Changes Per Foreign Client

### MUST Change
| Config | Indian Example | Foreign Example | Notes |
|--------|---------------|-----------------|-------|
| `$timezone` | `Asia/Kolkata` | `Asia/Kuala_Lumpur` | Affects all datetime operations |
| `$database` | `maharaj` | `kvt_malaysia` | Separate DB per client |
| `$web_base_url` | `maharajgoldsmith.com` | `kvtjewellers.com` | Client domain |
| `$socket_base_url` | `ws://maharaj.../ws` | `ws://kvt.../ws` | Socket channel |
| `$evt_*` prefix | `maharajupdate*` | `kvtupdate*` | Socket event names |
| `$client` | `maharaj` | `kvt` | Redis prefix + channel |

### MAY Change (Client-Specific)
| Config | Why |
|--------|-----|
| `$bcrateType` | Rate feed type (MCX vs international) |
| `$rateFeed` | Feed source identifier |
| `$onesignalauth` / `$app_id` | Push notification keys |
| `$whatsappurl` / `$instanceid` | WhatsApp API instance |
| `$smssenderid` | SMS gateway sender |
| Hedge configs (`$clientcode`, `$ApiKey`) | **SKIP for foreign** — no Motilal |

### NEVER Change (Same for All)
| Config | Why |
|--------|-----|
| `$key`, `$path` (encryption) | Encryption algo is universal |
| `$web_version` | Should match across clients |
| Socket event structure | Same protocol, different channel name |

---

## 💰 Tax Rules — Foreign Clients

### ❌ What Does NOT Apply
- **GST** (Indian Goods & Services Tax) — disabled or 0%
- **TCS** (Tax Collected at Source) — Indian-only
- **TDS** (Tax Deducted at Source) — Indian-only
- **HSN codes** — Indian tax classification

### ✅ What REPLACES Them
| Country | Tax | Rate | Notes |
|---------|-----|------|-------|
| 🇲🇾 Malaysia | SST (Sales & Service Tax) | 6-10% | Check with client |
| 🇦🇪 UAE | VAT | 5% | Standard rate |
| 🇸🇬 Singapore | GST (different from India!) | 9% | Singapore GST ≠ Indian GST |
| 🇧🇭 Bahrain | VAT | 10% | Introduced 2019 |
| 🇴🇲 Oman | VAT | 5% | |
| Others | Check locally | Varies | Always confirm before setup |

### ⚠️ Code Impact
```
Files that calculate tax:
├── trading_helper.php → insert_record() — tax calculation
├── C_booking.php → booking save — tax fields
├── booking.js → client-side tax display
├── C_customerdelivery.php → delivery invoice tax
└── Mobile API → tax in booking response

RULE: Tax % comes from `dt_com_master.com_tax` per commodity.
       Foreign client → set com_tax to their local rate (e.g., 6 for Malaysia SST).
       TCS/TDS fields → set to 0 or NULL.
```

---

## 📐 Rate Feed — Foreign Clients

### Indian Client Rate Flow
```
MCX (India) → Lightstreamer → Lumen → Redis → Socket.IO → Display
```

### Foreign Client Rate Flow Options
```
Option A: International Spot (LBMA/Kitco)
  LBMA/Spot Feed → API → Lumen → Redis → Socket.IO → Display

Option B: Manual Bank Rate
  Admin enters rate manually → DB → Socket.IO → Display

Option C: Hybrid
  International spot for live display + Manual for booking rate
```

### ⚠️ Key Differences
| Feature | Indian | Foreign |
|---------|--------|---------|
| Rate source | MCX contract (futures) | Spot price / LBMA |
| Contract symbol | `GOLD`, `GOLDM`, `SILVER` | Varies by feed |
| Rate unit | Rs/10g (gold), Rs/KG (silver) | USD/oz, USD/KG, local/g |
| Conversion needed | MCX → display unit | Spot USD → local currency → display unit |
| Exchange rate | N/A | USD→MYR, USD→AED etc. (live or fixed) |

### Bank Rate Formula — Foreign Adjustments
```
Indian 8-step:
  Step 1: (CONTRACT_ASK + Premium) × (SPOT-INR_ASK + RupeePremium)

Foreign adaptation:
  Step 1: (SPOT_USD_ASK + Premium) × (USD-LOCAL_RATE)
  
  Where USD-LOCAL_RATE = live forex or admin-set exchange rate
  Stored in: dt_clients.exchange_rate OR dt_bankcontractmaster
```

---

## 📋 KYC — Foreign Clients

### Indian KYC Fields
| Field | Document | Validation |
|-------|----------|------------|
| `cus_aadhar` | Aadhaar card | 12 digits |
| `cus_pan` | PAN card | ABCDE1234F format |
| `cus_gst` | GST number | 15 chars |

### Foreign KYC Fields (Reuse Same DB Columns)
| DB Column | Repurposed For | Validation |
|-----------|---------------|------------|
| `cus_aadhar` | Passport / IC Number | Alphanumeric, country-specific |
| `cus_pan` | Tax ID / MyKad / Emirates ID | Alphanumeric |
| `cus_gst` | Business registration (if applicable) | Optional |

### ⚠️ Validation Changes
```
Indian validation (General.js):
  - Aadhaar: exactly 12 digits, numeric only
  - PAN: regex /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

Foreign validation:
  - Passport: 6-12 alphanumeric
  - IC/MyKad: country-specific format
  - MUST be configurable per client, NOT hardcoded!
```

---

## 🔧 Setup Checklist — New Foreign Client

```
### Infrastructure
1. [ ] Clone global_configs.php → update ALL fields (see table above)
2. [ ] Create MySQL database (same schema, empty data)
3. [ ] Run seed data (commodities, admin user, settings)
4. [ ] Set correct timezone in global_configs.php
5. [ ] Configure Socket.IO channel with new $client prefix

### Tax & Financial
6. [ ] Set com_tax in dt_com_master to local tax rate
7. [ ] Set TCS/TDS to 0 or disable in settings
8. [ ] Configure currency display (symbol, format, decimals)
9. [ ] Disable Motilal hedge configs (set empty or skip)

### Rate Feed
10. [ ] Choose rate source: international spot / manual / hybrid
11. [ ] Configure exchange rate (live API or admin-set)
12. [ ] Set rate conversion formula for local currency
13. [ ] Test rate display on R-Panel

### KYC & Validation
14. [ ] Update KYC field labels (Aadhaar → Passport, PAN → Tax ID)
15. [ ] Update validation rules for local document formats
16. [ ] Test registration flow with local documents

### Communications
17. [ ] Configure international SMS gateway
18. [ ] Configure WhatsApp international instance
19. [ ] Setup OneSignal for app region
20. [ ] Test notifications (SMS, push, WhatsApp)

### Go-Live
21. [ ] Configure domain + SSL
22. [ ] Build mobile app with new config
23. [ ] Full smoke test: login → booking → rate → delivery
24. [ ] Add client to 01_project.md registry
```

---

## ⚠️ Common Pitfalls — Foreign Clients

| Pitfall | What Goes Wrong | Prevention |
|---------|----------------|------------|
| Timezone mismatch | Orders show wrong datetime | Check `$timezone` in global_configs AND PHP `date_default_timezone_set()` |
| Indian tax applied | GST/TCS charged incorrectly | Verify `com_tax` in `dt_com_master`, TCS in settings |
| Aadhaar validation blocks | Passport rejected as "invalid" | Update `General.js` validation for foreign doc types |
| MCX rate feed | Wrong rate source connected | Verify `$bcrateType` and rate feed config |
| INR currency symbol | ₹ shown instead of RM/AED | Check currency display in views + JS |
| Motilal hedge API calls | API errors for non-Indian client | Disable hedge in settings, skip Motilal config |
| SMS fails | Indian gateway can't send international | Use international SMS provider |
| Wrong weight conversion | Tola used instead of Troy Oz | Check `com_weight` and unit settings |
