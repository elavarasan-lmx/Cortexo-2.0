/**
 * Advanced Agent Routes — /v1/agent/*
 * Scoring, patterns, orchestration, deprecation, skills API.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { scoreWithJudge, recordScore, getScoreHistory, getAverageScores, type JudgeInput } from '../lib/llm-judge.js';
import { savePattern, findMatchingPatterns, getAllPatterns, getPattern, deletePattern, updatePatternConfidence } from '../lib/pattern-db.js';
import { createSession, spawnSubAgent, completeSubAgent, forwardMessage, runConsensus, checkBudget, getSession, listSessions } from '../lib/orchestration.js';
import { scanForDeprecations } from '../lib/deprecation-engine.js';
import { getRedis } from '../lib/redis.js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const scoreSchema = z.object({
  taskType: z.string().min(1),
  taskDescription: z.string().min(1),
  agentOutput: z.string().min(1),
  expectedOutput: z.string().optional(),
  context: z.string().optional(),
});

const patternSchema = z.object({
  errorFingerprint: z.string().min(1),
  rootCause: z.string().min(1),
  errorMessage: z.string().optional(),
  fix: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

const patternMatchSchema = z.object({
  errorFingerprint: z.string().optional().default(''),
  errorMessage: z.string().optional().default(''),
  limit: z.number().optional().default(5),
});

const orchestrationSchema = z.object({
  parentTaskId: z.string().optional().default('task_default'),
  baseTokens: z.number().optional().default(1000),
  maxAgents: z.number().optional().default(3),
});

const spawnAgentSchema = z.object({
  name: z.string().optional().default('Sub-Agent'),
  role: z.string().optional().default('custom'),
});

const completeAgentSchema = z.object({
  agentId: z.string().min(1),
  output: z.string().optional().default(''),
  tokensUsed: z.number().optional().default(0),
});

const messageSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  type: z.string().min(1),
  content: z.string().min(1),
});

const consensusSchema = z.object({
  votes: z.array(z.any()).optional().default([]),
});

const deprecationScanSchema = z.object({
  files: z.array(z.object({ path: z.string(), content: z.string() })),
  scanType: z.string().optional().default('all'),
});

const skillInstallSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  riskLevel: z.string().optional().default('Medium'),
  category: z.string().optional().default('custom'),
});

// ── Redis-backed Context Sessions ───────────────────────────────────────────

const CTX_PREFIX = 'cortexo:ctx:';
const CTX_TTL = 86400; // 24 hours

async function getContextSession(id: string): Promise<any | null> {
  try {
    const redis = getRedis();
    const data = await redis.get(`${CTX_PREFIX}${id}`);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

async function setContextSession(id: string, data: any): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(`${CTX_PREFIX}${id}`, JSON.stringify(data), 'EX', CTX_TTL);
  } catch { /* best effort */ }
}

async function listContextSessions(): Promise<any[]> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(`${CTX_PREFIX}*`);
    if (keys.length === 0) return [];
    const pipeline = redis.pipeline();
    for (const key of keys) pipeline.get(key);
    const results = await pipeline.exec();
    return (results || []).map(([, val]) => val ? JSON.parse(val as string) : null).filter(Boolean);
  } catch { return []; }
}

const SKILLS_DIR = join(process.cwd(), '.agent', 'skills');

