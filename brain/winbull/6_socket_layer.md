# Winbull Staging — Socket Layer

## Architecture
Two WebSocket implementations exist:
1. **WinbullstagingNativeSocket.js** (13.6KB, 421 lines) — **ACTIVE** (production)
2. **WinbullstagingSocket.js** (2.8KB) — Legacy Socket.io version (deprecated)

## Native WebSocket Server (`WinbullstagingNativeSocket.js`)

### Configuration
```javascript
PORT: 57134
FILE_PATH: "/var/www/html/winbullstaging/client/winbullstaging.txt"
SECRET: "logiMax@916#socket"
HEARTBEAT_INTERVAL: 30000  // 30s ping/pong
FILE_WATCH_DEBOUNCE: 50    // 50ms debounce
INITIAL_SYNC_DELAY: 100    // 100ms initial data send
```

### Token Authentication
- SHA-256 hash of `logiMax@916#socket`
- Passed as WebSocket sub-protocol during handshake
- Token available via HTTP: `GET /token`

### HTTP Endpoints
| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Health check → `"OK"` |
| `GET /stats` | JSON stats (clients, uptime, connections) |
| `GET /token` | ⚠️ Returns the auth token (DEBUG ONLY!) |

### Data Flow
```
Lumen writes → winbullstaging.txt (TSV format)
  → fs.watch() detects file change
  → broadcastRate() reads file
  → processLine() parses each TSV line
  → Compares against lastStateMap for diffs
  → Broadcasts only changed lines to clients
```

### TSV Line Format (winbullstaging.txt)
```
TYPE\tID\tNAME\tBID\tASK\tHIGH\tLOW
```

| Type | Meaning |
|------|---------|
| `1` | MCX source rates (Gold/Silver/INR) |
| `2` | Client commodity rates (processed) |
| `3` | Status data (trading/market status) |
| `4` | Control data (user termination, config) |

### Rate Processing Logic
- **Type 1**: MCX base rates → ID cleaned to G (Gold), S (Silver), I (INR)
- **Type 2**: Client commodity rates → Full: `2|name|bid|ask|high|low`, Delta: `2|name|bid|ask`
- **Type 3**: Status → `3|id|field3|field4`
- **Type 4**: Control → `4|id|field3|field4|field5`

### Delta Optimization
- Full state stored in `lastStateMap` (Map object)
- Only changed lines broadcast to clients
- High/Low values only sent when changed (bandwidth optimization)
- If state structure changes (new keys added/removed) → full reset broadcast ("R" message)

### Connection Lifecycle
```
Client connects → handleProtocols validates token
  → On valid: ws.isAlive=true, initial full state sent
  → Triple-send strategy: send immediately + delayed resend at 100ms
  → Heartbeat: every 30s ping/pong
  → Dead connections terminated on missed pong
  → Graceful shutdown on SIGTERM/SIGINT
```

### Message Protocol
| Direction | Message | Meaning |
|-----------|---------|---------|
| Server→Client | `R` | Full state reset signal |
| Server→Client | `2\|GOLD\|5000\|5001\|5050\|4950` | Rate update |
| Client→Server | `ping` | Heartbeat ping |
| Server→Client | `pong` | Heartbeat response |

### Monitoring
```bash
# Health check
curl http://localhost:57134/health

# Stats (JSON: clients, uptime, state size, connections)
curl http://localhost:57134/stats

# Process management
pm2 start WinbullstagingNativeSocket.js --name winbullstaging-ws
pm2 restart winbullstaging-ws
```

## Encrypted Rate File (winbullstaging.enc)
- AES-256-CBC encrypted version of `winbullstaging.txt`
- Used by web AJAX endpoints (C_client_main/getRate, C_ajax/getRate)
- Key: `12@^tyh8901tt56789012345$y89012` (from global_configs)
- Written by Lumen's BroadcastRatesController alongside the TSV file

## Socket.io Server (`WinbullstagingSocket.js`) — FULL SPEC

