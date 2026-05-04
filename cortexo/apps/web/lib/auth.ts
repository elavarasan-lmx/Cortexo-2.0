import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '@cortexo/db/schema';
import { authConfig } from './auth.config';

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
});
