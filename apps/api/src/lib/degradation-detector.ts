/**
 * Agent Degradation Detection — lib/degradation-detector.ts
 * Detects 5 degradation patterns in agent context/output:
 *  1. Lost-in-middle — key info buried and ignored
 *  2. Context poisoning — contradictory facts injected
 *  3. Distraction drift — off-topic content dominates
 *  4. Instruction confusion — conflicting rules
 *  5. Memory clash — old vs new memory contradiction
 *
 * Called by agent task execution and context engineering endpoints.
 */

export interface DegradationResult {
  detected: boolean;
  pattern?: 'lost_in_middle' | 'context_poisoning' | 'distraction_drift' | 'instruction_confusion' | 'memory_clash';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;       // 0-100 (higher = more degraded)
  message: string;
  action: 'continue' | 'compact' | 'reset' | 'escalate';
  details: string[];
}

interface ContextWindow {
  totalTokens: number;
  maxTokens: number;
  messages: Array<{ role: string; content: string; turnIndex: number }>;
  memoryEntries?: Array<{ title: string; content: string; createdAt: string }>;
}

/**
 * Pattern 1: Lost-in-middle detection
 * Key information placed in the middle of context window is often ignored by LLMs.
 * Triggered when context > 60% full and important early instructions are far from recent turns.
 */
function detectLostInMiddle(ctx: ContextWindow): Partial<DegradationResult> | null {
  const fillRatio = ctx.totalTokens / ctx.maxTokens;
  if (fillRatio < 0.5 || ctx.messages.length < 6) return null;

  // Check if system instructions are more than 70% back in context
  const systemMsgIdx = ctx.messages.findIndex(m => m.role === 'system');
  if (systemMsgIdx === -1) return null;
  const distanceFromEnd = ctx.messages.length - 1 - systemMsgIdx;
  const ratio = distanceFromEnd / ctx.messages.length;

  if (ratio > 0.7) {
    return {
      pattern: 'lost_in_middle',
      severity: fillRatio > 0.8 ? 'high' : 'medium',
      score: Math.round(ratio * 100),
      message: `System instructions are ${Math.round(ratio * 100)}% back in context window`,
      action: fillRatio > 0.8 ? 'compact' : 'continue',
      details: [`Context fill: ${Math.round(fillRatio * 100)}%`, `System msg distance: ${distanceFromEnd} turns back`],
    };
  }
  return null;
}

/**
 * Pattern 2: Context poisoning detection
 * Contradictory facts or jailbreak attempts injected via user messages.
 * Detects sudden persona changes or instruction overrides.
 */
function detectContextPoisoning(ctx: ContextWindow): Partial<DegradationResult> | null {
  const poisonPatterns = [
    /ignore (all |previous |your )?instructions/i,
    /you are now/i,
    /forget (everything|what you know|your role)/i,
    /act as (a different|an unrestricted|a jailbroken)/i,
    /pretend you (are|have no)/i,
    /disregard (your|all) (previous|prior|system)/i,
  ];

  const userMessages = ctx.messages.filter(m => m.role === 'user');
  for (const msg of userMessages) {
    for (const pattern of poisonPatterns) {
      if (pattern.test(msg.content)) {
        return {
          pattern: 'context_poisoning',
          severity: 'critical',
          score: 95,
          message: 'Potential instruction override or jailbreak attempt detected',
          action: 'reset',
          details: [`Detected pattern: ${pattern.source}`, `In message at turn ${msg.turnIndex}`],
        };
      }
    }
  }
  return null;
}

/**
 * Pattern 3: Distraction drift detection
 * Off-topic content growing to dominate context.
 * Measured by topic coherence across recent messages.
 */
function detectDistractionDrift(ctx: ContextWindow): Partial<DegradationResult> | null {
  if (ctx.messages.length < 8) return null;

  const recent = ctx.messages.slice(-6);
  const early = ctx.messages.slice(0, 3);

  // Simple heuristic: if recent messages are much shorter (less substantive), drift may be occurring
  const recentAvgLen = recent.reduce((s, m) => s + m.content.length, 0) / recent.length;
  const earlyAvgLen = early.reduce((s, m) => s + m.content.length, 0) / early.length;

  if (recentAvgLen < earlyAvgLen * 0.2 && earlyAvgLen > 200) {
    return {
      pattern: 'distraction_drift',
      severity: 'medium',
      score: 65,
      message: 'Recent messages are significantly shorter — possible topic drift',
      action: 'compact',
      details: [`Early avg message length: ${Math.round(earlyAvgLen)} chars`, `Recent avg message length: ${Math.round(recentAvgLen)} chars`],
    };
  }
  return null;
}

