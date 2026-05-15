'use client';

import { HTMLAttributes, ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, CheckSquare, Square } from 'lucide-react';
import { Ico, MetaText } from './primitives';

/* ─────────────────────────────────────────────────────────────────────────────
   Table Context — manages selection state across the table
   ───────────────────────────────────────────────────────────────────────────── */

interface TableContextValue {
  selectedRows: Set<string>;
  toggleRow: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  isAllSelected: (ids: string[]) => boolean;
}

const TableContext = createContext<TableContextValue | null>(null);

function useTableContext() {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error('Table components must be used within <Table>');
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Column Definition
   ───────────────────────────────────────────────────────────────────────────── */

export interface TableColumn<T> {
  key: string;
  header: string;
  /** Render cell content */
  cell: (row: T) => ReactNode;
  /** Sortable key (optional) */
  sortable?: boolean;
  /** Column width */
  width?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

/* ─────────────────────────────────────────────────────────────────────────────
   Table — main container with selection support
   ───────────────────────────────────────────────────────────────────────────── */

interface TableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data: T[];
  /** Unique row identifier getter */
  getRowId: (row: T) => string;
  /** Enable row selection */
  selectable?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  children?: ReactNode;
}

export function Table<T>({
  columns,
  data,
  getRowId,
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data',
  style,
  ...rest
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange?.(Array.from(next));
      return next;
    });
  }, [onSelectionChange]);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = data.map(getRowId);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  }, [data, getRowId, selectedRows.size, onSelectionChange]);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    if (aVal === bVal) return 0;
    const cmp = (aVal as any) < (bVal as any) ? -1 : 1;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const tableStyle: HTMLAttributes<HTMLDivElement>['style'] = {
    width: '100%',
    backgroundColor: 'rgb(var(--surface))',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid rgb(var(--border))',
    overflow: 'hidden',
    ...style,
  };

  const renderSortIcon = (key: string, sortable?: boolean) => {
    if (!sortable) return null;
    if (sortKey !== key) return <ChevronsUpDown size={12} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <TableContext.Provider value={{ selectedRows, toggleRow, toggleAll, isAllSelected: () => selectedRows.size === data.length }}>
      <div style={tableStyle} {...rest}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'rgb(var(--surface-hover))',
          borderBottom: '1px solid rgb(var(--border))',
          gap: 8,
        }}>
          {selectable && (
            <div style={{ width: 32, flexShrink: 0 }}>
              <button
                onClick={toggleAll}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                {selectedRows.size === data.length && data.length > 0 ? (
                  <CheckSquare size={16} style={{ color: 'rgb(var(--primary))' }} />
                ) : (
                  <Square size={16} style={{ color: 'rgb(var(--text-muted))' }} />
                )}
              </button>
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
                cursor: col.sortable ? 'pointer' : 'default',
              }}
              onClick={() => col.sortable && handleSort(col.key)}
            >
              <MetaText size={11} bold caps style={{ color: 'rgb(var(--text-secondary))' }}>
                {col.header}
              </MetaText>
              {renderSortIcon(col.key, col.sortable)}
            </div>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <TableSkeleton columns={columns.length} rows={5} />
        ) : sortedData.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgb(var(--text-muted))' }}>
            {emptyMessage}
          </div>
        ) : (
          sortedData.map((row) => (
            <TableRow
              key={getRowId(row)}
              row={row}
              columns={columns}
              getRowId={getRowId}
              selectable={selectable}
            />
          ))
        )}
      </div>
    </TableContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableRow — individual row with selection support
   ───────────────────────────────────────────────────────────────────────────── */

interface TableRowProps<T> {
  row: T;
  columns: TableColumn<T>[];
  getRowId: (row: T) => string;
  selectable: boolean;
}

function TableRow<T>({ row, columns, getRowId, selectable }: TableRowProps<T>) {
  const { selectedRows, toggleRow } = useTableContext();
  const id = getRowId(row);
  const isSelected = selectedRows.has(id);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgb(var(--border))',
        backgroundColor: isSelected ? 'rgba(var(--primary), 0.04)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
      onClick={() => selectable && toggleRow(id)}
    >
      {selectable && (
        <div style={{ width: 32, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleRow(id); }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
          >
            {isSelected ? (
              <CheckSquare size={16} style={{ color: 'rgb(var(--primary))' }} />
            ) : (
              <Square size={16} style={{ color: 'rgb(var(--text-muted))' }} />
            )}
          </button>
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
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Pagination — standalone pagination controls
   ───────────────────────────────────────────────────────────────────────────── */

interface PaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Show page size selector */
  pageSize?: number;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid rgb(var(--border))',
      backgroundColor: 'rgb(var(--surface-hover))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MetaText>Rows per page:</MetaText>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          style={{
            padding: '4px 8px',
            border: '1px solid rgb(var(--border))',
            borderRadius: 6,
            backgroundColor: 'rgb(var(--surface))',
            fontSize: 12,
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MetaText>
          Page {page} of {totalPages}
        </MetaText>
        <button
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          style={{
            padding: '4px 8px',
            border: 'none',
            background: canPrev ? 'rgb(var(--surface))' : 'transparent',
            borderRadius: 6,
            cursor: canPrev ? 'pointer' : 'default',
            opacity: canPrev ? 1 : 0.4,
          }}
        >
          <ChevronUp style={{ transform: 'rotate(-90deg)' }} size={14} />
        </button>
        <button
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          style={{
            padding: '4px 8px',
            border: 'none',
            background: canNext ? 'rgb(var(--surface))' : 'transparent',
            borderRadius: 6,
            cursor: canNext ? 'pointer' : 'default',
            opacity: canNext ? 1 : 0.4,
          }}
        >
          <ChevronUp style={{ transform: 'rotate(90deg)' }} size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableSkeleton — loading placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid rgb(var(--border))',
            gap: 8,
          }}
        >
          {selectable && <div style={{ width: 32 }} />}
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="skeleton-shimmer"
              style={{
                flex: 1,
                height: 16,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const selectable = false;