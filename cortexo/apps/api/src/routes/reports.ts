import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { getOrgId } from '../lib/request-context.js';
import crypto from 'crypto';

/**
 * Reports API — /v1/reports
 * CRUD for generated reports (test-run, bug, audit, deployment)
 */
export async function reportRoutes(app: FastifyInstance) {

  // In-memory store (swap for DB table when ready)
  const reports: {
    id: string;
    name: string;
    type: 'test-run' | 'bugs' | 'audit' | 'deployment';
    status: 'pending' | 'complete' | 'failed';
    pages: number;
    html: string | null;
    createdAt: string;
    createdBy: string;
  }[] = [];

  // GET /reports — List all reports
  app.get('/reports', async (request) => {
    const { type, status } = (request.query || {}) as { type?: string; status?: string };
    let filtered = reports;
    if (type) filtered = filtered.filter(r => r.type === type);
    if (status) filtered = filtered.filter(r => r.status === status);
    return { data: filtered, total: filtered.length };
  });

  // GET /reports/:id — Get single report
  app.get('/reports/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = reports.find(r => r.id === id);
    if (!report) return reply.code(404).send({ error: 'Report not found' });
    return { data: report };
  });

  // POST /reports — Generate a new report
  const createSchema = z.object({
    name: z.string().min(1).max(255),
    type: z.enum(['test-run', 'bugs', 'audit', 'deployment']),
    sourceId: z.string().optional(), // test run ID, bug list ID, etc.
  });

  app.post('/reports', async (request, reply) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { name, type, sourceId } = parsed.data;

    const report = {
      id: crypto.randomUUID(),
      name,
      type,
      status: 'complete' as const,
      pages: Math.floor(Math.random() * 5) + 1,
      html: `<html><body><h1>${name}</h1><p>Type: ${type}</p><p>Generated at ${new Date().toISOString()}</p></body></html>`,
      createdAt: new Date().toISOString(),
      createdBy: 'dev-user',
    };
    reports.push(report);

    return reply.code(201).send({ data: report });
  });

  // DELETE /reports/:id — Remove report
  app.delete('/reports/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const idx = reports.findIndex(r => r.id === id);
    if (idx === -1) return reply.code(404).send({ error: 'Report not found' });
    reports.splice(idx, 1);
    return { success: true };
  });

  // GET /reports/:id/html — Render report as HTML
  app.get('/reports/:id/html', async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = reports.find(r => r.id === id);
    if (!report) return reply.code(404).send({ error: 'Report not found' });
    return reply.type('text/html').send(report.html || '<p>No content</p>');
  });
}
