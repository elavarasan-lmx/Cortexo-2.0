# 👥 Client Roster

> Maps every client to their servers, codebases, and apps.
> Update when onboarding new clients or changing infrastructure.

---

## Active Clients

| Client | Market | Server | Web Codebase | Flutter App? | Status |
|--------|--------|--------|-------------|:---:|--------|
| **Winbull** | India | _(TBD)_ | `winbullstaging/` | ✅ Shivsahai (Ionic) | Staging/Dev |
| **Vijay Bullion** | India | _(TBD)_ | _(TBD)_ | ✅ | Production |
| **MNT Traders** | India | _(TBD)_ | _(TBD)_ | ✅ (Reference app) | Production |
| **KVT Jewellers** | India | _(TBD)_ | _(TBD)_ | ✅ | Production |
| **Ruby Precious Metals** | India | Server 7 | `ruby_staging/` + `rubysilver/` | ✅ Rubyprecious | Staging + Prod |
| **MKR Jewellery (MKR Silver)** | Singapore | Server 7 | `mkrbullion/` | ✅ MKR Silver | Production |

---

## Client Platform Matrix

| Client | Web | Admin | Mobile API | Lumen Controller | Socket Events Prefix | DB Name |
|--------|:---:|:---:|:---:|---|---|---|
| Winbull | ✅ | ✅ | ✅ | `WINBULLSTAGINGController` | `WINBULLSTAGING` | `winbullstaging` |
| Ruby (staging) | ✅ | ✅ | ✅ | `RUBYSTAGINGController` | `RUBYSTAGING` | `ruby_staging` |
| Ruby (prod) | ✅ | ✅ | ✅ | `RUBYSILVERController` | `RUBYSILVER` | `rubysilver` |
| MKR Silver | ❌ | ✅ | ✅ | _(shared)_ | _(check config)_ | _(check config)_ |

> Each white-label client gets:
> - Own `global_configs.php` with unique DB name, rate file paths, and socket settings
> - Own Lumen controller (named `{PREFIX}Controller.php`)
> - Own socket event channel prefix
> - Own Flutter `app_config.dart` pointing to their API/WS endpoints

---

## Flutter App Variants

| App | Bundle ID | Tech | Keystore | Reference |
|-----|-----------|------|----------|-----------|
| **MKR Silver** | `com.lmx.mkrjewellery` | Flutter | `mkrjewellery.keystore` | Uses MNT Traders as reference |
| **Rubyprecious** | _(check config)_ | Flutter | _(check)_ | — |
| **Shivsahai** | _(check config)_ | Ionic/Angular | — | Legacy Winbull mobile |
| **MNT Traders** | _(check config)_ | Flutter | _(check)_ | **Reference implementation** |

---

## Onboarding a New Client (Checklist)

1. [ ] Clone web codebase from reference client
2. [ ] Create new database on RDS (import from template)
3. [ ] Configure `global_configs.php` (DB name, rate files, encryption key)
4. [ ] Create new Lumen controller (`{PREFIX}Controller.php`)
5. [ ] Update Redis key prefixes in Lumen
6. [ ] Create/clone Flutter app, update `app_config.dart`
7. [ ] Set new bundle ID in `build.gradle.kts` + `project.pbxproj`
8. [ ] Generate new keystore for Play Store signing
9. [ ] Configure Nginx vhost + SSL certificate
10. [ ] Initialize Git repo on server
11. [ ] Push to GitHub (`Logimax-Technologies/WTWeb-{ClientName}`)
12. [ ] Verify rate feed is live (check Lumen logs)

---

*Created: 2026-05-16*
*Maintained by: Elavarasan @ Logimax India*
