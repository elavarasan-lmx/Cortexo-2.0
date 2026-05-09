import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../lib/db.js';
import { knowledgeDocs, qaHistory } from '@cortexo/db/schema';
import { eq, desc, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// ─── Multi-Provider AI Engine (Gemini → Groq → OpenAI) ─────────────
import { promises as fsPromises } from 'fs';
import path from 'path';
import crypto from 'crypto';

type AIProvider = 'gemini' | 'groq' | 'openai';

let defaultProvider: AIProvider | null = null;
let availableProviders: AIProvider[] = [];
let geminiModel: any = null;
let groqClient: any = null;
let openaiKey: string = '';
let aiInitDone = false;

const VAULT_DIR = path.resolve(process.env.VAULT_DIR || '.vault');
const VAULT_FILE = path.join(VAULT_DIR, 'credentials.enc.json');
const ENCRYPTION_KEY = process.env.VAULT_KEY || 'cortexo-vault-default-key-32ch';

function decryptVaultValue(text: string): string {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function getVaultKey(keyName: string): Promise<string> {
  try {
    const raw = await fsPromises.readFile(VAULT_FILE, 'utf-8');
    const creds = JSON.parse(raw);
    const cred = creds.find((c: any) => c.key === keyName);
    if (cred) return decryptVaultValue(cred.value);
  } catch { /* vault not found */ }
  return '';
}

async function initAI() {
  if (aiInitDone) return;
  aiInitDone = true;
  availableProviders = [];

  // Initialize ALL providers that have keys (not just first)
  const geminiKey = (await getVaultKey('GEMINI_API_KEY')) || process.env.GEMINI_API_KEY || '';
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      availableProviders.push('gemini');
      console.log('[Knowledge] ✅ Gemini 2.5 Flash ready');
    } catch (e: any) { console.log(`[Knowledge] ⚠️ Gemini init failed: ${e.message}`); }
  }

  const groqKey = (await getVaultKey('GROQ_API_KEY')) || process.env.GROQ_API_KEY || '';
  if (groqKey) {
    try {
      groqClient = new Groq({ apiKey: groqKey });
      availableProviders.push('groq');
      console.log('[Knowledge] ✅ Groq (Llama 3.3 70B) ready');
    } catch (e: any) { console.log(`[Knowledge] ⚠️ Groq init failed: ${e.message}`); }
  }

  const openAIKey = (await getVaultKey('OPENAI_API_KEY')) || process.env.OPENAI_API_KEY || '';
  if (openAIKey) {
    openaiKey = openAIKey;
    availableProviders.push('openai');
    console.log('[Knowledge] ✅ OpenAI ready');
  }

  // Default = first available by priority
  defaultProvider = availableProviders[0] || null;
  if (defaultProvider) {
    console.log(`[Knowledge] 🎯 Default provider: ${defaultProvider} (${availableProviders.length} total)`);
  } else {
    console.log('[Knowledge] ⚠️ No AI keys found — add one in Settings → Credentials');
  }
}

/** Unified AI ask function — routes to whichever provider is active */
async function askAI(question: string, systemPrompt: string, provider?: AIProvider): Promise<string> {
  const useProvider = provider || defaultProvider;
  if (!useProvider) throw new Error('No AI provider configured');

  if (useProvider === 'gemini' && geminiModel) {
    const chat = geminiModel.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood! I\'m ready to help as Cortexo\'s Knowledge Base Assistant.' }] },
      ],
    });
    const result = await chat.sendMessage(question);
    return result.response.text();
  }

  if (useProvider === 'groq' && groqClient) {
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.7,
      max_completion_tokens: 1024,
    });
    return completion.choices[0]?.message?.content || '';
  }

  if (useProvider === 'openai' && openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    const data = await res.json() as any;
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || '';
  }

  throw new Error('AI provider not available');
}

