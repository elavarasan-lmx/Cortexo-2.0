import {
  mysqlTable,
  char,
  varchar,
  text,
  boolean,
  datetime,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';
import { projects } from './projects';

/**
 * Integrations table (F134: Third-party Integrations)
 * Stores connected services (GitHub, GitLab, Slack, etc.) per organization.
 */
export const integrations = mysqlTable(
  'integrations',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id)
      .notNull(),
    provider: varchar('provider', { length: 50 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    webhookUrl: varchar('webhook_url', { length: 500 }),
    webhookSecret: varchar('webhook_secret', { length: 100 }),
    config: json('config').$type<Record<string, unknown>>().default({}),
    isActive: boolean('is_active').default(true),
    lastSyncAt: datetime('last_sync_at'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_integrations_org').on(table.orgId, table.provider),
  ],
);
// Type exports
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
