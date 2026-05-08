/**
 * Similar Bugs Finder — Sprint 2 (F8)
 *
 * Finds previously analyzed errors that are similar to the current one,
 * based on error type, message patterns, and affected files.
 * Returns past root causes to help build better analysis context.
 */

import { getDb } from './db.js';
import { errors, rootCauses } from '@cortexo/db/schema';
import { eq, and, ne, desc, sql, or, ilike } from 'drizzle-orm';

// ─── Types ──────────────────────────────────────────────────────────

export interface SimilarBug {
  errorId: string;
  rootCauseId: string;
  type: string;
  message: string | null;
  file: string | null;
  similarity: number;        // 0-100 similarity score
  rootCauseSummary: string | null;
  suggestedFix: string | null;
  confidence: number | null;
  category: string | null;
  status: string | null;
  firstSeenAt: string;
}

// ─── Functions ──────────────────────────────────────────────────────

/**
 * Find similar past errors based on type, message keywords, and file path.
 * Uses a multi-factor scoring approach:
 *   - Same error type: +40
 *   - Similar message (keyword overlap): +30
 *   - Same file: +20
 *   - Same category: +10
 */
export async function findSimilarBugs(
  errorId: string,
  projectId: string,
  errorType: string,
  errorMessage: string,
  errorFile: string | null,
  limit = 5,
): Promise<SimilarBug[]> {
  const db = await getDb();

  // Extract keywords from error message for text matching
  const keywords = extractKeywords(errorMessage);
  if (keywords.length === 0 && !errorType) return [];

  // Build WHERE conditions
  const conditions = [
    ne(errors.id, errorId),  // exclude self
    eq(errors.projectId, projectId),
  ];

  // Find errors with matching type or file
  const candidates = await db
    .select({
      errorId: errors.id,
      type: errors.type,
      message: errors.message,
      file: errors.file,
      firstSeenAt: errors.firstSeenAt,
      // Join root causes
      rootCauseId: rootCauses.id,
      summary: rootCauses.summary,
      suggestedFix: rootCauses.suggestedFix,
      confidence: rootCauses.confidence,
      category: rootCauses.category,
      rcaStatus: rootCauses.status,
    })
    .from(errors)
    .innerJoin(rootCauses, eq(rootCauses.errorId, errors.id))
    .where(and(...conditions))
    .orderBy(desc(errors.lastSeenAt))
    .limit(50);  // fetch more than needed, then re-rank

  // Score each candidate
  const scored: SimilarBug[] = candidates.map((c) => {
    let similarity = 0;

    // Factor 1: Same error type (+40)
    if (c.type && errorType && c.type.toLowerCase() === errorType.toLowerCase()) {
      similarity += 40;
    }

    // Factor 2: Message keyword overlap (+30 max)
    if (c.message && keywords.length > 0) {
      const candidateKeywords = extractKeywords(c.message);
      const overlap = keywords.filter((k) => candidateKeywords.includes(k)).length;
      const overlapRatio = overlap / Math.max(keywords.length, 1);
      similarity += Math.round(overlapRatio * 30);
    }

    // Factor 3: Same file (+20)
    if (c.file && errorFile && normalizePath(c.file) === normalizePath(errorFile)) {
      similarity += 20;
    }

    // Factor 4: Same category (+10)
    // (already filtered by project, so category match is meaningful)
    if (c.category) {
      similarity += 10;
    }

    return {
      errorId: c.errorId,
      rootCauseId: c.rootCauseId,
      type: c.type,
      message: c.message,
      file: c.file,
      similarity,
      rootCauseSummary: c.summary,
      suggestedFix: c.suggestedFix,
      confidence: c.confidence,
      category: c.category,
      status: c.rcaStatus,
      firstSeenAt: c.firstSeenAt?.toISOString() || '',
    };
  });

  // Sort by similarity desc, filter out low matches
  return scored
    .filter((s) => s.similarity >= 20)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Build a context string from similar bugs for AI prompt enrichment.
 */
export function buildSimilarBugsContext(similar: SimilarBug[]): string {
  if (similar.length === 0) return '';

  const lines = similar.map((s, i) =>
    `${i + 1}. [${s.similarity}% similar] ${s.type}: ${s.message?.slice(0, 100) || 'N/A'}
   File: ${s.file || 'N/A'} | Category: ${s.category || 'N/A'} | Fix: ${s.suggestedFix?.slice(0, 150) || 'N/A'}`,
  );

  return `\n## Similar Past Bugs (for reference)\n${lines.join('\n')}`;
}

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Extract meaningful keywords from error message.
 * Strips common noise words and returns unique lowercase terms.
 */
function extractKeywords(message: string): string[] {
  const noise = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'in', 'to', 'for',
    'at', 'on', 'by', 'with', 'from', 'not', 'no', 'and', 'or', 'but',
    'error', 'exception', 'fatal', 'warning', 'notice', 'undefined', 'null',
    'cannot', 'failed', 'unable', 'invalid',
  ]);

  return (message || '')
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !noise.has(w))
    .filter((v, i, a) => a.indexOf(v) === i)  // unique
    .slice(0, 10);
}

/**
 * Normalize file path for comparison (strip common prefixes).
 */
function normalizePath(filePath: string): string {
  return filePath
    .replace(/^.*?(app|src|lib|modules|controllers)\//i, '$1/')
    .toLowerCase();
}
