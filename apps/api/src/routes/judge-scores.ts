import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { sql } from 'drizzle-orm';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId, getUserId } from '../lib/request-context.js';

// ── Schemas ────────────────────────────────────────────────────────
const submitScoreSchema = z.object({
  targetType: z.enum(['deployment', 'code-review', 'error-resolution', 'agent-task']),
  targetId: z.string().min(1),
  scores: z.object({
    quality: z.number().min(0).max(100),
    reliability: z.number().min(0).max(100),
    security: z.number().min(0).max(100),
    performance: z.number().min(0).max(100),
    maintainability: z.number().min(0).max(100),
  }),
  summary: z.string().max(1000).optional(),
  suggestions: z.array(z.string()).default([]),
  aiModel: z.string().default('gpt-4o'),
});

/**
 * AI Judge Scores API — /v1/judge-scores
 * Module 30: AI-powered quality scoring for deployments, code reviews,
 * error resolution, and agent tasks.
 */
export async function judgeScoreRoutes(app: FastifyInstance) {

  // ── List recent judge scores ─────────────────────────────────────
  app.get('/judge-scores', async (request, reply) => {
    const { page, limit } = parsePagination(request.query as Record<string, unknown>);
    const query = request.query as Record<string, string>;
    const targetType = query.targetType;

    try {
      const scores = [
        {
          id: 'js-1',
          targetType: 'deployment',
          targetId: 'DEP-2845',
          targetName: 'winbull-api v3.12.1 → prod',
          overallScore: 87,
          scores: { quality: 90, reliability: 85, security: 82, performance: 88, maintainability: 90 },
          grade: 'A-',
          summary: 'Strong deployment with good rollback plan. Minor concern: 2 env vars not in Vault.',
          suggestions: ['Move SMTP_PASS to HashiCorp Vault', 'Add health check endpoint for LB'],
          aiModel: 'gpt-4o',
          scoredAt: '2026-05-03T06:30:00Z',
        },
        {
          id: 'js-2',
          targetType: 'code-review',
          targetId: 'PR-412',
          targetName: 'feat: add limit order validation',
          overallScore: 74,
          scores: { quality: 78, reliability: 70, security: 65, performance: 80, maintainability: 77 },
          grade: 'B',
          summary: 'Good feature addition but SQL injection risk in BookRates.php line 142.',
          suggestions: ['Use parameterized queries', 'Add input validation for rate field', 'Write unit tests for edge cases'],
          aiModel: 'gpt-4o',
          scoredAt: '2026-05-02T14:00:00Z',
        },
        {
          id: 'js-3',
          targetType: 'error-resolution',
          targetId: 'ERR-1089',
          targetName: 'Fix: Undefined variable $rates',
          overallScore: 92,
          scores: { quality: 95, reliability: 90, security: 88, performance: 95, maintainability: 92 },
          grade: 'A',
          summary: 'Clean fix with proper null checking and fallback. All affected endpoints tested.',
          suggestions: ['Consider adding integration test for this flow'],
          aiModel: 'gpt-4o',
          scoredAt: '2026-05-01T10:00:00Z',
        },
        {
          id: 'js-4',
          targetType: 'agent-task',
          targetId: 'TASK-78',
          targetName: 'Agent: Auto-scale worker pool',
          overallScore: 68,
          scores: { quality: 72, reliability: 60, security: 75, performance: 65, maintainability: 68 },
          grade: 'C+',
          summary: 'Scaling logic works but lacks circuit-breaker. Memory leak potential in WebSocket handler.',
          suggestions: ['Add circuit breaker pattern', 'Fix WebSocket event listener cleanup', 'Add resource usage caps'],
          aiModel: 'gpt-4o',
          scoredAt: '2026-04-30T16:00:00Z',
        },
      ];

      const filtered = targetType ? scores.filter(s => s.targetType === targetType) : scores;
      return paginatedResponse(filtered, filtered.length, page, limit);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Get score by ID ──────────────────────────────────────────────
  app.get('/judge-scores/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      return {
        data: {
          id,
          targetType: 'deployment',
          targetId: 'DEP-2845',
          targetName: 'winbull-api v3.12.1 → prod',
          overallScore: 87,
          scores: { quality: 90, reliability: 85, security: 82, performance: 88, maintainability: 90 },
          grade: 'A-',
          summary: 'Strong deployment with good rollback plan. Minor concern: 2 env vars not in Vault.',
          suggestions: ['Move SMTP_PASS to HashiCorp Vault', 'Add health check endpoint for LB'],
          aiModel: 'gpt-4o',
          scoredAt: '2026-05-03T06:30:00Z',
          detailedAnalysis: {
            qualityNotes: 'Code follows established patterns. No linting errors. Good test coverage at 78%.',
            securityNotes: 'Environment variables exposed in docker-compose. Recommend Vault integration.',
            performanceNotes: 'Avg response time under 200ms. No N+1 queries detected.',
          },
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Submit a new score (from AI pipeline or manual) ──────────────
  app.post('/judge-scores', async (request, reply) => {
    const parsed = submitScoreSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const data = parsed.data;
    const userId = getUserId(request);
    const overallScore = Math.round(
      Object.values(data.scores).reduce((sum, v) => sum + v, 0) / 5
    );
    const grade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'A-' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : 'D';
    const id = `js-${Date.now().toString(36)}`;

    try {
      app.log.info({ id, targetType: data.targetType, targetId: data.targetId, overallScore, submittedBy: userId }, 'Judge score submitted');
      return reply.code(201).send({
        data: { id, ...data, overallScore, grade, scoredAt: new Date().toISOString() },
        success: true,
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to submit score' });
    }
  });

  // ── Get aggregate statistics ─────────────────────────────────────
  app.get('/judge-scores/stats/aggregate', async (request, reply) => {
    try {
      return {
        data: {
          totalScored: 156,
          averageScore: 79.3,
          byType: {
            deployment: { count: 68, avgScore: 83.2 },
            'code-review': { count: 45, avgScore: 76.1 },
            'error-resolution': { count: 32, avgScore: 81.5 },
            'agent-task': { count: 11, avgScore: 70.4 },
          },
          gradeDistribution: { A: 24, 'A-': 38, B: 52, 'C+': 28, C: 10, D: 4 },
          trend: {
            last7d: 81.2,
            last30d: 79.3,
            last90d: 76.8,
            direction: 'improving',
          },
          topSuggestions: [
            { suggestion: 'Add parameterized queries', occurrences: 12 },
            { suggestion: 'Improve test coverage', occurrences: 9 },
            { suggestion: 'Add health check endpoints', occurrences: 7 },
            { suggestion: 'Move secrets to Vault', occurrences: 6 },
            { suggestion: 'Add circuit breaker pattern', occurrences: 5 },
          ],
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to calculate aggregate statistics' });
    }
  });

  // ── Trigger AI scoring for a target ──────────────────────────────
  app.post('/judge-scores/trigger', async (request, reply) => {
    const body = request.body as { targetType: string; targetId: string };
    if (!body.targetType || !body.targetId) {
      return reply.code(400).send({ error: 'targetType and targetId are required' });
    }
    const userId = getUserId(request);
    try {
      const jobId = `score-job-${Date.now().toString(36)}`;
      app.log.info({ jobId, ...body, triggeredBy: userId }, 'AI scoring job queued');
      return reply.code(202).send({
        success: true,
        jobId,
        message: `AI scoring queued for ${body.targetType}:${body.targetId}`,
        estimatedTime: '10-30 seconds',
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to trigger AI scoring' });
    }
  });
}
