import { FastifyInstance, FastifyRequest } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';

// ─── Project Registry ────────────────────────────────────────────────────────
// Registered projects that Cortexo's AI can reference during Q&A sessions.
// Each project maps to a local filesystem path with metadata.
interface ProjectSource {
  id: string;
  name: string;
  path: string;
  description: string;
  stack: string[];
  modules: ProjectModule[];
  fileCount?: number;
  lastScanned?: string;
}

interface ProjectModule {
  name: string;
  path: string;
  description: string;
  files: string[];
}

interface ProjectFileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
}

// ─── Winbull Staging Project Definition ──────────────────────────────────────
const WINBULL_STAGING_PATH = '/run/media/lmx/LMX/Winbull/Personal/Devops/Project/winbullstaging';

const REGISTERED_PROJECTS: ProjectSource[] = [
  {
    id: 'winbull-staging',
    name: 'Winbull Staging',
    path: WINBULL_STAGING_PATH,
    description: 'White-label bullion trading platform (staging environment). CodeIgniter 3 + Lumen 8 + Socket.IO + MySQL on AWS.',
    stack: ['PHP 7.4', 'CodeIgniter 3', 'Lumen 8', 'MySQL (RDS)', 'Redis (ElastiCache)', 'Socket.IO', 'Node.js'],
    modules: [
      {
        name: 'Web Frontend',
        path: 'application',
        description: 'CodeIgniter MVC — controllers, models, views for customer-facing trading terminal',
        files: [],
      },
      {
        name: 'Admin Panel',
        path: 'admin/application',
        description: 'Admin dashboard for managing clients, commodities, bookings, KYC, and rate panels',
        files: [],
      },
      {
        name: 'Mobile API',
        path: 'mobileapi/application',
        description: 'REST API for Flutter/Android mobile trading app',
        files: [],
      },
      {
        name: 'Lumen Engine',
        path: 'lmxtrade/winbullliteapi',
        description: 'Lumen 8 microservice for rate broadcasting, trade execution, and socket events',
        files: [],
      },
      {
        name: 'Socket Layer',
        path: 'lmxtrade',
        description: 'Socket.IO server for real-time rate updates via Redis pub/sub',
        files: [],
      },
      {
        name: 'Configuration',
        path: '',
        description: 'Global configs, database credentials, socket URLs, API endpoints',
        files: ['global_configs.php', 'index.php', '.htaccess'],
      },
    ],
  },
];

// ─── File System Utilities ───────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
  '.php', '.js', '.ts', '.json', '.env', '.md', '.txt', '.html', '.css',
  '.xml', '.yml', '.yaml', '.sh', '.conf', '.htaccess', '.gitignore', '.log',
]);

const SKIP_DIRS = new Set([
  'node_modules', 'vendor', '.git', 'storage', 'cache', 'logs',
  '.idea', '.vscode', '__pycache__',
]);

async function scanDirectory(dirPath: string, depth = 0, maxDepth = 2): Promise<ProjectFileEntry[]> {
  const entries: ProjectFileEntry[] = [];
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
      if (SKIP_DIRS.has(item.name)) continue;

      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        entries.push({ name: item.name, path: fullPath, type: 'directory' });
        if (depth < maxDepth) {
          const children = await scanDirectory(fullPath, depth + 1, maxDepth);
          entries.push(...children);
        }
      } else {
        const ext = path.extname(item.name).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(ext) || item.name.startsWith('.')) {
          try {
            const stat = await fs.stat(fullPath);
            entries.push({ name: item.name, path: fullPath, type: 'file', size: stat.size, extension: ext });
          } catch {
            entries.push({ name: item.name, path: fullPath, type: 'file', extension: ext });
          }
        }
      }
    }
  } catch (err: any) {
    console.error(`[ProjectKnowledge] Scan error at ${dirPath}: ${err.message}`);
  }
  return entries;
}

