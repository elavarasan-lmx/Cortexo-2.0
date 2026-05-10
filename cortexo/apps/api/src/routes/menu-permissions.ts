import { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { userMenuPermissions } from '@cortexo/db/schema';

export async function menuPermissionRoutes(app: FastifyInstance) {
  // GET /menu-permissions — fetch current user's menu visibility settings
  app.get('/menu-permissions', async (request) => {
    const db = await getDb();
    const userId = (request as any).userId;

    const rows = await db
      .select()
      .from(userMenuPermissions)
      .where(eq(userMenuPermissions.userId, userId));

    const permissions: Record<string, boolean> = {};
    for (const row of rows) {
      permissions[row.menuKey] = row.visible;
    }

    return { permissions };
  });

  // PUT /menu-permissions — update menu visibility settings
  app.put('/menu-permissions', async (request) => {
    const db = await getDb();
    const userId = (request as any).userId;
    const { permissions } = request.body as { permissions: Record<string, boolean> };

    if (!permissions || typeof permissions !== 'object') {
      return { success: false, error: 'Invalid permissions object' };
    }

    // Upsert each permission
    for (const [menuKey, visible] of Object.entries(permissions)) {
      const existing = await db
        .select()
        .from(userMenuPermissions)
        .where(
          and(
            eq(userMenuPermissions.userId, userId),
            eq(userMenuPermissions.menuKey, menuKey),
          ),
        );

      if (existing.length > 0) {
        await db
          .update(userMenuPermissions)
          .set({ visible, updatedAt: new Date() })
          .where(
            and(
              eq(userMenuPermissions.userId, userId),
              eq(userMenuPermissions.menuKey, menuKey),
            ),
          );
      } else {
        await db.insert(userMenuPermissions).values({
          userId,
          menuKey,
          visible,
        });
      }
    }

    return { success: true };
  });
}
