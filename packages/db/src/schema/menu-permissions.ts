import {
  mysqlTable,
  varchar,
  char,
  boolean,
  datetime,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

/**
 * User Menu Permissions — controls which sidebar items each user can see.
 *
 * Each row = one menu item for one user.
 * If a row doesn't exist for a user+menuKey combo, the item is visible by default.
 * An admin can insert rows with visible=false to restrict access.
 *
 * menuKey uses the href path as unique identifier, e.g.:
 *   "/dashboard", "/pipelines", "/servers", "/provision"
 */
export const userMenuPermissions = mysqlTable(
  'user_menu_permissions',
  {
    userId: char('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    menuKey: varchar('menu_key', { length: 100 }).notNull(),
    visible: boolean('visible').default(true).notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_ump_user').on(table.userId),
    uniqueIndex('idx_ump_user_menu_uniq').on(table.userId, table.menuKey),
  ],
);

export type UserMenuPermission = typeof userMenuPermissions.$inferSelect;
export type NewUserMenuPermission = typeof userMenuPermissions.$inferInsert;
