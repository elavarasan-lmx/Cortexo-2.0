import {
  mysqlTable,
  char,
  varchar,
  text,
  boolean,
  datetime,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';

/**
 * Notifications table — in-app notifications for users.
 * Supports deploy alerts, error spikes, AI reports, fix rollouts.
 */
export const notifications = mysqlTable(
  'notifications',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: char('user_id', { length: 36 })
      .references(() => users.id)
      .notNull(),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 200 }),
    message: text('message'),
    link: varchar('link', { length: 500 }),
    isRead: boolean('is_read').default(false),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_notifications_user').on(table.userId, table.isRead),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
