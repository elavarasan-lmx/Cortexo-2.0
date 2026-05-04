import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';

// ─── Cron Jobs ──────────────────────────────────────────────────────────────

export const cronJobs = pgTable(
  'cron_jobs',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    schedule: varchar('schedule', { length: 50 }).notNull(),
    command: text('command').notNull(),
    targetServer: varchar('target_server', { length: 100 }),
    timezone: varchar('timezone', { length: 50 }).default('UTC'),
    isActive: boolean('is_active').default(true),
    lastRunAt: timestamp('last_run_at'),
    nextRunAt: timestamp('next_run_at'),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_cronjobs_org').on(table.orgId),
    index('idx_cronjobs_active').on(table.orgId, table.isActive),
  ],
);

export type CronJob = typeof cronJobs.$inferSelect;
export type NewCronJob = typeof cronJobs.$inferInsert;

export const cronExecutions = pgTable(
  'cron_executions',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    cronJobId: uuid('cron_job_id')
      .references(() => cronJobs.id, { onDelete: 'cascade' })
      .notNull(),
    status: varchar('status', { length: 20 }).default('running'),
    output: text('output'),
    errorMessage: text('error_message'),
    exitCode: integer('exit_code'),
    durationMs: integer('duration_ms'),
    triggeredBy: varchar('triggered_by', { length: 20 }).default('schedule'),
    startedAt: timestamp('started_at')
      .defaultNow()
      .notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('idx_cronexec_job').on(table.cronJobId),
    index('idx_cronexec_status').on(table.status),
  ],
);

export type CronExecution = typeof cronExecutions.$inferSelect;
export type NewCronExecution = typeof cronExecutions.$inferInsert;

// ─── Alert Channels & Rules ────────────────────────────────────────────────

export const alertChannels = pgTable(
  'alert_channels',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    config: jsonb('config').$type<Record<string, unknown>>().default({}),
    isActive: boolean('is_active').default(true),
    events: jsonb('events').$type<string[]>().default([]),
    lastTriggeredAt: timestamp('last_triggered_at'),
    totalSent: integer('total_sent').default(0),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_alertch_org').on(table.orgId),
    index('idx_alertch_type').on(table.type),
  ],
);

export type AlertChannel = typeof alertChannels.$inferSelect;
export type NewAlertChannel = typeof alertChannels.$inferInsert;

export const alertRules = pgTable(
  'alert_rules',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    condition: varchar('condition', { length: 500 }).notNull(),
    threshold: integer('threshold'),
    channelIds: jsonb('channel_ids').$type<string[]>().default([]),
    severity: varchar('severity', { length: 20 }).default('warning'),
    isActive: boolean('is_active').default(true),
    cooldownMinutes: integer('cooldown_minutes').default(30),
    triggerCount: integer('trigger_count').default(0),
    lastTriggeredAt: timestamp('last_triggered_at'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_alertrules_org').on(table.orgId),
  ],
);

export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;

export const alertHistory = pgTable(
  'alert_history',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    ruleId: uuid('rule_id')
      .references(() => alertRules.id),
    channelId: uuid('channel_id')
      .references(() => alertChannels.id),
    ruleName: varchar('rule_name', { length: 100 }),
    channelName: varchar('channel_name', { length: 100 }),
    severity: varchar('severity', { length: 20 }).default('warning'),
    message: text('message'),
    status: varchar('status', { length: 20 }).default('pending'),
    sentAt: timestamp('sent_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_alerthistory_org').on(table.orgId),
    index('idx_alerthistory_sent').on(table.sentAt),
  ],
);

export type AlertHistoryRow = typeof alertHistory.$inferSelect;
export type NewAlertHistory = typeof alertHistory.$inferInsert;

// ─── Deprecation Scanner ────────────────────────────────────────────────────

export const deprecationResults = pgTable(
  'deprecation_results',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    projectId: uuid('project_id'),
    projectName: varchar('project_name', { length: 100 }),
    packageName: varchar('package_name', { length: 200 }).notNull(),
    currentVersion: varchar('current_version', { length: 50 }),
    latestVersion: varchar('latest_version', { length: 50 }),
    deprecationType: varchar('deprecation_type', { length: 30 }).notNull(),
    severity: varchar('severity', { length: 20 }).default('warning'),
    message: text('message'),
    affectedFiles: jsonb('affected_files').$type<string[]>().default([]),
    remediationUrl: varchar('remediation_url', { length: 500 }),
    isSuppressed: boolean('is_suppressed').default(false),
    suppressedBy: uuid('suppressed_by'),
    suppressedUntil: timestamp('suppressed_until'),
    scannedAt: timestamp('scanned_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_deprecation_org').on(table.orgId),
    index('idx_deprecation_sev').on(table.severity),
    index('idx_deprecation_pkg').on(table.packageName),
  ],
);

export type DeprecationResult = typeof deprecationResults.$inferSelect;
export type NewDeprecationResult = typeof deprecationResults.$inferInsert;

// ─── AI Judge Scores ────────────────────────────────────────────────────────

export const judgeScores = pgTable(
  'judge_scores',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    targetType: varchar('target_type', { length: 30 }).notNull(),
    targetId: varchar('target_id', { length: 100 }).notNull(),
    targetName: varchar('target_name', { length: 200 }),
    overallScore: integer('overall_score').notNull(),
    qualityScore: integer('quality_score'),
    reliabilityScore: integer('reliability_score'),
    securityScore: integer('security_score'),
    performanceScore: integer('performance_score'),
    maintainabilityScore: integer('maintainability_score'),
    grade: varchar('grade', { length: 5 }),
    summary: text('summary'),
    suggestions: jsonb('suggestions').$type<string[]>().default([]),
    aiModel: varchar('ai_model', { length: 50 }).default('gpt-4o'),
    scoredAt: timestamp('scored_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_judgescore_org').on(table.orgId),
    index('idx_judgescore_target').on(table.targetType, table.targetId),
    index('idx_judgescore_overall').on(table.overallScore),
  ],
);

export type JudgeScore = typeof judgeScores.$inferSelect;
export type NewJudgeScore = typeof judgeScores.$inferInsert;
