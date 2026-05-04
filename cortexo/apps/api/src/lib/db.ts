import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import * as schema from '@cortexo/db/schema';

const { Pool } = pg;

type PgDatabase = ReturnType<typeof drizzle>;
let db: PgDatabase | null = null;
let pool: pg.Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool.
 * Uses Drizzle ORM with node-postgres (pg) driver.
 * Migrated from mysql2 to support RLS-based multi-tenant isolation.
 */
export async function getDb() {
  if (db) return db;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  });

  db = drizzle(pool, { schema });
  return db;
}

/**
 * Test database connectivity. Returns true if connected.
 * Reuses the shared connection pool to avoid leaking connections.
 */
export async function testDbConnection(): Promise<boolean> {
  try {
    const database = await getDb();
    // Run a lightweight query to test connectivity
    await database.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gracefully close the connection pool (for clean shutdown).
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
