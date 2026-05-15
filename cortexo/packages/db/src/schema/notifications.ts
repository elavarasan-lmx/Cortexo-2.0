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

// ─── Notification Preferences (In-App + Email) ─────────────────────

/**
 * Per-user notification preferences — controls which events
 * trigger which channels (in-app, email).
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
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_notif_prefs_user').on(table.userId),
    index('idx_notif_prefs_event').on(table.userId, table.event),
  ],
);

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
