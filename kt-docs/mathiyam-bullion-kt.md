# 📋 MATHIYAM BULLION — Complete Knowledge Transfer (KT) Document

**Project:** Mathiyam Bullion (White-label instance: Maharaj Gold Smith)
**Company:** Logimax India
**Author:** Elavarasan | **Date:** May 12, 2026

---

## 1. 🏆 WHAT IS BULLION TRADING?

**Bullion** = Gold and Silver bars/coins traded as investment commodities.

**Bullion Trading Platform** = A software system where:
- **Dealers/Jewellers** (our clients) display **live gold/silver rates** to their customers
- Customers can **book/buy gold or silver** at current market price
- Rates change **every second** based on MCX (Multi Commodity Exchange) market
- Dealer adds their **premium/margin** on top of MCX rates
- The platform handles **orders, delivery, reports**

### Who are the users?
| User | What they do |
|---|---|
| **End Customer** | Views live rates, registers, books gold/silver, checks reports |
| **Dealer/Admin** | Sets premiums, manages commodities, approves orders, manages customers |
| **Super Admin** | Manages the entire platform config |

---

## 2. 🛠️ WHY EACH TECHNOLOGY? (Tech Stack Explained)

### 🐘 PHP (CodeIgniter 3) — The Main Application
**What:** Server-side web framework
**Why PHP?**
- Bullion platform was originally built in PHP (most common web language in India)
- CodeIgniter 3 = lightweight MVC framework, easy to deploy, no complex setup
- Handles: User login, registration, booking, reports, admin panel, KYC forms
- 70+ clients already running on this — changing framework = too risky

**Where it's used:**
| Component | Path | Purpose |
|---|---|---|
| Web Client | `/application/` | Customer-facing website (rates, booking, reports) |
| Admin Panel | `/admin/application/` | Dealer's management dashboard |
| Mobile API | `/mobileapi/application/` | REST API for Flutter/Ionic mobile apps |
| Static API | `/api/` | Simple PHP files returning JSON (settings, bank details) |

### 🟣 Laravel Lumen — Rate Processing Engine
**What:** Lightweight Laravel micro-framework (API-only)
**Why Lumen?**
- **PHP alone can't do real-time** — it processes request → response → dies
- Lumen handles the **rate broadcasting pipeline** — takes MCX rates, applies dealer premiums, pushes to Redis
- Has built-in **Queue system** (Jobs) for background tasks like SMS, push notifications, order execution
- Has built-in **Event system** for broadcasting via Redis pub/sub
- **Redis integration** for caching rates and pub/sub messaging

**Where:** `/lmxtrade/winbullliteapi/` (Laravel Lumen app)

**What Lumen does specifically:**
1. Receives raw rates from Lightstreamer (MCX data provider)
2. Applies dealer-specific premiums/margins
3. Writes processed rates to `maharaj.txt` and `maharaj.enc`
4. Fires Redis events for real-time socket broadcasting
5. Runs background jobs (rate alerts, order execution, SMS)

### 🟢 Node.js — Real-Time WebSocket Server
**What:** JavaScript runtime for real-time connections
**Why Node.js?**
- **PHP can't hold persistent connections** — each request opens and closes
- Gold rates change **every second** — clients need instant updates WITHOUT refreshing page
- Node.js excels at **WebSocket connections** — holds thousands of connections open simultaneously
- Uses `fs.watch()` to detect rate file changes → broadcasts to all connected clients instantly

**There are TWO Node.js servers:**

| Server | File | Port | Purpose |
|---|---|---|---|
| **Native WS** | `client/maharaj-ws.js` | 57124 | Watches `maharaj.txt` → broadcasts rate changes via WebSocket |
| **Socket.io** | `lmxtrade/maharajwinlitesocket.js` | — | Listens to Redis pub/sub → broadcasts admin events (commodity updates, news, etc.) |

### 🔴 Redis (AWS ElastiCache) — Cache + Message Broker
**What:** In-memory data store
**Why Redis?**
- **Caching:** Live rates cached in Redis (faster than DB queries)
- **Pub/Sub:** When admin changes commodity settings → Redis publishes event → Socket.io picks up → pushes to all connected clients
- **Queue:** Lumen queue jobs processed via Redis (SMS, push notifications)

### 🌐 NGINX — Web Server + Reverse Proxy
**What:** HTTP server that routes traffic
**Why NGINX?**
- Serves PHP via PHP-FPM (FastCGI)
- Reverse proxies WebSocket connections (`/ws` → Node.js port 57124)
- SSL termination (HTTPS)
- Handles multiple domains on same server

---

## 3. 🔄 HOW DATA FLOWS (Complete Picture)

```
STEP 1: RATE SOURCE
━━━━━━━━━━━━━━━━━━
MCX Exchange (Mumbai) → Lightstreamer Server (72.52.178.11:8080)
                        (3rd party service that streams live commodity prices)

STEP 2: RATE INGESTION
━━━━━━━━━━━━━━━━━━━━━
Lightstreamer → Lumen API (BroadcastRatesController)
                POST /lmxtrade/winbullliteapi/api/v1/broadcastsourcerates
                (Raw MCX rates received here)

STEP 3: RATE PROCESSING
━━━━━━━━━━━━━━━━━━━━━━
Lumen applies dealer's premium/margin to raw rates
  Example: MCX Gold = ₹72,000 + Dealer Premium ₹500 = ₹72,500

STEP 4: RATE DISTRIBUTION
━━━━━━━━━━━━━━━━━━━━━━━━
Processed rates are distributed to 3 places:
  ├─→ Write to /client/maharaj.txt (plain text, tab-separated)
  ├─→ Write to /client/maharaj.enc (encrypted version)
  └─→ Publish to Redis (for Socket.io events)

STEP 5: REAL-TIME DELIVERY TO CLIENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Native WS Server (maharaj-ws.js):
  fs.watch(maharaj.txt) → detects change → reads file
  → compares with previous state → sends ONLY changed rates
  → broadcasts to all connected WebSocket clients

STEP 6: CLIENT DISPLAY
━━━━━━━━━━━━━━━━━━━━━
Web Browser / Mobile App receives WebSocket message
  → JavaScript/Flutter parses rate data
  → Updates UI with flash animation (green=up, red=down)
  → Customer sees live gold/silver price
```

---

## 4. 🏗️ SERVER CONFIGURATION

### AWS Infrastructure:
| Resource | Details |
|---|---|
| **EC2 Instance** | Server 7 (production) |
| **RDS MySQL** | database-1.cb86ugsw4aax.ap-south-1.rds.amazonaws.com |
| **ElastiCache Redis** | prod-cluster-001.78ozga.ng.0001.aps1.cache.amazonaws.com:6379 |
| **OS** | Ubuntu/Amazon Linux |

### Software Stack on Server:
```
NGINX (port 80/443)
  ├── PHP 7.4/8.x + PHP-FPM (CodeIgniter apps)
  ├── Node.js 16+ (WebSocket servers via PM2)
  ├── Composer (PHP dependency manager)
  ├── PM2 (Node.js process manager)
  └── Certbot (SSL certificates)
```

