import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '@cortexo/db/schema';
import { authConfig } from './auth.config';

// ─── UNSAFE_DEV_AUTH guard (web / NextAuth side) ──────────────────────────────
// The API (apps/api/src/index.ts) has a matching check that calls process.exit(1)
// in production. This side prints a loud banner so the Next.js console also shows
// the warning — both processes need to scream so no one misses it.
if (process.env.UNSAFE_DEV_AUTH === 'true') {
  if (process.env.NODE_ENV === 'production') {
    // In production on the web side we can't easily abort startup,
    // but we make it impossible to miss in logs / crash reporters.
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  🚨 FATAL: UNSAFE_DEV_AUTH=true in PRODUCTION! (web)        ║
║  This bypasses password verification in NextAuth.            ║
║  Remove UNSAFE_DEV_AUTH from your production .env NOW.       ║
╚══════════════════════════════════════════════════════════════╝
`);
    // Force a hard crash — do not silently continue in prod.
    throw new Error(
      'UNSAFE_DEV_AUTH=true is not allowed in production. ' +
      'Remove it from your environment variables.',
    );
  } else {
    console.warn(`
╔══════════════════════════════════════════════════════════════╗
║  ⚠️  WARNING: UNSAFE_DEV_AUTH=true (web / NextAuth)         ║
║  Password verification is SKIPPED — dev only!               ║
║  Any valid email in the DB will log in without a password.  ║
║  Never set this in staging or production.                    ║
╚══════════════════════════════════════════════════════════════╝
`);
  }
}


/**
 * Verify a password against a scrypt hash (format: "salt:hash").
 * Falls back to bcrypt comparison for legacy hashes starting with "$2".
 */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Legacy bcrypt hash — fallback
  if (stored.startsWith('$2')) {
    const { compare } = await import('bcryptjs');
    return compare(password, stored);
  }

  // Scrypt format: "salt:hash"
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(key.toString('hex') === storedHash);
    });
  });
}

/**
 * NextAuth.js v5 full configuration for Cortexo (server-side only).
 *
 * Extends the edge-safe auth.config.ts with Node.js-only providers:
 * - GitHub OAuth (primary for developers)
 * - Google OAuth (secondary)
 * - Email/Password (Credentials provider with scrypt/bcrypt + MariaDB)
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { prompt: 'consent', access_type: 'offline' },
      },
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = getDb();
          if (!db) return null;

          // Query user by email
          const result = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          const user = result[0];
          if (!user || !user.passwordHash) return null;

          // DEV BYPASS: Skip password verification in development
          const isDevBypass = process.env.UNSAFE_DEV_AUTH === 'true' && process.env.NODE_ENV !== 'production';

          if (!isDevBypass) {
            // Verify password (supports scrypt + legacy bcrypt)
            const valid = await verifyPassword(
              credentials.password as string,
              user.passwordHash,
            );
            if (!valid) return null;
          }

          // Update last login timestamp
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatarUrl,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    /**
     * OAuth sign-in: upsert user in DB on first login.
     * For Credentials, the authorize() function handles it already.
     */
    async signIn({ user, account, profile }) {
      // Credentials are handled by authorize() above
      if (account?.provider === 'credentials') return true;

      // OAuth: create or update user in DB
      try {
        const db = getDb();
        if (!db) {
          console.error('[Auth] DB not available for OAuth sign-in');
          return false;
        }

        const email = user.email || profile?.email;
        if (!email) {
          console.error('[Auth] No email from OAuth provider');
          return false;
        }

        // Check if user exists
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, email as string))
          .limit(1);

        if (existing[0]) {
          // Update existing user with OAuth info + last login
          await db
            .update(users)
            .set({
              provider: account?.provider,
              providerId: account?.providerAccountId,
              avatarUrl: user.image || existing[0].avatarUrl,
              lastLoginAt: new Date(),
              ...(account?.provider === 'github' ? { githubId: account.providerAccountId } : {}),
            })
            .where(eq(users.id, existing[0].id));

          // Set the user ID to match our DB
          user.id = existing[0].id;
        } else {
          // Create new user from OAuth
          const newUser = await db
            .insert(users)
            .values({
              name: user.name || profile?.name || email.split('@')[0],
              email: email as string,
              avatarUrl: user.image || null,
              provider: account?.provider,
              providerId: account?.providerAccountId,
              role: 'member',
              lastLoginAt: new Date(),
              ...(account?.provider === 'github' ? { githubId: account.providerAccountId } : {}),
            })
            .returning({ id: users.id });

          user.id = newUser[0].id;
        }

        console.log(`[Auth] OAuth sign-in OK: ${email} via ${account?.provider}`);
        return true;
      } catch (error) {
        console.error('[Auth] OAuth sign-in error:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // On initial sign-in, persist user.id from DB
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
});
