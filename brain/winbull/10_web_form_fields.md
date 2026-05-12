# Winbull Staging — Web Frontend Form Field Reference (Brain Artifact 10)

> ⚠️ MANDATORY: Answer ALL web/customer-facing form field questions from THIS file first.
> Do NOT read source code files for customer web form questions if this file covers the form.
> If a form is missing → read code → add it here → answer.

---

## QUICK LOOKUP: Which form has which field?

| If user asks about... | Go to Form |
|----------------------|-----------|
| Login, mobile, password | Form 1: Customer Login |
| Forgot password, OTP reset | Form 2: Forgot Password |
| New registration, GST, PAN, TCS/TDS selection | Form 3: Customer Signup |
| KYC, address proof, company documents | Form 4: KYC Registration |
| Book, sell, buy, qty, rate, commodity, market/limit | Form 5: Booking Form |
| Quotation, company details for invoice | Form 6: Quotation Form |
| Contact enquiry, captcha, message | Form 7: Contact Us |
| Trade history filter, date, type | Form 8: Reports / Trade History |
| TCS/TDS calculator, weight, purity, rate | Form 9: TCS/TDS Calculator |

---

## FORM 1: Customer Login (`login.php` → `C_client_main/login_validation()`)

| Field | Input Name | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Mobile Number | `user_name` | text (numeric) | Yes | 10 digit mobile. Used as login ID. `inputmode="numeric"` |
| Password | `user_password` | password | Yes | Min 6, max 30 chars |

**Submit** → POST to `C_client_main/login_validation()`
**On success** → Redirects to `bookrates.php` (live rate + booking page)

---

## FORM 2: Forgot Password (`forgotpassword.php` → `C_client_main/forgotpassword()`)

| Field | Input Name | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Mobile Number | `user_name` | text (numeric) | Yes | 10 digit. OTP sent to this number |
| OTP | `otp` | text | Yes | Shown after mobile submit. OTP from SMS |

**Flow**: Enter mobile → OTP sent via SMS → Enter OTP → Reset password

---

## FORM 3: Customer Self-Registration (`signup.php` → `C_client_main/registration()`)

### Customer Type Selection
| Field | Input Name | Values | Notes |
|-------|-----------|--------|-------|
| Customer Type | `cus_type` | `0`=Individual, `1`=Company | Radio. Toggles which fields are shown |

### Individual Fields (shown when `cus_type = 0`)
| Field | Input Name | Type | Required | Validation |
|-------|-----------|------|----------|-----------|
| Name | `cus_name` | text | Yes | Letters + spaces + dots only. Min 3, max 50 |
| Email | `cus_email` | text | Yes | Valid email format, max 50 chars |
| Whatsapp No | `cus_whatsapp` | text | Yes | 10 digits, numeric only |
| GST No | `cus_gstno` | text | Yes | 15 chars, auto uppercase, alphanumeric |
| Mobile No | `cus_mobile` | text | Yes | 10 digits, numeric only |
| PAN No | `cus_panno` | text | Yes | 10 chars (e.g. AAAAA1234A) |
| Type (TCS/TDS) | `cus_tcstds` | radio | Yes | `0`=TCS (default), `1`=TDS |
| Password | `cus_login_password` | password | Yes | Min 6, max 30 chars |
| Re-enter Password | `retype_password` | password | Yes | Client-side match check |
| Terms & Conditions | `terms` | checkbox | Yes | Must be checked to submit |
| OTP | `otp` | text | Yes | Sent to mobile after form fill |

### Company Fields (shown when `cus_type = 1`)
| Field | Input Name | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Company Name | `cus_company_name` | text | Yes | Alphanumeric + common chars, min 4, max 50 |
| Company Address | `cus_address` | text | Yes | min 4, max 50 |
| Email | `cus_email` | text | Yes | Valid email |
| Whatsapp No | `cus_whatsapp` | text | Yes | 10 digits |
| GST No | `cus_gstno` | text | Yes | 15-char GST number |
| Mobile No | `cus_mobile` | text | Yes | 10 digits |
| PAN No | `cus_panno` | text | Yes | 10 chars |
| Type (TCS/TDS) | `cus_tcstds` | radio | Yes | `0`=TCS, `1`=TDS |
| Password | `cus_login_password` | password | Yes | Min 6, max 30 |
| Re-enter Password | `retype_password` | password | Yes | Must match |
| Terms & Conditions | `terms` | checkbox | Yes | Must be checked |
| OTP | `otp` | text | Yes | SMS OTP |

