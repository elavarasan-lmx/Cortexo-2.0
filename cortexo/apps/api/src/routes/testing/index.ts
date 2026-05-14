/**
 * Testing Module — Route Index
 *
 * Modular entry point for the testing engine.
 * Sub-modules:
 *   - types.ts       — Shared types, constants, helpers
 *   - targets.ts     — Target CRUD + project scanning + test cases
 *   - runners.ts     — L1/L2/L3 test runners
 *   - bugs.ts        — Bug analysis + export
 *   - runs.ts        — Run history + full-run + level breakdown
 *   - modules.ts     — Module grouping
 *   - module-defs.ts — Module test definitions + runner
 */

import type { FastifyInstance } from 'fastify';
import { targetRoutes } from './targets.js';
import { runnerRoutes } from './runners.js';
import { bugRoutes } from './bugs.js';
import { runRoutes } from './runs.js';
import { moduleRoutes } from './modules.js';
import { moduleDefRoutes } from './module-defs.js';

export async function testingRoutes(app: FastifyInstance) {
  await app.register(targetRoutes);
  await app.register(runnerRoutes);
  await app.register(bugRoutes);
  await app.register(runRoutes);
  await app.register(moduleRoutes);
  await app.register(moduleDefRoutes);
}
