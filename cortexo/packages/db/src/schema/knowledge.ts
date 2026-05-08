import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// ─── Sprint 7 (F36): Knowledge Base / Q&A Engine ────────────────────

/**
 * Stores indexed documentation, guides, and architectural notes.
 */
export const knowledgeDocs = pgTable(
  'knowledge_docs',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    sourceUrl: varchar('source_url', { length: 500 }),
    category: varchar('category', { length: 50 }).default('general'), // e.g., 'architecture', 'troubleshooting'
    tags: jsonb('tags').$type<string[]>().default([]),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_knowledge_docs_category').on(table.category),
  ],
);

/**
 * Logs user questions and AI responses for analytics and context.
 */
export const qaHistory = pgTable(
  'qa_history',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    userId: uuid('user_id'), // optional, who asked
    sourcesUsed: jsonb('sources_used').$type<string[]>().default([]), // IDs of knowledge_docs referenced
    helpful: varchar('helpful', { length: 10 }), // 'yes'|'no'
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_qa_history_created').on(table.createdAt),
  ],
);

export type KnowledgeDoc = typeof knowledgeDocs.$inferSelect;
export type NewKnowledgeDoc = typeof knowledgeDocs.$inferInsert;
export type QaHistory = typeof qaHistory.$inferSelect;
export type NewQaHistory = typeof qaHistory.$inferInsert;
