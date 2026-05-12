<?php
/**
 * Winbull Bug Pattern Scanner v1.0
 *
 * Scans the Winbull CodeIgniter 3 codebase for known bug patterns.
 * Adapted from eTail AI_Bug_Fix_System/fingerprint.php
 *
 * Usage:
 *   php winbull_scan.php [OPTIONS]
 *
 * Options:
 *   --path=<dir>     Path to Winbull codebase (default: auto-detect)
 *   --module=<name>  Scan only a specific module (e.g., Booking, Admin)
 *   --severity=<P0>  Filter by priority: P0, P1, P2, P3 (default: all)
 *   --security       Show only security patterns
 *   --output=<file>  Save JSON report to file
 *   --no-color       Disable ANSI color output
 *
 * Examples:
 *   php winbull_scan.php
 *   php winbull_scan.php --severity=P0
 *   php winbull_scan.php --path=/run/media/lmx/LMX/Winbull/Personal/Devops/Project/winbullstaging
 *   php winbull_scan.php --output=brain/winbull/_SYSTEM/scan_results.json
 *
 * Part of: Winbull DevOps Brain
 * Created: 2026-05-12
 */

// ─── Config ──────────────────────────────────────────────────────────────────

$SCRIPT_DIR   = __DIR__;
$PATTERNS_FILE = $SCRIPT_DIR . '/winbull_bug_patterns.json';
$REPORTS_DIR   = dirname($SCRIPT_DIR) . '/brain/winbull/_SYSTEM/scan_reports';

// Auto-detect Winbull path
$DEFAULT_PATHS = [
    '/run/media/lmx/LMX/Winbull/Personal/Devops/Project/winbullstaging',
    '/var/www/html/winbullstaging',
];

// Directories to scan inside the codebase
$SCAN_DIRS = [
    'web_controllers'    => 'application/controllers',
    'web_models'         => 'application/models',
    'mobile_controllers' => 'mobileapi/application/controllers',
    'mobile_models'      => 'mobileapi/application/models',
    'lumen_engine'       => 'lmxtrade/winbullliteapi',
];

// ─── Parse CLI arguments ──────────────────────────────────────────────────────

$args = [];
foreach (array_slice($argv, 1) as $arg) {
    if (preg_match('/^--([^=]+)(?:=(.*))?$/', $arg, $m)) {
        $args[$m[1]] = isset($m[2]) ? $m[2] : true;
    }
}

$useColor    = !isset($args['no-color']);
$filterSev   = $args['severity'] ?? null;
$filterMod   = $args['module']   ?? null;
$securityOnly = isset($args['security']);
$outputFile  = $args['output']   ?? null;

// Resolve codebase path
$scanPath = null;
if (isset($args['path'])) {
    $scanPath = rtrim($args['path'], '/');
} else {
    foreach ($DEFAULT_PATHS as $p) {
        if (is_dir($p)) { $scanPath = $p; break; }
    }
}

// ─── Color helpers ───────────────────────────────────────────────────────────

function c($text, $color) {
    global $useColor;
    if (!$useColor) return $text;
    $codes = ['red'=>31,'green'=>32,'yellow'=>33,'blue'=>34,'cyan'=>36,'white'=>37,'bold'=>1,'reset'=>0];
    return "\033[" . ($codes[$color] ?? 0) . "m$text\033[0m";
}

function severity_color($sev) {
    return match($sev) {
        'CRITICAL' => c($sev, 'red'),
        'HIGH'     => c($sev, 'yellow'),
        'MEDIUM'   => c('MEDIUM', 'cyan'),
        'LOW'      => c('LOW', 'white'),
        default    => $sev,
    };
}

function priority_icon($p) {
    return match($p) {
        'P0' => '🔴',
        'P1' => '🟡',
        'P2' => '🔵',
        'P3' => '⚪',
        default => '❓',
    };
}

// ─── Banner ───────────────────────────────────────────────────────────────────

echo "\n";
echo c("  ╔══════════════════════════════════════════════════════════════╗\n", 'bold');
echo c("  ║      WINBULL BUG PATTERN SCANNER v1.0                       ║\n", 'bold');
echo c("  ╚══════════════════════════════════════════════════════════════╝\n", 'bold');
echo "\n";

// ─── Validate ─────────────────────────────────────────────────────────────────

if (!$scanPath || !is_dir($scanPath)) {
    echo c("  ✗ ERROR: ", 'red') . "Winbull codebase not found.\n";
    echo "  Either:\n";
    echo "    1. Mount SSHFS first: " . c("sshfs prod-gateway:/var/www/html/winbullstaging Project/winbullstaging", 'cyan') . "\n";
    echo "    2. Run with: " . c("php winbull_scan.php --path=<your_path>", 'cyan') . "\n\n";
    exit(1);
}

if (!file_exists($PATTERNS_FILE)) {
    echo c("  ✗ ERROR: ", 'red') . "winbull_bug_patterns.json not found at: $PATTERNS_FILE\n\n";
    exit(1);
}

