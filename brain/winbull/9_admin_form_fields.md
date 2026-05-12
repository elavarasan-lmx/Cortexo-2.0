# Winbull Staging — Admin UI Form Field Reference (Brain Artifact 9)

> ⚠️ MANDATORY: Answer ALL admin form field questions from THIS file first.
> Do NOT read any source code file for field meaning questions if this file covers the form.
> If a form is missing here → read code → add it here → answer.

---

## FORM 1: Customer Registration (`userregistration_entry.php` → `dt_customer`)

### Section: Basic Info
| Field Label | DB Column | Type | Required | Notes |
|------------|-----------|------|----------|-------|
| Company Name | `cus_comp_name` | text | Yes | Trader's business name |
| Trader Type | `customer_type` | select | Yes | Customer category (Retailer/Wholesaler etc) |
| Mobile No | `cus_mobile` | text (10 digit) | Yes | Primary contact. AJAX uniqueness check |
| E-Mail Id | `cus_email` | email | Yes | AJAX uniqueness check, max 50 chars |
| Whats App No | `cus_whatsapp` | text (10 digit) | Yes | WhatsApp number for order alerts |
| Business Type | `cus_business_type` | select/radio | No | Type of business |
| Address | `cus_address` | textarea | No | 10–250 chars |
| City | `cus_city` | text | No | min 3, max 50 chars |
| GST No | `cus_gstno` | text | Yes | 15-char GST number (e.g. 22AAAAA0000A1Z5). Auto-uppercase |
| Pan No | `cus_panno` | text | Yes | 10-char PAN (e.g. AAAAA1234A). Auto-uppercase |
| Tin No | `cus_tin_no` | text | Yes | Tax Identification Number |
| Remarks | `cus_remarks` | textarea | No | Internal notes, max 100 chars |

### Section: Reference / Notifications
| Field Label | DB Column | Type | Notes |
|------------|-----------|------|-------|
| Send SMS | `cus_sms_status` | checkbox | `1` = send SMS on registration |
| Send Email | `cus_email_status` | checkbox | `1` = send email on registration |

### Section: Contact Numbers
| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Office No. 1 | `cus_phone1` | Optional landline |
| Office No. 2 | `cus_phone2` | Optional landline |
| Residence No. | `cus_res_phone` | Optional residence number |

### Section: Bank Details
| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Bank Name | `cus_bnkname` | Bank name |
| Branch | `cus_bnkbranch` | Bank branch |
| A/C No | `cus_accno` | Bank account number |
| IFSC Code | `cus_ifsc` | IFSC code |

### Section: Login Credentials
| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Login Name | `cus_login_name` | Auto-generated, readonly. Used for platform login |
| Security Code | `cus_sec_code` | Hidden in UI. Internal auth code |
| Password | `cus_login_password` | min 6, max 30 chars. Required |
| Retype Password | *(client-side confirm)* | Must match password |

### Section: TCS/TDS Classification
| Field Label | DB Column | Values | Notes |
|------------|-----------|--------|-------|
| TCS/TDS type | `cus_tcstds` | `0`=TCS, `1`=TDS | Determines tax calculation mode. `0` if turnover < ₹10 Cr |

---

## FORM 2: Commodity Entry (`commodity_entry.php` → `dt_commodity`)

### Section: Core Settings
| Field Label | DB Column | Type | Required | Notes |
|------------|-----------|------|----------|-------|
| Commodity Name | `com_name` | text | Yes | Displayed in live rate screen |
| Purity Settings | `com_purity` | select/radio | No | Internal purity classification |
| R-Panel Commodity Type | `com_type` | select | Yes | Links to R-Panel rate source (Gold/Silver) |
| Purity Conversion | `com_calpurity` | select | Yes | Rate calculation purity (e.g., 999, 995) |
| Display Purity | `com_display_purity` | text | No | Displayed purity (e.g., 99.99) |
| Weight (In Grm) | `com_weight` | decimal | Yes | Rate shown per this weight (e.g., 1g, 10g, 1kg) |
| Round-off factor | `com_correction_type` | select | No | Rounding logic for displayed rates |
| Other charges | `com_other_charges` | decimal | Yes | Fixed extra charges per booking |
| Sequence Number | `com_order_number` | number | Yes | Display order on live rate page |
| Is Madurai Rate? | `is_madurai_rate` | checkbox | No | Use Madurai local rate source |
| Decimals for rate | `com_roundoff` | number | Yes | Decimal places shown for rate |
| Decimals for qty | `allowed_decimals` | number | Yes | Decimal places for booking quantity |

