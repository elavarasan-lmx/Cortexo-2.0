# Winbull Staging — Web Frontend (Client-Facing)

## Controller Map (`application/controllers/`)

### C_booking.php — Live Booking Interface
| Method | Purpose | Route |
|--------|---------|-------|
| `book()` | Main booking page with rate table | `/C_booking/book` |
| `booknow($cid)` | Execute booking for commodity $cid | POST |
| `updateBookingStatus()` | Toggle booking active/inactive | POST |
| `getpendingorders()` | View open orders | `/C_booking/getpendingorders` |
| `getRate()` | AJAX rate fetch (AES encrypted response) | AJAX |
| `getRatexml()` | Legacy XML rate fetch | AJAX |
| `getLiveRates()` | Get current rates JSON | AJAX |
| `getBookingHistory()` | Historical bookings list | GET |
| `notification()` | Unread notifications list | GET |
| `read_notification($id)` | Mark notification as read | POST |

### C_client_main.php — Authentication & Session
| Method | Purpose | Route |
|--------|---------|-------|
| `index($type)` | Landing page (login form), $type=error code | `/` or `/C_client_main/index` |
| `load_mainpage()` | Dashboard redirect | GET |
| `login_validation()` | Login POST handler | POST |
| `terminate_usersession()` | Force terminate + re-login via sec_code | POST |
| `check_loginstatus()` | Session heartbeat | AJAX |
| `Customerlogout()` | Logout + session destroy | GET |
| `contact_us()` | Contact page | GET |
| `register_client()` | Show registration form | GET |
| `save_registration()` | Process registration | POST |
| `send_otp()` | OTP via SMS for verification | POST |
| `verify_otp()` | Validate OTP | POST |
| `forgot_password()` | Password recovery page | GET |
| `send_forgot_password_link()` | Send reset email/SMS | POST |
| `getRate()` | Rate fetch (AES-256 encrypted) — **contains hardcoded key** | AJAX |
| `rate_alert()` | Rate alert configuration page | GET |
| `set_ratealert()` | Save rate alert | POST |
| `stop_ratealert($id)` | Delete rate alert | POST |

#### 🚨 CRITICAL: SQL Injection in login_validation() (Line 876)
```php
// VULNERABLE — Raw user input in SQL!
$this->db->query("select * from dt_customer where cus_login_name='".$this->input->post('user_name')."' and cus_login_password='".$this->input->post('user_password')."'");
```

#### 🚨 CRITICAL: SQL Injection in terminate_usersession() (Line 915)
```php
$this->db->query("select * from dt_customer where cus_login_name='".$this->input->post('user_name')."' and cus_sec_code='".$this->input->post('user_sec_code')."'");
```

### C_trade.php — Order Management
| Method | Purpose | Route |
|--------|---------|-------|
| `pending_orders()` | List pending/limit orders | GET |
| `execute_order($id)` | Execute a pending order | POST |
| `cancel_order($id)` | Cancel pending order | POST |
| `order_report()` | Order history report | GET |
| `booking_detail($id)` | Single booking detail | GET |
| `notification_dispatch()` | Send booking status notification (SMS/Push/WhatsApp) | Internal |

### C_rates.php — Rate Data Delivery
| Method | Purpose | Route |
|--------|---------|-------|
| `getRateData()` | Encrypted rate response | AJAX |
| `getRateXml()` | XML rate response | AJAX |
| `refreshRates()` | Force rate refresh (admin trigger) | POST |

### C_sendorderstatus.php — Notification Engine
| Method | Purpose | Route |
|--------|---------|-------|
| `send_sms($mobile,$msg)` | Send SMS via API | Internal |
| `send_whatsapp($mobile,$msg)` | Send WhatsApp message | Internal |
| `send_push($playerid,$title,$msg)` | OneSignal push notification | Internal |
| `order_confirmed($booking_id)` | Full notification on booking confirm | Internal |
| `order_executed($booking_id)` | Notify on order execution | Internal |
| `order_cancelled($booking_id)` | Notify on order cancellation | Internal |
| `send_booking_status($booking)` | Route to correct notification method | Internal |

### C_userregistration.php — Client Registration
| Method | Purpose | Route |
|--------|---------|-------|
| `index()` | Registration form | GET |
| `register()` | Process registration + KYC upload | POST |
| `verify_gst($gst)` | Validate GST number | POST |
| `verify_pan($pan)` | Validate PAN format | POST |
| `send_otp($mobile)` | Send verification OTP | POST |
| `verify_otp()` | Verify OTP code | POST |
| `registration_success()` | Show success page | GET |

