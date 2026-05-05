import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq, and, sql } from 'drizzle-orm';
import { userMenuPermissions } from '@cortexo/db/schema';
import { logAudit } from './audit.js';

// Define expected user object on request
interface RequestUser {
  id: string;
  name?: string;
  role?: string;
}

const permissionsSchema = z.object({
  permissions: z.record(z.string(), z.boolean())
});

const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const reqUser = (request as any).user as RequestUser | undefined;
  if (reqUser?.role !== 'admin' && reqUser?.role !== 'owner') {
    return reply.code(403).send({ error: 'Admin access required' });
  }
};

/**
 * All sidebar menu items — used as the master list.
 * menuKey = the href path.
 * section = which sidebar group this belongs to.
 */
const ALL_MENU_ITEMS = [
  // Dashboard (always visible, not restrictable)
  { menuKey: '/dashboard',           label: 'Dashboard',         section: '' },
  // Projects
  { menuKey: '/projects',            label: 'All Projects',      section: 'PROJECTS' },
  // CI/CD
  { menuKey: '/pipelines',           label: 'Pipelines',         section: 'CI/CD' },
  { menuKey: '/pipelines/runs',      label: 'Pipeline Runs',     section: 'CI/CD' },
  { menuKey: '/pipelines/editor',    label: 'Pipeline Editor',   section: 'CI/CD' },
  { menuKey: '/deployments',         label: 'Deployments',       section: 'CI/CD' },
  { menuKey: '/deployments/canary',  label: 'Canary Releases',   section: 'CI/CD' },
  { menuKey: '/rollbacks',           label: 'Rollbacks',         section: 'CI/CD' },
  // Bugs & Errors
  { menuKey: '/errors',              label: 'Errors',            section: 'BUGS & ERRORS' },
  { menuKey: '/root-causes',         label: 'Root Causes',       section: 'BUGS & ERRORS' },
  { menuKey: '/scans',               label: 'Scan Results',      section: 'BUGS & ERRORS' },
  // Operations
  { menuKey: '/postmortem',          label: 'Postmortem',        section: 'OPERATIONS' },
  { menuKey: '/deprecation',         label: 'Deprecations',      section: 'OPERATIONS' },
  // Infrastructure
  { menuKey: '/servers',             label: 'Servers',           section: 'INFRASTRUCTURE' },
  { menuKey: '/servers/mounts',      label: 'Server Mounts',     section: 'INFRASTRUCTURE' },
  { menuKey: '/logs',                label: 'Log Viewer',        section: 'INFRASTRUCTURE' },
  // Sync & Migration
  { menuKey: '/sync',                label: 'Source Sync',       section: 'SYNC & MIGRATION' },
  { menuKey: '/db-migration',        label: 'DB Migration',      section: 'SYNC & MIGRATION' },
  // Agent Intelligence
  { menuKey: '/agent/memory',        label: 'Agent Memory',      section: 'AGENT INTELLIGENCE' },
  { menuKey: '/agent/skills',        label: 'Skill Library',     section: 'AGENT INTELLIGENCE' },
  { menuKey: '/agent/context',       label: 'Context Monitor',   section: 'AGENT INTELLIGENCE' },
  { menuKey: '/agent/performance',   label: 'Agent Performance', section: 'AGENT INTELLIGENCE' },
  { menuKey: '/agent/runner',        label: 'Agent Runner',      section: 'AGENT INTELLIGENCE' },
  { menuKey: '/agent/marketplace',   label: 'Marketplace',       section: 'AGENT INTELLIGENCE' },

  // Analytics
  { menuKey: '/analytics',           label: 'Insights',          section: 'ANALYTICS' },
  { menuKey: '/reports',             label: 'Reports',           section: 'ANALYTICS' },
  { menuKey: '/analytics/audit',     label: 'Activity Log',      section: 'ANALYTICS' },
  // Tools
  { menuKey: '/postgres',            label: 'PostgreSQL',        section: 'TOOLS' },
  { menuKey: '/docs',                label: 'Docs',              section: 'TOOLS' },
  // Testing
  { menuKey: '/testing/load',        label: 'Load Test',         section: 'TESTING' },
  { menuKey: '/testing/socket',      label: 'Socket Test',       section: 'TESTING' },
  { menuKey: '/testing/module',      label: 'Module Test',       section: 'TESTING' },
  { menuKey: '/testing/checklist',   label: 'Checklist',         section: 'TESTING' },
  { menuKey: '/testing/api-health',  label: 'API Health',        section: 'TESTING' },
  { menuKey: '/testing/ssl',         label: 'SSL Monitor',       section: 'TESTING' },
  // Settings (always visible)
  { menuKey: '/settings',            label: 'Settings',          section: 'BOTTOM' },
];

