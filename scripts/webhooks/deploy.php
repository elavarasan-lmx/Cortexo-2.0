<?php
/**
 * Winbull Deploy Webhook Handler v1.0
 * Adapted from eTail deploy.php (Logimax-Technologies/etail_development_src)
 *
 * Install on server at:
 *   /var/www/html/vijaybullion_staging/webhooks/deploy.php
 *
 * Configure GitHub webhook:
 *   URL: https://your-server.com/webhooks/deploy.php
 *   Content type: application/json
 *   Secret: (set WEBHOOK_SECRET env var on server)
 *   Events: Push events
 *
 * Required server env vars (set in /etc/environment or systemd):
 *   WEBHOOK_SECRET=your-secret-here
 *   DEVOPS_API_URL=http://your-cortexo-server:4000  (optional)
 *   DEVOPS_WEBHOOK_SECRET=same-as-above-or-separate  (optional)
 */

header('Content-Type: text/plain; charset=utf-8');

// =============================================================================
// BRANCH → ENVIRONMENT MAPPING
// =============================================================================

$ENVIRONMENTS = [
    'V4.0.3' => [
        'name'         => 'Staging',
        'folder'       => 'vijaybullion_staging',
        'path'         => '/var/www/html/vijaybullion_staging',
        'maintenance'  => false,
        'deploy_mode'  => 'git_pull',
    ],
    'main' => [
        'name'         => 'Production',
        'folder'       => 'vijaybullion',
        'path'         => '/var/www/html/vijaybullion',
        'maintenance'  => true,
        'deploy_mode'  => 'git_pull',
    ],
    'dev' => [
        'name'         => 'Dev',
        'folder'       => 'vijaybullion_dev',
        'path'         => '/var/www/html/vijaybullion_dev',
        'maintenance'  => false,
        'deploy_mode'  => 'git_pull',
    ],
];

// =============================================================================
// CONFIGURATION
// =============================================================================

$CONFIG = [
    'secret'           => getenv('WEBHOOK_SECRET') ?: ($_SERVER['WEBHOOK_SECRET'] ?? ''),
    'log_file'         => '/var/www/html/vijaybullion_staging/webhooks/webhook.log',
    'devops_api_url'   => getenv('DEVOPS_API_URL')        ?: '',
    'devops_secret'    => getenv('DEVOPS_WEBHOOK_SECRET') ?: (getenv('WEBHOOK_SECRET') ?: ''),
    'ssh_key'          => '/home/ubuntu/.ssh/id_ed25519',
    'repo'             => 'Logimax-Technologies/WTWeb-VijayBullion',
];

if (empty($CONFIG['secret'])) {
    http_response_code(500);
    die("WEBHOOK_SECRET env var not set on server.\n");
}

// =============================================================================
// LOGGING
// =============================================================================

function wlog($level, $message) {
    global $CONFIG;
    $entry = "[" . date('Y-m-d H:i:s') . "] [$level] $message\n";
    if (!empty($CONFIG['log_file'])) {
        @file_put_contents($CONFIG['log_file'], $entry, FILE_APPEND | LOCK_EX);
    }
}

wlog('INFO', '=== Webhook received ===');
wlog('INFO', 'Method: ' . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    wlog('ERROR', 'Method not allowed');
    die("Method not allowed\n");
}

$input = file_get_contents('php://input');
if (empty($input)) {
    http_response_code(400);
    wlog('ERROR', 'Empty payload');
    die("Empty payload\n");
}

// =============================================================================
// HMAC SIGNATURE VERIFICATION
// =============================================================================

$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
if (empty($signature)) {
    http_response_code(403);
    wlog('ERROR', 'Missing X-Hub-Signature-256 header');
    die("Missing signature\n");
}

$expected = 'sha256=' . hash_hmac('sha256', $input, $CONFIG['secret']);
if (!hash_equals($expected, $signature)) {
    http_response_code(403);
    wlog('ERROR', 'Invalid signature — forged request rejected');
    die("Invalid signature\n");
}

wlog('INFO', 'Signature verified ✓');

// =============================================================================
// PARSE PAYLOAD
// =============================================================================

$data = json_decode($input, true);
if (!$data) {
    http_response_code(400);
    wlog('ERROR', 'Invalid JSON payload');
    die("Invalid JSON\n");
}

