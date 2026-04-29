'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './api';

/**
 * Generic hook for fetching API data with loading/error states.
 * Provides refetch callback for manual refresh.
 */
export function useApiData<T>(
  fetcher: () => Promise<{ data: T; total?: number }>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetcher();
      setData(res.data);
      setTotal(res.total ?? 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

/**
 * Hook: loads projects and returns a lookup map (id → project).
 * Use this in pages that need to resolve projectId to project names.
 */
export function useProjectLookup() {
  const { data: projects } = useApiData(() => api.getProjects());
  const lookup = useMemo(() => {
    const map = new Map<string, { name: string; repoUrl?: string }>();
    (projects || []).forEach((p: any) => {
      map.set(p.id, { name: p.name, repoUrl: p.repoUrl });
    });
    return map;
  }, [projects]);

  return { projects, lookup };
}

/**
 * Hook: auto-loads the stored auth token on mount.
 */
export function useAutoLoadToken() {
  useEffect(() => {
    api.loadToken();
  }, []);
}

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
 * Helper: format relative time from ISO date string
 */
export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
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
