import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

// ─── Custom DevOps Docs (User-Created Runbooks) ──────────────────────

export const customDocs = pgTable(
  'custom_docs',
  {
    id: serial('id').primaryKey(),
    tool: varchar('tool', { length: 50 }).notNull(),
    color: varchar('color', { length: 20 }).default('#6366F1'),
    category: varchar('category', { length: 50 }).default('Custom'),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    commands: jsonb('commands').$type<{ cmd: string; desc: string }[]>().default([]),
    configSnippets: jsonb('config_snippets').$type<{ title: string; lang: string; code: string }[]>().default([]),
    tips: jsonb('tips').$type<string[]>().default([]),
    createdBy: varchar('created_by', { length: 100 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_custom_docs_tool').on(table.tool),
    index('idx_custom_docs_active').on(table.isActive),
  ],
);

// ─── Client Deployment Checklists ─────────────────────────────────────

export const deployChecklists = pgTable(
  'deploy_checklists',
  {
    id: serial('id').primaryKey(),
    clientName: varchar('client_name', { length: 100 }).notNull(),
    projectType: varchar('project_type', { length: 50 }).default('bullion'), // bullion, web, api
    steps: jsonb('steps').$type<{ label: string; done: boolean; notes?: string }[]>().default([]),
    status: varchar('status', { length: 20 }).default('pending'), // pending, in_progress, completed
    createdBy: varchar('created_by', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_deploy_checklists_client').on(table.clientName),
    index('idx_deploy_checklists_status').on(table.status),
  ],
);

export type CustomDoc = typeof customDocs.$inferSelect;
export type NewCustomDoc = typeof customDocs.$inferInsert;
export type DeployChecklist = typeof deployChecklists.$inferSelect;
export type NewDeployChecklist = typeof deployChecklists.$inferInsert;