$patternsConfig = json_decode(file_get_contents($PATTERNS_FILE), true);
if (!$patternsConfig) {
    echo c("  ✗ ERROR: ", 'red') . "Failed to parse winbull_bug_patterns.json\n\n";
    exit(1);
}

$patterns = $patternsConfig['patterns'];

// Apply filters
if ($securityOnly) {
    $patterns = array_filter($patterns, fn($p) => $p['category'] === 'Security');
}
if ($filterSev) {
    $patterns = array_filter($patterns, fn($p) => $p['priority'] === strtoupper($filterSev));
}

echo "  " . c("Path:    ", 'bold') . $scanPath . "\n";
echo "  " . c("Patterns:", 'bold') . " " . count($patterns) . " active";
if ($filterSev)   echo " (filter: $filterSev)";
if ($securityOnly) echo " (security only)";
echo "\n";
echo "  " . c("Dirs:    ", 'bold') . count($SCAN_DIRS) . " scan targets\n";
echo "  " . c("────────────────────────────────────────────────────────────────", 'white') . "\n\n";

// ─── File collection ─────────────────────────────────────────────────────────

function collect_php_files($baseDir, $subDir) {
    $fullDir = $baseDir . '/' . $subDir;
    if (!is_dir($fullDir)) return [];

    $files = [];
    $iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($fullDir, FilesystemIterator::SKIP_DOTS));
    foreach ($iter as $file) {
        if ($file->getExtension() === 'php') {
            $files[] = $file->getPathname();
        }
    }
    return $files;
}

// Collect all PHP files per scan zone
$allFiles = [];
foreach ($SCAN_DIRS as $zone => $subDir) {
    $fullDir = $scanPath . '/' . $subDir;
    if (!is_dir($fullDir)) {
        echo "  " . c("⚠ SKIP: ", 'yellow') . "$subDir (not found)\n";
        continue;
    }
    $files = collect_php_files($scanPath, $subDir);
    $allFiles[$zone] = $files;
    echo "  " . c("✓ ", 'green') . str_pad($zone, 22) . count($files) . " PHP files\n";
}

$totalFiles = array_sum(array_map('count', $allFiles));
echo "\n  Total: " . c($totalFiles . " PHP files", 'bold') . " to scan\n\n";
echo "  " . c("────────────────────────────────────────────────────────────────", 'white') . "\n\n";

// ─── Pattern scanning ────────────────────────────────────────────────────────

function scan_pattern($pattern, $files, $zone) {
    $hits = [];

    foreach ($files as $filepath) {
        $content = @file_get_contents($filepath);
        if ($content === false) continue;

        $lines = explode("\n", $content);

        // Regex scan
        if (!empty($pattern['regex'])) {
            $flags = $pattern['regex_flags'] ?? '';
            $regexFlags = 'mi' . (str_contains($flags, 's') ? 's' : '');
            $regex = '/' . $pattern['regex'] . '/' . $regexFlags;

            foreach ($lines as $lineNum => $line) {
                if (@preg_match($regex, $line)) {
                    // Skip obvious comments
                    $trimmed = ltrim($line);
                    if (str_starts_with($trimmed, '//') || str_starts_with($trimmed, '*') || str_starts_with($trimmed, '#')) continue;

                    $hits[] = [
                        'file'    => $filepath,
                        'zone'    => $zone,
                        'line'    => $lineNum + 1,
                        'content' => trim($line),
                        'needs_manual_check' => !empty($pattern['context_check']),
                    ];
                }
            }
        }

        // Plain grep_string scan (no regex)
        if (!empty($pattern['grep_string'])) {
            if (stripos($content, $pattern['grep_string']) === false) {
                // If grep_string not found in file — this could be the absence we're looking for
                // Only flag if this is the mobile controllers zone and pattern is SEC-005
                if ($pattern['id'] === 'SEC-005' && $zone === 'mobile_controllers') {
                    $hits[] = [
                        'file'    => $filepath,
                        'zone'    => $zone,
                        'line'    => 0,
                        'content' => "(WhiteListDomainMiddleware NOT found in file)",
                        'needs_manual_check' => true,
                    ];
                }
            }
        }
    }

    return $hits;
}

$results = [];
$totalHits = 0;
$p0Hits = 0;

foreach ($patterns as $pattern) {
    $patternHits = [];

    foreach ($allFiles as $zone => $files) {
        $hits = scan_pattern($pattern, $files, $zone);
        $patternHits = array_merge($patternHits, $hits);
    }

    if (!empty($patternHits)) {
        $results[$pattern['id']] = [
            'pattern'   => $pattern,
            'hit_count' => count($patternHits),
            'hits'      => $patternHits,
        ];
        $totalHits += count($patternHits);
        if ($pattern['priority'] === 'P0') $p0Hits += count($patternHits);
    }
}

// ─── Output ──────────────────────────────────────────────────────────────────

$p0Results = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P0');
$p1Results = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P1');
$p2Results = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P2');
$p3Results = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P3');

echo c("  ══════════════════════════════════════════════════════════════\n", 'bold');
echo c("  SCAN RESULTS\n", 'bold');
echo c("  ══════════════════════════════════════════════════════════════\n\n", 'bold');