### Section: Bar Selection
| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Is Bar Selection | `com_is_bar` | checkbox — enables bar-wise quantity selection |
| No of bars | `com_bar_no` | Number of bars in one lot |
| Bar Quantity | `com_bar_quantity` | Grams per bar |
| Bar Type | `com_bar_type` | Select — type/size of bar |

### Section: Margin
| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Margin Type | `com_margin_type` | Select: `%` (percentage) or fixed value per kg |
| Margin Value | `com_margin_value` | Amount based on margin type |

### Section: Trading Status
| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Active | `com_active` | `1`=enabled, `0`=disabled |
| Update Trading Status | *(toggle)* | Enable/disable buy/sell for this commodity |
| Sell status | `com_sell_status` | `1`=sell open, `0`=sell closed |
| Buy status | `com_buy_status` | `1`=buy open, `0`=buy closed |

---

## FORM 3: R-Panel Commodity (`rpanelcommodity_entry.php` → `dt_rpanel_commodity`)

> Maps internal commodities to MCX/Bank rate feed symbols

| Field Label | DB Column | Required | Notes |
|------------|-----------|----------|-------|
| Display Name | `rcom_disname` | Yes | Name shown on R-Panel page (e.g., Gold-1, Gold-2) |
| Commodity Type | `rcom_comtype` | No | Gold / Silver classification |
| MCX Symbol | `rcom_mcxsymbol` | Yes | MCX contract name from dropdown (e.g., GOLDM, SILVER) |
| Bank Symbol | `rcom_banksymbol` | Yes | Bank rate feed symbol |
| Sell Tax % | `rcom_sell_tax` | Yes | GST % applied on sell transactions |
| Buy Tax % | `rcom_buy_tax` | Yes | GST % applied on buy transactions |
| Sell TCS % | `rcom_sell_tcs` | Yes | TCS % on sell |
| Buy TCS % | `rcom_buy_tcs` | Yes | TCS % on buy |
| Sequence Number | `rcom_orderno` | Yes | Display order (1–99) |
| Contract Name | `rcom_contname` | No | MCX contract month name shown to users |
| Contract active | `rcom_contactive` | No | Whether this contract is currently trading |
| Active | `rcom_active` | Yes | Enable/disable this R-Panel mapping |

---

## FORM 4: R-Panel Settings (`rpanel_settings_entry.php` → `dt_generalsettings` rpanel fields)

| Field Label | DB Column | Notes |
|------------|-----------|-------|
| High colour | `h_colour` | `0`=Red, `1`=Green, `2`=Blue — colour for rate going UP |
| Low colour | `l_colour` | `0`=Red, `1`=Green, `2`=Blue — colour for rate going DOWN |
| Client view | `clientview` | checkbox — show R-Panel to customers |
| Push rate (Is Holiday) | `isholiday` | checkbox — push rates even on holiday |
| Confirmation for | `confirmation_for` | `0`=Rejection, `1`=Confirmation — auto booking action |
| Confirm time | `confirm_time` | Seconds before auto confirmation/rejection triggers |
| Transaction period | `trans_period` | Days within which a booking can be transacted |
| Margin type | `margin_type` | `0`=percentage, `1`=value — system-wide margin mode |

---

## FORM 5: Email Settings (`email_settings_entry.php` → `dt_email_settings`)

| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Service | `service_id` | Hidden — which service this template belongs to (booking, OTP, etc.) |
| Subject | `email_signature` | Email subject line (5–100 chars) |
| E-Mail Content | `email_content` | Full HTML email body (10–3000 chars). Supports template variables |

---

## FORM 6: SMS Settings (`sms_settings_entry.php` → `dt_sms_settings`)

| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Service | `service_id` | Hidden — which service this SMS template is for |
| SMS Content | `sms_content` | SMS body (10–1000 chars). Uses DLT-registered template |
| Footer | `sms_footer` | Footer text appended to SMS (3–50 chars) |
| DLT ID | `sms_dlt_te_id` | 19-digit TRAI DLT Template Entity ID (mandatory for India) |

---

## FORM 7: WhatsApp Settings (`whatsapp_settings_entry.php` → `dt_whatsapp_settings`)

| Field Label | DB Column | Notes |
|------------|-----------|-------|
| Service | `service_id` | Hidden — which service this template is for |
| WhatsApp Content | `whatsapp_content` | Message body (10–2000 chars) |
| Footer | `whatsapp_footer` | Footer text (5–50 chars) |

---

## FORM 8: Product Entry (`product_entry.php` → `dt_product`)

| Field Label | DB Column | Required | Notes |
|------------|-----------|----------|-------|
| Product Name | `pro_name` | Yes | Displayed on product page (e.g., gold, silver). Max 30 chars |
| Category | `pro_category` | Yes | Product category grouping |
| Commodity Type | `pro_comtype` | Yes | Maps product to Gold/Silver |
| Description | `pro_desc` | No | Long description shown on product detail page |
| Image | `pro_image` | No | Display image on product page (file upload) |
| Active | `pro_status` | Yes | `1`=Yes active, `0`=No disabled |

---

## FORM 9: Admin User Entry (`adminuser_entry.php` → `dt_admin_users`)

| Field Label | DB Column | Required | Notes |
|------------|-----------|----------|-------|
| User Name | `admin_user_name` | Yes | Min 3 chars, letters only |
| Password | `admin_user_password` | Yes (Add) / Optional (Edit) | Min 6, must have upper+lower+number+special |
| Security Code | `admin_sec_code` | Yes | Min 3 chars. Used for single-user access control |
| Read only user | `disable_rpaneledit` | No | `1` = can view R-Panel but not edit |
| Active | `admin_status` | No | `1`=active, `0`=disabled |
| Validate till | `admin_validity_date` | No | Account expiry date (date picker, no past dates) |
| Payment Alert | `admin_showalert` | No | Checkbox — shows payment reminder at login |
| Alert before (In days) | `admin_alertdays` | Conditional | Required if Payment Alert is checked. Days before expiry to start alerting |
| Alert message | `admin_alertmessage` | Conditional | Message shown at login. Min 5 chars, max 100 |
| SMS | `admin_is_sms` | No | checkbox — admin receives SMS alerts |
| Block IP | `admin_ip_restricted` | No | checkbox — blocks specified IP from logging in |
| IP Address | `admin_ip` | Conditional | IP to block. Used with Block IP checkbox |

### User Rights Table (per menu item)
Each menu row has checkboxes for: **View / Add / Edit / Delete / SMS / Email / Notification**

---

## FORM 10: General Settings → see `3_admin_panel.md` Section "General Settings — Field Map"

> Already fully documented in `3_admin_panel.md`. Do not duplicate here.

---

## Quick Lookup: Which form has which field?

| If user asks about... | Go to Form |
|----------------------|-----------|
| GST No, PAN, Mobile, Login Name, TCS/TDS type | Form 1: Customer Registration |
| Purity, Weight, Margin Type, Bar Selection, Sequence | Form 2: Commodity Entry |
| MCX Symbol, Bank Symbol, Sell Tax, Buy Tax | Form 3: R-Panel Commodity |
| High/Low colour, Confirm time, Margin type, Client view | Form 4: R-Panel Settings |
| Email Subject, Email Content | Form 5: Email Settings |
| SMS Content, DLT ID, Footer | Form 6: SMS Settings |
| WhatsApp Content, WA Footer | Form 7: WhatsApp Settings |
| Product Name, Category, Product Image | Form 8: Product Entry |
| Payment Alert, Alert Days, Security Code, User Rights | Form 9: Admin User |
| Stock Manage, Tolerance, Hedge Lot, Trade On/Off time | 3_admin_panel.md General Settings |
