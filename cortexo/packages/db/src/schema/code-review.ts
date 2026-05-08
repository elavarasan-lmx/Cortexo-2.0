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
import { organizations } from './organizations';

/**
 * Code reviews table — rule-based + AI-powered code review sessions.
 * Each review is triggered by a pipeline run, webhook push, or manually.
 * Findings are stored in the code_review_findings child table.
 */
export const codeReviews = pgTable(
  'code_reviews',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    commitSha: varchar('commit_sha', { length: 40 }),
    branch: varchar('branch', { length: 200 }),
    triggerType: varchar('trigger_type', { length: 30 }).default('manual'),
    status: varchar('status', { length: 20 }).default('pending'),
    totalFindings: integer('total_findings').default(0),
    criticalCount: integer('critical_count').default(0),
    highCount: integer('high_count').default(0),
    mediumCount: integer('medium_count').default(0),
    lowCount: integer('low_count').default(0),
    infoCount: integer('info_count').default(0),
    aiEnabled: boolean('ai_enabled').default(false),
    filesScanned: integer('files_scanned').default(0),
    durationMs: integer('duration_ms'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('idx_code_reviews_project').on(table.projectId, table.status),
    index('idx_code_reviews_org').on(table.orgId),
  ],
);

/**
 * Code review findings — individual rule violations or AI-detected issues.
 * Each finding maps to a specific file + line with a fix suggestion.
 */
export const codeReviewFindings = pgTable(
  'code_review_findings',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    reviewId: uuid('review_id')
      .references(() => codeReviews.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    file: text('file').notNull(),
    line: integer('line'),
    endLine: integer('end_line'),
    column: integer('column'),
    ruleId: varchar('rule_id', { length: 100 }).notNull(),
    ruleName: varchar('rule_name', { length: 200 }),
    category: varchar('category', { length: 50 }),
    severity: varchar('severity', { length: 20 }).notNull(),
    message: text('message').notNull(),
    snippet: text('snippet'),
    suggestion: text('suggestion'),
    suggestedFix: text('suggested_fix'),
    autoFixable: boolean('auto_fixable').default(false),
    status: varchar('status', { length: 20 }).default('open'),
    source: varchar('source', { length: 20 }).default('rule'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_findings_review').on(table.reviewId),
    index('idx_findings_severity').on(table.reviewId, table.severity),
    index('idx_findings_rule').on(table.ruleId),
  ],
);

export type CodeReview = typeof codeReviews.$inferSelect;
export type NewCodeReview = typeof codeReviews.$inferInsert;
export type CodeReviewFinding = typeof codeReviewFindings.$inferSelect;
export type NewCodeReviewFinding = typeof codeReviewFindings.$inferInsert;