### Configuration
```javascript
PORT: 57133                        // ← Different from NativeSocket (57134)
FILE_PATH: "/var/www/html/winbullstaging/client/winbullstaging.txt"
SECRET: "logiMax@916#socket"
VALID_TOKEN: SHA-256(SECRET)       // static hash
```

### Security (Socket.io Middleware)
```javascript
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || token !== VALID_TOKEN) return next(new Error("Forbidden"));
    next();
});
```

### Connection Lifecycle
```
Client connects with { auth: { token: SHA256_hash } }
  → Middleware validates token (rejects invalid)
  → On connect: emit lastRate immediately if available
  → fs.watch fires on file change → broadcastRate()
  → Read winbullstaging.txt → if changed, io.emit("rateUpdate", { rate })
  → Fallback poll: setInterval(broadcastRate, 800ms)
```

### Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `rateUpdate` | Server→Client | `{ rate: "<TSV string>" }` |
| `connection` | Server | Client connected |
| `disconnect` | Client | Reason string |

### HTTP Endpoints
| Endpoint | Response |
|----------|---------|
| `GET /health` | `"OK"` (200) |
| any other | 404 |

### CORS
```javascript
cors: {
  origin: ["http://bullionstaging_v4.logimaxindia.com/"],
  methods: ["GET", "POST"],
  credentials: true
}
```

### Comparison: NativeSocket vs Socket.io
| Feature | NativeSocket (57134) | Socket.io (57133) |
|---------|---------------------|------------------|
| Library | Native `ws` | `socket.io` |
| Delta broadcast | ✅ Yes (diff only) | ❌ No (full string) |
| Heartbeat | ✅ 30s ping/pong | ❌ Socket.io built-in only |
| Stats endpoint | ✅ `/stats` | ❌ No |
| Token endpoint | ✅/⚠️ `/token` | ❌ No |
| Active in prod | ✅ Primary | ⚠️ Secondary/legacy |

---

## Lumen Push Classes (Job Executors)

These 5 classes are called **inside Jobs** after queue dispatch. They perform the actual HTTP callbacks to CI cloud sites.

### `PushExecutedOrders.php` — Limit Order Execution Callback
```
Job: RateExecutedJob → calls PushExecutedOrders::pushRates($executed_rates)

Flow:
  1. $executed_rates is keyed by client code (e.g. "SVG", "AB")
  2. Look up WLclient-{client} from Redis → get client_details['orderexeurl']
  3. POST executed orders to orderexeurl (the CI site's C_mobile endpoint)
  4. CI site marks dt_booking.orderstatus = 1 (confirmed)
```

### `PushExecutedratealerts.php` — Rate Alert Push Notification
```
Job: RateAlertExecutedJob → calls PushExecutedratealerts::pushRates($executed_alerts)

Flow:
  1. For each client: get onesignalapi + onesignalid from Redis
  2. Send OneSignal push to SPECIFIC device (include_player_ids: [device_id])
  3. Message: "Your rate alert has been executed. Requested: {Rate} Current: {currate}"
  4. Also POST to: {baseurl}/C_sendorderstatus/send_ratealertStatus
```

### `PushExecutehighlowalerts.php` — High/Low Alert Broadcast
```
Job: HighLowExecuteJob → calls PushExecutehighlowalerts::pushHighLowAlerts($alert)

Flow:
  1. Get onesignalapi + onesignalid from Redis for client
  2. Send OneSignal push to ALL subscribers (included_segments: ["All"])
  3. Message is e.g.: "Gold Down By Rupees: 120, Gold: 5800, Silver: 70500"
  4. Used for market movement alerts to ALL app users
```

### `PushOrderStatusUpdate.php` — Limit Order Expiry Callback
```
Job: OrderStatusUpdatedJob → calls PushOrderStatusUpdate::pushOrderStatus($orders)

Flow:
  1. Get limitexpireurl from Redis (WLclient-{CLIENT})
  2. POST expired order book_numbers to CI site
  3. CI site marks expired limit orders as cancelled (orderstatus=3)
```

