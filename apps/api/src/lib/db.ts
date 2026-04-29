import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from '@cortexo/db/schema';

let db: MySql2Database<typeof schema> | null = null;

/**
 * Get or create a database connection pool.
 * Uses Drizzle ORM with mysql2 driver.
 */
export async function getDb() {
  if (db) return db;

  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    queueLimit: 0,
  });

  db = drizzle(pool, { schema, mode: 'default' });
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
