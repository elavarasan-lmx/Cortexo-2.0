#!/bin/bash
# ── Cortexo Server Metrics Collector ──────────────────────────────
# SSHes into each server via ProxyJump and collects system metrics.
# Outputs JSON array for the API to insert into server_resources.
# Usage: ./collect-metrics.sh <ip1> <ip2> ...
# ──────────────────────────────────────────────────────────────────

SSH_TIMEOUT=10
REMOTE_CMD='
cpu=$(top -bn1 | grep "Cpu(s)" | awk "{print \$2}" | cut -d. -f1-2 2>/dev/null || echo "0");
ram_info=$(free -m | awk "/^Mem:/ {print \$3,\$2}");
ram_used=$(echo $ram_info | awk "{print \$1}");
ram_total=$(echo $ram_info | awk "{print \$2}");
disk_info=$(df -BG / | awk "NR==2 {gsub(/G/,\"\"); print \$3,\$2}");
disk_used=$(echo $disk_info | awk "{print \$1}");
disk_total=$(echo $disk_info | awk "{print \$2}");
load=$(cat /proc/loadavg | awk "{print \$1,\$2,\$3}");
uptime_sec=$(cat /proc/uptime | awk "{print \$1}" | cut -d. -f1);
uptime_hrs=$((uptime_sec / 3600));
echo "${cpu}|${ram_used}|${ram_total}|${disk_used}|${disk_total}|${load}|${uptime_hrs}"
'

echo "["
FIRST=true

for IP in "$@"; do
  RESULT=$(ssh -o ConnectTimeout=$SSH_TIMEOUT \
               -o StrictHostKeyChecking=no \
               -o BatchMode=yes \
               "$IP" "$REMOTE_CMD" 2>/dev/null)

  if [ $? -eq 0 ] && [ -n "$RESULT" ]; then
    IFS='|' read -r cpu ram_used ram_total disk_used disk_total load uptime_hrs <<< "$RESULT"
    
    # Default values if parsing fails
    cpu=${cpu:-0}
    ram_used=${ram_used:-0}
    ram_total=${ram_total:-1}
    disk_used=${disk_used:-0}
    disk_total=${disk_total:-1}
    load=${load:-"0 0 0"}
    uptime_hrs=${uptime_hrs:-0}

    if [ "$FIRST" = true ]; then FIRST=false; else echo ","; fi
    printf '  {"serverIp":"%s","cpuPercent":%s,"ramUsedMb":%s,"ramTotalMb":%s,"diskUsedGb":%s,"diskTotalGb":%s,"loadAvg":"%s","uptimeHours":%s}' \
      "$IP" "$cpu" "$ram_used" "$ram_total" "$disk_used" "$disk_total" "$load" "$uptime_hrs"
  else
    # Server unreachable — report zeros
    if [ "$FIRST" = true ]; then FIRST=false; else echo ","; fi
    printf '  {"serverIp":"%s","cpuPercent":0,"ramUsedMb":0,"ramTotalMb":0,"diskUsedGb":0,"diskTotalGb":0,"loadAvg":"0 0 0","uptimeHours":0,"error":"unreachable"}' "$IP"
  fi
done

echo ""
echo "]"
