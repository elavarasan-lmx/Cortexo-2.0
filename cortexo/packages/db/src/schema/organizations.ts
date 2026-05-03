import {
  mysqlTable,
  char,
  varchar,
  text,
  int,
  boolean,
  datetime,
  json,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * Organizations table — multi-tenant root entity.
 * Every row in other tables references org_id for data isolation.
 */
export const organizations = mysqlTable('organizations', {
  id: char('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  plan: varchar('plan', { length: 20 }).default('free'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  usageDeploys: int('usage_deploys').default(0),
  usageErrors: int('usage_errors').default(0),
  usageAiCalls: int('usage_ai_calls').default(0),
  usageResetAt: datetime('usage_reset_at'),
  settings: json('settings').$type<Record<string, unknown>>().default({}),
  createdAt: datetime('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime('updated_at')
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