// ─── System Prompt — Cortexo Context ────────────────────────────────
const SYSTEM_PROMPT = `You are Cortexo's intelligent Knowledge Base Assistant. You help DevOps engineers manage their infrastructure through the Cortexo dashboard.

## About Cortexo
Cortexo is an internal DevOps management platform built for managing multi-tenant client deployments. It handles:

### Architecture
- **Backend:** Fastify (Node.js) API on port 4000
- **Frontend:** Next.js 14 (React, App Router) on port 3000
- **Database:** PostgreSQL with Drizzle ORM
- **Queue:** BullMQ + Redis for background jobs
- **Monorepo:** Turborepo — apps/api, apps/web, packages/db

### Key Features
1. **Server Management** — Register SSH servers with credentials, manage connections
2. **Server Mounts (SSHFS)** — Mount remote file systems locally for browsing
   - Read-Only mode using \`-o ro\` flag (OS-level enforcement)
   - File Browser — browse directories and read files on remote servers
   - Audit Trail — logs every file browse/read with user, action, timestamp
3. **Deployments** — 3-step wizard (select profile → review → execute)
   - Database cloning from source (winbullSource)
   - Data truncation for client isolation
   - Nginx config auto-generation
4. **Deploy Profiles** — Templates with server, database, and Nginx presets
5. **Projects** — Git repository tracking with stack detection
6. **Pipelines** — CI/CD pipeline management
7. **Bug Tracker** — Issue tracking with priority/status workflow
8. **Knowledge Base** — This AI Q&A + documentation system
9. **Settings** — Modules management, deploy profiles

### Key Paths
- Dashboard: /dashboard
- Projects: /projects
- Deployments: /deployments
- Servers: /servers, Mounts: /servers/mounts
- Pipelines: /pipelines
- Bug Tracker: /bug-tracker
- Knowledge Base: /knowledge-base
- Settings: /settings

### Database Tables
servers, server_mounts, deployments, deploy_profiles, projects, pipelines, bugs, audit_logs, knowledge_docs, qa_history, users, notifications

### Security
- SSHFS mounts support read-only toggle (remounts with -o ro flag)
- Audit logging for all file access events
- JWT-based authentication

## Rules
- Answer concisely but comprehensively
- Use markdown formatting (bold, lists, code blocks)
- Include relevant page paths and API endpoints when helpful
- If you don't know something specific, say so honestly
- Keep responses focused on Cortexo and DevOps topics
- Use emojis sparingly for visual clarity
- If asked about unrelated topics, politely redirect to Cortexo features`;

/**
 * Knowledge Base & Q&A Engine Routes — Sprint 7 (F36)
 */
