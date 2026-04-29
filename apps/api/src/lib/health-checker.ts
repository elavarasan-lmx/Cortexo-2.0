/**
 * Health Checker — Pings each Winbull client's URL and checks HTTP status + response time.
 *
 * Can be triggered:
 *   - Manually via API: POST /v1/health/check-all
 *   - On a schedule via cron/setInterval (configured at startup)
 *
 * Results are stored in client_configs.healthScore and a health_checks table.
 */
import { getDb } from './db.js';
import { clientConfigs } from '@cortexo/db';
import { eq } from 'drizzle-orm';

export interface HealthCheckResult {
  clientSlug: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down' | 'timeout';
  httpStatus: number | null;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
}

/**
 * Check a single URL's health.
 */
export async function checkUrl(url: string, timeoutMs = 10_000): Promise<{
  httpStatus: number | null;
  responseTimeMs: number;
  status: 'healthy' | 'degraded' | 'down' | 'timeout';
  error?: string;
}> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    const responseTimeMs = Date.now() - start;
    const httpStatus = res.status;

    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (httpStatus >= 500) status = 'down';
    else if (httpStatus >= 400) status = 'degraded';
    else if (responseTimeMs > 5000) status = 'degraded';

    return { httpStatus, responseTimeMs, status };
  } catch (err: any) {
    clearTimeout(timer);
    const responseTimeMs = Date.now() - start;

    if (err.name === 'AbortError') {
      return { httpStatus: null, responseTimeMs, status: 'timeout', error: 'Request timed out' };
    }
    return { httpStatus: null, responseTimeMs, status: 'down', error: err.message };
  }
}

/**
 * Run health checks on all active clients.
 */
export async function checkAllClients(): Promise<HealthCheckResult[]> {
  const db = await getDb();
  const clients = await db.select().from(clientConfigs);
  const results: HealthCheckResult[] = [];

  for (const client of clients) {
    if (!client.domain && !(client.configData as any)?.urls?.web_base_url) continue;

    const url = client.domain
      ? (client.domain.startsWith('http') ? client.domain : `http://${client.domain}`)
      : (client.configData as any)?.urls?.web_base_url;

    if (!url) continue;

    const check = await checkUrl(url);

    // Map to health score (0-100)
    let healthScore = 100;
    if (check.status === 'degraded') healthScore = 60;
    else if (check.status === 'down') healthScore = 10;
    else if (check.status === 'timeout') healthScore = 5;
    else if (check.responseTimeMs > 3000) healthScore = 70;
    else if (check.responseTimeMs > 1000) healthScore = 85;

    // Update client health score
    try {
      await db.update(clientConfigs)
        .set({ healthScore } as any)
        .where(eq(clientConfigs.id, client.id));
    } catch { /* best-effort */ }

    results.push({
      clientSlug: client.clientSlug,
      url,
      ...check,
      checkedAt: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * Start automated health checks on an interval.
 */
let healthInterval: ReturnType<typeof setInterval> | null = null;

export function startHealthScheduler(intervalMinutes = 5) {
  if (healthInterval) clearInterval(healthInterval);

  console.log(`[HealthCheck] Scheduler started — checking every ${intervalMinutes} minutes`);

  healthInterval = setInterval(async () => {
    try {
      const results = await checkAllClients();
      const down = results.filter(r => r.status === 'down' || r.status === 'timeout');
      if (down.length > 0) {
        console.warn(`[HealthCheck] ${down.length} clients DOWN:`, down.map(d => d.clientSlug).join(', '));
      } else {
        console.log(`[HealthCheck] All ${results.length} clients healthy`);
      }
    } catch (err) {
      console.error('[HealthCheck] Scheduler error:', err);
    }
  }, intervalMinutes * 60 * 1000);
}

export function stopHealthScheduler() {
  if (healthInterval) {
    clearInterval(healthInterval);
    healthInterval = null;
  }
}
