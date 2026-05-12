#!/bin/bash
# =============================================================================
# WINBULL DEPLOY SCRIPT v1.0
# Adapted from eTail AI_Bug_Fix_System/deploy.sh
#
# Auto-detects environment from folder name.
# Supports: manual SSH deploy + webhook automation
#
# Usage (from server):
#   bash deploy.sh                  → deploy default branch for this env
#   bash deploy.sh V4.0.3           → deploy specific branch
#   bash deploy.sh main             → deploy main branch
#   SKIP_MIGRATIONS=true bash deploy.sh  → skip DB migrations
#
# Place this file in the repo root on the server:
#   /var/www/html/vijaybullion_staging/deploy.sh
#
# NOTE: DO NOT use 'set -e' — it silently kills on non-zero exit codes.
# Webhooks need explicit error messages. We use manual checks instead.
# =============================================================================

# =============================================================================
# AUTO-DETECT CONFIGURATION
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_PATH="$SCRIPT_DIR"
ENV_NAME=$(basename "$REPO_PATH")   # vijaybullion_staging / vijaybullion
# CLIENT_NAME removed — unused variable (was: "winbull")

# Winbull GitHub repo
GITHUB_REPO="Logimax-Technologies/WTWeb-VijayBullion"

# SSH key for GitHub — server ubuntu user key
resolve_ssh_key() {
    local user_home="$1"
    if [ -f "${user_home}/.ssh/id_ed25519" ]; then
        echo "${user_home}/.ssh/id_ed25519"
    elif [ -f "${user_home}/.ssh/id_rsa" ]; then
        echo "${user_home}/.ssh/id_rsa"
    else
        echo ""
    fi
}

if [ "$(whoami)" = "www-data" ]; then
    SSH_KEY=$(resolve_ssh_key "/var/www")
else
    SSH_KEY=$(resolve_ssh_key "/home/ubuntu")
fi

if [ -z "$SSH_KEY" ]; then
    echo "❌ No SSH key found. Expected: /home/ubuntu/.ssh/id_ed25519"
    echo "   Generate one with: ssh-keygen -t ed25519 -C 'winbull-deploy'"
    echo "   Then add the public key to GitHub repo deploy keys."
    exit 1
fi

# Log files
DEPLOY_LOG="$REPO_PATH/deploy.log"
HISTORY_LOG="$REPO_PATH/deploy-history.log"

# Lock file — prevents concurrent deploys
LOCK_FILE="/tmp/deploy_${ENV_NAME}.lock"

# =============================================================================
# BRANCH MAPPING
# =============================================================================

get_default_branch() {
    case "$ENV_NAME" in
        vijaybullion_staging|winbullstaging)  echo "V4.0.3" ;;
        vijaybullion|winbull)                 echo "main" ;;
        vijaybullion_dev|winbull_dev)         echo "dev" ;;
        *)                                     echo "V4.0.3" ;;
    esac
}

# Winbull CI3 cache directories to clear after deploy
CACHE_DIRS=(
    "$REPO_PATH/application/cache"
    "$REPO_PATH/admin/application/cache"
    "$REPO_PATH/mobileapi/application/cache"
)

# =============================================================================
# HELPERS
# =============================================================================

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" >> "$DEPLOY_LOG"
    echo "$1"
}

cleanup() {
    rm -f "$LOCK_FILE"
}

# =============================================================================
# MAIN DEPLOY
# =============================================================================

trap cleanup EXIT

# ── Lock check ───────────────────────────────────────────────────────────────
if [ -f "$LOCK_FILE" ]; then
    lock_age=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
    if [ "$lock_age" -gt 600 ]; then
        log "⚠️  Stale lock (${lock_age}s old). Removing..."
        rm -f "$LOCK_FILE"
    else
        log "⚠️  Deploy for $ENV_NAME already running. Exiting."
        exit 1
    fi
fi
touch "$LOCK_FILE"

# ── Enter repo ───────────────────────────────────────────────────────────────
cd "$REPO_PATH" || {
    log "❌ Cannot enter: $REPO_PATH"
    exit 1
}

# ── Git safe.directory bypass (repo owned by different user) ─────────────────
export GIT_CONFIG_COUNT=1
export GIT_CONFIG_KEY_0=safe.directory
export GIT_CONFIG_VALUE_0="$REPO_PATH"

