# 📱 Flutter Deployment Guide — Universal

> Step-by-step for building, signing, and deploying any Logimax Flutter app.
> Works for: MKR Silver, Rubyprecious, MNT Traders, and any future client.

---

## Pre-Deploy Checklist

### 1. Config Verification
- [ ] `app_config.dart` — API base URL correct (staging vs production)
- [ ] `app_config.dart` — WebSocket URL correct
- [ ] `app_config.dart` — All socket event channel prefixes match server
- [ ] No `localhost` or `staging` URLs in production config
- [ ] App name and display name correct for client

### 2. Identity & Signing
- [ ] Bundle ID set in `android/app/build.gradle.kts`
- [ ] Bundle ID set in `ios/Runner.xcodeproj/project.pbxproj`
- [ ] Keystore file exists at path specified in `android/key.properties`
- [ ] `key.properties` has correct store/key passwords
- [ ] iOS provisioning profile + certificates valid

### 3. Assets
- [ ] App icon is client-specific (not another client's logo)
- [ ] Splash screen uses client branding
- [ ] No stale `LaunchScreen.storyboard` from previous client
- [ ] Flag images match client's market (SG, IN, etc.)

---

## Build Commands

### Android APK (Testing)
```bash
flutter clean
flutter pub get
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Android AAB (Play Store)
```bash
flutter clean
flutter pub get
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS (TestFlight → App Store)
```bash
flutter clean
flutter pub get
flutter build ios --release
# Then: Xcode → Product → Archive → Distribute to App Store Connect
```

---

## Client-Specific Config

| Client | Bundle ID | Keystore | Market | Socket Prefix |
|--------|-----------|----------|--------|---------------|
| MKR Silver | `com.lmx.mkrjewellery` | `mkrjewellery.keystore` | Singapore | _(check config)_ |
| Rubyprecious | _(check)_ | _(check)_ | India | `RUBYSTAGING` / `RUBYSILVER` |
| MNT Traders | _(check)_ | _(check)_ | India | _(check)_ |

> **TODO**: Fill in all bundle IDs and keystore names from each project.

---

## Common Pitfalls

| Pitfall | How to Avoid |
|---------|-------------|
| Wrong API URL in production build | **Always** `grep -r "staging" lib/` before building |
| Old splash screen from cloned project | Check `ios/Runner/Base.lproj/LaunchScreen.storyboard` |
| iOS double splash | Remove stale storyboard assets, set splash bg color |
| Flag showing wrong country | Verify flag image filenames match `app_config.dart` mapping |
| Rate alerts not showing Exe Rate | Ensure `confirmedon` field is rendered in `rate_alert.dart` |
| Stale `trade_enable` blocks booking page | Check `home.dart` doesn't overwrite login-stored value with null API response |

---

## Post-Deploy Verification

- [ ] App launches without crash
- [ ] Login works with test credentials
- [ ] Live rates flowing on home page
- [ ] Buy/sell booking page opens
- [ ] Rate alerts page loads
- [ ] Live charts display data (check Content-Type header)
- [ ] Push notifications received
- [ ] Correct client branding visible throughout

---

## Keystore Management

```bash
# Generate new keystore for a client
keytool -genkey -v -keystore <client>.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias <client>key

# Create key.properties
cat > android/key.properties << EOF
storePassword=<password>
keyPassword=<password>
keyAlias=<client>key
storeFile=<client>.keystore
EOF
```

> ⚠️ **Never commit keystores or key.properties to git.**
> Store keystore backups securely outside the repo.

---

*Created: 2026-05-16*
*Applies to: All Logimax Flutter apps*
