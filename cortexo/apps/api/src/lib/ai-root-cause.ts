/**
 * Cortexo AI Root Cause Analysis Engine
 *
 * Uses OpenAI or Anthropic to analyze error stack traces and generate
 * actionable root cause insights. Falls back to rule-based analysis
 * when no AI API key is configured.
 */

import { getDb } from './db.js';
import { errors, errorEvents, rootCauses } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface RootCauseResult {
  summary: string;
  rootCause: string;
  suggestedFix: string;
  confidence: number;
  category: string;
  affectedFiles: string[];
}

/**
 * Build the AI prompt from error data
 */
function buildPrompt(error: any, events: any[]): string {
  const latestEvent = events[0];
  return `You are a senior backend engineer analyzing a production error. Analyze the following error and provide a root cause analysis.

## Error Details
- **Type:** ${error.type}
- **Message:** ${error.message}
- **File:** ${error.file || 'Unknown'}
- **Line:** ${error.line || 'Unknown'}
- **Severity:** ${error.severity}
- **First Seen:** ${error.firstSeenAt}
- **Occurrences:** ${error.eventCount}

## Stack Trace
\`\`\`
${latestEvent?.stackTrace || 'No stack trace available'}
\`\`\`

## Context
\`\`\`json
${latestEvent?.context ? (typeof latestEvent.context === 'string' ? latestEvent.context : JSON.stringify(latestEvent.context, null, 2)) : 'No context available'}
\`\`\`

## Environment
- **Environment:** ${latestEvent?.environment || 'Unknown'}
- **Release:** ${latestEvent?.release || 'Unknown'}
- **Server:** ${latestEvent?.serverName || 'Unknown'}
- **URL:** ${latestEvent?.url || 'N/A'}
- **Method:** ${latestEvent?.method || 'N/A'}

## Required Response (JSON only)
Respond with ONLY a JSON object containing:
{
  "summary": "One-line summary of what happened",
  "rootCause": "Detailed explanation of the root cause (2-3 sentences)",
  "suggestedFix": "Specific code fix or configuration change to resolve this",
  "confidence": 0.85,
  "category": "one of: null_reference | type_error | connection | timeout | auth | validation | memory | concurrency | config | unknown",
  "affectedFiles": ["list of file paths likely affected"]
}`;
}

/**
 * Call OpenAI GPT-4o for analysis
 */
async function analyzeWithOpenAI(prompt: string): Promise<RootCauseResult | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a senior DevOps engineer specializing in root cause analysis. Respond with JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      console.error('[AI/OpenAI] API error:', res.status, await res.text());
      return null;
    }
    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (err) {
    console.error('[AI/OpenAI] Error:', err);
    return null;
  }
}

/**
 * Call Anthropic Claude for analysis
 */
async function analyzeWithAnthropic(prompt: string): Promise<RootCauseResult | null> {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          { role: 'user', content: prompt + '\n\nRespond with a JSON object only, no markdown.' },
        ],
      }),
    });
    if (!res.ok) {
      console.error('[AI/Anthropic] API error:', res.status, await res.text());
      return null;
    }
    const data = await res.json() as any;
    const text = data.content?.[0]?.text || '';
    // Extract JSON from response (Claude might wrap it)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (err) {
    console.error('[AI/Anthropic] Error:', err);
    return null;
  }
}

/**
 * Rule-based fallback when no AI provider is available
 */
