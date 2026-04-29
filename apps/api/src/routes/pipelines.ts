import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { getRedis } from '../lib/redis.js';
import { Queue } from 'bullmq';
import { pipelines as pipelinesTable, pipelineRuns } from '@cortexo/db/schema';

// BullMQ Queue for pipeline jobs (matches worker queue name)
let pipelineQueue: Queue | null = null;
function getPipelineQueue(): Queue {
  if (!pipelineQueue) {
    pipelineQueue = new Queue('cortexo:pipeline', {
      connection: getRedis().duplicate(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 86400, count: 100 },
        removeOnFail: { age: 604800, count: 200 },
      },
    });
  }
  return pipelineQueue;
}

const createPipelineSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  trigger: z.object({
    push: z.object({ branches: z.array(z.string()) }).optional(),
    pull_request: z.object({ branches: z.array(z.string()) }).optional(),
    manual: z.boolean().optional(),
  }).optional(),
  stages: z.array(z.object({
    name: z.string(),
    type: z.string().optional(),
    run: z.string().optional(),
    config: z.record(z.unknown()).optional(),
  })),
  yamlConfig: z.string().optional(),
});

const triggerRunSchema = z.object({
  branch: z.string().default('main'),
  commitSha: z.string().optional(),
  commitMessage: z.string().optional(),
});

/**
 * Pipelines API — /v1/pipelines
 * CRUD + trigger pipeline runs.
 */
export async function pipelineRoutes(app: FastifyInstance) {
  // List pipelines
  app.get('/pipelines', async (request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.pipelines.findMany({
        orderBy: (p, { desc }) => [desc(p.updatedAt)],
      });
      return { data: rows, total: rows.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch pipelines' });
    }
  });

  // Get single pipeline with recent runs
  app.get('/pipelines/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const pipeline = await db.query.pipelines.findFirst({
        where: (p, { eq }) => eq(p.id, id),
      });
      if (!pipeline) return reply.code(404).send({ error: 'Pipeline not found' });

      const runs = await db.query.pipelineRuns.findMany({
        where: (r, { eq }) => eq(r.pipelineId, id),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        limit: 10,
      });

      return { data: { ...pipeline, recentRuns: runs } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch pipeline' });
    }
  });

  // Create pipeline
  app.post('/pipelines', async (request, reply) => {
    const parsed = createPipelineSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const db = await getDb();
      const id = crypto.randomUUID();
      await db.insert(pipelinesTable).values({
        id,
        orgId: 'default-org',
        ...parsed.data,
      } as any);

      return reply.code(201).send({ data: { id, ...parsed.data } });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create pipeline' });
    }
  });

  // PUT /pipelines/:id — Update pipeline config
  app.put('/pipelines/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    try {
      const db = await getDb();
      const existing = await db.query.pipelines.findFirst({
        where: (p, { eq }) => eq(p.id, id),
      });
      if (!existing) return reply.code(404).send({ error: 'Pipeline not found' });
      await db.update(pipelinesTable).set({
        name: (body.name as string) || existing.name,
        stages: body.stages || existing.stages,
        yamlConfig: (body.yamlConfig as string) || existing.yamlConfig,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      }).where(eq(pipelinesTable.id, id));
      return { data: { id, message: 'Pipeline updated' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update pipeline' });
    }
  });

  // DELETE /pipelines/:id — Delete pipeline
  app.delete('/pipelines/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const existing = await db.query.pipelines.findFirst({
        where: (p, { eq }) => eq(p.id, id),
      });
      if (!existing) return reply.code(404).send({ error: 'Pipeline not found' });
      await db.delete(pipelinesTable).where(eq(pipelinesTable.id, id));
      return { data: { id, message: 'Pipeline deleted' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete pipeline' });
    }
  });

  // Trigger a pipeline run
  app.post('/pipelines/:id/run', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = triggerRunSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const db = await getDb();

      // Load pipeline config
      const pipeline = await db.query.pipelines.findFirst({
        where: (p, { eq }) => eq(p.id, id),
      });
      if (!pipeline) return reply.code(404).send({ error: 'Pipeline not found' });

      // Get next run number
      const lastRun = await db.query.pipelineRuns.findFirst({
        where: (r, { eq }) => eq(r.pipelineId, id),
        orderBy: (r, { desc }) => [desc(r.runNumber)],
      });
      const runNumber = (lastRun?.runNumber || 0) + 1;

      const runId = crypto.randomUUID();

      // Insert pipeline run record (status: queued)
      await db.insert(pipelineRuns).values({
        id: runId,
        pipelineId: id,
        projectId: pipeline.projectId,
        orgId: pipeline.orgId,
        runNumber,
        status: 'queued',
        branch: parsed.data.branch,
        commitSha: parsed.data.commitSha,
        commitMessage: parsed.data.commitMessage,
        triggerType: 'manual',
      } as any);

      // Push job to BullMQ queue for the worker to consume
      const queue = getPipelineQueue();
      await queue.add(`pipeline-run-${runNumber}`, {
        runId,
        pipelineId: id,
        projectId: pipeline.projectId,
        stages: pipeline.stages,
        branch: parsed.data.branch,
        commitSha: parsed.data.commitSha,
      }, {
        jobId: runId, // Deduplication — same runId won't be queued twice
        priority: 1,
      });

      app.log.info({ runId, pipelineId: id, runNumber }, 'Pipeline run queued');

      return reply.code(201).send({
        data: {
          id: runId,
          pipelineId: id,
          runNumber,
          status: 'queued',
          branch: parsed.data.branch,
        },
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to trigger pipeline' });
    }
  });

  // Get run details
  app.get('/pipelines/:pipelineId/runs/:runId', async (request, reply) => {
    const { runId } = request.params as { pipelineId: string; runId: string };
    try {
      const db = await getDb();
      const run = await db.query.pipelineRuns.findFirst({
        where: (r, { eq }) => eq(r.id, runId),
      });
      if (!run) return reply.code(404).send({ error: 'Run not found' });
      return { data: run };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch run' });
    }
  });
}
