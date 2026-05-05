/**
 * Cortexo API — Health Endpoint Tests
 *
 * Verifies the health and readiness endpoints return correct data.
 * These are the most basic "is the server alive?" tests.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = process.env.API_URL || 'http://localhost:4000/v1';

describe('Health Endpoints', () => {
  it('GET /health — returns 200 with status', async () => {
    const res = await fetch(`${API_BASE}/health`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('healthy');
    expect(body.data.service).toBe('cortexo-api');
    expect(typeof body.data.uptime).toBe('number');
    expect(body.data.version).toBeDefined();
  });

  it('GET /health/ready — returns DB and Redis status', async () => {
    const res = await fetch(`${API_BASE}/health/ready`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.checks).toBeDefined();
    expect(['connected', 'error']).toContain(body.data.checks.database);
    expect(['connected', 'error']).toContain(body.data.checks.redis);
  });
});
