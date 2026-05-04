/**
 * WinBull Configs — Drizzle ORM schema
 * Maps the legacy `winbull_configs` table used for client config lookup during deployments.
 */
import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export const winbullConfigs = pgTable('winbull_configs', {
  id:               uuid('id').primaryKey().defaultRandom(),
  clientSlug:       varchar('client_slug', { length: 100 }).notNull(),
  clientId:         varchar('client_id', { length: 100 }).notNull(),
  displayName:      varchar('display_name', { length: 200 }).notNull(),
  domain:           varchar('domain', { length: 255 }),
  configJson:       jsonb('config_json'),
  serverIp:         varchar('server_ip', { length: 45 }),
  migrationStatus:  varchar('migration_status', { length: 20 }).default('pending'),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow(),
});

export type WinbullConfig = InferSelectModel<typeof winbullConfigs>;
export type NewWinbullConfig = InferInsertModel<typeof winbullConfigs>;
