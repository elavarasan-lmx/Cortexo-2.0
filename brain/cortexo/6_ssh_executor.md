# Cortexo — SSH Executor (Artifact 6)

> Core SSH deploy engine — how deployments work.

---

## Overview

`apps/api/src/lib/ssh-executor.ts` (52KB) is the core of Cortexo.
It handles SSH connections, remote commands, file transfers, and deployment orchestration.

---

## Key Functions

### connect(host: string, credentials: SSH creds)
```typescript
await ssh.connect({
  host: server.ip,
  port: 22,
  username: server.ssh_user,
  privateKey: decryptedPrivateKey,
  readyTimeout: 30000
})
```

### execute(ssh, command): Promise<string>
```typescript
const output = await execute(ssh, 'cd /var/www && git pull origin main');
```

### deployProject(config)
Orchestrates full deployment:
1. SSH connect
2. Git pull / composer install
3. Cache clear (Redis, application)
4. PM2 restart / systemctl restart
5. Health check

---

## Deployment Flow

```
User clicks "Deploy" in UI
        ↓
POST /v1/deployments (create deployment record)
        ↓
Queue job: deploy-project
        ↓
SSH connect → git pull → npm install → cache clear → restart
        ↓
Stream logs via WebSocket to UI
        ↓
Update deployment status (success/failed)
        ↓
Send notification (email/push)
```

---

## SSH Key Management

| Key | Stored | Encryption |
|-----|--------|-------------|
| Public Key | DB (plain) | None |
| Private Key | DB (encrypted) | AES-256 |
| Passphrase | Vault | AES-256 |

Decryption flow:
```typescript
const privateKey = await decrypt(user.privateKeyKey);
const passphrase = await vault.get(deployment.server_id);
```

---

## Known Issues

| Issue | Status | Fix |
|-------|--------|-----|
| SSH connection timeout not configurable | Open | Add timeout param |
| No retry on failed deploy | Open | Add BullMQ retry |
| Log streaming drops on slow connection | Open | Buffer writes |

---

## Common SSH Commands

```bash
# Git deploy
cd /var/www/project && git pull origin main && composer install --no-dev

# PM2 restart
pm2 restart all || pm2 start ecosystem.config.js

# Systemd restart
sudo systemctl restart nginx && sudo systemctl restart php-fpm

# Clear caches
redis-cli FLUSHALL && rm -rf /tmp/application_cache/*
```

---

## Security Notes

- Private keys encrypted at rest
- SSH sessions closed after each deploy
- No password auth — key-based only
- Audit log captures all SSH commands

---

*Part of Cortexo brain — see 0_session_start.md for full index.*