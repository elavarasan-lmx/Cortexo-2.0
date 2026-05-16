import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDb } from '../lib/db.js';
import { users } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import type { JwtUser } from '../middleware/auth.js';

// ── Auth Zod Schemas ────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
 * Generate a signed JWT access token (15min expiry, set in index.ts JWT config).
 */
function signAccessToken(app: FastifyInstance, user: { id: string; email: string; name: string; role: string }): string {
  const payload: JwtUser = {
    sub: user.id,
    email: user.email,
    name: user.name,
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
    const { name, email, password } = parsed.data;

    try {
      const db = await getDb();

      // Check if email already exists
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existing) {
        return reply.code(409).send({ error: 'Email already registered' });
      }

      // Create user
      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(password);
      await db.insert(users).values({
        id: userId,
        name,
        email,
        passwordHash,
        role: 'admin',
      });

      const token = signAccessToken(app, { id: userId, email, name, role: 'admin' });
      const refreshToken = signRefreshToken(app, userId);

      return {
        data: {
          token,
          refreshToken,
          user: { id: userId, name, email, role: 'admin' },
        }
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
        role: user.role || 'member',
      });
      const refreshToken = signRefreshToken(app, user.id);

      return {
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
        }
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
    console.log('--- GET /auth/me ---');
    console.log('authHeader:', authHeader);

    // Support dev bypass: if UNSAFE_DEV_AUTH is on and middleware set request.user
    if (!authHeader?.startsWith('Bearer ')) {
      const devUser = (request as any).user;
      if (process.env.UNSAFE_DEV_AUTH === 'true') {
        // In dev mode, return the dev user from the database if possible, else synthetic
        try {
          const db = await getDb();
          const user = await db.query.users.findFirst();
          if (user) {
            return {
              data: {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  avatarUrl: user.avatarUrl,
                },
              }
            };
          }
        } catch { /* fall through to synthetic user */ }
        return {
          data: {
            user: {
              id: devUser?.sub || 'dev-user',
              name: devUser?.name || 'Developer',
              email: devUser?.email || 'dev-bypass@cortexo.local',
              role: devUser?.role || 'admin',
              avatarUrl: null,
            },
          }
        };
      }
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
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
        }
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

    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = app.jwt.verify<JwtUser>(authHeader.replace('Bearer ', ''));
        userId = decoded.sub;
      } catch { /* fall through */ }
    }

    // Dev bypass: find first user if no token
    if (!userId && process.env.UNSAFE_DEV_AUTH === 'true') {
      try {
        const db = await getDb();
        const firstUser = await db.query.users.findFirst();
        if (firstUser) userId = firstUser.id;
      } catch { /* fall through */ }
    }

    if (!userId) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    try {
      const parsed = profileSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
      const { name, email } = parsed.data;

      const db = await getDb();
      const updateData: Record<string, string> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await db.update(users).set(updateData).where(eq(users.id, userId));

      const user = await db.query.users.findFirst({ where: eq(users.id, userId!) });
      if (!user) return reply.code(404).send({ error: 'User not found' });

      // Return new token with updated claims
      const newToken = signAccessToken(app, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'member',
      });

      return {
        data: {
          token: newToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        }
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

    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = app.jwt.verify<JwtUser>(authHeader.replace('Bearer ', ''));
        userId = decoded.sub;
      } catch { /* fall through */ }
    }

    // Dev bypass: find first user if no token
    if (!userId && process.env.UNSAFE_DEV_AUTH === 'true') {
      try {
        const db = await getDb();
        const firstUser = await db.query.users.findFirst();
        if (firstUser) userId = firstUser.id;
      } catch { /* fall through */ }
    }

    if (!userId) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    try {
      const parsed = changePasswordSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
      const { currentPassword, newPassword } = parsed.data;

      const db = await getDb();
      const user = await db.query.users.findFirst({ where: eq(users.id, userId!) });
      if (!user || !user.passwordHash) {
        return reply.code(400).send({ error: 'Cannot change password for OAuth accounts' });
      }

      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return reply.code(401).send({ error: 'Current password is incorrect' });
      }

      const newHash = await hashPassword(newPassword);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId!));

      return { data: { message: 'Password changed successfully' } };
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
        const userId = crypto.randomUUID();
        await db.insert(users).values({
          id: userId, name: ghUser.name || ghUser.login,
          email: ghUser.email || `${ghUser.login}@github`, role: 'admin',
          avatarUrl: ghUser.avatar_url, githubId: String(ghUser.id),
        });
        user = { id: userId, email: ghUser.email || `${ghUser.login}@github`, name: ghUser.name || ghUser.login, role: 'admin' } as any;
      }

      const token = signAccessToken(app, {
        id: user!.id,
        email: user!.email,
        name: user!.name,
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
        role: user.role || 'member',
      });
      const newRefreshToken = signRefreshToken(app, user.id);

      return { data: { token: newToken, refreshToken: newRefreshToken } };
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
    if (!user) return { data: { message: 'If the email exists, a reset link has been sent' } };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await db.update(users).set({
      resetToken,
      resetTokenExpiresAt: resetExpiry,
    }).where(eq(users.id, user.id));

    // Send password reset email via SMTP (credentials from vault)
    const { sendEmail } = await import('../lib/mailer.js');
    const APP_URL = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
    sendEmail({
      to: email,
      subject: '🔐 Reset your Cortexo password',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #0f0f13; color: #e2e8f0; }
    .container { max-width: 560px; margin: 32px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .header { background: linear-gradient(135deg, #6366f1, #818cf8); padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; color: #fff; }
    .body { padding: 28px 32px; }
    .cta { display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; margin: 24px 0; }
    .footer { padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06); color: #475569; font-size: 11px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🔐 Password Reset</h1></div>
    <div class="body">
      <p style="color:#94a3b8;margin:0 0 16px">Hi <strong style="color:#f1f5f9">${user.name}</strong>,</p>
      <p style="color:#94a3b8;margin:0 0 16px">We received a request to reset your Cortexo password. Click the button below to set a new password:</p>
      <a href="${resetUrl}" class="cta">Reset Password →</a>
      <p style="color:#64748b;font-size:12px;margin:16px 0 0">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">Cortexo DevOps Intelligence</div>
  </div>
</body>
</html>`,
    }).catch((e: Error) => app.log.warn('Password reset email failed: ' + e.message));

    app.log.info(`[Auth] Password reset token generated for ${email}`);

    return { data: { message: 'If the email exists, a reset link has been sent' } };
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

    return { data: { message: 'Password reset successful' } };
  });
}
