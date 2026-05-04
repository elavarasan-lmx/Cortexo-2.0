# 💰 Rate Formula — WinBull Trade

> Business-critical. NEVER auto-change without Jerry's approval.
> Source: Old `.agent/rate_formula.md` — paths updated to Linux
> Last Updated: 2026-05-03

---

## 📐 CORE CONVERSION FUNCTIONS

All calcs exist in BOTH admin (`r_panel.php`) and client (`common.js`, `booking.js`).

### gold_conversion(value)
```javascript
return (value / 10) × rpsg_weight    // MCX gold = Rs/10g → display weight
```

### gold_spotrateconversion(value)
```javascript
return (value / 1000) × rpsg_weight  // Spot/bank = per KG → display weight
```

### silver_conversion(value)
```javascript
return (value / 1000) × rpss_weight  // MCX silver = Rs/KG → display weight
```

### manual_roundoff(value, type, com_type)
```javascript
round_method = (com_type == 0) ? rpsg_roundoff : rpss_roundoff;
if (type == 'ask')  → Math.ceil(value / round_method) × round_method   // SELL = ceiling
if (type == 'bid')  → Math.floor(value / round_method) × round_method  // BUY = floor
```

### Settings (dt_generalrpsettings)
| Setting | Typical | Purpose |
|---------|---------|---------|
| `rpsg_weight` | 1.00 | Gold display weight multiplier |
| `rpss_weight` | 1000.00 | Silver display weight multiplier |
| `rpsg_roundoff` | 0.05 | Gold round-off step |
| `rpss_roundoff` | 0.05 | Silver round-off step |

---

## 🏦 SECTION 1: Bank Rate (8-Step Formula)

**Source**: `admin/application/views/r_panel.php`
**Tables**: `dt_bankcontractmaster`, `dt_rpanelbank`, `dt_contractmaster`

```
Step 1: base = (CONTRACT_ASK + Premium + AskDiff) × (SPOT-INR_ASK + RupeePremium)
Step 2: ± Conversion    (add/sub/mul/div based on bconvert_value_type)
Step 3: ± Extra Charges  (add/sub/mul/div based on bextra_type)
Step 4: + Custom          (flat add — customs duty)
Step 5: × Tax             (% or flat based on btax_type — GST)
Step 6: × TCS             (percentage)
Step 7: ÷ 0.995           (if Pure=Yes — 99.5% → 99.9% purity)
Step 8: 1KG Rate = result | 1Grm Rate = result ÷ 1000
```

### Worked Example
```
CONTRACT_ASK = 5013.38, Premium = 2.000, Conv = 32.1507 (multiply)
SPOT-INR = 92.48, RupeePremium = 0.050
Custom = 670,000, Tax = 3% (GST), TCS = 1%, Pure = Yes

Step 1: (5013.38 + 2.000) × (92.48 + 0.050)  = 464,073.11
Step 2: 464,073.11 × 32.1507                   = 14,920,275.34
Step 3: (no extra)                              = 14,920,275.34
Step 4: + 670,000                               = 15,590,275.34
Step 5: × 1.03 (GST)                           = 16,057,983.60
Step 6: × 1.01 (TCS)                           = 16,218,563.44
Step 7: ÷ 0.995 (purity)                       = 16,300,063.76

✅ 1KG Rate = 16,300,063.76  |  1Grm Rate = 16,300.06
```

---

## 📊 SECTION 2: R-Panel Commodity Rates (3 Modes)

**Source**: `admin/application/views/r_panel.php`
**Condition**: Only when `market_status == 0` (0 = OPEN!)

### Mode 0: Future (MCX-based)
```
Sell Rate = roundoff_ceil((gold_conv(MCX_ASK) + gold_conv(sell_diff)) / 0.995*)
Buy Rate  = roundoff_floor((gold_conv(MCX_BID) - gold_conv(buy_diff)) / 0.995*)
* only if callpurity = 1
Then: × (1 + GST%) if is_gst=1, × (1 + TCS%) if is_tcs=1
```

### Mode 1: Bank-based
```
Sell Rate = roundoff_ceil(spot_conv(BANK_KGRATE) + gold_conv(sell_diff))
Buy Rate  = roundoff_floor(spot_conv(BANK_KGRATE) - gold_conv(buy_diff))
(No purity/GST/TCS — already in bank rate)
```

### Mode 2: Manual
```
Sell Rate = gold_conv(admin_entered_sellrate)
Buy Rate  = Sell Rate - gold_conv(buy_diff)
```

---

## 🔢 SECTION 3: Customer Booking Rate

**Source**: `application/models/Booking_model.php`, `assets/js/custom/booking.js`

```
Customer Sell Rate = MCX Live + prem_sel_premium (from customer's premium group)
Customer Buy Rate  = MCX Live - prem_buy_premium

Total Cost      = Rate × Quantity × com_weight
Margin Required = Total × (com_margin_value / 100)   [margin_type=1]
                  OR com_margin_value per unit         [margin_type=0]
```

### Data Chain
```
dt_com_master → dt_com_group_com → dt_prem_group_com → dt_rpanelcommodities → dt_rpanelcontract
```

---

## ⚠️ KNOWN CRITICAL GAPS

| Gap | Risk |
|-----|------|
| Server does NOT re-validate rate on order submit — client rate is trusted | Rate manipulation |
| No transaction wrapping on margin update | Race condition |
| Lightstreamer creds hardcoded in Booking_model.php | Security |
| JS calc and PHP calc could drift — no automated parity check | Wrong rates |

---

## 📡 SECTION 4: Rate Delivery

| Type | Method | Status |
|------|--------|--------|
| 0 | HTTP Polling (1s interval) | Legacy |
| 1 | Encrypted HTTP | Deprecated |
| **2** | **WebSocket (Socket.IO)** | **Production** |

### WebSocket Data Format
```
Type 1: 1|G|bid|ask|high|low        (Spot: GOLD/SILVER/INR)
Type 2: 2|GOLDM|bid|ask|high|low    (MCX contract)
Type 4: 4|id|status|flag|field5     (Status/control)
```

### Lightstreamer Feed
- Adapter: `WLQUOTE_ADAPTER`
- Symbols: GOLD-C, GOLD-F, SILVER-C, SILVER-F, SPOT-GOLD, SPOT-SILVER, SPOT-INR
- Fields: desc, bid, ask, high, low, ltp
