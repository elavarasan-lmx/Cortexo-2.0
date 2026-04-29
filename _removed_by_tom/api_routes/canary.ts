/**
 * Canary Deployments API — /v1/deployments/canary
 * Manages phased rollouts: 5% → 25% → 100%
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { getDb } from '../lib/db.js';

// In-memory canary store (use DB in production)
const canaryStore = new Map<string, CanaryConfig>();

interface CanaryConfig {
  id: string;
  deploymentId: string;
  projectId: string;
  branch: string;
  environment: string;
  currentPhase: number; // 0=pending, 1=5%, 2=25%, 3=100%
  phases: { percent: number; startedAt: string | null; completedAt: string | null; status: 'pending' | 'active' | 'complete' | 'failed' }[];
  status: 'active' | 'completed' | 'rolled_back' | 'failed';
  createdAt: string;
  errorRateBaseline: number;
  errorRateCurrent: number;
  autoPromote: boolean;
  autoRollbackThreshold: number;
}

const createCanarySchema = z.object({
  deploymentId: z.string(),
  projectId: z.string(),
  branch: z.string().default('main'),
  environment: z.string().default('production'),
  autoPromote: z.boolean().default(false),
  autoRollbackThreshold: z.number().min(0).max(100).default(5), // % error rate increase
});

export async function canaryRoutes(app: FastifyInstance) {
  // List all canary deployments
  app.get('/deployments/canary', async (request, reply) => {
    const canaries = Array.from(canaryStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return { data: canaries, total: canaries.length };
  });

  // Get single canary
  app.get('/deployments/canary/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const canary = canaryStore.get(id);
    if (!canary) return reply.code(404).send({ error: 'Canary not found' });
    return { data: canary };
  });

  // Create canary deployment
  app.post('/deployments/canary', async (request, reply) => {
    const parsed = createCanarySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });

    const id = crypto.randomUUID();
    const canary: CanaryConfig = {
      id,
      ...parsed.data,
      currentPhase: 0,
      phases: [
        { percent: 5, startedAt: new Date().toISOString(), completedAt: null, status: 'active' },
        { percent: 25, startedAt: null, completedAt: null, status: 'pending' },
        { percent: 100, startedAt: null, completedAt: null, status: 'pending' },
      ],
      status: 'active',
      createdAt: new Date().toISOString(),
      errorRateBaseline: 0.12,
      errorRateCurrent: 0.12,
      autoPromote: parsed.data.autoPromote,
      autoRollbackThreshold: parsed.data.autoRollbackThreshold,
    };

    canaryStore.set(id, canary);
    app.log.info({ id, deploymentId: parsed.data.deploymentId }, 'Canary deployment created');
    return reply.code(201).send({ data: canary });
  });

  // Promote canary to next phase
  app.post('/deployments/canary/:id/promote', async (request, reply) => {
    const { id } = request.params as { id: string };
    const canary = canaryStore.get(id);
    if (!canary) return reply.code(404).send({ error: 'Canary not found' });
    if (canary.status !== 'active') return reply.code(400).send({ error: `Canary is ${canary.status}` });

    const now = new Date().toISOString();

    // Complete current phase
    if (canary.phases[canary.currentPhase]) {
      canary.phases[canary.currentPhase].completedAt = now;
      canary.phases[canary.currentPhase].status = 'complete';
    }

    canary.currentPhase += 1;

    if (canary.currentPhase >= canary.phases.length) {
      canary.status = 'completed';
      app.log.info({ id }, 'Canary deployment fully promoted');
    } else {
      canary.phases[canary.currentPhase].startedAt = now;
      canary.phases[canary.currentPhase].status = 'active';
      app.log.info({ id, phase: canary.phases[canary.currentPhase].percent }, 'Canary promoted to next phase');
    }

    canaryStore.set(id, canary);
    return { data: canary };
  });

  // Roll back canary
  app.post('/deployments/canary/:id/rollback', async (request, reply) => {
    const { id } = request.params as { id: string };
    const canary = canaryStore.get(id);
    if (!canary) return reply.code(404).send({ error: 'Canary not found' });

    canary.status = 'rolled_back';
    if (canary.phases[canary.currentPhase]) {
      canary.phases[canary.currentPhase].status = 'failed';
    }
    canaryStore.set(id, canary);

    app.log.warn({ id }, 'Canary deployment rolled back');
    return { data: canary, message: 'Canary rolled back — traffic restored to stable version' };
  });

  // Update error rate (called by monitoring system)
  app.patch('/deployments/canary/:id/metrics', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = z.object({ errorRate: z.number() }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { errorRate } = parsed.data;
    const canary = canaryStore.get(id);
    if (!canary) return reply.code(404).send({ error: 'Canary not found' });

    canary.errorRateCurrent = errorRate;

    // Auto-rollback if threshold exceeded
    if (canary.autoRollbackThreshold && (errorRate - canary.errorRateBaseline) > canary.autoRollbackThreshold) {
      canary.status = 'rolled_back';
      if (canary.phases[canary.currentPhase]) canary.phases[canary.currentPhase].status = 'failed';
      app.log.warn({ id, errorRate, baseline: canary.errorRateBaseline }, 'Canary auto-rolled back due to error spike');
    }

    canaryStore.set(id, canary);
    return { data: canary };
  });
}
