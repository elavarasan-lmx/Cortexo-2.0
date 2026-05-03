import {
  mysqlTable,
  char,
  varchar,
  text,
  int,
  decimal,
  datetime,
  boolean,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * Servers — EC2/physical server inventory.
 * Tracks private/public IPs, SSH keys, mount status.
 * Ported from BullionDevops common.js server management.
 */
export const servers = mysqlTable(
  'servers',
  {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull(),
    privateIp: varchar('private_ip', { length: 45 }),
    publicAddress: varchar('public_address', { length: 255 }),
    sshKey: varchar('ssh_key', { length: 500 }),
    status: varchar('status', { length: 20 }).default('active'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_servers_name').on(table.name)],
);

/**
 * Server Resources — CPU/RAM/Disk metrics snapshots.
 * Collected via SSH checks, stored per-IP over time.
 */
export const serverResources = mysqlTable(
  'server_resources',
  {
    id: int('id').primaryKey().autoincrement(),
    serverIp: varchar('server_ip', { length: 45 }).notNull(),
    cpuPercent: decimal('cpu_percent', { precision: 5, scale: 2 }),
    ramUsedMb: int('ram_used_mb'),
    ramTotalMb: int('ram_total_mb'),
    diskUsedGb: decimal('disk_used_gb', { precision: 10, scale: 2 }),
    diskTotalGb: decimal('disk_total_gb', { precision: 10, scale: 2 }),
    loadAvg: varchar('load_avg', { length: 50 }),
    uptimeHours: int('uptime_hours'),
    checkedAt: datetime('checked_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_resources_ip').on(table.serverIp),
    index('idx_resources_checked').on(table.checkedAt),
  ],
);

/**
 * Log Sources — configurable log file paths for the log viewer.
 */
export const logSources = mysqlTable(
  'log_sources',
  {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).default('file'),
    path: varchar('path', { length: 500 }).notNull(),
    server: varchar('server', { length: 100 }).default('localhost'),
    description: varchar('description', { length: 255 }),
    isActive: boolean('is_active').default(true),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
);

/**
 * Server Mounts — SSHFS mount configurations for remote file access.
 * Allows mounting EC2/remote server directories via SSHFS from the dashboard.
 */
export const serverMounts = mysqlTable(
  'server_mounts',
  {
    id: int('id').primaryKey().autoincrement(),
    serverId: int('server_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    remotePath: varchar('remote_path', { length: 500 }).notNull(),
    localMountPath: varchar('local_mount_path', { length: 500 }).notNull(),
    sshUser: varchar('ssh_user', { length: 50 }).notNull().default('ubuntu'),
    status: varchar('status', { length: 20 }).default('unmounted'),
    autoMount: boolean('auto_mount').default(false),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    lastMountedAt: datetime('last_mounted_at'),
  },
  (table) => [
    index('idx_mounts_server').on(table.serverId),
    index('idx_mounts_status').on(table.status),
  ],
);

/**
 * Deploy Configs — per-project deployment source configuration.
 * Stores Git, database, deploy path, version, and port info
 * used by CI/CD pipelines and the Deploy Sources dashboard.
 */
export const deployConfigs = mysqlTable(
  'deploy_configs',
  {
    id: int('id').primaryKey().autoincrement(),
    projectId: char('project_id', { length: 36 }).notNull(),
    serverId: int('server_id'),
    clientSlug: varchar('client_slug', { length: 100 }),
    domain: varchar('domain', { length: 255 }),
    protocol: varchar('protocol', { length: 10 }).default('https'),
    deployPath: varchar('deploy_path', { length: 500 }),
    deployUser: varchar('deploy_user', { length: 50 }).default('ubuntu'),
    dbHost: varchar('db_host', { length: 255 }),
    dbName: varchar('db_name', { length: 100 }),
    dbUser: varchar('db_user', { length: 100 }),
    dbPort: int('db_port').default(3306),
    gitRepo: varchar('git_repo', { length: 500 }),
    gitBranch: varchar('git_branch', { length: 100 }).default('main'),
    appFramework: varchar('app_framework', { length: 50 }),
    appVersion: varchar('app_version', { length: 20 }),
    socketIoPort: int('socket_io_port'),
    wsPort: int('ws_port'),
    ratePort: int('rate_port'),
    notes: text('notes'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_deploy_project').on(table.projectId),
    index('idx_deploy_server').on(table.serverId),
    index('idx_deploy_slug').on(table.clientSlug),
  ],
);

export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
export type ServerResource = typeof serverResources.$inferSelect;
export type LogSource = typeof logSources.$inferSelect;
export type ServerMount = typeof serverMounts.$inferSelect;
export type NewServerMount = typeof serverMounts.$inferInsert;
export type DeployConfig = typeof deployConfigs.$inferSelect;
export type NewDeployConfig = typeof deployConfigs.$inferInsert;
