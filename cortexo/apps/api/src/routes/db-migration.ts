import type { FastifyInstance } from 'fastify';

/**
 * DB Migration API — /v1/db-migration
 * DISABLED: mysql2 dependency removed. Porting to PostgreSQL planned.
 */
export async function dbMigrationRoutes(app: FastifyInstance) {
  app.get('/db-migration/status', async () => {
    return { status: 'disabled', message: 'MySQL migration tools are currently disabled.' };
  });
}