---

## FORM 4: KYC Registration (`kyc.php` → `C_client_main/kyc_registration()`)

> Full offline KYC — used by admin when registering a company customer directly

### Section: Business Details
| Field | Input Name | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Company Name | `fv[cus_company_name]` | text | Yes | |
| Address | `fv[cus_address]` | textarea | Yes | |

### Section: Proprietor / Partner Details
| Field | Input Name | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Name 1 | `fv[cus_name]` | text | Yes | Primary proprietor name |
| Mobile (Name 1) | `fv[cus_mobile]` | number | Yes | AJAX uniqueness check |
| Name 2 | `fv[cus_name2]` | text | No | Partner/second owner |
| Mobile (Name 2) | `fv[cus_mobile2]` | number | No | AJAX uniqueness check |

### Section: Phone Numbers
| Field | Input Name | Notes |
|-------|-----------|-------|
| Office 1 | `fv[cus_phone1]` | Required |
| Office 2 | `fv[cus_phone2]` | Optional |
| Residence | `fv[cus_res_phone]` | Optional |
| E-Mail | `fv[cus_email]` | Required. AJAX uniqueness check |

### Section: Bank Details
| Field | Input Name | Required |
|-------|-----------|---------|
| Bank Name | `fv[cus_bnkname]` | Yes |
| Branch | `fv[cus_bnkbranch]` | Yes |
| A/C No | `fv[cus_accno]` | Yes |
| IFSC Code | `fv[cus_ifsc]` | Yes |

### Section: Tax / Legal
| Field | Input Name | Required | Notes |
|-------|-----------|---------|-------|
| GSTin No | `fv[cus_tin_no]` | Yes | GST number |
| Pan No | `fv[cus_panno]` | Yes | PAN card number |
| Reference | `fv[cus_ref]` | No | Referral or internal reference |
| Type | `cus_tcstds` | Yes | `0`=TCS, `1`=TDS (radio) |

### Section: Documents (File Uploads)
| Field | Input Name | Required | Validation |
|-------|-----------|---------|-----------|
| Address proof copy | `fv[cus_addrcopy]` | Yes | Image file, `validate_image()` |
| PanNo scan copy | `fv[cus_pancopy]` | Yes | Image file |
| GSTinNo scan copy | `fv[cus_tincopy]` | Yes | Image file |
| Partnership Deal copy | `fv[cus_dealcopy]` | No | Only for partnerships |

### Section: Verification
| Field | Input Name | Notes |
|-------|-----------|-------|
| Captcha | `answer` | Text captcha, refreshable image |
| T&C Checkbox | `checkbox` (`chkaccept`) | Must be checked to enable submit |

---

## FORM 5: Booking Form (`bookrates.php` → `C_client_main/booking_request()`)

> The core trading form. Customer places buy/sell orders here.

### Hidden Fields (auto-filled by JS when commodity is selected)
| Input Name | Purpose |
|-----------|---------|
| `book_cusid` | Logged-in customer ID |
| `book_comid` | Selected commodity ID |
| `book_comweight` | Commodity weight unit (grams) |
| `confirmation_for` | Auto-confirm or reject setting |
| `book_barquantity` | Bar quantity if bar selection enabled |
| `book_type` | Buy or Sell |
| `book_comtype` | Gold or Silver type |
| `margin` | Margin value for this booking |
| `margin_type` | Margin type (% or value) |
| `maxqty` | Maximum allowed booking quantity |
| `gold_high_tol` / `gold_low_tol` | Tolerance range for gold |
| `silver_high_tol` / `silver_low_tol` | Tolerance range for silver |
| `allowed_decimals` | Decimal places for qty input |
| `bar_selection` | Whether bar selection is active |
| `com_bar_no` | Number of bars |
| `premsel_premium` / `prembuy_premium` | Premium group sell/buy values |
| `discount_amt` | Discount amount applied |

