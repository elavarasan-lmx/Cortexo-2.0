<?php
/**
 * Winbull Bug Pattern Scanner v2.0
 *
 * Comprehensive scanner with 24 patterns including:
 * - PHP backend (CodeIgniter 3, Lumen)
 * - JavaScript frontend
 * - Business logic
 * - Security
 * - Architecture
 *
 * Usage:
 *   php winbull_scan_v2.php [OPTIONS]
 *
 * Options:
 *   --path=<dir>       Path to Winbull codebase
 *   --severity=<P0>    Filter by priority: P0, P1, P2, P3
 *   --category=<cat>   Filter by category: Security, Transaction, Business, Architecture
 *   --zone=<zone>      Scan only: web, mobile, lumen, js, all
 *   --security         Show only security patterns
 *   --output=<file>    Save JSON report
 *   --no-color         Disable ANSI colors
 *   --fast             Skip slow lumen scan
 *   --js-only          Scan only JavaScript files
 *
 * Examples:
 *   php winbull_scan_v2.php                    # Full scan
 *   php winbull_scan_v2.php --severity=P0      # P0 only
 *   php winbull_scan_v2.php --zone=web         # Web only
 *   php winbull_scan_v2.php --js-only          # JS only
 *   php winbull_scan_v2.php --fast             # Skip lumen (6583 files)
 *
 * Part of: Winbull DevOps Brain
 * Created: 2026-05-14
 */

$SCRIPT_DIR    = __DIR__;
$PATTERNS_FILE = $SCRIPT_DIR . '/winbull_bug_patterns_v2.json';
$REPORTS_DIR   = dirname($SCRIPT_DIR) . '/brain/winbull/_SYSTEM/scan_reports';

// Auto-detect Winbull path
$DEFAULT_PATHS = [
    '/run/media/lmx/LMX/Winbull/Personal/Devops/Project/winbullstaging',
    '/var/www/html/winbullstaging',
];

// Scan zones with their directories
$SCAN_ZONES = [
    'web'      => [
        'dirs'  => ['application/controllers', 'application/models', 'application/helpers'],
        'ext'  => ['php'],
    ],
    'mobile'   => [
        'dirs'  => ['mobileapi/application/controllers', 'mobileapi/application/models'],
        'ext'  => ['php'],
    ],
    'lumen'    => [
        'dirs'  => ['lmxtrade/winbullliteapi/app', 'lmxtrade/winbullliteapi/routes'],
        'ext'  => ['php'],
    ],
    'js'       => [
        'dirs'  => ['assets/js', 'assets/js/customer', 'admin/assets/js'],
        'ext'  => ['js'],
    ],
    'socket'   => [
        'dirs'  => ['lmxtrade'],
        'ext'  => ['js'],
    ],
];

// ─── Parse CLI args ────────────────────────────────────────────────────────

$args = [];
foreach (array_slice($argv, 1) as $arg) {
    if (preg_match('/^--([^=]+)(?:=(.*))?$/', $arg, $m)) {
        $args[$m[1]] = isset($m[2]) ? $m[2] : true;
    }
}

$useColor     = !isset($args['no-color']);
$filterSev    = $args['severity'] ?? null;
$filterCat    = $args['category'] ?? null;
$filterZone   = $args['zone'] ?? null;
$securityOnly = isset($args['security']);
$outputFile   = $args['output'] ?? null;
$fastMode     = isset($args['fast']);
$jsOnly       = isset($args['js-only']);

// Resolve path
$scanPath = $args['path'] ?? null;
if (!$scanPath) {
    foreach ($DEFAULT_PATHS as $p) {
        if (is_dir($p)) { $scanPath = $p; break; }
    }
}

// ─── Color helpers ─────────────────────────────────────────────────────────

function c($text, $color) {
    global $useColor;
    if (!$useColor) return $text;
    $codes = ['red'=>31,'green'=>32,'yellow'=>33,'blue'=>34,'cyan'=>36,'white'=>37,'bold'=>1,'reset'=>0];
    return "\033[" . ($codes[$color] ?? 0) . "m$text\033[0m";
}

function sev_color($sev) {
    return match($sev) {
        'CRITICAL' => c($sev, 'red'),
        'HIGH'     => c($sev, 'yellow'),
        'MEDIUM'   => c('MEDIUM', 'cyan'),
        'LOW'      => c('LOW', 'white'),
        default    => $sev,
    };
}

