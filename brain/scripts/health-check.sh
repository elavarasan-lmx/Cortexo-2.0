#!/bin/bash
# Brain Health Check — validates brain freshness and completeness
# Run: bash brain/scripts/health-check.sh

BRAIN_DIR="/run/media/lmx/LMX/Winbull/Personal/Devops/brain"
DAYS_STALE=7
NOW=$(date +%s)
ISSUES=0

echo "🧠 Brain Health Check — $(date '+%Y-%m-%d %H:%M')"
echo "=================================================="
echo ""

# 1. Check all session_start files exist
echo "📋 Platform Brains:"
for platform in cortexo winbull ruby mkrsilver; do
    FILE="$BRAIN_DIR/$platform/0_session_start.md"
    if [ -f "$FILE" ]; then
        MOD=$(stat -c %Y "$FILE" 2>/dev/null || stat -f %m "$FILE" 2>/dev/null)
        AGE=$(( (NOW - MOD) / 86400 ))
        if [ "$AGE" -gt "$DAYS_STALE" ]; then
            echo "  ⚠️  $platform/0_session_start.md — STALE ($AGE days old)"
            ISSUES=$((ISSUES + 1))
        else
            echo "  ✅ $platform/0_session_start.md — fresh ($AGE days)"
        fi
    else
        echo "  ❌ $platform/0_session_start.md — MISSING!"
        ISSUES=$((ISSUES + 1))
    fi
done

echo ""

# 2. Check global docs
echo "🌐 Global Docs:"
for doc in CLAUDE.md infrastructure.md clients.md emergency.md flutter_deploy.md daily_digest.md; do
    FILE="$BRAIN_DIR/$doc"
    if [ -f "$FILE" ]; then
        echo "  ✅ $doc"
    else
        echo "  ❌ $doc — MISSING!"
        ISSUES=$((ISSUES + 1))
    fi
done

echo ""

# 3. Check Cortexo _SYSTEM files
echo "🔧 Cortexo _SYSTEM:"
for doc in DIAGNOSTIC_PLAYBOOK.md ACTIVE_BUGS.md FIX_VELOCITY.md POSTMORTEM_LOG.md COVERAGE_ANALYSIS.md; do
    FILE="$BRAIN_DIR/cortexo/_SYSTEM/$doc"
    if [ -f "$FILE" ]; then
        LINES=$(wc -l < "$FILE")
        if [ "$LINES" -lt 5 ]; then
            echo "  ⚠️  $doc — exists but nearly empty ($LINES lines)"
            ISSUES=$((ISSUES + 1))
        else
            echo "  ✅ $doc ($LINES lines)"
        fi
    else
        echo "  ❌ $doc — MISSING!"
        ISSUES=$((ISSUES + 1))
    fi
done

echo ""

# 4. Check Winbull _SYSTEM files
echo "🔧 Winbull _SYSTEM:"
for doc in DANGER_ZONES.md DIAGNOSTIC_PLAYBOOK.md ACTIVE_BUGS.md FIX_VELOCITY.md; do
    FILE="$BRAIN_DIR/winbull/_SYSTEM/$doc"
    if [ -f "$FILE" ]; then
        LINES=$(wc -l < "$FILE")
        echo "  ✅ $doc ($LINES lines)"
    else
        echo "  ❌ $doc — MISSING!"
        ISSUES=$((ISSUES + 1))
    fi
done

echo ""

# 5. Total file count
TOTAL=$(find "$BRAIN_DIR" -name "*.md" | wc -l)
echo "📊 Summary:"
echo "  Total brain files: $TOTAL"
echo "  Issues found: $ISSUES"

if [ "$ISSUES" -eq 0 ]; then
    echo ""
    echo "✅ Brain is healthy!"
else
    echo ""
    echo "⚠️  $ISSUES issue(s) need attention."
fi
