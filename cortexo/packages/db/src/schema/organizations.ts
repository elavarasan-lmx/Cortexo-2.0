import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Organizations table — multi-tenant root entity.
 * Every row in other tables references org_id for data isolation.
 */
export const organizations = pgTable('organizations', {
  id: uuid('id')
    .primaryKey()
    .defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  plan: varchar('plan', { length: 20 }).default('free'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  usageDeploys: integer('usage_deploys').default(0),
  usageErrors: integer('usage_errors').default(0),
  usageAiCalls: integer('usage_ai_calls').default(0),
  usageResetAt: timestamp('usage_reset_at'),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