### NGINX Configuration (Key Parts):
```nginx
server {
    server_name www.maharajgoldsmith.com;
    root /var/www/html/maharaj;
    index index.php;

    # PHP handling
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # WebSocket proxy (Native WS on port 57124)
    location /ws {
        proxy_pass http://127.0.0.1:57124;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Rate socket (Socket.io - legacy)
    location /ratesocket {
        proxy_pass http://127.0.0.1:SOCKET_IO_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### PM2 Process Management:
```bash
# Start WebSocket server
pm2 start /var/www/html/maharaj/client/maharaj-ws.js --name "maharaj-ws"

# Start Socket.io server
pm2 start /var/www/html/maharaj/lmxtrade/maharajwinlitesocket.js --name "maharaj-socket"

# Start Lumen queue worker
pm2 start "php /var/www/html/maharaj/lmxtrade/winbullliteapi/artisan queue:work redis --daemon" --name "maharaj-queue"

# Save and set startup
pm2 save
pm2 startup
```

### File Permissions:
```bash
chown -R www-data:www-data /var/www/html/maharaj/
chmod 755 /var/www/html/maharaj/client/
chmod 644 /var/www/html/maharaj/client/maharaj.txt
chmod 644 /var/www/html/maharaj/client/maharaj.enc
```

---

## 5. 📦 ADMIN MODULES — URL, Inputs & Purpose

> **Base URL:** `http://www.maharajgoldsmith.com/admin/index.php/`
> **Pattern:** Every controller has `open_listingform` (list view) and `open_entryform` (add/edit/delete form)
> **CRUD Pattern:** All forms submit to `DB_Controller` which handles `add_new`, `edit`, `delete` with DB transactions

---

### 📊 MODULE: Admin User Management
**URL:** `/C_admin_user/open_listingform`
**Why:** Create sub-admin users with role-based access to the admin panel. Dealer can give limited access to employees.
**Form Inputs:**
| Field | DB Column | Type | Purpose |
|---|---|---|---|
| User Name | `admin_user_name` | text (max 45) | Login username |
| Password | `admin_user_password` | password (max 15) | Login password |
| Security Code | `admin_sec_code` | password (max 10) | Second level auth code |
| Block IP | `admin_ip_restricted` | checkbox | Restrict login to specific IP |
| IP Address | `admin_ip` | text (max 20) | Allowed IP (if block IP enabled) |
| Read Only User | `disable_rpaneledit` | checkbox | Prevent rate panel edits |
| Active | `admin_status` | checkbox | Enable/disable user |
| Validate Till | `admin_validity_date` | date | Account expiry date |
| Payment Alert | `admin_showalert` | checkbox | Show payment due alerts |
| SMS | `admin_is_sms` | checkbox | Enable SMS notifications |
| Alert Before (days) | `admin_alertdays` | number (max 3) | Days before expiry to alert |
| Alert Message | `admin_alertmessage` | text (max 100) | Custom alert text |
| **Menu Rights Table** | `userrights[]` | checkboxes | Per-menu: View/Add/Edit/Delete/SMS/Email/Notification |

---

### 🏷️ MODULE: Commodity Master
**URL:** `/C_commodity_master/open_entryform/commodity_model/edit/{id}`
**Listing URL:** `/C_commodity_master/open_listingform`
**Controller:** `C_commodity_master.php` (446 lines) → Model: `commodity_model`
**Why:** Defines what gold/silver products the dealer sells (Gold 24K, Gold 22K, Silver 999, Gold Petal, etc.). Each commodity has its own rate calculation, weight unit, purity, spread, rounding, margin, and decimal precision. **Every new product offering starts here — wrong config = wrong rate for customers.**

**Form Inputs (Verified from `commodity_entry.php`, 875 lines):**

**Section 1: Identity & Purity**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Commodity Name* | `fv[com_name]` | text (4-50) | Display name on rate panel and app (e.g., "Gold 999", "Silver Kilo") — must be ≥ 4 chars, no number-only names |
| Purity Settings | `fv[com_isregion]` | radio (On/Off) | **On** = uses purity conversion formula (regional tax included). **Off** = manual display purity |
| Purity Conversion | `fv[com_calpurity]` | select (995/999/9999) | When Purity Settings = On — converts rate to specified purity standard |
| Display Purity | `fv[com_display_purity]` | number (0-100) | When Purity Settings = Off — shows this purity % (e.g., 99.99) directly on UI |

**Section 2: Rate Configuration**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| R-Panel Commodity Type* | `fv[com_type]` | select (from DB) | Links commodity to an R-Panel group — determines which contract/rate source feeds this commodity |
| Weight (In Grm)* | `fv[com_weight]` | number | Standard weight for rate display (e.g., 1 = per gram, 10 = per 10 grams, 1000 = per kg) |
| Round-off Factor | `fv[com_correction_type]` | select | Rate rounding — 0 Ps / 5 Ps / 25 Ps / 50 Ps / 1 Rs / 5 Rs / 10 Rs / 25 Rs / 50 Rs / 100 Rs. Example: 50 Ps means ₹72,450.73 rounds to ₹72,451.00 |
| Other Charges* | `fv[com_other_charges]` | number | Fixed additional charges per unit (making charges, GST, etc.) — added to base rate |
| Sequence Number* | `fv[com_order_number]` | number (1-99) | Display order on rate panel/app — must be unique across commodities |

**Section 3: Display & Decimal Settings**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Is Madurai Rate? | `fv[com_is_coin]` | radio (Yes/No) | Categorizes as coin/Madurai rate *(only shown if `admin_is_coin` = 1 in general settings)* |
| Decimals for Rate* | `fv[com_roundoff]` | number (0-5) | Decimal places for rate display (e.g., 2 = ₹72,450.**50**). Values 0-5 only |
| Decimals for Qty* | `fv[allowed_decimals]` | number (0-5) | Decimal places for booking quantity (e.g., 3 = 100.**500** grams) |

**Section 4: Bar Selection** *(Only shown if `lite_trade` = 1)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Is Bar Selection | `fv[bar_selection]` | radio (Yes/No) | If Yes, customer selects bars from dropdown instead of entering weight manually |
| No of Bars* | `fv[com_bar_no]` | number | How many bar options (e.g., 5 means dropdown shows 1-5 bars) |
| Bar Quantity | `fv[com_bar_quantity]` | number | Weight per bar (e.g., 100 = each bar is 100g) |
| Bar Type | `fv[com_bar_type]` | select (Grams/Kg) | Unit for bar quantity |

**Section 5: Margin Settings** *(Only shown if margin is enabled in general settings)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Margin Type | `fv[com_margin_type]` | select (Percentage/Value) | **Percentage** = margin as % of rate. **Value** = fixed ₹ per kg |
| Margin Value | `fv[com_margin_value]` | number | Margin amount — switches input between percentage (2 digits) and value (10 digits) based on type |

