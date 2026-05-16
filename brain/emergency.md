# 🚨 Emergency Runbook

> Symptom-based rapid response for solo DevOps at 2 AM.

---

## 🔴 Rates Not Flowing (All clients frozen)

1. `curl -s http://72.52.178.11:8080` → LightStreamer alive?
2. `tail -20 <platform>/lmxtrade/winbullliteapi/storage/logs/lumen-$(date +%Y-%m-%d).log` → Lumen receiving?
3. `redis-cli ping` → Redis alive? If not: `sudo systemctl restart redis`
4. `pm2 list` → NativeSocket running? If not: `pm2 start NativeSocket.js`
5. `ls -la <platform>/client/<platform>.txt` → Rate file fresh? (timestamp < 60s)

## 🔴 Website Down (502/503)

1. `sudo systemctl restart nginx` + `sudo nginx -t`
2. `sudo systemctl restart php-fpm`
3. `df -h` → Disk full? Truncate logs: `find /var/log -name "*.log" -size +100M -exec truncate -s 0 {} \;`
4. `mysql -h <RDS> -u demotrade -p -e "SELECT 1;"` → DB alive?

## 🟠 Socket Disconnecting

1. `pm2 logs NativeSocket --lines 50` → Look for ECONNRESET/memory errors
2. `free -h` + `pm2 monit` → Memory leak? → `pm2 restart NativeSocket`
3. `cat /proc/sys/fs/inotify/max_user_watches` → If low: `echo 65536 | sudo tee /proc/sys/fs/inotify/max_user_watches`

## 🟠 Cortexo Won't Start

1. `lsof -ti:3000 | xargs kill -9` + `lsof -ti:4000 | xargs kill -9`
2. `rm -rf apps/web/.next && npm run dev`
3. `sudo systemctl status postgresql` → restart if dead
4. `redis-cli ping` → restart if dead

## 🟡 Flutter App Can't Connect

1. `grep -r "apiBaseUrl" lib/config/app_config.dart` → Correct URL?
2. `curl -s https://<api-url>/mobileapi/` → API responding?
3. `sudo certbot certificates` → SSL expired? → `sudo certbot renew`

## Quick Restart Commands

```bash
sudo systemctl restart nginx php-fpm redis
pm2 restart all
cd /path/to/cortexo && rm -rf apps/web/.next && npm run dev
```

---

*Created: 2026-05-16*
