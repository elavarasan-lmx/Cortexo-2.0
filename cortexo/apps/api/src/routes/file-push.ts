import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { sshConnect, sshExec, type SSHCredentials } from '../lib/ssh-executor.js';

// ── Schema ───────────────────────────────────────────────────────
const filePushSchema = z.object({
  // Source: the "master" server + path where fixed files live
  sourceServerId: z.number(),
  sourcePath: z.string().min(1),          // e.g. /var/www/html/winbullSource

  // Files to push (relative to sourcePath)
  files: z.array(z.string().min(1)),       // e.g. ["application/controllers/Booking.php", "client/lmxtrade-ws.js"]

  // Target clients
  targets: z.array(z.object({
    projectId: z.string(),
    serverId: z.number(),
    deployPath: z.string().min(1),         // e.g. /var/www/html/mnttraders
    clientSlug: z.string().min(1),         // e.g. mnttraders
  })),

  // Options
  baseSlug: z.string().default('lmxtrade'),      // slug used in source files
  applySlugReplace: z.boolean().default(true),    // sed lmxtrade -> clientSlug
  restartPm2: z.boolean().default(false),         // restart PM2 processes after push
  backupFirst: z.boolean().default(true),         // backup target files before overwriting
});

interface PushResult {
  projectId: string;
  clientSlug: string;
  server: string;
  status: 'success' | 'failed';
  filesProcessed: number;
  errors: string[];
  durationMs: number;
}

/**
 * File Push API — /v1/file-push
 * Push specific files from source repo to multiple client deployments.
 * Handles slug replacement (lmxtrade -> clientSlug) automatically.
 */
