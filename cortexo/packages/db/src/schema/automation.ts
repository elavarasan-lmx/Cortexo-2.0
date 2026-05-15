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

// ─── Alert Channels & Rules ────────────────────────────────────────────────

export const alertChannels = pgTable(
  'alert_channels',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
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
  }
);

export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;

export const alertHistory = pgTable(
  'alert_history',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
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
    index('idx_alerthistory_sent').on(table.sentAt),
  ],
);

export type AlertHistoryRow = typeof alertHistory.$inferSelect;
export type NewAlertHistory = typeof alertHistory.$inferInsert;


// ─── AI Judge Scores ────────────────────────────────────────────────────────

export const judgeScores = pgTable(
  'judge_scores',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
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
    index('idx_judgescore_target').on(table.targetType, table.targetId),
    index('idx_judgescore_overall').on(table.overallScore),
  ],
);

export type JudgeScore = typeof judgeScores.$inferSelect;
export type NewJudgeScore = typeof judgeScores.$inferInsert;