### `PushTradingStatusUpdate.php` — Trade ON/OFF Callback
```
Job: TradingStatusUpdateJob → calls PushTradingStatusUpdate::pushTradingStatus($status)

Flow:
  1. Get tradeonoffurl from Redis (WLclient-{CLIENT})
  2. POST trade_enable flag (1=ON, 0=OFF) to CI site
  3. CI site toggles trading status for customers
```

### Redis URL Keys (in WLclient-{client} JSON)
| Key | Callback Target |
|-----|----------------|
| `orderexeurl` | CI: limit order execution endpoint |
| `baseurl` | CI base URL for rate alert status |
| `limitexpireurl` | CI: expired limit order endpoint |
| `tradeonoffurl` | CI: trade on/off toggle endpoint |
| `onesignalapi` | OneSignal REST API key |
| `onesignalid` | OneSignal App ID |

---

## WINBULLSTAGINGController — Config Sync Controller

Routes: `POST /api/v1/winbullstaging*` — all protected by `whiteListDomain` middleware.

| Method | Route | Action |
|--------|-------|--------|
| `updatecommoditygroup()` | `winbullstagingcommoditygroupupdate` | Save commodity to Redis + fire `WINBULLSTAGINGCommodityUpdates` |
| `updaterpanel()` | `winbullstagingrpanelupdate` | Save R-Panel config to Redis + fire `WINBULLSTAGINGRpanelUpdates` |
| `updatenews()` | `winbullstagingnewsupdate` | Save news text to Redis + fire `WINBULLSTAGINGNewsUpdates` |
| `updatemarquee()` | `winbullstagingmarqueeupdate` | Save marquee text to Redis + fire `WINBULLSTAGINGMarqueeUpdates` |
| `updatelimit()` | `winbullstaginglimitupdate` | Save limit data to Redis + fire `WINBULLSTAGINGLimitUpdates` |
| `updatebook()` | `winbullstagingbookupdate` | Fire `WINBULLSTAGINGBookUpdates` |
| `updateusertermination()` | `winbullstagingterminateuserupdate` | Fire `WINBULLSTAGINGUserUpdates` |

**Redis keys written:**
- `winbullstagingcommoditydata`, `winbullstagingrpaneldata`, `winbullstagingnewsdata`, `winbullstagingmarqueedata`, `winbullstaginglimitdata`

---

## ApisourceController — Utility Controller

Not exposed in main `web.php` routes directly. Contains:
| Method | Purpose |
|--------|---------|
| `getcurrentrates()` | Returns `lmxliverates` Redis key |
| `updateeconomicapi()` | Polls TradingEconomics API for Mexico news → dispatches `HighLowExecuteJob` as push notification to client "AB" |

⚠️ **`updateeconomicapi()` is hardcoded to client `"AB"`** — this is a residual/debug function.

---

## Middleware (Lumen)

| Middleware | Function |
|-----------|---------|
| `WhiteListDomainMiddleware` | **BYPASSED** — IP check logic commented out, `return $next($request)` always passes. Only registered IPs: `192.168.1.1`, `127.0.0.1`, `1.23.176.180`, `18.139.18.248`, `1.22.24.145` |
| `AWSWhiteListDomainMiddleware` | AWS-specific IP whitelist (separate class) |
| `CheckIpMiddleware` | Additional IP checking |
| `CheckMyIpMiddleware` | Dev IP check |
| `CorsMiddleware` | CORS headers |
| `Authenticate` | Auth guard (not used on most routes) |

⚠️ **Security Bug**: `WhiteListDomainMiddleware` is completely disabled (commented out body). The `broadcastsourcerates` and `broadcastrates` routes rely on this middleware for protection — but it does nothing.

---

## Key Issues (Updated)
- `GET /token` endpoint on NativeSocket exposes auth token publicly
- No rate-limiting on WebSocket connections (either server)
- `WhiteListDomainMiddleware` is disabled → rate broadcast endpoints unprotected
- `ApisourceController::updateeconomicapi()` hardcoded to client "AB"
- No connection cap (unlimited clients on both socket servers)
- Token is static SHA-256 hash (never rotates)
