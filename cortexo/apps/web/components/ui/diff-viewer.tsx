'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, RefreshCw, ChevronDown, ChevronRight, FileDiff as FileDiffIcon } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   DiffViewer — show changes between two versions
   ───────────────────────────────────────────────────────────────────────────── */

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface DiffViewerProps {
  /** Original content */
  oldContent: string;
  /** New content */
  newContent: string;
  /** Old file name */
  oldFilename?: string;
  /** New file name */
  newFilename?: string;
  /** View mode */
  mode?: 'split' | 'unified';
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Context lines to show */
  context?: number;
  /** Called when file is opened */
  onOpenFile?: (filename: string) => void;
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diff: DiffLine[] = [];

  // Simple diff algorithm (LCS-based would be better for production)
  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];

    if (oldLine === newLine) {
      diff.push({
        type: 'context',
        content: oldLine || '',
        oldLineNumber: oldIdx + 1,
        newLineNumber: newIdx + 1,
      });
      oldIdx++;
      newIdx++;
    } else if (oldLine !== undefined && newLine !== undefined && oldLines.slice(newIdx).includes(newLine)) {
      // Line added
      diff.push({
        type: 'add',
        content: newLine,
        newLineNumber: newIdx + 1,
      });
      newIdx++;
    } else if (oldLine !== undefined && newLine !== undefined && newLines.slice(oldIdx).includes(oldLine)) {
      // Line removed
      diff.push({
        type: 'remove',
        content: oldLine,
        oldLineNumber: oldIdx + 1,
      });
      oldIdx++;
    } else {
      // Both differ, treat as add/remove pair
      if (oldLine !== undefined) {
        diff.push({
          type: 'remove',
          content: oldLine,
          oldLineNumber: oldIdx + 1,
        });
        oldIdx++;
      }
      if (newLine !== undefined) {
        diff.push({
          type: 'add',
          content: newLine,
          newLineNumber: newIdx + 1,
        });
        newIdx++;
      }
    }
  }

  return diff;
}