**Section 6: Status & Trading** *(Trading section only shown if `lite_trade` = 1)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Active* | `fv[com_active]` | radio (Yes/No) | Master switch — Yes = commodity visible on rate panel. No = completely hidden. **Deactivating triggers limit order pre-check** |
| Update Trading Status | `add_status` | radio (Yes/No) | If Yes, reveals Sell/Buy controls below — bulk updates all customer trading permissions |
| Sell Status | `enable_commodity_sell` | radio (Enable/Disable) | Enable/disable selling for ALL customers at once |
| Buy Status | `enable_commodity_buy` | radio (Enable/Disable) | Enable/disable buying for ALL customers at once |

**Hidden Fields (Edit mode):**
| Field | Purpose |
|---|---|
| `old_com_name` | Detects name changes for duplicate check |
| `old_order_no` | Detects sequence number changes for duplicate check |

**Safety Guards & Special Behaviors:**

**1. Limit Order Pre-Check (BZ guard):**
When deactivating a commodity (`com_active` → 0), AJAX call to `check_commodity_limits` checks for active limit orders on this commodity. If found → confirmation modal before proceeding.

**2. Duplicate Validation:**
Server-side checks on both `com_name` and `com_order_number` — rejects if either already exists (skips check if value unchanged during edit).

**3. Input Validation:**
- Commodity name: min 4 chars, max 50, no number-only names
- Weight: must be > 0
- Purity: 0-100 with max 2 decimal places
- Sequence: 1-99, unique
- Round-off decimals: 0-5 only

**4. AJAX Save:**
Form submits via AJAX (not page reload) — returns JSON response with success/error messages.

---

### 🛒 MODULE: Booking / Trade Management
**URL (Requests):** `/C_booking/open_listingform/0`
**URL (Limit Orders):** `/C_booking/open_listingform/1`
**Why:** Core trading module. When customer buys/sells gold at current rate, it creates a booking. Admin confirms/rejects/cancels.
**Operations:**
| Action | Method | What happens |
|---|---|---|
| Confirm Request | `DB_Controller(confirm)` | Marks booking as confirmed, deducts margin, sends SMS/WhatsApp/Email, updates stock |
| Reject Request | `DB_Controller(reject)` | Marks booking as rejected, notifies customer |
| Cancel Limit Order | `DB_Controller(cancel)` | Cancels pending limit order, triggers socket update |
| Confirm Limit | `confirmation($id, $liveprice)` | Executes limit order at live price, margin calculation, stock deduction, notifications |
| Inline Edit | `inline_update()` | Edit quantity directly in listing (with min/max validation) |
**Socket Events:** Fires `bookupdate` and `limitupdate` events after confirmation.

---

### 👥 MODULE: Client Management
**URL:** `/C_clients/open_listingform`
**Why:** Clients are the white-label instances (each jeweller). This manages their notification keys, API URLs, alert settings.
**Form Inputs (Verified from live form):**

**Section: Client Details**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Client Name* | `client` | text | Primary white-label client name (e.g., "LMXTRADE") — used in API calls and internal routing |
| Client Code* | `code` | text | Unique identifier for client-specific logic (e.g., "lmxtrade") |
| Client Display Name | `name` | text | Descriptive business name (e.g., "Logimax Bullion") — shown on UI |
| OneSignal ID | `onesignalid` | text | OneSignal App ID — identifies which mobile app to send push notifications to |
| OneSignal API | `onesignalapi` | text | OneSignal REST API key — authenticates push notification requests |
| Firebase Key | `firebaseserverkey` | text | Firebase Cloud Messaging server key — used for Android push fallback |
| SMS Sender ID | `smssenderid` | text | SMS gateway sender ID (e.g., "121") — appears as sender in SMS messages |

**Section: URL Settings**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Base URL* | `baseurl` | text | Root URL of client's frontend (e.g., `http://bullion_v4.logimaxindia.com/`) |
| Order Execute URL* | `orderexeurl` | text | Webhook called when order is executed — triggers push notification to customer |
| Limit Expiry URL* | `limitexpireurl` | text | Endpoint to handle expired limit orders — auto-cancels pending orders after market close |
| Trade On/Off URL* | `tradeonoffurl` | text | Endpoint to toggle trading on/off — instantly enables/disables booking for all users |

**Section: Alert Settings**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Required H/L Alert | radio | Active/Inactive | Master switch — enable/disable high/low price change notifications |
| Gold Up | `higlowalertsettings_gold_up` | number | If gold price goes UP by this amount (₹) from today's open → send alert (e.g., 200) |
| Gold Down | `higlowalertsettings_gold_down` | number | If gold price goes DOWN by this amount → send alert |
| Silver Up | `higlowalertsettings_silver_up` | number | Silver UP alert threshold (e.g., 1000000 = disabled) |
| Silver Down | `higlowalertsettings_silver_down` | number | Silver DOWN alert threshold |

**Section: Contract Mapping**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| MCX Gold Contract* | `gold_contract` | select | Maps to MCX gold symbol (e.g., "GOLDJUN") — which contract month to use for live rate |
| MCX Silver Contract* | `silver_contract` | select | Maps to MCX silver symbol (e.g., "SPOT-SILVER") |
| Bank Gold Contract* | `bank_gold_contract` | text | International/bank gold symbol (e.g., "SPOT-GOLD") — used for bank rate panel |
| Bank Silver Contract* | `bank_silver_contract` | text | International/bank silver symbol |
| Exchange Rate Symbol* | `exchange_rate` | text | Currency conversion symbol (e.g., "SPOT-INR") — USD to INR conversion for international rates |

**Section: System Settings**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Alert Type | radio | MCX/Bank | Which rate source to use for price alerts — MCX (domestic) or Bank (international) |
| Alert Begin/End* | `alert_from`, `alert_to` | time | Active window for sending alerts (e.g., 9:00 AM to 9:00 PM) — no alerts outside trading hours |
| Required Rate Alert | radio | Yes/No | Enable/disable general price movement alerts for this client |
| H/L Rate Display | radio | Yes/No | Show/hide high-low prices on client's website and app UI |
| Status* | radio | Active/Inactive | Overall on/off switch for this client configuration |

---

### 🏷️ MODULE: Commodity Group
**URL:** `/C_com_group/open_listingform`
**Why:** Group commodities together for display on rate panel. Controls how commodities appear grouped on website/app.

### 💎 MODULE: Premium Group
**URL:** `/C_prem_group/open_listingform`
**Why:** Set dealer's premium/margin on top of MCX rate per commodity. E.g., MCX Gold = ₹72,000 + Premium ₹500 = Customer sees ₹72,500.

### 👥 MODULE: Customer Group
**URL:** `/C_customergroup/open_listingform`
**Why:** Group customers for different pricing. VIP customers may get lower premiums than regular customers.

### 🔧 MODULE: Customer Service
**URL:** `/C_customerservice/open_listingform`
**Why:** Configure per-customer notification preferences (SMS, Email, WhatsApp, Push) for different events (booking, confirmation, delivery).

### 📦 MODULE: Customer Delivery
**URL:** `/C_customerDelivery/open_listingform`
**Why:** Track physical gold/silver delivery to customer — dispatch date, receive date, weight, purity. **Largest admin controller (39.8KB).**

