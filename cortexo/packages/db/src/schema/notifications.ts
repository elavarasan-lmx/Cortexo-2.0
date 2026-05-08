import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';

/**
 * Notifications table — in-app notifications for users.
 * Supports deploy alerts, error spikes, AI reports, fix rollouts.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 200 }),
    message: text('message'),
    link: varchar('link', { length: 500 }),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_notifications_user').on(table.userId, table.isRead),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ─── Sprint 3 (F58–F61): Notification Preferences ──────────────────

/**
 * Per-user notification preferences — controls which events
 * trigger which channels (in-app, email, push, Slack).
 */
export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    event: varchar('event', { length: 50 }).notNull(), // 'deploy.success'|'error.spike'|'scan.complete'|etc
    inApp: boolean('in_app').default(true),
    email: boolean('email').default(false),
    push: boolean('push').default(false),
    slack: boolean('slack').default(false),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_notif_prefs_user').on(table.userId),
    index('idx_notif_prefs_event').on(table.userId, table.event),
  ],
);

/**
 * Push tokens table — stores FCM/Web Push registration tokens.
 * Multiple tokens per user (one per device/browser).
 */
export const pushTokens = pgTable(
  'push_tokens',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    token: text('token').notNull(),
    platform: varchar('platform', { length: 20 }), // 'web'|'android'|'ios'
    deviceName: varchar('device_name', { length: 100 }),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_push_tokens_user').on(table.userId),
  ],
);

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type PushToken = typeof pushTokens.$inferSelect;
