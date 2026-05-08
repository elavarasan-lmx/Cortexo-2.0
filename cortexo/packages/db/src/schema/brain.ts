import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';

// ─── Sprint 6 (F9, F10, F11): Source Code Brain ─────────────────────

/**
 * Tracks the "Brain" state for a project (AI learning its codebase patterns).
 */
export const projectBrains = pgTable(
  'project_brains',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull()
      .unique(), // One brain per project
    status: varchar('status', { length: 20 }).default('pending'), // pending|scanning|ready|stale
    freshness: integer('freshness'),          // 0–100 health score for brain context
    lastScannedAt: timestamp('last_scanned_at'),
    totalFilesScanned: integer('total_files_scanned'),
    patternsDetected: integer('patterns_detected'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_project_brains_project').on(table.projectId),
  ],
);

/**
 * Learned patterns from the codebase (e.g., UI conventions, security norms).
 */
export const brainPatterns = pgTable(
  'brain_patterns',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    brainId: uuid('brain_id')
      .references(() => projectBrains.id)
      .notNull(),
    category: varchar('category', { length: 50 }),    // 'ui-component'|'naming'|'error-handling'|'security'
    name: varchar('name', { length: 200 }),           // e.g. 'Alert System'
    detectedValue: text('detected_value'),            // e.g. 'SweetAlert2'
    occurrenceCount: integer('occurrence_count').default(0),
    exampleFiles: jsonb('example_files').$type<string[]>().default([]), // sample file paths
    ruleRegex: text('rule_regex'),                    // regex used to detect violations
    violationMessage: text('violation_message'),      // "Use SweetAlert2, not native alert()"
    severity: varchar('severity', { length: 20 }).default('medium'),
    enabled: boolean('enabled').default(true),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_brain_patterns_brain').on(table.brainId),
  ],
);

/**
 * Violations where code diverges from learned patterns.
 */
export const brainViolations = pgTable(
  'brain_violations',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    brainId: uuid('brain_id')
      .references(() => projectBrains.id)
      .notNull(),
    patternId: uuid('pattern_id')
      .references(() => brainPatterns.id),
    commitSha: varchar('commit_sha', { length: 40 }),
    file: text('file'),
    line: integer('line'),
    detected: text('detected'),      // what was found
    expected: text('expected'),      // what was expected
    status: varchar('status', { length: 20 }).default('open'), // open|ignored|fixed
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_brain_violations_brain').on(table.brainId),
    index('idx_brain_violations_status').on(table.brainId, table.status),
  ],
);

export type ProjectBrain = typeof projectBrains.$inferSelect;
export type NewProjectBrain = typeof projectBrains.$inferInsert;
export type BrainPattern = typeof brainPatterns.$inferSelect;
export type NewBrainPattern = typeof brainPatterns.$inferInsert;
export type BrainViolation = typeof brainViolations.$inferSelect;
export type NewBrainViolation = typeof brainViolations.$inferInsert;