### C_kyc.php — KYC Document Management
| Method | Purpose | Route |
|--------|---------|-------|
| `upload_documents()` | KYC file upload form | GET |
| `save_documents()` | Process file uploads (PAN, Aadhaar, GST) | POST |
| `view_documents($cusid)` | View uploaded docs | GET |
| `approve_kyc($cusid)` | Admin KYC approval (should be admin only!) | POST |
| `reject_kyc($cusid,$reason)` | Admin KYC rejection | POST |

### C_ajax.php — Utility AJAX Endpoints
| Method | Purpose | Route |
|--------|---------|-------|
| `getRate()` | Lightweight rate fetch | AJAX |
| `updateStatus()` | Update booking status | AJAX POST |
| `checkSession()` | Session alive check | AJAX |
| `getNotificationCount()` | Unread notifications count | AJAX |
| `getMarquee()` | Marquee text data | AJAX |

### C_mobile.php — Mobile API (Legacy CI-based)
| Method | Purpose | Route |
|--------|---------|-------|
| `checkVersion()` | App version check | POST |
| `registerDevice($token)` | Register push notification device | POST |
| `sendOTP($mobile)` | Mobile OTP | POST |
| `verifyOTP()` | Verify mobile OTP | POST |
| `login()` | Mobile login | POST |
| `getBookings()` | Active bookings list | GET |
| `bookOrder($cid)` | Place booking | POST |
| `cancelOrder($id)` | Cancel order | POST |
| `getRate()` | Rate data for mobile | GET |
| `getRateAlert()` | Rate alerts | GET |
| `setRateAlert()` | Set rate alert | POST |
| `deleteRateAlert($id)` | Delete rate alert | POST |
| `getProfile()` | User profile | GET |
| `updateProfile()` | Update profile | POST |
| `changePassword()` | Change password | POST |
| `getNews()` | News feed | GET |
| `getNotifications()` | Notification list | GET |
| `logout()` | Mobile logout | POST |

---

## Model Map (`application/models/`)

### Core Models
| Model | Domain | Key Methods |
|-------|--------|-------------|
| `login_model` | Auth | `check_user()`, `terminate_existingsession()`, `GetCustomerID()` |
| `booking_model` | Trading | `insertbooking()`, `getbookings()`, `updatestatus()` |
| `trade_model` | Orders | `get_pending()`, `execute()`, `cancel()` |
| `customer_model` | Users | `get_customer()`, `update_customer()`, `get_profile()` |
| `notification_model` | Alerts | `get_unread()`, `mark_read()`, `insert_notification()` |
| `rate_model` | Pricing | `get_rates()`, `get_ratealert()`, `set_ratealert()` |
| `registration_model` | Signup | `insert_customer()`, `verify_otp()` |
| `kyc_model` | KYC | `upload_docs()`, `approve()`, `reject()` |
| `commodity_model` | Products | `get_commodities()`, `get_commodity_by_id()` |
| `sms_model` | Messaging | `send_sms()`, `log_sms()` |

---

## Helper Files (`application/helpers/`)
| File | Purpose |
|------|---------|
| `common_helper.php` (14KB) | Utility functions: `curl_helper()`, `encrypt_data()`, `decrypt_data()`, date/format functions |
| `field_labels_helper.php` (29KB) | UI label mapping, multilingual field names, commodity display names |

---

## Business Logic Flows

### Login Flow
```
User → C_client_main/login_validation() 
  → login_model->check_user() returns 0|1|2|3|4
  → If 1: terminate_existingsession() (kill old sessions)
  → Raw SQL query (⚠️ SQLI!) to get user data
  → Set session: username, userid, client_uuid, is_logged_in
  → cURL to Lumen marqueeupdate endpoint to terminate old socket
  → Redirect to C_booking/book
```

### Booking Flow
```
User on C_booking/book → Views live rate table
  → Clicks "Book" on commodity → C_booking/booknow($cid)
  → booking_model->insertbooking() creates dt_booking record
  → cURL to Lumen $bookupdate endpoint (notifies rate engine)
  → Lumen triggers socket broadcast via event system
  → C_sendorderstatus dispatches SMS/WhatsApp/Push
```

### Rate Delivery Flow
```
Client JavaScript → WebSocket to port 57134
  OR → AJAX to C_ajax/getRate() / C_client_main/getRate()
    → Reads winbullstaging.enc file
    → Decrypts with AES-256
    → Returns JSON rate data
```
