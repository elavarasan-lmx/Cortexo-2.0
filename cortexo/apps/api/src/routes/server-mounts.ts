import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq } from 'drizzle-orm';
import { serverMounts } from '@cortexo/db/schema';
import { spawnSync } from 'child_process';
import { readdirSync, statSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, basename, extname, relative } from 'path';
import { homedir } from 'os';

const createMountSchema = z.object({
  serverId: z.number(),
  name: z.string().min(1).max(100),
  remotePath: z.string().min(1).max(500),
  localMountPath: z.string().min(1).max(500),
  sshUser: z.string().min(1).max(50).default('ubuntu'),
  autoMount: z.boolean().default(false),
});

const updateMountSchema = createMountSchema.partial();

/**
 * Validate that a string is safe for use in shell contexts.
 * Rejects characters that could enable command injection.
 */
function validateShellSafe(input: string, fieldName: string): void {
  const dangerous = /[;|&$`"'\\\n\r(){}\[\]<>!#~]/;
  if (dangerous.test(input)) {
    throw new Error(`Invalid characters in ${fieldName}`);
  }
}

/** Resolve ~ to home directory */
function expandHome(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return join(homedir(), p.slice(1));
  }
  return p;
}

/** Check if a path is currently mounted via SSHFS (safe — no user input in command) */
function isMounted(localPath: string): boolean {
  try {
    const result = spawnSync('mount', [], { encoding: 'utf-8', timeout: 5000 });
    return (result.stdout || '').includes(expandHome(localPath));
  } catch {
    return false;
  }
}

/** Prevent directory traversal — ensure resolved path is within the mount */
function safePath(basePath: string, requestedPath: string): string {
  const base = resolve(expandHome(basePath));
  const target = resolve(base, requestedPath);
  if (!target.startsWith(base)) {
    throw new Error('Path traversal detected');
  }
  return target;
}

/** Get file type icon hint based on extension */
function getFileType(name: string): string {
  const ext = extname(name).toLowerCase();
  const map: Record<string, string> = {
    '.php': 'php', '.js': 'javascript', '.ts': 'typescript', '.jsx': 'react',
    '.tsx': 'react', '.css': 'css', '.scss': 'scss', '.html': 'html',
    '.json': 'json', '.xml': 'xml', '.sql': 'sql', '.md': 'markdown',
    '.yml': 'yaml', '.yaml': 'yaml', '.sh': 'shell', '.py': 'python',
    '.rb': 'ruby', '.java': 'java', '.go': 'go', '.rs': 'rust',
    '.dart': 'dart', '.swift': 'swift', '.kt': 'kotlin',
    '.png': 'image', '.jpg': 'image', '.jpeg': 'image', '.gif': 'image',
    '.svg': 'image', '.webp': 'image', '.ico': 'image',
    '.pdf': 'pdf', '.zip': 'archive', '.tar': 'archive', '.gz': 'archive',
    '.env': 'config', '.gitignore': 'config', '.htaccess': 'config',
  };
  return map[ext] || 'file';
}

/**
 * Server Mounts API — /v1/server-mounts
 * SSHFS mount management: create/update/delete mount configs,
 * mount/unmount, browse directories, read files.
 */
export async function serverMountRoutes(app: FastifyInstance) {

  // ── List all mount configs ────────────────────────────────
  app.get('/server-mounts', async (_request, reply) => {
    try {
      const db = await getDb();
      const rows = await db.query.serverMounts.findMany({
        orderBy: (m, { asc }) => [asc(m.name)],
      });
      // Enrich with live status
      const enriched = rows.map(row => ({
        ...row,
        status: isMounted(row.localMountPath) ? 'mounted' : 'unmounted',
      }));
      return { data: enriched, total: enriched.length };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Get single mount ──────────────────────────────────────
  app.get('/server-mounts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      // Get server info
      const server = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, row.serverId),
      });

      return {
        data: {
          ...row,
          status: isMounted(row.localMountPath) ? 'mounted' : 'unmounted',
          server: server || null,
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Create mount config ───────────────────────────────────
  app.post('/server-mounts', async (request, reply) => {
    const parsed = createMountSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      const [result] = await db.insert(serverMounts).values(parsed.data as any);
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, (result as any).insertId),
      });
      return reply.code(201).send({ data: row });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Update mount config ───────────────────────────────────
  app.put('/server-mounts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateMountSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    try {
      const db = await getDb();
      await db.update(serverMounts)
        .set(parsed.data as any)
        .where(eq(serverMounts.id, parseInt(id)));
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });
      return { data: row };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Delete mount config ───────────────────────────────────
  app.delete('/server-mounts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      // Unmount first if mounted
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (row && isMounted(row.localMountPath)) {
        try {
          spawnSync('fusermount', ['-u', expandHome(row.localMountPath)], { timeout: 10000 });
        } catch { /* best-effort unmount */ }
      }
      const result = await db.delete(serverMounts)
        .where(eq(serverMounts.id, parseInt(id)));
      if (!(result as any)[0]?.affectedRows) return reply.code(404).send({ error: 'Mount config not found' });
      return { success: true };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Mount (execute SSHFS) ─────────────────────────────────
  app.post('/server-mounts/:id/mount', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      const server = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, row.serverId),
      });
      if (!server) return reply.code(404).send({ error: 'Associated server not found' });

      const localPath = expandHome(row.localMountPath);
      const serverIp = server.privateIp || server.publicAddress || '';
      if (!serverIp) return reply.code(400).send({ error: 'Server has no IP address configured' });

      // Already mounted?
      if (isMounted(row.localMountPath)) {
        return { data: { status: 'mounted', message: 'Already mounted' } };
      }

      // Ensure mount directory exists
      if (!existsSync(localPath)) {
        mkdirSync(localPath, { recursive: true });
      }

      // Execute SSHFS mount (using spawnSync with arg array to prevent injection)
      try {
        validateShellSafe(row.sshUser, 'sshUser');
        validateShellSafe(serverIp, 'serverIp');
        validateShellSafe(row.remotePath, 'remotePath');

        const result = spawnSync('sshfs', [
          `${row.sshUser}@${serverIp}:${row.remotePath}`,
          localPath,
          '-o', 'reconnect,ServerAliveInterval=15,ServerAliveCountMax=3,cache=yes,kernel_cache,auto_cache,compression=no,StrictHostKeyChecking=no',
        ], { timeout: 30000, encoding: 'utf-8' });

        if (result.status !== 0) {
          throw { stderr: result.stderr, message: result.stderr || 'sshfs failed' };
        }
      } catch (execErr: any) {
        // Update status to error
        await db.update(serverMounts)
          .set({ status: 'error' } as any)
          .where(eq(serverMounts.id, parseInt(id)));
        return reply.code(500).send({
          error: 'Mount failed',
          details: execErr.stderr || execErr.message,
        });
      }

      // Update status
      await db.update(serverMounts)
        .set({ status: 'mounted', lastMountedAt: new Date() } as any)
        .where(eq(serverMounts.id, parseInt(id)));

      return { data: { status: 'mounted', message: `Mounted at ${localPath}` } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Mount operation failed' });
    }
  });

  // ── Unmount ───────────────────────────────────────────────
  app.post('/server-mounts/:id/unmount', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      const localPath = expandHome(row.localMountPath);

      if (!isMounted(row.localMountPath)) {
        await db.update(serverMounts)
          .set({ status: 'unmounted' } as any)
          .where(eq(serverMounts.id, parseInt(id)));
        return { data: { status: 'unmounted', message: 'Not mounted' } };
      }

      try {
        const unmount = spawnSync('fusermount', ['-u', localPath], { timeout: 10000, encoding: 'utf-8' });
        if (unmount.status !== 0) throw { stderr: unmount.stderr, message: unmount.stderr };
      } catch (execErr: any) {
        // Try lazy unmount
        try {
          spawnSync('fusermount', ['-uz', localPath], { timeout: 10000, encoding: 'utf-8' });
        } catch {
          return reply.code(500).send({
            error: 'Unmount failed',
            details: execErr.stderr || execErr.message,
          });
        }
      }

      await db.update(serverMounts)
        .set({ status: 'unmounted' } as any)
        .where(eq(serverMounts.id, parseInt(id)));

      return { data: { status: 'unmounted', message: 'Successfully unmounted' } };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Unmount operation failed' });
    }
  });

  // ── Check mount status ────────────────────────────────────
  app.get('/server-mounts/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      const mounted = isMounted(row.localMountPath);
      const localPath = expandHome(row.localMountPath);

      let diskInfo: any = null;
      if (mounted) {
        try {
          const dfResult = spawnSync('df', ['-h', localPath], { encoding: 'utf-8', timeout: 5000 });
          const dfLines = (dfResult.stdout || '').trim().split('\n');
          const df = dfLines[dfLines.length - 1] || '';
          const parts = df.trim().split(/\s+/);
          diskInfo = {
            size: parts[1],
            used: parts[2],
            available: parts[3],
            usePercent: parts[4],
          };
        } catch { /* non-critical */ }
      }

      return {
        data: {
          id: row.id,
          status: mounted ? 'mounted' : 'unmounted',
          localPath,
          diskInfo,
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Status check failed' });
    }
  });

  // ── Browse directory ──────────────────────────────────────
  app.post('/server-mounts/:id/browse', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { path: browsePath = '.' } = (request.body as any) || {};
    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      if (!isMounted(row.localMountPath)) {
        return reply.code(400).send({ error: 'Mount is not active. Mount it first.' });
      }

      const targetPath = safePath(row.localMountPath, browsePath);

      const entries = readdirSync(targetPath).map(name => {
        try {
          const fullPath = join(targetPath, name);
          const stat = statSync(fullPath);
          const relPath = relative(expandHome(row.localMountPath), fullPath);
          return {
            name,
            path: relPath,
            isDirectory: stat.isDirectory(),
            size: stat.isFile() ? stat.size : null,
            modified: stat.mtime.toISOString(),
            type: stat.isDirectory() ? 'directory' : getFileType(name),
          };
        } catch {
          return { name, path: name, isDirectory: false, size: null, modified: null, type: 'unknown' };
        }
      });

      // Sort: directories first, then files alphabetically
      entries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      const basePath = expandHome(row.localMountPath);
      const currentRelPath = relative(basePath, targetPath);

      return {
        data: {
          currentPath: currentRelPath || '.',
          parentPath: currentRelPath ? relative(basePath, resolve(targetPath, '..')) || '.' : null,
          entries,
          totalEntries: entries.length,
        },
      };
    } catch (err: any) {
      if (err.message === 'Path traversal detected') {
        return reply.code(403).send({ error: 'Access denied — path outside mount scope' });
      }
      app.log.error(err);
      return reply.code(500).send({ error: 'Browse failed' });
    }
  });

  // ── Read file contents ────────────────────────────────────
  app.post('/server-mounts/:id/read-file', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { filePath } = (request.body as any) || {};
    if (!filePath) return reply.code(400).send({ error: 'filePath is required' });

    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      if (!isMounted(row.localMountPath)) {
        return reply.code(400).send({ error: 'Mount is not active' });
      }

      const targetPath = safePath(row.localMountPath, filePath);
      const stat = statSync(targetPath);

      // Limit file size to 2MB
      if (stat.size > 2 * 1024 * 1024) {
        return reply.code(413).send({ error: 'File too large (max 2MB)' });
      }

      // Check if binary
      const ext = extname(targetPath).toLowerCase();
      const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.woff', '.woff2', '.ttf', '.eot'];
      if (binaryExts.includes(ext)) {
        return reply.code(400).send({ error: 'Binary files cannot be read as text' });
      }

      const content = readFileSync(targetPath, 'utf-8');
      const lines = content.split('\n').length;

      return {
        data: {
          filePath,
          fileName: basename(targetPath),
          content,
          size: stat.size,
          lines,
          modified: stat.mtime.toISOString(),
          type: getFileType(basename(targetPath)),
        },
      };
    } catch (err: any) {
      if (err.message === 'Path traversal detected') {
        return reply.code(403).send({ error: 'Access denied — path outside mount scope' });
      }
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to read file' });
    }
  });
}
