import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Menu Items — fully DB-driven sidebar navigation.
 *
 * Each row = one sidebar menu item with section grouping.
 * The sidebar fetches this on load — no hardcoded nav-config needed.
 */
export const menuItems = pgTable(
  'menu_items',
  {
    id: serial('id').primaryKey(),
    label: varchar('label', { length: 100 }).notNull(),
    href: varchar('href', { length: 200 }).notNull().unique(),
    emoji: varchar('emoji', { length: 10 }).notNull(),
    sectionTitle: varchar('section_title', { length: 50 }).notNull(),
    sectionColor: varchar('section_color', { length: 20 }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    visible: boolean('visible').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_menu_items_section').on(table.sectionTitle),
    index('idx_menu_items_sort').on(table.sortOrder),
  ],
);

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