# ── SSH for GitHub ───────────────────────────────────────────────────────────
export GIT_SSH_COMMAND="ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes"

# ── Resolve branch ───────────────────────────────────────────────────────────
if [ -z "$1" ]; then
    branch=$(get_default_branch)
else
    branch="$1"
fi

# ── Context ──────────────────────────────────────────────────────────────────
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
system_user=$(whoami)
ssh_ip="${SSH_CONNECTION%% *}"
[ -z "$ssh_ip" ] && ssh_ip="Webhook/Local"
is_interactive=false
[ -t 0 ] && is_interactive=true

log "═══════════════════════════════════════════════════════════"
log "🚀 Winbull Deploy Started"
log "═══════════════════════════════════════════════════════════"
log "📋 Environment : $ENV_NAME"
log "📋 Branch      : $branch"
log "📦 Repo        : $GITHUB_REPO"
log "👤 User        : $system_user"
log "🌐 Source      : $ssh_ip"
log "⏰ Time        : $timestamp"
log "🔑 SSH Key     : $SSH_KEY (exists: $([ -f "$SSH_KEY" ] && echo 'yes' || echo 'NO'))"

# ── Capture before-commit hash (used for rollback + socket diff) ─────────────
before_commit=$(git rev-parse --short HEAD 2>/dev/null || echo "initial")
rollback_commit="$before_commit"

# ── Interactive safety check ─────────────────────────────────────────────────
if [ "$is_interactive" = true ]; then
    if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
        log "⚠️  Local changes detected:"
        git status --short
        echo ""
        read -rp "❓ Overwrite local changes with remote? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            log "🚫 Deploy cancelled by user."
            exit 1
        fi
    fi
fi

# ── Remove stale git locks ───────────────────────────────────────────────────
find .git/refs -name "*.lock" -delete 2>/dev/null || true
[ -f ".git/index.lock" ] && rm -f ".git/index.lock" && log "🔓 Removed stale index.lock"

# ── Fetch ────────────────────────────────────────────────────────────────────
log "📥 Fetching from origin..."
fetch_output=$(git fetch --all --prune 2>&1)
fetch_status=$?
if [ $fetch_status -ne 0 ]; then
    log "⚠️  Full fetch failed — retrying branch-only..."
    fetch_output=$(git fetch origin "$branch" 2>&1)
    fetch_status=$?
    if [ $fetch_status -ne 0 ]; then
        log "❌ git fetch FAILED (exit: $fetch_status)"
        log "❌ $fetch_output"
        echo "❌ Winbull Deploy FAILED — git fetch error"
        exit 1
    fi
fi
log "📥 Fetch OK"

# ── Switch branch if needed ───────────────────────────────────────────────────
current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
if [ "$current_branch" != "$branch" ]; then
    log "📍 Switching: $current_branch → $branch"
    checkout_output=$(git checkout "$branch" 2>&1 || git checkout -b "$branch" "origin/$branch" 2>&1)
    checkout_status=$?
    if [ $checkout_status -ne 0 ]; then
        log "❌ git checkout FAILED (exit: $checkout_status)"
        log "❌ $checkout_output"
        echo "❌ Winbull Deploy FAILED — git checkout error"
        exit 1
    fi
    log "📍 Now on: $branch"
fi

# ── Reset to origin (force apply) ────────────────────────────────────────────
log "🔄 Applying origin/$branch..."
reset_output=$(git reset --hard "origin/$branch" 2>&1)
reset_status=$?
if [ $reset_status -ne 0 ]; then
    log "❌ git reset FAILED (exit: $reset_status)"
    log "❌ $reset_output"
    echo "❌ Winbull Deploy FAILED — git reset error"
    exit 1
fi
log "🔄 Reset OK: $reset_output"

# Rollback function — call on critical failures after this point
rollback() {
    local reason="$1"
    log "🔙 ROLLBACK triggered: $reason"
    if [ "$rollback_commit" != "initial" ]; then
        git reset --hard "$rollback_commit" 2>/dev/null && log "🔙 Rolled back to $rollback_commit" || log "⚠️  Rollback also failed — manual intervention required"
    else
        log "⚠️  No rollback point available (initial commit)"
    fi
}

# ── Clean untracked (preserve logs and uploads) ───────────────────────────────
git clean -fd -q \
    -e "logs/" \
    -e "application/logs/" \
    -e "admin/application/logs/" \
    -e "mobileapi/application/logs/" \
    -e "assets/uploads/" \
    -e "deploy.log" \
    -e "deploy-history.log" \
    2>/dev/null || true
