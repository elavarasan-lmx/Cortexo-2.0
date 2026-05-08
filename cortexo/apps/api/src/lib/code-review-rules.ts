/**
 * Code Review Rules — PHP Security Rules
 * Detects common PHP security vulnerabilities and anti-patterns.
 * Each rule has: id, name, category, severity, regex pattern, message, suggestion.
 */

export interface ReviewRule {
  id: string;
  name: string;
  category: 'security' | 'quality' | 'pattern' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** Regex pattern to match against each line of source code */
  pattern: RegExp;
  /** Human-readable violation message */
  message: string;
  /** Suggested fix / replacement */
  suggestion: string;
  /** Can be auto-fixed without manual review? */
  autoFixable: boolean;
  /** File extensions this rule applies to */
  fileExtensions: string[];
}

// ─── PHP Security Rules ───────────────────────────────────────────

export const phpSecurityRules: ReviewRule[] = [
  {
    id: 'php-sql-injection',
    name: 'SQL Injection Risk',
    category: 'security',
    severity: 'critical',
    pattern: /\$(?:this->db->)?query\s*\(\s*["'].*\$_(POST|GET|REQUEST|COOKIE)\[/,
    message: 'Direct use of user input in SQL query — SQL injection vulnerability',
    suggestion: 'Use parameterized queries: $this->db->where(\'id\', $this->input->post(\'id\'))->get(\'table\')',
    autoFixable: false,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-raw-post-in-sql',
    name: 'Raw $_POST in SQL',
    category: 'security',
    severity: 'critical',
    pattern: /["']\s*(?:SELECT|INSERT|UPDATE|DELETE)\b.*\.\s*\$_(POST|GET|REQUEST)\[/i,
    message: 'Concatenating user input directly into SQL string',
    suggestion: 'Use $this->input->post() with Active Record: $this->db->where(\'field\', $this->input->post(\'field\'))',
    autoFixable: false,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-xss-echo',
    name: 'Cross-Site Scripting (XSS)',
    category: 'security',
    severity: 'high',
    pattern: /<\?=\s*\$(?!this->)(?!csrf_)(?!base_url)(?!site_url)\w+\s*\?>/,
    message: 'Echoing variable without HTML escaping — XSS risk',
    suggestion: 'Use htmlspecialchars(): <?= htmlspecialchars($variable, ENT_QUOTES, \'UTF-8\') ?>',
    autoFixable: true,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-hardcoded-password',
    name: 'Hardcoded Credentials',
    category: 'security',
    severity: 'critical',
    pattern: /(?:password|passwd|pwd|secret|api_key|apikey)\s*[=:]\s*['"][^'"]{4,}['"]/i,
    message: 'Potential hardcoded credential detected',
    suggestion: 'Move credentials to .env file and use getenv() or environment variables',
    autoFixable: false,
    fileExtensions: ['.php', '.js', '.ts', '.json', '.yml', '.yaml', '.env.example'],
  },
  {
    id: 'php-file-upload-no-validation',
    name: 'File Upload Without Validation',
    category: 'security',
    severity: 'high',
    pattern: /do_upload\s*\(/,
    message: 'File upload detected — ensure allowed_types, max_size, and max_width are configured',
    suggestion: 'Set $config[\'allowed_types\'] = \'gif|jpg|png|pdf\'; before calling do_upload()',
    autoFixable: false,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-eval-usage',
    name: 'Dangerous eval() Usage',
    category: 'security',
    severity: 'critical',
    pattern: /\beval\s*\(/,
    message: 'eval() executes arbitrary code — severe security risk',
    suggestion: 'Refactor to avoid eval(). Use switch/case, function maps, or proper logic.',
    autoFixable: false,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-missing-csrf',
    name: 'Form Without CSRF Token',
    category: 'security',
    severity: 'high',
    pattern: /<form\b[^>]*method\s*=\s*["']post["'][^>]*>(?![\s\S]{0,500}csrf)/i,
    message: 'POST form found without CSRF token protection',
    suggestion: 'Add <?= $this->security->get_csrf_token_name() ?> hidden field or enable global CSRF in config.php',
    autoFixable: true,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-session-no-check',
    name: 'Session Data Without Null Check',
    category: 'security',
    severity: 'medium',
    pattern: /\$this->session->userdata\(['"]\w+['"]\)\s*(?:->|\.|\[)/,
    message: 'Accessing session data property without null check — may cause undefined property error',
    suggestion: 'Check first: if ($this->session->userdata(\'user\')) { ... }',
    autoFixable: true,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-undefined-post',
    name: 'Direct $_POST Access',
    category: 'security',
    severity: 'medium',
    pattern: /\$_(?:POST|GET|REQUEST)\[['"][^'"]+['"]\]/,
    message: 'Direct superglobal access without isset() check or CI input helper',
    suggestion: 'Use $this->input->post(\'field\') ?? $default_value',
    autoFixable: true,
    fileExtensions: ['.php'],
  },
  {
    id: 'php-md5-password',
    name: 'Weak Password Hashing',
    category: 'security',
    severity: 'high',
    pattern: /\bmd5\s*\(\s*\$.*(?:pass|pwd)/i,
    message: 'md5() is cryptographically weak for password hashing',
    suggestion: 'Use password_hash($password, PASSWORD_BCRYPT) and password_verify()',
    autoFixable: false,
    fileExtensions: ['.php'],
  },
];

// ─── JavaScript / TypeScript Pattern Rules ─────────────────────────

export const jsPatternRules: ReviewRule[] = [
  {
    id: 'js-eval',
    name: 'eval() Usage',
    category: 'security',
    severity: 'critical',
    pattern: /\beval\s*\(/,
    message: 'eval() executes arbitrary code — severe security risk',
    suggestion: 'Use JSON.parse(), Function constructor, or proper logic instead of eval()',
    autoFixable: false,
    fileExtensions: ['.js', '.ts', '.tsx', '.jsx'],
  },
  {
    id: 'js-document-write',
    name: 'document.write() Usage',
    category: 'security',
    severity: 'high',
    pattern: /document\.write\s*\(/,
    message: 'document.write() can overwrite the entire page and is an XSS vector',
    suggestion: 'Use DOM manipulation: element.innerHTML or element.textContent',
    autoFixable: false,
    fileExtensions: ['.js', '.ts', '.tsx', '.jsx', '.php'],
  },
  {
    id: 'js-native-alert',
    name: 'Native alert() Instead of UI Library',
    category: 'pattern',
    severity: 'low',
    pattern: /\balert\s*\(\s*['"`]/,
    message: 'Using native alert() instead of project UI library (SweetAlert2 / toast)',
    suggestion: 'Use your project\'s standard: swal.fire({icon:\'info\', title:\'...\'}) or toastr.info(\'...\')',
    autoFixable: true,
    fileExtensions: ['.js', '.ts', '.tsx', '.jsx', '.php'],
  },
  {
    id: 'js-console-log-prod',
    name: 'console.log in Production Code',
    category: 'quality',
    severity: 'info',
    pattern: /\bconsole\.log\s*\(/,
    message: 'console.log() left in code — should be removed or replaced with proper logging',
    suggestion: 'Remove console.log() or use a logging library for production code',
    autoFixable: true,
    fileExtensions: ['.js', '.ts', '.tsx', '.jsx'],
  },
  {
    id: 'js-innerhtml-xss',
    name: 'innerHTML XSS Risk',
    category: 'security',
    severity: 'medium',
    pattern: /\.innerHTML\s*=\s*(?!['"`]<).*\$/,
    message: 'Setting innerHTML with dynamic content — potential XSS vulnerability',
    suggestion: 'Use textContent for text or sanitize HTML with DOMPurify before setting innerHTML',
    autoFixable: false,
    fileExtensions: ['.js', '.ts', '.tsx', '.jsx'],
  },
  {
    id: 'js-no-error-handler',
    name: 'Fetch Without Error Handling',
    category: 'quality',
    severity: 'medium',
    pattern: /fetch\s*\([^)]+\)\s*\.then\s*\([^)]+\)\s*(?!\.catch)/,
    message: 'fetch() call without .catch() error handler',
    suggestion: 'Add .catch(err => { /* handle error */ }) or use try/await with try-catch',
    autoFixable: false,
    fileExtensions: ['.js', '.ts', '.tsx', '.jsx'],
  },
  {
    id: 'js-todo-fixme',
    name: 'TODO/FIXME Comment',
    category: 'quality',
    severity: 'info',
    pattern: /\/\/\s*(?:TODO|FIXME|HACK|XXX|BUG)\b/i,
    message: 'Unresolved TODO/FIXME comment found',
    suggestion: 'Resolve the TODO or create a tracking issue',
    autoFixable: false,
    fileExtensions: ['.js', '.ts', '.tsx', '.jsx', '.php', '.py'],
  },
];

// ─── Combined rule set ──────────────────────────────────────────

export const allRules: ReviewRule[] = [
  ...phpSecurityRules,
  ...jsPatternRules,
];

/**
 * Get rules applicable to a specific file extension.
 */
export function getRulesForFile(filePath: string): ReviewRule[] {
  const ext = '.' + filePath.split('.').pop()?.toLowerCase();
  return allRules.filter(rule => rule.fileExtensions.includes(ext));
}

/**
 * Get rules filtered by category.
 */
export function getRulesByCategory(category: ReviewRule['category']): ReviewRule[] {
  return allRules.filter(rule => rule.category === category);
}

/**
 * Get rules filtered by severity.
 */
export function getRulesBySeverity(severity: ReviewRule['severity']): ReviewRule[] {
  return allRules.filter(rule => rule.severity === severity);
}
