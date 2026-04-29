/**
 * Deprecation Engine — lib/deprecation-engine.ts
 * Scans codebases for deprecated APIs and generates migration plans.
 * Supports: CI3→CI4, PHP 7.4→8.2
 */

export interface DeprecationFinding {
  id: string;
  file: string;
  line: number;
  pattern: string;       // What was found
  category: string;      // 'ci3-api' | 'php-version' | 'function' | 'class'
  severity: 'critical' | 'high' | 'medium' | 'low';
  oldApi: string;
  newApi: string;
  migrationNote: string;
  autoFixable: boolean;
}

export interface DeprecationReport {
  scannedFiles: number;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  findings: DeprecationFinding[];
  estimatedHours: number;
  generatedAt: string;
}

/** CI3 → CI4 deprecated patterns */
const CI3_PATTERNS: Array<{
  regex: RegExp;
  oldApi: string;
  newApi: string;
  severity: DeprecationFinding['severity'];
  note: string;
  category: string;
}> = [
  { regex: /\$this->input->(?:get|post|server)\(/g, oldApi: '$this->input->get()', newApi: '$this->request->getGet()', severity: 'high', note: 'CI4 uses IncomingRequest service', category: 'ci3-api' },
  { regex: /\$this->load->model\(/g, oldApi: '$this->load->model()', newApi: 'model(ModelName::class)', severity: 'high', note: 'CI4 uses service locator or DI', category: 'ci3-api' },
  { regex: /\$this->load->view\(/g, oldApi: '$this->load->view()', newApi: 'return view()', severity: 'high', note: 'CI4 controllers return Response', category: 'ci3-api' },
  { regex: /\$this->load->library\(/g, oldApi: '$this->load->library()', newApi: 'service() or DI', severity: 'medium', note: 'CI4 uses Services container', category: 'ci3-api' },
  { regex: /\$this->load->helper\(/g, oldApi: '$this->load->helper()', newApi: 'helper()', severity: 'low', note: 'CI4 helper() function is global', category: 'ci3-api' },
  { regex: /\$this->db->(?:get|insert|update|delete)\(/g, oldApi: '$this->db->get()', newApi: '$builder->get()', severity: 'high', note: 'CI4 Query Builder API changed', category: 'ci3-api' },
  { regex: /\$this->session->(?:set_userdata|userdata)\(/g, oldApi: '$this->session->set_userdata()', newApi: 'session()->set()', severity: 'medium', note: 'CI4 session API simplified', category: 'ci3-api' },
  { regex: /extends\s+CI_Controller/g, oldApi: 'extends CI_Controller', newApi: 'extends BaseController', severity: 'critical', note: 'CI4 uses different base class', category: 'ci3-api' },
  { regex: /extends\s+CI_Model/g, oldApi: 'extends CI_Model', newApi: 'extends Model', severity: 'critical', note: 'CI4 Model is completely different', category: 'ci3-api' },
  { regex: /\$this->form_validation/g, oldApi: '$this->form_validation', newApi: '\\Config\\Services::validation()', severity: 'high', note: 'CI4 validation is a service', category: 'ci3-api' },
];

/** PHP 7.4 → 8.2 deprecated patterns */
const PHP_PATTERNS: Array<{
  regex: RegExp;
  oldApi: string;
  newApi: string;
  severity: DeprecationFinding['severity'];
  note: string;
  category: string;
}> = [
  { regex: /\beach\s*\(/g, oldApi: 'each()', newApi: 'foreach or array_values()', severity: 'critical', note: 'Removed in PHP 8.0', category: 'php-version' },
  { regex: /\bcreate_function\s*\(/g, oldApi: 'create_function()', newApi: 'Anonymous function (Closure)', severity: 'critical', note: 'Removed in PHP 8.0', category: 'php-version' },
  { regex: /\bmysql_(?:connect|query|fetch|close)\s*\(/g, oldApi: 'mysql_*()', newApi: 'mysqli_*() or PDO', severity: 'critical', note: 'Removed in PHP 7.0', category: 'php-version' },
  { regex: /\bereg\s*\(/g, oldApi: 'ereg()', newApi: 'preg_match()', severity: 'critical', note: 'Removed in PHP 7.0', category: 'php-version' },
  { regex: /\bsplit\s*\(/g, oldApi: 'split()', newApi: 'preg_split() or explode()', severity: 'high', note: 'Removed in PHP 7.0', category: 'php-version' },
  { regex: /\butf8_encode\s*\(/g, oldApi: 'utf8_encode()', newApi: 'mb_convert_encoding()', severity: 'medium', note: 'Deprecated in PHP 8.2', category: 'php-version' },
  { regex: /\butf8_decode\s*\(/g, oldApi: 'utf8_decode()', newApi: 'mb_convert_encoding()', severity: 'medium', note: 'Deprecated in PHP 8.2', category: 'php-version' },
  { regex: /\$\{[a-zA-Z_]/g, oldApi: '${var} string interpolation', newApi: '{$var} syntax', severity: 'medium', note: 'Deprecated in PHP 8.2', category: 'php-version' },
];

/**
 * Scan source code for deprecated patterns.
 */
export function scanForDeprecations(
  files: Array<{ path: string; content: string }>,
  scanType: 'ci3-to-ci4' | 'php-upgrade' | 'all' = 'all',
): DeprecationReport {
  const findings: DeprecationFinding[] = [];
  let idCounter = 0;

  const patterns = scanType === 'ci3-to-ci4' ? CI3_PATTERNS
    : scanType === 'php-upgrade' ? PHP_PATTERNS
    : [...CI3_PATTERNS, ...PHP_PATTERNS];

  for (const file of files) {
    const lines = file.content.split('\n');

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];

      for (const pat of patterns) {
        // Reset regex lastIndex for global regexes
        pat.regex.lastIndex = 0;
        if (pat.regex.test(line)) {
          findings.push({
            id: `dep_${++idCounter}`,
            file: file.path,
            line: lineIdx + 1,
            pattern: line.trim(),
            category: pat.category,
            severity: pat.severity,
            oldApi: pat.oldApi,
            newApi: pat.newApi,
            migrationNote: pat.note,
            autoFixable: pat.severity === 'low' || pat.severity === 'medium',
          });
        }
      }
    }
  }

  const critical = findings.filter(f => f.severity === 'critical').length;
  const high = findings.filter(f => f.severity === 'high').length;
  const medium = findings.filter(f => f.severity === 'medium').length;
  const low = findings.filter(f => f.severity === 'low').length;

  // Estimate: critical=2h, high=1h, medium=0.5h, low=0.25h
  const estimatedHours = critical * 2 + high * 1 + medium * 0.5 + low * 0.25;

  return {
    scannedFiles: files.length,
    totalFindings: findings.length,
    critical,
    high,
    medium,
    low,
    findings,
    estimatedHours: Math.round(estimatedHours * 10) / 10,
    generatedAt: new Date().toISOString(),
  };
}
