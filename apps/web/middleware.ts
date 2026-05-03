import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Middleware — Protects all dashboard routes.
 * Unauthenticated users are redirected to /login.
 * Auth pages (/login, /register, /forgot-password) are accessible without session.
 * API routes are excluded (they handle their own auth).
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.some((path) => nextUrl.pathname.startsWith(path));
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  // Skip middleware for API routes (they handle auth internally)
  if (isApiRoute) return NextResponse.next();

  // Redirect logged-in users away from auth pages to dashboard
  if (isPublicPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isPublicPath && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

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
