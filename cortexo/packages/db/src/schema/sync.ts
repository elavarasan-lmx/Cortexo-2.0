import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  serial,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Sync History — tracks every source-to-client code synchronization.
 * Each row = one sync operation (hub repo → client repo via GitHub Actions).
 * Ported from BullionDevops sync.routes.js (679 lines).
 */
export const syncHistory = pgTable(
  'sync_history',
  {
    id: serial('id').primaryKey(),
    clientId: varchar('client_id', { length: 100 }).notNull(),
    clientName: varchar('client_name', { length: 200 }),
    sourceBranch: varchar('source_branch', { length: 100 }).default('main'),
    targetBranch: varchar('target_branch', { length: 100 }).default('STAGING'),
    status: varchar('status', { length: 20 }).default('pending'),
    commitSha: varchar('commit_sha', { length: 64 }),
    prNumber: integer('pr_number'),
    prUrl: varchar('pr_url', { length: 500 }),
    errorMessage: text('error_message'),
    triggeredBy: varchar('triggered_by', { length: 100 }),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_sync_client').on(table.clientId),
    index('idx_sync_status').on(table.status),
    index('idx_sync_created').on(table.createdAt),
  ],
);

/**
 * Sync Exclude Rules — patterns to skip during sync (config files, .env, etc.)
 */
export const syncExcludeRules = pgTable(
  'sync_exclude_rules',
  {
    id: serial('id').primaryKey(),
    appCategory: varchar('app_category', { length: 50 }).default('all'),
    layer: varchar('layer', { length: 50 }).default('all'),
    pattern: varchar('pattern', { length: 300 }).notNull(),
    reason: varchar('reason', { length: 500 }),
    isActive: boolean('is_active').default(true),
    createdBy: varchar('created_by', { length: 100 }).default('system'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
);

/**
 * Sync Clients — client repos configured for sync
 */
export const syncClients = pgTable(
  'sync_clients',
  {
    id: serial('id').primaryKey(),
    clientId: varchar('client_id', { length: 100 }).unique().notNull(),
    clientName: varchar('client_name', { length: 200 }).notNull(),
    repoOrg: varchar('repo_org', { length: 200 }),
    repoName: varchar('repo_name', { length: 200 }),
    branch: varchar('branch', { length: 100 }).default('STAGING'),
    clientType: varchar('client_type', { length: 50 }).default('retail'),
    syncWorkflow: varchar('sync_workflow', { length: 200 }).default('sync-batch.yml'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_sync_clients_id').on(table.clientId)],
);

/**
 * Divergence Analysis — tracks how far each client has drifted from source
 */
export const divergenceAnalyses = pgTable(
  'divergence_analyses',
  {
    id: serial('id').primaryKey(),
    clientId: varchar('client_id', { length: 100 }).notNull(),
    clientName: varchar('client_name', { length: 200 }),
    divergenceScore: integer('divergence_score').default(0),
    filesAdded: integer('files_added').default(0),
    filesModified: integer('files_modified').default(0),
    filesDeleted: integer('files_deleted').default(0),
    moduleSummary: jsonb('module_summary').$type<Record<string, unknown>>(),
    fileDetails: jsonb('file_details').$type<unknown[]>(),
    analyzedAt: timestamp('analyzed_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_divergence_client').on(table.clientId)],
);

/**
 * Mono Deployments — deployment records with approval workflows
 */
export const monoDeployments = pgTable(
  'mono_deployments',
  {
    id: serial('id').primaryKey(),
    clientId: varchar('client_id', { length: 100 }).notNull(),
    clientName: varchar('client_name', { length: 200 }),
    environment: varchar('environment', { length: 20 }).default('staging'),
    branch: varchar('branch', { length: 100 }),
    status: varchar('status', { length: 20 }).default('pending_approval'),
    triggeredBy: varchar('triggered_by', { length: 100 }),
    deployNotes: text('deploy_notes'),
    durationSeconds: integer('duration_seconds'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_mono_deploy_client').on(table.clientId),
    index('idx_mono_deploy_status').on(table.status),
  ],
);

/**
 * Deployment Approvals — approval/rejection actions on deployments
 */
export const deploymentApprovals = pgTable(
  'deployment_approvals',
  {
    id: serial('id').primaryKey(),
    deploymentId: integer('deployment_id').notNull(),
    action: varchar('action', { length: 20 }).notNull(),
    actedBy: varchar('acted_by', { length: 100 }).notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_approval_deploy').on(table.deploymentId)],
);

export type SyncHistoryRow = typeof syncHistory.$inferSelect;
export type NewSyncHistory = typeof syncHistory.$inferInsert;
export type SyncExcludeRule = typeof syncExcludeRules.$inferSelect;
export type SyncClient = typeof syncClients.$inferSelect;
export type DivergenceAnalysis = typeof divergenceAnalyses.$inferSelect;
export type MonoDeployment = typeof monoDeployments.$inferSelect;
export type DeploymentApproval = typeof deploymentApprovals.$inferSelect;
