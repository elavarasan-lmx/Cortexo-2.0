/**
 * Testing Module — Route Index
 *
 * This is the modular entry point for the testing engine.
 * Sub-modules:
 *   - types.ts    — Shared types, constants, helpers
 *   - targets.ts  — Target CRUD + project scanning + test cases
 *   - runners.ts  — L1/L2/L3 test runners
 *   - bugs.ts     — Bug analysis + export (TODO: extract from legacy)
 *   - runs.ts     — Run history + level breakdown (TODO: extract)
 *   - modules.ts  — Module grouping (TODO: extract)
 *   - module-defs.ts — Module test definitions (TODO: extract)
 *
 * Currently: re-exports the original monolithic testing.ts.
 * Migration plan: replace this re-export with sub-module registrations
 * once all sub-modules are verified.
 */

// ── CURRENT: Use original monolithic file (zero-risk) ──────────────────
// Once all sub-modules are tested, replace with the import below.
export { testingRoutes } from '../testing.js';

// ── FUTURE: Modular registration ───────────────────────────────────────
// import type { FastifyInstance } from 'fastify';
// import { targetRoutes } from './targets.js';
// import { runnerRoutes } from './runners.js';
// import { bugRoutes } from './bugs.js';
// import { runRoutes } from './runs.js';
// import { moduleRoutes } from './modules.js';
// import { moduleDefRoutes } from './module-defs.js';
//
// export async function testingRoutes(app: FastifyInstance) {
//   await app.register(targetRoutes);
//   await app.register(runnerRoutes);
//   await app.register(bugRoutes);
//   await app.register(runRoutes);
//   await app.register(moduleRoutes);
//   await app.register(moduleDefRoutes);
// }
