# /deploy Workflow (v1.0)

> Deploy the Winbull codebase to the live server.
> Script: `scripts/winbull_deploy.sh`

## Usage
Say: `/deploy`

---

## Prerequisites

- All bug fixes committed via `/git-push`
- SSH access to production server configured
- Database migrations tested on staging first
- Socket server restart permission

---

## Quick Deploy (Manual SSH)

```bash
# 1. Copy deploy script to server (one-time setup)
scp scripts/winbull_deploy.sh server-1:/var/www/html/vijaybullion_staging/deploy.sh
ssh server-1 "chmod +x /var/www/html/vijaybullion_staging/deploy.sh"

# 2. Deploy (any time)
ssh server-1 "bash /var/www/html/vijaybullion_staging/deploy.sh"

# 3. Deploy a specific branch
ssh server-1 "bash /var/www/html/vijaybullion_staging/deploy.sh main"

# 4. Skip migrations
ssh server-1 "SKIP_MIGRATIONS=true bash /var/www/html/vijaybullion_staging/deploy.sh"
```

---

## What the Script Does (in order)

| Step | Action | Safety |
|---|---|---|
| 1 | Lock file check — prevent concurrent deploys | Auto-expires after 10 min |
| 2 | SSH key resolution — `/home/ubuntu/.ssh/id_ed25519` | Fails fast if missing |
| 3 | Interactive check — warns about local changes | Prompts before overwrite |
| 4 | Remove stale `.git/*.lock` files | Prevents index.lock errors |
| 5 | `git fetch --all --prune` | Retries branch-only on failure |
| 6 | `git checkout $branch` | Auto-creates if tracking branch missing |
| 7 | `git reset --hard origin/$branch` | Force-sync, no merge conflicts |
| 8 | `git clean -fd` | Removes untracked, **preserves logs + uploads** |
| 9 | DB migrations (if `scripts/run-migrations.sh` exists) | Skippable |
| 10 | Clear CI3 cache (3 dirs) | application/cache, admin, mobileapi |
| 11 | Fix permissions → `www-data:www-data` | Only if not running as www-data |
| 12 | **Socket restart** — if `client/` socket files changed | Auto-detects via git diff |

---

## Branch Mapping (Auto-Detected)

| Server Folder | Default Branch |
|---|---|
| `vijaybullion_staging` | `V4.0.3` |
| `vijaybullion` | `main` |
| `vijaybullion_dev` | `dev` |

Override with argument: `bash deploy.sh main`

---

## Logs

| File | What's In It |
|---|---|
| `deploy.log` | Timestamped full log of last deploy |
| `deploy-history.log` | One-line per deploy: `timestamp | env | branch | commits | author | source | message` |

Read logs:
```bash
ssh server-1 "tail -50 /var/www/html/vijaybullion_staging/deploy.log"
ssh server-1 "cat /var/www/html/vijaybullion_staging/deploy-history.log"
```

---

## One-Time Server Setup

### 1. GitHub Deploy Key
The server's SSH key must be added to the GitHub repo:
```bash
# Get server's public key
ssh server-1 "cat /home/ubuntu/.ssh/id_ed25519.pub"

# Then: GitHub → WTWeb-VijayBullion → Settings → Deploy keys → Add key
# Title: server-1-winbull-deploy
# Allow write access: NO (read-only is enough for pull)
```

### 2. Test GitHub SSH access from server
```bash
ssh server-1 "GIT_SSH_COMMAND='ssh -i /home/ubuntu/.ssh/id_ed25519 -o StrictHostKeyChecking=no' git ls-remote git@github.com:Logimax-Technologies/WTWeb-VijayBullion HEAD"
```

### 3. Copy script to server
```bash
scp /run/media/lmx/LMX/Winbull/Personal/Devops/scripts/winbull_deploy.sh \
    server-1:/var/www/html/vijaybullion_staging/deploy.sh

ssh server-1 "chmod +x /var/www/html/vijaybullion_staging/deploy.sh"
```

---

## Socket Restart (Auto-Detected)

If any file in `client/` changes between commits, the script auto-detects it and:
1. Looks for a PM2 process with "socket" in the name
2. Runs `pm2 restart <name>` if found
3. Warns you to restart manually if PM2 not found

Check PM2 processes:
```bash
ssh server-1 "pm2 list"
```

---

## Danger Zones

| Rule | Why |
|---|---|
| NEVER run `git pull` manually after using this script | `git reset --hard` + manual pull can conflict |
| NEVER push directly to `V4.0.3` on production without testing | No rollback mechanism yet |
| Socket file changes ALWAYS require server restart | PM2 restart is in the script but verify it ran |

---

## Files Preserved During Deploy

These are explicitly excluded from `git clean`:
- `logs/` — all CI3 log directories
- `assets/uploads/` — user-uploaded files
- `deploy.log` + `deploy-history.log` — deployment history
