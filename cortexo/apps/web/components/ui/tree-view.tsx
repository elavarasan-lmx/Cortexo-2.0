'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, FileText, Image, Code } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   TreeView — hierarchical tree structure
   ───────────────────────────────────────────────────────────────────────────── */

interface TreeNode {
  id: string;
  label: string;
  /** Icon override */
  icon?: ReactNode;
  /** Children nodes */
  children?: TreeNode[];
  /** Disabled state */
  disabled?: boolean;
  /** Action on click */
  action?: ReactNode;
}

interface TreeViewProps {
  nodes: TreeNode[];
  /** Selected node id */
  selected?: string;
  /** Called when node is selected */
  onSelect?: (node: TreeNode) => void;
  /** Show checkboxes */
  checkable?: boolean;
  /** Checked node ids */
  checked?: string[];
  /** On check change */
  onCheck?: (ids: string[]) => void;
  /** Show icons based on type */
  showIcons?: boolean;
  /** Expand all by default */
  defaultExpanded?: boolean;
  /** Expand specific ids */
  expandedIds?: string[];
  /** On expand change */
  onExpand?: (ids: string[]) => void;
}

const FILE_ICONS: Record<string, typeof File> = {
  '.md': FileText,
  '.txt': FileText,
  '.js': Code,
  '.ts': Code,
  '.tsx': Code,
  '.json': Code,
  '.png': Image,
  '.jpg': Image,
  '.jpeg': Image,
  '.gif': Image,
};

function getIcon(filename?: string) {
  if (!filename) return Folder;
  const ext = '.' + filename.split('.').pop();
  return FILE_ICONS[ext] || File;
}

export function TreeView({
  nodes,
  selected,
  onSelect,
  checkable = false,
  checked = [],
  onCheck,
  showIcons = true,
  defaultExpanded = false,
  expandedIds = [],
  onExpand,
}: TreeViewProps) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (defaultExpanded) {
      nodes.forEach((n) => s.add(n.id));
    }
    expandedIds.forEach((id) => s.add(id));
    return s;
  });

  const isExpanded = (id: string) => internalExpanded.has(id);

  const toggleExpand = (id: string) => {
    const next = new Set(internalExpanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setInternalExpanded(next);
    onExpand?.(Array.from(next));
  };

  const toggleCheck = (id: string) => {
    if (checked.includes(id)) {
      onCheck?.(checked.filter((c) => c !== id));
    } else {
      onCheck?.([...checked, id]);
    }
  };

  const renderNode = (node: TreeNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const expanded = isExpanded(node.id);
    const isSelected = selected === node.id;
    const isChecked = checked.includes(node.id);
    const Icon = node.icon || (hasChildren ? (expanded ? FolderOpen : Folder) : getIcon(node.label));

    return (
      <div key={node.id}>
        <motion.div
          whileHover={{ backgroundColor: 'rgb(var(--surface-hover))' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 8px',
            paddingLeft: depth * 16 + 8,
            cursor: node.disabled ? 'default' : 'pointer',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isSelected ? 'rgba(var(--primary), 0.08)' : 'transparent',
          }}
          onClick={() => {
            if (node.disabled) return;
            if (hasChildren) toggleExpand(node.id);
            onSelect?.(node);
          }}
        >
          {/* Expand/collapse toggle */}
          {hasChildren ? (
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronRight size={14} style={{ color: 'rgb(var(--text-muted))' }} />
            </motion.div>
          ) : (
            <div style={{ width: 14 }} />
          )}

          {/* Checkbox */}
          {checkable && (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => { e.stopPropagation(); toggleCheck(node.id); }}
              style={{ marginRight: 4 }}
            />
          )}

          {/* Icon */}
          {showIcons && (
            <Icon size={16} style={{ color: isSelected ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))' }} />
          )}

          {/* Label */}
          <span
            style={{
              flex: 1,
              fontSize: 13,
              color: isSelected ? 'rgb(var(--primary))' : node.disabled ? 'rgb(var(--text-muted))' : 'rgb(var(--text-primary))',
              fontWeight: isSelected ? 500 : 400,
            }}
          >
            {node.label}
          </span>

          {/* Action */}
          {node.action}
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div style={{ padding: 8 }}>
      {nodes.map((node) => renderNode(node))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TreeViewSkeleton — loading placeholder
   ───────────────────────────────────────────────────────────────────────────── */

interface TreeViewSkeletonProps {
  /** Number of root items */
  items?: number;
  /** Show nested items */
  nested?: boolean;
}

export function TreeViewSkeleton({ items = 4, nested = true }: TreeViewSkeletonProps) {
  return (
    <div style={{ padding: 8 }}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
          }}
        >
          <div className="skeleton-shimmer" style={{ width: 14, height: 14, borderRadius: 2 }} />
          {nested && i === 0 && (
            <div className="skeleton-shimmer" style={{ width: 14, height: 14, borderRadius: 2 }} />
          )}
          <div className="skeleton-shimmer" style={{ width: 100 + i * 20, height: 14, borderRadius: 2 }} />
        </div>
      ))}
    </div>
  );
}