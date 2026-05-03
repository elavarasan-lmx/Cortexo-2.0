# 💼 Business Logic — WinBull Trade

> **NEVER auto-change business rules without human approval**
> Last Updated: 2026-05-01

---

## Order Execution Flow

```
Customer clicks "Buy/Sell"
    ↓
1. Validate KYC (cus_kyc_status = 'approved') → Error if not
    ↓
2. Check Margin (available ≥ required) → Error if insufficient
    ↓
3. Check Qty Limits (min ≤ qty ≤ max) → Error if out of range
    ↓
4. Lock Rate (snapshot MCX at moment of booking)
    ↓
5. INSERT booking (Status: Pending)
    ↓
6. Deduct Margin (update balance)
    ↓
7. Log to admin_log + Send SMS/Email/Push
```

**Key**: Rate is locked at booking time. Even if MCX moves, booked rate stays. Only admin can override.

---

## Financial Rules

| Rule ID | Rule | Detail |
|---|---|---|
| BR-F001 | Rate Formula | `Customer Rate = MCX Live ± Premium (from prem_group)`. Round to 2 decimals |
| BR-F002 | Margin Check | `Available Margin ≥ (Qty × Rate × Margin%)`. Order BLOCKED if insufficient |
| BR-F003 | Order Value | `Total = Qty × Rate`. Net = Total + Service - Discounts. Tax per Indian regs |
| BR-F004 | Limit Orders | System monitors MCX feed → auto-execute when price crosses target |
| BR-F005 | Delivery | Margin debited → Invoice generated → SMS/Email sent |

---

## Commodity Rules

| Rule ID | Rule |
|---|---|
| BR-C001 | CANNOT delete commodity if linked to active contracts/bookings. Use soft delete |
| BR-C002 | Weight units: 1 tola = 11.664g, 1 troy oz = 31.1035g. EXACT ratios only |
| BR-C003 | CANNOT change commodity_group_id if existing orders reference it |
| BR-C004 | Min/max qty per commodity in commodity_master. Admin can override with log |

---

## Customer/KYC Rules

| Rule ID | Rule |
|---|---|
| BR-U001 | CANNOT trade without KYC approved. Admin approves in C_clients |
| BR-U002 | CANNOT delete customer with orders or margin > 0. Deactivate instead |
| BR-U003 | Hierarchy: Superadmin → Admin → Sub-admin (module-gated) → Customer |
| BR-U004 | Password: min 8 chars, letters + numbers. Customer change needs OTP |

---

## Order/Booking Rules

| Rule ID | Rule |
|---|---|
| BR-O001 | Cancellation within window (default: same day). Admin can force cancel with reason |
| BR-O002 | Status flow: Pending → Confirmed → Processing → Delivered. No reversal after Confirmed. DELETE not allowed |
| BR-O003 | Phone booking: admin enters on behalf of customer. Rate locked at entry time |

---

## Rate Panel Rules

| Rule ID | Rule |
|---|---|
| BR-R001 | R-Panel ON/OFF per commodity. When OFF → no booking allowed |
| BR-R002 | Bank rates are manual admin input. Changes logged with before/after |
| BR-R003 | Rate alerts: one-time SMS when target reached, unless customer re-enables |

---

## Communication Rules

| Trigger | SMS | Email | WhatsApp |
|---|---|---|---|
| Order placed | ✅ | ✅ | Optional |
| Order cancelled | ✅ | ✅ | Optional |
| Delivery confirmed | ✅ | ✅ | Optional |
| Password changed | ✅ | — | — |
| Rate alert triggered | ✅ | — | — |
| KYC approved/rejected | ✅ | ✅ | — |
| Low margin warning | ✅ | — | — |
| Registration welcome | — | ✅ | — |
| Monthly statements | — | ✅ (if configured) | — |

---

## NEVER Auto-Change

| Area | Reason |
|---|---|
| Rate formulas | Financial accuracy, legal compliance |
| Tax calculations | Indian tax law |
| Order status transitions | Payment integrity |
| Permission matrix | Security boundary |
| DB schema | Data loss risk |
| API contracts | Mobile app compat |
| Margin calculations | Customer financial safety |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Rate changes mid-order | Rate locked at booking — snapshot preserved |
| Multiple pending orders | Each locks own margin. Available = Total - Sum(locked) |
| Commodity goes inactive | New bookings rejected. Existing pending orders stay valid |
| Admin + customer update margin simultaneously | No transaction wrapping (⚠️ KNOWN GAP) — race condition risk |
| book_type values | 0=Buy (customer buys FROM company), 1=Sell (COUNTERINTUITIVE!) |
| market_status values | 0=OPEN, 1=CLOSED (COUNTERINTUITIVE!) |