export async function knowledgeRoutes(app: FastifyInstance) {
  await initAI();
  const db = await getDb();

  // ─── GET /knowledge/docs — Search/list docs ─────────────────────────
  app.get(
    '/knowledge/docs',
    async (request: FastifyRequest<{ Querystring: { q?: string; category?: string } }>) => {
      const { q, category } = request.query;

      // Seed default docs on first load
      const existing = await db.select({ id: knowledgeDocs.id }).from(knowledgeDocs).limit(1);
      if (existing.length === 0) {
        await db.insert(knowledgeDocs).values([
          { title: 'System Architecture', content: 'Monorepo: apps/api (Fastify port 4000) + apps/web (Next.js port 3000) + packages/db (Drizzle ORM). Queue: BullMQ + Redis.', category: 'architecture', tags: ['fastify', 'next.js', 'postgres', 'drizzle'] },
          { title: 'Server Management', content: 'Register SSH servers at Servers page. Each server stores host, port, username, SSH key. Test connectivity before use.', category: 'infrastructure', tags: ['ssh', 'servers'] },
          { title: 'SSHFS Mounts & File Browser', content: 'Mount remote dirs via SSHFS. Supports read-only mode (-o ro). Built-in file browser. All access logged to audit_logs.', category: 'security', tags: ['sshfs', 'readonly', 'audit'] },
          { title: 'Deployment Wizard', content: '3-step wizard: 1) Select server+project 2) Configure DB (clone/truncate) 3) Generate Nginx+PM2 config. Live command preview at each step.', category: 'deployment', tags: ['wizard', 'deploy', 'nginx', 'pm2'] },
          { title: 'Deploy Profiles', content: 'Reusable templates for deployments: server target, DB source, Nginx domain, PM2 config. One-click deploy per client.', category: 'deployment', tags: ['profiles', 'templates'] },
          { title: 'CI/CD Pipelines', content: 'Configure at Pipelines page. Define: Git repo, branch, build commands, target server. Trigger manually or via webhook.', category: 'infrastructure', tags: ['ci-cd', 'pipelines', 'git'] },
          { title: 'Audit Trail System', content: 'Immutable logs in audit_logs table: user ID, action (read/write/delete), file path, timestamp, IP address.', category: 'security', tags: ['audit', 'logging', 'compliance'] },
          { title: 'Credentials Vault', content: 'AES-256-CBC encrypted key storage. Providers: GitHub, OpenAI, Gemini, Groq, AWS, Docker, Slack, Email. Settings → Credentials.', category: 'security', tags: ['credentials', 'vault', 'encryption'] },
          { title: 'Knowledge Base AI', content: 'AI powered by Gemini/Groq/OpenAI (priority order). RAG-enabled: reads your docs for context. Keys via Credentials Vault.', category: 'architecture', tags: ['ai', 'gemini', 'groq', 'rag'] },
          { title: 'Database Tables', content: 'Tables: servers, projects, deployments, pipelines, deploy_profiles, knowledge_docs, qa_history, audit_logs, notifications, users. UUID PKs.', category: 'architecture', tags: ['database', 'schema'] },
          { title: 'Troubleshooting: Ports', content: 'API: 4000, Web: 3000, Redis: 6379, Postgres: 5432. Kill port: lsof -ti :4000 | xargs kill', category: 'troubleshooting', tags: ['ports', 'debugging'] },
          { title: 'Troubleshooting: Deploys', content: '1) SSH key perms (chmod 600) 2) Missing target dir (mkdir -p) 3) PM2 not installed 4) DB refused. Check deploy logs.', category: 'troubleshooting', tags: ['deploy', 'debugging'] },
        ]);
      }

      let query = db.select().from(knowledgeDocs).$dynamic();
      if (q) { query = query.where(ilike(knowledgeDocs.title, `%${q}%`)); }
      const docs = await query.orderBy(desc(knowledgeDocs.createdAt));
      return { data: docs };
    },
  );

  // ─── POST /knowledge/docs — Create a new doc ────────────────────────
  const docSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    category: z.string().default('general'),
    tags: z.array(z.string()).default([]),
    sourceUrl: z.string().optional(),
  });

  app.post('/knowledge/docs', async (request: FastifyRequest) => {
    const data = docSchema.parse(request.body);
    const [doc] = await db.insert(knowledgeDocs).values(data).returning();
    return { data: doc, message: 'Document created' };
  });

  // ─── PUT /knowledge/docs/:id — Update a doc ────────────────────────
  app.put('/knowledge/docs/:id', async (request: FastifyRequest, reply) => {
    const { id } = request.params as { id: string };
    const updates = docSchema.partial().parse(request.body);
    const [doc] = await db.update(knowledgeDocs).set({ ...updates, updatedAt: new Date() }).where(eq(knowledgeDocs.id, id)).returning();
    if (!doc) return reply.code(404).send({ error: 'Not found' });
    return { data: doc, message: 'Document updated' };
  });

  // ─── DELETE /knowledge/docs/:id — Delete a doc ──────────────────────
  app.delete('/knowledge/docs/:id', async (request: FastifyRequest, reply) => {
    const { id } = request.params as { id: string };
    const [doc] = await db.delete(knowledgeDocs).where(eq(knowledgeDocs.id, id)).returning();
    if (!doc) return reply.code(404).send({ error: 'Not found' });
    return { success: true };
  });

  // ─── GET /knowledge/providers — List available AI providers ─────────
  app.get('/knowledge/providers', async () => {
    return {
      data: {
        available: availableProviders.map(p => ({
          id: p,
          name: p === 'gemini' ? 'Gemini 2.5 Flash' : p === 'groq' ? 'Groq (Llama 3.3 70B)' : 'OpenAI (GPT-4o mini)',
          free: p !== 'openai',
        })),
        default: defaultProvider,
      },
    };
  });

  // ─── POST /knowledge/ask — Ask AI a question ────────────────────────
  const askSchema = z.object({
    question: z.string().min(1),
    provider: z.enum(['gemini', 'groq', 'openai']).optional(),
  });

  app.post('/knowledge/ask', async (request: FastifyRequest) => {
    const { question, provider: requestedProvider } = askSchema.parse(request.body);
    const chosenProvider = requestedProvider && availableProviders.includes(requestedProvider) ? requestedProvider : defaultProvider;
    let answer = '';
    const sources: string[] = [];

    // ── RAG: Find relevant docs to inject as context ──
    let ragContext = '';
    try {
      const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const allDocs = await db.select().from(knowledgeDocs);
      const relevant = allDocs.filter(doc => {
        const txt = `${doc.title} ${doc.content} ${(doc.tags || []).join(' ')}`.toLowerCase();
        return keywords.some(kw => txt.includes(kw));
      }).slice(0, 5);
      if (relevant.length > 0) {
        ragContext = '\n\n--- RELEVANT DOCS ---\n' + relevant.map(d => `📄 ${d.title}: ${d.content}`).join('\n') + '\n--- END ---';
        relevant.forEach(d => sources.push(d.id));
      }
    } catch { /* continue */ }

    if (chosenProvider) {
      try {
        answer = await askAI(question, SYSTEM_PROMPT + ragContext, chosenProvider);
      } catch (err: any) {
        app.log.error(`[Knowledge] ${chosenProvider} error: ${err.message}`);
        answer = `⚠️ AI (${chosenProvider}) error: ${err.message}\n\nCheck Settings → Credentials.`;
      }
    }

    if (!answer) {
      answer = `No AI configured. Check **Documentation** tab or add a key in **Settings → Credentials**.`;
    }

    const [record] = await db.insert(qaHistory).values({ question, answer, sourcesUsed: sources }).returning();
    return { data: record };
  });

  // ─── GET /knowledge/history — Get previous Q&A session logs ─────────
  app.get(
    '/knowledge/history',
    async () => {
      const history = await db
        .select()
        .from(qaHistory)
        .orderBy(desc(qaHistory.createdAt))
        .limit(20);

      return { data: history.reverse() }; // Chronological order
    },
  );
}
