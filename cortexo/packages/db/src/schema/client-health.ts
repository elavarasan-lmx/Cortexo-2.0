import {
  pgTable,
  uuid,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';

// ─── Sprint 5 (F31, F39): Client Fleet Health ──────────────────────

/**
 * Client health scores — track 0-100 score per project over time.
 */
export const clientHealthScores = pgTable(
  'client_health_scores',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    score: integer('score').notNull(),       // 0–100
    errorScore: integer('error_score'),        // Component scores
    uptimeScore: integer('uptime_score'),
    dependencyScore: integer('dependency_score'),
    pendingFixScore: integer('pending_fix_score'),
    calculatedAt: timestamp('calculated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_client_health_project').on(table.projectId),
    index('idx_client_health_calc_at').on(table.projectId, table.calculatedAt),
  ],
);

export type ClientHealthScore = typeof clientHealthScores.$inferSelect;
export type NewClientHealthScore = typeof clientHealthScores.$inferInsert;