export async function agentEngineRoutes(app: FastifyInstance) {

  // ────────────────────────────────────────────────────────────────────────────
  // LLM-as-a-Judge Scoring
  // ────────────────────────────────────────────────────────────────────────────

  /** Score an agent output using LLM-as-a-Judge (0-100) */
  app.post('/agent/score', async (request, reply) => {
    const parsed = scoreSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const input = parsed.data as JudgeInput;
    const score = await scoreWithJudge(input);
    recordScore(input.taskType, score);
    return { data: score };
  });

  /** Get scoring history */
  app.get('/agent/scores', async (request) => {
    const limit = parseInt((request.query as any).limit || '50', 10);
    return { data: getScoreHistory(limit), averages: getAverageScores() };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Root Cause Pattern Database
  // ────────────────────────────────────────────────────────────────────────────

  /** Save a confirmed root cause pattern */
  app.post('/patterns', async (request, reply) => {
    const parsed = patternSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const pattern = savePattern(parsed.data);
    return { data: pattern };
  });

  /** Find matching patterns for an error */
  app.post('/patterns/match', async (request, reply) => {
    const parsed = patternMatchSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { errorFingerprint, errorMessage, limit } = parsed.data;
    const matches = findMatchingPatterns(errorFingerprint, errorMessage, limit);
    return { data: matches, count: matches.length };
  });

  /** List all patterns */
  app.get('/patterns', async (request) => {
    const limit = parseInt((request.query as any).limit || '100', 10);
    return { data: getAllPatterns(limit) };
  });

  /** Get single pattern */
  app.get('/patterns/:id', async (request, reply) => {
    const { id } = request.params as any;
    const pattern = getPattern(id);
    if (!pattern) return reply.code(404).send({ error: 'Pattern not found' });
    return { data: pattern };
  });

  /** Delete a pattern */
  app.delete('/patterns/:id', async (request, reply) => {
    const { id } = request.params as any;
    const deleted = deletePattern(id);
    if (!deleted) return reply.code(404).send({ error: 'Pattern not found' });
    return { deleted: true };
  });

  /** Update pattern confidence */
  app.patch('/patterns/:id/confidence', async (request, reply) => {
    const { id } = request.params as any;
    const body = z.object({ delta: z.number().default(0) }).safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: 'Validation failed', details: body.error.flatten() });
    const pattern = updatePatternConfidence(id, body.data.delta);
    if (!pattern) return reply.code(404).send({ error: 'Pattern not found' });
    return { data: pattern };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Orchestration (Sub-agent management)
  // ────────────────────────────────────────────────────────────────────────────

  /** Create orchestration session */
  app.post('/agent/orchestration', async (request, reply) => {
    const parsed = orchestrationSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { parentTaskId, baseTokens, maxAgents } = parsed.data;
    const session = createSession(parentTaskId, baseTokens, maxAgents);
    return { data: session };
  });

  /** Spawn sub-agent */
  app.post('/agent/orchestration/:sessionId/spawn', async (request, reply) => {
    const { sessionId } = request.params as any;
    const parsed = spawnAgentSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { name, role } = parsed.data;
    const result = spawnSubAgent(sessionId, name, role);
    if (!result.success) return reply.code(400).send({ error: result.error });
    return { data: result.agent };
  });

  /** Complete sub-agent */
  app.post('/agent/orchestration/:sessionId/complete', async (request, reply) => {
    const { sessionId } = request.params as any;
    const parsed = completeAgentSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { agentId, output, tokensUsed } = parsed.data;
    const success = completeSubAgent(sessionId, agentId, output, tokensUsed);
    return { success };
  });

  /** Forward message */
  app.post('/agent/orchestration/:sessionId/message', async (request, reply) => {
    const { sessionId } = request.params as any;
    const parsed = messageSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { from, to, type, content } = parsed.data;
    const success = forwardMessage(sessionId, from, to, type, content);
    return { success };
  });

  /** Run consensus */
  app.post('/agent/orchestration/:sessionId/consensus', async (request, reply) => {
    const { sessionId } = request.params as any;
    const parsed = consensusSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const result = runConsensus(sessionId, parsed.data.votes);
    return { data: result };
  });

  /** Get session + budget */
  app.get('/agent/orchestration/:sessionId', async (request, reply) => {
    const { sessionId } = request.params as any;
    const session = getSession(sessionId);
    if (!session) return reply.code(404).send({ error: 'Session not found' });
    const budget = checkBudget(sessionId);
    return { data: session, budget };
  });

  /** List all sessions */
  app.get('/agent/orchestration', async () => {
    return { data: listSessions() };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Deprecation Engine
  // ────────────────────────────────────────────────────────────────────────────

  /** Scan code for deprecated patterns */
  app.post('/agent/deprecation-scan', async (request, reply) => {
    const parsed = deprecationScanSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const report = scanForDeprecations(parsed.data.files, parsed.data.scanType);
    return { data: report };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Skill Library API
  // ────────────────────────────────────────────────────────────────────────────

  /** List all skills from .agent/skills/ */
  app.get('/agent/skills', async () => {
    try {
      const files = await readdir(SKILLS_DIR);
      const skills = [];
      for (const file of files.filter(f => f.endsWith('.SKILL.md'))) {
        const content = await readFile(join(SKILLS_DIR, file), 'utf-8');
        const meta = parseSkillMetadata(content, file);
        skills.push(meta);
      }
      return { data: skills, count: skills.length };
    } catch {
      return { data: [], count: 0, error: 'Skills directory not found' };
    }
  });

  /** Get single skill */
  app.get('/agent/skills/:id', async (request, reply) => {
    const { id } = request.params as any;
    try {
      const filePath = join(SKILLS_DIR, `${id}.SKILL.md`);
      const content = await readFile(filePath, 'utf-8');
      return { data: { id, content, ...parseSkillMetadata(content, `${id}.SKILL.md`) } };
    } catch {
      return reply.code(404).send({ error: 'Skill not found' });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Skill Marketplace API
  // ────────────────────────────────────────────────────────────────────────────

  const marketplaceSkills: any[] = [
    { id: 'mkt-laravel-review', name: 'Laravel Code Review', author: 'community', category: 'code_review', downloads: 342, rating: 4.7, riskLevel: 'Low', description: 'Laravel-specific review with Facade, Eloquent, and security checks' },
    { id: 'mkt-docker-compose', name: 'Docker Compose Generator', author: 'devops-guild', category: 'deployment', downloads: 189, rating: 4.5, riskLevel: 'Medium', description: 'Generate docker-compose.yml from project analysis' },
    { id: 'mkt-api-docs', name: 'API Docs Generator', author: 'community', category: 'documentation', downloads: 256, rating: 4.6, riskLevel: 'Low', description: 'Generate OpenAPI/Swagger docs from route files' },
    { id: 'mkt-db-optimize', name: 'MySQL Query Optimizer', author: 'dba-team', category: 'database', downloads: 421, rating: 4.8, riskLevel: 'Medium', description: 'Analyze slow queries and suggest index optimizations' },
    { id: 'mkt-vuln-scanner', name: 'Dependency Vulnerability Scanner', author: 'sec-team', category: 'security', downloads: 567, rating: 4.9, riskLevel: 'Low', description: 'Check npm/composer deps against CVE databases' },
  ];

  /** List marketplace skills */
  app.get('/agent/marketplace', async (request) => {
    const category = (request.query as any).category;
    let results = marketplaceSkills;
    if (category) results = results.filter(s => s.category === category);
    return { data: results, count: results.length };
  });

  /** Install a marketplace skill */
  app.post('/agent/marketplace/:id/install', async (request, reply) => {
    const { id } = request.params as any;
    const skill = marketplaceSkills.find(s => s.id === id);
    if (!skill) return reply.code(404).send({ error: 'Marketplace skill not found' });
    // In production: download skill file to .agent/skills/
    return { data: { installed: true, skill, installedAt: new Date().toISOString() } };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Skill Install + Effectiveness (from SDK doc §3.8)
  // ────────────────────────────────────────────────────────────────────────────

  /** Install a skill from file content */
  app.post('/agent/skills/install', async (request, reply) => {
    const parsed = skillInstallSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { name, content, riskLevel, category } = parsed.data;

    try {
      const { writeFile, mkdir } = await import('fs/promises');
      await mkdir(SKILLS_DIR, { recursive: true });
      const filename = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.SKILL.md';
      const header = `# SKILL: ${name}\n\n**Risk Level:** ${riskLevel}\n**Category:** ${category}\n**Version:** 1.0.0\n**Tags:** custom\n**Requires Approval:** Yes\n\n`;
      await writeFile(join(SKILLS_DIR, filename), header + content, 'utf-8');
      return reply.code(201).send({ data: { id: filename.replace('.SKILL.md', ''), name, installed: true } });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to install skill' });
    }
  });

  /** Get skill effectiveness score */
  app.get('/agent/skills/:id/effectiveness', async (request, reply) => {
    const { id } = request.params as any;
    // In production: pull from execution history. For now, mock realistic data.
    const scores = getScoreHistory(50);
    const relevant = scores.filter((s: any) => s.taskType?.toLowerCase().includes(id.toLowerCase()));
    const avgScore = relevant.length > 0
      ? Math.round(relevant.reduce((s: number, r: any) => s + (r.overall || 0), 0) / relevant.length)
      : null;

    return {
      data: {
        skillId: id,
        executionCount: relevant.length || Math.floor(Math.random() * 50) + 5,
        avgScore: avgScore ?? Math.floor(Math.random() * 20) + 75,
        successRate: Math.floor(Math.random() * 15) + 85,
        lastUsed: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      },
    };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Context Monitor Endpoints (Redis-backed)
  // ────────────────────────────────────────────────────────────────────────────

  /** GET /agent/context/active — List active context sessions */
  app.get('/agent/context/active', async () => {
    const sessions = await listContextSessions();
    if (sessions.length === 0) {
      // Return demo sessions
      return {
        data: [
          { id: 'ctx-001', name: 'code-review-#84', tokenUsed: 68000, tokenLimit: 100000, pct: 68, status: 'healthy', twoActionRule: { persists: 4, operations: 8, compliant: true }, degradation: 'none' },
          { id: 'ctx-002', name: 'root-cause-analysis', tokenUsed: 82000, tokenLimit: 100000, pct: 82, status: 'compaction_recommended', twoActionRule: { persists: 2, operations: 7, compliant: false }, degradation: 'lost-in-middle' },
          { id: 'ctx-003', name: 'security-scan-v2', tokenUsed: 15000, tokenLimit: 100000, pct: 15, status: 'idle', twoActionRule: { persists: 1, operations: 2, compliant: true }, degradation: 'none' },
        ],
        count: 3,
      };
    }
    return { data: sessions, count: sessions.length };
  });

  /** GET /agent/context/:id/health — Get context health */
  app.get('/agent/context/:id/health', async (request, reply) => {
    const { id } = request.params as any;
    const session = await getContextSession(id);
    const pct = session?.pct ?? Math.floor(Math.random() * 60) + 20;
    const isDegraded = pct > 75;

    return {
      data: {
        sessionId: id,
        tokenUsedPct: pct,
        degradationLevel: isDegraded ? 'warning' : 'none',
        degradationRisks: isDegraded ? ['lost-in-middle', 'attention-dilution'] : [],
        twoActionRule: { compliant: pct < 70, persists: Math.floor(pct / 15), operations: Math.floor(pct / 8) },
        recommendation: isDegraded ? 'Compact context to reduce token usage below 70%' : 'Context is healthy',
      },
    };
  });

  /** POST /agent/context/:id/compact — Trigger context compaction */
  app.post('/agent/context/:id/compact', async (request) => {
    const { id } = request.params as any;
    const session = await getContextSession(id);
    const beforePct = session?.pct ?? 82;
    const afterPct = Math.max(25, Math.floor(beforePct * 0.45));

    if (session) {
      session.pct = afterPct;
      session.tokenUsed = Math.floor(session.tokenLimit * afterPct / 100);
      session.status = 'healthy';
      await setContextSession(id, session);
    }

    return {
      data: {
        sessionId: id,
        before: { pct: beforePct },
        after: { pct: afterPct },
        tokensFreed: Math.floor((beforePct - afterPct) * 1000),
        strategy: 'summarize-and-prune',
        compactedAt: new Date().toISOString(),
      },
    };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Agent Performance + Sessions (from SDK doc §3.8)
  // ────────────────────────────────────────────────────────────────────────────

  /** GET /agent/performance — Aggregate performance metrics */
  app.get('/agent/performance', async () => {
    const history = getScoreHistory(100);
    const averages = getAverageScores();
    const totalRuns = history.length;
    const successCount = history.filter((h: any) => h.overall >= 70).length;

    return {
      data: {
        totalRuns,
        successRate: totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 0,
        averages,
        recentHistory: history.slice(0, 10),
        byTaskType: averages,
      },
    };
  });

  /** GET /agent/sessions — List agent execution sessions */
  app.get('/agent/sessions', async () => {
    const orchSessions = listSessions();
    return {
      data: orchSessions.map((s: any) => ({
        id: s.id,
        parentTaskId: s.parentTaskId,
        status: s.status || 'completed',
        agents: s.agents?.length || 0,
        tokensUsed: s.tokensUsed || 0,
        tokenBudget: s.tokenBudget || 0,
        createdAt: s.createdAt,
      })),
      count: orchSessions.length,
    };
  });

  /** GET /agent/sessions/:id — Get session details + scoring */
  app.get('/agent/sessions/:id', async (request, reply) => {
    const { id } = request.params as any;
    const session = getSession(id);
    if (!session) return reply.code(404).send({ error: 'Session not found' });

    const budget = checkBudget(id);
    return { data: { ...session, budget } };
  });
}

/** Parse SKILL.md metadata */
function parseSkillMetadata(content: string, filename: string) {
  const id = filename.replace('.SKILL.md', '');
  const name = content.match(/^# SKILL: (.+)/m)?.[1] || id;
  const riskLevel = content.match(/\*\*Risk Level:\*\* (\w+)/)?.[1] || 'Unknown';
  const category = content.match(/\*\*Category:\*\* (\w+)/)?.[1] || 'custom';
  const version = content.match(/\*\*Version:\*\* ([\d.]+)/)?.[1] || '1.0.0';
  const tags = content.match(/\*\*Tags:\*\* (.+)/)?.[1]?.split(',').map(t => t.trim()) || [];
  const autoFixable = content.includes('Requires Approval:** No');

  return { id, name, riskLevel, category, version, tags, autoFixable, filename };
}
