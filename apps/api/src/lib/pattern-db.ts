/**
 * Pattern Database — lib/pattern-db.ts
 * Stores confirmed root cause patterns for future matching.
 * Reduces AI calls by matching new errors against known patterns.
 */

export interface RootCausePattern {
  id: string;
  errorFingerprint: string;     // SHA-256 fingerprint of the error
  errorMessage: string;         // Original error message
  rootCause: string;            // Confirmed root cause
  suggestedFix: string;         // What fixed it
  language: string;             // php, javascript, etc.
  framework?: string;           // codeigniter3, next.js, etc.
  tags: string[];               // sql-injection, null-pointer, etc.
  confidence: number;           // 0-100 based on user feedback
  usageCount: number;           // How many times this pattern was matched
  confirmedBy: string;          // User who confirmed
  createdAt: string;
  lastMatchedAt: string;
}

// In-memory store (replace with DB table in production)
const patternStore = new Map<string, RootCausePattern>();

/**
 * Save a confirmed root cause as a reusable pattern.
 */
export function savePattern(pattern: Omit<RootCausePattern, 'id' | 'usageCount' | 'createdAt' | 'lastMatchedAt'>): RootCausePattern {
  const id = `pat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const entry: RootCausePattern = {
    ...pattern,
    id,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    lastMatchedAt: new Date().toISOString(),
  };
  patternStore.set(id, entry);
  return entry;
}

/**
 * Find matching patterns for a given error.
 * Searches by fingerprint first (exact match), then by error message similarity.
 */
export function findMatchingPatterns(errorFingerprint: string, errorMessage: string, limit = 5): RootCausePattern[] {
  const results: Array<{ pattern: RootCausePattern; score: number }> = [];

  for (const pattern of patternStore.values()) {
    let score = 0;

    // Exact fingerprint match = 100%
    if (pattern.errorFingerprint === errorFingerprint) {
      score = 100;
    } else {
      // Fuzzy message match
      score = calculateSimilarity(errorMessage.toLowerCase(), pattern.errorMessage.toLowerCase());
    }

    if (score >= 40) {
      results.push({ pattern, score });
    }
  }

  // Sort by score desc, take top N
  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, limit);

  // Update usage count for matched patterns
  for (const { pattern } of top) {
    pattern.usageCount++;
    pattern.lastMatchedAt = new Date().toISOString();
  }

  return top.map(r => r.pattern);
}

/**
 * Get all patterns, sorted by usage count.
 */
export function getAllPatterns(limit = 100): RootCausePattern[] {
  return Array.from(patternStore.values())
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

/**
 * Get a single pattern by ID.
 */
export function getPattern(id: string): RootCausePattern | undefined {
  return patternStore.get(id);
}

/**
 * Delete a pattern.
 */
export function deletePattern(id: string): boolean {
  return patternStore.delete(id);
}

/**
 * Update pattern confidence based on user feedback.
 */
export function updatePatternConfidence(id: string, delta: number): RootCausePattern | undefined {
  const pattern = patternStore.get(id);
  if (!pattern) return undefined;
  pattern.confidence = Math.max(0, Math.min(100, pattern.confidence + delta));
  return pattern;
}

/**
 * Simple similarity score between two strings (Jaccard on word bigrams).
 */
function calculateSimilarity(a: string, b: string): number {
  const bigramsA = new Set(getBigrams(a));
  const bigramsB = new Set(getBigrams(b));
  if (bigramsA.size === 0 && bigramsB.size === 0) return 100;
  const intersection = [...bigramsA].filter(x => bigramsB.has(x)).length;
  const union = new Set([...bigramsA, ...bigramsB]).size;
  return Math.round((intersection / union) * 100);
}

function getBigrams(str: string): string[] {
  const words = str.split(/\s+/).filter(Boolean);
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  return bigrams;
}
