import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

/**
 * Creates a Drizzle ORM client connected to MySQL.
 * Uses connection pooling for production performance.
 */
export async function createDb(connectionString?: string) {
  const pool = mysql.createPool({
    uri: connectionString || process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return drizzle(pool, { schema, mode: 'default' });
}

export type Database = Awaited<ReturnType<typeof createDb>>;

// Re-export everything from schema for convenience
export * from './schema';
