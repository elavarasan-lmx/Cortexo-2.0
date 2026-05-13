#!/bin/bash
# =============================================================================
# Winbull DB Migration Runner v1.0
# Applies pending SQL migrations from database/migrations/ in order.
#
# Usage:
#   bash run-migrations.sh [OPTIONS]
#
# Options:
#   --config <file>      Path to global_configs.php  (auto-detect if omitted)
#   --migrations <dir>   Path to migrations dir      (default: ../database/migrations)
#   --env <name>         Environment name            (default: auto-detect)
#   --dry-run            Show pending migrations without running them
#   --json               Output JSON (used by deploy.php webhook)
#   --rollback <name>    Roll back a specific migration (requires rollback file)
#
# Design: O.S.O — Order (sorted), Skip (tracked), Once (idempotent)
# Exit codes:
#   0 = migrations applied successfully
#   1 = error
#   2 = no pending migrations
# =============================================================================

set -euo pipefail

# ─── Defaults ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="${REPO_ROOT}/database/migrations"
CONFIG_FILE=""
ENV_NAME="$(basename "$REPO_ROOT")"
DRY_RUN=false
JSON_OUTPUT=false
ROLLBACK_TARGET=""

# ─── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        --config)     CONFIG_FILE="$2";      shift 2 ;;
        --migrations) MIGRATIONS_DIR="$2";   shift 2 ;;
        --env)        ENV_NAME="$2";         shift 2 ;;
        --dry-run)    DRY_RUN=true;          shift ;;
        --json)       JSON_OUTPUT=true;      shift ;;
        --rollback)   ROLLBACK_TARGET="$2";  shift 2 ;;
        *)            echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ─── Auto-detect config ───────────────────────────────────────────────────────
if [ -z "$CONFIG_FILE" ]; then
    for try_path in \
        "${REPO_ROOT}/global_configs.php" \
        "/var/www/html/vijaybullion_staging/global_configs.php" \
        "/var/www/html/vijaybullion/global_configs.php"; do
        if [ -f "$try_path" ]; then
            CONFIG_FILE="$try_path"
            break
        fi
    done
fi

if [ -z "$CONFIG_FILE" ] || [ ! -f "$CONFIG_FILE" ]; then
    echo '{"status":"error","message":"global_configs.php not found. Use --config <path>"}' >&2
    exit 1
fi

# ─── Extract DB creds from global_configs.php ────────────────────────────────
# Uses PHP to parse the class — handles any formatting
extract_config() {
    php -r "
        require_once '$CONFIG_FILE';
        \$r = new ReflectionClass('Globals');
        echo \$r->getStaticPropertyValue('$1') ?? '';
    " 2>/dev/null || echo ""
}

DB_HOST=$(extract_config "hostname")
DB_USER=$(extract_config "username")
DB_PASS=$(extract_config "password")
DB_NAME=$(extract_config "database")
DB_PORT=$(extract_config "port")

# Fallback to common defaults
[ -z "$DB_HOST" ] && DB_HOST="localhost"
[ -z "$DB_PORT" ] && DB_PORT="3306"

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo '{"status":"error","message":"Could not parse DB credentials from global_configs.php"}' >&2
    exit 1
fi

# ─── MySQL helper ────────────────────────────────────────────────────────────
mysql_cmd() {
    mysql \
        -h "$DB_HOST" \
        -P "$DB_PORT" \
        -u "$DB_USER" \
        ${DB_PASS:+-p"$DB_PASS"} \
        "$DB_NAME" \
        --batch \
        --silent \
        "$@"
}

mysql_exec() {
    mysql_cmd -e "$1"
}

# ─── Ensure schema_migrations table exists ────────────────────────────────────
mysql_exec "
CREATE TABLE IF NOT EXISTS schema_migrations (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    migration    VARCHAR(255) NOT NULL UNIQUE,
    environment  VARCHAR(50)  DEFAULT 'unknown',
    executed_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    checksum     VARCHAR(64)  DEFAULT NULL
);" 2>/dev/null