### 💰 MODULE: Margin Management
**URL:** `/C_marginmanagement/open_listingform`
**Why:** Track customer deposits/margins. Customer must maintain minimum margin balance to place orders.

### 🔓 MODULE: Unfix Orders
**URL:** `/C_admin_unfix/open_listingform`
**Why:** Handle unfixed/open orders — orders where final rate is not yet locked.

### 📊 MODULE: Rate Panel (R-Panel)
**URL:** `/C_rpanel/open_listingform`
**Why:** Configure the large rate display screen shown in dealer's shop — which commodities to show, layout, bank rates.
**Sub-modules:**
- `/C_rpanel_settings/open_listingform` — R-Panel appearance settings

### 🏦 MODULE: R-Panel Bank Master
**Entry URL:** `/C_rpanelbank/open_entryform/rpanelbank_model/edit/{id}`
**Listing URL:** `/C_rpanelbank/open_listingform`
**Controller:** `C_rpanelbank.php` (308 lines) → Model: `rpanelbank_model`
**DB Table:** `dt_bankcontractmaster`
**Why:** Defines **bank/international rate sources** that feed the dealer's R-Panel. While R-Panel Commodity Type handles MCX (domestic) rates, this module manages **international/bank rates** (SPOT-GOLD, SPOT-SILVER, etc.) and their conversion formulas to arrive at local display rates. **This is where the math happens — raw international price × conversion factor ± extra charges = displayed bank rate.**

**Rate Formula:** `Final Rate = (Bank Contract Price [Operator] Convert Value) [Extra Operator] Extra Charges`
Example: `SPOT-GOLD price × 32.15072 + 500 = Displayed bank gold rate per 10g`

**Form Inputs (Verified from `rpanelbank_entry.php`, 243 lines):**

**Section 1: Identity & Source**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Bank Symbol* | `fv[bcontract_symbol]` | text (max 30) | Display name on R-Panel (e.g., "Gold 9999", "Gold 999", "Silver") — must be unique |
| Bank Contract* | `fv[bcontract_rate]` | select (from DB) | Links to bank/international rate source — which live feed to pull (e.g., SPOT-GOLD, SPOT-SILVER) |

**Section 2: Conversion Engine**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Convert Value* | `fv[bconvert_value]` | number (max 10 digits, 5 decimals) | **Primary conversion factor** — e.g., 32.15072 (troy ounce to grams), or purity multiplier |
| Operator* | `fv[bconvert_value_type]` | select | Math operation for Convert Value: **1=Add (+), 2=Subtract (−), 3=Multiply (×), 4=Divide (÷)**. Most commonly Multiply for unit conversion |
| Extra Charges* | `fv[bextra_charges]` | number (max 10 digits, 5 decimals) | Secondary adjustment — making charges, premium, or fixed spread (e.g., 500.00) |
| Extra Operator* | `fv[bextra_type]` | select | Math operation for Extra Charges: **1=Add (+), 2=Subtract (−), 3=Multiply (×), 4=Divide (÷)**. Most commonly Add for premium/spread |

**Section 3: Ordering & Status**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Sequence Number* | `fv[b_orderno]` | number (1-99) | Display order on bank rate panel — must be unique, ≥ 1 |
| Status* | `fv[bcontract_status]` | radio (Active/Inactive) | Enable/disable this bank rate on R-Panel |

**Edit Mode Hidden Fields:**
| Field | Purpose |
|---|---|
| `old_rbankcom_name` | Tracks original bank symbol name for duplicate change detection |
| `old_rbankorder_no` | Tracks original sequence for duplicate change detection |

**Safety Guards & Validation:**

**1. Duplicate Validation (Server-side):**
- `bcontract_symbol` checked for uniqueness in `dt_bankcontractmaster` (skips if unchanged on edit)
- `b_orderno` checked for uniqueness (skips if unchanged on edit)

**2. Real-time Duplicate Checks (AJAX endpoints):**
- `Chk_Name_Exist()` — instant check when typing bank symbol name
- `Chk_Seq_Exist()` — instant check when entering sequence number

**3. Soft Delete + Activate:**
Unlike other modules, delete = **inactivate** (`"Inactivated successfully!"`), and there's an `activate` operation to re-enable. No hard delete.

**4. AJAX Save:**
Form submits via AJAX — returns JSON `{status, message}` on success/error.

### 📊 MODULE: R-Panel Commodity Type
**Entry URL:** `/C_rpanelcommodity/open_entryform/rpanelcommodity_model/edit/{id}`
**Listing URL:** `/C_rpanelcommodity/open_listingform`
**Controller:** `C_rpanelcommodity.php` (222 lines) → Model: `rpanelcommodity_model`
**DB Table:** `dt_rpanelcommodities`
**Why:** Defines the **commodity groups** that appear on the admin R-Panel. This is the bridge between MCX/Bank contract symbols and internal commodity names. When commodities (Gold 999, Silver, etc.) are created in Commodity Master, they link to an R-Panel Commodity Type via `com_type`. **This determines which MCX/Bank rate feeds each commodity group. Wrong mapping = wrong live rates.**

**Relationship Chain:** `MCX Symbol` → `R-Panel Commodity Type` → `Commodity Master` → `Customer Rate Panel`

**Form Inputs (Verified from `rpanelcommodity_entry.php`, 312 lines):**

**Section 1: Identity**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Display Name* | `fv[rcom_disname]` | text (max 50) | Name shown on R-Panel (e.g., "Gold-1", "Gold-2", "Silver") — must be unique, no dots/spaces |
| Commodity Type | `fv[rcom_comtype]` | radio (Gold/Silver) | Classifies this group as Gold (0) or Silver (1) — used for rate source routing and alert categorization |

**Section 2: Rate Source Mapping**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| MCX Symbol* | `fv[rcom_mcxsymbol]` | select (from `dt_contractmaster`) | Links to MCX contract (e.g., "GOLDM", "SILVERM") — **this is how live domestic MCX rates flow into this group** |
| Bank Symbol* | `fv[rcom_banksymbol]` | select (from bank contracts) | Links to bank/international contract (e.g., "SPOT-GOLD", "SPOT-SILVER") — used when rate source is Bank |

**Section 3: Tax Configuration**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Sell Tax %* | `fv[rcom_sell_tax]` | number (0-100, 2 decimals) | GST percentage applied when customer **sells** (e.g., 3.00 = 3% GST on sell transactions) |
| Buy Tax %* | `fv[rcom_buy_tax]` | number (0-100, 2 decimals) | GST percentage applied when customer **buys** (e.g., 3.00 = 3% GST on buy transactions) |
| Sell TCS %* | `fv[rcom_sell_tcs]` | number (0-100, 2 decimals) | Tax Collected at Source on sell — additional tax deducted at source per government mandate |
| Buy TCS %* | `fv[rcom_buy_tcs]` | number (0-100, 2 decimals) | Tax Collected at Source on buy — additional tax deducted at source per government mandate |

**Section 4: Ordering & Status**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Sequence Number* | `fv[rcom_orderno]` | number (1-99) | Display order on R-Panel — must be unique, ≥ 1 |
| Active | `fv[rcom_status]` | radio (Yes/No) | Enable/disable this commodity type on R-Panel |

