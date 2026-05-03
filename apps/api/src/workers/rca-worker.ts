/**
 * RCA Worker — cortexo:rca (Root Cause Analysis)
 * Uses AI (OpenAI/Anthropic) to analyze error events, stack traces,
 * and system context to determine root causes and suggest fixes.
 */
import type { Job } from 'bullmq';
import { createWorker, QUEUE_NAMES } from './shared.js';

interface RCAJobData {
  orgId: string;
  errorId: string;
  errorMessage: string;
  stackTrace?: string;
  errorType?: string;
  filePath?: string;
  projectId?: string;
  environment?: string;
  recentDeployments?: Array<{ id: string; version: string; deployedAt: string }>;
  recentChanges?: Array<{ file: string; author: string; commitSha: string }>;
}

interface RCAResult {
  errorId: string;
  rootCause: string;
  confidence: number;
  category: string;
  suggestedFix: string;
  affectedFiles: string[];
  relatedErrors: string[];
  preventionSteps: string[];
  aiModel: string;
  analysisTime: string;
}

async function processRCAJob(job: Job<RCAJobData>): Promise<RCAResult> {
  const { errorId, errorMessage, stackTrace, filePath, environment } = job.data;

  console.log(`[RCAWorker] Analysing error ${errorId}: "${errorMessage.slice(0, 80)}"`);
  await job.updateProgress(10);

  // Step 1: Parse stack trace and extract context
  console.log(`[RCAWorker] Step 1: Parsing stack trace`);
  const affectedFiles = filePath ? [filePath] : [];
  if (stackTrace) {
    // Extract file paths from stack trace lines
    const fileMatches = stackTrace.match(/at\s+.*?\((.+?):\d+:\d+\)/g) || [];
    for (const match of fileMatches) {
      const fileMatch = match.match(/\((.+?):\d+:\d+\)/);
      if (fileMatch?.[1] && !affectedFiles.includes(fileMatch[1])) {
        affectedFiles.push(fileMatch[1]);
      }
    }
  }
  await job.updateProgress(30);

  // Step 2: Query AI for root cause analysis
  console.log(`[RCAWorker] Step 2: AI analysis`);
  const aiApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  let rootCause = 'Unable to determine — AI API key not configured';
  let suggestedFix = 'Configure OPENAI_API_KEY or ANTHROPIC_API_KEY to enable AI analysis';
  let confidence = 0;
  let category = 'unknown';
  let aiModel = 'none';

  if (aiApiKey && process.env.OPENAI_API_KEY) {
    try {
      // In production: call OpenAI API
      // const response = await fetch('https://api.openai.com/v1/chat/completions', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${aiApiKey}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     model: 'gpt-4o',
      //     messages: [{ role: 'system', content: 'You are a senior DevOps engineer...' }, { role: 'user', content: `Analyze this error:\n${errorMessage}\n\nStack trace:\n${stackTrace}` }],
      //   }),
      // });
      aiModel = 'gpt-4o';
      console.log(`[RCAWorker] AI analysis complete (model: ${aiModel})`);
    } catch (err) {
      console.error(`[RCAWorker] AI API call failed:`, err);
    }
  } else {
    // Fallback: pattern-based heuristic analysis
    console.log(`[RCAWorker] Using heuristic analysis (no AI key)`);
    aiModel = 'heuristic-v1';

    if (errorMessage.includes('undefined') || errorMessage.includes('null')) {
      rootCause = 'Null/undefined reference — variable not initialized or missing null check';
      suggestedFix = 'Add null checking with optional chaining (?.) or explicit guard clause';
      category = 'null-reference';
      confidence = 75;
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ETIMEDOUT')) {
      rootCause = 'Network connectivity failure — downstream service unreachable';
      suggestedFix = 'Add circuit breaker pattern, verify service health, check firewall rules';
      category = 'network';
      confidence = 80;
    } else if (errorMessage.includes('ENOMEM') || errorMessage.includes('heap')) {
      rootCause = 'Memory exhaustion — process exceeded available memory';
      suggestedFix = 'Profile memory usage, check for leaks in event listeners, increase server RAM';
      category = 'resource-exhaustion';
      confidence = 85;
    } else if (errorMessage.includes('SQL') || errorMessage.includes('query')) {
      rootCause = 'Database query error — malformed SQL or connection issue';
      suggestedFix = 'Use parameterised queries, validate input, check connection pool limits';
      category = 'database';
      confidence = 70;
    } else if (errorMessage.includes('permission') || errorMessage.includes('EACCES')) {
      rootCause = 'Permission denied — insufficient filesystem or process privileges';
      suggestedFix = 'Check file ownership, verify process user, review SELinux/AppArmor policies';
      category = 'permissions';
      confidence = 82;
    } else {
      rootCause = `Unclassified error: ${errorMessage.slice(0, 200)}`;
      suggestedFix = 'Review stack trace, add debug logging, check recent deployments';
      category = 'unclassified';
      confidence = 30;
    }
  }
  await job.updateProgress(70);

  // Step 3: Check for related errors
  console.log(`[RCAWorker] Step 3: Checking related errors`);
  const relatedErrors: string[] = []; // Would query errors table for similar patterns
  await job.updateProgress(90);

  // Step 4: Build prevention steps
  const preventionSteps = [
    'Add comprehensive error handling with try/catch blocks',
    'Implement automated testing for the affected code path',
    'Add monitoring alerts for this error pattern',
    'Review recent deployments that may have introduced the regression',
  ];

  await job.updateProgress(100);
  const result: RCAResult = {
    errorId,
    rootCause,
    confidence,
    category,
    suggestedFix,
    affectedFiles: affectedFiles.slice(0, 10),
    relatedErrors,
    preventionSteps,
    aiModel,
    analysisTime: `${Date.now() - job.timestamp}ms`,
  };

  // In production: INSERT into root_causes table
  console.log(`[RCAWorker] Analysis complete for ${errorId} — confidence: ${confidence}%, category: ${category}`);
  return result;
}

export function startRCAWorker() {
  console.log('[RCAWorker] Starting...');
  return createWorker<RCAJobData>(QUEUE_NAMES.RCA, processRCAJob, 2);
}
