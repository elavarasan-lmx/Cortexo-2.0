'use client';

import { ReactNode, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal, Filter, Search } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   DataGrid — advanced table with filtering, sorting, pagination
   ───────────────────────────────────────────────────────────────────────────── */

export interface DataGridColumn<T> {
  key: string;
  header: string;
  /** Cell renderer */
  cell: (row: T) => ReactNode;
  /** Sortable */
  sortable?: boolean;
  /** Filterable */
  filterable?: boolean;
  /** Width */
  width?: string;
  /** Align */
  align?: 'left' | 'center' | 'right';
  /** Fixed column (left/right) */
  fixed?: 'left' | 'right';
}

interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  /** Row ID getter */
  getRowId: (row: T) => string;
  /** Enable selection */
  selectable?: boolean;
  /** Selected rows */
  selected?: string[];
  /** On selection change */
  onSelectionChange?: (ids: string[]) => void;
  /** Enable filtering */
  filterable?: boolean;
  /** Enable sorting */
  sortable?: boolean;
  /** Page size */
  pageSize?: number;
  /** Show pagination */
  pagination?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Actions column */
  actions?: (row: T) => ReactNode;
}

export function DataGrid<T>({
  columns,
  data,
  getRowId,
  selectable = false,
  selected = [],
  onSelectionChange,
  filterable = true,
  sortable = true,
  pageSize = 10,
  pagination = true,
  loading = false,
  emptyMessage = 'No data',
  onRowClick,
  actions,
}: DataGridProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filter) return data;
    return data.filter((row) =>
      columns.some((col) => {
        const value = col.cell(row);
        return String(value).toLowerCase().includes(filter.toLowerCase());
      })
    );
  }, [data, filter, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = columns.find((c) => c.key === sortKey)?.cell(a);
      const bVal = columns.find((c) => c.key === sortKey)?.cell(b);
      if (aVal === bVal) return 0;
      const cmp = String(aVal) < String(bVal) ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir, columns]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      onSelectionChange?.(selected.filter((s) => s !== id));
    } else {
      onSelectionChange?.([...selected, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === sortedData.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(sortedData.map(getRowId));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Toolbar */}
      {filterable && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            position: 'relative',
            flex: 1,
            maxWidth: 300,
          }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                border: '1px solid rgb(var(--border))',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
            {filteredData.length} of {data.length} items
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'rgb(var(--surface-hover))',
          borderBottom: '1px solid rgb(var(--border))',
          fontSize: 11,
          fontWeight: 600,
          color: 'rgb(var(--text-secondary))',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {selectable && (
            <div style={{ width: 40, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={selected.length === sortedData.length && sortedData.length > 0}
                onChange={toggleSelectAll}
              />
            </div>
          )}
          {columns.map((col) => (
            <div
              key={col.key}
              style={{
                flex: col.width ? `0 0 ${col.width}` : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: sortable && col.sortable ? 'pointer' : 'default',
              }}
              onClick={() => sortable && col.sortable && handleSort(col.key)}
            >
              {col.header}
              {sortable && col.sortable && (
                sortKey === col.key
                  ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                  : <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />
              )}
            </div>
          ))}
          {actions && <div style={{ width: 60, flexShrink: 0 }} />}
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgb(var(--border))' }}>
              <div className="skeleton-shimmer" style={{ height: 16, borderRadius: 4 }} />
            </div>
          ))
        ) : paginatedData.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgb(var(--text-muted))' }}>
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((row) => {
            const id = getRowId(row);
            const isSelected = selected.includes(id);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgb(var(--border))',
                  backgroundColor: isSelected ? 'rgba(var(--primary), 0.04)' : 'transparent',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 100ms',
                }}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <div style={{ width: 40, flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(id); }}
                    />
                  </div>
                )}
                {columns.map((col) => (
                  <div
                    key={col.key}
                    style={{
                      flex: col.width ? `0 0 ${col.width}` : 1,
                      textAlign: col.align || 'left',
                      fontSize: 13,
                      color: 'rgb(var(--text-primary))',
                    }}
                  >
                    {col.cell(row)}
                  </div>
                ))}
                {actions && (
                  <div style={{ width: 60, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                    {actions(row)}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          fontSize: 12,
          color: 'rgb(var(--text-muted))',
        }}>
          <span>Page {currentPage} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{
                padding: '6px 12px',
                border: '1px solid rgb(var(--border))',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgb(var(--surface))',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                padding: '6px 12px',
                border: '1px solid rgb(var(--border))',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgb(var(--surface))',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}