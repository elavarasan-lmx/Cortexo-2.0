import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { projects } from './projects';
import { users } from './users';

// ─── Sprint 4 (F29, F30, F32, F34): Fix Library ────────────────────

/**
 * Fix recipes — reusable patches that can be propagated across clients.
 * Created when a dev fixes a bug in one client and marks it as a "recipe".
 */
export const fixRecipes = pgTable(
  'fix_recipes',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    affectedFiles: jsonb('affected_files').$type<string[]>().default([]),
    diffPatch: text('diff_patch'),           // unified diff
    errorPattern: text('error_pattern'),      // regex or fingerprint to match
    sourceProjectId: uuid('source_project_id')
      .references(() => projects.id),
    appliedCount: integer('applied_count').default(0),
    totalTargets: integer('total_targets').default(0),
    successRate: integer('success_rate'),      // 0–100
    status: varchar('status', { length: 20 }).default('draft'), // draft|active|deprecated
    createdBy: uuid('created_by')
      .references(() => users.id),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_fix_recipes_org').on(table.orgId),
    index('idx_fix_recipes_status').on(table.orgId, table.status),
  ],
);

/**
 * Fix rollouts — tracks propagation of a recipe to individual client projects.
 * Each row = one recipe applied (or attempted) on one client.
 */
export const fixRollouts = pgTable(
  'fix_rollouts',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    recipeId: uuid('recipe_id')
      .references(() => fixRecipes.id)
      .notNull(),
    clientProjectId: uuid('client_project_id')
      .references(() => projects.id)
      .notNull(),
    status: varchar('status', { length: 20 }).default('pending'), // pending|applied|failed|rolled-back|skipped
    conflictType: varchar('conflict_type', { length: 30 }), // safe|modified|missing
    diffPreview: text('diff_preview'),        // preview of what will change
    failureReason: text('failure_reason'),
    appliedAt: timestamp('applied_at'),
    rolledBackAt: timestamp('rolled_back_at'),
    verifiedAt: timestamp('verified_at'),     // post-apply verification timestamp
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_fix_rollouts_recipe').on(table.recipeId),
    index('idx_fix_rollouts_client').on(table.clientProjectId),
    index('idx_fix_rollouts_status').on(table.recipeId, table.status),
  ],
);

export type FixRecipe = typeof fixRecipes.$inferSelect;
export type NewFixRecipe = typeof fixRecipes.$inferInsert;
export type FixRollout = typeof fixRollouts.$inferSelect;
export type NewFixRollout = typeof fixRollouts.$inferInsert;
