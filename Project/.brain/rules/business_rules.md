# 💼 Business Rules — WinBull Trade

> **NEVER auto-change business rules without Jerry's approval**
> Source: Extracted from old `.agent/` brain + current `04_business_logic.md`
> Last Updated: 2026-05-03

---

## 🔴 FINANCIAL RULES

### BR-F001: Rate Calculation Formula
```
Customer Rate = MCX Live Rate ± Premium Amount
Premium Amount = defined in dt_prem_group_com for customer's premium group
Final Order Value = Customer Rate × Quantity × com_weight
Rates rounded to 2 decimal places
```
- Gold premium: typically additive (+)
- Silver: varies per prem_group config
- Sell rate → ceiling roundoff, Buy rate → floor roundoff

### BR-F002: Margin Requirement
```
Available Margin ≥ Required Margin
Required Margin = Qty × Rate × (Margin% / 100)    [if margin_type = 1]
                  OR com_margin_value per unit      [if margin_type = 0]
Order BLOCKED if insufficient
```

### BR-F003: Order Value
```
Total = Qty × Rate × com_weight
Net = Total + Service Charges - Discounts
Tax (TCS/TDS) per Indian regulations
```

### BR-F004: Limit Orders
```
Customer sets target rate → System monitors MCX feed
Trigger: MCX Rate crosses limit → Auto-execute
Execute at limit price OR current (configurable)
```

### BR-F005: Delivery
```
Margin debited → Delivery amount = qty × delivery_rate
Invoice auto-generated → SMS + Email confirmation
```

---

## 🔴 COMMODITY RULES

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-C001 | CANNOT delete if linked to contracts/bookings → soft delete (status=0) | Model delete check |
| BR-C002 | Weight: 1 tola = 11.664g, 1 troy oz = 31.1035g. EXACT ratios | Conversion functions |
| BR-C003 | CANNOT change commodity_group_id if existing orders reference it | Model save check |
| BR-C004 | Min/max qty per commodity. Admin override with log | Controller + Model |

---

## 🔴 CUSTOMER/KYC RULES

| Rule ID | Rule |
|---------|------|
| BR-U001 | CANNOT trade without KYC approved. Admin approves in C_clients |
| BR-U002 | CANNOT delete customer with orders or margin > 0. Deactivate instead |
| BR-U003 | Hierarchy: Superadmin → Admin → Sub-admin (module-gated) → Customer |
| BR-U004 | Password: min 8 chars, letters + numbers. Customer change needs OTP |

---

## 🔴 ORDER/BOOKING RULES

| Rule ID | Rule |
|---------|------|
| BR-O001 | Cancellation within window (default: same day). Admin force cancel with reason |
| BR-O002 | Status: Pending → Confirmed → Processing → Delivered. No reversal. NO DELETE |
| BR-O003 | Phone booking by admin → rate locked at entry time |

---

## 🟡 RATE PANEL RULES

| Rule ID | Rule |
|---------|------|
| BR-R001 | R-Panel ON/OFF per commodity. OFF → no booking |
| BR-R002 | Bank rates: manual admin input, changes logged before/after |
| BR-R003 | Rate alerts: one-time SMS at target, unless re-enabled |

---

## 📡 COMMUNICATION TRIGGERS

| Event | SMS | Email | WhatsApp |
|-------|:---:|:-----:|:--------:|
| Order placed | ✅ | ✅ | Optional |
| Order cancelled | ✅ | ✅ | Optional |
| Delivery confirmed | ✅ | ✅ | Optional |
| Password changed | ✅ | — | — |
| Rate alert triggered | ✅ | — | — |
| KYC approved/rejected | ✅ | ✅ | — |
| Low margin warning | ✅ | — | — |
| Registration welcome | — | ✅ | — |

---

## ⚠️ COUNTERINTUITIVE VALUES (Trap Alert!)

| Field | Value | Meaning |
|-------|:-----:|---------|
| `book_type` | 0 | Buy (customer buys FROM company) |
| `book_type` | 1 | Sell (OPPOSITE of what you expect!) |
| `market_status` | 0 | OPEN |
| `market_status` | 1 | CLOSED |

---

## ⛔ NEVER AUTO-CHANGE

| Area | Reason |
|------|--------|
| Rate formulas | Financial accuracy |
| Tax calculations | Indian tax law |
| Order status transitions | Payment integrity |
| Permission matrix | Security |
| DB schema | Data loss risk |
| API contracts | Mobile app compat |
| Margin calculations | Customer safety |
