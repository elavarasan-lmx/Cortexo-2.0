import {
  mysqlTable,
  char,
  varchar,
  text,
  int,
  boolean,
  datetime,
  json,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * Managed Sources — application templates that Cortexo can deploy.
 * Each source = one deployable product (e.g., Winbull trading platform).
 * Tracks framework, version, config schema, and base code location.
 */
export const managedSources = mysqlTable(
  'managed_sources',
  {
    id: int('id').primaryKey().autoincrement(),
    slug: varchar('slug', { length: 50 }).unique().notNull(),
    displayName: varchar('display_name', { length: 200 }).notNull(),
    description: text('description'),
    version: varchar('version', { length: 20 }).default('1.0.0'),
    framework: json('framework').$type<Record<string, string>>(),
    basePath: varchar('base_path', { length: 500 }),
    configSchemaPath: varchar('config_schema_path', { length: 500 }),
    templatePath: varchar('template_path', { length: 500 }),
    manifestPath: varchar('manifest_path', { length: 500 }),
    deployChecklist: json('deploy_checklist').$type<string[]>(),
    isActive: boolean('is_active').default(true),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_source_slug').on(table.slug)],
);

/**
 * Client Configurations — per-client instance of a managed source.
 * Stores all the config values (from config-schema.json) as structured JSON.
 * Links to a server, deploy config, and tracks migration/deploy status.
 */
export const clientConfigs = mysqlTable(
  'client_configs',
  {
    id: int('id').primaryKey().autoincrement(),
    sourceId: int('source_id').notNull(),
    clientSlug: varchar('client_slug', { length: 100 }).unique().notNull(),
    displayName: varchar('display_name', { length: 200 }).notNull(),
    domain: varchar('domain', { length: 255 }),
    serverId: int('server_id'),

    /** Full config values matching the source's config-schema.json */
    configData: json('config_data').$type<Record<string, unknown>>().notNull(),

    /** Deploy path on remote server */
    deployPath: varchar('deploy_path', { length: 500 }),
    /** Git branch for this client */
    gitBranch: varchar('git_branch', { length: 100 }).default('main'),

    status: mysqlEnum('status', [
      'draft',         // config created, not yet deployed
      'provisioning',  // first-time deploy in progress
      'active',        // live and healthy
      'maintenance',   // temporarily down for maintenance
      'degraded',      // live but has issues
      'archived',      // decommissioned
    ]).default('draft'),

    migrationStatus: mysqlEnum('migration_status', [
      'pending',       // needs update
      'in_progress',   // migration running
      'current',       // up to date with base
      'diverged',      // has custom changes
      'failed',        // last migration failed
    ]).default('pending'),

    /** Version of the source this client is running */
    deployedVersion: varchar('deployed_version', { length: 20 }),

    /** Last time config was generated/pushed */
    lastConfigPushedAt: datetime('last_config_pushed_at'),
    lastDeployedAt: datetime('last_deployed_at'),
    lastHealthCheckAt: datetime('last_health_check_at'),
    healthScore: int('health_score').default(100),

    notes: text('notes'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_client_source').on(table.sourceId),
    index('idx_client_slug').on(table.clientSlug),
    index('idx_client_server').on(table.serverId),
    index('idx_client_status').on(table.status),
  ],
);

/**
 * Config Change History — audit trail for client config modifications.
 * Tracks who changed what, when, with before/after diffs.
 */
export const configChangeHistory = mysqlTable(
  'config_change_history',
  {
    id: int('id').primaryKey().autoincrement(),
    clientConfigId: int('client_config_id').notNull(),
    changedBy: varchar('changed_by', { length: 100 }),
    changeType: mysqlEnum('change_type', [
      'create',        // initial creation
      'update',        // config values changed
      'deploy',        // config pushed to server
      'rollback',      // reverted to previous version
      'migrate',       // version upgrade applied
    ]).notNull(),
    /** Previous config values (JSON diff) */
    previousValues: json('previous_values').$type<Record<string, unknown>>(),
    /** New config values (JSON diff) */
    newValues: json('new_values').$type<Record<string, unknown>>(),
    description: text('description'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_config_history_client').on(table.clientConfigId),
    index('idx_config_history_created').on(table.createdAt),
  ],
);

// Type exports
export type ManagedSource = typeof managedSources.$inferSelect;
export type NewManagedSource = typeof managedSources.$inferInsert;
export type ClientConfig = typeof clientConfigs.$inferSelect;
export type NewClientConfig = typeof clientConfigs.$inferInsert;
export type ConfigChangeHistory = typeof configChangeHistory.$inferSelect;
export type NewConfigChangeHistory = typeof configChangeHistory.$inferInsert;