export function DiffViewer({
  oldContent,
  newContent,
  oldFilename = 'original',
  newFilename = 'modified',
  mode = 'unified',
  showLineNumbers = true,
  context = 3,
}: DiffViewerProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const diff = computeDiff(oldContent, newContent);

  // Group diff into sections
  const sections: { start: number; end: number; hasChange: boolean }[] = [];
  let currentSection: { start: number; end: number; hasChange: boolean } | null = null;

  diff.forEach((line, i) => {
    if (line.type !== 'context') {
      if (!currentSection) {
        currentSection = { start: i, end: i, hasChange: true };
      } else {
        currentSection.end = i;
        currentSection.hasChange = true;
      }
    } else if (currentSection) {
      // Check if we should extend the section with context
      const distanceToNextChange = diff.slice(i, i + context * 2 + 1).findIndex((l, idx) => idx > context && l.type !== 'context');
      if (distanceToNextChange === -1 || distanceToNextChange > context) {
        currentSection.end = i;
        sections.push(currentSection);
        currentSection = null;
      }
    }
  });
  if (currentSection) {
    sections.push(currentSection);
  }

  const toggleSection = (idx: number) => {
    const next = new Set(collapsedSections);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCollapsedSections(next);
  };

  const stats = {
    additions: diff.filter((l) => l.type === 'add').length,
    deletions: diff.filter((l) => l.type === 'remove').length,
  };

  const getLineColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'add':
        return 'rgba(16, 185, 129, 0.15)';
      case 'remove':
        return 'rgba(239, 68, 68, 0.15)';
      default:
        return 'transparent';
    }
  };

  const getPrefix = (type: DiffLine['type']) => {
    switch (type) {
      case 'add':
        return '+';
      case 'remove':
        return '-';
      default:
        return ' ';
    }
  };

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgb(var(--border))',
      overflow: 'hidden',
      backgroundColor: 'rgb(var(--surface))',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'rgb(var(--surface-hover))',
        borderBottom: '1px solid rgb(var(--border))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FileDiffIcon size={16} style={{ color: 'rgb(var(--primary))' }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Changes</span>
          <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
            <span style={{ color: 'rgb(var(--success))' }}>+{stats.additions}</span>
            <span style={{ color: 'rgb(var(--danger))' }}>-{stats.deletions}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgb(var(--text-muted))' }}>
          <span>{oldFilename}</span>
          <ChevronRight size={14} />
          <span>{newFilename}</span>
        </div>
      </div>

      {/* Diff content */}
      <div style={{ maxHeight: 500, overflow: 'auto' }}>
        {diff.map((line, i) => {
          const sectionIdx = sections.findIndex((s) => i >= s.start && i <= s.end);
          const isCollapsed = sectionIdx !== -1 && collapsedSections.has(sectionIdx);

          // Skip lines in collapsed sections
          if (sectionIdx !== -1 && isCollapsed && line.type === 'context') {
            return null;
          }

          // Show collapse toggle
          if (sectionIdx !== -1 && i === sections[sectionIdx].start && sections[sectionIdx].hasChange) {
            const section = sections[sectionIdx];
            const contextLines = diff.slice(section.start, section.end + 1).filter((l) => l.type === 'context').length;
            if (contextLines > 0) {
              return (
                <button
                  key={`collapse-${sectionIdx}`}
                  onClick={() => toggleSection(sectionIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: 'rgb(var(--surface-hover))',
                    color: 'rgb(var(--text-muted))',
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {collapsedSections.has(sectionIdx) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  {contextLines} context lines (click to {collapsedSections.has(sectionIdx) ? 'show' : 'hide'})
                </button>
              );
            }
          }

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                backgroundColor: getLineColor(line.type),
                minHeight: 24,
              }}
            >
              {/* Line numbers */}
              {showLineNumbers && (
                <div style={{
                  display: 'flex',
                  minWidth: 80,
                  borderRight: '1px solid rgb(var(--border))',
                  fontSize: 11,
                  color: 'rgb(var(--text-muted))',
                }}>
                  {line.oldLineNumber && (
                    <div style={{
                      width: 40,
                      padding: '2px 8px',
                      textAlign: 'right',
                      opacity: line.type === 'remove' ? 1 : 0.5,
                    }}>
                      {line.oldLineNumber}
                    </div>
                  )}
                  {line.newLineNumber && (
                    <div style={{
                      width: 40,
                      padding: '2px 8px',
                      textAlign: 'right',
                      opacity: line.type === 'add' ? 1 : 0.5,
                    }}>
                      {line.newLineNumber}
                    </div>
                  )}
                </div>
              )}

              {/* Prefix */}
              <div style={{
                width: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: line.type === 'add' ? 'rgb(var(--success))' : line.type === 'remove' ? 'rgb(var(--danger))' : 'rgb(var(--text-muted))',
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: 12,
                flexShrink: 0,
              }}>
                {line.type === 'add' ? <Plus size={12} /> : line.type === 'remove' ? <Minus size={12} /> : ''}
              </div>

              {/* Content */}
              <pre style={{
                flex: 1,
                margin: 0,
                padding: '2px 8px',
                fontSize: 12,
                fontFamily: 'monospace',
                color: 'rgb(var(--text-primary))',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {line.content}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DiffStats — summary of changes
   ───────────────────────────────────────────────────────────────────────────── */

interface DiffStatsProps {
  additions: number;
  deletions: number;
  files?: number;
}

export function DiffStats({ additions, deletions, files }: DiffStatsProps) {
  const total = additions + deletions;
  const addPercent = total ? (additions / total) * 100 : 0;
  const delPercent = total ? (deletions / total) * 100 : 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontSize: 12,
    }}>
      {files !== undefined && (
        <span style={{ color: 'rgb(var(--text-secondary))' }}>{files} file{files !== 1 ? 's' : ''}</span>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ color: 'rgb(var(--success))' }}>+{additions}</span>
        <span style={{ color: 'rgb(var(--danger))' }}>-{deletions}</span>
      </div>
      <div style={{
        width: 100,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgb(var(--surface-hover))',
        overflow: 'hidden',
        display: 'flex',
      }}>
        <div style={{ width: `${addPercent}%`, backgroundColor: 'rgb(var(--success))' }} />
        <div style={{ width: `${delPercent}%`, backgroundColor: 'rgb(var(--danger))' }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FileDiff — diff for a single file
   ───────────────────────────────────────────────────────────────────────────── */

interface FileDiffProps {
  filename: string;
  oldContent: string;
  newContent: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
}

export function FileDiff({
  filename,
  oldContent,
  newContent,
  status,
}: FileDiffProps) {
  const statusColors = {
    modified: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', label: 'M' },
    added: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', label: 'A' },
    deleted: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', label: 'D' },
    renamed: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', label: 'R' },
  };

  const s = statusColors[status];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
      }}>
        <span style={{
          padding: '2px 6px',
          borderRadius: 4,
          backgroundColor: s.bg,
          color: s.color,
          fontSize: 10,
          fontWeight: 600,
        }}>
          {s.label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{filename}</span>
      </div>
      <DiffViewer
        oldContent={oldContent}
        newContent={newContent}
        oldFilename="a"
        newFilename="b"
      />
    </div>
  );
}