**Hidden Fields (currently in UI but display:none):**
| Field | Input Name | Purpose |
|---|---|---|
| Contract Name | `fv[rcom_contname]` | Legacy field — display name for contract (no longer shown) |
| Contract Active | `fv[rcom_contdisplay]` | Legacy toggle — enable/disable contract display (no longer shown) |

**Edit Mode Hidden Fields:**
| Field | Purpose |
|---|---|
| `old_rcom_name` | Tracks original name for duplicate change detection |
| `old_rcomorder_no` | Tracks original sequence for duplicate change detection |

**Safety Guards & Validation:**

**1. Duplicate Validation (Server-side):**
- `rcom_disname` checked for uniqueness (skips if unchanged on edit)
- `rcom_orderno` checked for uniqueness (skips if unchanged on edit)

**2. Tax Percentage Validation (BZ-07):**
Server-side caps all 4 tax fields (sell_tax, buy_tax, sell_tcs, buy_tcs) between 0-100%. Client-side also validates before submit.

**3. Sequence Number Validation:**
Client-side: must be > 0. Server-side: unique across all records.

**4. AJAX Save:**
Form submits via AJAX — returns JSON `{status, redirect}` on success or `{status, message}` on error.

### ⚙️ MODULE: General Settings (Admin R-Panel)
**URL:** `/C_admin_rpanel/general_entry_form`
**Controller:** `C_admin_rpanel.php` → saves via `DB_Controller` with `id=2` (general mode)
**Why:** **THE MOST CRITICAL SETTINGS PAGE.** Controls trading rules, quantity limits, auto-scheduling, notifications, tolerance, and hedging for the entire platform. Changing any setting here affects ALL users instantly.

**Form Inputs (Verified from source — `admingeneral_entry.php`, 1573 lines):**

**Section 1: Company & Mail/SMS Credentials**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Company Name* | `fv[admin_company_name]` | text (50) | Business name used in emails, SMS, and branding across the platform |
| Mail Server Name | `fv[admin_mail_server]` | text (100) | SMTP server address for sending emails — no spaces allowed |
| Mail Server Password* | `fv[admin_mail_password]` | password (50) | SMTP auth password — min 6 chars |
| SMS Username | `fv[admin_sms_username]` | text (50) | SMS gateway login — used for OTP and order notifications |
| SMS Password* | `fv[admin_sms_password]` | password (50) | SMS gateway auth password |
| SMS Auth Key | `fv[admin_sms_authkey]` | text (100) | SMS API authentication key (MSG91 / provider-specific) |

**Section 2: Display Toggles** *(Super-admin only, hidden for sub-admins)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Display Silver Rate | `fv[admin_is_silver]` | radio (Yes/No) | Show/hide silver commodities entirely from website and app |
| Display Coin Rate | `fv[admin_is_coin]` | radio (Yes/No) | Show/hide coin rates on rate panel |
| Login Page | `fv[admin_booking]` | radio (Yes/No) | Enable/disable user login page — if No, site is rate-only (no trading) |
| Is Trade | `fv[lite_trade]` | radio (Yes/No) | Master toggle — if No, booking/ordering is completely disabled |

**Section 3: Order Confirmation Mode** *(Only if trading is enabled)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Auto (Customer)* | `fv[confirmation_for]` | radio (Hold/Confirmation) | **Hold** = customer order goes to admin queue for manual approval. **Confirmation** = auto-confirms at current rate immediately |
| Auto (Admin)* | `fv[confirmation_admin]` | radio (Hold/Confirmation) | Same as above but for phone bookings (admin placing order on behalf of customer) |

**Section 4: Quantity Controls per Booking** *(checkbox + number input — checkbox enables/disables the limit)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Gold Min Qty / Book | `fv[has_gminqty]` + `fv[gold_min_qty]` | checkbox + number | Minimum grams of gold per single booking (e.g., min 1g) — prevents micro-orders |
| Silver Min Qty / Book | `fv[has_sminqty]` + `fv[silver_min_qty]` | checkbox + number | Minimum grams of silver per booking |
| Gold Max Qty / Book | `fv[has_gmaxqty]` + `fv[gold_max_qty]` | checkbox + number | Maximum grams of gold per single booking — prevents oversized orders |
| Silver Max Qty / Book | `fv[has_smaxqty]` + `fv[silver_max_qty]` | checkbox + number | Maximum grams of silver per booking |
| Gold Max Allotted Qty | `fv[has_gallot_qty]` + `fv[gold_allot_qty]` | checkbox + number | Total daily gold allocation limit — once reached, no more gold bookings accepted |
| Silver Max Allotted Qty | `fv[has_sallot_qty]` + `fv[silver_allot_qty]` | checkbox + number | Total daily silver allocation limit |
| Max Allowed Limit Orders | `fv[max_order]` | number (2 digits) | Max pending limit orders per user at any time (e.g., 5) |

**Validation Rules:** Max Qty cannot exceed Max Allotted Qty. Min Qty must be < Max Qty. All values must be ≥ 1 when enabled.

**Section 5: MJDTA Difference**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| MJDTA Gold Difference | `fv[mjdta_gold_diff]` | number | Rate adjustment for MJDTA (association) gold pricing — added/subtracted from base rate |
| MJDTA Silver Difference | `fv[mjdta_silver_diff]` | number | Same for silver |

**Section 6: Auto-Scheduling (Trade & Market On/Off)**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Limit Cancellation* | `fv[limit_cancellation]` | radio (Manual/Auto) | **Manual** = admin cancels expired limits manually. **Auto** = system auto-cancels at specified time |
| Limit Cancel Time | `fv[limitcancel_time]` | timepicker | Time to auto-cancel pending limit orders (shown only if Auto) |
| Trade On* | `fv[trade_on]` | radio (Manual/Auto) | **Manual** = admin opens trading manually each day. **Auto** = system opens at scheduled time |
| Trade On Time | `fv[trade_on_time]` | timepicker | Auto trade start time (e.g., 9:00 AM). Weekends off by default |
| Trade Off* | `fv[trade_off]` | radio (Manual/Auto) | Same for closing trading hours |
| Trade Off Time | `fv[trade_off_time]` | timepicker | Auto trade end time (e.g., 11:30 PM) |
| Market On* | `fv[market_on]` | radio (Manual/Auto) | Controls rate display (market = rates visible, trade = orders possible) |
| Market On Time | `fv[market_on_time]` | timepicker | When to start showing live rates |
| Market Off* | `fv[market_off]` | radio (Manual/Auto) | When to stop showing live rates |
| Market Off Time | `fv[market_off_time]` | timepicker | Rate display off time |

**Section 7: Margin Settings**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Enable Margin* | `fv[display_margin]` | radio (Yes/No) | Enable margin-based trading — customer must deposit money before buying |
| Margin Squareoff* | `fv[margin_reverse_type]` | radio (Yes/No) | If Yes, when margin falls below threshold, auto-squareoff (force-sell) customer's position |

