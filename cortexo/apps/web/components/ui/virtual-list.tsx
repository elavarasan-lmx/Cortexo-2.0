'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   VirtualList — virtualized list for large datasets
   ───────────────────────────────────────────────────────────────────────────── */

interface VirtualListProps<T> {
  /** Data items */
  items: T[];
  /** Render each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Item height (fixed for performance) */
  itemHeight: number;
  /** Container height */
  height: number;
  /** Get item key */
  getItemKey: (item: T, index: number) => string;
  /** Overscan (extra items to render) */
  overscan?: number;
  /** Show scrollbar */
  showScrollbar?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading component */
  loadingComponent?: ReactNode;
  /** Empty state */
  emptyComponent?: ReactNode;
  /** On scroll end (for infinite scroll) */
  onEndReached?: () => void;
  /** End threshold in px */
  endThreshold?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  height,
  getItemKey,
  overscan = 3,
  showScrollbar = true,
  loading = false,
  loadingComponent,
  emptyComponent,
  onEndReached,
  endThreshold = 200,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);

    // Check if near end for infinite scroll
    if (onEndReached) {
      const { scrollTop: st, scrollHeight: sh, clientHeight: ch } = target;
      if (sh - st - ch < endThreshold) {
        onEndReached();
      }
    }
  }, [onEndReached, endThreshold]);

  const scrollbarStyle: React.CSSProperties = showScrollbar ? {} : {
    overflow: 'hidden',
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  };

  if (loading && loadingComponent) {
    return <div style={{ height }}>{loadingComponent}</div>;
  }

  if (items.length === 0 && emptyComponent) {
    return <div style={{ height }}>{emptyComponent}</div>;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height,
        overflow: 'auto',
        ...scrollbarStyle,
      }}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) => (
            <div
              key={getItemKey(item, startIndex + i)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   VirtualGrid — virtualized grid for large datasets
   ───────────────────────────────────────────────────────────────────────────── */

interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Number of columns */
  columns: number;
  /** Row height */
  rowHeight: number;
  /** Container height */
  height: number;
  getItemKey: (item: T, index: number) => string;
  overscan?: number;
  loading?: boolean;
  loadingComponent?: ReactNode;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  columns,
  rowHeight,
  height,
  getItemKey,
  overscan = 2,
  loading = false,
  loadingComponent,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    rowCount - 1,
    Math.floor((scrollTop + height) / rowHeight) + overscan
  );

  const visibleItems: { item: T; index: number }[] = [];
  for (let row = startRow; row <= endRow; row++) {
    const startCol = row * columns;
    for (let col = 0; col < columns; col++) {
      const index = startCol + col;
      if (index < items.length) {
        visibleItems.push({ item: items[index], index });
      }
    }
  }

  const offsetY = startRow * rowHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  };

  if (loading && loadingComponent) {
    return <div style={{ height }}>{loadingComponent}</div>;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height, overflow: 'auto' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 8,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div key={getItemKey(item, index)} style={{ height: rowHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   useVirtualScroll — virtual scroll hook for custom implementations
   ───────────────────────────────────────────────────────────────────────────── */

interface UseVirtualScrollOptions {
  /** Total items count */
  itemCount: number;
  /** Item height */
  itemHeight: number;
  /** Container height */
  containerHeight: number;
  /** Overscan count */
  overscan?: number;
}

interface UseVirtualScrollReturn {
  /** Start index */
  startIndex: number;
  /** End index */
  endIndex: number;
  /** Offset Y for positioning */
  offsetY: number;
  /** Total height */
  totalHeight: number;
  /** Scroll to index */
  scrollToIndex: (index: number) => void;
  /** Container ref to attach to scrollable element */
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = itemCount * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const offsetY = startIndex * itemHeight;

  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      const top = index * itemHeight;
      containerRef.current.scrollTop = top;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  };

  // Attach scroll handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll as EventListener);
    return () => el.removeEventListener('scroll', handleScroll as EventListener);
  }, []);

  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    scrollToIndex,
    containerRef,
  };
}