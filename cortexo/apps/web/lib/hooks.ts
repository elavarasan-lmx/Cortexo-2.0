'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { api, type Project } from './api';

// ─── TanStack Query ──────────────────────────────────────────────────────────

export { useQueryClient };

/**
 * `useCortexoQuery` — typed wrapper over TanStack `useQuery`.
 *
 * - Automatically calls `api.loadToken()` as part of the queryFn.
 * - Expects fetchers that return `{ data: T }` (same shape as the API client).
 * - Returns `{ data, isLoading, isError, error, refetch }` from TanStack.
 *
 * Usage:
 * ```ts
 * const { data: projects, isLoading } = useCortexoQuery(
 *   ['projects'],
 *   () => api.getProjects(),
 * );
 * ```
 */
export function useCortexoQuery<T>(
  key: readonly unknown[],
  fetcher: () => Promise<{ data: T; total?: number }>,
  options?: Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, Error, T, readonly unknown[]>({
    queryKey: key,
    queryFn: async () => {
      api.loadToken();
      const res = await fetcher();
      return res.data;
    },
    ...options,
  });
}


/**
 * Hook: loads projects and returns a lookup map (id → project).
 * Use this in pages that need to resolve projectId to project names.
 * Uses the shared 'projects' cache key so data is reused across pages.
 */
export function useProjectLookup() {
  const { data: projects } = useCortexoQuery(
    ['projects'],
    () => api.getProjects(),
    { staleTime: 5 * 60 * 1000 },  // 5 min — projects rarely change
  );
  const lookup = useMemo(() => {
    const map = new Map<string, { name: string; repoUrl?: string }>();
    (projects || []).forEach((p: Project) => {
      map.set(p.id, { name: p.name, repoUrl: p.repoUrl ?? undefined });
    });
    return map;
  }, [projects]);

  return { projects, lookup };
}

/**
 * Hook: loads servers with shared cache and staleTime.
 * 7+ pages use the ['servers'] cache key — this ensures consistent caching.
 */
export function useServers() {
  return useCortexoQuery(
    ['servers'],
    () => api.getServers(),
    { staleTime: 2 * 60 * 1000 },  // 2 min — servers change less often than deployments
  );
}

// useAutoLoadToken — REMOVED
// Token loading is now handled internally by useCortexoQuery.

/**
 * Helper: safely parse a JSON field that may be a string or already parsed.
 * MySQL/MariaDB often returns JSON columns as strings.
 */
export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'object' && value !== null) return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Helper: resolve a projectId to a human-readable name using a lookup map.
 */
export function resolveProjectName(
  projectId: string,
  lookup: Map<string, { name: string }>,
): string {
  return lookup.get(projectId)?.name || projectId;
}

/**
 * Helper: format relative time from ISO date string, Date object, or null.
 * Canonical implementation — use this instead of local formatRelativeTime copies.
 */
export function timeAgo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

/**
 * Helper: format duration from milliseconds
 */
export function formatDuration(ms: number | null | undefined): string {
  if (!ms) return '—';
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}
