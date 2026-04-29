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
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects';
import { organizations } from './organizations';
import { users } from './users';

/**
 * Pipelines table — CI/CD pipeline configurations per project.
 * Each project can have multiple pipelines (e.g., deploy, test, scan).
 */
export const pipelines = mysqlTable(
  'pipelines',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: char('project_id', { length: 36 })
      .references(() => projects.id)
      .notNull(),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    trigger: json('trigger_config').$type<{
      push?: { branches: string[] };
      pull_request?: { branches: string[] };
      manual?: boolean;
    }>(),
    stages: json('stages').$type<Array<{
      name: string;
      type?: string;
      run?: string;
      config?: Record<string, unknown>;
      only?: string[];
    }>>(),
    yamlConfig: text('yaml_config'),
    isActive: boolean('is_active').default(true),
    lastRunAt: datetime('last_run_at'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_pipelines_project').on(table.projectId)],
);

/**
 * Pipeline runs table — individual pipeline executions.
 * Tracks status, duration, trigger info, and log references.
 */
export const pipelineRuns = mysqlTable(
  'pipeline_runs',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pipelineId: char('pipeline_id', { length: 36 })
      .references(() => pipelines.id)
      .notNull(),
    projectId: char('project_id', { length: 36 })
      .references(() => projects.id)
      .notNull(),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    runNumber: int('run_number').notNull(),
    status: varchar('status', { length: 20 }).default('queued'),
    branch: varchar('branch', { length: 100 }),
    commitSha: varchar('commit_sha', { length: 40 }),
    commitMessage: text('commit_message'),
    triggeredBy: char('triggered_by', { length: 36 }),
    triggerType: varchar('trigger_type', { length: 20 }),
    stages: json('stages').$type<Array<{
      name: string;
      status: string;
      startedAt?: string;
      finishedAt?: string;
      durationMs?: number;
      error?: string;
    }>>(),
    startedAt: datetime('started_at'),
    finishedAt: datetime('finished_at'),
    durationMs: int('duration_ms'),
    logUrl: varchar('log_url', { length: 500 }),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_runs_pipeline').on(table.pipelineId),
    index('idx_runs_project').on(table.projectId, table.status),
  ],
);

/**
 * Deploy targets table — saved server configurations for SSH/SFTP deployment.
 * Credentials are AES-256 encrypted at rest.
 */
export const deployTargets = mysqlTable(
  'deploy_targets',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).default('ssh'),
    host: varchar('host', { length: 255 }).notNull(),
    port: int('port').default(22),
    username: varchar('username', { length: 100 }).notNull(),
    authMethod: varchar('auth_method', { length: 20 }).default('key'),
    encryptedKey: text('encrypted_key'),
    encryptedPassword: text('encrypted_password'),
    remotePath: varchar('remote_path', { length: 500 }),
    preDeployCmd: text('pre_deploy_cmd'),
    postDeployCmd: text('post_deploy_cmd'),
    isActive: boolean('is_active').default(true),
    lastUsedAt: datetime('last_used_at'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_deploy_targets_org').on(table.orgId)],
);

/**
 * Deployments table — individual deployment records.
 * Links pipeline run → deploy target with rollback support.
 */
export const deployments = mysqlTable(
  'deployments',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: char('project_id', { length: 36 })
      .references(() => projects.id)
      .notNull(),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    pipelineRunId: char('pipeline_run_id', { length: 36 }),
    deployTargetId: char('deploy_target_id', { length: 36 }),
    environment: varchar('environment', { length: 50 }).default('production'),
    status: varchar('status', { length: 20 }).default('pending'),
    branch: varchar('branch', { length: 100 }),
    commitSha: varchar('commit_sha', { length: 40 }),
    commitMessage: text('commit_message'),
    deployedBy: char('deployed_by', { length: 36 }),
    strategy: varchar('strategy', { length: 20 }).default('rolling'),
    rollbackFromId: char('rollback_from_id', { length: 36 }),
    startedAt: datetime('started_at'),
    finishedAt: datetime('finished_at'),
    durationMs: int('duration_ms'),
    healthCheckUrl: varchar('health_check_url', { length: 500 }),
    healthCheckStatus: varchar('health_check_status', { length: 20 }),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_deployments_project').on(table.projectId, table.status),
  ],
);

export type Pipeline = typeof pipelines.$inferSelect;
export type NewPipeline = typeof pipelines.$inferInsert;
export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type NewPipelineRun = typeof pipelineRuns.$inferInsert;
export type DeployTarget = typeof deployTargets.$inferSelect;
export type NewDeployTarget = typeof deployTargets.$inferInsert;
export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