function analyzeWithRules(error: any, _events: any[]): RootCauseResult {
  const type = (error.type || '').toLowerCase();
  const message = (error.message || '').toLowerCase();

  let category = 'unknown';
  let rootCause = 'Unable to determine root cause without AI analysis.';
  let suggestedFix = 'Review the stack trace and error context manually.';
  let confidence = 0.3;

  if (type.includes('null') || type.includes('undefined') || message.includes('cannot read prop')) {
    category = 'null_reference';
    rootCause = 'A null or undefined value was accessed where an object was expected. This often occurs when API responses are not validated or optional chaining is missing.';
    suggestedFix = 'Add null checks or optional chaining (?.) before accessing nested properties. Validate API responses before using their data.';
    confidence = 0.6;
  } else if (type.includes('type') || message.includes('is not a function')) {
    category = 'type_error';
    rootCause = 'A type mismatch occurred — a value was used as a type it is not (e.g., calling a non-function, accessing properties on wrong type).';
    suggestedFix = 'Check variable types with typeof/instanceof before use. Add TypeScript strict type annotations.';
    confidence = 0.55;
  } else if (type.includes('connect') || message.includes('econnrefused') || message.includes('enotfound')) {
    category = 'connection';
    rootCause = 'A network connection failed — the target service is unreachable, down, or DNS resolution failed.';
    suggestedFix = 'Verify the service URL/host, check firewall rules, ensure the target service is running, and add retry logic with exponential backoff.';
    confidence = 0.7;
  } else if (message.includes('timeout') || type.includes('timeout')) {
    category = 'timeout';
    rootCause = 'An operation exceeded its timeout limit — likely a slow database query, external API call, or network latency.';
    suggestedFix = 'Increase timeout limits, optimize slow queries, add connection pooling, or implement circuit breaker pattern.';
    confidence = 0.65;
  } else if (type.includes('auth') || message.includes('unauthorized') || message.includes('403') || message.includes('401')) {
    category = 'auth';
    rootCause = 'Authentication or authorization failure — invalid credentials, expired tokens, or insufficient permissions.';
    suggestedFix = 'Check token expiry, verify API keys, ensure proper role/permission assignments, and implement token refresh logic.';
    confidence = 0.6;
  }

  return {
    summary: `${category.replace('_', ' ')} error in ${error.file || 'unknown file'}`,
    rootCause,
    suggestedFix,
    confidence,
    category,
    affectedFiles: error.file ? [error.file] : [],
  };
}

/**
 * Main analysis function — called asynchronously after POST /errors/:id/analyze
 */
export async function analyzeRootCause(
  errorId: string,
  rootCauseId: string,
  projectId: string,
  orgId: string,
): Promise<void> {
  console.log(`[AI] Starting root cause analysis for error ${errorId}`);

  try {
    const db = await getDb();

    // Fetch error details + recent events
    const error = await db.query.errors.findFirst({
      where: (e: any, { eq: eqFn }: any) => eqFn(e.id, errorId),
    });

    if (!error) {
      await db.update(rootCauses).set({
        status: 'failed',
        summary: 'Error not found',
      } as any).where(eq(rootCauses.id, rootCauseId));
      return;
    }

    const events = await db.query.errorEvents.findMany({
      where: (ev: any, { eq: eqFn }: any) => eqFn(ev.errorId, errorId),
      orderBy: (ev: any, { desc: descFn }: any) => [descFn(ev.createdAt)],
      limit: 5,
    });

    // Build prompt
    const prompt = buildPrompt(error, events);

    // Try AI providers in order: OpenAI → Anthropic → Rule-based fallback
    let result: RootCauseResult | null = null;
    let provider = 'rules';

    result = await analyzeWithOpenAI(prompt);
    if (result) {
      provider = 'openai';
    } else {
      result = await analyzeWithAnthropic(prompt);
      if (result) {
        provider = 'anthropic';
      }
    }

    // Fallback to rule-based analysis
    if (!result) {
      result = analyzeWithRules(error, events);
      provider = 'rules';
    }

    // Save analysis results to DB
    await db.update(rootCauses).set({
      status: 'completed',
      summary: result.summary,
      rootCause: result.rootCause,
      suggestedFix: result.suggestedFix,
      confidence: Math.round(result.confidence * 100),
      category: result.category,
      affectedFiles: JSON.stringify(result.affectedFiles),
      provider,
      completedAt: new Date(),
    } as any).where(eq(rootCauses.id, rootCauseId));

    console.log(`[AI] Root cause analysis completed for error ${errorId} (provider: ${provider}, confidence: ${result.confidence})`);
  } catch (err) {
    console.error(`[AI] Root cause analysis failed for error ${errorId}:`, err);

    try {
      const db = await getDb();
      await db.update(rootCauses).set({
        status: 'failed',
        summary: `Analysis failed: ${(err as Error).message}`,
      } as any).where(eq(rootCauses.id, rootCauseId));
    } catch { /* best effort */ }
  }
}