function print_pattern_results($results, $label, $maxHitsPerPattern = 5) {
    if (empty($results)) return;

    echo c("  ── $label ──────────────────────────────────────────────────\n", 'bold');

    foreach ($results as $id => $result) {
        $p = $result['pattern'];
        $hits = $result['hits'];
        $count = $result['hit_count'];

        echo "\n  " . priority_icon($p['priority']) . " " . c("[{$p['id']}]", 'bold') . " " . c($p['name'], 'white') . "\n";
        echo "     " . severity_color($p['severity']) . " | " . c($p['category'], 'cyan') . " | fix_ref: " . c($p['fix_ref'], 'yellow') . "\n";
        echo "     " . $p['description'] . "\n";
        echo "     " . c("Hits: $count", $count > 0 ? 'red' : 'green') . "\n";

        if (!empty($p['context_check'])) {
            echo "     " . c("⚠ MANUAL CHECK REQUIRED: ", 'yellow') . $p['context_check'] . "\n";
        }

        $shown = 0;
        foreach ($hits as $hit) {
            if ($shown >= $maxHitsPerPattern) {
                echo "     " . c("... and " . ($count - $shown) . " more", 'white') . "\n";
                break;
            }
            $shortFile = str_replace($GLOBALS['scanPath'] . '/', '', $hit['file']);
            $lineRef = $hit['line'] > 0 ? "L{$hit['line']}" : "(whole file)";
            echo "     " . c("→", 'green') . " $shortFile:" . c($lineRef, 'cyan') . "\n";
            if (!empty($hit['content'])) {
                $preview = substr($hit['content'], 0, 100);
                echo "       " . c($preview, 'white') . "\n";
            }
            $shown++;
        }
    }
    echo "\n";
}

print_pattern_results($p0Results, "P0 — CRITICAL (Fix Immediately)");
print_pattern_results($p1Results, "P1 — HIGH (Fix This Sprint)");
print_pattern_results($p2Results, "P2 — MEDIUM (Backlog)");
print_pattern_results($p3Results, "P3 — LOW (Nice to Have)");

// ─── Summary ─────────────────────────────────────────────────────────────────

$patternsFound = count($results);
$patternsScanned = count($patterns);

echo c("  ══════════════════════════════════════════════════════════════\n", 'bold');
echo c("  SUMMARY\n", 'bold');
echo c("  ══════════════════════════════════════════════════════════════\n\n", 'bold');

echo "  Files scanned:       " . c($totalFiles, 'bold') . "\n";
echo "  Patterns checked:    " . c($patternsScanned, 'bold') . "\n";
echo "  Patterns with hits:  " . c($patternsFound, $patternsFound > 0 ? 'red' : 'green') . "\n";
echo "  Total hits:          " . c($totalHits, $totalHits > 0 ? 'red' : 'green') . "\n";
echo "  P0 hits:             " . c($p0Hits, $p0Hits > 0 ? 'red' : 'green') . "\n\n";

if ($p0Hits > 0) {
    echo "  " . c("⚠ ACTION REQUIRED: $p0Hits P0 hits found. Run /fix-bug on these FIRST.", 'red') . "\n\n";
} else {
    echo "  " . c("✓ No P0 hits found. Good.", 'green') . "\n\n";
}

echo "  Next steps:\n";
echo "    1. Review P0/P1 hits above\n";
echo "    2. For MANUAL CHECK items — open file and verify the context\n";
echo "    3. Run: " . c("/bug-intake [pattern_id] [file] [line]", 'cyan') . " to log each confirmed bug\n";
echo "    4. Run: " . c("/fix-bug [BUG_ID]", 'cyan') . " to fix\n\n";

// ─── Save JSON report ────────────────────────────────────────────────────────

$date = date('Y-m-d');
$time = date('H:i:s');

$report = [
    'metadata' => [
        'tool'          => 'Winbull Bug Pattern Scanner v1.0',
        'scan_date'     => $date,
        'scan_time'     => $time,
        'scan_path'     => $scanPath,
        'files_scanned' => $totalFiles,
        'patterns_used' => $patternsScanned,
    ],
    'summary' => [
        'total_hits'      => $totalHits,
        'patterns_hit'    => $patternsFound,
        'p0_hits'         => $p0Hits,
        'p1_hits'         => count(array_filter($results, fn($r) => $r['pattern']['priority'] === 'P1')),
        'p2_hits'         => count(array_filter($results, fn($r) => $r['pattern']['priority'] === 'P2')),
        'p3_hits'         => count(array_filter($results, fn($r) => $r['pattern']['priority'] === 'P3')),
    ],
    'results' => $results,
];

$saveFile = $outputFile ?? "$REPORTS_DIR/scan_{$date}.json";
$saveDir  = dirname($saveFile);

if (!is_dir($saveDir)) {
    mkdir($saveDir, 0755, true);
}

file_put_contents($saveFile, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo "  " . c("✓ Report saved: ", 'green') . $saveFile . "\n\n";
echo "  Done.\n\n";
