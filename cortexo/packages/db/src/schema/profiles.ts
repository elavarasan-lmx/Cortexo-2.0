import {
  mysqlTable,
  char,
  varchar,
  text,
  int,
  datetime,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';

/**
 * Source Profiles — reusable Git repo credentials for deployments.
 * Store once, select from dropdown during deploy.
 */
export const sourceProfiles = mysqlTable(
  'source_profiles',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    repoUrl: varchar('repo_url', { length: 500 }).notNull(),
    branch: varchar('branch', { length: 100 }).default('main'),
    authType: varchar('auth_type', { length: 20 }).default('token'),
    authValue: text('auth_value'),
    notes: text('notes'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_source_profiles_org').on(table.orgId),
  ],
);

/**
 * DB Profiles — reusable MySQL/database server credentials for deployments.
 * Store once, select from dropdown during deploy.
 */
export const dbProfiles = mysqlTable(
  'db_profiles',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    host: varchar('host', { length: 255 }).notNull(),
    port: int('port').default(3306),
    username: varchar('username', { length: 100 }).notNull(),
    password: text('password'),
    databaseName: varchar('database_name', { length: 100 }),
    notes: text('notes'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_db_profiles_org').on(table.orgId),
  ],
);

// Type exports
export type SourceProfile = typeof sourceProfiles.$inferSelect;
export type NewSourceProfile = typeof sourceProfiles.$inferInsert;
export type DbProfile = typeof dbProfiles.$inferSelect;
export type NewDbProfile = typeof dbProfiles.$inferInsert;
