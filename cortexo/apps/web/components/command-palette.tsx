'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, LayoutDashboard, FolderGit2, GitBranch, Rocket,
  Bug, Brain, Server, FileText, Settings, Database, Zap,
  RotateCcw, ScrollText, Layers, Target, BarChart3, Bot,
  Store, Compass, BookOpen, Activity, Wifi, ClipboardCheck,
  FlaskConical, ShieldCheck, Boxes, TrendingUp, ArrowLeftRight,
  GitCompareArrows, FileCode, History, AlertTriangle,
  Play, FileCheck, Wand2, Settings2, Command, Heart,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  label: string;
  href: string;
  section: string;
  icon: typeof Search;
  keywords?: string[];
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Dashboard
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', section: 'Navigation', icon: LayoutDashboard, keywords: ['home', 'overview'] },
  // Projects
  { id: 'projects', label: 'All Projects', href: '/projects', section: 'Projects', icon: FolderGit2, keywords: ['repo', 'repository'] },
  // CI/CD
  { id: 'pipelines', label: 'Pipelines', href: '/pipelines', section: 'CI/CD', icon: GitBranch },
  { id: 'pipeline-runs', label: 'Pipeline Runs', href: '/pipelines/runs', section: 'CI/CD', icon: History, keywords: ['history', 'runs'] },
  { id: 'pipeline-editor', label: 'Pipeline Editor', href: '/pipelines/editor', section: 'CI/CD', icon: FileCode, keywords: ['yaml', 'config'] },
  { id: 'deployments', label: 'Deployments', href: '/deployments', section: 'CI/CD', icon: Rocket, keywords: ['deploy', 'release'] },
  { id: 'canary', label: 'Canary Releases', href: '/deployments/canary', section: 'CI/CD', icon: Zap, keywords: ['canary', 'rollout'] },
  { id: 'rollbacks', label: 'Rollbacks', href: '/rollbacks', section: 'CI/CD', icon: RotateCcw },
  // Bugs
  { id: 'errors', label: 'Errors', href: '/errors', section: 'Bugs', icon: Bug, keywords: ['bugs', 'exceptions'] },
  { id: 'root-causes', label: 'Root Causes', href: '/root-causes', section: 'Bugs', icon: Search },
  { id: 'scans', label: 'Scan Results', href: '/scans', section: 'Bugs', icon: FileCheck },
  // Ops
  { id: 'postmortem', label: 'Postmortem', href: '/postmortem', section: 'Operations', icon: FileText },
  { id: 'deprecation', label: 'Deprecations', href: '/deprecation', section: 'Operations', icon: AlertTriangle },
  // Infrastructure
  { id: 'heartbeat', label: 'Heartbeat Monitor', href: '/heartbeat', section: 'Infrastructure', icon: Heart, keywords: ['health', 'uptime', 'status', 'monitor', 'pulse'] },
  { id: 'servers', label: 'Servers', href: '/servers', section: 'Infrastructure', icon: Server },
  { id: 'logs', label: 'Log Viewer', href: '/logs', section: 'Infrastructure', icon: ScrollText },
  { id: 'fleet', label: 'Client Fleet', href: '/fleet', section: 'Infrastructure', icon: Layers },
  // Sync
  { id: 'sync', label: 'Source Sync', href: '/sync', section: 'Sync', icon: GitCompareArrows },
  { id: 'db-migration', label: 'DB Migration', href: '/db-migration', section: 'Sync', icon: ArrowLeftRight },
  // Agent
  { id: 'agent-memory', label: 'Agent Memory', href: '/agent/memory', section: 'Agent', icon: Brain },
  { id: 'agent-skills', label: 'Skill Library', href: '/agent/skills', section: 'Agent', icon: BookOpen },
  { id: 'agent-context', label: 'Context Monitor', href: '/agent/context', section: 'Agent', icon: Target },
  { id: 'agent-perf', label: 'Agent Performance', href: '/agent/performance', section: 'Agent', icon: BarChart3 },
  { id: 'agent-runner', label: 'Agent Runner', href: '/agent/runner', section: 'Agent', icon: Bot },
  { id: 'marketplace', label: 'Marketplace', href: '/agent/marketplace', section: 'Agent', icon: Store },

  // Analytics
  { id: 'insights', label: 'Insights', href: '/analytics', section: 'Analytics', icon: TrendingUp },
  { id: 'reports', label: 'Reports', href: '/reports', section: 'Analytics', icon: FileText },
  { id: 'audit', label: 'Activity Log', href: '/analytics/audit', section: 'Analytics', icon: History, keywords: ['audit', 'trail', 'log', 'activity'] },
  // Tools
  { id: 'mysql', label: 'MySQL Optimizer', href: '/mysql', section: 'Tools', icon: Database, keywords: ['query', 'sql', 'slow'] },

  { id: 'docs', label: 'Documentation', href: '/docs', section: 'Tools', icon: BookOpen },
  // Testing
  { id: 'load-test', label: 'Load Test', href: '/testing/load', section: 'Testing', icon: Activity, keywords: ['performance', 'stress'] },
  { id: 'socket-test', label: 'Socket Test', href: '/testing/socket', section: 'Testing', icon: Wifi, keywords: ['websocket', 'ws'] },
  { id: 'module-test', label: 'Module Test', href: '/testing/module', section: 'Testing', icon: Boxes, keywords: ['api', 'endpoint'] },
  { id: 'checklist', label: 'Checklist', href: '/testing/checklist', section: 'Testing', icon: ClipboardCheck, keywords: ['deploy', 'qa'] },
  { id: 'api-health', label: 'API Health', href: '/testing/api-health', section: 'Testing', icon: FlaskConical, keywords: ['health', 'status'] },
  { id: 'ssl-monitor', label: 'SSL Monitor', href: '/testing/ssl', section: 'Testing', icon: ShieldCheck, keywords: ['certificate', 'https'] },
  // Settings
  { id: 'settings', label: 'Settings', href: '/settings', section: 'System', icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter items
  const filtered = useMemo(() => {
    if (!query.trim()) return PALETTE_ITEMS;
    const q = query.toLowerCase();
    return PALETTE_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.href.includes(q) ||
      (item.keywords || []).some(k => k.includes(q))
    );
  }, [query]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    filtered.forEach(item => {
      if (!map.has(item.section)) map.set(item.section, []);
      map.get(item.section)!.push(item);
    });
    return map;
  }, [filtered]);

  const flatItems = useMemo(() => filtered, [filtered]);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      navigate(flatItems[selectedIndex].href);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  let itemCounter = -1;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', paddingTop: '15vh',
        animation: 'overlay-in 150ms ease-out',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '560px', maxHeight: '480px',
          borderRadius: '16px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgba(var(--border), 0.3)',
          boxShadow: '0 24px 80px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'palette-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          alignSelf: 'flex-start',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 16px',
          borderBottom: '1px solid rgb(var(--border))',
        }}>
          <Search style={{ width: '18px', height: '18px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, tools..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '15px', fontWeight: 500,
              color: 'rgb(var(--text-primary))',
            }}
          />
          <kbd style={{
            padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            backgroundColor: 'rgba(var(--border), 0.3)', color: 'rgb(var(--text-muted))',
            border: '1px solid rgba(var(--border), 0.5)',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '6px', scrollbarWidth: 'thin' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>
              No results for "{query}"
            </div>
          )}
          {Array.from(grouped.entries()).map(([section, items]) => (
            <div key={section}>
              <p style={{ padding: '8px 12px 4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: 0 }}>
                {section}
              </p>
              {items.map((item) => {
                itemCounter++;
                const idx = itemCounter;
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    data-index={idx}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '8px 12px', borderRadius: '10px',
                      cursor: 'pointer', transition: 'background-color 100ms',
                      backgroundColor: isSelected ? 'rgba(var(--primary), 0.08)' : 'transparent',
                    }}
                  >
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isSelected ? 'rgba(var(--primary), 0.12)' : 'rgba(var(--border), 0.2)',
                    }}>
                      <Icon style={{ width: '14px', height: '14px', color: isSelected ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))' }} />
                    </div>
                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: isSelected ? 'rgb(var(--text-primary))' : 'rgb(var(--text-secondary))' }}>
                      {item.label}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>↵</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid rgb(var(--border))',
          display: 'flex', alignItems: 'center', gap: '16px',
          fontSize: '11px', color: 'rgb(var(--text-muted))',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--border), 0.3)', fontSize: '10px' }}>↑↓</kbd> Navigate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--border), 0.3)', fontSize: '10px' }}>↵</kbd> Open
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--border), 0.3)', fontSize: '10px' }}>esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
