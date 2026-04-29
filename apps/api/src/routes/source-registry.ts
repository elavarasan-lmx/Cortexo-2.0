import { FastifyInstance } from 'fastify';
import { eq, desc, sql } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import {
  managedSources,
  clientConfigs,
  configChangeHistory,
} from '@cortexo/db';
import {
  renderConfigFile,
  getSourcePath,
} from '../lib/config-renderer.js';
import fs from 'node:fs/promises';

/**
 * Source Registry & Client Config Routes
 * Manages application templates (sources) and per-client configurations.
 */
export async function sourceRegistryRoutes(app: FastifyInstance) {

  // ═══════════════════════════════════════════════════════════════════════════
  // MANAGED SOURCES
  // ═══════════════════════════════════════════════════════════════════════════

  /** List all managed sources */
  app.get('/sources', async (request, reply) => {
    const db = await getDb();
    const rows = await db.select().from(managedSources).orderBy(managedSources.displayName);
    return reply.send({ data: rows });
  });

  /** Get a single source by slug */
  app.get<{ Params: { slug: string } }>('/sources/:slug', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const [row] = await db.select().from(managedSources).where(eq(managedSources.slug, slug));
    if (!row) return reply.code(404).send({ error: 'Source not found' });
    return reply.send({ data: row });
  });

  /** Create a new managed source */
  app.post<{ Body: {
    slug: string; displayName: string; description?: string; version?: string;
    framework?: Record<string, string>; basePath?: string; configSchemaPath?: string;
    templatePath?: string; manifestPath?: string; deployChecklist?: string[];
  } }>('/sources', async (request, reply) => {
    const db = await getDb();
    const body = request.body;
    const [result] = await db.insert(managedSources).values({
      slug: body.slug,
      displayName: body.displayName,
      description: body.description,
      version: body.version,
      framework: body.framework,
      basePath: body.basePath,
      configSchemaPath: body.configSchemaPath,
      templatePath: body.templatePath,
      manifestPath: body.manifestPath,
      deployChecklist: body.deployChecklist,
    });
    return reply.code(201).send({ data: { id: result.insertId, ...body } });
  });

  /** Get the config schema JSON for a source */
  app.get<{ Params: { slug: string } }>('/sources/:slug/schema', async (request, reply) => {
    const { slug } = request.params;
    try {
      const schemaPath = getSourcePath(slug, 'config-schema.json');
      const content = await fs.readFile(schemaPath, 'utf-8');
      return reply.send({ data: JSON.parse(content) });
    } catch {
      return reply.code(404).send({ error: 'Config schema not found for source' });
    }
  });

  /** Get the manifest for a source */
  app.get<{ Params: { slug: string } }>('/sources/:slug/manifest', async (request, reply) => {
    const { slug } = request.params;
    try {
      const manifestPath = getSourcePath(slug, 'manifest.json');
      const content = await fs.readFile(manifestPath, 'utf-8');
      return reply.send({ data: JSON.parse(content) });
    } catch {
      return reply.code(404).send({ error: 'Manifest not found for source' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT CONFIGS
  // ═══════════════════════════════════════════════════════════════════════════

  /** List all client configs (with optional filters) */
  app.get<{ Querystring: { sourceId?: string; status?: string; limit?: string } }>(
    '/client-configs',
    async (request, reply) => {
      const db = await getDb();
      const { sourceId, status, limit } = request.query;
      let query = db.select().from(clientConfigs).orderBy(desc(clientConfigs.updatedAt));

      const conditions = [];
      if (sourceId) conditions.push(eq(clientConfigs.sourceId, parseInt(sourceId)));
      if (status) conditions.push(eq(clientConfigs.status, status as any));

      if (conditions.length > 0) {
        for (const cond of conditions) {
          query = query.where(cond) as typeof query;
        }
      }
      if (limit) query = query.limit(parseInt(limit)) as typeof query;

      const rows = await query;
      return reply.send({ data: rows, total: rows.length });
    },
  );

  /** Get a single client config by slug */
  app.get<{ Params: { slug: string } }>('/client-configs/:slug', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const [row] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    if (!row) return reply.code(404).send({ error: 'Client config not found' });
    return reply.send({ data: row });
  });

  /** Create a new client config */
  app.post<{ Body: {
    sourceId: number; clientSlug: string; displayName: string;
    domain?: string; serverId?: number; configData: Record<string, unknown>;
    deployPath?: string; gitBranch?: string; notes?: string;
  } }>('/client-configs', async (request, reply) => {
    const db = await getDb();
    const body = request.body;

    // Verify source exists
    const [source] = await db.select().from(managedSources).where(eq(managedSources.id, body.sourceId));
    if (!source) return reply.code(400).send({ error: 'Source not found' });

    const [result] = await db.insert(clientConfigs).values({
      sourceId: body.sourceId,
      clientSlug: body.clientSlug,
      displayName: body.displayName,
      domain: body.domain,
      serverId: body.serverId,
      configData: body.configData,
      deployPath: body.deployPath,
      gitBranch: body.gitBranch,
      notes: body.notes,
      status: 'draft',
      migrationStatus: 'pending',
    });

    // Record creation in history
    await db.insert(configChangeHistory).values({
      clientConfigId: result.insertId,
      changedBy: 'system',
      changeType: 'create',
      newValues: body.configData,
      description: `Client "${body.displayName}" created`,
    });

    return reply.code(201).send({
      data: { id: result.insertId, clientSlug: body.clientSlug },
    });
  });

  /** Update a client config */
  app.put<{ Params: { slug: string }; Body: {
    displayName?: string; domain?: string; serverId?: number;
    configData?: Record<string, unknown>; deployPath?: string;
    gitBranch?: string; status?: string; notes?: string;
  } }>('/client-configs/:slug', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const body = request.body;

    const [existing] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    if (!existing) return reply.code(404).send({ error: 'Client config not found' });

    const updates: Record<string, unknown> = {};
    if (body.displayName !== undefined) updates.displayName = body.displayName;
    if (body.domain !== undefined) updates.domain = body.domain;
    if (body.serverId !== undefined) updates.serverId = body.serverId;
    if (body.configData !== undefined) updates.configData = body.configData;
    if (body.deployPath !== undefined) updates.deployPath = body.deployPath;
    if (body.gitBranch !== undefined) updates.gitBranch = body.gitBranch;
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;

    await db.update(clientConfigs).set(updates).where(eq(clientConfigs.clientSlug, slug));

    // Record change in history (only if configData changed)
    if (body.configData) {
      await db.insert(configChangeHistory).values({
        clientConfigId: existing.id,
        changedBy: 'system',
        changeType: 'update',
        previousValues: existing.configData as Record<string, unknown>,
        newValues: body.configData,
        description: `Config updated for "${existing.displayName}"`,
      });
    }

    return reply.send({ data: { success: true } });
  });

  /** Delete a client config */
  app.delete<{ Params: { slug: string } }>('/client-configs/:slug', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const [existing] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    if (!existing) return reply.code(404).send({ error: 'Client config not found' });

    await db.delete(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    return reply.send({ data: { success: true } });
  });

  /** Clone a client config to create a new client quickly */
  app.post<{ Params: { slug: string }; Body: {
    newSlug: string; newDisplayName: string; newDomain?: string;
  } }>('/client-configs/:slug/clone', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const { newSlug, newDisplayName, newDomain } = request.body;

    const [source] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    if (!source) return reply.code(404).send({ error: 'Source client not found' });

    // Deep clone the config data and update client-specific fields
    const newConfigData = JSON.parse(JSON.stringify(source.configData)) as Record<string, Record<string, unknown>>;
    if (newConfigData.identity) {
      newConfigData.identity.client = newSlug;
      newConfigData.identity.web_title = newDisplayName;
    }
    if (newDomain && newConfigData.urls) {
      const proto = newDomain.startsWith('http') ? '' : 'http://';
      newConfigData.urls.web_base_url = `${proto}${newDomain}/`;
      newConfigData.urls.app_base_url = `${proto}${newDomain}/mobileapi/`;
      newConfigData.urls.admin_base_url = `${proto}${newDomain}/admin/`;
    }
    if (newConfigData.database) {
      newConfigData.database.database = newSlug;
    }

    const [result] = await db.insert(clientConfigs).values({
      sourceId: source.sourceId,
      clientSlug: newSlug,
      displayName: newDisplayName,
      domain: newDomain || source.domain,
      serverId: source.serverId,
      configData: newConfigData,
      deployPath: source.deployPath?.replace(slug, newSlug),
      gitBranch: source.gitBranch,
      status: 'draft',
      migrationStatus: 'pending',
      notes: `Cloned from ${slug}`,
    });

    await db.insert(configChangeHistory).values({
      clientConfigId: result.insertId,
      changedBy: 'system',
      changeType: 'create',
      newValues: newConfigData,
      description: `Cloned from "${source.displayName}" (${slug})`,
    });

    return reply.code(201).send({
      data: { id: result.insertId, clientSlug: newSlug },
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  /** Preview the rendered global_configs.php for a client */
  app.get<{ Params: { slug: string } }>('/client-configs/:slug/render', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const [client] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    if (!client) return reply.code(404).send({ error: 'Client config not found' });

    const [source] = await db.select().from(managedSources).where(eq(managedSources.id, client.sourceId));
    if (!source) return reply.code(400).send({ error: 'Source not found' });

    try {
      const templatePath = getSourcePath(source.slug, 'global_configs.template.php');
      const rendered = await renderConfigFile(templatePath, client.configData as Record<string, unknown>);
      return reply.send({ data: { rendered, clientSlug: slug, sourceVersion: source.version } });
    } catch (err) {
      return reply.code(500).send({ error: `Render failed: ${(err as Error).message}` });
    }
  });

  /** Validate a config data object against the schema */
  app.post<{ Body: { sourceSlug: string; configData: Record<string, unknown> } }>(
    '/client-configs/validate',
    async (request, reply) => {
      const { sourceSlug, configData } = request.body;
      const errors: string[] = [];

      try {
        const schemaPath = getSourcePath(sourceSlug, 'config-schema.json');
        const schemaRaw = await fs.readFile(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaRaw);

        // Basic required field validation
        for (const requiredSection of schema.required || []) {
          if (!configData[requiredSection]) {
            errors.push(`Missing required section: "${requiredSection}"`);
          }
        }

        // Validate required fields within sections
        for (const [sectionKey, sectionSchema] of Object.entries(schema.properties || {})) {
          const section = sectionSchema as Record<string, unknown>;
          const sectionData = configData[sectionKey] as Record<string, unknown> | undefined;
          if (!sectionData) continue;

          for (const req of (section.required as string[]) || []) {
            if (!sectionData[req] || String(sectionData[req]).trim() === '') {
              errors.push(`Missing required field: "${sectionKey}.${req}"`);
            }
          }
        }

        return reply.send({
          data: { valid: errors.length === 0, errors },
        });
      } catch {
        return reply.code(400).send({ error: 'Could not load schema for validation' });
      }
    },
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG CHANGE HISTORY
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get change history for a client config */
  app.get<{ Params: { slug: string }; Querystring: { limit?: string } }>(
    '/client-configs/:slug/history',
    async (request, reply) => {
      const db = await getDb();
      const { slug } = request.params;
      const limit = parseInt(request.query.limit || '50');

      const [client] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
      if (!client) return reply.code(404).send({ error: 'Client config not found' });

      const rows = await db.select()
        .from(configChangeHistory)
        .where(eq(configChangeHistory.clientConfigId, client.id))
        .orderBy(desc(configChangeHistory.createdAt))
        .limit(limit);

      return reply.send({ data: rows });
    },
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS & OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get client config stats summary */
  app.get('/client-configs/stats/summary', async (request, reply) => {
    const db = await getDb();
    const allConfigs = await db.select().from(clientConfigs);

    const stats = {
      total: allConfigs.length,
      byStatus: {} as Record<string, number>,
      byMigrationStatus: {} as Record<string, number>,
      avgHealthScore: 0,
    };

    let healthSum = 0;
    for (const c of allConfigs) {
      stats.byStatus[c.status || 'unknown'] = (stats.byStatus[c.status || 'unknown'] || 0) + 1;
      stats.byMigrationStatus[c.migrationStatus || 'unknown'] =
        (stats.byMigrationStatus[c.migrationStatus || 'unknown'] || 0) + 1;
      healthSum += c.healthScore || 0;
    }
    stats.avgHealthScore = allConfigs.length > 0 ? Math.round(healthSum / allConfigs.length) : 0;

    return reply.send({ data: stats });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DRIFT DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /** Trigger a drift scan for a client (SSH checksum comparison) */
  app.post<{ Params: { slug: string }; Body: {
    host: string; username: string; port?: number;
    privateKey?: string; password?: string; remotePath: string;
  } }>('/client-configs/:slug/scan-drift', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const { host, username, port, privateKey, password, remotePath } = request.body;

    const [client] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    if (!client) return reply.code(404).send({ error: 'Client config not found' });

    const [source] = await db.select().from(managedSources).where(eq(managedSources.id, client.sourceId));
    if (!source) return reply.code(400).send({ error: 'Source not found' });

    try {
      const { detectDrift } = await import('../lib/drift-detector.js');
      const basePath = getSourcePath(source.slug, 'base');
      const report = await detectDrift(
        { host, username, port, privateKey, password },
        remotePath,
        slug,
        basePath,
      );

      // Store in divergence_analyses table
      const { divergenceAnalyses } = await import('@cortexo/db');
      await db.insert(divergenceAnalyses).values({
        clientId: slug,
        clientName: client.displayName,
        divergenceScore: report.divergenceScore,
        filesAdded: report.summary.extra,
        filesModified: report.summary.modified,
        filesDeleted: report.summary.missing,
        moduleSummary: report.moduleSummary,
        fileDetails: report.files,
      });

      // Update health score on client config based on drift
      const healthScore = Math.max(0, 100 - report.divergenceScore);
      await db.update(clientConfigs)
        .set({ healthScore } as any)
        .where(eq(clientConfigs.clientSlug, slug));

      return reply.send({ data: report });
    } catch (err) {
      return reply.code(500).send({ error: `Drift scan failed: ${(err as Error).message}` });
    }
  });

  /** Get the latest drift report for a client */
  app.get<{ Params: { slug: string } }>('/client-configs/:slug/drift-report', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;

    const { divergenceAnalyses } = await import('@cortexo/db');
    const [report] = await db.select()
      .from(divergenceAnalyses)
      .where(eq(divergenceAnalyses.clientId, slug))
      .orderBy(desc(divergenceAnalyses.analyzedAt))
      .limit(1);

    if (!report) return reply.code(404).send({ error: 'No drift report found. Run a scan first.' });
    return reply.send({ data: report });
  });

  /** Get drift history for a client (all scans) */
  app.get<{ Params: { slug: string }; Querystring: { limit?: string } }>(
    '/client-configs/:slug/drift-history',
    async (request, reply) => {
      const db = await getDb();
      const { slug } = request.params;
      const limit = parseInt(request.query.limit || '10');

      const { divergenceAnalyses } = await import('@cortexo/db');
      const rows = await db.select({
        id: divergenceAnalyses.id,
        divergenceScore: divergenceAnalyses.divergenceScore,
        filesAdded: divergenceAnalyses.filesAdded,
        filesModified: divergenceAnalyses.filesModified,
        filesDeleted: divergenceAnalyses.filesDeleted,
        analyzedAt: divergenceAnalyses.analyzedAt,
      })
        .from(divergenceAnalyses)
        .where(eq(divergenceAnalyses.clientId, slug))
        .orderBy(desc(divergenceAnalyses.analyzedAt))
        .limit(limit);

      return reply.send({ data: rows });
    },
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // FIX PROPAGATION (Bulk Updates)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Detect changed files in the base code (prepare for update) */
  app.get<{ Params: { slug: string } }>('/sources/:slug/prepare-update', async (request, reply) => {
    const { slug } = request.params;
    try {
      const { prepareUpdate } = await import('../lib/update-deployer.js');
      const basePath = getSourcePath(slug, 'base');
      const plan = prepareUpdate(basePath);
      return reply.send({ data: plan });
    } catch (err) {
      return reply.code(500).send({ error: `Failed to prepare update: ${(err as Error).message}` });
    }
  });

  /** Deploy update to a single client */
  app.post<{ Params: { slug: string }; Body: {
    host: string; username: string; port?: number;
    privateKey?: string; password?: string; remotePath: string;
  } }>('/client-configs/:slug/deploy-update', async (request, reply) => {
    const db = await getDb();
    const { slug } = request.params;
    const { host, username, port, privateKey, password, remotePath } = request.body;

    const [client] = await db.select().from(clientConfigs).where(eq(clientConfigs.clientSlug, slug));
    if (!client) return reply.code(404).send({ error: 'Client config not found' });

    const [source] = await db.select().from(managedSources).where(eq(managedSources.id, client.sourceId));
    if (!source) return reply.code(400).send({ error: 'Source not found' });

    try {
      const { prepareUpdate, deployToClient } = await import('../lib/update-deployer.js');
      const basePath = getSourcePath(source.slug, 'base');
      const plan = prepareUpdate(basePath);

      if (plan.changedFiles.length === 0) {
        return reply.send({ data: { success: true, message: 'No changes to deploy', filesDeployed: 0 } });
      }

      const result = await deployToClient(
        { host, username, port, privateKey, password },
        remotePath,
        slug,
        basePath,
        plan.changedFiles,
      );

      // Record in history
      await db.insert(configChangeHistory).values({
        clientConfigId: client.id,
        changedBy: 'system',
        changeType: 'deploy',
        newValues: { filesDeployed: result.filesDeployed, version: plan.baseVersion },
        description: `Code update deployed: ${result.filesDeployed} files`,
      });

      // Update deployed version
      if (result.success) {
        await db.update(clientConfigs).set({
          deployedVersion: plan.baseVersion,
          lastDeployedAt: new Date(),
        } as any).where(eq(clientConfigs.clientSlug, slug));
      }

      return reply.send({ data: result });
    } catch (err) {
      return reply.code(500).send({ error: `Deploy failed: ${(err as Error).message}` });
    }
  });

  /** Save a checkpoint (mark current base as deployed baseline) */
  app.post<{ Params: { slug: string } }>('/sources/:slug/checkpoint', async (request, reply) => {
    const { slug } = request.params;
    try {
      const { saveCheckpointManifest } = await import('../lib/update-deployer.js');
      const basePath = getSourcePath(slug, 'base');
      saveCheckpointManifest(basePath);
      return reply.send({ data: { success: true, message: 'Checkpoint saved' } });
    } catch (err) {
      return reply.code(500).send({ error: `Checkpoint failed: ${(err as Error).message}` });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECKS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Run health checks on all active clients */
  app.post('/health/check-all', async (request, reply) => {
    try {
      const { checkAllClients } = await import('../lib/health-checker.js');
      const results = await checkAllClients();
      const summary = {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        degraded: results.filter(r => r.status === 'degraded').length,
        down: results.filter(r => r.status === 'down').length,
        timeout: results.filter(r => r.status === 'timeout').length,
      };
      return reply.send({ data: { summary, results } });
    } catch (err) {
      return reply.code(500).send({ error: `Health check failed: ${(err as Error).message}` });
    }
  });

  /** Check a single URL */
  app.post<{ Body: { url: string } }>('/health/check-url', async (request, reply) => {
    const { url } = request.body;
    if (!url) return reply.code(400).send({ error: 'URL is required' });
    try {
      const { checkUrl } = await import('../lib/health-checker.js');
      const result = await checkUrl(url);
      return reply.send({ data: { url, ...result, checkedAt: new Date().toISOString() } });
    } catch (err) {
      return reply.code(500).send({ error: `Check failed: ${(err as Error).message}` });
    }
  });

  /** Start/stop the health check scheduler */
  app.post<{ Body: { action: 'start' | 'stop'; intervalMinutes?: number } }>(
    '/health/scheduler',
    async (request, reply) => {
      const { action, intervalMinutes } = request.body;
      try {
        if (action === 'start') {
          const { startHealthScheduler } = await import('../lib/health-checker.js');
          startHealthScheduler(intervalMinutes || 5);
          return reply.send({ data: { status: 'started', intervalMinutes: intervalMinutes || 5 } });
        } else {
          const { stopHealthScheduler } = await import('../lib/health-checker.js');
          stopHealthScheduler();
          return reply.send({ data: { status: 'stopped' } });
        }
      } catch (err) {
        return reply.code(500).send({ error: `Scheduler failed: ${(err as Error).message}` });
      }
    },
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DB SCHEMA VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  /** Validate a client's DB schema against the golden reference */
  app.post<{ Params: { slug: string }; Body: {
    goldenHost: string; goldenUsername: string; goldenPort?: number;
    goldenKey?: string; goldenPassword?: string; goldenDb: string;
    clientHost: string; clientUsername: string; clientPort?: number;
    clientKey?: string; clientPassword?: string; clientDb: string;
  } }>('/client-configs/:slug/validate-schema', async (request, reply) => {
    const { slug } = request.params;
    const body = request.body;

    try {
      const { validateSchema } = await import('../lib/schema-validator.js');
      const report = await validateSchema(
        { host: body.goldenHost, username: body.goldenUsername, port: body.goldenPort, privateKey: body.goldenKey, password: body.goldenPassword },
        body.goldenDb,
        { host: body.clientHost, username: body.clientUsername, port: body.clientPort, privateKey: body.clientKey, password: body.clientPassword },
        body.clientDb,
        slug,
      );
      return reply.send({ data: report });
    } catch (err) {
      return reply.code(500).send({ error: `Schema validation failed: ${(err as Error).message}` });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LOG AGGREGATION (tail PHP error logs via SSH)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Tail remote PHP error logs for a client */
  app.post<{ Params: { slug: string }; Body: {
    host: string; username: string; port?: number;
    privateKey?: string; password?: string;
    logPath?: string; lines?: number;
  } }>('/client-configs/:slug/tail-logs', async (request, reply) => {
    const { slug } = request.params;
    const { host, username, port, privateKey, password, logPath, lines } = request.body;

    const defaultLogPath = `/var/www/html/${slug}/application/logs/log-${new Date().toISOString().slice(0, 10).replace(/-/g, '-')}.php`;
    const targetPath = logPath || defaultLogPath;
    const tailLines = lines || 100;

    try {
      const { sshConnect, sshExec } = await import('../lib/ssh-executor.js');
      const conn = await sshConnect({ host, username, port, privateKey, password });

      const { stdout, stderr } = await sshExec(
        conn,
        `tail -n ${tailLines} "${targetPath}" 2>/dev/null || echo "LOG_NOT_FOUND"`,
        15_000,
      );

      conn.end();

      if (stdout.includes('LOG_NOT_FOUND')) {
        return reply.send({ data: { logs: [], message: `Log file not found: ${targetPath}` } });
      }

      // Parse PHP log lines into structured entries
      const entries = stdout.split('\n')
        .filter(line => line.trim() && !line.startsWith('<?php') && !line.startsWith('defined'))
        .map(line => {
          const match = line.match(/^(ERROR|INFO|DEBUG|WARNING)\s+-\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+-->\s+(.+)$/);
          if (match) {
            return { level: match[1], timestamp: match[2], message: match[3] };
          }
          return { level: 'RAW', timestamp: '', message: line };
        });

      return reply.send({
        data: {
          clientSlug: slug,
          logPath: targetPath,
          totalLines: entries.length,
          logs: entries,
        },
      });
    } catch (err) {
      return reply.code(500).send({ error: `Log fetch failed: ${(err as Error).message}` });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE TESTING
  // ═══════════════════════════════════════════════════════════════════════════

  /** Discover all modules (controllers) from the base code */
  app.get<{ Params: { slug: string } }>('/sources/:slug/modules', async (request, reply) => {
    const { slug } = request.params;
    try {
      const { discoverModules } = await import('../lib/module-tester.js');
      const basePath = getSourcePath(slug, 'base');
      const modules = discoverModules(basePath);
      return reply.send({
        data: {
          total: modules.length,
          admin: modules.filter(m => m.layer === 'admin').length,
          web: modules.filter(m => m.layer === 'web').length,
          modules: modules.map(m => ({
            controller: m.controller,
            layer: m.layer,
            methodCount: m.methods.length,
            menuCode: m.menuCode,
            modelName: m.modelName,
            methods: m.methods.map(met => met.name),
          })),
        },
      });
    } catch (err) {
      return reply.code(500).send({ error: `Module discovery failed: ${(err as Error).message}` });
    }
  });

  /** Test a single module against a client */
  app.post<{ Body: {
    clientSlug: string; clientUrl: string; sourceSlug: string;
    controller: string; sessionCookie?: string;
  } }>('/module-test/single', async (request, reply) => {
    const { clientSlug, clientUrl, sourceSlug, controller, sessionCookie } = request.body;

    try {
      const { discoverModules, testModule } = await import('../lib/module-tester.js');
      const basePath = getSourcePath(sourceSlug, 'base');
      const modules = discoverModules(basePath);
      const module = modules.find(m => m.controller === controller);

      if (!module) return reply.code(404).send({ error: `Module "${controller}" not found` });

      const report = await testModule(clientSlug, clientUrl, module, sessionCookie);
      return reply.send({ data: report });
    } catch (err) {
      return reply.code(500).send({ error: `Module test failed: ${(err as Error).message}` });
    }
  });

  /** Test ALL modules against a client */
  app.post<{ Body: {
    clientSlug: string; clientUrl: string; sourceSlug: string;
    sessionCookie?: string; layer?: 'admin' | 'web';
  } }>('/module-test/full', async (request, reply) => {
    const { clientSlug, clientUrl, sourceSlug, sessionCookie, layer } = request.body;

    try {
      const { testAllModules } = await import('../lib/module-tester.js');
      const basePath = getSourcePath(sourceSlug, 'base');
      const report = await testAllModules(clientSlug, clientUrl, basePath, sessionCookie, layer);
      return reply.send({ data: report });
    } catch (err) {
      return reply.code(500).send({ error: `Full module test failed: ${(err as Error).message}` });
    }
  });
}