/**
 * Pattern 4: Instruction confusion detection
 * Multiple conflicting rules/instructions accumulate in context.
 */
function detectInstructionConfusion(ctx: ContextWindow): Partial<DegradationResult> | null {
  const systemMessages = ctx.messages.filter(m => m.role === 'system');
  if (systemMessages.length < 2) return null;

  const contradictions = [
    ['always', 'never'],
    ['must', 'must not'],
    ['required', 'forbidden'],
    ['do not', 'you must'],
  ];

  const allSystemContent = systemMessages.map(m => m.content.toLowerCase()).join(' ');
  for (const [a, b] of contradictions) {
    if (allSystemContent.includes(a) && allSystemContent.includes(b)) {
      return {
        pattern: 'instruction_confusion',
        severity: 'high',
        score: 80,
        message: `Conflicting instructions detected: "${a}" and "${b}" both present`,
        action: 'compact',
        details: [`${systemMessages.length} system messages in context`, `Contradiction: "${a}" vs "${b}"`],
      };
    }
  }
  return null;
}

/**
 * Pattern 5: Memory clash detection
 * Recent memory entries contradict older established facts.
 */
function detectMemoryClash(ctx: ContextWindow): Partial<DegradationResult> | null {
  if (!ctx.memoryEntries || ctx.memoryEntries.length < 2) return null;

  // Check for entries with similar titles but different content (indicating updates that may conflict)
  const byTitle = new Map<string, typeof ctx.memoryEntries>();
  for (const entry of ctx.memoryEntries) {
    const key = entry.title.toLowerCase().slice(0, 30);
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key)!.push(entry);
  }

  for (const [key, entries] of byTitle) {
    if (entries.length > 1) {
      return {
        pattern: 'memory_clash',
        severity: 'medium',
        score: 70,
        message: `Multiple memory entries with similar topic: "${key}"`,
        action: 'compact',
        details: [`${entries.length} entries on same topic`, 'Older entries may contradict newer knowledge'],
      };
    }
  }
  return null;
}

/**
 * Main degradation detector — runs all 5 pattern checks.
 * Returns the most severe detection or a clean result.
 */
export function detectDegradation(ctx: ContextWindow): DegradationResult {
  const checks = [
    detectContextPoisoning(ctx),    // Check critical first
    detectInstructionConfusion(ctx),
    detectLostInMiddle(ctx),
    detectMemoryClash(ctx),
    detectDistractionDrift(ctx),
  ];

  // Find most severe detection
  const detected = checks.filter(Boolean) as Partial<DegradationResult>[];
  if (detected.length === 0) {
    return { detected: false, severity: 'low', score: 0, message: 'No degradation detected', action: 'continue', details: [] };
  }

  const worst = detected.reduce((a, b) => ((b.score || 0) > (a.score || 0) ? b : a));
  return {
    detected: true,
    pattern: worst.pattern,
    severity: worst.severity || 'medium',
    score: worst.score || 50,
    message: worst.message || 'Degradation detected',
    action: worst.action || 'compact',
    details: [...(worst.details || []), `Total patterns triggered: ${detected.length}/5`],
  };
}

/**
 * 70% Compaction Trigger — check if context needs compaction
 */
export function needsCompaction(totalTokens: number, maxTokens: number): boolean {
  return totalTokens / maxTokens >= 0.70;
}

/**
 * 2-Action Rule — verify agent hasn't performed more than 2 actions without verification
 */
export function checkTwoActionRule(actionsPerTurn: number[]): { violated: boolean; message: string } {
  const lastTurn = actionsPerTurn[actionsPerTurn.length - 1] || 0;
  if (lastTurn > 2) {
    return {
      violated: true,
      message: `2-Action Rule violated: ${lastTurn} actions in last turn (max 2). Verification required.`,
    };
  }
  return { violated: false, message: 'Within 2-Action Rule limits' };
}
