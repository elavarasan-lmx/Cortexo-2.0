import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import type { NextAuthConfig } from 'next-auth';
import { getDb } from './db';
import { users } from '@cortexo/db/schema';

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
 * NextAuth.js v5 configuration for Cortexo.
 *
 * Providers:
 * - GitHub OAuth (primary for developers)
 * - Google OAuth (secondary)
 * - Email/Password (Credentials provider with bcrypt + MariaDB)
 *
 * JWT strategy: 15min access, 7d refresh (per security design in 02_tech_architecture.md)
 */
const authConfig: NextAuthConfig = {
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

          // Verify password (supports scrypt + legacy bcrypt)
          const valid = await verifyPassword(
            credentials.password as string,
            user.passwordHash,
          );
          if (!valid) return null;

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

  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
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
      // After sign in, redirect to dashboard
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