async function readFileContent(filePath: string, maxBytes = 50_000): Promise<string> {
  try {
    const stat = await fs.stat(filePath);
    if (stat.size > maxBytes) {
      const buffer = Buffer.alloc(maxBytes);
      const fd = await fs.open(filePath, 'r');
      await fd.read(buffer, 0, maxBytes, 0);
      await fd.close();
      return buffer.toString('utf-8') + `\n\n... [truncated at ${maxBytes} bytes, total: ${stat.size}]`;
    }
    return await fs.readFile(filePath, 'utf-8');
  } catch (err: any) {
    throw new Error(`Cannot read file: ${err.message}`);
  }
}

// ─── Build Project Context for RAG ───────────────────────────────────────────
async function buildProjectContext(projectId: string): Promise<string> {
  const project = REGISTERED_PROJECTS.find(p => p.id === projectId);
  if (!project) return '';

  let context = `\n\n--- PROJECT KNOWLEDGE: ${project.name} ---\n`;
  context += `📂 Path: ${project.path}\n`;
  context += `🛠 Stack: ${project.stack.join(', ')}\n`;
  context += `📝 ${project.description}\n\n`;

  // Read global_configs.php for key configuration data
  try {
    const configContent = await readFileContent(path.join(project.path, 'global_configs.php'), 10_000);
    context += `### Configuration (global_configs.php)\n${configContent}\n\n`;
  } catch { /* skip */ }

  // Read Lumen routes for API endpoints
  try {
    const routesContent = await readFileContent(path.join(project.path, 'lmxtrade/winbullliteapi/routes/web.php'), 10_000);
    context += `### Lumen API Routes\n${routesContent}\n\n`;
  } catch { /* skip */ }

  // Read socket server for real-time architecture
  try {
    const socketContent = await readFileContent(path.join(project.path, 'lmxtrade/winbullstagingsocket.js'), 5_000);
    context += `### Socket Server\n${socketContent}\n\n`;
  } catch { /* skip */ }

  // List controllers for architecture overview
  try {
    const webControllers = await fs.readdir(path.join(project.path, 'application/controllers'));
    const adminControllers = await fs.readdir(path.join(project.path, 'admin/application/controllers'));
    const mobileControllers = await fs.readdir(path.join(project.path, 'mobileapi/application/controllers'));

    context += `### Web Controllers: ${webControllers.filter(f => f.endsWith('.php')).join(', ')}\n`;
    context += `### Admin Controllers (${adminControllers.filter(f => f.endsWith('.php')).length} total): ${adminControllers.filter(f => f.endsWith('.php')).slice(0, 15).join(', ')}...\n`;
    context += `### Mobile API Controllers: ${mobileControllers.filter(f => f.endsWith('.php')).join(', ')}\n`;
  } catch { /* skip */ }

  // List models
  try {
    const models = await fs.readdir(path.join(project.path, 'application/models'));
    context += `### Models: ${models.filter(f => f.endsWith('.php')).join(', ')}\n`;
  } catch { /* skip */ }

  // List views
  try {
    const views = await fs.readdir(path.join(project.path, 'application/views'));
    context += `### Views: ${views.filter(f => f.endsWith('.php')).join(', ')}\n`;
  } catch { /* skip */ }

  context += `\n--- END PROJECT KNOWLEDGE ---\n`;
  return context;
}

// ─── Cache for project context (rebuilt every 5 minutes max) ──────────────────
let cachedContext: Record<string, { context: string; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getProjectContext(projectId: string): Promise<string> {
  const now = Date.now();
  const cached = cachedContext[projectId];
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.context;
  }
  const context = await buildProjectContext(projectId);
  cachedContext[projectId] = { context, timestamp: now };
  return context;
}

