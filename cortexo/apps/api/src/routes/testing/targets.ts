import type { FastifyInstance } from 'fastify';
import { getDb } from '../../lib/db.js';
import { testTargets, testCases } from '@cortexo/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Testing — Targets & Scan Routes
 *
 * Targets:  GET/POST/DELETE /testing/targets
 * Scan:     POST /testing/scan
 * Cases:    GET/DELETE /testing/cases
 */
export async function targetRoutes(app: FastifyInstance) {

  /* ─────────────────── TARGETS (Client URLs) ─────────────────── */

  app.get('/testing/targets', async () => {
    const db = await getDb();
    return db.select().from(testTargets).orderBy(desc(testTargets.createdAt));
  });

  app.post('/testing/targets', async (request) => {
    const db = await getDb();
    const body = request.body as any;
    const [row] = await db.insert(testTargets).values({
      name: body.name,
      baseUrl: (body.baseUrl || '').replace(/\/$/, ''),
      environment: body.environment || 'staging',
    }).returning();
    return row;
  });

  app.delete('/testing/targets/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as any;
    await db.delete(testTargets).where(eq(testTargets.id, Number(id)));
    return { success: true };
  });

  /* ─────────────────── SCAN PROJECT ─────────────────── */

  app.post('/testing/scan', async (request) => {
    const db = await getDb();
    const body = (request.body || {}) as any;
    const projectPath = body.projectPath || '/run/media/lmx/LMX/Winbull/Personal/Devops/Project/Web';

    const discovered: Array<{
      name: string; endpoint: string; method: string;
      category: string; sourceFile: string; priority: string;
    }> = [];

    // 1. Scan /api/ — each PHP file is a direct endpoint
    const apiDir = path.join(projectPath, 'api');
    if (fs.existsSync(apiDir)) {
      const files = fs.readdirSync(apiDir).filter((f: string) => f.endsWith('.php') && !f.includes('test_'));
      for (const file of files) {
        const name = file.replace('.php', '');
        discovered.push({
          name: `API: ${name}`,
          endpoint: `/api/${file}`,
          method: 'GET',
          category: 'api',
          sourceFile: `api/${file}`,
          priority: name.includes('rate') ? 'high' : 'medium',
        });
      }
    }

    // 2. Scan /mobileapi/application/controllers/ — CI REST controllers
    const mobileDir = path.join(projectPath, 'mobileapi/application/controllers');
    if (fs.existsSync(mobileDir)) {
      const files = fs.readdirSync(mobileDir).filter((f: string) => f.endsWith('.php') && f.startsWith('C_'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(mobileDir, file), 'utf8');
        const className = file.replace('.php', '').replace('C_', '');
        const methodRegex = /function\s+(\w+?)_(get|post)\s*\(/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
          const methodName = match[1];
          const httpMethod = match[2].toUpperCase();
          discovered.push({
            name: `Mobile: ${className}/${methodName}`,
            endpoint: `/mobileapi/index.php/${className}/${methodName}`,
            method: httpMethod,
            category: 'mobileapi',
            sourceFile: `mobileapi/application/controllers/${file}`,
            priority: methodName.includes('login') || methodName.includes('booking') ? 'high' : 'medium',
          });
        }
      }
    }

    // 3. Scan /application/controllers/ — main web controllers
    const mainDir = path.join(projectPath, 'application/controllers');
    if (fs.existsSync(mainDir)) {
      const files = fs.readdirSync(mainDir).filter((f: string) => f.endsWith('.php') && f.startsWith('C_'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(mainDir, file), 'utf8');
        const className = file.replace('.php', '').replace('C_', '');
        const methodRegex = /function\s+(\w+)\s*\(/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
          const methodName = match[1];
          if (methodName === '__construct' || methodName.startsWith('_') || methodName.startsWith('validate')) continue;
          discovered.push({
            name: `Web: ${className}/${methodName}`,
            endpoint: `/index.php/${className}/${methodName}`,
            method: 'GET',
            category: 'controller',
            sourceFile: `application/controllers/${file}`,
            priority: 'low',
          });
        }
      }
    }

    // 4. Scan /admin/application/controllers/
    const adminDir = path.join(projectPath, 'admin/application/controllers');
    if (fs.existsSync(adminDir)) {
      const files = fs.readdirSync(adminDir).filter((f: string) => f.endsWith('.php') && f.startsWith('C_'));
      for (const file of files) {
        const className = file.replace('.php', '').replace('C_', '');
        discovered.push({
          name: `Admin: ${className}`,
          endpoint: `/admin/index.php/${className}`,
          method: 'GET',
          category: 'admin',
          sourceFile: `admin/application/controllers/${file}`,
          priority: 'low',
        });
      }
    }

    // Upsert — skip duplicates
    let inserted = 0;
    let skipped = 0;
    for (const d of discovered) {
      const existing = await db.select({ id: testCases.id })
        .from(testCases)
        .where(eq(testCases.endpoint, d.endpoint))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(testCases).values({
          name: d.name,
          endpoint: d.endpoint,
          method: d.method,
          category: d.category,
          sourceFile: d.sourceFile,
          priority: d.priority,
          isAuto: true,
        });
        inserted++;
      } else {
        skipped++;
      }
    }

    return {
      discovered: discovered.length,
      inserted,
      skipped,
      categories: {
        api: discovered.filter(d => d.category === 'api').length,
        mobileapi: discovered.filter(d => d.category === 'mobileapi').length,
        controller: discovered.filter(d => d.category === 'controller').length,
        admin: discovered.filter(d => d.category === 'admin').length,
      },
    };
  });

  /* ─────────────────── TEST CASES ─────────────────── */

  app.get('/testing/cases', async (request) => {
    const db = await getDb();
    const { category } = request.query as any;
    const conditions: any[] = [];
    if (category) conditions.push(eq(testCases.category, category));
    return db.select().from(testCases)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(testCases.category, testCases.name);
  });

  app.delete('/testing/cases/:id', async (request) => {
    const db = await getDb();
    const { id } = request.params as any;
    await db.delete(testCases).where(eq(testCases.id, Number(id)));
    return { success: true };
  });

  app.delete('/testing/cases', async () => {
    const db = await getDb();
    await db.delete(testCases).where(eq(testCases.isAuto, true));
    return { success: true };
  });
}
