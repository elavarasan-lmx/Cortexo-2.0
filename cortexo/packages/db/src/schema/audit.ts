import {
  mysqlTable,
  varchar,
  char,
  text,
  datetime,
  int,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

/**
 * Audit Logs — tracks every significant action across the platform.
 *
 * Each row = one action by one user.
 * Examples: deploy, provision, menu_change, login, error_resolve, pipeline_run
 */
export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: int('id').primaryKey().autoincrement(),
    userId: char('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    userName: varchar('user_name', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: varchar('resource_id', { length: 100 }),
    description: text('description'),
    metadata: text('metadata'), // JSON string for extra context
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_audit_user').on(table.userId),
    index('idx_audit_action').on(table.action),
    index('idx_audit_created').on(table.createdAt),
    index('idx_audit_resource').on(table.resource),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
