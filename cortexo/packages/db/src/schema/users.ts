import {
  mysqlTable,
  char,
  varchar,
  datetime,
  index,
  text,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';

/**
 * Users table — team members belonging to an organization.
 * Supports email/password + OAuth providers (GitHub, Google).
 */
export const users = mysqlTable(
  'users',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 }).references(() => organizations.id),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    phone: varchar('phone', { length: 20 }),
    role: varchar('role', { length: 20 }).default('member'),
    provider: varchar('provider', { length: 20 }),
    providerId: varchar('provider_id', { length: 100 }),
    githubId: varchar('github_id', { length: 100 }),
    resetToken: varchar('reset_token', { length: 255 }),
    resetTokenExpiresAt: datetime('reset_token_expires_at'),
    lastLoginAt: datetime('last_login_at'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_users_org').on(table.orgId),
    index('idx_users_email').on(table.email),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