// ─── Routes ──────────────────────────────────────────────────────────────────
export async function projectKnowledgeRoutes(app: FastifyInstance) {

  // ─── GET /project-knowledge/projects — List registered projects ───────
  app.get('/project-knowledge/projects', async () => {
    const projects = await Promise.all(
      REGISTERED_PROJECTS.map(async (p) => {
        let fileCount = 0;
        let accessible = false;
        try {
          await fs.access(p.path);
          accessible = true;
          const files = await scanDirectory(p.path, 0, 1);
          fileCount = files.filter(f => f.type === 'file').length;
        } catch { /* path not accessible */ }

        return {
          id: p.id,
          name: p.name,
          path: p.path,
          description: p.description,
          stack: p.stack,
          modules: p.modules.map(m => ({ name: m.name, path: m.path, description: m.description })),
          fileCount,
          accessible,
          lastScanned: new Date().toISOString(),
        };
      })
    );
    return { data: projects };
  });

  // ─── GET /project-knowledge/browse — Browse project files ─────────────
  app.get(
    '/project-knowledge/browse',
    async (request: FastifyRequest<{ Querystring: { projectId?: string; dir?: string } }>) => {
      const { projectId = 'winbull-staging', dir } = request.query;
      const project = REGISTERED_PROJECTS.find(p => p.id === projectId);
      if (!project) return { error: 'Project not found', data: [] };

      const targetDir = dir
        ? path.resolve(project.path, dir)
        : project.path;

      // Security: ensure resolved path stays within project root
      if (!targetDir.startsWith(project.path)) {
        return { error: 'Access denied: path traversal detected', data: [] };
      }

      try {
        const items = await fs.readdir(targetDir, { withFileTypes: true });
        const entries: ProjectFileEntry[] = [];

        for (const item of items) {
          if (SKIP_DIRS.has(item.name)) continue;
          const fullPath = path.join(targetDir, item.name);
          const relativePath = path.relative(project.path, fullPath);

          if (item.isDirectory()) {
            entries.push({ name: item.name, path: relativePath, type: 'directory' });
          } else {
            try {
              const stat = await fs.stat(fullPath);
              entries.push({
                name: item.name,
                path: relativePath,
                type: 'file',
                size: stat.size,
                extension: path.extname(item.name).toLowerCase(),
              });
            } catch {
              entries.push({
                name: item.name,
                path: relativePath,
                type: 'file',
                extension: path.extname(item.name).toLowerCase(),
              });
            }
          }
        }

        // Sort: directories first, then files alphabetically
        entries.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        return {
          data: entries,
          currentDir: dir || '',
          projectId,
          projectName: project.name,
        };
      } catch (err: any) {
        return { error: `Cannot browse: ${err.message}`, data: [] };
      }
    },
  );

  // ─── GET /project-knowledge/read — Read a specific file ───────────────
  app.get(
    '/project-knowledge/read',
    async (request: FastifyRequest<{ Querystring: { projectId?: string; file: string } }>, reply) => {
      const { projectId = 'winbull-staging', file } = request.query;
      if (!file) return reply.code(400).send({ error: 'file parameter required' });

      const project = REGISTERED_PROJECTS.find(p => p.id === projectId);
      if (!project) return reply.code(404).send({ error: 'Project not found' });

      const fullPath = path.resolve(project.path, file);
      if (!fullPath.startsWith(project.path)) {
        return reply.code(403).send({ error: 'Access denied: path traversal detected' });
      }

      const ext = path.extname(file).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext) && !file.startsWith('.')) {
        return reply.code(400).send({ error: `File type ${ext} not readable` });
      }

      try {
        const content = await readFileContent(fullPath);
        const stat = await fs.stat(fullPath);
        return {
          data: {
            name: path.basename(file),
            path: file,
            content,
            size: stat.size,
            extension: ext,
            language: getLanguage(ext),
            lastModified: stat.mtime.toISOString(),
          },
        };
      } catch (err: any) {
        return reply.code(404).send({ error: err.message });
      }
    },
  );

  // ─── GET /project-knowledge/context — Get project context for AI ──────
  app.get(
    '/project-knowledge/context',
    async (request: FastifyRequest<{ Querystring: { projectId?: string } }>) => {
      const { projectId = 'winbull-staging' } = request.query;
      const context = await getProjectContext(projectId);
      return {
        data: {
          projectId,
          contextLength: context.length,
          contextPreview: context.substring(0, 500) + '...',
          cached: !!cachedContext[projectId],
        },
      };
    },
  );

  // ─── POST /project-knowledge/ask — Ask AI with project context ────────
  // This endpoint wraps the existing knowledge/ask but injects project context
  app.post(
    '/project-knowledge/ask',
    async (request: FastifyRequest<{ Body: { question: string; projectId?: string; provider?: string; fileContext?: string } }>) => {
      const body = request.body as { question: string; projectId?: string; provider?: string; fileContext?: string };
      const { question, projectId = 'winbull-staging', provider, fileContext } = body;

      if (!question) return { error: 'question is required' };

      // Build enriched context from the project
      const projectContext = await getProjectContext(projectId);
      const project = REGISTERED_PROJECTS.find(p => p.id === projectId);

      // If fileContext is provided, read the specific file too
      let additionalContext = '';
      if (fileContext && project) {
        try {
          const fullPath = path.resolve(project.path, fileContext);
          if (fullPath.startsWith(project.path)) {
            const content = await readFileContent(fullPath, 20_000);
            additionalContext = `\n\n--- CURRENTLY VIEWING: ${fileContext} ---\n${content}\n--- END FILE ---\n`;
          }
        } catch { /* skip */ }
      }

      // Forward to the knowledge/ask endpoint internally with enriched context
      // Instead of HTTP call, we inject the context directly into the question
      const enrichedQuestion = `[Project Context: ${project?.name || projectId}]\n\n${question}\n${additionalContext}`;

      try {
        // Strip Content-Length from forwarded headers — the enriched payload
        // is larger than the original request body, so the original
        // Content-Length would cause "body size did not match" errors.
        const { 'content-length': _cl, 'transfer-encoding': _te, ...safeHeaders } = request.headers as Record<string, string>;
        const res = await app.inject({
          method: 'POST',
          url: '/v1/knowledge/ask',
          payload: {
            question: enrichedQuestion,
            provider,
          },
          headers: safeHeaders,
        });

        const result = JSON.parse(res.payload);
        return result;
      } catch (err: any) {
        return { error: `AI query failed: ${err.message}` };
      }
    },
  );

  // ─── GET /project-knowledge/summary — Quick project summary ───────────
  app.get(
    '/project-knowledge/summary',
    async (request: FastifyRequest<{ Querystring: { projectId?: string } }>) => {
      const { projectId = 'winbull-staging' } = request.query;
      const project = REGISTERED_PROJECTS.find(p => p.id === projectId);
      if (!project) return { error: 'Project not found' };

      const stats: Record<string, number> = {};
      for (const mod of project.modules) {
        const modPath = mod.path ? path.join(project.path, mod.path) : project.path;
        try {
          const files = await scanDirectory(modPath, 0, 2);
          stats[mod.name] = files.filter(f => f.type === 'file').length;
        } catch {
          stats[mod.name] = 0;
        }
      }

      return {
        data: {
          id: project.id,
          name: project.name,
          description: project.description,
          stack: project.stack,
          modules: project.modules.map(m => ({
            name: m.name,
            description: m.description,
            fileCount: stats[m.name] || 0,
          })),
          totalFiles: Object.values(stats).reduce((a, b) => a + b, 0),
        },
      };
    },
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLanguage(ext: string): string {
  const map: Record<string, string> = {
    '.php': 'php', '.js': 'javascript', '.ts': 'typescript', '.json': 'json',
    '.md': 'markdown', '.html': 'html', '.css': 'css', '.xml': 'xml',
    '.yml': 'yaml', '.yaml': 'yaml', '.sh': 'bash', '.env': 'env',
    '.conf': 'nginx', '.sql': 'sql', '.log': 'log',
  };
  return map[ext] || 'text';
}