### Visible Input Fields
| Field | Input Name | Type | Notes |
|-------|-----------|------|-------|
| Request Type | `request_type` | radio | `0`=Market (live rate), `1`=Limit Order, `2`=Modify Order |
| Commodity | `book_comname` (select) | select | Dropdown of available commodities |
| Current Rate | `book_rate` | number (readonly) | Auto-filled from live socket rate |
| Limit Order No | `limitno` (select) | select | Visible only for Modify Order mode |
| Limit Rate | `order_rate` | number | User's target rate for limit order |
| Deal Type | `deal_type` | radio | `0`=Weight (grams), `1`=Amount (₹) |
| Total Amount | `book_totamt` | number | Visible when deal_type = Amount |
| Quantity | `book_qty` | number | Visible when deal_type = Weight |
| Rate (weight discounted) | `book_rate_wtdis` | text | Displayed rate after weight-based adjustment |

### Buy vs Sell
Triggered by clicking the **Buy** or **Sell** button on each commodity row — sets `book_type` hidden field.

---

## FORM 6: Quotation (`quotation.php` → `C_client_main/get_quotation()`)

> Generates a quotation invoice without placing an actual booking

| Field | Input Name | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Company Name | `company` | text | No | Max 40 chars |
| GST No | `gst` | text | No | Max 15 chars |
| Mobile No | `mobile` | text | No | With country code select |
| OTP | `otp` | text | Conditional | Required for verified quotation |

**Flow**: Fill company info → Select commodity + qty → Generate PDF quotation

---

## FORM 7: Contact Us (`contactus.php` → `C_client_main/send_contact()`)

| Field | Input Name | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Name | `name` | text | Yes | |
| Email | `email` | email | Yes | AJAX email check |
| Phone No | `phone` | number | Yes | AJAX mobile check |
| Message | `comments` | textarea | Yes | |
| Captcha | `answer` | text | Yes | Image captcha, refreshable |

---

## FORM 8: Reports / Trade History (`reports.php`)

> Filter panel for viewing past bookings

| Field | Input Name | Type | Notes |
|-------|-----------|------|-------|
| From Date | `from_date` | date picker | Start of report range |
| To Date | `to_date` | date picker | End of report range |
| Type | `report_type` | select | Buy / Sell / All |
| Commodity | `com_filter` | select | Filter by commodity |

---

## FORM 9: TCS/TDS Calculator (`tcs_tds.php` → `C_client_main/tcs_tds_calc()`)

> Not a POST form — all calculations happen client-side in JS

### Per-row inputs (dynamic table rows)
| Field | Purpose |
|-------|---------|
| Weight (grams) | Quantity of metal |
| Purity (%) | Metal purity percentage |
| Rate per gram (₹) | Rate used for calculation |
| TDS/TCS % | Editable tax rate per row (pre-filled from DB `tcs_value`) |

### Toggle
| Field | Input Name | Notes |
|-------|-----------|-------|
| TDS radio | `tds_opt` | Selects TDS calculation mode |
| TCS radio | `tcs_opt` | Selects TCS calculation mode |

### Calculated Outputs (read-only)
| Output | Formula |
|--------|---------|
| Total Amount | `weight × rate × (purity / 100)` |
| TDS Amount | `total × 100 / (GST% + 100) × (TDS% / 100)` — ex-GST basis |
| TCS Amount | `total × (TCS% / 100)` — inclusive basis |
| Payable Amount | TDS: `total - tds_amt` / TCS: `total + tcs_amt` |
| Grand Total Weight | Sum of all row weights |

---

## Page Types (No Form — Display Only)

| Page | View File | Purpose |
|------|-----------|---------|
| Home | `home.php` | Landing page with live rate ticker |
| Live Rates (Gold) | `gold.php` | Gold rate display |
| Live Rates (Silver) | `silver.php` | Silver rate display |
| Products | `products.php` | Product catalogue |
| About Us | `aboutus.php` | Company info |
| Gallery | `gallery.php` | Image gallery |
| Bank | `bank.php` | Bank details display |
| Terms | `terms.php` | Terms and conditions |
| Privacy | `privacy.php` | Privacy policy |
| Disclaimer | `disclaimer.php` | Legal disclaimer |
| Calendar | `calendar.php` | Market calendar / holidays |
| Unfix Reports | `unfixreports.php` | Customer's unfix position report |
