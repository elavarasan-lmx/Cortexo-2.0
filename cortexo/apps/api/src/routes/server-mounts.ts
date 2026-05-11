import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { eq } from 'drizzle-orm';
import { serverMounts } from '@cortexo/db/schema';
import { logAudit } from './audit.js';
import { execFile } from 'child_process';
import { promisify } from 'util';
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

const execFileAsync = promisify(execFile);

/** Check if a path is currently mounted via SSHFS (async — no user input in command) */
async function isMounted(localPath: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('mount', [], { encoding: 'utf-8', timeout: 5000 });
    return (stdout || '').includes(expandHome(localPath));
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
      const enriched = await Promise.all(rows.map(async row => ({
        ...row,
        status: await isMounted(row.localMountPath) ? 'mounted' : 'unmounted',
      })));
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
          status: await isMounted(row.localMountPath) ? 'mounted' : 'unmounted',
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
      const [row] = await db.insert(serverMounts).values(parsed.data as any).returning();
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
      if (row && await isMounted(row.localMountPath)) {
        try {
          await execFileAsync('fusermount', ['-u', expandHome(row.localMountPath)], { timeout: 10000 });
        } catch { /* best-effort unmount */ }
      }
      const deleted = await db.delete(serverMounts)
        .where(eq(serverMounts.id, parseInt(id)))
        .returning();
      if (!deleted.length) return reply.code(404).send({ error: 'Mount config not found' });
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

      // Determine the SSH host to connect to.
      // We prefer privateIp because ~/.ssh/config already has ProxyCommand
      // rules for 10.0.*.* that handle bastion-jumping and key selection.
      // Only fall back to publicAddress for direct connections.
      const privateIp = server.privateIp || '';
      const publicAddr = server.publicAddress || '';
      if (!privateIp && !publicAddr) return reply.code(400).send({ error: 'Server has no IP address configured' });

      let sshUser = row.sshUser;
      let sshHost = privateIp || publicAddr;

      // If no privateIp, extract user/host from publicAddress
      if (!privateIp && publicAddr) {
        if (publicAddr.includes('@')) {
          const parts = publicAddr.split('@');
          sshUser = parts[0] || sshUser;
          sshHost = parts[1];
        } else {
          sshHost = publicAddr;
        }
      }

      // Already mounted?
      if (await isMounted(row.localMountPath)) {
        return { data: { status: 'mounted', message: 'Already mounted' } };
      }

      // Ensure mount directory exists
      if (!existsSync(localPath)) {
        mkdirSync(localPath, { recursive: true });
      }

      // Execute SSHFS mount — defer to ~/.ssh/config for ProxyCommand,
      // IdentityFile, and other per-host SSH options.
      try {
        validateShellSafe(sshUser, 'sshUser');
        validateShellSafe(sshHost, 'sshHost');
        validateShellSafe(row.remotePath, 'remotePath');

        // Only add explicit IdentityFile if the server record has a private key *path*
        // (skip public key strings that start with "ssh-")
        const sshKeyOpts = server.sshKey && server.sshKey.length > 0 && !server.sshKey.startsWith('ssh-')
          ? `,IdentityFile=${expandHome(server.sshKey)}`
          : '';

        // Read-only flag — mount with -o ro to enforce at OS level
        const roFlag = row.readOnly ? ',ro' : '';

        const sshfsArgs = [
          `${sshUser}@${sshHost}:${row.remotePath}`,
          localPath,
          '-o', `reconnect,ServerAliveInterval=15,ServerAliveCountMax=3,ConnectTimeout=20,cache=yes,kernel_cache,auto_cache,compression=no,StrictHostKeyChecking=accept-new${sshKeyOpts}${roFlag}`,
        ];

        app.log.info(`SSHFS mount: sshfs ${sshfsArgs.join(' ')}`);

        const result = await execFileAsync('sshfs', sshfsArgs, {
          timeout: 60000,
          encoding: 'utf-8',
          env: { ...process.env, HOME: homedir() },
        });

        // execFileAsync throws on non-zero exit, so if we reach here it's success
      } catch (execErr: any) {
        // Update status to error
        await db.update(serverMounts)
          .set({ status: 'error' } as any)
          .where(eq(serverMounts.id, parseInt(id)));
        return reply.code(500).send({
          error: 'Mount failed',
          details: execErr.message || execErr.stderr || 'Unknown error',
        });
      }

      // Update status
      await db.update(serverMounts)
        .set({ status: 'mounted', lastMountedAt: new Date() } as any)
        .where(eq(serverMounts.id, parseInt(id)));

      return { data: { status: 'mounted', message: `Mounted at ${localPath}` } };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Mount operation failed', details: err.message || String(err) });
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

      if (!await isMounted(row.localMountPath)) {
        await db.update(serverMounts)
          .set({ status: 'unmounted' } as any)
          .where(eq(serverMounts.id, parseInt(id)));
        return { data: { status: 'unmounted', message: 'Not mounted' } };
      }

      try {
        const unmount = await execFileAsync('fusermount', ['-u', localPath], { timeout: 10000, encoding: 'utf-8' });
      } catch (execErr: any) {
        // Try lazy unmount
        try {
          await execFileAsync('fusermount', ['-uz', localPath], { timeout: 10000, encoding: 'utf-8' });
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

      const mounted = await isMounted(row.localMountPath);
      const localPath = expandHome(row.localMountPath);

      let diskInfo: any = null;
      if (mounted) {
        try {
          const { stdout } = await execFileAsync('df', ['-h', localPath], { encoding: 'utf-8', timeout: 5000 });
          const dfLines = (stdout || '').trim().split('\n');
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

      if (!await isMounted(row.localMountPath)) {
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

      // Audit log — directory browse
      const user = (request as any).user;
      logAudit({
        userId: user?.id || '00000000-0000-0000-0000-000000000001',
        userName: user?.name || 'LMX',
        action: 'file_browse',
        resource: 'server_mount',
        resourceId: id,
        description: `Browsed directory: ${row.name}/${currentRelPath || '.'}`,
        metadata: { mountName: row.name, path: currentRelPath || '.', totalEntries: entries.length },
        ipAddress: (request.ip || request.headers['x-forwarded-for'] || '') as string,
      });

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

      if (!await isMounted(row.localMountPath)) {
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

      // Audit log — file read
      const user = (request as any).user;
      logAudit({
        userId: user?.id || '00000000-0000-0000-0000-000000000001',
        userName: user?.name || 'LMX',
        action: 'file_read',
        resource: 'server_mount',
        resourceId: id,
        description: `Read file: ${row.name}/${filePath}`,
        metadata: { mountName: row.name, filePath, fileName: basename(targetPath), size: stat.size, lines, type: getFileType(basename(targetPath)) },
        ipAddress: (request.ip || request.headers['x-forwarded-for'] || '') as string,
      });

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

  // ── Scan for file changes (IDE edits detection) ───────────
  app.post('/server-mounts/:id/scan-changes', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { minutes = 30 } = (request.body as any) || {};

    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      if (!await isMounted(row.localMountPath)) {
        return reply.code(400).send({ error: 'Mount is not active' });
      }

      const localPath = expandHome(row.localMountPath);
      const minsNum = Math.min(Math.max(1, parseInt(minutes)), 1440); // 1 min to 24 hrs

      // Use `find` to detect recently modified files
      const { stdout } = await execFileAsync('find', [
        localPath,
        '-maxdepth', '6',
        '-type', 'f',
        '-mmin', `-${minsNum}`,
        '-not', '-path', '*/node_modules/*',
        '-not', '-path', '*/.git/*',
        '-not', '-path', '*/vendor/*',
        '-not', '-path', '*/storage/logs/*',
        '-not', '-path', '*/cache/*',
      ], { encoding: 'utf-8', timeout: 15000 });

      const files = (stdout || '').trim().split('\n').filter(Boolean);
      const changes: any[] = [];

      for (const fileFull of files) {
        try {
          const relPath = relative(localPath, fileFull);
          const st = statSync(fileFull);
          const modifiedAgo = Math.round((Date.now() - st.mtime.getTime()) / 60000);

          changes.push({
            path: relPath,
            name: basename(fileFull),
            size: st.size,
            modified: st.mtime.toISOString(),
            minutesAgo: modifiedAgo,
            type: getFileType(basename(fileFull)),
          });
        } catch { /* skip unreadable */ }
      }

      // Sort by most recent first
      changes.sort((a, b) => a.minutesAgo - b.minutesAgo);

      // Log each changed file to audit trail
      const user = (request as any).user;
      for (const ch of changes.slice(0, 50)) { // cap at 50
        logAudit({
          userId: user?.id || '00000000-0000-0000-0000-000000000001',
          userName: user?.name || 'LMX',
          action: 'file_modified',
          resource: 'server_mount',
          resourceId: id,
          description: `File modified: ${row.name}/${ch.path} (${ch.minutesAgo}m ago)`,
          metadata: { mountName: row.name, filePath: ch.path, fileName: ch.name, size: ch.size, minutesAgo: ch.minutesAgo },
          ipAddress: (request.ip || request.headers['x-forwarded-for'] || '') as string,
        });
      }

      return {
        data: {
          mountName: row.name,
          scannedMinutes: minsNum,
          totalChanges: changes.length,
          changes: changes.slice(0, 100),
        },
      };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Scan failed', details: err.message });
    }
  });

  // ── Toggle read-only (remounts with -o ro) ────────────────
  app.put('/server-mounts/:id/toggle-readonly', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { readOnly } = (request.body as any) || {};
    if (typeof readOnly !== 'boolean') return reply.code(400).send({ error: 'readOnly boolean required' });

    try {
      const db = await getDb();
      const row = await db.query.serverMounts.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
      });
      if (!row) return reply.code(404).send({ error: 'Mount config not found' });

      // Update DB
      await db.update(serverMounts)
        .set({ readOnly } as any)
        .where(eq(serverMounts.id, parseInt(id)));

      // If currently mounted, try to remount with new permission
      let remounted = false;
      if (await isMounted(row.localMountPath)) {
        const localPath = expandHome(row.localMountPath);

        // Try unmount (fusermount3 first, then fusermount)
        let unmounted = false;
        for (const cmd of ['fusermount3', 'fusermount']) {
          try {
            await execFileAsync(cmd, ['-u', localPath], { timeout: 10000, encoding: 'utf-8' });
            unmounted = true; break;
          } catch { /* try next */ }
          // Try lazy unmount
          try {
            await execFileAsync(cmd, ['-uz', localPath], { timeout: 10000, encoding: 'utf-8' });
            unmounted = true; break;
          } catch { /* try next */ }
        }

        if (!unmounted) {
          // Can't unmount (permission denied etc.) — just update DB, skip remount
          app.log.warn(`Cannot unmount ${localPath} for readonly toggle — will apply on next mount cycle`);
        } else {
          // Remount with new permission
          const server = await db.query.servers.findFirst({
            where: (s, { eq }) => eq(s.id, row.serverId),
          });
          if (server) {
            const privateIp = server.privateIp || '';
            const publicAddr = server.publicAddress || '';
            let sshUser = row.sshUser;
            let sshHost = privateIp || publicAddr;
            if (!privateIp && publicAddr && publicAddr.includes('@')) {
              const parts = publicAddr.split('@');
              sshUser = parts[0] || sshUser;
              sshHost = parts[1];
            }

            const sshKeyOpts = server.sshKey && server.sshKey.length > 0 && !server.sshKey.startsWith('ssh-')
              ? `,IdentityFile=${expandHome(server.sshKey)}`
              : '';
            const roFlag = readOnly ? ',ro' : '';

            const sshfsArgs = [
              `${sshUser}@${sshHost}:${row.remotePath}`,
              localPath,
              '-o', `reconnect,ServerAliveInterval=15,ServerAliveCountMax=3,ConnectTimeout=20,cache=yes,kernel_cache,auto_cache,compression=no,StrictHostKeyChecking=accept-new${sshKeyOpts}${roFlag}`,
            ];

            app.log.info(`SSHFS remount (readOnly=${readOnly}): sshfs ${sshfsArgs.join(' ')}`);

            try {
              await execFileAsync('sshfs', sshfsArgs, {
                timeout: 60000, encoding: 'utf-8',
                env: { ...process.env, HOME: homedir() },
              });
              remounted = true;
              await db.update(serverMounts)
                .set({ status: 'mounted', lastMountedAt: new Date() } as any)
                .where(eq(serverMounts.id, parseInt(id)));
            } catch (remountErr: any) {
              app.log.warn(`SSHFS remount failed: ${(remountErr.stderr || '').trim()}`);
            }
          }
        }
      }

      // Audit log
      const user = (request as any).user;
      logAudit({
        userId: user?.id || '00000000-0000-0000-0000-000000000001',
        userName: user?.name || 'LMX',
        action: readOnly ? 'set_readonly' : 'set_readwrite',
        resource: 'server_mount',
        resourceId: id,
        description: `${row.name} set to ${readOnly ? 'Read Only' : 'Read Write'}`,
        ipAddress: (request.ip || request.headers['x-forwarded-for'] || '') as string,
      });

      return { data: { readOnly, remounted } };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Toggle failed', details: err.message });
    }
  });
}
