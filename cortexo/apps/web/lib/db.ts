import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@cortexo/db/schema';

const { Pool } = pg;

/**
 * Singleton database connection for the Next.js web app.
 * Uses Drizzle ORM with node-postgres (pg) connection pool.
 * Migrated from mysql2 to PostgreSQL for RLS-based multi-tenant isolation.
 */
let db: ReturnType<typeof drizzle> | null = null;
let pool: pg.Pool | null = null;

export function getDb() {
  if (db) return db;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  });

  db = drizzle(pool, { schema });
  return db;
}

export type Database = NonNullable<ReturnType<typeof getDb>>;
