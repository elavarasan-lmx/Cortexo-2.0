'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

/**
 * Wraps the app with NextAuth's SessionProvider for client-side auth hooks.
 * Required for useSession(), signIn(), signOut() to work in client components.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
