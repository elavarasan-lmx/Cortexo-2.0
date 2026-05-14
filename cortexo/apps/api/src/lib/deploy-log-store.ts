import { getRedis } from '../lib/redis.js';
import type { DeployLog, DeployResult } from '../lib/ssh-executor.js';

// ── Deploy log store (Redis + in-memory fallback) ────────────────────────
// Redis is preferred (survives server restarts), but if Redis is down,
// we fall back to an in-memory Map so live terminal still works.
const DEPLOY_LOG_PREFIX = 'cortexo:deploy-logs:';
const DEPLOY_LOG_TTL = 7200; // 2 hours

// In-memory fallback store (for when Redis is unavailable)
const memoryLogStore = new Map<string, { data: string; expiresAt: number }>();

function memCleanup() {
  const now = Date.now();
  for (const [k, v] of memoryLogStore) {
    if (v.expiresAt < now) memoryLogStore.delete(k);
  }
}

export async function getDeployLogs(deploymentId: string): Promise<{ logs: DeployLog[]; result?: DeployResult } | null> {
  // 1. Try Redis
  try {
    const redis = getRedis();
    const data = await redis.get(`${DEPLOY_LOG_PREFIX}${deploymentId}`);
    if (data) return JSON.parse(data);
  } catch { /* Redis unavailable */ }

  // 2. Fallback: in-memory
  const mem = memoryLogStore.get(deploymentId);
  if (mem && mem.expiresAt > Date.now()) {
    return JSON.parse(mem.data);
  }

  return null;
}

export async function setDeployLogs(deploymentId: string, entry: { logs: DeployLog[]; result?: DeployResult }): Promise<void> {
  const json = JSON.stringify(entry);

  // Always write to memory (fast, reliable)
  memoryLogStore.set(deploymentId, { data: json, expiresAt: Date.now() + DEPLOY_LOG_TTL * 1000 });

  // Also try Redis (best-effort)
  try {
    const redis = getRedis();
    await redis.set(`${DEPLOY_LOG_PREFIX}${deploymentId}`, json, 'EX', DEPLOY_LOG_TTL);
  } catch { /* Redis unavailable — memory fallback is active */ }

  // Periodic cleanup
  if (memoryLogStore.size > 50) memCleanup();
}

export async function deleteDeployLogs(deploymentId: string): Promise<void> {
  memoryLogStore.delete(deploymentId);
  try {
    const redis = getRedis();
    await redis.del(`${DEPLOY_LOG_PREFIX}${deploymentId}`);
  } catch { /* best-effort */ }
}
