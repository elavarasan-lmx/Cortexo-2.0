'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   useInfiniteScroll — infinite loading hook
   ───────────────────────────────────────────────────────────────────────────── */

interface UseInfiniteScrollOptions {
  /** Load more threshold (0-1). Default: 0.8 */
  threshold?: number;
  /** Initial page. Default: 1 */
  initialPage?: number;
  /** Disabled state */
  disabled?: boolean;
}

interface UseInfiniteScrollReturn {
  /** Current page */
  page: number;
  /** Loading state */
  loading: boolean;
  /** Has more data to load */
  hasMore: boolean;
  /** Error if any */
  error: Error | null;
  /** Load next page */
  loadMore: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Ref to attach to scroll container */
  sentinelRef: (node: HTMLDivElement | null) => void;
}

/**
 * useInfiniteScroll — hook for infinite scroll pagination.
 *
 * Usage:
 *   const { page, loading, hasMore, error, loadMore, sentinelRef } = useInfiniteScroll({
 *     threshold: 0.8,
 *     initialPage: 1,
 *   });
 *
 *   // Fetch more data when page changes
 *   useEffect(() => {
 *     if (page > 1) fetchData(page);
 *   }, [page]);
 *
 *   return <div ref={sentinelRef}>Load more...</div>;
 */
export function useInfiniteScroll({
  threshold = 0.8,
  initialPage = 1,
  disabled = false,
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn {
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || disabled) return;
    setPage((p) => p + 1);
  }, [loading, hasMore, disabled]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
  }, []);

  useEffect(() => {
    if (disabled || !sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !disabled) {
          loadMore();
        }
      },
      { rootMargin: `${threshold * 100}%` }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, hasMore, loading, disabled, loadMore]);

  return {
    page,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    sentinelRef: setSentinelRef,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   useDebounce — debounce value changes
   ───────────────────────────────────────────────────────────────────────────── */

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useLocalStorage — persist to localStorage
   ───────────────────────────────────────────────────────────────────────────── */

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

/* ─────────────────────────────────────────────────────────────────────────────
   useMediaQuery — responsive media query hook
   ───────────────────────────────────────────────────────────────────────────── */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useClickOutside — detect clicks outside element
   ───────────────────────────────────────────────────────────────────────────── */

export function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);

  return ref;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useKeyPress — keyboard shortcut hook
   ───────────────────────────────────────────────────────────────────────────── */

interface KeyPressOptions {
  /** Key combination (e.g., 'ctrl+s', 'meta+enter') */
  keys: string;
  /** Called when keys pressed */
  callback: () => void;
  /** Enable/disable. Default: true */
  enabled?: boolean;
}

export function useKeyPress({ keys, callback, enabled = true }: KeyPressOptions) {
  useEffect(() => {
    if (!enabled) return;

    const parseKeys = (k: string) => k.toLowerCase().split('+');

    const handler = (e: KeyboardEvent) => {
      const pressed = parseKeys(keys);
      const hasCtrl = pressed.includes('ctrl') === (e.ctrlKey || e.metaKey);
      const hasMeta = pressed.includes('meta') === e.metaKey;
      const hasShift = pressed.includes('shift') === e.shiftKey;
      const hasAlt = pressed.includes('alt') === e.altKey;
      const key = pressed.find((k) => !['ctrl', 'meta', 'shift', 'alt'].includes(k));

      if (hasCtrl && hasMeta && hasShift && hasAlt && key && e.key.toLowerCase() === key) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [keys, callback, enabled]);
}

/* ─────────────────────────────────────────────────────────────────────────────
   useToggle — boolean toggle hook
   ───────────────────────────────────────────────────────────────────────────── */

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

/* ─────────────────────────────────────────────────────────────────────────────
   usePrevious — get previous render value
   ───────────────────────────────────────────────────────────────────────────── */

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useIsMounted — check if component is mounted
   ───────────────────────────────────────────────────────────────────────────── */

export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}