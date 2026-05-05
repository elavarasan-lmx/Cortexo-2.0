/**
 * Cortexo API — Projects Endpoint Tests
 *
 * Tests CRUD operations on projects.
 * Requires authentication (uses UNSAFE_DEV_AUTH bypass in dev).
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = process.env.API_URL || 'http://localhost:4000/v1';
let authToken = '';
let projectId = '';

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { Authorization: `Bearer ${authToken}` };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
}

describe('Projects Endpoints', () => {
  beforeAll(async () => {
    // Create a test user to get an auth token
    const email = `proj-test-${Date.now()}@cortexo-test.dev`;
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Proj Test', email, password: 'TestPass123!' }),
    });
    const data = await res.json();
    authToken = data.token;
  });

  it('GET /projects — returns project list', async () => {
    const { status, data } = await request('GET', '/projects?limit=10');
    expect(status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('POST /projects — creates a new project', async () => {
    const { status, data } = await request('POST', '/projects', {
      name: `Test Project ${Date.now()}`,
      repoUrl: 'https://github.com/test/repo',
      repoProvider: 'github',
      defaultBranch: 'main',
      description: 'Integration test project',
    });

    expect(status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBeDefined();
    expect(data.data.name).toContain('Test Project');
    projectId = data.data.id;
  });

  it('GET /projects/:id — returns single project', async () => {
    if (!projectId) return;
    const { status, data } = await request('GET', `/projects/${projectId}`);

    expect(status).toBe(200);
    expect(data.data.id).toBe(projectId);
  });

  it('PATCH /projects/:id — updates project', async () => {
    if (!projectId) return;
    const { status, data } = await request('PATCH', `/projects/${projectId}`, {
      description: 'Updated by integration test',
    });

    expect(status).toBe(200);
    expect(data.data.description).toBe('Updated by integration test');
  });

  it('DELETE /projects/:id — deletes project', async () => {
    if (!projectId) return;
    const { status, data } = await request('DELETE', `/projects/${projectId}`);

    expect(status).toBe(200);
    expect(data.data.success).toBe(true);
  });

  it('GET /projects/:id — returns 404 after delete', async () => {
    if (!projectId) return;
    const { status } = await request('GET', `/projects/${projectId}`);
    expect(status).toBe(404);
  });
});
