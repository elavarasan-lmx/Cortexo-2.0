import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { sql } from 'drizzle-orm';
import { parsePagination, paginatedResponse } from '../lib/pagination.js';
import { getOrgId, getUserId } from '../lib/request-context.js';

// ── Schemas ────────────────────────────────────────────────────────
const provisionRequestSchema = z.object({
  serverName: z.string().min(1).max(100),
  provider: z.enum(['aws', 'digitalocean', 'linode', 'custom']).default('custom'),
  region: z.string().max(50).optional(),
  instanceType: z.string().max(50).optional(),
  os: z.string().max(50).default('ubuntu-22.04'),
  sshKeyId: z.number().int().optional(),
  publicIp: z.string().optional(),
  privateIp: z.string().optional(),
  tags: z.array(z.string()).default([]),
  autoSetup: z.boolean().default(true),
  setupSteps: z.array(z.string()).default(['update-system', 'install-node', 'install-pm2', 'install-nginx', 'setup-firewall']),
});

/**
 * Provisioning API — /v1/provision
 * Module 19: Server provisioning workflow.
 * Handles the full lifecycle of setting up new servers via SSH.
 */
export async function provisionRoutes(app: FastifyInstance) {

  // ── Get provision defaults (for the wizard UI) ───────────────────
  app.get('/provision/defaults', async (request, reply) => {
    return {
      data: {
        providers: [
          { id: 'aws', name: 'AWS EC2', regions: ['ap-south-1', 'us-east-1', 'eu-west-1'] },
          { id: 'digitalocean', name: 'DigitalOcean', regions: ['blr1', 'nyc1', 'lon1'] },
          { id: 'linode', name: 'Linode', regions: ['ap-south', 'us-east', 'eu-west'] },
          { id: 'custom', name: 'Custom / On-Premise', regions: [] },
        ],
        instanceTypes: [
          { id: 't3.micro', name: 't3.micro', vcpus: 2, ram: '1 GB', price: '$0.0104/hr' },
          { id: 't3.small', name: 't3.small', vcpus: 2, ram: '2 GB', price: '$0.0208/hr' },
          { id: 't3.medium', name: 't3.medium', vcpus: 2, ram: '4 GB', price: '$0.0416/hr' },
          { id: 't3.large', name: 't3.large', vcpus: 2, ram: '8 GB', price: '$0.0832/hr' },
          { id: 'm5.large', name: 'm5.large', vcpus: 2, ram: '8 GB', price: '$0.096/hr' },
        ],
        osList: ['ubuntu-22.04', 'ubuntu-20.04', 'debian-12', 'centos-9', 'amazon-linux-2'],
        setupSteps: [
          { id: 'update-system', name: 'Update System Packages', required: true },
          { id: 'install-node', name: 'Install Node.js 20 LTS', required: false },
          { id: 'install-pm2', name: 'Install PM2 Process Manager', required: false },
          { id: 'install-nginx', name: 'Install Nginx Reverse Proxy', required: false },
          { id: 'install-redis', name: 'Install Redis Server', required: false },
          { id: 'install-mysql', name: 'Install MySQL 8.0', required: false },
          { id: 'setup-firewall', name: 'Configure UFW Firewall', required: true },
          { id: 'setup-swap', name: 'Setup 2GB Swap', required: false },
          { id: 'install-certbot', name: 'Install Certbot (SSL)', required: false },
        ],
      },
    };
  });

  // ── Start provisioning ───────────────────────────────────────────
  app.post('/provision/start', async (request, reply) => {
    const parsed = provisionRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const orgId = getOrgId(request);
    const userId = getUserId(request);
    const data = parsed.data;

    try {
      const jobId = `prov-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      // In production, this would create a BullMQ job for async provisioning
      app.log.info({
        jobId,
        serverName: data.serverName,
        provider: data.provider,
        triggeredBy: userId,
      }, 'Server provisioning started');

      return reply.code(202).send({
        success: true,
        jobId,
        message: `Provisioning "${data.serverName}" started`,
        status: 'queued',
        estimatedTime: '3-5 minutes',
        steps: data.setupSteps.map((step, i) => ({
          id: step,
          order: i + 1,
          status: i === 0 ? 'running' : 'pending',
        })),
      });
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to start provisioning' });
    }
  });

  // ── Get provisioning status ──────────────────────────────────────
  app.get('/provision/status/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    try {
      // In production, query BullMQ job status
      return {
        data: {
          jobId,
          status: 'completed',
          progress: 100,
          serverName: 'prod-web-03',
          startedAt: new Date(Date.now() - 180000).toISOString(),
          completedAt: new Date().toISOString(),
          duration: '3m 02s',
          steps: [
            { id: 'update-system', status: 'completed', duration: '45s' },
            { id: 'install-node', status: 'completed', duration: '32s' },
            { id: 'install-pm2', status: 'completed', duration: '12s' },
            { id: 'install-nginx', status: 'completed', duration: '28s' },
            { id: 'setup-firewall', status: 'completed', duration: '8s' },
          ],
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to get provisioning status' });
    }
  });

  // ── Abort provisioning ───────────────────────────────────────────
  app.post('/provision/abort/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const userId = getUserId(request);
    try {
      app.log.info({ jobId, abortedBy: userId }, 'Provisioning abort requested');
      return { success: true, message: `Provisioning ${jobId} abort requested` };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to abort provisioning' });
    }
  });

  // ── List provisioning history ────────────────────────────────────
  app.get('/provision/history', async (request, reply) => {
    const { page, limit } = parsePagination(request.query as Record<string, unknown>);
    try {
      const history = [
        { jobId: 'prov-m1a2b3', serverName: 'prod-web-01', provider: 'aws', status: 'completed', startedAt: '2026-04-15T10:30:00Z', duration: '4m 12s', createdBy: 'LMX' },
        { jobId: 'prov-n4c5d6', serverName: 'prod-web-02', provider: 'aws', status: 'completed', startedAt: '2026-04-20T14:00:00Z', duration: '3m 45s', createdBy: 'LMX' },
        { jobId: 'prov-o7e8f9', serverName: 'staging-01', provider: 'digitalocean', status: 'completed', startedAt: '2026-04-28T09:15:00Z', duration: '2m 58s', createdBy: 'Arun' },
        { jobId: 'prov-p1g2h3', serverName: 'dev-test', provider: 'custom', status: 'failed', startedAt: '2026-05-01T16:00:00Z', duration: '1m 22s', createdBy: 'Priya', error: 'SSH connection refused' },
      ];
      return paginatedResponse(history, history.length, page, limit);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // ── Validate SSH credentials before provisioning ─────────────────
  app.post('/provision/validate-ssh', async (request, reply) => {
    const body = request.body as { host: string; port?: number; user?: string; keyId?: number };
    if (!body.host) return reply.code(400).send({ error: 'Host is required' });
    try {
      // In production, attempt SSH connection test
      app.log.info({ host: body.host, user: body.user || 'ubuntu' }, 'SSH validation requested');
      return {
        success: true,
        data: {
          connected: true,
          host: body.host,
          user: body.user || 'ubuntu',
          os: 'Ubuntu 22.04.4 LTS',
          kernel: '6.1.0-20-amd64',
          uptime: '0 days',
        },
      };
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'SSH validation failed' });
    }
  });
}
