import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  serial,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';

/**
 * Source Profiles — reusable Git repo credentials for deployments.
 * Store once, select from dropdown during deploy.
 */
export const sourceProfiles = pgTable(
  'source_profiles',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    repoUrl: varchar('repo_url', { length: 500 }).notNull(),
    branch: varchar('branch', { length: 100 }).default('main'),
    authType: varchar('auth_type', { length: 20 }).default('token'),
    authValue: text('auth_value'),
    notes: text('notes'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_source_profiles_org').on(table.orgId),
  ],
);

/**
 * DB Profiles — reusable database server credentials for deployments.
 * Store once, select from dropdown during deploy.
 */
export const dbProfiles = pgTable(
  'db_profiles',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    host: varchar('host', { length: 255 }).notNull(),
    port: integer('port').default(3306),
    username: varchar('username', { length: 100 }).notNull(),
    password: text('password'),
    databaseName: varchar('database_name', { length: 100 }),
    notes: text('notes'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
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