log "🧹 Untracked files cleaned (logs + uploads preserved)"

# ── Capture after-commit hash ─────────────────────────────────────────────────
after_commit=$(git rev-parse --short HEAD)
commit_msg=$(git log -1 --pretty=%B | head -n1)
commit_author=$(git log -1 --pretty=format:'%an')

# ── Run DB migrations (if script exists) ─────────────────────────────────────
if [ "$SKIP_MIGRATIONS" != "true" ] && [ -f "./scripts/run-migrations.sh" ]; then
    log "🔧 Running DB migrations..."
    bash ./scripts/run-migrations.sh --config "$REPO_PATH/global_configs.php" --env "$ENV_NAME" >> "$DEPLOY_LOG" 2>&1
    migrate_exit=$?
    if   [ $migrate_exit -eq 0 ]; then log "✅ Migrations applied"
    elif [ $migrate_exit -eq 2 ]; then log "ℹ️  No pending migrations"
    else
        log "⚠️  Migration script failed (exit: $migrate_exit)"
        rollback "DB migration failure"
        exit 1
    fi
else
    log "⏭️  Migrations skipped (no script or SKIP_MIGRATIONS=true)"
fi

# ── Clear CI3 caches ─────────────────────────────────────────────────────────
cache_cleared=0
for cache_dir in "${CACHE_DIRS[@]}"; do
    if [ -d "$cache_dir" ]; then
        find "$cache_dir" -type f ! -name 'index.html' -delete 2>/dev/null || true
        cache_cleared=$((cache_cleared + 1))
    fi
done
log "🧹 CI3 cache cleared ($cache_cleared cache dir(s))"

# ── Fix permissions ───────────────────────────────────────────────────────────
if [ "$(whoami)" != "www-data" ]; then
    log "🔒 Fixing ownership → www-data:www-data..."
    if ! chown -R www-data:www-data "$REPO_PATH" 2>/dev/null; then
        log "⚠️  chown failed — run as root or add to sudoers: 'www-data ALL=(ALL) NOPASSWD: /bin/chown'"
    fi
    # Use chmod -R (faster than two find sweeps), then fix .sh files
    chmod -R 775 "$REPO_PATH" 2>/dev/null || true
    find "$REPO_PATH" -name "*.sh" -exec chmod 775 {} \; 2>/dev/null || true
    log "✅ Permissions fixed"
fi

# ── Restart socket server if socket files changed ────────────────────────────
socket_changes=""
if [ "$before_commit" != "initial" ] && [ "$before_commit" != "$after_commit" ]; then
    socket_changes=$(git diff --name-only "$before_commit" "$after_commit" -- client/ 2>/dev/null | grep -i socket | head -1)
fi
if [ -n "$socket_changes" ]; then
    log "🔌 Socket file changed: $socket_changes"
    if command -v pm2 &>/dev/null; then
        pm2_name=$(pm2 list --no-color 2>/dev/null | grep -oE '[a-zA-Z0-9_-]+socket[a-zA-Z0-9_-]*' | head -1)
        if [ -n "$pm2_name" ]; then
            log "🔄 Restarting PM2 process: $pm2_name"
            pm2 restart "$pm2_name" >> "$DEPLOY_LOG" 2>&1 && log "✅ Socket server restarted" || log "⚠️  PM2 restart failed"
        else
            log "⚠️  PM2 running but no socket process found — restart manually"
        fi
    else
        log "⚠️  Socket file changed but PM2 not found — restart socket server manually"
        log "   Hint: cd client && node WinbullstagingNativeSocket.js &"
    fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
log "═══════════════════════════════════════════════════════════"
log "✅ Winbull Deploy Complete"
log "═══════════════════════════════════════════════════════════"
log "📊 Changes  : $before_commit → $after_commit"
log "💬 Message  : $commit_msg"
log "👤 Author   : $commit_author"

# Save structured history entry
echo "[$timestamp] | $ENV_NAME | $branch | $before_commit→$after_commit | $commit_author | $ssh_ip | $commit_msg" >> "$HISTORY_LOG"

echo ""
echo "✅ Winbull deploy complete for: $ENV_NAME ($branch)"
echo "   Commits: $before_commit → $after_commit"
echo "   Log: $DEPLOY_LOG"
