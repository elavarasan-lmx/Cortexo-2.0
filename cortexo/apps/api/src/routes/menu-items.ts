import { FastifyInstance } from 'fastify';
import { eq, asc } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { menuItems } from '@cortexo/db/schema';

export async function menuItemRoutes(app: FastifyInstance) {
  // GET /menu-items — fetch all menu items grouped by section
  app.get('/menu-items', async () => {
    const db = await getDb();

    const rows = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.visible, true))
      .orderBy(asc(menuItems.sortOrder));

    // Group by section
    const sectionsMap = new Map<string, { title: string; color: string; items: any[] }>();

    for (const row of rows) {
      if (!sectionsMap.has(row.sectionTitle)) {
        sectionsMap.set(row.sectionTitle, {
          title: row.sectionTitle,
          color: row.sectionColor,
          items: [],
        });
      }
      sectionsMap.get(row.sectionTitle)!.items.push({
        label: row.label,
        href: row.href,
        emoji: row.emoji,
      });
    }

    return { sections: Array.from(sectionsMap.values()) };
  });

  // GET /menu-items/all — admin: fetch ALL items (including hidden)
  app.get('/menu-items/all', async () => {
    const db = await getDb();
    const rows = await db
      .select()
      .from(menuItems)
      .orderBy(asc(menuItems.sortOrder));
    return { items: rows };
  });

  // POST /menu-items — admin: add a new menu item
  app.post('/menu-items', async (request) => {
    const db = await getDb();
    const body = request.body as any;

    const [item] = await db.insert(menuItems).values({
      label: body.label,
      href: body.href,
      emoji: body.emoji,
      sectionTitle: body.sectionTitle,
      sectionColor: body.sectionColor,
      sortOrder: body.sortOrder ?? 0,
      visible: body.visible ?? true,
    }).returning();

    return { success: true, item };
  });

  // PUT /menu-items/:id — admin: update a menu item
  app.put('/menu-items/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as { id: string };
    const body = request.body as any;

    await db
      .update(menuItems)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuItems.id, parseInt(id)));

    return { success: true };
  });

  // DELETE /menu-items/:id — admin: remove a menu item
  app.delete('/menu-items/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as { id: string };

    await db.delete(menuItems).where(eq(menuItems.id, parseInt(id)));

    return { success: true };
  });

  // POST /menu-items/seed — seed DB from default config (one-time setup)
  app.post('/menu-items/seed', async () => {
    const db = await getDb();

    // Check if already seeded
    const existing = await db.select().from(menuItems);
    if (existing.length > 0) {
      return { success: false, message: 'Menu items already exist. Delete all first to re-seed.' };
    }

    const defaults = [
      // MAIN
      { label: 'Dashboard',     href: '/dashboard',      emoji: '◉',  sectionTitle: 'MAIN',           sectionColor: '#818CF8', sortOrder: 1 },
      { label: 'Projects',      href: '/projects',       emoji: '📁', sectionTitle: 'MAIN',           sectionColor: '#818CF8', sortOrder: 2 },
      { label: 'Deployments',   href: '/deployments',    emoji: '⬡',  sectionTitle: 'MAIN',           sectionColor: '#818CF8', sortOrder: 3 },
      { label: 'Knowledge',     href: '/knowledge-base', emoji: '📚', sectionTitle: 'MAIN',           sectionColor: '#818CF8', sortOrder: 5 },
      { label: 'DevOps Docs',   href: '/devops-docs',    emoji: '📄', sectionTitle: 'MAIN',           sectionColor: '#818CF8', sortOrder: 6 },
      // MONITORING
      { label: 'Bug Tracker',   href: '/bug-tracker',    emoji: '🐛', sectionTitle: 'MONITORING',     sectionColor: '#EF4444', sortOrder: 10 },
      // INFRASTRUCTURE
      { label: 'Servers',       href: '/servers',        emoji: '🖥',  sectionTitle: 'INFRASTRUCTURE', sectionColor: '#06B6D4', sortOrder: 20 },
      { label: 'Pipelines',     href: '/pipelines',      emoji: '🔀', sectionTitle: 'INFRASTRUCTURE', sectionColor: '#06B6D4', sortOrder: 21 },
      // ADMIN
      { label: 'Audit Log',     href: '/audit-log',      emoji: '📜', sectionTitle: 'ADMIN',          sectionColor: '#6B7280', sortOrder: 30 },
      { label: 'Testing',       href: '/testing',        emoji: '🧪', sectionTitle: 'ADMIN',          sectionColor: '#6B7280', sortOrder: 31 },
      { label: 'Settings',      href: '/settings',       emoji: '⚙',  sectionTitle: 'ADMIN',          sectionColor: '#6B7280', sortOrder: 34 },
    ];

    await db.insert(menuItems).values(defaults);
    return { success: true, count: defaults.length };
  });
}
