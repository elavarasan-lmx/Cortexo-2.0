import { FastifyInstance, FastifyRequest } from 'fastify';
import { DOCS, type DocEntry } from './devops-docs-data.js';
import { getDb } from '../lib/db.js';

// ─── DevOps Documentation Routes ─────────────────────────────────────────
// Route handlers for the documentation reference module.
// Static doc data lives in ./devops-docs-data.ts for HMR performance.


/**
 * DevOps Documentation Routes
 */
export async function devopsDocsRoutes(app: FastifyInstance) {

  // ─── GET /devops-docs — List all docs with optional search/filter ────
  app.get(
    '/devops-docs',
    async (request: FastifyRequest<{ Querystring: { q?: string; tool?: string; category?: string } }>) => {
      const { q, tool, category } = request.query;
      let results = DOCS;

      if (tool) {
        results = results.filter(d => d.tool.toLowerCase() === tool.toLowerCase());
      }
      if (category) {
        results = results.filter(d => d.category.toLowerCase() === category.toLowerCase());
      }
      if (q) {
        const query = q.toLowerCase();
        results = results.filter(d =>
          d.title.toLowerCase().includes(query) ||
          d.tool.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.commands.some(c => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)) ||
          d.tips?.some(t => t.toLowerCase().includes(query))
        );
      }

      return {
        data: results.map(d => ({
          id: d.id,
          tool: d.tool,
          icon: d.icon,
          color: d.color,
          category: d.category,
          title: d.title,
          description: d.description,
          commandCount: d.commands.length,
          snippetCount: d.configSnippets?.length || 0,
          tipCount: d.tips?.length || 0,
        })),
        total: results.length,
      };
    },
  );

  // ─── GET /devops-docs/:id — Get full doc by ID ──────────────────────
  app.get(
    '/devops-docs/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const doc = DOCS.find(d => d.id === request.params.id);
      if (!doc) return reply.code(404).send({ error: 'Document not found' });
      return { data: doc };
    },
  );

  // ─── GET /devops-docs/tools — List available tools ──────────────────
  app.get(
    '/devops-docs/tools',
    async () => {
      const tools = [...new Set(DOCS.map(d => d.tool))];
      const categories = [...new Set(DOCS.map(d => d.category))];
      return {
        data: {
          tools: tools.map(t => {
            const doc = DOCS.find(d => d.tool === t)!;
            return { name: t, icon: doc.icon, color: doc.color, category: doc.category };
          }),
          categories,
        },
      };
    },
  );

  // ─── CRUD: Custom Docs (DB-backed, user-created) ─────────────────────
  const { customDocs, deployChecklists } = await import('@cortexo/db/schema');
  const { eq, ilike, desc: descOrder } = await import('drizzle-orm');

  // List custom docs
  app.get('/devops-docs/custom', async () => {
    const db = await getDb();
    const rows = await db.select().from(customDocs).where(eq(customDocs.isActive, true)).orderBy(descOrder(customDocs.updatedAt));
    return { data: rows };
  });

  // Create custom doc
  app.post('/devops-docs/custom', async (request: FastifyRequest<{ Body: {
    tool: string; title: string; description: string; category?: string; color?: string;
    commands?: { cmd: string; desc: string }[];
    configSnippets?: { title: string; lang: string; code: string }[];
    tips?: string[];
  } }>) => {
    const b = request.body;
    const db = await getDb();
    const [row] = await db.insert(customDocs).values({
      tool: b.tool, title: b.title, description: b.description,
      category: b.category || 'Custom', color: b.color || '#6366F1',
      commands: b.commands || [], configSnippets: b.configSnippets || [], tips: b.tips || [],
    }).returning();
    return { data: row };
  });

  // Update custom doc
  app.put('/devops-docs/custom/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    const b = request.body as any;
    const db = await getDb();
    const [row] = await db.update(customDocs).set({
      ...b, updatedAt: new Date(),
    }).where(eq(customDocs.id, id)).returning();
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return { data: row };
  });

  // Delete custom doc (soft delete)
  app.delete('/devops-docs/custom/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    const db = await getDb();
    await db.update(customDocs).set({ isActive: false }).where(eq(customDocs.id, id));
    return { success: true };
  });

  // ─── Deployment Checklists (Item 8) ──────────────────────────────────

  // List checklists
  app.get('/devops-docs/checklists', async (request: FastifyRequest<{ Querystring: { status?: string } }>) => {
    const { status } = request.query;
    const db = await getDb();
    const rows = await db.select().from(deployChecklists).orderBy(descOrder(deployChecklists.updatedAt));
    const filtered = status ? rows.filter((r: any) => r.status === status) : rows;
    return { data: filtered };
  });

  // Create checklist
  app.post('/devops-docs/checklists', async (request: FastifyRequest<{ Body: {
    clientName: string; projectType?: string;
    steps?: { label: string; done: boolean; notes?: string }[];
  } }>) => {
    const b = request.body;
    const defaultSteps = [
      { label: 'Backup database (mysqldump)', done: false },
      { label: 'Update DNS records (A record → EC2 IP)', done: false },
      { label: 'Set file permissions (www-data, 755)', done: false },
      { label: 'Configure Apache vhost + WebSocket proxy', done: false },
      { label: 'Enable Apache modules (rewrite, proxy_wstunnel, headers)', done: false },
      { label: 'Deploy project files to /var/www/html/', done: false },
      { label: 'Install node dependencies + PM2 start', done: false },
      { label: 'Setup SSL with Certbot', done: false },
      { label: 'Update config.xml / app version codes', done: false },
      { label: 'Switch all URLs from test to production', done: false },
      { label: 'Run apache2ctl configtest', done: false },
      { label: 'Setup cron jobs (Laravel scheduler, backups)', done: false },
      { label: 'Test all endpoints + WebSocket connections', done: false },
      { label: 'Build release APK/AAB and sign', done: false },
      { label: 'Submit to Play Store', done: false },
    ];
    const db = await getDb();
    const [row] = await db.insert(deployChecklists).values({
      clientName: b.clientName,
      projectType: b.projectType || 'bullion',
      steps: b.steps || defaultSteps,
    }).returning();
    return { data: row };
  });

  // Update checklist (toggle steps, change status)
  app.put('/devops-docs/checklists/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    const b = request.body as any;
    const db = await getDb();
    const [row] = await db.update(deployChecklists).set({
      ...b, updatedAt: new Date(),
    }).where(eq(deployChecklists.id, id)).returning();
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return { data: row };
  });

  // Delete checklist
  app.delete('/devops-docs/checklists/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    const db = await getDb();
    await db.delete(deployChecklists).where(eq(deployChecklists.id, id));
    return { success: true };
  });

  // ─── Global Search (Item 9) ──────────────────────────────────────────
  app.get('/devops-docs/search', async (request: FastifyRequest<{ Querystring: { q: string } }>) => {
    const { q } = request.query;
    if (!q || q.length < 2) return { data: { static: [], custom: [] } };
    const query = q.toLowerCase();

    // Search static docs
    const staticResults = DOCS.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.tool.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.commands.some(c => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)) ||
      d.configSnippets?.some(s => s.title.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)) ||
      d.tips?.some(t => t.toLowerCase().includes(query))
    ).map(d => ({
      id: d.id, type: 'static' as const, tool: d.tool, title: d.title,
      description: d.description, category: d.category, color: d.color,
    }));

    // Search custom docs
    const db = await getDb();
    const customRows = await db.select().from(customDocs).where(eq(customDocs.isActive, true));
    const customResults = customRows.filter((d: any) =>
      d.title.toLowerCase().includes(query) ||
      d.tool.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query)
    ).map((d: any) => ({
      id: `custom-${d.id}`, type: 'custom' as const, tool: d.tool, title: d.title,
      description: d.description, category: d.category, color: d.color,
    }));

    return { data: { static: staticResults, custom: customResults, total: staticResults.length + customResults.length } };
  });
}
