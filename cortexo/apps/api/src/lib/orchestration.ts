/**
 * Agent Orchestration Rulebook — lib/orchestration.ts
 * Multi-agent coordination with sub-agent caps, forward_message, and consensus.
 *
 * Rules:
 *  1. Max 5 sub-agents per orchestration session
 *  2. 15× token budget awareness (if main task uses N tokens, total ≤ 15N)
 *  3. forward_message protocol for inter-agent communication
 *  4. Majority consensus required for critical decisions
 *  5. Escalation to human when consensus fails
 */

export interface SubAgent {
  id: string;
  name: string;
  role: string;           // 'code_review' | 'security' | 'testing' | 'deploy' | 'custom'
  status: 'idle' | 'running' | 'done' | 'failed' | 'blocked';
  tokensUsed: number;
  startedAt: string;
  completedAt?: string;
  output?: string;
}

export interface OrchestrationSession {
  id: string;
  parentTaskId: string;
  maxSubAgents: number;       // Cap: 3-5
  tokenBudget: number;        // 15× of base task tokens
  tokenBudgetUsed: number;
  subAgents: SubAgent[];
  messages: ForwardMessage[];
  consensusRequired: boolean;
  status: 'active' | 'completed' | 'escalated';
  createdAt: string;
}

export interface ForwardMessage {
  from: string;    // sub-agent ID
  to: string;      // sub-agent ID or 'orchestrator'
  type: 'result' | 'question' | 'vote' | 'escalation';
  content: string;
  timestamp: string;
}

export interface ConsensusVote {
  agentId: string;
  decision: string;
  confidence: number;
  reasoning: string;
}

const SUB_AGENT_CAP = 5;
const TOKEN_BUDGET_MULTIPLIER = 15;

// Active sessions (in-memory, replace with Redis/DB)
const sessions = new Map<string, OrchestrationSession>();

/**
 * Create a new orchestration session for a parent task.
 */
export function createSession(parentTaskId: string, baseTokens: number, maxAgents = 3): OrchestrationSession {
  const session: OrchestrationSession = {
    id: `orch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    parentTaskId,
    maxSubAgents: Math.min(maxAgents, SUB_AGENT_CAP),
    tokenBudget: baseTokens * TOKEN_BUDGET_MULTIPLIER,
    tokenBudgetUsed: 0,
    subAgents: [],
    messages: [],
    consensusRequired: false,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  sessions.set(session.id, session);
  return session;
}

/**
 * Spawn a sub-agent within a session (respects cap).
 */
export function spawnSubAgent(
  sessionId: string,
  name: string,
  role: string,
): { success: boolean; agent?: SubAgent; error?: string } {
  const session = sessions.get(sessionId);
  if (!session) return { success: false, error: 'Session not found' };
  if (session.status !== 'active') return { success: false, error: 'Session not active' };
  if (session.subAgents.length >= session.maxSubAgents) {
    return { success: false, error: `Sub-agent cap reached (${session.maxSubAgents})` };
  }

  const agent: SubAgent = {
    id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    role,
    status: 'running',
    tokensUsed: 0,
    startedAt: new Date().toISOString(),
  };
  session.subAgents.push(agent);
  return { success: true, agent };
}

/**
 * Record sub-agent completion with output and tokens used.
 */
export function completeSubAgent(
  sessionId: string,
  agentId: string,
  output: string,
  tokensUsed: number,
): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const agent = session.subAgents.find(a => a.id === agentId);
  if (!agent) return false;

  agent.status = 'done';
  agent.output = output;
  agent.tokensUsed = tokensUsed;
  agent.completedAt = new Date().toISOString();
  session.tokenBudgetUsed += tokensUsed;

  return true;
}

/**
 * Send a forward_message between agents.
 */
export function forwardMessage(
  sessionId: string,
  from: string,
  to: string,
  type: ForwardMessage['type'],
  content: string,
): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  session.messages.push({ from, to, type, content, timestamp: new Date().toISOString() });

  // Auto-escalate if escalation message
  if (type === 'escalation') {
    session.status = 'escalated';
  }

  return true;
}

/**
 * Run consensus protocol — majority wins.
 */
export function runConsensus(
  sessionId: string,
  votes: ConsensusVote[],
): { decision: string; unanimous: boolean; needsEscalation: boolean } {
  const session = sessions.get(sessionId);

  // Count votes by decision
  const counts = new Map<string, number>();
  for (const vote of votes) {
    counts.set(vote.decision, (counts.get(vote.decision) || 0) + 1);
  }

  // Find majority
  let maxCount = 0;
  let decision = 'no_consensus';
  for (const [d, c] of counts) {
    if (c > maxCount) { maxCount = c; decision = d; }
  }

  const unanimous = maxCount === votes.length;
  const hasMajority = maxCount > votes.length / 2;

  if (!hasMajority && session) {
    session.status = 'escalated';
  }

  return { decision, unanimous, needsEscalation: !hasMajority };
}

/**
 * Check if token budget is exceeded.
 */
export function checkBudget(sessionId: string): { withinBudget: boolean; used: number; total: number; pct: number } {
  const session = sessions.get(sessionId);
  if (!session) return { withinBudget: true, used: 0, total: 0, pct: 0 };
  const pct = Math.round((session.tokenBudgetUsed / session.tokenBudget) * 100);
  return {
    withinBudget: session.tokenBudgetUsed <= session.tokenBudget,
    used: session.tokenBudgetUsed,
    total: session.tokenBudget,
    pct,
  };
}

/**
 * Get session by ID.
 */
export function getSession(sessionId: string): OrchestrationSession | undefined {
  return sessions.get(sessionId);
}

/**
 * List all active sessions.
 */
export function listSessions(): OrchestrationSession[] {
  return Array.from(sessions.values());
}
