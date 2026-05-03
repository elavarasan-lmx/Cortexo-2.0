'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DataTable — Cortexo Design System
 *
 * Sortable, filterable data table with pagination and row click support.
 * Designed to replace all inline table patterns across the dashboard.
 *
 * Usage:
 *   <DataTable
 *     columns={[
 *       { key: 'name', label: 'Name', sortable: true },
 *       { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> },
 *       { key: 'date', label: 'Created', sortable: true },
 *     ]}
 *     data={projects}
 *     searchable
 *     searchKeys={['name']}
 *     pageSize={10}
 *     onRowClick={(row) => router.push(`/projects/${row.id}`)}
 *     emptyMessage="No projects found"
 *   />
 */

export interface Column<T = any> {
  /** Key in the data object */
  key: string;
  /** Display label in header */
  label: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Minimum column width */
  minWidth?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether to use monospace font */
  mono?: boolean;
  /** Hide on smaller screens */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  /** Enable search input above table */
  searchable?: boolean;
  /** Keys to search across (defaults to all string columns) */
  searchKeys?: string[];
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Rows per page (0 = no pagination) */
  pageSize?: number;
  /** Callback when a row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Message when data is empty */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Loading row count for skeleton */
  loadingRows?: number;
  /** Additional actions to show in header area */
  headerActions?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Unique key extractor */
  rowKey?: (row: T, index: number) => string | number;
  /** Compact row styling */
  compact?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = false,
  searchKeys,
  searchPlaceholder = 'Search…',
  pageSize = 0,
  onRowClick,
  emptyMessage = 'No data found',
  emptyIcon,
  loading = false,
  loadingRows = 5,
  headerActions,
  className,
  style,
  rowKey,
  compact = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);

  /* ── Filter ── */
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    const keys = searchKeys || columns.filter((c) => typeof data[0]?.[c.key] === 'string').map((c) => c.key);
    return data.filter((row) => keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
  }, [data, search, searchKeys, columns]);

  /* ── Sort ── */
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  /* ── Paginate ── */
  const totalPages = pageSize > 0 ? Math.ceil(sortedData.length / pageSize) : 1;
  const pageData = pageSize > 0 ? sortedData.slice(page * pageSize, (page + 1) * pageSize) : sortedData;

  // Reset page when data changes
  React.useEffect(() => { setPage(0); }, [search, data.length]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const cellPadding = compact ? '8px 14px' : '12px 16px';
  const headerPadding = compact ? '8px 14px' : '10px 16px';

  return (
    <div
      className={cn(className)}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgb(var(--border))',
        backgroundColor: 'rgb(var(--surface))',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* ── Search + Actions Bar ── */}
      {(searchable || headerActions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderBottom: '1px solid rgb(var(--border))',
          }}
        >
          {searchable && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                maxWidth: '320px',
                backgroundColor: 'rgb(var(--background))',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                border: '1px solid rgb(var(--border))',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '13px',
                  color: 'rgb(var(--text-primary))',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}
          {headerActions && <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>{headerActions}</div>}
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={{
                    padding: headerPadding,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'rgb(var(--text-muted))',
                    textAlign: (col.align || 'left') as any,
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    width: col.width,
                    minWidth: col.minWidth,
                    transition: 'color var(--transition-fast)',
                    backgroundColor: 'rgba(var(--background), 0.5)',
                  }}
                  onMouseEnter={(e) => { if (col.sortable) e.currentTarget.style.color = 'rgb(var(--text-primary))'; }}
                  onMouseLeave={(e) => { if (col.sortable) e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {col.sortable && (
                      <span style={{ display: 'inline-flex', opacity: sortKey === col.key ? 1 : 0.3 }}>
                        {sortKey === col.key && sortDir === 'asc' ? (
                          <ChevronUp style={{ width: '12px', height: '12px' }} />
                        ) : sortKey === col.key && sortDir === 'desc' ? (
                          <ChevronDown style={{ width: '12px', height: '12px' }} />
                        ) : (
                          <ChevronsUpDown style={{ width: '12px', height: '12px' }} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: loadingRows }).map((_, i) => (
                  <tr key={`skel-${i}`} style={{ borderBottom: '1px solid rgba(var(--border), 0.5)' }}>
                    {columns.map((col) => (
                      <td key={col.key} style={{ padding: cellPadding }}>
                        <div
                          style={{
                            width: `${50 + Math.random() * 40}%`,
                            height: '14px',
                            borderRadius: '4px',
                            background: 'linear-gradient(90deg, rgba(var(--border),0.08) 25%, rgba(var(--border),0.18) 50%, rgba(var(--border),0.08) 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s ease-in-out infinite',
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : pageData.map((row, rowIndex) => {
                  const globalIndex = pageSize > 0 ? page * pageSize + rowIndex : rowIndex;
                  return (
                    <tr
                      key={rowKey ? rowKey(row, globalIndex) : globalIndex}
                      onClick={onRowClick ? () => onRowClick(row, globalIndex) : undefined}
                      style={{
                        borderBottom: rowIndex < pageData.length - 1 ? '1px solid rgba(var(--border), 0.5)' : 'none',
                        transition: 'background-color var(--transition-fast)',
                        cursor: onRowClick ? 'pointer' : 'default',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: cellPadding,
                            fontSize: '13px',
                            color: 'rgb(var(--text-primary))',
                            textAlign: (col.align || 'left') as any,
                            fontFamily: col.mono ? "'JetBrains Mono', 'Fira Code', monospace" : 'inherit',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: col.width || '300px',
                          }}
                        >
                          {col.render ? col.render(row[col.key], row, globalIndex) : (row[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  );
                })}

            {/* Empty state */}
            {!loading && pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '48px 20px',
                      textAlign: 'center',
                    }}
                  >
                    {emptyIcon && (
                      <div className="float-icon" style={{ color: 'rgb(var(--text-muted))', opacity: 0.4 }}>
                        {emptyIcon}
                      </div>
                    )}
                    <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pageSize > 0 && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid rgb(var(--border))',
            fontSize: '12px',
            color: 'rgb(var(--text-muted))',
          }}
        >
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sortedData.length)} of{' '}
            {sortedData.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PaginationButton onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
              <ChevronLeft style={{ width: '14px', height: '14px' }} />
            </PaginationButton>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <PaginationButton
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  active={pageNum === page}
                >
                  {pageNum + 1}
                </PaginationButton>
              );
            })}
            <PaginationButton onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}>
              <ChevronRight style={{ width: '14px', height: '14px' }} />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Pagination Button ── */
function PaginationButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        backgroundColor: active ? 'rgba(var(--primary), 0.1)' : 'transparent',
        color: active ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))';
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}
