import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';
import { projects } from './projects';

/**
 * Integrations table (F134: Third-party Integrations)
 * Stores connected services (GitHub, GitLab, Slack, etc.) per organization.
 */
export const integrations = pgTable(
  'integrations',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    provider: varchar('provider', { length: 50 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    webhookUrl: varchar('webhook_url', { length: 500 }),
    webhookSecret: varchar('webhook_secret', { length: 100 }),
    config: jsonb('config').$type<Record<string, unknown>>().default({}),
    isActive: boolean('is_active').default(true),
    lastSyncAt: timestamp('last_sync_at'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_integrations_org').on(table.orgId, table.provider),
  ],
);
// Type exports
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
