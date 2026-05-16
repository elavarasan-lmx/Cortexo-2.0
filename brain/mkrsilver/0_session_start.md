# 📱 MKR Silver — Session Starter (Read This First)

> If user says **"MKR"**, **"MKR Silver"**, or **"mkrjewellery"** → read this file first.
> This is the single entry point for every MKR Silver Flutter development session.

---

## What Is MKR Silver?

**MKR Silver** is a white-label Flutter mobile application for **MKR Jewellery** (Singapore market) — part of the Logimax bullion trading platform ecosystem.

- **Client**: MKR Jewellery (Singapore)
- **Platform**: Flutter (Android + iOS)
- **Bundle ID**: `com.lmx.mkrjewellery`
- **Local Path**: (check `WTApp-MKRSilver/` in the Flutter projects directory)
- **Backend Server**: Server 7 (shared with Ruby Staging)
- **Backend Path**: `/var/www/html/mkrbullion/`
- **Reference App**: MNT Traders Flutter (use for feature parity checks)

---

## Tech Stack

```
Flutter (Dart)
├── lib/
│   ├── pages/
│   │   ├── home.dart          ← Main rate display + flags + clocks
│   │   ├── booking.dart       ← Buy/sell trading page
│   │   ├── rate_alert.dart    ← Rate alert management
│   │   └── live_charts.dart   ← Historical chart display
│   ├── services/
│   │   ├── api_service.dart   ← REST API calls
│   │   └── socket_service.dart ← WebSocket for live rates
│   └── config/
│       └── app_config.dart    ← API URLs, WS URLs, event channels
├── android/
│   ├── app/build.gradle.kts   ← Bundle ID, signing config
│   └── key.properties         ← Keystore reference
└── ios/
    └── Runner.xcodeproj/
        └── project.pbxproj    ← iOS bundle ID
```

---

## Critical Files

| File | Risk | Notes |
|------|------|-------|
| `app_config.dart` | 🔴 HIGH | All API/WS URLs + 5 socket event channel names. Wrong URL = app dead. |
| `home.dart` | 🟠 MED | Flag images, timezone clocks, rate display — most frequently modified |
| `booking.dart` | 🔴 HIGH | Trading page — handles real money. 5 bugs fixed May 13 |
| `rate_alert.dart` | 🟡 LOW | Rate alert display — Exe Rate column fixed May 15 |
| `build.gradle.kts` | 🟠 MED | Bundle ID + signing — wrong config = Play Store rejection |

---

## Recent Work Log

| Date | What Changed |
|------|-------------|
| 2026-05-13 | 5 booking bugs fixed: stale trade_enable, rate/cost mismatch, XSS strip, dropdown crash, dialog dismiss |
| 2026-05-14 | 3 home.dart fixes: Malaysia→Singapore flag, live Timer for clocks, US timezone EDT→EST |
| 2026-05-14 | app_config.dart: API/WS URLs → staging, 5 event channels RUBYSILVER→RUBYSTAGING |
| 2026-05-15 | Bundle ID: com.lmx.mkr → com.lmx.mkrjewellery (Android + iOS) |
| 2026-05-15 | iOS: double splash fix (stale LaunchScreen removed), splash/icon bg → black |
| 2026-05-15 | Rate alerts: Exe Rate + confirmedon display fixed, synced with MNT reference |
| 2026-05-15 | Keystore: mkrjewellery.keystore generated for production signing |
| 2026-05-15 | Backend: C_sendorderstatus.php + PushExecutedratealerts.php rate alert pipeline fixed |

---

## Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| iOS build not verified | 🟡 Open | New bundle ID needs TestFlight verification |
| Live chart Content-Type | ✅ Fixed | API needed `application/json` header — fixed May 15 |
| Rate alerts Exe Rate | ✅ Fixed | `confirmedon` data now displays — fixed May 15 |
| Flag sizing inconsistency | ✅ Fixed | Height/width made consistent May 15 |

---

## Build & Deploy

### Android
```bash
# Build APK
flutter build apk --release

# Build AAB for Play Store
flutter build appbundle --release

# Keystore location
android/app/mkrjewellery.keystore
# Keystore config: android/key.properties
```

### iOS
```bash
# Build for TestFlight
flutter build ios --release

# Then use Xcode → Archive → Distribute
```

### Production Checklist
See `ProdBuild/production.txt` in the project root.

---

## Client-Specific Notes

| Item | Value |
|------|-------|
| Market | Singapore (SG) |
| Currency | SGD |
| Timezone Flags | Singapore, US (EST), UK, Japan |
| Language | English (no Tamil/Hindi) |
| Logo | MKR Jewellery logo (black background) |

---

## Cross-References

- **Backend Brain**: `brain/winbull/` — MKR backend uses the same CI3 architecture
- **Reference Flutter App**: MNT Traders — use for feature parity
- **Backend Files**: Server 7 `/var/www/html/mkrbullion/`
- **Rate Engine**: `brain/winbull/5_lumen_engine.md`
- **Server Info**: `brain/infrastructure.md`

---

*Created: 2026-05-16*
*Maintained by: Elavarasan @ Logimax India*
