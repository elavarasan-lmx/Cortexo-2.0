# Winbull — Business Rules (Brain Artifact 12)

> NEVER auto-change any rule here without explicit user approval.
> Read this before touching: booking, margin, rate, KYC, order, delivery, TCS/TDS logic.

---

## 🔴 FINANCIAL RULES

### BR-F001: Rate Calculation
```
Customer Rate = MCX Live Rate ± Premium Amount
Premium Amount = from prem_group table for customer's group
Final Order Value = Customer Rate × Quantity (in commodity unit)
Rounded to 2 decimal places
```

### BR-F002: Margin Requirement
```
Required Margin = Order Quantity × Rate × Margin %
Order BLOCKED if Available Margin < Required Margin
```

### BR-F003: Order Value
```
Order Total = Quantity × Rate
Net Payable = Order Total + Service Charges - Discounts
Tax (TCS/TDS) applied on net payable
```

### BR-F004: Limit Order
```
Customer sets target rate → system monitors MCX
Trigger when MCX rate crosses limit rate
Auto-execute at limit price OR current price (configurable)
```

### BR-F005: Delivery Flow
```
Margin debited → invoice generated → SMS + Email sent
```

---

## 🔴 COMMODITY RULES

### BR-C001: Cannot Delete Commodity If
- Linked to active contract in `contract_master`
- Has pending orders in booking table
- Referenced in `rpanel_commodity`
- **Action**: Soft delete (status = 0)

### BR-C002: Weight Unit Conversions
- 1 tola = 11.664 grams | 1 troy ounce = 31.1035 grams

### BR-C003: Cannot Change commodity_group_id if existing orders reference it

### BR-C004: Orders outside min/max qty range must be rejected

---

## 🔴 USER & KYC RULES

### BR-U001: KYC Before Trading
- Customer CANNOT order if `cus_kyc_status ≠ approved`

### BR-U002: Cannot Delete Customer If
- Has any orders OR margin balance > 0 → deactivate instead

### BR-U003: Admin Hierarchy
- Superadmin > Admin > Sub-admin (module rights table) > Customer

### BR-U004: Passwords — min 8 chars, letters + numbers. Customer change requires SMS OTP.

---

## 🔴 ORDER/BOOKING RULES

### BR-O001: Cancellation window is configurable. After window: admin force cancel only (logged).

### BR-O002: Order Status Flow
```
Pending → Confirmed → Processing → Delivered
         ↓ Cancelled (within window only)
No reversal after Confirmed. Delete NOT allowed, only cancel.
```

### BR-O003: Phone Booking
- Admin enters on behalf of customer. Rate is locked at time of booking.

---

## 🟡 RATE PANEL RULES

### BR-R001: R-Panel OFF = no booking for that commodity. Toggle logged.
### BR-R002: Bank rates are manual. Rate change history maintained.
### BR-R003: Rate alert is one-time. Customer must re-enable after trigger.

---

## 🟢 COMMUNICATION — MANDATORY SMS for:
Order placed, cancelled, delivery confirmed, password change, rate alert, KYC update, low margin

## MANDATORY EMAIL for:
Registration welcome, order invoice, password reset, KYC update

---

## ⛔ NEVER Auto-Change
Rate formulas, tax calculations, order status transitions, permission matrix, DB schema, API contracts, margin calculations

---

## 📐 Calculation Examples

### Gold Buy Order
```
MCX Rate: ₹62,500/10g | Premium: ₹50/10g
Customer Buy Rate = 62,500 - 50 = ₹62,450/10g
Qty = 100g = 10 units | com_weight = 0.1 KG
Total = 62,450 × 10 × 0.1 = ₹62,450.00
```

### Silver Sell Order
```
MCX Rate: ₹78,000/KG | Premium: ₹200/KG
Customer Sell Rate = 78,000 + 200 = ₹78,200/KG
Qty = 5 KG → Total = 78,200 × 5 = ₹3,91,000.00
```

### Margin Check
```
Order Total: ₹62,450 | Margin %: 10%
Required: 62,450 × 0.10 = ₹6,245
Available: ₹15,000 → ✅ Allowed
Post-order Available: 15,000 - 6,245 = ₹8,755
```

---

## 📐 Order Execution Sequence
```
Click Buy → Check KYC → Check Margin → Check Qty Limits
→ Lock Rate (snapshot MCX)
→ INSERT booking (Pending)
→ Deduct Margin
→ Log to admin_log + Send SMS/Email + Push
```

## ⚠️ Known Gap
No DB transaction wrapping on margin update → race condition risk when admin and customer act simultaneously.

---

## 🔴 PRINT = SAVE RULE (BR-PR001)

> *Sourced from eTail ERP audit — applies directly to Winbull invoice/delivery print views.*

**Rule**: Every print template MUST use the **identical formula** as the save logic.

```
If save calculates: Net = Rate × Qty × com_weight
Then print MUST use: Net = Rate × Qty × com_weight

If they differ → P1 bug (user sees wrong value on invoice)
```

**Where to check in Winbull**:
- Booking save: `Booking_model.php → insert_record()`
- Delivery invoice print: `views/booking/invoice_print.php`
- Any report export: compare report formula vs save formula

**Audit Check**: During `/audit-module`, read save formula → read print formula → compare field-by-field.

---

## 🔴 CANCEL-REVERSAL COMPLETENESS RULE (BR-CX001)

> *Sourced from eTail ERP audit — critical for Winbull booking cancellation integrity.*

**Rule**: If a save operation writes to N tables, the cancel operation MUST reverse ALL N tables.

```
Save touches:           Cancel must reverse:
────────────────        ──────────────────────
dt_booking (INSERT)  →  dt_booking (status = 'cancelled')
dt_margin (UPDATE)   →  dt_margin (restore amount)
admin_log (INSERT)   →  admin_log (log cancellation)
SMS sent             →  SMS sent (cancellation notification)

If cancel reverses only 2 of 4 → orphaned data = bug
```

**Winbull Cancellation Tables to Audit**:
1. `dt_booking` — status updated?
2. `dt_margin` — margin restored to customer?
3. `admin_log` — cancellation logged?
4. SMS — cancellation notification sent?
5. If limit order: rate alert re-enabled?
