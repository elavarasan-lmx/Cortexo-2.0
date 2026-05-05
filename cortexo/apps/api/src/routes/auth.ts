import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { users, organizations } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import type { JwtUser } from '../middleware/auth.js';

// ── Auth Zod Schemas ────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  orgName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
}).refine(data => data.name || data.email, { message: 'At least one field (name or email) is required' });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

/**
 * Password hashing with scrypt (Node.js built-in, no bcrypt needed).
 * Format: salt:hash (both hex-encoded).
 */
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, storedHash] = hash.split(':');
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(key.toString('hex') === storedHash);
    });
  });
}

/**
 * Generate a signed JWT access token (15min expiry, set in authPlugin).
 */
function signAccessToken(app: FastifyInstance, user: { id: string; email: string; name: string; orgId: string; role: string }): string {
  const payload: JwtUser = {
    sub: user.id,
    email: user.email,
    name: user.name,
    orgId: user.orgId,
    role: user.role,
  };
  return app.jwt.sign(payload);
}

/**
 * Generate a signed JWT refresh token (7 day expiry).
 */
function signRefreshToken(app: FastifyInstance, userId: string): string {
  return app.jwt.sign({ sub: userId, type: 'refresh' }, { expiresIn: '7d' });
}

export async function authRoutes(app: FastifyInstance) {
  // ── Stricter rate limits for auth endpoints (brute-force protection) ──
  const authRateLimit = { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } };

  /**
   * POST /auth/register
   * Creates user + org, returns signed JWT tokens
   */
  app.post('/auth/register', authRateLimit, async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { name, email, password, orgName } = parsed.data;

    try {
      const db = await getDb();

      // Check if email already exists
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existing) {
        return reply.code(409).send({ error: 'Email already registered' });
      }

      // Create organization
      const orgId = crypto.randomUUID();
      const orgSlug = (orgName || name).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      await db.insert(organizations).values({
        id: orgId,
        name: orgName || `${name}'s Org`,
        slug: orgSlug + '-' + orgId.slice(0, 4),
        plan: 'free',
      });

      // Create user
      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(password);
      await db.insert(users).values({
        id: userId,
        orgId,
        name,
        email,
        passwordHash,
        role: 'admin',
      });

      const token = signAccessToken(app, { id: userId, email, name, orgId, role: 'admin' });
      const refreshToken = signRefreshToken(app, userId);

      return {
        token,
        refreshToken,
        user: { id: userId, name, email, role: 'admin', orgId },
      };
    } catch (err: unknown) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to create account' });
    }
  });

  /**
   * POST /auth/login
   * Email + password login, returns signed JWT tokens
   */
  app.post('/auth/login', authRateLimit, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { email, password } = parsed.data;

    try {
      const db = await getDb();

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user || !user.passwordHash) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      const token = signAccessToken(app, {
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId || '',
        role: user.role || 'member',
      });
      const refreshToken = signRefreshToken(app, user.id);

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (err: unknown) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Login failed' });
    }
  });

  /**
   * GET /auth/me
   * Get current user from verified JWT token
   */
  app.get('/auth/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    try {
      const decoded = app.jwt.verify<JwtUser>(authHeader.replace('Bearer ', ''));

      const db = await getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.sub),
      });

      if (!user) {
        return reply.code(401).send({ error: 'User not found' });
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (err: unknown) {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });

  /**
   * PUT /auth/profile
   * Update current user's profile (name, email)
   */
  app.put('/auth/profile', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    try {
      const decoded = app.jwt.verify<JwtUser>(authHeader.replace('Bearer ', ''));
      const parsed = profileSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
      const { name, email } = parsed.data;

      const db = await getDb();
      const updateData: Record<string, string> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await db.update(users).set(updateData).where(eq(users.id, decoded.sub));

      const user = await db.query.users.findFirst({ where: eq(users.id, decoded.sub) });
      if (!user) return reply.code(404).send({ error: 'User not found' });

      // Return new token with updated claims
      const newToken = signAccessToken(app, {
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId || '',
        role: user.role || 'member',
      });

      return {
        token: newToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, orgId: user.orgId },
      };
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') return reply.code(409).send({ error: 'Email already in use' });
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to update profile' });
    }
  });

  /**
   * POST /auth/change-password
   * Change password (requires current password verification)
   */
  app.post('/auth/change-password', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    try {
      const decoded = app.jwt.verify<JwtUser>(authHeader.replace('Bearer ', ''));
      const parsed = changePasswordSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
      const { currentPassword, newPassword } = parsed.data;

      const db = await getDb();
      const user = await db.query.users.findFirst({ where: eq(users.id, decoded.sub) });
      if (!user || !user.passwordHash) {
        return reply.code(400).send({ error: 'Cannot change password for OAuth accounts' });
      }

      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return reply.code(401).send({ error: 'Current password is incorrect' });
      }

      const newHash = await hashPassword(newPassword);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, decoded.sub));

      return { message: 'Password changed successfully' };
    } catch (err: unknown) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to change password' });
    }
  });

  /**
   * GET /auth/github — GitHub OAuth redirect
   */
  app.get('/auth/github', async (_request, reply) => {
    const clientId = process.env.GITHUB_CLIENT_ID || '';
    const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:4000/v1/auth/github/callback';
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email,repo`;
    return reply.redirect(url);
  });

  /**
   * GET /auth/github/callback — GitHub OAuth callback
   */
  app.get('/auth/github/callback', async (request, reply) => {
    const { code } = request.query as { code?: string };
    if (!code) return reply.code(400).send({ error: 'Missing code parameter' });

    try {
      // Exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json() as { access_token?: string };
      if (!tokenData.access_token) return reply.code(401).send({ error: 'GitHub auth failed' });

      // Get user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const ghUser = await userRes.json() as { id: number; login: string; name?: string; email?: string; avatar_url?: string };

      const db = await getDb();
      let user = await db.query.users.findFirst({ where: eq(users.email, ghUser.email || `${ghUser.login}@github`) });

      if (!user) {
        const orgId = crypto.randomUUID();
        await db.insert(organizations).values({ id: orgId, name: `${ghUser.login}'s Org`, slug: ghUser.login, plan: 'free' });
        const userId = crypto.randomUUID();
        await db.insert(users).values({
          id: userId, orgId, name: ghUser.name || ghUser.login,
          email: ghUser.email || `${ghUser.login}@github`, role: 'admin',
          avatarUrl: ghUser.avatar_url, githubId: String(ghUser.id),
        });
        user = { id: userId, email: ghUser.email || `${ghUser.login}@github`, orgId, name: ghUser.name || ghUser.login, role: 'admin' } as typeof user;
      }

      const token = signAccessToken(app, {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        orgId: user!.orgId || '',
        role: user!.role || 'member',
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return reply.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (err: unknown) {
      app.log.error(err);
      return reply.code(500).send({ error: 'GitHub OAuth failed' });
    }
  });

  /**
   * POST /auth/refresh — Refresh JWT token using a valid refresh token
   */
  app.post('/auth/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body || {});
    const { refreshToken } = parsed.success ? parsed.data : { refreshToken: undefined };
    const authHeader = request.headers.authorization;

    // Accept refresh token from body or header
    const tokenStr = refreshToken || (authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null);
    if (!tokenStr) return reply.code(401).send({ error: 'No token provided' });

    try {
      const payload = app.jwt.verify<{ sub: string; type?: string }>(tokenStr);

      // Only accept refresh-type tokens for this endpoint
      if (payload.type !== 'refresh') {
        return reply.code(401).send({ error: 'Invalid token type. Use a refresh token.' });
      }

      const db = await getDb();
      const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) });
      if (!user) return reply.code(401).send({ error: 'User not found' });

      const newToken = signAccessToken(app, {
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId || '',
        role: user.role || 'member',
      });
      const newRefreshToken = signRefreshToken(app, user.id);

      return { token: newToken, refreshToken: newRefreshToken };
    } catch {
      return reply.code(401).send({ error: 'Token expired, please log in again' });
    }
  });

  /**
   * POST /auth/forgot-password — Send reset email
   */
  app.post('/auth/forgot-password', authRateLimit, async (request, reply) => {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { email } = parsed.data;

    const db = await getDb();
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    // Always return success (don't reveal if email exists)
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await db.update(users).set({
      resetToken,
      resetTokenExpiresAt: resetExpiry,
    }).where(eq(users.id, user.id));

    // Send password reset email (falls back to console.log if no RESEND_API_KEY)
    const { sendPasswordResetEmail } = await import('../lib/email.js');
    sendPasswordResetEmail({
      to: email,
      resetToken,
      userName: user.name,
    }).catch((e: Error) => app.log.warn('Password reset email failed: ' + e.message));

    app.log.info(`[Auth] Password reset token generated for ${email}`);

    return { message: 'If the email exists, a reset link has been sent' };
  });

  /**
   * POST /auth/reset-password — Reset with token
   */
  app.post('/auth/reset-password', authRateLimit, async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { token, password } = parsed.data;

    const db = await getDb();
    const user = await db.query.users.findFirst({ where: eq(users.resetToken!, token) });

    if (!user) return reply.code(400).send({ error: 'Invalid or expired reset token' });
    if (user.resetTokenExpiresAt && new Date(user.resetTokenExpiresAt) < new Date()) {
      return reply.code(400).send({ error: 'Reset token has expired' });
    }

    const passwordHash = await hashPassword(password);
    await db.update(users).set({
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    }).where(eq(users.id, user.id));

    return { message: 'Password reset successful' };
  });
}
