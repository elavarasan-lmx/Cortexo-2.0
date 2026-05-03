import {
  mysqlTable,
  char,
  varchar,
  text,
  boolean,
  datetime,
  int,
  json,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';

// ─── Cron Jobs ──────────────────────────────────────────────────────────────

export const cronJobs = mysqlTable(
  'cron_jobs',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    schedule: varchar('schedule', { length: 50 }).notNull(),
    command: text('command').notNull(),
    targetServer: varchar('target_server', { length: 100 }),
    timezone: varchar('timezone', { length: 50 }).default('UTC'),
    isActive: boolean('is_active').default(true),
    lastRunAt: datetime('last_run_at'),
    nextRunAt: datetime('next_run_at'),
    createdBy: char('created_by', { length: 36 }),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_cronjobs_org').on(table.orgId),
    index('idx_cronjobs_active').on(table.orgId, table.isActive),
  ],
);

export type CronJob = typeof cronJobs.$inferSelect;
export type NewCronJob = typeof cronJobs.$inferInsert;

export const cronExecutions = mysqlTable(
  'cron_executions',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cronJobId: char('cron_job_id', { length: 36 })
      .references(() => cronJobs.id, { onDelete: 'cascade' })
      .notNull(),
    status: mysqlEnum('status', ['success', 'failed', 'running', 'timeout']).default('running'),
    output: text('output'),
    errorMessage: text('error_message'),
    exitCode: int('exit_code'),
    durationMs: int('duration_ms'),
    triggeredBy: mysqlEnum('triggered_by', ['schedule', 'manual']).default('schedule'),
    startedAt: datetime('started_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedAt: datetime('completed_at'),
  },
  (table) => [
    index('idx_cronexec_job').on(table.cronJobId),
    index('idx_cronexec_status').on(table.status),
  ],
);

export type CronExecution = typeof cronExecutions.$inferSelect;
export type NewCronExecution = typeof cronExecutions.$inferInsert;

// ─── Alert Channels & Rules ────────────────────────────────────────────────

export const alertChannels = mysqlTable(
  'alert_channels',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: mysqlEnum('type', ['slack', 'discord', 'email', 'sms', 'webhook', 'telegram']).notNull(),
    config: json('config').$type<Record<string, unknown>>().default({}),
    isActive: boolean('is_active').default(true),
    events: json('events').$type<string[]>().default([]),
    lastTriggeredAt: datetime('last_triggered_at'),
    totalSent: int('total_sent').default(0),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_alertch_org').on(table.orgId),
    index('idx_alertch_type').on(table.type),
  ],
);

export type AlertChannel = typeof alertChannels.$inferSelect;
export type NewAlertChannel = typeof alertChannels.$inferInsert;

export const alertRules = mysqlTable(
  'alert_rules',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    condition: varchar('condition', { length: 500 }).notNull(),
    threshold: int('threshold'),
    channelIds: json('channel_ids').$type<string[]>().default([]),
    severity: mysqlEnum('severity', ['info', 'warning', 'critical']).default('warning'),
    isActive: boolean('is_active').default(true),
    cooldownMinutes: int('cooldown_minutes').default(30),
    triggerCount: int('trigger_count').default(0),
    lastTriggeredAt: datetime('last_triggered_at'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_alertrules_org').on(table.orgId),
  ],
);

export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;

export const alertHistory = mysqlTable(
  'alert_history',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    ruleId: char('rule_id', { length: 36 })
      .references(() => alertRules.id),
    channelId: char('channel_id', { length: 36 })
      .references(() => alertChannels.id),
    ruleName: varchar('rule_name', { length: 100 }),
    channelName: varchar('channel_name', { length: 100 }),
    severity: mysqlEnum('severity', ['info', 'warning', 'critical']).default('warning'),
    message: text('message'),
    status: mysqlEnum('status', ['delivered', 'failed', 'pending']).default('pending'),
    sentAt: datetime('sent_at')
      .default(sql`CURRENT_TIMESTAMP`)
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

export const deprecationResults = mysqlTable(
  'deprecation_results',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    projectId: char('project_id', { length: 36 }),
    projectName: varchar('project_name', { length: 100 }),
    packageName: varchar('package_name', { length: 200 }).notNull(),
    currentVersion: varchar('current_version', { length: 50 }),
    latestVersion: varchar('latest_version', { length: 50 }),
    deprecationType: mysqlEnum('deprecation_type', ['deprecated', 'major-upgrade', 'eol-runtime', 'security-vuln']).notNull(),
    severity: mysqlEnum('severity', ['critical', 'warning', 'info']).default('warning'),
    message: text('message'),
    affectedFiles: json('affected_files').$type<string[]>().default([]),
    remediationUrl: varchar('remediation_url', { length: 500 }),
    isSuppressed: boolean('is_suppressed').default(false),
    suppressedBy: char('suppressed_by', { length: 36 }),
    suppressedUntil: datetime('suppressed_until'),
    scannedAt: datetime('scanned_at')
      .default(sql`CURRENT_TIMESTAMP`)
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

export const judgeScores = mysqlTable(
  'judge_scores',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    targetType: mysqlEnum('target_type', ['deployment', 'code-review', 'error-resolution', 'agent-task']).notNull(),
    targetId: varchar('target_id', { length: 100 }).notNull(),
    targetName: varchar('target_name', { length: 200 }),
    overallScore: int('overall_score').notNull(),
    qualityScore: int('quality_score'),
    reliabilityScore: int('reliability_score'),
    securityScore: int('security_score'),
    performanceScore: int('performance_score'),
    maintainabilityScore: int('maintainability_score'),
    grade: varchar('grade', { length: 5 }),
    summary: text('summary'),
    suggestions: json('suggestions').$type<string[]>().default([]),
    aiModel: varchar('ai_model', { length: 50 }).default('gpt-4o'),
    scoredAt: datetime('scored_at')
      .default(sql`CURRENT_TIMESTAMP`)
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
