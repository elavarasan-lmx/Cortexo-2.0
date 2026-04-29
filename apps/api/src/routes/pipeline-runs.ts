import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { pipelineRuns, pipelines, projects } from '@cortexo/db/schema';
import { getRedis } from '../lib/redis.js';

/**
 * Pipeline Runs API — /v1/pipeline-runs
 */
export async function pipelineRunRoutes(app: FastifyInstance) {
  // List all runs — JOIN projects to avoid N+1
  app.get('/pipeline-runs', async (request, reply) => {
    try {
      const db = await getDb();
      const rows = await db
        .select({
          run: pipelineRuns,
          projectName: projects.name,
        })
        .from(pipelineRuns)
        .leftJoin(projects, eq(pipelineRuns.projectId, projects.id))
        .orderBy(desc(pipelineRuns.createdAt))
        .limit(100);

      const data = rows.map(r => ({
        ...r.run,
        projectName: r.projectName,
      }));
      return { data, total: data.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch pipeline runs' });
    }
  });

  // Get a single run
  app.get('/pipeline-runs/:runId', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    try {
      const db = await getDb();
      const rows = await db.select().from(pipelineRuns).where(eq(pipelineRuns.id, runId)).limit(1);
      if (!rows[0]) return reply.code(404).send({ error: 'Pipeline run not found' });
      return { data: rows[0] };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch run' });
    }
  });

  // Re-trigger a run
  app.post('/pipeline-runs/:runId/retry', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    try {
      const db = await getDb();
      const origRows = await db.select().from(pipelineRuns).where(eq(pipelineRuns.id, runId)).limit(1);
      if (!origRows[0]) return reply.code(404).send({ error: 'Run not found' });
      const original = origRows[0];

      const pipelineRows = await db.select().from(pipelines).where(eq(pipelines.id, original.pipelineId)).limit(1);
      if (!pipelineRows[0]) return reply.code(404).send({ error: 'Pipeline not found' });
      const pipeline = pipelineRows[0];

      const lastRuns = await db.select().from(pipelineRuns)
        .where(eq(pipelineRuns.pipelineId, original.pipelineId))
        .orderBy(desc(pipelineRuns.runNumber))
        .limit(1);
      const runNumber = ((lastRuns[0] as any)?.runNumber || 0) + 1;
      const newRunId = crypto.randomUUID();

      await db.insert(pipelineRuns).values({
        id: newRunId,
        pipelineId: original.pipelineId,
        projectId: original.projectId,
        orgId: original.orgId,
        runNumber,
        status: 'queued',
        branch: original.branch,
        commitMessage: `[retry] ${original.commitMessage || ''}`,
        triggerType: 'manual',
      } as any);

      const redis = getRedis();
      await redis.lpush('cortexo:pipeline:queue', JSON.stringify({
        runId: newRunId,
        pipelineId: original.pipelineId,
        projectId: original.projectId,
        stages: pipeline.stages,
        branch: original.branch,
      }));

      return reply.code(201).send({ data: { id: newRunId, runNumber, status: 'queued' } });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to retry run' });
    }
  });

  // Cancel a running pipeline
  app.post('/pipeline-runs/:runId/cancel', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    try {
      const db = await getDb();
      const rows = await db.select().from(pipelineRuns).where(eq(pipelineRuns.id, runId)).limit(1);
      if (!rows[0]) return reply.code(404).send({ error: 'Run not found' });

      if (rows[0].status !== 'running' && rows[0].status !== 'queued') {
        return reply.code(400).send({ error: 'Run is not cancellable (already completed or failed)' });
      }

      await db.update(pipelineRuns).set({ status: 'cancelled' } as any).where(eq(pipelineRuns.id, runId));
      return { data: { id: runId, status: 'cancelled' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to cancel run' });
    }
  });
}