export async function filePushRoutes(app: FastifyInstance) {

  // POST /v1/file-push — push files to target clients
  app.post('/file-push', async (request, reply) => {
    const parsed = filePushSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { sourceServerId, sourcePath, files, targets, baseSlug, applySlugReplace, restartPm2, backupFirst } = parsed.data;

    // SSE Stream
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendEvent = (data: Record<string, unknown>) => {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const db = await getDb();
    const results: PushResult[] = [];

    try {
      // Get source server details
      const sourceServer = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, sourceServerId),
      });
      if (!sourceServer) {
        sendEvent({ type: 'error', message: 'Source server not found' });
        reply.raw.end();
        return;
      }

      const sourceHost = sourceServer.privateIp || sourceServer.publicAddress || '';
      sendEvent({ type: 'status', message: `Source: ${sourceHost}:${sourcePath}`, totalTargets: targets.length, totalFiles: files.length });

      // Process each target client
      for (let ti = 0; ti < targets.length; ti++) {
        const target = targets[ti];
        const clientStart = Date.now();
        const errors: string[] = [];

        sendEvent({ type: 'target_start', index: ti, clientSlug: target.clientSlug, total: targets.length });

        // Get target server
        const targetServer = await db.query.servers.findFirst({
          where: (s, { eq }) => eq(s.id, target.serverId),
        });
        if (!targetServer) {
          errors.push('Target server not found');
          results.push({ projectId: target.projectId, clientSlug: target.clientSlug, server: 'unknown', status: 'failed', filesProcessed: 0, errors, durationMs: Date.now() - clientStart });
          sendEvent({ type: 'target_done', index: ti, clientSlug: target.clientSlug, status: 'failed', errors });
          continue;
        }

        const targetHost = targetServer.privateIp || targetServer.publicAddress || '';
        const sameServer = sourceHost === targetHost;

        let sourceConn: any = null;
        let targetConn: any = null;
        let filesProcessed = 0;

        try {
          // Connect to source
          const sourceCreds: SSHCredentials = { host: sourceHost, username: 'ubuntu', privateKey: sourceServer.sshKey || undefined };
          sourceConn = await sshConnect(sourceCreds);

          // Connect to target (or reuse if same server)
          if (sameServer) {
            targetConn = sourceConn;
          } else {
            const targetCreds: SSHCredentials = { host: targetHost, username: 'ubuntu', privateKey: targetServer.sshKey || undefined };
            targetConn = await sshConnect(targetCreds);
          }

          sendEvent({ type: 'status', message: `Connected to ${targetHost} for ${target.clientSlug}` });

          // Process each file
          for (let fi = 0; fi < files.length; fi++) {
            const relFile = files[fi];
            const srcFile = `${sourcePath}/${relFile}`;

            // Compute target file path (handle filename slug replacement)
            let targetRelFile = relFile;
            if (applySlugReplace) {
              targetRelFile = relFile.replace(new RegExp(baseSlug, 'g'), target.clientSlug);
              targetRelFile = targetRelFile.replace(new RegExp(baseSlug.toUpperCase(), 'g'), target.clientSlug.toUpperCase());
            }
            const targetFile = `${target.deployPath}/${targetRelFile}`;

            sendEvent({ type: 'file_start', targetIndex: ti, fileIndex: fi, file: relFile, targetFile, clientSlug: target.clientSlug });

            try {
              // Check source file exists
              const checkSrc = await sshExec(sourceConn, `test -f "${srcFile}" && echo "OK" || echo "MISSING"`);
              if (checkSrc.stdout.includes('MISSING')) {
                errors.push(`Source file not found: ${relFile}`);
                sendEvent({ type: 'file_done', targetIndex: ti, fileIndex: fi, file: relFile, status: 'skipped', reason: 'Source file not found' });
                continue;
              }

              // Backup target file if it exists
              if (backupFirst) {
                await sshExec(targetConn, `test -f "${targetFile}" && cp "${targetFile}" "${targetFile}.bak.$(date +%Y%m%d%H%M%S)" || true`);
              }

              // Ensure target directory exists
              const targetDir = targetFile.substring(0, targetFile.lastIndexOf('/'));
              await sshExec(targetConn, `mkdir -p "${targetDir}"`);

              if (sameServer) {
                // Same server: direct copy + sed
                await sshExec(sourceConn, `cp "${srcFile}" "${targetFile}"`);
              } else {
                // Different servers: read from source, write to target via base64
                const readResult = await sshExec(sourceConn, `base64 "${srcFile}"`);
                if (readResult.exitCode !== 0) {
                  errors.push(`Failed to read ${relFile}: ${readResult.stderr}`);
                  sendEvent({ type: 'file_done', targetIndex: ti, fileIndex: fi, file: relFile, status: 'failed' });
                  continue;
                }
                // Write base64 content to target
                const b64Content = readResult.stdout.replace(/'/g, "'\\''");
                await sshExec(targetConn, `echo '${b64Content}' | base64 -d > "${targetFile}"`);
              }

              // Apply slug replacement in file content
              if (applySlugReplace) {
                const sedCmds = [
                  `sed -i 's/${baseSlug}/${target.clientSlug}/g' "${targetFile}"`,
                  `sed -i 's/${baseSlug.toUpperCase()}/${target.clientSlug.toUpperCase()}/g' "${targetFile}"`,
                ];
                await sshExec(targetConn, sedCmds.join(' && '));
              }

              filesProcessed++;
              sendEvent({ type: 'file_done', targetIndex: ti, fileIndex: fi, file: relFile, status: 'success' });

            } catch (fileErr: any) {
              errors.push(`${relFile}: ${fileErr.message}`);
              sendEvent({ type: 'file_done', targetIndex: ti, fileIndex: fi, file: relFile, status: 'failed', error: fileErr.message });
            }
          }

          // Restart PM2 if requested
          if (restartPm2) {
            sendEvent({ type: 'status', message: `Restarting PM2 for ${target.clientSlug}...` });
            try {
              await sshExec(targetConn, `pm2 restart ${target.clientSlug}-ws ${target.clientSlug}-socketio 2>/dev/null || true`);
              sendEvent({ type: 'status', message: `PM2 restarted for ${target.clientSlug}` });
            } catch (pm2Err: any) {
              errors.push(`PM2 restart: ${pm2Err.message}`);
            }
          }

          const status = errors.length === 0 ? 'success' : (filesProcessed > 0 ? 'success' : 'failed');
          results.push({ projectId: target.projectId, clientSlug: target.clientSlug, server: targetHost, status, filesProcessed, errors, durationMs: Date.now() - clientStart });
          sendEvent({ type: 'target_done', index: ti, clientSlug: target.clientSlug, status, filesProcessed, errors, durationMs: Date.now() - clientStart });

        } catch (connErr: any) {
          errors.push(`Connection failed: ${connErr.message}`);
          results.push({ projectId: target.projectId, clientSlug: target.clientSlug, server: targetHost, status: 'failed', filesProcessed: 0, errors, durationMs: Date.now() - clientStart });
          sendEvent({ type: 'target_done', index: ti, clientSlug: target.clientSlug, status: 'failed', errors });
        } finally {
          try { if (!sameServer && targetConn) targetConn.end(); } catch { /* ignore */ }
          try { if (sourceConn) sourceConn.end(); } catch { /* ignore */ }
        }
      }

      const summary = {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
      };
      sendEvent({ type: 'complete', success: summary.failed === 0, results, summary });
      reply.raw.end();

    } catch (err: any) {
      app.log.error(err, 'File push failed');
      sendEvent({ type: 'complete', success: false, error: err.message, results });
      reply.raw.end();
    }
  });

  // GET /v1/file-push/source-files — list files from source server path
  app.post('/file-push/list-files', async (request, reply) => {
    const body = request.body as { serverId: number; path: string; pattern?: string };
    if (!body.serverId || !body.path) {
      return reply.code(400).send({ error: 'serverId and path are required' });
    }

    try {
      const db = await getDb();
      const server = await db.query.servers.findFirst({
        where: (s, { eq }) => eq(s.id, body.serverId),
      });
      if (!server) return reply.code(404).send({ error: 'Server not found' });

      const host = server.privateIp || server.publicAddress || '';
      const creds: SSHCredentials = { host, username: 'ubuntu', privateKey: server.sshKey || undefined };
      const conn = await sshConnect(creds);

      // List recently modified files (last 7 days) or all files
      const findCmd = body.pattern
        ? `find "${body.path}" -name "${body.pattern}" -type f | head -200`
        : `find "${body.path}" -type f -mtime -7 -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/vendor/*" | sort -t'/' -k2 | head -200`;

      const result = await sshExec(conn, findCmd, 15_000);
      conn.end();

      const basePath = body.path.endsWith('/') ? body.path : body.path + '/';
      const files = result.stdout
        .split('\n')
        .filter(Boolean)
        .map(f => f.replace(basePath, ''));

      return { data: files, total: files.length };
    } catch (err: any) {
      app.log.error(err);
      return reply.code(500).send({ error: err.message || 'Failed to list files' });
    }
  });
}
