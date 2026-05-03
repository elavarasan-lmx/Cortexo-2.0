import {
  mysqlTable,
  char,
  varchar,
  datetime,
} from 'drizzle-orm/mysql-core';
import { users } from './users';

export const sessions = mysqlTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: char('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: datetime('expires').notNull(),
});