**Section 8: Misc Controls**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Trade History (days) | `fv[expire_history]` + `fv[days_expire]` | checkbox + number | Limit how many days of trade history users can see (e.g., 30 days) |
| Auto Refresh | `fv[auto_refresh]` | number (3 digits) | Admin panel auto-refresh interval in minutes — keeps booking list updated |
| Display Limit Order Page* | `fv[limit_enable]` | radio (Yes/No) | Show/hide limit order page in customer app |
| Display Client Limit* | `fv[clientlimit_enable]` | radio (Yes/No) | Show customer's own limit order list in their profile |
| TCS/TDS Hint | `fv[admin_tcstdshint]` | text (200) | Tax hint message displayed during booking (e.g., "TCS @1% applicable above ₹2L") |
| Stock Manage | `fv[admin_stockmanage]` | text | Stock management threshold value |

**Section 9: Booking Alert (Admin Notification Numbers)**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Admin Mobile 1-5 | `fv[admin_mob1]` to `fv[admin_mob5]` | phone + country select | Admin phone numbers that receive SMS/WhatsApp alerts on every new booking |
| Enable Mobile 1-5 | `fv[is_admin_mob1]` to `fv[is_admin_mob5]` | checkbox | Toggle each mobile number on/off |
| Enquiry Mail To | `fv[admin_mail]` | email | Email address for customer enquiry form submissions |

**Section 10: Tolerance (Order Execution Buffer)**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| High (Gold) | `tol_gold_high` | number (%) | If gold price moves UP by this % after order placement, still execute the order |
| Low (Gold) | `tol_gold_low` | number (%) | If gold price moves DOWN by this %, still execute |
| High (Silver) | `tol_silver_high` | number (%) | Silver upward tolerance |
| Low (Silver) | `tol_silver_low` | number (%) | Silver downward tolerance |
| Cancel Limit Gold (₹) | `fv[limitcancel_goldtol]` | number | If gold rate moves beyond this ₹ value, auto-cancel the limit order |
| Cancel Limit Silver (₹) | `fv[limitcancel_silvertol]` | number | Same for silver |

**Section 11: Hedging Details** *(Super-admin only)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Enable Gold Hedge | `fv[is_hedge_gold]` | radio (Yes/No) | Auto-hedge gold orders on MCX — when customer buys, system auto-buys on exchange |
| Enable Silver Hedge | `fv[is_hedge_silver]` | radio (Yes/No) | Same for silver |
| Gold Hedge Min Lot | `fv[gold_hedge_lot_qty]` | number (grams) | Minimum lot size for gold hedge order on MCX |
| Silver Hedge Min Lot | `fv[silver_hedge_lot_qty]` | number (grams) | Minimum lot size for silver hedge |
| Gold Hedge Adjusted Qty | `fv[gold_booking_adjusted_qty]` | number (grams) | Rounding unit for gold hedge (e.g., 10g → 53g rounds to 50g, 57g rounds to 60g) |
| Silver Hedge Adjusted Qty | `fv[silver_booking_adjusted_qty]` | number (grams) | Same rounding for silver |

### 📊 MODULE: Rate History
**URL:** `/C_rate_history/open_listingform`
**Why:** View historical rate data — gold/silver rates over time. Useful for dealer's analysis.

### 📰 MODULE: News
**URL:** `/C_news/open_listingform`
**Why:** Post market news/announcements. Displayed on website and mobile app. Broadcast via socket in real-time.

### 📢 MODULE: Marquee Text
**URL:** `/C_marqueetext/open_listingform`
**Why:** Scrolling text ticker on website/app. Used for quick announcements. Changes broadcast instantly via socket.

### 🖼️ MODULE: Gallery
**URL:** `/C_gallery/open_listingform`
**Why:** Upload product images/showroom photos. Displayed on website and app.

### 📢 MODULE: Advertisements
**URL:** `/C_advertisements/open_listingform`
**Why:** Banner ads for website and app. Image upload with active/inactive toggle.

### 💬 MODULE: Popup
**URL:** `/C_popup/open_listingform`
**Why:** Popup messages shown on app/web open — for announcements, offers, warnings.

### 📱 MODULE: App Events & Videos
**URL (Events):** `/C_appevents/open_listingform`
**URL (Videos):** `/C_appvideos/open_listingform`
**Why:** Event cards and video links shown on mobile app home screen.

### 📄 MODULE: CMS Pages
**URL:** `/C_other_pages/open_listingform`
**Why:** Edit About Us, Terms, Privacy Policy, Disclaimer content via rich text editor.

### 🏷️ MODULE: Product & Category
**URL:** `/C_categories/open_listingform` | `/C_product/open_listingform`
**Why:** Product catalog — physical gold/silver items for sale (coins, bars, ornaments).

### 📍 MODULE: Area Management
**URL:** `/C_area/open_listingform`
**Why:** Manage service areas/locations for delivery coverage.

### 📱 MODULE: User Registration (Admin) / Trader Account Activation
**Listing URL:** `/C_userregistration/open_listingform`
**Activation URL:** `/C_userregistration/open_activateentryform/Userregistration_model/{cus_id}`
**Entry URL:** `/C_userregistration/open_entryform/Userregistration_model/edit/{cus_id}`
**Controller:** `C_userregistration.php` (530 lines) → Model: `Userregistration_model`
**Why:** Central hub for managing trader (end-user) accounts. Admin registers new traders, activates/deactivates accounts, controls per-trader commodity permissions, and sets individual quantity limits. **The activation form is the most operationally used — every new user signup lands here for approval.**

**The Activation Form (`open_activateentryform`) — Inputs verified from `userregistrationactivate_entry.php` (618 lines):**

**Section 1: Account Identity (Read-only display)**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Trader ID | `fv[cus_id]` | hidden + disabled display | Internal customer ID (auto-generated) — shown for reference, not editable |
| Trader Name | *(display only)* | disabled text | Shows trader name from registration — read-only context |

**Section 2: Account Validity**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Life time validity | `fv[cus_is_life_time]` | checkbox | If checked, account never expires. If unchecked, "Valid till" date becomes mandatory |
| Valid till | `fv[cus_valid_till]` | datepicker (DD-MM-YYYY) | Account expiry date — past dates are rejected. Hidden when lifetime is checked |

**Section 3: Account Controls**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Active* | `fv[cus_active]` | radio (Yes/No) | **Master switch** — Yes = trader can login and trade. No = account locked, cannot login. **Cannot deactivate if trader has pending deliveries (BZ-25 guard)** |
| Limit Enable* | `fv[cus_limitenable]` | radio (Yes/No) | Allow/disallow limit orders for this trader. Disabling auto-cancels any active limit orders (with confirmation popup) |
| Opening Balance | `fv[opening_balance]` | number (hidden) | Initial margin balance — currently hidden in UI but still exists in form |

