import type { FastifyInstance } from 'fastify';
import { logSources } from '@cortexo/db/schema';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// ── Helpers ─────────────────────────────────────────────────────

function detectLogLevel(line: string): string {
  const lower = line.toLowerCase();
  if (lower.includes('fatal') || lower.includes('critical')) return 'critical';
  if (lower.includes('error') || lower.includes('exception') || lower.includes('err]')) return 'error';
  if (lower.includes('warning') || lower.includes('warn')) return 'warning';
  if (lower.includes('notice') || lower.includes('info')) return 'info';
  if (lower.includes('debug')) return 'debug';
  return 'info';
}

function extractTimestamp(line: string): string | null {
  const patterns = [
    /\[(\d{2}-\w{3}-\d{4}\s[\d:]+)/,
    /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})/,
    /\[(\d{4}\/\d{2}\/\d{2}\s[\d:]+)/,
    /(\w{3}\s+\d{1,2}\s[\d:]+\s\d{4})/,
  ];
  for (const p of patterns) {
    const m = line.match(p);
    if (m) return m[1];
  }
  return null;
}

function readLastLines(filePath: string, lineCount = 200) {
  try {
    if (!fs.existsSync(filePath)) return { lines: [], error: `File not found: ${filePath}` };
    const stat = fs.statSync(filePath);
    if (stat.size === 0) return { lines: [], fileSize: 0 };

    const chunkSize = Math.min(stat.size, 512 * 1024);
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(chunkSize);
    fs.readSync(fd, buffer, 0, chunkSize, Math.max(0, stat.size - chunkSize));
    fs.closeSync(fd);

    const content = buffer.toString('utf8');
    const allLines = content.split('\n').filter(l => l.trim());
    const lines = allLines.slice(-lineCount);

    return {
      lines: lines.map((line, idx) => ({
        num: allLines.length - lines.length + idx + 1,
        text: line,
        level: detectLogLevel(line),
        timestamp: extractTimestamp(line),
      })),
      fileSize: stat.size,
      totalLines: allLines.length,
      lastModified: stat.mtime.toISOString(),
    };
  } catch (err: any) {
    return { lines: [], error: 'Read error' };
  }
}

function searchInFile(filePath: string, query: string, caseInsensitive = true, maxResults = 200) {
  try {
    if (!fs.existsSync(filePath)) return { results: [], error: 'File not found' };
    const stat = fs.statSync(filePath);
    const readSize = Math.min(stat.size, 2 * 1024 * 1024);
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(readSize);
    fs.readSync(fd, buffer, 0, readSize, Math.max(0, stat.size - readSize));
    fs.closeSync(fd);

    const content = buffer.toString('utf8');
    const lines = content.split('\n');
    const results: any[] = [];
    const searchQuery = caseInsensitive ? query.toLowerCase() : query;

    for (let i = 0; i < lines.length && results.length < maxResults; i++) {
      const compareLine = caseInsensitive ? lines[i].toLowerCase() : lines[i];
      if (compareLine.includes(searchQuery)) {
        results.push({
          num: i + 1,
          text: lines[i],
          level: detectLogLevel(lines[i]),
          timestamp: extractTimestamp(lines[i]),
        });
      }
    }
    return { results, total: results.length, fileSize: stat.size };
  } catch (err: any) {
    return { results: [], error: 'Search error' };
  }
}

/**
 * Log Viewer API — /v1/logs
 * Read, search, and tail log files from servers.
 * Ported from BullionDevops logviewer.js (396 lines).
 */
