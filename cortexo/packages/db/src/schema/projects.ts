import {
  mysqlTable,
  char,
  varchar,
  text,
  int,
  boolean,
  datetime,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';

/**
 * Projects table — connected repos / client panels.
 * Each project has a unique SDK API key for error ingestion.
 */
export const projects = mysqlTable(
  'projects',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    repoProvider: varchar('repo_provider', { length: 20 }).notNull(),
    repoUrl: varchar('repo_url', { length: 500 }).notNull(),
    repoFullName: varchar('repo_full_name', { length: 200 }),
    defaultBranch: varchar('default_branch', { length: 50 }).default('main'),
    sdkApiKey: varchar('sdk_api_key', { length: 64 }).unique().notNull(),
    healthScore: int('health_score').default(100),
    settings: json('settings').$type<Record<string, unknown>>().default({}),
    isActive: boolean('is_active').default(true),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_projects_org').on(table.orgId)],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