function pri_icon($p) {
    return match($p) {
        'P0' => '🔴',
        'P1' => '🟡',
        'P2' => '🔵',
        'P3' => '⚪',
        default => '❓',
    };
}

// ─── Banner ────────────────────────────────────────────────────────────────

echo "\n";
echo c("  ╔══════════════════════════════════════════════════════════════╗\n", 'bold');
echo c("  ║     WINBULL BUG PATTERN SCANNER v2.0                        ║\n", 'bold');
echo c("  ║     24 Patterns • PHP + JS + Security + Business            ║\n", 'bold');
echo c("  ╚══════════════════════════════════════════════════════════════╝\n", 'bold');
echo "\n";

// ─── Validate ──────────────────────────────────────────────────────────────

if (!$scanPath || !is_dir($scanPath)) {
    echo c("  ✗ ERROR: ", 'red') . "Winbull codebase not found.\n";
    echo "  Run: sshfs prod-gateway:/var/www/html/winbullstaging Project/winbullstaging\n\n";
    exit(1);
}

if (!file_exists($PATTERNS_FILE)) {
    echo c("  ✗ ERROR: ", 'red') . "winbull_bug_patterns_v2.json not found\n\n";
    exit(1);
}

$patternsConfig = json_decode(file_get_contents($PATTERNS_FILE), true);
if (!$patternsConfig) {
    echo c("  ✗ ERROR: ", 'red') . "Failed to parse patterns file\n\n";
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
if ($filterCat) {
    $patterns = array_filter($patterns, fn($p) => strtolower($p['category']) === strtolower($filterCat));
}

echo "  " . c("Path:      ", 'bold') . $scanPath . "\n";
echo "  " . c("Patterns:  ", 'bold') . count($patterns) . " active";
if ($filterSev)   echo " (severity: $filterSev)";
if ($filterCat)   echo " (category: $filterCat)";
if ($filterZone)  echo " (zone: $filterZone)";
if ($fastMode)    echo " " . c("(fast mode)", 'yellow');
echo "\n";

// ─── File collection ───────────────────────────────────────────────────────

function collect_files($baseDir, $zoneConfig, $maxFiles = 5000) {
    $files = [];
    foreach ($zoneConfig['dirs'] as $subDir) {
        $fullDir = $baseDir . '/' . $subDir;
        if (!is_dir($fullDir)) continue;

        $iter = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($fullDir, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iter as $file) {
            if ($file->isDir()) continue;
            $ext = $file->getExtension();
            if (!in_array($ext, $zoneConfig['ext'])) continue;
            $files[] = $file->getPathname();
            if (count($files) >= $maxFiles) break 2;
        }
    }
    return $files;
}

$allFiles = [];

// Determine zones to scan
if ($jsOnly) {
    $zonesToScan = ['js' => $SCAN_ZONES['js'], 'socket' => $SCAN_ZONES['socket']];
} elseif ($filterZone && isset($SCAN_ZONES[$filterZone])) {
    $zonesToScan = [$filterZone => $SCAN_ZONES[$filterZone]];
} else {
    $zonesToScan = $SCAN_ZONES;
    if ($fastMode) unset($zonesToScan['lumen']);
}

echo "  " . c("Scanning zones:", 'bold') . " " . implode(', ', array_keys($zonesToScan)) . "\n";

foreach ($zonesToScan as $zone => $config) {
    $files = collect_files($scanPath, $config);
    if (empty($files)) {
        echo "  " . c("⚠ SKIP: ", 'yellow') . "$zone (not found)\n";
        continue;
    }
    $allFiles[$zone] = $files;
    echo "  " . c("✓ ", 'green') . str_pad($zone, 10) . c(count($files) . " files", 'white') . "\n";
}

if (empty($allFiles)) {
    echo c("  ✗ No files found to scan\n\n", 'red');
    exit(1);
}

$totalFiles = array_sum(array_map('count', $allFiles));
echo "\n  Total: " . c($totalFiles . " files", 'bold') . " to scan\n";
echo "  " . c("────────────────────────────────────────────────────────────────", 'white') . "\n\n";

// ─── Scanner ───────────────────────────────────────────────────────────────

function scan_file($pattern, $filepath, $content = null) {
    $hits = [];
    $isJs = str_ends_with($filepath, '.js');

    if ($content === null) {
        $content = @file_get_contents($filepath);
        if ($content === false) return $hits;
    }

    $lines = explode("\n", $content);
    $inverted = !empty($pattern['inverted_match']);

    // Regex scan
    if (!empty($pattern['regex'])) {
        $regexFlags = 'mi' . (str_contains($pattern['regex_flags'] ?? '', 's') ? 's' : '');
        $regex = '/' . $pattern['regex'] . '/' . $regexFlags;

        foreach ($lines as $lineNum => $line) {
            $trimmed = ltrim($line);
            if (str_starts_with($trimmed, '//') || str_starts_with($trimmed, '*') || str_starts_with($trimmed, '#')) continue;

            $matched = @preg_match($regex, $line);

            if ($inverted) {
                // For inverted patterns, flag if NOT found
                if (!$matched && !empty($pattern['context'])) {
                    $hits[] = [
                        'file'    => $filepath,
                        'line'    => $lineNum + 1,
                        'content' => trim($line),
                        'type'    => 'missing_pattern',
                        'needs_manual_check' => true,
                    ];
                }
            } else {
                if ($matched) {
                    $hits[] = [
                        'file'    => $filepath,
                        'line'    => $lineNum + 1,
                        'content' => trim(substr($line, 0, 120)),
                        'type'    => 'regex_match',
                        'needs_manual_check' => !empty($pattern['manual_check']),
                    ];
                }
            }
        }
    }

    // Plain string scan
    if (!empty($pattern['grep_string'])) {
        if (stripos($content, $pattern['grep_string']) !== false) {
            $hits[] = [
                'file'    => $filepath,
                'line'    => 0,
                'content' => "(found: {$pattern['grep_string']})",
                'type'    => 'string_match',
                'needs_manual_check' => !empty($pattern['manual_check']),
            ];
        }
    }

    return $hits;
}

// Pattern-to-zone mapping (optimization)
function should_scan_pattern_in_zone($pattern, $zone) {
    // JS-only patterns only scan in js/socket zones
    if (!empty($pattern['scan_js'])) {
        return in_array($zone, ['js', 'socket']);
    }
    // Mobile auth only in mobile zone
    if ($pattern['id'] === 'SEC-004') {
        return $zone === 'mobile';
    }
    // Socket patterns only in socket zone
    if ($pattern['id'] === 'BIZ-005') {
        return $zone === 'socket';
    }
    return true;
}

$results = [];
$totalHits = 0;
$p0Hits = 0;

echo c("  Scanning... ", 'cyan');

foreach ($patterns as $pattern) {
    $patternHits = [];

    foreach ($allFiles as $zone => $files) {
        if (!should_scan_pattern_in_zone($pattern, $zone)) continue;

        foreach ($files as $filepath) {
            $hits = scan_file($pattern, $filepath);
            $patternHits = array_merge($patternHits, $hits);
        }
    }

    if (!empty($patternHits)) {
        $results[$pattern['id']] = [
            'pattern'    => $pattern,
            'hit_count'  => count($patternHits),
            'hits'       => array_slice($patternHits, 0, 20), // Cap at 20 per pattern
            'manual_check_count' => count(array_filter($patternHits, fn($h) => $h['needs_manual_check'])),
        ];
        $totalHits += count($patternHits);
        if ($pattern['priority'] === 'P0') $p0Hits += count($patternHits);
    }
}

echo c("done\n\n", 'green');

// ─── Output ────────────────────────────────────────────────────────────────

$p0 = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P0');
$p1 = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P1');
$p2 = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P2');
$p3 = array_filter($results, fn($r) => $r['pattern']['priority'] === 'P3');

echo c("  ════════════════════════════════════════════════════════════════════\n", 'bold');
echo c("  SCAN RESULTS\n", 'bold');
echo c("  ════════════════════════════════════════════════════════════════════\n", 'bold');

$maxHitsPerPattern = 5;

function print_results($results, $label) {
    global $scanPath, $maxHitsPerPattern;
    if (empty($results)) {
        echo c("  $label: ", 'white') . c("none", 'green') . "\n\n";
        return;
    }

    echo c("  ── $label ─────────────────────────────────────────────────────\n", 'bold');

    foreach ($results as $id => $result) {
        $p = $result['pattern'];
        $hits = $result['hits'];
        $count = $result['hit_count'];

        echo "\n  " . pri_icon($p['priority']) . " " . c("[{$p['id']}]", 'bold') . " " . c($p['name'], 'white') . "\n";
        echo "     " . sev_color($p['severity']) . " | " . c($p['category'], 'cyan') . " | ref: " . c($p['fix_ref'], 'yellow') . "\n";
        echo "     " . $p['description'] . "\n";
        echo "     " . c("Hits: $count", $count > 0 ? 'red' : 'green');
        if ($result['manual_check_count'] > 0) {
            echo " " . c("(⚠ {$result['manual_check_count']} need manual check)", 'yellow');
        }
        echo "\n";

        $shown = 0;
        foreach ($hits as $hit) {
            if ($shown >= $maxHitsPerPattern) {
                echo "     " . c("... +" . ($count - $shown) . " more", 'white') . "\n";
                break;
            }
            $shortFile = str_replace($scanPath . '/', '', $hit['file']);
            $lineRef = $hit['line'] > 0 ? "L{$hit['line']}" : "(file)";
            $flag = $hit['needs_manual_check'] ? c("⚠ ", 'yellow') : c("→", 'green');
            echo "     $flag $shortFile:" . c($lineRef, 'cyan') . "\n";
            if (!empty($hit['content']) && strlen($hit['content']) > 5) {
                $preview = substr($hit['content'], 0, 100);
                echo "       " . c($preview, 'white') . "\n";
            }
            $shown++;
        }
    }
    echo "\n";
}

print_results($p0, "P0 — CRITICAL");
print_results($p1, "P1 — HIGH");
print_results($p2, "P2 — MEDIUM");
print_results($p3, "P3 — LOW");

// ─── Summary ──────────────────────────────────────────────────────────────

$patternsFound = count($results);
$patternsScanned = count($patterns);

echo c("  ════════════════════════════════════════════════════════════════════\n", 'bold');
echo c("  SUMMARY\n", 'bold');
echo c("  ════════════════════════════════════════════════════════════════════\n", 'bold');

echo "  Files scanned:      " . c($totalFiles, 'bold') . "\n";
echo "  Patterns checked:  " . c($patternsScanned, 'bold') . "\n";
echo "  Patterns with hits:" . c($patternsFound, $patternsFound > 0 ? 'red' : 'green') . "\n";
echo "  Total hits:         " . c($totalHits, $totalHits > 0 ? 'red' : 'green') . "\n";
echo "  P0 hits:            " . c($p0Hits, $p0Hits > 0 ? 'red' : 'green') . "\n";

$manualCount = count(array_filter($results, fn($r) => $r['manual_check_count'] > 0));
if ($manualCount > 0) {
    echo "  Manual checks needed:" . c($manualCount, 'yellow') . " patterns\n";
}

echo "\n";
if ($p0Hits > 0) {
    echo "  " . c("⚠ ACTION: $p0Hits P0 hits. Fix IMMEDIATELY.", 'red') . "\n";
} else {
    echo "  " . c("✓ No P0 hits found.", 'green') . "\n";
}

echo "\n  Next steps:\n";
echo "    1. Review hits above — ⚠ = needs manual verification\n";
echo "    2. Run: " . c("/bug-intake [id] [file] [line]", 'cyan') . " for each confirmed bug\n";
echo "    3. Run: " . c("/fix-bug [BUG_ID]", 'cyan') . " to fix\n";
echo "    4. Run: " . c("/scan-cross-module [pattern]", 'cyan') . " after fix\n\n";

// ─── Save Report ──────────────────────────────────────────────────────────

$date = date('Y-m-d');
$report = [
    'metadata' => [
        'tool'      => 'Winbull Bug Pattern Scanner v2.0',
        'version'   => '2.0',
        'scan_date' => $date,
        'scan_time' => date('H:i:s'),
        'scan_path' => $scanPath,
        'zones'     => array_keys($zonesToScan),
        'files_scanned' => $totalFiles,
        'patterns_used' => $patternsScanned,
        'fast_mode' => $fastMode,
    ],
    'summary' => [
        'total_hits'     => $totalHits,
        'patterns_hit'   => $patternsFound,
        'p0_hits'        => $p0Hits,
        'p1_hits'        => count($p1),
        'p2_hits'        => count($p2),
        'p3_hits'        => count($p3),
        'manual_checks'  => $manualCount,
    ],
    'results' => $results,
];

$saveFile = $outputFile ?? "$REPORTS_DIR/scan_v2_{$date}.json";
$saveDir  = dirname($saveFile);
if (!is_dir($saveDir)) mkdir($saveDir, 0755, true);

file_put_contents($saveFile, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo "  " . c("✓ Report: ", 'green') . $saveFile . "\n\n";
echo "  Done.\n\n";