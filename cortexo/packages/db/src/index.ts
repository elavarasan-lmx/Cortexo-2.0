import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

/**
 * Creates a Drizzle ORM client connected to PostgreSQL.
 * Uses node-postgres (pg) connection pooling for production performance.
 * Migrated from mysql2 to support RLS-based multi-tenant isolation.
 */
export async function createDb(connectionString?: string) {
  const pool = new Pool({
    connectionString: connectionString || process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  });

  return drizzle(pool, { schema });
}

export type Database = Awaited<ReturnType<typeof createDb>>;

// Re-export everything from schema for convenience
export * from './schema';
