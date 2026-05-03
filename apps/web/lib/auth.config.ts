import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible NextAuth config (no Node.js-only imports).
 * Used by middleware.ts which runs in the Edge Runtime.
 *
 * Providers with DB access (Credentials) are added in auth.ts (Node.js runtime only).
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicPaths = ['/login', '/register', '/forgot-password'];
      const isPublicPath = publicPaths.some((path) => nextUrl.pathname.startsWith(path));
      const isApiRoute = nextUrl.pathname.startsWith('/api');
      const isLandingPage = nextUrl.pathname === '/';

      // Always allow API routes & landing page
      if (isApiRoute || isLandingPage) return true;

      // Redirect logged-in users away from auth pages
      if (isPublicPath && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Redirect unauthenticated users to login
      if (!isPublicPath && !isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },

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
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },

  providers: [], // Providers added in auth.ts (Node.js runtime)
} satisfies NextAuthConfig;
