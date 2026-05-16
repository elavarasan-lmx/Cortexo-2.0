/**
 * API Keys Management — /v1/api-keys
 * Create, list, and revoke programmatic API keys for SDK/CI access.
 * Keys are stored in the .vault directory alongside credentials.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const VAULT_DIR = path.resolve(process.env.VAULT_DIR || '.vault');
const KEYS_FILE = path.join(VAULT_DIR, 'api-keys.json');

interface ApiKey {
  id: string;
  name: string;
  prefix: string;      // First 8 chars for display
  hashedKey: string;    // SHA-256 hash (the plain key is only shown once)
  expiresAt: string | null;
  createdAt: string;
  lastUsed: string | null;
}

async function readKeys(): Promise<ApiKey[]> {
  try {
    const raw = await fs.readFile(KEYS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeKeys(keys: ApiKey[]) {
  await fs.mkdir(VAULT_DIR, { recursive: true });
  await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
}

function generateApiKey(): string {
  // Format: ctx_<random 40 hex chars>
  return `ctx_${crypto.randomBytes(20).toString('hex')}`;
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function apiKeyRoutes(app: FastifyInstance) {
  // ─── GET /api-keys — List all API keys (no secrets exposed) ─────────
  app.get('/api-keys', async () => {
    const keys = await readKeys();
    return {
      keys: keys.map(k => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        expiresAt: k.expiresAt,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
      })),
    };
  });

  // ─── POST /api-keys — Create a new API key ──────────────────────────
  const createSchema = z.object({
    name: z.string().min(1).max(100),
    expiresInDays: z.number().int().min(0).max(3650).default(90),
  });

  app.post('/api-keys', async (request, reply) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { name, expiresInDays } = parsed.data;
    const plainKey = generateApiKey();
    const now = new Date();

    const entry: ApiKey = {
      id: crypto.randomUUID(),
      name,
      prefix: plainKey.slice(0, 12),
      hashedKey: hashKey(plainKey),
      expiresAt: expiresInDays > 0
        ? new Date(now.getTime() + expiresInDays * 86400000).toISOString()
        : null,
      createdAt: now.toISOString(),
      lastUsed: null,
    };

    const keys = await readKeys();
    keys.push(entry);
    await writeKeys(keys);

    // Return the plain key ONCE — client must copy it
    return {
      id: entry.id,
      name: entry.name,
      key: plainKey,
      prefix: entry.prefix,
      expiresAt: entry.expiresAt,
      createdAt: entry.createdAt,
    };
  });

  // ─── DELETE /api-keys/:id — Revoke an API key ───────────────────────
  app.delete('/api-keys/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const keys = await readKeys();
    const filtered = keys.filter(k => k.id !== id);
    if (filtered.length === keys.length) {
      return reply.code(404).send({ error: 'API key not found' });
    }
    await writeKeys(filtered);
    return { success: true };
  });
}
