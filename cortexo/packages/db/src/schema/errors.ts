import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigserial,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects';
import { organizations } from './organizations';

/**
 * Errors table — grouped error types (fingerprint-based deduplication).
 * Each unique error fingerprint creates one row; individual occurrences go to error_events.
 */
export const errors = pgTable(
  'errors',
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
    fingerprint: varchar('fingerprint', { length: 64 }).notNull(),
    type: varchar('type', { length: 200 }).notNull(),
    message: text('message'),
    file: varchar('file', { length: 500 }),
    line: integer('line'),
    severity: varchar('severity', { length: 20 }).default('error'),
    status: varchar('status', { length: 20 }).default('unresolved'),
    assignedTo: uuid('assigned_to'),
    firstSeenAt: timestamp('first_seen_at')
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp('last_seen_at')
      .defaultNow()
      .notNull(),
    eventCount: integer('event_count').default(1),
    linkedDeployId: uuid('linked_deploy_id'),
    tags: jsonb('tags').$type<string[]>().default([]),
    isRegression: boolean('is_regression').default(false),
    createdAt: timestamp('created_at')
      .defaultNow()
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
 * High-throughput append-only table. BIGSERIAL for write performance.
 */
export const errorEvents = pgTable(
  'error_events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    errorId: uuid('error_id')
      .references(() => errors.id)
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    stackTrace: text('stack_trace'),
    context: jsonb('context').$type<Record<string, unknown>>().default({}),
    breadcrumbs: jsonb('breadcrumbs').$type<Array<{
      message: string;
      category?: string;
      data?: Record<string, unknown>;
      timestamp?: string;
    }>>(),
    userContext: jsonb('user_context').$type<{
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
    createdAt: timestamp('created_at')
      .defaultNow()
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
export const rootCauses = pgTable(
  'root_causes',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    errorId: uuid('error_id')
      .references(() => errors.id)
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id),
    deploymentId: uuid('deployment_id'),
    analysis: text('analysis'),
    similarBugs: jsonb('similar_bugs').$type<string[]>().default([]),
    suggestedFix: text('suggested_fix'),
    diffContext: text('diff_context'),
    confidence: integer('confidence'),
    model: varchar('model', { length: 50 }),
    tokenUsage: jsonb('token_usage').$type<{
      prompt: number;
      completion: number;
      total: number;
    }>(),
    feedbackRating: integer('feedback_rating'),
    feedbackComment: text('feedback_comment'),
    status: varchar('status', { length: 20 }).default('pending'),
    createdAt: timestamp('created_at')
      .defaultNow()
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