// Handle GitHub ping event (fires on first webhook setup)
$event = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? 'push';
if ($event === 'ping') {
    wlog('INFO', 'GitHub ping received — webhook configured correctly ✓');
    echo "pong\n";
    exit;
}

// =============================================================================
// DETERMINE BRANCH & ENVIRONMENT
// =============================================================================

$ref    = $data['ref'] ?? '';
$branch = str_replace('refs/heads/', '', $ref);

wlog('INFO', "Branch: $branch | Event: $event");

if (!isset($ENVIRONMENTS[$branch])) {
    wlog('WARNING', "Branch '$branch' not in environment map — ignoring");
    echo "Branch $branch not configured for deployment\n";
    exit;
}

$env       = $ENVIRONMENTS[$branch];
$env_path  = $env['path'];
$env_name  = $env['name'];
$deploy_sh = $env_path . '/deploy.sh';

wlog('INFO', "Environment: $env_name ($env_path)");

// =============================================================================
// EXTRACT COMMIT INFO
// =============================================================================

$commit_id    = $data['head_commit']['id']            ?? substr(uniqid(), 0, 7);
$commit_msg   = $data['head_commit']['message']        ?? 'No message';
$author       = $data['head_commit']['author']['name'] ?? ($data['pusher']['name'] ?? 'Unknown');
$repo_name    = $data['repository']['full_name']       ?? $CONFIG['repo'];

// Sanitize commit message for shell (strip quotes, newlines)
$commit_msg_clean = str_replace(["\r\n", "\r", "\n", '"', "'"], [' ', ' ', ' ', '', ''], $commit_msg);

wlog('INFO', "Commit: $commit_id by $author");
wlog('INFO', "Message: " . substr($commit_msg_clean, 0, 100));

// =============================================================================
// EXECUTE DEPLOYMENT
// =============================================================================

$output  = '';
$success = false;

if (file_exists($deploy_sh)) {
    // Use our winbull_deploy.sh (the proper way)
    $ssh_key = $CONFIG['ssh_key'];
    $command = sprintf(
        'cd %s && GIT_SSH_COMMAND="ssh -i %s -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" bash %s %s 2>&1',
        escapeshellarg($env_path),
        escapeshellarg($ssh_key),
        escapeshellarg($deploy_sh),
        escapeshellarg($branch)
    );

    wlog('INFO', 'Executing deploy.sh...');
    $output = shell_exec($command) ?: '';
    wlog('INFO', 'Deploy output: ' . substr($output, 0, 3000));

    $has_error   = str_contains($output, '❌') || str_contains($output, 'fatal:')
                || str_contains($output, 'FAILED') || str_contains($output, 'Permission denied');
    $has_success = str_contains($output, '✅') || str_contains($output, 'Deployment complete')
                || str_contains($output, 'HEAD is now at') || str_contains($output, 'Already up to date');

    $success = $has_success && !$has_error;

    if (!$success) {
        wlog('ERROR', 'deploy.sh completed with errors. Full output: ' . substr($output, 0, 3000));
    }

    // ── Port_Max sub-deploy (if port_max/ files changed) ──
    $portmax_script  = $env_path . '/port_max/deploy.sh';
    $portmax_changed = false;

    if ($success && file_exists($portmax_script)) {
        foreach ($data['commits'] ?? [] as $commit) {
            foreach (array_merge($commit['added'] ?? [], $commit['modified'] ?? [], $commit['removed'] ?? []) as $file) {
                if (strpos($file, 'port_max/') === 0) { $portmax_changed = true; break 2; }
            }
        }
        if (!$portmax_changed && isset($data['head_commit'])) {
            foreach (array_merge($data['head_commit']['added'] ?? [], $data['head_commit']['modified'] ?? [], $data['head_commit']['removed'] ?? []) as $file) {
                if (strpos($file, 'port_max/') === 0) { $portmax_changed = true; break; }
            }
        }
        if ($portmax_changed) {
            wlog('INFO', 'Port_Max files changed — running port_max/deploy.sh...');
            $px_out = shell_exec(sprintf('cd %s && bash %s 2>&1', escapeshellarg($env_path), escapeshellarg($portmax_script)));
            wlog('INFO', 'Port_Max output: ' . substr($px_out, 0, 1000));
            $output .= "\n[PORT_MAX] $px_out";
        } else {
            wlog('INFO', 'No port_max changes — skipping port_max deploy');
        }
    }

} else {
    // Fallback: bare git pull (no deploy.sh on server yet)
    wlog('WARNING', 'deploy.sh not found — using fallback git pull');
    $ssh_key = $CONFIG['ssh_key'];
    $command = sprintf(
        'cd %s && GIT_SSH_COMMAND="ssh -i %s -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git fetch --all && git reset --hard origin/%s 2>&1',
        escapeshellarg($env_path),
        escapeshellarg($ssh_key),
        escapeshellarg($branch)
    );
    $output  = shell_exec($command) ?: '';
    $success = str_contains($output, 'HEAD is now at') || str_contains($output, 'Already up to date');
    wlog('INFO', 'Fallback git output: ' . substr($output, 0, 500));
}

