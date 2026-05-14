// Cortexo Risk Classifier — Offline regex-based risk assessment for skill/script content
// Ported from antigravity-awesome-skills/tools/scripts/risk_classifier.py
// Zero dependencies — uses built-in RegExp only

export type RiskLevel = 'offensive' | 'critical' | 'safe' | 'none';

export interface RiskSuggestion {
  risk: RiskLevel;
  reasons: string[];
}

export interface RiskPattern {
  pattern: RegExp;
  reason: string;
}

// ── Offensive patterns — skills that teach exploitation or attack techniques ──
const OFFENSIVE_HINTS: RiskPattern[] = [
  { pattern: /AUTHORIZED USE ONLY/i, reason: 'explicit offensive disclaimer' },
  {
    pattern:
      /\b(?:pentest(?:ing)?|penetration testing|red team(?:ing)?|exploit(?:ation)?|malware|phishing|sql injection|xss|csrf|jailbreak|sandbox escape|credential theft|exfiltrat\w*|prompt injection)\b/i,
    reason: 'offensive security language',
  },
];

// ── Critical patterns — skills that perform destructive or mutating operations ──
const CRITICAL_HINTS: RiskPattern[] = [
  { pattern: /\bcurl\b[^\n]*\|\s*(?:bash|sh)\b/i, reason: 'curl pipes into a shell' },
  { pattern: /\bwget\b[^\n]*\|\s*(?:bash|sh)\b/i, reason: 'wget pipes into a shell' },
  { pattern: /\birm\b[^\n]*\|\s*iex\b/i, reason: 'PowerShell invoke-expression' },
  { pattern: /\brm\s+-rf\b/i, reason: 'destructive filesystem delete' },
  { pattern: /\bgit\s+(?:commit|push|merge|reset)\b/i, reason: 'git mutation' },
  { pattern: /\b(?:npm|pnpm|yarn|bun)\s+publish\b/i, reason: 'package publication' },
  {
    pattern: /\b(?:kubectl\s+apply|terraform\s+apply|ansible-playbook|docker\s+push)\b/i,
    reason: 'deployment or infrastructure mutation',
  },
  { pattern: /\b(?:POST|PUT|PATCH|DELETE)\b/, reason: 'mutating HTTP verb' },
  {
    pattern: /\b(?:insert|update|upsert|delete|drop|truncate|alter)\b/i,
    reason: 'state-changing data operation',
  },
  {
    pattern: /\b(?:api key|api[_ -]?key|token|secret|password|bearer token|oauth token)\b/i,
    reason: 'secret or token handling',
  },
  {
    pattern:
      /\b(?:write|overwrite|append|create|modify|remove|rename|move)\b[^\n]{0,60}\b(?:file|files|directory|repo|repository|config|skill|document|artifact|database|table|record|row|branch|release|production|server|endpoint|resource)\b/i,
    reason: 'state-changing instruction',
  },
];

// ── Safe patterns — diagnostic, read-only, or testing commands ──
const SAFE_HINTS: RiskPattern[] = [
  {
    pattern:
      /\b(?:echo|cat|ls|rg|grep|find|sed\s+-n|git\s+status|git\s+diff|pytest|npm\s+test|ruff|eslint|tsc)\b/i,
    reason: 'non-mutating command example',
  },
  { pattern: /^```/m, reason: 'contains fenced examples' },
  {
    pattern:
      /\b(?:read|inspect|analyze|audit|validate|test|search|summarize|monitor|review|list|fetch|get|query|lint)\b/i,
    reason: 'read-only or diagnostic language',
  },
  {
    pattern: /\b(?:api|http|graphql|webhook|endpoint|cli|sdk|docs?|database|log|logs)\b/i,
    reason: 'technical or integration language',
  },
];

function collectReasons(text: string, patterns: RiskPattern[]): string[] {
  return patterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ reason }) => reason);
}

/**
 * Classify risk level of arbitrary text content (skill files, scripts, configs).
 * Returns a risk level and the reasons that triggered it.
 *
 * Classification priority: offensive > critical > safe > none
 */
export function classifyRisk(content: string, metadata?: { name?: string; description?: string }): RiskSuggestion {
  let text = typeof content === 'string' ? content : String(content || '');

  // Prepend metadata for context (same approach as the Python original)
  if (metadata) {
    if (metadata.description) text = `${metadata.description}\n${text}`;
    if (metadata.name) text = `${metadata.name}\n${text}`;
  }

  const offensiveReasons = collectReasons(text, OFFENSIVE_HINTS);
  if (offensiveReasons.length > 0) {
    return { risk: 'offensive', reasons: offensiveReasons };
  }

  const criticalReasons = collectReasons(text, CRITICAL_HINTS);
  if (criticalReasons.length > 0) {
    return { risk: 'critical', reasons: criticalReasons };
  }

  const safeReasons = collectReasons(text, SAFE_HINTS);
  if (safeReasons.length > 0) {
    return { risk: 'safe', reasons: safeReasons };
  }

  return { risk: 'none', reasons: [] };
}

/**
 * Batch-classify multiple content strings.
 * Returns a summary with counts per risk level.
 */
export function classifyBatch(
  items: Array<{ id: string; content: string; name?: string; description?: string }>
): {
  results: Array<{ id: string; risk: RiskLevel; reasons: string[] }>;
  counts: Record<RiskLevel, number>;
  total: number;
} {
  const results = items.map((item) => ({
    id: item.id,
    ...classifyRisk(item.content, { name: item.name, description: item.description }),
  }));

  const counts: Record<RiskLevel, number> = { offensive: 0, critical: 0, safe: 0, none: 0 };
  for (const r of results) {
    counts[r.risk]++;
  }

  return { results, counts, total: items.length };
}
