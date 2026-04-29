import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { rootCauses, errors } from '@cortexo/db/schema';
import crypto from 'crypto';

/**
 * Root Cause Analysis API — /v1/root-causes
 */
export async function rootCauseRoutes(app: FastifyInstance) {
  // List analyses
  app.get('/root-causes', async (request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.select().from(rootCauses).orderBy(desc(rootCauses.createdAt)).limit(20);
      return { data: rows, total: rows.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch root causes' });
    }
  });

  // Get single analysis
  app.get('/root-causes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const rows = await db.select().from(rootCauses).where(eq(rootCauses.id, id)).limit(1);
      if (!rows[0]) return reply.code(404).send({ error: 'Not found' });
      return { data: rows[0] };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch analysis' });
    }
  });

  // Trigger AI analysis
  app.post('/root-causes/analyze', async (request, reply) => {
    const parsed = z.object({ errorId: z.string().min(1) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { errorId } = parsed.data;

    try {
      const db = await getDb();

      // Get the error record
      const errorRows = await db.select().from(errors).where(eq(errors.id, errorId)).limit(1);
      if (!errorRows[0]) return reply.code(404).send({ error: 'Error not found' });
      const error = errorRows[0];

      // Check for recent completed analysis (< 1 hour old)
      const existing = await db.select().from(rootCauses)
        .where(eq(rootCauses.errorId, errorId))
        .orderBy(desc(rootCauses.createdAt))
        .limit(1);

      if (existing[0] && (existing[0] as any).status === 'completed') {
        const age = Date.now() - new Date((existing[0] as any).createdAt).getTime();
        if (age < 3600000) { // < 1 hour
          return { data: existing[0], cached: true };
        }
      }

      // Create pending record
      const rcaId = crypto.randomUUID();
      await db.insert(rootCauses).values({
        id: rcaId,
        errorId,
        projectId: error.projectId,
        status: 'pending',
        model: 'gpt-4o-mini',
      } as any);

      const aiKey = process.env.OPENAI_API_KEY;

      // Demo mode (no API key)
      if (!aiKey) {
        const demoAnalysis = `**Root Cause Analysis** (Demo Mode)\n\n**Error:** \`${error.type}\` in \`${(error as any).file}:${(error as any).line}\`\n\n**Analysis:**\nThis error occurs because the code at line ${(error as any).line} receives an unexpected null/undefined value. This typically happens when:\n1. A database query returns no results but the code assumes at least one row\n2. An upstream API call fails silently without proper error handling\n3. A session or cached value has expired and the fallback is not handled\n\n**Pattern:** This error has occurred **${(error as any).eventCount} times** — it is a recurring production issue, not a one-off.`;
        const demoFix = `<?php\n// Add null-check before accessing the result\n$result = $this->db->get_where('table', ['id' => $id])->row();\n\nif (!$result) {\n    log_message('error', 'No result found for id: ' . $id);\n    // Return user-friendly error or redirect\n    show_error('Record not found', 404);\n    return;\n}\n\n// Now safe to use $result->field\necho $result->field;`;

        await db.update(rootCauses)
          .set({ status: 'completed', analysis: demoAnalysis, suggestedFix: demoFix, confidence: 72, model: 'demo' } as any)
          .where(eq(rootCauses.id, rcaId));

        const result = await db.select().from(rootCauses).where(eq(rootCauses.id, rcaId)).limit(1);
        return reply.code(201).send({ data: result[0], demo: true });
      }

      // ── Fetch git diff for deploy-diff analysis ──────────────────────────
      let deployDiff = '';
      try {
        const deploy = await db.query.deployments?.findFirst({
          where: (d: any, { eq: eqFn }: any) => eqFn(d.projectId, error.projectId),
          orderBy: (d: any, { desc: descFn }: any) => [descFn(d.createdAt)],
        } as any);
        if (deploy && (deploy as any).commitSha) {
          const sha = (deploy as any).commitSha;
          const token = process.env.GITHUB_ACCESS_TOKEN || process.env.GITLAB_ACCESS_TOKEN;
          // Try GitHub API
          if (token && process.env.GITHUB_REPO) {
            const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/commits/${sha}`, {
              headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
            });
            if (res.ok) {
              const commitData = await res.json() as any;
              const files = commitData.files?.slice(0, 3) || [];
              deployDiff = files.map((f: any) => `--- ${f.filename}\n${(f.patch || '').slice(0, 500)}`).join('\n\n');
            }
          }
        }
      } catch { /* git diff is best-effort */ }

      // ── Real OpenAI analysis ────────────────────────────────────
      const prompt = `Analyze this PHP application error and provide structured root cause analysis.

ERROR:
- Type: ${error.type}
- Message: ${error.message}
- File: ${(error as any).file}:${(error as any).line}
- Severity: ${error.severity}
- Occurrences: ${(error as any).eventCount}
${deployDiff ? `\nRECENT DEPLOYMENT DIFF (most likely cause):\n${deployDiff}` : ''}

Respond in JSON format:
{"analysis": "2-3 paragraph explanation", "fix": "PHP code fix with comments", "confidence": 75}`;

      let analysis = '';
      let suggestedFix = '';
      let confidence = 60;

      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a senior PHP DevOps engineer. Respond only in valid JSON.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });
        const aiData = await resp.json() as any;
        const content = aiData.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          analysis = parsed.analysis || content;
          suggestedFix = parsed.fix || '';
          confidence = Math.min(100, Math.max(0, parsed.confidence || 70));
        } else {
          analysis = content;
        }
      } catch (aiErr: any) {
        analysis = `AI analysis failed: ${aiErr.message}. Check your OPENAI_API_KEY.`;
      }

      await db.update(rootCauses)
        .set({ status: 'completed', analysis, suggestedFix, confidence, model: 'gpt-4o-mini' } as any)
        .where(eq(rootCauses.id, rcaId));

      const result = await db.select().from(rootCauses).where(eq(rootCauses.id, rcaId)).limit(1);
      return reply.code(201).send({ data: result[0] });

    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Analysis failed' });
    }
  });

  // User feedback
  app.patch('/root-causes/:id/feedback', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = z.object({ rating: z.number().min(1).max(5), comment: z.string().optional() }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { rating, comment } = parsed.data;
    try {
      const db = await getDb();
      await db.update(rootCauses)
        .set({ feedbackRating: rating, feedbackComment: comment } as any)
        .where(eq(rootCauses.id, id));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to save feedback' });
    }
  });
}
