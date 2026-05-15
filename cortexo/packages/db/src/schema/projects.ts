import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Projects table — connected repos / client panels.
 * Each project has a unique SDK API key for error ingestion.
 */
export const projects = pgTable(
  'projects',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    repoProvider: varchar('repo_provider', { length: 20 }).notNull(),
    repoUrl: varchar('repo_url', { length: 500 }).notNull(),
    repoFullName: varchar('repo_full_name', { length: 200 }),
    defaultBranch: varchar('default_branch', { length: 50 }).default('main'),
    sdkApiKey: varchar('sdk_api_key', { length: 64 }).unique().notNull(),
    healthScore: integer('health_score').default(100),
    settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  }
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
