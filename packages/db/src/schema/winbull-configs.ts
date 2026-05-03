/**
 * WinBull Configs — Drizzle ORM schema
 * Maps the legacy `winbull_configs` table used for client config lookup during deployments.
 */
import { mysqlTable, char, varchar, json, datetime } from 'drizzle-orm/mysql-core';
import { sql, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export const winbullConfigs = mysqlTable('winbull_configs', {
  id:               char('id', { length: 36 }).primaryKey().notNull(),
  clientSlug:       varchar('client_slug', { length: 100 }).notNull(),
  clientId:         varchar('client_id', { length: 100 }).notNull(),
  displayName:      varchar('display_name', { length: 200 }).notNull(),
  domain:           varchar('domain', { length: 255 }),
  configJson:       json('config_json'),
  serverIp:         varchar('server_ip', { length: 45 }),
  migrationStatus:  varchar('migration_status', { length: 20 }).default('pending'),
  createdAt:        datetime('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt:        datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type WinbullConfig = InferSelectModel<typeof winbullConfigs>;
export type NewWinbullConfig = InferInsertModel<typeof winbullConfigs>;
