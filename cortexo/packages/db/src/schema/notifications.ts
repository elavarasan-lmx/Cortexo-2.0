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
