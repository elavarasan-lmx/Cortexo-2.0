import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@cortexo/db/schema';

/**
 * Singleton database connection for the Next.js web app.
 * Uses Drizzle ORM with mysql2 connection pool.
 */
let db: ReturnType<typeof drizzle> | null = null;
let pool: mysql.Pool | null = null;

export function getDb() {
  if (db) return db;

  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60000,
  });

  db = drizzle(pool, { schema, mode: 'default' });
  return db;
}

export type Database = ReturnType<typeof getDb>;
