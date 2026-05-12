'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * Wraps the app in a TanStack QueryClientProvider.
 * Must be a client component so QueryClient can be created per-session.
 *
 * Config decisions:
 *  - staleTime 60s  — avoid re-fetching on every tab focus for stable lists
 *  - gcTime 5min    — keep cached data alive while navigating the SPA
 *  - retry 1        — one retry on network errors (not on 4xx)
 *  - refetchOnWindowFocus false — prevents jarring reloads when switching apps
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
