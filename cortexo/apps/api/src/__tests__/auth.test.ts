/**
 * Cortexo API — Auth Endpoint Tests
 *
 * Tests the full auth flow: register → login → me → token refresh.
 * Uses unique emails to avoid collisions with existing data.
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = process.env.API_URL || 'http://localhost:4000/v1';

// Generate unique test email to avoid collisions
const testEmail = `test-${Date.now()}@cortexo-test.dev`;
const testPassword = 'TestPass123!';
let authToken = '';
let refreshToken = '';

async function post(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(path: string, token: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, data: await res.json() };
}

describe('Auth Endpoints', () => {
  it('POST /auth/register — creates new user', async () => {
    const { status, data } = await post('/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
      orgName: 'Test Org',
    });

    expect(status).toBe(200);
    expect(data.token).toBeDefined();
    expect(data.refreshToken).toBeDefined();
    expect(data.user.email).toBe(testEmail);
    expect(data.user.role).toBe('admin');

    authToken = data.token;
    refreshToken = data.refreshToken;
  });

  it('POST /auth/register — rejects duplicate email', async () => {
    const { status, data } = await post('/auth/register', {
      name: 'Duplicate',
      email: testEmail,
      password: testPassword,
    });

    expect(status).toBe(409);
    expect(data.error).toContain('already');
  });

  it('POST /auth/login — authenticates valid user', async () => {
    const { status, data } = await post('/auth/login', {
      email: testEmail,
      password: testPassword,
    });

    expect(status).toBe(200);
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe(testEmail);
    authToken = data.token;
  });

  it('POST /auth/login — rejects wrong password', async () => {
    const { status, data } = await post('/auth/login', {
      email: testEmail,
      password: 'WrongPassword123',
    });

    expect(status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it('GET /auth/me — returns current user', async () => {
    const { status, data } = await get('/auth/me', authToken);

    expect(status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testEmail);
    expect(data.user.name).toBe('Test User');
  });

  it('GET /auth/me — rejects invalid token', async () => {
    const { status } = await get('/auth/me', 'invalid-token-123');
    expect(status).toBe(401);
  });

  it('POST /auth/register — rejects short password', async () => {
    const { status, data } = await post('/auth/register', {
      name: 'Short Pass',
      email: 'short@test.dev',
      password: '123',
    });

    expect(status).toBe(400);
    expect(data.error).toContain('Validation');
  });
});