**Section 4: Quantity Controls per Trader** *(Override global settings for this specific trader)*
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Gold Min Qty / Book | `fv[has_gminqty]` + `fv[gold_min_qty]` | checkbox + number | Per-trader gold minimum grams per booking — overrides global setting |
| Silver Min Qty / Book | `fv[has_sminqty]` + `fv[silver_min_qty]` | checkbox + number | Per-trader silver minimum per booking |
| Gold Max Qty / Book | `fv[has_gmaxqty]` + `fv[gold_max_qty]` | checkbox + number | Per-trader gold maximum per booking |
| Silver Max Qty / Book | `fv[has_smaxqty]` + `fv[silver_max_qty]` | checkbox + number | Per-trader silver maximum per booking |
| Gold Max Allotted Qty | `fv[has_gallot_qty]` + `fv[gold_allot_qty]` | checkbox + number | Per-trader daily gold allocation cap |
| Silver Max Allotted Qty | `fv[has_sallot_qty]` + `fv[silver_allot_qty]` | checkbox + number | Per-trader daily silver allocation cap |

**Validation Rules:** Same as General Settings — Min < Max, Allotted ≥ Max. Values must be ≥ 1 when enabled.

**Section 5: Notification Preferences**
| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Send SMS | `fv[cus_sms_status]` | checkbox | Enable SMS notifications (OTP, booking alerts) for this trader |
| Send Email | `fv[cus_email_status]` | checkbox | Enable email notifications for this trader |

**Section 6: Commodity Activity Table** *(Dynamic — rows from `dt_commodity` table)*
| Column | Input Name | Type | Purpose |
|---|---|---|---|
| Commodity | `cdItems[com_id][]` | hidden (per row) | Links each row to a commodity ID (e.g., Gold 999, Silver, Gold Petal) |
| Status (Buy) | `cdItems[cus_com_status_buy][{i}]` | checkbox | Allow this trader to **BUY** this commodity. Header has "Select All" checkbox |
| Status (Sell) | `cdItems[cus_com_status_sell][{i}]` | checkbox | Allow this trader to **SELL** this commodity. Header has "Select All" checkbox |
| Min. Order Qty | `cdItems[cus_com_smoq][]` | number (hidden) | Per-commodity minimum order qty — currently hidden in UI |
| Max. Order Qty | `cdItems[cus_com_pmoq][]` | number (hidden) | Per-commodity maximum order qty — currently hidden in UI |
| Amount Purchase | `cdItems[cus_com_amountpurch][{i}]` | checkbox (hidden) | Allow amount-based purchase — currently hidden in UI |

**Special Behaviors & Safety Guards:**

**1. Limit Order Pre-Check (BZ guard):**
Before form submits, an AJAX call to `check_customer_limits` checks for active limit orders that would be affected by changes. Triggers include:
- Deactivating the account (`cus_active` → 0)
- Disabling limit orders (`cus_limitenable` → 0)
- Disabling buy/sell for a commodity that has active limit orders
If found → confirmation modal: *"Found X active limit order(s). These orders will be cancelled. Do you want to continue?"*

**2. Pending Delivery Block (BZ-25):**
Cannot deactivate a trader who has pending deliveries (`dt_booking` with undelivered qty > 0). Server-side guard returns error: *"Cannot deactivate: this trader has pending deliveries."*

**3. Bulk Operations (from listing page):**
| Action | Endpoint | Purpose |
|---|---|---|
| Bulk Activate | `activateMultipleCustomers` | Activate multiple selected traders at once + send SMS/Email/WhatsApp |
| Bulk Disable | `disableMultipleCustomers` | Disable multiple traders — also blocked by pending delivery check |
| Bulk Delete | `delete_multiple_customer` | Hard delete multiple traders |

**4. Duplicate Checks (on add):**
Server-side uniqueness validation on: Mobile, Email, Login Name, WhatsApp, PAN, GST — prevents duplicate registrations.

**5. Notifications on Activation:**
When activated, system sends **Email + SMS + WhatsApp + WhatsApp Meta** notifications with credentials to the trader. Service IDs: 1=registration, 2=activation, 3=profile update.

### ⚙️ MODULE: Settings
| URL | Purpose |
|---|---|
| `/C_generalsettings/open_listingform` | Trading on/off, lite trade mode, stock management |
| `/C_logo_settings/open_listingform` | Logo, favicon, header/footer images |
| `/C_maintenance_settings/open_listingform` | Maintenance mode, app force update |
| `/C_email_settings/open_listingform` | SMTP config for email notifications |
| `/C_sms_settings/open_listingform` | SMS gateway configuration |
| `/C_sms_api/open_listingform` | SMS API credentials |
| `/C_whatsapp_settings/open_listingform` | WhatsApp API (Creative Point) config |
| `/C_whatsappmeta_settings/open_listingform` | WhatsApp Meta API config |
| `/C_change_psw/open_listingform` | Admin password change |

### 📊 MODULE: Reports
| URL | Purpose |
|---|---|
| `/C_booking_report/open_listingform` | Booking/trade reports (PDF/Excel) |
| `/C_booking_delivery/open_listingform` | Delivery reports |
| `/C_ratealert_report/open_listingform` | Rate alert trigger reports |
| Admin views: `today_trade.php`, `trading_status.php` | Today's trade view, live trading status |
| Admin views: `customer_ledger.php`, `coverupreport.php` | Customer ledger, cover-up reports |

### 📊 MODULE: Hedge Management
**URL:** `/C_hedgemaster/open_listingform`
**Why:** Auto-hedge customer orders on MCX via Motilal Oswal / MT5. When customer buys 100g gold, system auto-buys on MCX.

### 🔐 MODULE: Contract Master
**URL:** `/C_contract_master/open_entryform/contractmodel/edit/{id}`
**Listing URL:** `/C_contract_master/openlist_form`
**Controller:** `C_contract_master.php` → Model: `contractmodel`
**Why:** Maps **MCX contract symbols** (e.g., `GOLDM`, `SILVERM`, `GOLDPETAL`) to **display names** shown on the R-Panel and user-facing pages. MCX contracts expire monthly — when a contract rolls over, admin updates this to point to the new month's contract. **Without correct mapping here, rates will stop flowing.**

**Form Inputs (Verified from `contractmasterentry.php`, 324 lines):**

| Field | Input Name | Type | Purpose |
|---|---|---|---|
| Contract Symbol* | `fv[contract_symbol]` | select (from DB) | MCX raw symbol to subscribe to (e.g., `GOLDM`, `SILVERM`, `GOLDPETAL`). Dropdown is populated from `dt_contractsymbol` table |
| R-Panel Display Name* | `fv[displayname]` | text (20) | Name shown on the dealer's R-Panel TV display (e.g., "Gold 999", "Silver") |
| Type* | `fv[ctype]` | select (MCX/Bank/Others) | Source of rate data — **MCX** (1) = domestic exchange, **Bank** (2) = international/bank rate, **Others** (3) = custom |
| R-Panel Display Order* | `fv[displayorder]` | number (2 digits) | Sort position on R-Panel — determines which commodity appears first on the TV display |
| Userpage Display Name* | `fv[userpage_displayname]` | text (20) | Name shown on customer-facing website and mobile app (e.g., "Gold 24K", "Silver") |
| Userpage Display Order* | `fv[userpage_disp_order]` | number (2 digits) | Sort position on customer website/app rate list |
| R-Panel Contract Status* | `fv[status]` | radio (Yes/No) | Show/hide this contract on the R-Panel display. If No, this commodity disappears from dealer's TV |
| Userpage Display Status* | `fv[userpage_status]` | radio (Yes/No) | Show/hide this contract on customer website and app |
| No of Decimals in User page* | `fv[round_off]` | number (1 digit) | Decimal precision for rate display (e.g., 2 = ₹72,450.**50**, 0 = ₹72,450) |
| Commodity Type* | `fv[com_type]` | select (GOLD/SILVER) | Category — determines which premium group and alert settings apply to this contract |
| Arbitrary Chart Status* | `fv[aribitchart_status]` | radio (Yes/No) | Enable/disable chart display for this commodity on the rate page |