export async function logViewerRoutes(app: FastifyInstance) {

  // ── Log Sources CRUD ────────────────────────────────────────

  app.get('/logs/sources', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.logSources.findMany({
        orderBy: (s, { asc }) => [asc(s.name)],
      });
      // Enrich with file existence info
      const enriched = rows.map(r => {
        const exists = fs.existsSync(r.path);
        let fileSize = 0;
        let lastModified = '';
        if (exists) {
          try {
            const stat = fs.statSync(r.path);
            fileSize = stat.size;
            lastModified = stat.mtime.toISOString();
          } catch (_) {}
        }
        return { ...r, exists, fileSize, lastModified };
      });
      return { data: enriched };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  const createSourceSchema = z.object({
    name: z.string().min(1),
    type: z.string().default('file'),
    path: z.string().min(1),
    server: z.string().default('localhost'),
    description: z.string().optional(),
  });

  app.post('/logs/sources', async (request, reply) => {
    const parsed = createSourceSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { name, type, path: filePath, server, description } = parsed.data;
    try {
      const db = await getDb();
      const [result] = await db.insert(logSources).values({
        name,
        type,
        path: filePath,
        server,
        description,
      } as any);
      return reply.code(201).send({ data: { id: (result as any).insertId }, success: true });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  app.delete('/logs/sources/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      await db.delete(logSources).where(eq(logSources.id, parseInt(id)));
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Read log file ────────────────────────────────────────────

  app.get('/logs/read/:sourceId', async (request, reply) => {
    const { sourceId } = request.params as { sourceId: string };
    const { lines = '200' } = request.query as { lines?: string };
    try {
      const db = await getDb();
      const source = await db.query.logSources.findFirst({
        where: (s, { eq }) => eq(s.id, parseInt(sourceId)),
      });
      if (!source) return reply.code(404).send({ error: 'Source not found' });

      const result = readLastLines(source.path, parseInt(lines));
      return { source: { id: source.id, name: source.name, path: source.path }, ...result };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Read error' });
    }
  });

  // Direct path read
  const readLogSchema = z.object({ filePath: z.string().min(1), lines: z.number().default(200) });

  app.post('/logs/read', async (request, reply) => {
    const parsed = readLogSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const result = readLastLines(parsed.data.filePath, parsed.data.lines);
    return result;
  });

  // ── Search ──────────────────────────────────────────────────

  app.get('/logs/search/:sourceId', async (request, reply) => {
    const { sourceId } = request.params as { sourceId: string };
    const { q, case: caseMode } = request.query as { q?: string; case?: string };
    if (!q) return reply.code(400).send({ error: 'q (search query) required' });
    try {
      const db = await getDb();
      const source = await db.query.logSources.findFirst({
        where: (s, { eq }) => eq(s.id, parseInt(sourceId)),
      });
      if (!source) return reply.code(404).send({ error: 'Source not found' });

      const result = searchInFile(source.path, q, caseMode !== 'sensitive');
      return { source: { id: source.id, name: source.name }, query: q, ...result };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Search error' });
    }
  });

  // ── Browse directory for log files ──────────────────────────

  const browseSchema = z.object({ dirPath: z.string().min(1) });

  app.post('/logs/browse', async (request, reply) => {
    const parsed = browseSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { dirPath } = parsed.data;
    if (!fs.existsSync(dirPath)) return reply.code(404).send({ error: 'Directory not found' });

    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) return reply.code(400).send({ error: 'Not a directory' });

    const files = fs.readdirSync(dirPath)
      .filter(f => /\.(log|txt|err|out)$/i.test(f))
      .map(f => {
        const fullPath = path.join(dirPath, f);
        try {
          const s = fs.statSync(fullPath);
          return { name: f, path: fullPath, size: s.size, lastModified: s.mtime.toISOString() };
        } catch (_) {
          return { name: f, path: fullPath, size: 0 };
        }
      })
      .sort((a, b) => ((b as any).lastModified || '').localeCompare((a as any).lastModified || ''));

    return { directory: dirPath, files };
  });

  // ── Log stats ──────────────────────────────────────────────

  app.get('/logs/stats/:sourceId', async (request, reply) => {
    const { sourceId } = request.params as { sourceId: string };
    try {
      const db = await getDb();
      const source = await db.query.logSources.findFirst({
        where: (s, { eq }) => eq(s.id, parseInt(sourceId)),
      });
      if (!source) return reply.code(404).send({ error: 'Source not found' });
      if (!fs.existsSync(source.path)) return { exists: false };

      const stat = fs.statSync(source.path);
      const { lines } = readLastLines(source.path, 1000);
      const counts: Record<string, number> = { critical: 0, error: 0, warning: 0, info: 0, debug: 0 };
      (lines as any[]).forEach((l: any) => { counts[l.level] = (counts[l.level] || 0) + 1; });

      return {
        exists: true,
        fileSize: stat.size,
        lastModified: stat.mtime.toISOString(),
        lineCount: lines.length,
        levelCounts: counts,
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Stats error' });
    }
  });
}
