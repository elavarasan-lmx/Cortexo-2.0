'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Pagination — comprehensive pagination component
   ───────────────────────────────────────────────────────────────────────────── */

interface PaginationProps {
  /** Total number of items */
  total: number;
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Show page size selector */
  showPageSize?: boolean;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Called when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Show page numbers */
  showPageNumbers?: boolean;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Show total count */
  showTotal?: boolean;
  /** Total count label */
  totalLabel?: string;
  /** Custom labels */
  labels?: {
    first?: string;
    last?: string;
    previous?: string;
    next?: string;
    page?: string;
    of?: string;
  };
}

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  showPageSize = true,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  showPageNumbers = true,
  showFirstLast = false,
  showTotal = true,
  totalLabel = 'items',
  labels = {},
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  if (total === 0) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const renderPageButton = (p: number | 'ellipsis', idx: number) => {
    if (p === 'ellipsis') {
      return (
        <div
          key={`ellipsis-${idx}`}
          style={{
            padding: '6px 8px',
            color: 'rgb(var(--text-muted))',
          }}
        >
          <MoreHorizontal size={16} />
        </div>
      );
    }

    const isActive = p === page;
    return (
      <button
        key={p}
        onClick={() => onPageChange(p)}
        style={{
          minWidth: 32,
          height: 32,
          padding: '0 8px',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isActive ? 'rgb(var(--primary))' : 'transparent',
          color: isActive ? '#fff' : 'rgb(var(--text-primary))',
          fontSize: 13,
          fontWeight: isActive ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 150ms',
        }}
      >
        {p}
      </button>
    );
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
      padding: '12px 0',
    }}>
      {/* Left side: Page size & total */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {showPageSize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                border: '1px solid rgb(var(--border))',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgb(var(--surface))',
                fontSize: 12,
                color: 'rgb(var(--text-primary))',
                cursor: 'pointer',
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {showTotal && (
          <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
            {labels.page || 'Page'} {page} {labels.of || 'of'} {totalPages} ({startItem}-{endItem} {totalLabel})
          </span>
        )}
      </div>

      {/* Right side: Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* First / Last */}
        {showFirstLast && page !== 1 && (
          <button
            onClick={() => onPageChange(1)}
            style={{
              padding: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'rgb(var(--text-secondary))',
              display: 'flex',
            }}
            title={labels.first || 'First page'}
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            padding: 6,
            border: 'none',
            background: 'transparent',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            color: page === 1 ? 'rgb(var(--text-muted))' : 'rgb(var(--text-secondary))',
            opacity: page === 1 ? 0.5 : 1,
            display: 'flex',
          }}
          title={labels.previous || 'Previous page'}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {pageNumbers.map((p, i) => renderPageButton(p, i))}
          </div>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            padding: 6,
            border: 'none',
            background: 'transparent',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            color: page === totalPages ? 'rgb(var(--text-muted))' : 'rgb(var(--text-secondary))',
            opacity: page === totalPages ? 0.5 : 1,
            display: 'flex',
          }}
          title={labels.next || 'Next page'}
        >
          <ChevronRight size={16} />
        </button>

        {/* First / Last */}
        {showFirstLast && page !== totalPages && (
          <button
            onClick={() => onPageChange(totalPages)}
            style={{
              padding: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'rgb(var(--text-secondary))',
              display: 'flex',
            }}
            title={labels.last || 'Last page'}
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PaginationCompact — simple prev/next pagination
   ───────────────────────────────────────────────────────────────────────────── */

interface PaginationCompactProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
}

export function PaginationCompact({
  page,
  totalPages,
  onPageChange,
  showPageInfo = true,
}: PaginationCompactProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgb(var(--surface))',
          color: page === 1 ? 'rgb(var(--text-muted))' : 'rgb(var(--text-primary))',
          fontSize: 12,
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          opacity: page === 1 ? 0.5 : 1,
        }}
      >
        <ChevronLeft size={14} /> Previous
      </button>

      {showPageInfo && (
        <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
          Page {page} of {totalPages}
        </span>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgb(var(--surface))',
          color: page === totalPages ? 'rgb(var(--text-muted))' : 'rgb(var(--text-primary))',
          fontSize: 12,
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          opacity: page === totalPages ? 0.5 : 1,
        }}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PaginationDots — inline pagination indicator
   ───────────────────────────────────────────────────────────────────────────── */

interface PaginationDotsProps {
  total: number;
  current: number;
  onChange: (index: number) => void;
  /** Max dots to show before collapsing */
  maxDots?: number;
}

export function PaginationDots({
  total,
  current,
  onChange,
  maxDots = 7,
}: PaginationDotsProps) {
  if (total <= 1) return null;

  const showEllipsis = total > maxDots;
  const displayCount = showEllipsis ? Math.min(maxDots - 2, total - 2) : total;

  const getDots = () => {
    const dots: (number | 'ellipsis')[] = [];
    if (showEllipsis) {
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      dots.push(1);
      if (start > 2) dots.push('ellipsis');
      for (let i = start; i <= end; i++) dots.push(i);
      if (end < total - 1) dots.push('ellipsis');
      dots.push(total);
    } else {
      for (let i = 1; i <= total; i++) dots.push(i);
    }
    return dots;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {getDots().map((d, i) => (
        d === 'ellipsis' ? (
          <div key={`ell-${i}`} style={{ color: 'rgb(var(--text-muted))', padding: '0 4px' }}>...</div>
        ) : (
          <button
            key={d}
            onClick={() => onChange(d)}
            style={{
              width: d === current ? 16 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              backgroundColor: d === current ? 'rgb(var(--primary))' : 'rgb(var(--border))',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color 150ms',
            }}
          />
        )
      ))}
    </div>
  );
}