# ─── Check migrations dir ─────────────────────────────────────────────────────
if [ ! -d "$MIGRATIONS_DIR" ]; then
    if [ "$JSON_OUTPUT" = true ]; then
        echo '{"status":"no_migrations","message":"Migrations directory not found","applied":[]}'
    fi
    exit 2
fi

# ─── Get sorted pending SQL files ─────────────────────────────────────────────
mapfile -t ALL_MIGRATIONS < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.sql' ! -name '*_rollback.sql' | sort)

if [ ${#ALL_MIGRATIONS[@]} -eq 0 ]; then
    if [ "$JSON_OUTPUT" = true ]; then
        echo '{"status":"no_migrations","message":"No .sql files in migrations directory","applied":[]}'
    else
        echo "ℹ️  No migration files found in $MIGRATIONS_DIR"
    fi
    exit 2
fi

# ─── Filter pending (not yet in schema_migrations) ───────────────────────────
APPLIED=()
PENDING=()

for filepath in "${ALL_MIGRATIONS[@]}"; do
    name=$(basename "$filepath")
    already_run=$(mysql_exec "SELECT COUNT(*) FROM schema_migrations WHERE migration = '$name';" 2>/dev/null | tail -1)
    if [ "${already_run:-0}" -gt 0 ]; then
        APPLIED+=("$name")
    else
        PENDING+=("$filepath")
    fi
done

if [ ${#PENDING[@]} -eq 0 ]; then
    if [ "$JSON_OUTPUT" = true ]; then
        echo "{\"status\":\"up_to_date\",\"message\":\"No pending migrations\",\"applied_count\":${#APPLIED[@]}}"
    else
        echo "✅ No pending migrations (${#APPLIED[@]} already applied)"
    fi
    exit 2
fi

# ─── Dry run ─────────────────────────────────────────────────────────────────
if [ "$DRY_RUN" = true ]; then
    echo "📋 Pending migrations (${#PENDING[@]}):"
    for fp in "${PENDING[@]}"; do
        echo "   → $(basename "$fp")"
    done
    exit 0
fi

# ─── Apply pending migrations ─────────────────────────────────────────────────
NEWLY_APPLIED=()
FAILED_AT=""

for filepath in "${PENDING[@]}"; do
    name=$(basename "$filepath")
    checksum=$(md5sum "$filepath" | awk '{print $1}')

    if [ "$JSON_OUTPUT" != true ]; then
        echo "🔧 Applying: $name"
    fi

    if mysql_cmd < "$filepath" 2>/tmp/migration_err; then
        mysql_exec "INSERT INTO schema_migrations (migration, environment, checksum) VALUES ('$name', '$ENV_NAME', '$checksum');"
        NEWLY_APPLIED+=("$name")
    else
        FAILED_AT="$name"
        ERROR_MSG=$(cat /tmp/migration_err)
        if [ "$JSON_OUTPUT" = true ]; then
            echo "{\"status\":\"error\",\"message\":\"Migration failed: $name\",\"error\":\"$ERROR_MSG\",\"applied\":$(printf '%s\n' "${NEWLY_APPLIED[@]}" | jq -R . | jq -s .)}"
        else
            echo "❌ FAILED: $name"
            echo "   Error: $ERROR_MSG"
        fi
        exit 1
    fi
done

# ─── Success ──────────────────────────────────────────────────────────────────
if [ "$JSON_OUTPUT" = true ]; then
    COUNT=${#NEWLY_APPLIED[@]}
    NAMES=$(printf '%s\n' "${NEWLY_APPLIED[@]}" | jq -R . | jq -s . 2>/dev/null || echo "[]")
    echo "{\"status\":\"ok\",\"message\":\"Applied $COUNT migration(s)\",\"applied\":$NAMES}"
else
    echo "✅ Applied ${#NEWLY_APPLIED[@]} migration(s):"
    for name in "${NEWLY_APPLIED[@]}"; do
        echo "   ✓ $name"
    done
fi

exit 0
