# Winbull Staging — Architecture & Config

## Environment
- **URL**: `http://bullionstaging_v4.logimaxindia.com/`
- **Server Path**: `/var/www/html/winbullstaging/`
- **Timezone**: `Asia/Kolkata`
- **Framework**: CodeIgniter 3 (web/admin/mobile) + Lumen 10 (rate engine)

## Global Config (`global_configs.php`) — The Single Source of Truth
Every CI instance includes this. Key settings:

| Key | Value | Purpose |
|-----|-------|---------|
| `hostname` | AWS RDS `ap-south-1` | MySQL database |
| `database` | `winbullstaging` | DB name |
| `username` | `demotrade` | DB user |
| `$websocket_type` | `2` = Native Socket | Socket selection |
| `$rate_type_web` | `2` (WebSocket) | Web rate delivery |
| `$rate_type_app` | `4` (NativeSocket) | App rate delivery |
| `$key` | `12@^tyh8901tt56789012345$y89012` | AES-256 encryption key |
| `$path` | `/var/www/html/winbullstaging/client/winbullstaging.enc` | Encrypted rate file |
| `$bookupdate` | Lumen API URL | Book event trigger |
| `$limitupdate` | Lumen API URL | Limit order event trigger |
| `$marqueeupdate` | Lumen API URL | Marquee/user event trigger |
| `$lsrateurl` | `http://72.52.178.11:8080` | LightStreamer MCX feed |
| `$lsrateadapter` | `WLSTOCKLIST_REMOTE` | LS adapter |
| `$bcurl` / `$bcsrurl` | External rate APIs | Historical / source rates |

## Database Tables (Inferred from code — `dt_` prefix pattern)
| Domain | Tables |
|--------|--------|
| **Users** | `dt_customer`, `dt_customer_login`, `dt_devices` |
| **Trading** | `dt_booking`, `dt_transaction`, `dt_booking_log` |
| **Commodities** | `dt_com_master`, `dt_com_group`, `dt_rpanelcommodities`, `dt_contract_master` |
| **Pricing** | `dt_rpanel`, `dt_r_panel`, `dt_ratealert`, `dt_historicaldata`, `dt_daily_averages` |
| **Content** | `dt_news`, `dt_marqueetext`, `dt_advertisements`, `dt_popup`, `dt_gallery` |
| **Config** | `dt_generalsettings`, `dt_sms_settings`, `dt_email_settings` |
| **Logs** | `dt_adminlog`, `dt_sms_log` |
| **Quotation** | `dt_quotation`, `dt_country` |

## Rate Pipeline Architecture
```
LightStreamer (72.52.178.11:8080)
  → Lumen BroadcastRatesController.updatesourcerates()
    → Process premiums via calculate_mcx_rates() / calculate_bank_rates()
    → Write to winbullstaging.txt (TSV format)
    → Write encrypted to winbullstaging.enc (AES-256-CBC)
  → NativeSocket.js fs.watch() detects change
    → Parse TSV, diff against lastStateMap
    → Broadcast delta to connected WebSocket clients (port 57134)
```

## Multi-Instance CI Architecture
```
winbullstaging/
├── system/              # Shared CI 3 core
├── application/         # WEB instance (default route: C_booking)
├── admin/application/   # ADMIN instance (default route: C_main)
├── mobileapi/application/ # MOBILE API instance (REST API)
└── lmxtrade/winbullliteapi/ # Lumen 10 (separate framework)
```
Each instance has its own `index.php` front controller but shares `system/` and `global_configs.php`.

## Infrastructure Dependencies
| Service | Endpoint | Purpose |
|---------|----------|---------|
| AWS RDS | `ls-ed7d...rds.amazonaws.com` | MySQL DB |
| AWS ElastiCache | `prod-cluster-001.78ozga...` | Redis |
| LightStreamer | `72.52.178.11:8080` | MCX rates |
| Mailgun | SaaS (via Lumen) | Transactional email |
| OneSignal | SaaS | Push notifications |
| WhatsApp API | `whatsappsms.creativepoint.in` | WhatsApp messages |

## Security Notes
- `.htaccess` redirects HTTPS → HTTP (staging only!)
- Socket auth: SHA-256 token from `logiMax@916#socket`
- Passwords stored as plaintext in `dt_customer.cus_login_password` (NO HASHING!)
- Encryption key hardcoded in global_configs AND in C_client_main.getRate()
