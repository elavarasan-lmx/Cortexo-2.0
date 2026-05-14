# Cortexo — DevOps Patterns (Artifact 9)

> Server management, monitoring, automation patterns.

---

## Server Types

| Type | Purpose |
|------|---------|
| `web` | Nginx + PHP-FPM / Node.js |
| `database` | PostgreSQL / MySQL |
| `cache` | Redis / Memcached |
| `queue` | BullMQ / RabbitMQ |
| `storage` | NFS mount / S3 |

---

## Server Registration

```typescript
POST /v1/servers
{
  "name": "prod-web-01",
  "ip": "10.0.1.100",
  "ssh_user": "deploy",
  "ssh_key_id": "key-123",
  "type": "web",
  "provider": "aws",
  "region": "ap-south-1"
}
```

---

## NFS Mounts

```typescript
POST /v1/server-mounts
{
  "server_id": "srv-123",
  "mount_path": "/mnt/nfs/shared",
  "nfs_server": "10.0.2.50",
  "nfs_path": "/exports/data",
  "options": "rw,sync,noatime"
}
```

---

## Metrics Collection

| Metric | Source | Interval |
|--------|--------|----------|
| CPU | `top` / `htop` | 30s |
| Memory | `free -m` | 30s |
| Disk | `df -h` | 60s |
| Network | `netstat` | 60s |
| Custom | Script | Variable |

Stored in: `server_metrics` table

---

## Alert Channels

| Channel | Config |
|---------|--------|
| Email | SMTP settings |
| Slack | Webhook URL |
| Telegram | Bot token + chat ID |
| PagerDuty | Integration key |

---

## Automation Triggers

```typescript
// Deploy on git push
{
  "trigger": "git.push",
  "action": "deploy",
  "target": "{branch}",
  "server": "prod-web-01"
}

// Schedule task
{
  "trigger": "cron",
  "action": "run_script",
  "schedule": "0 2 * * *",  // 2am daily
  "command": "/scripts/backup.sh"
}
```

---

## Common DevOps Tasks

### SSL Certificate
```bash
sudo certbot --nginx -d domain.com
```

### Log Rotation
```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
  daily
  rotate 14
  compress
  delaycompress
}
```

### Port Check
```bash
netstat -tulpn | grep :4000
ss -tulpn | grep :4000
```

---

## Health Checks

| Check | Endpoint |
|-------|----------|
| API | `GET /v1/health` |
| Database | `SELECT 1` |
| Redis | `PING` |
| Disk | `df -h` |

---

## Backup Patterns

```bash
# Database backup
pg_dump -U cortexo cortexo > backup_$(date +%Y%m%d).sql

# Files backup
rsync -avz /var/www/ backup:/backups/

# Rotate old backups
find /backups -mtime +30 -delete
```

---

## Docker Compose Services

```yaml
services:
  api:
    build: ./apps/api
    ports:
      - "4000:4000"
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
```

---

## Monitoring Dashboard

Key metrics to track:
- Deploy success rate
- Average deploy time
- Error rate by module
- Server resource usage
- Test pass rate

---

*Part of Cortexo brain — see 0_session_start.md for full index.*