import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

/**
 * Edge-compatible middleware — uses auth.config.ts (no Node.js modules).
 *
 * Route protection logic is in the `authorized` callback (auth.config.ts):
 * - Unauthenticated users → redirect to /login
 * - Logged-in users on auth pages → redirect to /dashboard
 * - API routes & landing page → always allowed
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$).*)',
  ],
};
