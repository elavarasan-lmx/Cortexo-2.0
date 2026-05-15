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
  }
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
  }
);

/**
 * Client Git Profiles — Git repo templates for new client provisioning.
 * Used when setting up a new tenant/client deployment.
 */
export const clientGitProfiles = pgTable(
  'client_git_profiles',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    repoUrl: varchar('repo_url', { length: 500 }).notNull(),
    branch: varchar('branch', { length: 100 }).default('main'),
    templatePath: varchar('template_path', { length: 500 }),
    authType: varchar('auth_type', { length: 20 }).default('token'),
    authValue: text('auth_value'),
    notes: text('notes'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  }
);

/**
 * Client DB Profiles — Template database credentials for new client provisioning.
 * Used to clone/create databases for new tenants.
 */
export const clientDbProfiles = pgTable(
  'client_db_profiles',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    host: varchar('host', { length: 255 }).notNull(),
    port: integer('port').default(3306),
    username: varchar('username', { length: 100 }).notNull(),
    password: text('password'),
    templateDb: varchar('template_db', { length: 100 }),
    databasePrefix: varchar('database_prefix', { length: 50 }),
    notes: text('notes'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  }
);

// Type exports
export type SourceProfile = typeof sourceProfiles.$inferSelect;
export type NewSourceProfile = typeof sourceProfiles.$inferInsert;
export type DbProfile = typeof dbProfiles.$inferSelect;
export type NewDbProfile = typeof dbProfiles.$inferInsert;
export type ClientGitProfile = typeof clientGitProfiles.$inferSelect;
export type NewClientGitProfile = typeof clientGitProfiles.$inferInsert;
export type ClientDbProfile = typeof clientDbProfiles.$inferSelect;
export type NewClientDbProfile = typeof clientDbProfiles.$inferInsert;
