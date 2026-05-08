import type { FastifyInstance } from 'fastify';
import { getDb } from '../lib/db.js';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId, getUserId } from '../lib/request-context.js';
import { codeReviews, codeReviewFindings } from '@cortexo/db/schema';
import { runRuleBasedReview, filterSupportedFiles, getSeverityLabel, type SourceFile } from '../lib/code-review-engine.js';

/**
 * Code Review API — /v1/code-reviews
 * Module F6: Rule-based + AI-powered code review engine.
 * Scans source files for security vulnerabilities, pattern violations,
 * and code quality issues.
 */
export async function codeReviewRoutes(app: FastifyInstance) {

  // ── List code reviews for a project ─────────────────────────────
  app.get('/projects/:projectId/code-reviews', async (request, reply) => {
    const orgId = getOrgId(request);
    const { projectId } = request.params as { projectId: string };
    const query = request.query as Record<string, string>;
    const { page, limit, offset } = parsePagination(query);

    try {
      const db = await getDb();

      const rows = await db
        .select()
        .from(codeReviews)
        .where(and(eq(codeReviews.projectId, projectId), eq(codeReviews.orgId, orgId)))
        .orderBy(desc(codeReviews.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(codeReviews)
        .where(and(eq(codeReviews.projectId, projectId), eq(codeReviews.orgId, orgId)));

      return paginatedResponse(rows, Number(total), page, limit);
    } catch (err) {
      app.log.error(err, 'Failed to list code reviews');
      return reply.code(500).send({ error: 'Failed to list code reviews' });
    }
  });

  // ── Trigger a new code review (manual) ──────────────────────────
  app.post('/projects/:projectId/code-reviews', async (request, reply) => {
    const orgId = getOrgId(request);
    const userId = getUserId(request);
    const { projectId } = request.params as { projectId: string };
    const body = request.body as {
      files?: SourceFile[];
      commitSha?: string;
      branch?: string;
      aiEnabled?: boolean;
    };

    if (!body.files || body.files.length === 0) {
      return reply.code(400).send({ error: 'No files provided for review. Send { files: [{ path, content }] }' });
    }

    try {
      const db = await getDb();

      // Filter to supported file types
      const supportedFiles = filterSupportedFiles(body.files);
      if (supportedFiles.length === 0) {
        return reply.code(400).send({
          error: 'No supported files found. Supported extensions: .php, .js, .ts, .tsx, .jsx, .py',
        });
      }

      // Run rule-based analysis
      const result = runRuleBasedReview(supportedFiles);

      // Create the review record
      const [review] = await db
        .insert(codeReviews)
        .values({
          projectId,
          orgId,
          commitSha: body.commitSha || null,
          branch: body.branch || null,
          triggerType: 'manual',
          status: 'completed',
          totalFindings: result.totalFindings,
          criticalCount: result.criticalCount,
          highCount: result.highCount,
          mediumCount: result.mediumCount,
          lowCount: result.lowCount,
          infoCount: result.infoCount,
          aiEnabled: body.aiEnabled || false,
          filesScanned: result.filesScanned,
          durationMs: result.durationMs,
          completedAt: new Date(),
        })
        .returning();

      // Insert findings in bulk
      if (result.findings.length > 0) {
        const findingRows = result.findings.map((f) => ({
          reviewId: review.id,
          projectId,
          file: f.file,
          line: f.line,
          endLine: f.endLine || null,
          column: f.column || null,
          ruleId: f.ruleId,
          ruleName: f.ruleName,
          category: f.category,
          severity: f.severity,
          message: f.message,
          snippet: f.snippet,
          suggestion: f.suggestion,
          suggestedFix: f.suggestedFix || null,
          autoFixable: f.autoFixable,
          status: 'open',
          source: f.source,
        }));

        await db.insert(codeReviewFindings).values(findingRows);
      }

      app.log.info(
        { reviewId: review.id, findings: result.totalFindings, filesScanned: result.filesScanned },
        `Code review completed: ${result.totalFindings} findings in ${result.filesScanned} files (${result.durationMs}ms)`,
      );

      return reply.code(201).send({
        data: {
          ...review,
          severityLabel: getSeverityLabel(result),
          findingsPreview: result.findings.slice(0, 10),
        },
      });
    } catch (err) {
      app.log.error(err, 'Failed to run code review');
      return reply.code(500).send({ error: 'Failed to run code review' });
    }
  });

  // ── Get a single code review ────────────────────────────────────
  app.get('/code-reviews/:reviewId', async (request, reply) => {
    const { reviewId } = request.params as { reviewId: string };

    try {
      const db = await getDb();

      const [review] = await db
        .select()
        .from(codeReviews)
        .where(eq(codeReviews.id, reviewId))
        .limit(1);

      if (!review) {
        return reply.code(404).send({ error: 'Code review not found' });
      }

      // Fetch top findings (first 50)
      const findings = await db
        .select()
        .from(codeReviewFindings)
        .where(eq(codeReviewFindings.reviewId, reviewId))
        .limit(50);

      return {
        data: {
          ...review,
          findings,
        },
      };
    } catch (err) {
      app.log.error(err, 'Failed to get code review');
      return reply.code(500).send({ error: 'Failed to get code review' });
    }
  });

  // ── List findings for a review (paginated) ──────────────────────
  app.get('/code-reviews/:reviewId/findings', async (request, reply) => {
    const { reviewId } = request.params as { reviewId: string };
    const query = request.query as Record<string, string>;
    const { page, limit, offset } = parsePagination(query);
    const severityFilter = query.severity;

    try {
      const db = await getDb();

      const conditions = [eq(codeReviewFindings.reviewId, reviewId)];
      if (severityFilter) {
        conditions.push(eq(codeReviewFindings.severity, severityFilter));
      }

      const rows = await db
        .select()
        .from(codeReviewFindings)
        .where(and(...conditions))
        .orderBy(desc(codeReviewFindings.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(codeReviewFindings)
        .where(and(...conditions));

      return paginatedResponse(rows, Number(total), page, limit);
    } catch (err) {
      app.log.error(err, 'Failed to list code review findings');
      return reply.code(500).send({ error: 'Failed to list findings' });
    }
  });

  // ── Update finding status (ignore / resolve) ────────────────────
  app.put('/code-review-findings/:findingId', async (request, reply) => {
    const { findingId } = request.params as { findingId: string };
    const body = request.body as { status: string };

    const validStatuses = ['open', 'ignored', 'fixed', 'false-positive'];
    if (!validStatuses.includes(body.status)) {
      return reply.code(400).send({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    try {
      const db = await getDb();

      const [updated] = await db
        .update(codeReviewFindings)
        .set({ status: body.status })
        .where(eq(codeReviewFindings.id, findingId))
        .returning();

      if (!updated) {
        return reply.code(404).send({ error: 'Finding not found' });
      }

      return { data: updated };
    } catch (err) {
      app.log.error(err, 'Failed to update finding');
      return reply.code(500).send({ error: 'Failed to update finding' });
    }
  });

  // ── Get review summary stats (for dashboard widgets) ────────────
  app.get('/projects/:projectId/code-review-stats', async (request, reply) => {
    const orgId = getOrgId(request);
    const { projectId } = request.params as { projectId: string };

    try {
      const db = await getDb();

      // Total reviews
      const [{ total }] = await db
        .select({ total: count() })
        .from(codeReviews)
        .where(and(eq(codeReviews.projectId, projectId), eq(codeReviews.orgId, orgId)));

      // Latest review
      const [latest] = await db
        .select()
        .from(codeReviews)
        .where(and(eq(codeReviews.projectId, projectId), eq(codeReviews.orgId, orgId)))
        .orderBy(desc(codeReviews.createdAt))
        .limit(1);

      // Open findings count across all reviews
      const [{ openFindings }] = await db
        .select({ openFindings: count() })
        .from(codeReviewFindings)
        .where(
          and(
            eq(codeReviewFindings.projectId, projectId),
            eq(codeReviewFindings.status, 'open'),
          ),
        );

      return {
        data: {
          totalReviews: Number(total),
          openFindings: Number(openFindings),
          latestReview: latest || null,
          lastReviewedAt: latest?.createdAt || null,
        },
      };
    } catch (err) {
      app.log.error(err, 'Failed to get code review stats');
      return reply.code(500).send({ error: 'Failed to get code review stats' });
    }
  });

  // ── List all available rules ────────────────────────────────────
  app.get('/code-review-rules', async (_request, _reply) => {
    const { allRules } = await import('../lib/code-review-rules.js');
    return {
      data: allRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        suggestion: rule.suggestion,
        autoFixable: rule.autoFixable,
        fileExtensions: rule.fileExtensions,
      })),
      total: allRules.length,
    };
  });
}
