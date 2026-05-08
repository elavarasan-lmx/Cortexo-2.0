/**
 * Cortexo Agents Schema
 * AI-powered DevOps agents for automated tasks.
 */
import { pgTable, uuid, text, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { organizations } from './organizations';

export const agentStatusEnum = pgEnum('agent_status', ['active', 'idle', 'paused', 'error']);
export const agentTypeEnum = pgEnum('agent_type', [
  'deployment', 'error_detection', 'security', 'monitoring',
  'compliance', 'infrastructure', 'performance', 'custom'
]);

export const agents = pgTable('agents', {
  id:          uuid('id').defaultRandom().primaryKey(),
  orgId:       uuid('org_id').notNull().references(() => organizations.id),
  name:        text('name').notNull(),
  type:        agentTypeEnum('type').notNull().default('custom'),
  status:      agentStatusEnum('status').notNull().default('idle'),
  description: text('description'),
  avatar:      text('avatar'),
  config:      jsonb('config').$type<Record<string, unknown>>().default({}),
  skills:      jsonb('skills').$type<string[]>().default([]),
  accuracy:    integer('accuracy').default(0),          // stored as 0-1000 → /10 = percentage
  totalRuns:   integer('total_runs').default(0),
  lastActiveAt: timestamp('last_active_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

export const agentRuns = pgTable('agent_runs', {
  id:          uuid('id').defaultRandom().primaryKey(),
  agentId:     uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  status:      text('status').notNull().default('running'), // running, success, failed
  trigger:     text('trigger').default('manual'),           // manual, scheduled, webhook
  duration:    integer('duration_ms'),
  input:       jsonb('input').$type<Record<string, unknown>>(),
  output:      jsonb('output').$type<Record<string, unknown>>(),
  error:       text('error'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type Agent = InferSelectModel<typeof agents>;
export type NewAgent = InferInsertModel<typeof agents>;
export type AgentRun = InferSelectModel<typeof agentRuns>;
export type NewAgentRun = InferInsertModel<typeof agentRuns>;