/**
 * Menu Permissions API — /v1/menu-permissions
 *
 * GET  /menu-permissions          — get current user's menu visibility
 * PUT  /menu-permissions          — update current user's menu visibility
 * GET  /menu-permissions/all      — get master list of all menu items
 * GET  /menu-permissions/user/:id — admin: get another user's permissions
 * PUT  /menu-permissions/user/:id — admin: set another user's permissions
 */
export async function menuPermissionRoutes(app: FastifyInstance) {

  // ── GET /menu-permissions — current user's visible items ────
  app.get('/menu-permissions', async (request) => {
    const user = (request as any).user as RequestUser | undefined;
    const userId = user?.id || 'user-001';

    // Default: all items visible
    const defaults: Record<string, boolean> = {};
    for (const item of ALL_MENU_ITEMS) {
      defaults[item.menuKey] = true;
    }

    try {
      const db = await getDb();
      const rows = await db.query.userMenuPermissions.findMany({
        where: (t: any, { eq }: any) => eq(t.userId, userId),
      });

      const permissions = { ...defaults };
      for (const row of rows) {
        permissions[row.menuKey] = row.visible;
      }

      return { userId, permissions };
    } catch (err: any) {
      request.log.error(err);
      // DB not available — return all visible
      return { userId, permissions: defaults };
    }
  });

  // ── PUT /menu-permissions — update current user's visibility ─
  app.put('/menu-permissions', async (request, reply) => {
    const user = (request as any).user as RequestUser | undefined;
    const userId = user?.id || 'user-001';
    
    const parsed = permissionsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { permissions } = parsed.data;

    try {
      const db = await getDb();
      const entries = Object.entries(permissions);

      if (entries.length > 0) {
        for (const [menuKey, visible] of entries) {
          await db.execute(sql`
            INSERT INTO user_menu_permissions (user_id, menu_key, visible, updated_at)
            VALUES (${userId}, ${menuKey}, ${visible}, NOW())
            ON CONFLICT (user_id, menu_key) DO UPDATE SET visible = ${visible}, updated_at = NOW()
          `);
        }
      }

      logAudit({
        userId, userName: user?.name || 'LMX',
        action: 'menu_change', resource: 'sidebar',
        description: `Updated ${entries.length} menu items`,
        metadata: permissions,
        ipAddress: (request.ip || '') as string,
      });

      return { message: 'Permissions updated', userId };
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // ── GET /menu-permissions/all — master list ─────────────────
  app.get('/menu-permissions/all', async () => {
    return { items: ALL_MENU_ITEMS };
  });

  // ── GET /menu-permissions/user/:id — admin: get user's perms ─
  app.get('/menu-permissions/user/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id: targetUserId } = request.params as { id: string };

    try {
      const db = await getDb();
      const rows = await db.query.userMenuPermissions.findMany({
        where: (t, { eq }) => eq(t.userId, targetUserId),
      });

      const permissions: Record<string, boolean> = {};
      for (const item of ALL_MENU_ITEMS) {
        permissions[item.menuKey] = true;
      }
      for (const row of rows) {
        permissions[row.menuKey] = row.visible;
      }

      return { userId: targetUserId, permissions };
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // ── PUT /menu-permissions/user/:id — admin: set user's perms ─
  app.put('/menu-permissions/user/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id: targetUserId } = request.params as { id: string };
    
    const parsed = permissionsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { permissions } = parsed.data;

    try {
      const db = await getDb();
      const entries = Object.entries(permissions);

      if (entries.length > 0) {
        for (const [menuKey, visible] of entries) {
          await db.execute(sql`
            INSERT INTO user_menu_permissions (user_id, menu_key, visible, updated_at)
            VALUES (${targetUserId}, ${menuKey}, ${visible}, NOW())
            ON CONFLICT (user_id, menu_key) DO UPDATE SET visible = ${visible}, updated_at = NOW()
          `);
        }
      }

      return { message: 'Permissions updated', userId: targetUserId };
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