**Hidden Fields (Edit mode — for change tracking):**
| Field | Purpose |
|---|---|
| `old_displayname` | Detects R-Panel name changes for audit |
| `old_userpage_displayname` | Detects userpage name changes |
| `old_displayorder` | Detects display order changes |
| `old_userpage_disp_order` | Detects userpage order changes |

**Special Behavior: R-Panel Rate ON/OFF Modal**
When saving, the system checks if R-Panel rate display (`rate_display`) is currently ON via AJAX call to `get_rpanel_data`. If rates are live on R-Panel:
- A **modal popup** appears asking: "Save with R-Panel rate ON or OFF?"
- **ON** → Saves contract AND keeps R-Panel rates live (`enable_rpanelrateon/1`)
- **OFF** → Saves contract AND turns off R-Panel rates (`enable_rpanelrateoff/0`)
- **Cancel** → Just closes the dialog, nothing saves

**Related Module:**
| URL | Purpose |
|---|---|
| `/C_contractsymbol/open_listingform` | Manage the raw MCX symbol list (the dropdown options for Contract Symbol above) |

### 📋 MODULE: Admin Logs
**URL:** `/C_admin_log/open_listingform`
**Why:** Audit trail — who logged in, what changes were made, IP tracking.

---

## 6. 📁 COMPLETE DIRECTORY STRUCTURE (Explained)

```
/var/www/html/maharaj/
│
├── global_configs.php        ← 🔑 MASTER CONFIG FILE
│                               (DB creds, URLs, socket config, API keys,
│                                encryption keys, notification settings —
│                                THIS IS THE FIRST FILE TO EDIT for new client)
│
├── index.php                 ← CodeIgniter 3 entry point (web client)
│
├── application/              ← 📦 WEB CLIENT (CodeIgniter 3)
│   ├── controllers/          ← 12 PHP controllers (business logic)
│   ├── models/               ← 12 PHP models (database queries)
│   ├── views/                ← 30 PHP views (HTML templates)
│   ├── config/
│   │   ├── routes.php        ← URL routing (default: C_booking)
│   │   ├── database.php      ← DB connection (reads global_configs.php)
│   │   └── autoload.php      ← Auto-loaded libraries/helpers
│   ├── libraries/            ← Custom PHP libraries
│   └── helpers/              ← Custom helper functions
│
├── admin/                    ← 🛡️ ADMIN PANEL (Separate CI3 app)
│   ├── index.php             ← Admin entry point
│   └── application/
│       ├── controllers/      ← 57 controllers!
│       ├── models/           ← 59 models
│       └── views/            ← 146 views (entries + listings + reports)
│
├── api/                      ← 🌐 STATIC API (Simple PHP files → JSON)
│   ├── getsettings.php       ← App config (versions, features flags)
│   ├── rates.php             ← Current rates
│   ├── bankdetails.php       ← Bank info
│   ├── contactusdetails.php  ← Contact info
│   └── ...12 files total
│
├── mobileapi/                ← 📱 MOBILE APP API (CI3)
│   └── application/
│       ├── controllers/      ← 4 controllers (client, admin, trade)
│       └── models/           ← 5 models (90KB+ — very heavy!)
│
├── client/                   ← 🔌 CLIENT-SIDE FILES
│   ├── maharaj-ws.js         ← Native WebSocket server (Node.js)
│   ├── maharaj.txt           ← Live rate data (text, tab-separated)
│   ├── maharaj.enc           ← Encrypted rate data
│   └── maharaj.js            ← Legacy JS socket client
│
├── lmxtrade/                 ← ⚡ RATE ENGINE
│   ├── maharajwinlitesocket.js  ← Socket.io server (Node.js)
│   ├── package.json          ← Node dependencies
│   └── winbullliteapi/       ← Laravel Lumen API
│       ├── .env              ← Redis, Mail config
│       ├── artisan           ← Lumen CLI
│       ├── routes/web.php    ← 35+ API routes
│       └── app/
│           ├── Http/Controllers/  ← 5 controllers
│           ├── Events/            ← 9 broadcast events
│           ├── Jobs/              ← 8 queue jobs
│           └── Models/
│
├── assets/                   ← 🎨 STATIC FILES
│   ├── css/                  ← Stylesheets
│   ├── js/                   ← JavaScript
│   ├── images/               ← Images
│   └── fonts/                ← Fonts
│
└── logs/                     ← 📝 Application logs
```

---

## 7. ⚠️ TROUBLESHOOTING GUIDE

| Problem | Cause | Fix |
|---|---|---|
| Rates not updating (web) | WS server down / maharaj.txt not updating | `pm2 status` → restart maharaj-ws |
| Rates not updating (app) | Same as above + check native socket URL | Check global_configs `$nativesocketurl` |
| Admin login fails | DB connection / wrong credentials | Check `global_configs.php` DB settings |
| 500 Internal Server Error | PHP error | Check `/application/logs/` for error details |
| Mobile app "No Data" | API endpoint returning error | Test `/mobileapi/` endpoints manually |
| Push notification not working | OneSignal key expired/wrong | Update `$app_id` and `$onesignalauth` |
| Queue jobs stuck | Redis down / worker crashed | `pm2 restart maharaj-queue`, check Redis |
| New user can't register | OTP service down | Check SMS settings in admin panel |
| Socket keeps disconnecting | NGINX proxy timeout | Add `proxy_read_timeout 86400s;` in NGINX |

---

## 8. 🆕 NEW CLIENT DEPLOYMENT (Step-by-Step)

```
Step 1:  Clone codebase → cp -r maharaj/ newclient/
Step 2:  Create new database → mysql: CREATE DATABASE newclient;
Step 3:  Import schema → mysql newclient < maharaj_schema.sql
Step 4:  Edit global_configs.php (ALL variables)
Step 5:  Edit lmxtrade/winbullliteapi/.env (Redis, Mail)
Step 6:  Edit client/newclient-ws.js (PORT, FILE_PATH)
Step 7:  NGINX → create server block for new domain
Step 8:  SSL → certbot --nginx -d newdomain.com
Step 9:  PM2 → register WS + Socket + Queue processes
Step 10: DNS → point domain to server IP
Step 11: Test → rates, login, admin, mobile API
Step 12: OneSignal → create new app, update keys
```

---

*End of KT Document — Mathiyam Bullion (Maharaj Gold Smith)*
*For questions: Elavarasan (elavarasanofficials@gmail.com) | Logimax India*
