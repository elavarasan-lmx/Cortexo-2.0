import {
  mysqlTable,
  char,
  varchar,
  text,
  int,
  bigint,
  boolean,
  datetime,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects';
import { organizations } from './organizations';

/**
 * Errors table — grouped error types (fingerprint-based deduplication).
 * Each unique error fingerprint creates one row; individual occurrences go to error_events.
 */
export const errors = mysqlTable(
  'errors',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: char('project_id', { length: 36 })
      .references(() => projects.id)
      .notNull(),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    fingerprint: varchar('fingerprint', { length: 64 }).notNull(),
    type: varchar('type', { length: 200 }).notNull(),
    message: text('message'),
    file: varchar('file', { length: 500 }),
    line: int('line'),
    severity: varchar('severity', { length: 20 }).default('error'),
    status: varchar('status', { length: 20 }).default('unresolved'),
    assignedTo: char('assigned_to', { length: 36 }),
    firstSeenAt: datetime('first_seen_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    lastSeenAt: datetime('last_seen_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    eventCount: int('event_count').default(1),
    linkedDeployId: char('linked_deploy_id', { length: 36 }),
    tags: json('tags').$type<string[]>().default([]),
    isRegression: boolean('is_regression').default(false),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_errors_project').on(table.projectId, table.status),
    index('idx_errors_fingerprint').on(table.projectId, table.fingerprint),
    index('idx_errors_project_time').on(table.projectId, table.lastSeenAt),
  ],
);

/**
 * Error events table — individual error occurrences.
 * High-throughput append-only table. BIGINT auto-increment for write performance.
 */
export const errorEvents = mysqlTable(
  'error_events',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    errorId: char('error_id', { length: 36 })
      .references(() => errors.id)
      .notNull(),
    projectId: char('project_id', { length: 36 })
      .references(() => projects.id)
      .notNull(),
    stackTrace: text('stack_trace'),
    context: json('context').$type<Record<string, unknown>>().default({}),
    breadcrumbs: json('breadcrumbs').$type<Array<{
      message: string;
      category?: string;
      data?: Record<string, unknown>;
      timestamp?: string;
    }>>(),
    userContext: json('user_context').$type<{
      id?: string;
      email?: string;
      name?: string;
    }>(),
    environment: varchar('environment', { length: 50 }),
    release: varchar('release', { length: 50 }),
    serverName: varchar('server_name', { length: 200 }),
    url: varchar('url', { length: 1000 }),
    method: varchar('method', { length: 10 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    sdkVersion: varchar('sdk_version', { length: 20 }),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_events_error').on(table.errorId),
    index('idx_events_project_time').on(table.projectId, table.createdAt),
  ],
);

/**
 * Root cause analyses table — AI-generated root cause reports.
 * Links error → deploy diff → AI explanation.
 */
export const rootCauses = mysqlTable(
  'root_causes',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    errorId: char('error_id', { length: 36 })
      .references(() => errors.id)
      .notNull(),
    projectId: char('project_id', { length: 36 })
      .references(() => projects.id)
      .notNull(),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id),
    deploymentId: char('deployment_id', { length: 36 }),
    analysis: text('analysis'),
    similarBugs: json('similar_bugs').$type<string[]>().default([]),
    suggestedFix: text('suggested_fix'),
    diffContext: text('diff_context'),
    confidence: int('confidence'),
    model: varchar('model', { length: 50 }),
    tokenUsage: json('token_usage').$type<{
      prompt: number;
      completion: number;
      total: number;
    }>(),
    feedbackRating: int('feedback_rating'),
    feedbackComment: text('feedback_comment'),
    status: varchar('status', { length: 20 }).default('pending'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_root_causes_error').on(table.errorId)],
);

export type Error = typeof errors.$inferSelect;
export type NewError = typeof errors.$inferInsert;
export type ErrorEvent = typeof errorEvents.$inferSelect;
export type NewErrorEvent = typeof errorEvents.$inferInsert;
export type RootCause = typeof rootCauses.$inferSelect;
export type NewRootCause = typeof rootCauses.$inferInsert;
