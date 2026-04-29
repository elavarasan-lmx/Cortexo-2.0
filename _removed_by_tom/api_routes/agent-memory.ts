/**
 * Agent Memory Backend API — /v1/agent/memory
 * Reads/writes .agent/memory/ files and persists agent learning entries.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MEMORY_DIR = path.resolve(process.env.AGENT_MEMORY_DIR || '.agent/memory');
const MEMORY_DB_FILE = path.join(MEMORY_DIR, 'cortexo_memory.json');

interface MemoryEntry {
  id: string;
  category: 'error_pattern' | 'deploy_insight' | 'code_review' | 'user_feedback' | 'context' | 'skill';
  title: string;
  content: string;
  tags: string[];
  confidence: number;
  accessCount: number;
  createdAt: string;
  lastAccessedAt: string;
  projectId?: string;
  source: 'ai_analysis' | 'user_confirmed' | 'system' | 'skill_execution';
}

async function ensureMemoryDir() {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
}

async function readMemoryDb(): Promise<MemoryEntry[]> {
  try {
    const raw = await fs.readFile(MEMORY_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeMemoryDb(entries: MemoryEntry[]) {
  await ensureMemoryDir();
  await fs.writeFile(MEMORY_DB_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}



export async function agentMemoryRoutes(app: FastifyInstance) {

  // ─── List memory entries ──────────────────────────────────────────────────
  app.get('/agent/memory', async (request) => {
    const { category, search, limit } = request.query as { category?: string; search?: string; limit?: string };
    let entries = await readMemoryDb();

    if (category) entries = entries.filter(e => e.category === category);
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by access count desc
    entries.sort((a, b) => b.accessCount - a.accessCount);
    const maxItems = parseInt(limit || '50', 10);

    return { data: entries.slice(0, maxItems), total: entries.length };
  });

  // ─── Get single memory entry ──────────────────────────────────────────────
  app.get('/agent/memory/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const entries = await readMemoryDb();
    const entry = entries.find(e => e.id === id);
    if (!entry) return reply.code(404).send({ error: 'Memory entry not found' });

    // Increment access count
    entry.accessCount++;
    entry.lastAccessedAt = new Date().toISOString();
    await writeMemoryDb(entries);

    return { data: entry };
  });

  // ─── Create memory entry ──────────────────────────────────────────────────
  const createMemorySchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    category: z.enum(['error_pattern', 'deploy_insight', 'code_review', 'user_feedback', 'context', 'skill']).default('context'),
    tags: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(100).default(80),
    projectId: z.string().optional(),
    source: z.enum(['ai_analysis', 'user_confirmed', 'system', 'skill_execution']).default('user_confirmed'),
  });

  app.post('/agent/memory', async (request, reply) => {
    const parsed = createMemorySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });

    const entries = await readMemoryDb();

    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      category: parsed.data.category,
      title: parsed.data.title,
      content: parsed.data.content,
      tags: parsed.data.tags,
      confidence: parsed.data.confidence,
      accessCount: 0,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      projectId: parsed.data.projectId,
      source: parsed.data.source,
    };

    entries.unshift(entry);
    await writeMemoryDb(entries);

    // Also write to .md file for agent context
    const mdContent = `# ${entry.title}\n\n**Category:** ${entry.category}  \n**Tags:** ${entry.tags.join(', ')}  \n**Confidence:** ${entry.confidence}%  \n**Created:** ${entry.createdAt}\n\n${entry.content}\n`;
    const filename = entry.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50) + '.md';
    await fs.writeFile(path.join(MEMORY_DIR, filename), mdContent, 'utf-8').catch(() => {});

    return reply.code(201).send({ data: entry });
  });

  // ─── Update memory entry ──────────────────────────────────────────────────
  const updateMemorySchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    category: z.enum(['error_pattern', 'deploy_insight', 'code_review', 'user_feedback', 'context', 'skill']).optional(),
    tags: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(100).optional(),
    projectId: z.string().optional(),
    source: z.enum(['ai_analysis', 'user_confirmed', 'system', 'skill_execution']).optional(),
  });

  app.patch('/agent/memory/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateMemorySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const entries = await readMemoryDb();
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) return reply.code(404).send({ error: 'Not found' });

    entries[idx] = { ...entries[idx], ...parsed.data, id, lastAccessedAt: new Date().toISOString() };
    await writeMemoryDb(entries);
    return { data: entries[idx] };
  });

  // PUT /agent/memory/:id — Update memory quality score (per API spec alias)
  app.put('/agent/memory/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateMemorySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const entries = await readMemoryDb();
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) return reply.code(404).send({ error: 'Not found' });

    entries[idx] = { ...entries[idx], ...parsed.data, id, lastAccessedAt: new Date().toISOString() };
    await writeMemoryDb(entries);
    return { data: entries[idx] };
  });

  // ─── Delete memory entry ──────────────────────────────────────────────────
  app.delete('/agent/memory/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const entries = await readMemoryDb();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length === entries.length) return reply.code(404).send({ error: 'Not found' });
    await writeMemoryDb(filtered);
    return { success: true };
  });

  // ─── Memory stats ─────────────────────────────────────────────────────────
  app.get('/agent/memory/stats', async () => {
    const entries = await readMemoryDb();
    const cats = entries.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalAccess = entries.reduce((s, e) => s + e.accessCount, 0);
    const avgConfidence = entries.length ? Math.round(entries.reduce((s, e) => s + e.confidence, 0) / entries.length) : 0;
    return { data: { total: entries.length, byCategory: cats, totalAccesses: totalAccess, avgConfidence } };
  });

  // ─── Consolidate memories ─────────────────────────────────────────────────
  app.post('/agent/memory/consolidate', async () => {
    const entries = await readMemoryDb();
    const before = entries.length;

    // Merge duplicates by title similarity and remove low-confidence stale entries
    const seen = new Map<string, number>();
    const consolidated: MemoryEntry[] = [];

    for (const entry of entries) {
      const key = entry.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
      if (seen.has(key)) {
        // Merge into existing: keep highest confidence, combine content
        const existingIdx = seen.get(key)!;
        const existing = consolidated[existingIdx];
        if (entry.confidence > existing.confidence) {
          consolidated[existingIdx] = {
            ...existing,
            content: existing.content + '\n\n---\n\n' + entry.content,
            confidence: entry.confidence,
            accessCount: existing.accessCount + entry.accessCount,
            tags: [...new Set([...existing.tags, ...entry.tags])],
          };
        }
      } else {
        // Remove stale low-confidence entries (< 30 confidence, older than 30 days)
        const age = Date.now() - new Date(entry.createdAt).getTime();
        if (entry.confidence < 30 && age > 30 * 86400000) continue;

        seen.set(key, consolidated.length);
        consolidated.push(entry);
      }
    }

    await writeMemoryDb(consolidated);
    const after = consolidated.length;
    const removed = before - after;

    return {
      data: {
        before,
        after,
        removed,
        merged: before - after - removed,
        message: `Consolidated ${before} → ${after} memories (${removed} removed)`,
      },
    };
  });
}