// =============================================================================
// SQL MIGRATIONS (after successful deploy)
// =============================================================================

if ($success) {
    $migrate_script = $env_path . '/scripts/run-migrations.sh';
    $migrate_dir    = $env_path . '/database/migrations';
    $config_file    = $env_path . '/global_configs.php';

    if (file_exists($migrate_script) && is_dir($migrate_dir)) {
        $sql_files = glob($migrate_dir . '/*.sql');
        if (!empty($sql_files)) {
            wlog('INFO', 'Running SQL migrations (' . count($sql_files) . ' files found)...');
            $migrate_cmd = sprintf(
                'bash %s --config %s --migrations %s --env %s --json 2>&1',
                escapeshellarg($migrate_script),
                escapeshellarg($config_file),
                escapeshellarg($migrate_dir),
                escapeshellarg(strtolower($env_name))
            );
            $migrate_out  = shell_exec($migrate_cmd) ?: '';
            $migrate_data = json_decode($migrate_out, true);

            if (isset($migrate_data['status']) && $migrate_data['status'] === 'error') {
                wlog('ERROR', 'Migration FAILED: ' . ($migrate_data['message'] ?? $migrate_out));
                $output .= "\n[MIGRATION FAILED] " . $migrate_out;
            } elseif (isset($migrate_data['status']) && $migrate_data['status'] === 'up_to_date') {
                wlog('INFO', 'Migrations: up to date');
            } else {
                wlog('INFO', 'Migrations OK: ' . substr($migrate_out, 0, 300));
                $output .= "\n[MIGRATIONS OK] " . ($migrate_data['message'] ?? $migrate_out);
            }
        } else {
            wlog('INFO', 'No pending .sql migration files');
        }
    }
}

// =============================================================================
// NOTIFY CORTEXO DASHBOARD (via /api/webhooks/deploy-log)
// =============================================================================

if (!empty($CONFIG['devops_api_url'])) {
    $log_lines = array_filter(explode("\n", substr($output, -2000)));
    $log_tail  = implode('|', $log_lines);

    $devops_data = json_encode([
        'client_id'      => 'winbull',
        'client_name'    => $repo_name,
        'environment'    => strtolower($env_name),
        'status'         => $success ? 'success' : 'failed',
        'branch'         => $branch,
        'commit_sha'     => $commit_id,
        'commit_message' => $commit_msg_clean,
        'triggered_by'   => $author,
        'trigger_type'   => 'webhook',
        'deploy_type'    => 'git_pull',
        'log_tail'       => $log_tail,
    ]);

    $ch = curl_init($CONFIG['devops_api_url'] . '/api/webhooks/deploy-log');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $devops_data,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Webhook-Secret: ' . $CONFIG['devops_secret'],
        ],
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);

    $devops_resp = curl_exec($ch);
    $devops_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $devops_err  = curl_error($ch);
    curl_close($ch);

    if ($devops_code >= 200 && $devops_code < 300) {
        wlog('INFO', "Cortexo dashboard notified ✓ (HTTP $devops_code)");
    } else {
        wlog('WARNING', "Cortexo notification failed (HTTP $devops_code): $devops_err");
    }
} else {
    wlog('INFO', 'DEVOPS_API_URL not set — skipping Cortexo notification');
}

// =============================================================================
// RESPONSE
// =============================================================================

$status = $success ? 'success' : 'failed';
$result = [
    'status'      => $status,
    'environment' => $env_name,
    'branch'      => $branch,
    'commit'      => $commit_id,
    'message'     => "Winbull deploy $status for $env_name ($branch)",
];

wlog('INFO', "Result: $status | $env_name | $branch | $commit_id");
wlog('INFO', '=== Webhook complete ===');

echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
