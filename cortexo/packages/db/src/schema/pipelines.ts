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
import { projects } from './projects';
import { organizations } from './organizations';
import { users } from './users';

/**
 * Pipelines table — CI/CD pipeline configurations per project.
 * Each project can have multiple pipelines (e.g., deploy, test, scan).
 */
export const pipelines = pgTable(
  'pipelines',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    trigger: jsonb('trigger_config').$type<{
      push?: { branches: string[] };
      pull_request?: { branches: string[] };
      manual?: boolean;
    }>(),
    stages: jsonb('stages').$type<Array<{
      name: string;
      type?: string;
      run?: string;
      config?: Record<string, unknown>;
      only?: string[];
    }>>(),
    yamlConfig: text('yaml_config'),
    isActive: boolean('is_active').default(true),
    lastRunAt: timestamp('last_run_at'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_pipelines_project').on(table.projectId)],
);

/**
 * Pipeline runs table — individual pipeline executions.
 * Tracks status, duration, trigger info, and log references.
 */
export const pipelineRuns = pgTable(
  'pipeline_runs',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    pipelineId: uuid('pipeline_id')
      .references(() => pipelines.id)
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    runNumber: integer('run_number').notNull(),
    status: varchar('status', { length: 20 }).default('queued'),
    branch: varchar('branch', { length: 100 }),
    commitSha: varchar('commit_sha', { length: 40 }),
    commitMessage: text('commit_message'),
    triggeredBy: uuid('triggered_by'),
    triggerType: varchar('trigger_type', { length: 20 }),
    stages: jsonb('stages').$type<Array<{
      name: string;
      status: string;
      startedAt?: string;
      finishedAt?: string;
      durationMs?: number;
      error?: string;
    }>>(),
    startedAt: timestamp('started_at'),
    finishedAt: timestamp('finished_at'),
    durationMs: integer('duration_ms'),
    logUrl: varchar('log_url', { length: 500 }),
    createdAt: timestamp('created_at')
      .defaultNow()
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
export const deployTargets = pgTable(
  'deploy_targets',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).default('ssh'),
    host: varchar('host', { length: 255 }).notNull(),
    port: integer('port').default(22),
    username: varchar('username', { length: 100 }).notNull(),
    authMethod: varchar('auth_method', { length: 20 }).default('key'),
    encryptedKey: text('encrypted_key'),
    encryptedPassword: text('encrypted_password'),
    remotePath: varchar('remote_path', { length: 500 }),
    preDeployCmd: text('pre_deploy_cmd'),
    postDeployCmd: text('post_deploy_cmd'),
    isActive: boolean('is_active').default(true),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_deploy_targets_org').on(table.orgId)],
);

/**
 * Deployments table — individual deployment records.
 * Links pipeline run → deploy target with rollback support.
 */
export const deployments = pgTable(
  'deployments',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    pipelineRunId: uuid('pipeline_run_id'),
    deployTargetId: uuid('deploy_target_id'),
    environment: varchar('environment', { length: 50 }).default('production'),
    status: varchar('status', { length: 20 }).default('pending'),
    branch: varchar('branch', { length: 100 }),
    commitSha: varchar('commit_sha', { length: 40 }),
    commitMessage: text('commit_message'),
    deployedBy: uuid('deployed_by'),
    strategy: varchar('strategy', { length: 20 }).default('rolling'),
    rollbackFromId: uuid('rollback_from_id'),
    startedAt: timestamp('started_at'),
    finishedAt: timestamp('finished_at'),
    durationMs: integer('duration_ms'),
    healthCheckUrl: varchar('health_check_url', { length: 500 }),
    healthCheckStatus: varchar('health_check_status', { length: 20 }),
    deployLogs: jsonb('deploy_logs').$type<Array<{
      step: string;
      command?: string;
      stdout: string;
      stderr: string;
      exitCode: number | null;
      durationMs: number;
      timestamp: string;
    }>>(),
    createdAt: timestamp('created_at')
      .defaultNow()
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
