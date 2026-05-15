'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderGit2, Plus, Search, Loader2, Github, Globe, X, Edit3, Trash2, Eye, EyeOff,
  GitBranch as GitBranchIcon, Filter, ChevronDown, FolderOpen, TrendingUp, BarChart3,
  Clock, UserCircle, Download, FileJson, FileSpreadsheet, Rocket, CheckSquare, Square,
  ArrowUpDown, ExternalLink, Keyboard, Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Project } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';

function parseSettings(p: Project) {
  try {
    const raw = (p as unknown as Record<string, unknown>).settings;
    if (!raw) return {} as Record<string, unknown>;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch { return {} as Record<string, unknown>; }
}

type Filters = {
  productType: string | null;
  serverId: string | null;
  repoProvider: string | null;
  status: string | null;
};

type SortKey = 'name' | 'createdAt' | 'updatedAt' | 'productType';

function formatRelativeTime(date: string | Date | null): string {
  if (!date) return '—';
  const d = new Date(date);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, isLoading: loading, refetch } = useCortexoQuery(['projects'], () => api.getProjects());

  const [search, setSearch] = useState('');
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [visiblePassId, setVisiblePassId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [filters, setFilters] = useState<Filters>({ productType: null, serverId: null, repoProvider: null, status: null });
  const filterRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false);
    }
    if (showFilter || showExport) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFilter, showExport]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'n' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        router.push('/projects/new');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const allProjects = (projects as Project[]) || [];

  const filterOptions = useMemo(() => {
    const servers = new Set<string>();
    const repos = new Set<string>();
    allProjects.forEach(p => {
      const s = parseSettings(p);
      const deploy = (s.deploy || {}) as Record<string, string>;
      if (deploy.serverId) servers.add(deploy.serverId);
      if (p.repoProvider) repos.add(p.repoProvider);
    });
    return { servers: Array.from(servers).sort(), repos: Array.from(repos).sort() };
  }, [allProjects]);

  const filtered = useMemo(() => {
    let result = allProjects.filter(p => {
      const s = parseSettings(p);
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || String(s.domain || '').toLowerCase().includes(q) || String(s.clientSlug || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (filters.productType && String(s.productType) !== filters.productType) return false;
      if (filters.serverId) {
        const deploy = (s.deploy || {}) as Record<string, string>;
        if (deploy.serverId !== filters.serverId) return false;
      }
      if (filters.repoProvider && (p.repoProvider || 'github') !== filters.repoProvider) return false;
      if (filters.status && (p.status || 'active') !== filters.status) return false;
      return true;
    });

    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortKey) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;
        case 'updatedAt':
          aVal = new Date(a.updatedAt || 0).getTime();
          bVal = new Date(b.updatedAt || 0).getTime();
          break;
        case 'productType':
          aVal = parseSettings(a).productType || '';
          bVal = parseSettings(b).productType || '';
          break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [allProjects, search, filters, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); }
    else { setSelectedIds(new Set(filtered.map(p => p.id))); setSelectAll(true); }
  };

  const handleDelete = async (p: Project) => {
    setDeleting(true);
    try { await api.deleteProject(p.id); setDeleteProject(null); refetch(); useToastStore.getState().success('Project Deleted', `${p.name} has been removed`); } catch { useToastStore.getState().error('Failed', 'Could not delete project'); }
    setDeleting(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.deleteProject(id)));
      useToastStore.getState().success('Deleted', `${selectedIds.size} projects removed`);
      setSelectedIds(new Set());
      setSelectAll(false);
      refetch();
    } catch { useToastStore.getState().error('Failed', 'Could not delete projects'); }
    setDeleting(false);
  };

  if (loading) return (
    <div className="cx-loading">
      <Loader2 className="cx-spinner" />
    </div>
  );

  const clearFilters = () => setFilters({ productType: null, serverId: null, repoProvider: null, status: null });

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  function exportToJSON() {
    const data = filtered.map(p => {
      const s = parseSettings(p);
      return {
        name: p.name,
        description: p.description,
        domain: s.domain,
        clientSlug: s.clientSlug,
        productType: s.productType,
        database: s.database,
        adminUser: s.adminUser,
        androidVersion: s.androidVersion,
        iosVersion: s.iosVersion,
        repoProvider: p.repoProvider,
        defaultBranch: p.defaultBranch,
        status: p.status || 'active',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    useToastStore.getState().success('Export Complete', `${filtered.length} projects exported to JSON`);
  }

  function exportToCSV() {
    const headers = ['Name', 'Description', 'Domain', 'Client Slug', 'Product Type', 'Database', 'Admin User', 'Android Version', 'iOS Version', 'Repo Provider', 'Default Branch', 'Status', 'Created At', 'Updated At'];
    const rows = filtered.map(p => {
      const s = parseSettings(p);
      return [
        p.name,
        p.description || '',
        s.domain || '',
        s.clientSlug || '',
        s.productType || '',
        (s.database as any)?.name || '',
        s.adminUser || '',
        s.androidVersion || '',
        s.iosVersion || '',
        p.repoProvider || '',
        p.defaultBranch || '',
        p.status || 'active',
        p.createdAt || '',
        p.updatedAt || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    useToastStore.getState().success('Export Complete', `${filtered.length} projects exported to CSV`);
  }

  const chipStyle = (active: boolean, color: string) => ({
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
    border: active ? `1.5px solid ${color}` : '1px solid rgb(var(--border))',
    backgroundColor: active ? `${color}18` : 'transparent',
    color: active ? color : 'rgb(var(--text-muted))',
    transition: 'all 150ms ease',
  });

  return (
    <div>
      {/* Keyboard shortcuts hint */}
      <div style={{
        position: 'fixed', bottom: '20px', right: '20px', padding: '8px 14px',
        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        borderRadius: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))',
        display: 'flex', alignItems: 'center', gap: '12px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <span className="cx-flex cx-items-center cx-gap-4"><Keyboard style={{ width: '12px', height: '12px' }} /> <kbd style={{ padding: '2px 6px', backgroundColor: 'rgb(var(--border))', borderRadius: '4px', fontSize: '10px' }}>⌘K</kbd> Search</span>
        <span className="cx-flex cx-items-center cx-gap-4"><kbd style={{ padding: '2px 6px', backgroundColor: 'rgb(var(--border))', borderRadius: '4px', fontSize: '10px' }}>N</kbd> New</span>
      </div>

      {/* Header */}
      <div className="cx-page-header cx-mb-20">
        <div>
          <h1 className="cx-page-title cx-fw-800">Projects</h1>
          <p className="cx-page-subtitle cx-text-muted" style={{ marginTop: '4px' }}>
            {allProjects.length} projects · {allProjects.filter(p => parseSettings(p).productType === 'trade').length} trade · {allProjects.filter(p => parseSettings(p).productType === 'lite').length} lite
            {selectedIds.size > 0 && <span style={{ marginLeft: '12px', color: '#8B5CF6' }}>· {selectedIds.size} selected</span>}
          </p>
        </div>
        <div className="cx-flex cx-gap-8 cx-items-center">
          {/* Sort dropdown */}
          <div className="cx-flex cx-items-center cx-gap-4">
            <span className="cx-text-11 cx-text-muted">Sort:</span>
            <select
              value={sortKey}
              onChange={e => { setSortKey(e.target.value as SortKey); }}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))',
                backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '12px', cursor: 'pointer',
              }}
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="productType">Product Type</option>
            </select>
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="cx-icon-btn"
              style={{ padding: '8px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}
              title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={() => setShowExport(true)}
                className="cx-btn-secondary cx-flex cx-items-center cx-gap-6"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                <Download style={{ width: '13px', height: '13px' }} />
                Export ({selectedIds.size})
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="cx-flex cx-items-center cx-gap-6"
                style={{ padding: '8px 14px', fontSize: '12px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <Trash2 style={{ width: '13px', height: '13px' }} />
                Delete ({selectedIds.size})
              </button>
            </>
          )}

          <div ref={exportRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExport(!showExport)}
              className="cx-flex cx-items-center cx-gap-6 cx-fw-600"
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                border: '1px solid rgb(var(--border))', backgroundColor: 'transparent',
                color: 'rgb(var(--text-muted))',
              }}
            >
              <Download style={{ width: '13px', height: '13px' }} />
              Export
              <ChevronDown style={{ width: '12px', height: '12px', transition: 'transform 200ms', transform: showExport ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {showExport && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', zIndex: 100,
                borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
                boxShadow: '0 16px 48px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
                overflow: 'hidden', animation: 'fadeInDown 150ms ease',
              }}>
                <div className="cx-p-16 cx-border-b">
                  <span className="cx-text-13 cx-fw-700 cx-text-primary">Export Projects</span>
                  <p className="cx-text-11 cx-text-muted" style={{ marginTop: '4px' }}>{selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filtered.length} filtered`}</p>
                </div>
                <button onClick={exportToJSON} className="cx-flex cx-items-center cx-gap-10 cx-w-full cx-p-16 cx-text-13" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--text-primary))' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.06)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <FileJson style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
                  Export as JSON
                </button>
                <button onClick={exportToCSV} className="cx-flex cx-items-center cx-gap-10 cx-w-full cx-p-16" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--text-primary))', borderTop: '1px solid rgb(var(--border))' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.06)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <FileSpreadsheet style={{ width: '16px', height: '16px', color: '#10B981' }} />
                  Export as CSV
                </button>
              </div>
            )}
          </div>

          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="cx-flex cx-items-center cx-gap-6 cx-fw-600"
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', transition: 'all 150ms',
                border: activeFilterCount > 0 ? '1.5px solid rgb(var(--primary))' : '1px solid rgb(var(--border))',
                backgroundColor: activeFilterCount > 0 ? 'rgba(var(--primary), 0.08)' : 'transparent',
                color: activeFilterCount > 0 ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
              }}
            >
              <Filter style={{ width: '13px', height: '13px' }} />
              Filter
              {activeFilterCount > 0 && (
                <span className="cx-flex-center cx-fw-700" style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgb(var(--primary))', color: '#fff', fontSize: '10px' }}>
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown style={{ width: '12px', height: '12px', transition: 'transform 200ms', transform: showFilter ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', zIndex: 100,
                borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
                boxShadow: '0 16px 48px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
                overflow: 'hidden', animation: 'fadeInDown 150ms ease',
              }}>
                <div className="cx-flex-between cx-p-16" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <span className="cx-text-13 cx-fw-700 cx-text-primary">Filters</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}>
                      Clear all
                    </button>
                  )}
                </div>

                {/* Status */}
                <div className="cx-p-16" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <div className="cx-label" style={{ marginBottom: '8px' }}>Status</div>
                  <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
                    <button onClick={() => toggleFilter('status', 'active')} style={chipStyle(filters.status === 'active', '#10B981')}>Active</button>
                    <button onClick={() => toggleFilter('status', 'inactive')} style={chipStyle(filters.status === 'inactive', '#EF4444')}>Inactive</button>
                  </div>
                </div>

                {/* Product Type */}
                <div className="cx-p-16" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <div className="cx-label" style={{ marginBottom: '8px' }}>Product Type</div>
                  <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
                    <button onClick={() => toggleFilter('productType', 'trade')} style={chipStyle(filters.productType === 'trade', '#F59E0B')}>Trade</button>
                    <button onClick={() => toggleFilter('productType', 'lite')} style={chipStyle(filters.productType === 'lite', '#10B981')}>Lite</button>
                  </div>
                </div>

                {/* Server */}
                {filterOptions.servers.length > 0 && (
                  <div className="cx-p-16" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                    <div className="cx-label" style={{ marginBottom: '8px' }}>Server</div>
                    <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
                      {filterOptions.servers.map(sid => (
                        <button key={sid} onClick={() => toggleFilter('serverId', sid)} style={chipStyle(filters.serverId === sid, '#8B5CF6')}>Server {sid}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repo Provider */}
                {filterOptions.repos.length > 0 && (
                  <div className="cx-p-16">
                    <div className="cx-label" style={{ marginBottom: '8px' }}>Repository</div>
                    <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
                      {filterOptions.repos.map(rp => (
                        <button key={rp} onClick={() => toggleFilter('repoProvider', rp)} style={chipStyle(filters.repoProvider === rp, '#3B82F6')}>{rp === 'github' ? 'GitHub' : rp}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="cx-p-16 cx-border-t" style={{ backgroundColor: 'rgba(var(--primary), 0.03)' }}>
                  <span className="cx-text-11 cx-text-muted">{filtered.length} of {allProjects.length} projects</span>
                </div>
              </div>
            )}
          </div>
          <Link href="/projects/new" className="cx-btn-primary cx-flex cx-items-center cx-gap-8" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add Project
          </Link>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="cx-flex cx-items-center cx-gap-6" style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
          <span className="cx-fw-600 cx-text-muted" style={{ fontSize: '11px' }}>Active:</span>
          {filters.status && (
            <span className="cx-flex cx-items-center cx-gap-4 cx-fw-600" style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', backgroundColor: filters.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: filters.status === 'active' ? '#10B981' : '#EF4444' }}>
              {filters.status}
              <button onClick={() => setFilters(f => ({ ...f, status: null }))} className="cx-text-inherit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}><X style={{ width: '10px', height: '10px' }} /></button>
            </span>
          )}
          {filters.productType && (
            <span className="cx-flex cx-items-center cx-gap-4 cx-fw-600" style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', backgroundColor: filters.productType === 'trade' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)', color: filters.productType === 'trade' ? '#F59E0B' : '#10B981' }}>
              {filters.productType === 'trade' ? 'Trade' : 'Lite'}
              <button onClick={() => setFilters(f => ({ ...f, productType: null }))} className="cx-text-inherit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}><X style={{ width: '10px', height: '10px' }} /></button>
            </span>
          )}
          {filters.serverId && (
            <span className="cx-flex cx-items-center cx-gap-4 cx-fw-600" style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', backgroundColor: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
              Server {filters.serverId}
              <button onClick={() => setFilters(f => ({ ...f, serverId: null }))} className="cx-text-inherit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}><X style={{ width: '10px', height: '10px' }} /></button>
            </span>
          )}
          {filters.repoProvider && (
            <span className="cx-flex cx-items-center cx-gap-4 cx-fw-600" style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', backgroundColor: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
              {filters.repoProvider === 'github' ? 'GitHub' : filters.repoProvider}
              <button onClick={() => setFilters(f => ({ ...f, repoProvider: null }))} className="cx-text-inherit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}><X style={{ width: '10px', height: '10px' }} /></button>
            </span>
          )}
          <button onClick={clearFilters} className="cx-text-muted" style={{ fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '2px 4px' }}>Clear all</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="cx-stats-4 cx-mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { Icon: FolderOpen, value: allProjects.length, label: 'Total', color: '#7C3AED' },
          { Icon: TrendingUp, value: allProjects.filter(p => parseSettings(p).productType === 'trade').length, label: 'Trade', color: '#F59E0B' },
          { Icon: BarChart3, value: allProjects.filter(p => parseSettings(p).productType === 'lite').length, label: 'Lite', color: '#10B981' },
          { Icon: Zap, value: allProjects.filter(p => (p.status || 'active') === 'active').length, label: 'Active', color: '#3B82F6' },
        ].map((stat, i) => (
          <div key={i} className="cx-flex cx-items-center cx-gap-12 cx-r-10 cx-surface cx-border" style={{ padding: '14px 20px' }}>
            <div className="cx-flex-center" style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${stat.color}15` }}>
              <stat.Icon style={{ width: '18px', height: '18px', color: stat.color }} />
            </div>
            <div>
              <div className="cx-fw-800" style={{ fontSize: '22px', color: stat.color }}>{stat.value}</div>
              <div className="cx-text-11 cx-fw-600 cx-text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      {allProjects.length > 0 && (
        <div className="cx-flex cx-gap-10 cx-items-center cx-mb-16">
          <div className="cx-flex cx-items-center cx-gap-8 cx-r-10 cx-surface cx-border" style={{ flex: 1, padding: '8px 14px' }}>
            <Search style={{ width: '14px', height: '14px', flexShrink: 0 }} className="cx-text-muted" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects, domains, slugs… (⌘K)"
              className="cx-text-primary cx-text-13"
              style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent' }}
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }} className="cx-text-muted"><X style={{ width: '12px', height: '12px' }} /></button>}
          </div>
          <span className="cx-text-12 cx-text-muted" style={{ whiteSpace: 'nowrap' }}>{filtered.length} of {allProjects.length}</span>
        </div>
      )}

      {/* Select All */}
      {filtered.length > 0 && (
        <div className="cx-flex cx-items-center cx-gap-8 cx-mb-12">
          <button onClick={toggleSelectAll} className="cx-flex cx-items-center cx-gap-6 cx-text-12 cx-text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
            {selectAll ? <CheckSquare style={{ width: '14px', height: '14px' }} /> : <Square style={{ width: '14px', height: '14px' }} />}
            Select all ({filtered.length})
          </button>
          {selectedIds.size > 0 && <span className="cx-text-12 cx-text-muted">· {selectedIds.size} selected</span>}
        </div>
      )}

      {/* Project grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '16px' }}>
        {filtered.map((project) => {
          const s = parseSettings(project);
          const db = (s.database || {}) as Record<string, string>;
          const productColor = s.productType === 'trade' ? '#F59E0B' : '#10B981';
          const productLabel = s.productType === 'trade' ? 'Trade' : 'Lite';
          const isActive = (project.status || 'active') === 'active';
          const isSelected = selectedIds.has(project.id);

          return (
            <div key={project.id}
              className="cx-card"
              style={{
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer',
                position: 'relative', border: isSelected ? '2px solid rgb(var(--primary))' : '1px solid rgb(var(--border))',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.boxShadow = `0 12px 32px -8px ${productColor}20, 0 4px 12px rgba(0,0,0,0.2)`; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Selection checkbox */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                <button onClick={(e) => { e.stopPropagation(); toggleSelect(project.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                  {isSelected ? <CheckSquare style={{ width: '18px', height: '18px', color: 'rgb(var(--primary))' }} /> : <Square style={{ width: '18px', height: '18px', color: 'rgb(var(--text-muted))' }} />}
                </button>
              </div>

              <div style={{ height: '3px', backgroundColor: productColor, margin: '-1px -1px 12px', marginLeft: '-1px' }} />

              {/* Card header */}
              <div className="cx-flex-between" style={{ alignItems: 'flex-start', paddingLeft: '36px' }}>
                <div className="cx-flex cx-items-start cx-gap-12" style={{ minWidth: 0 }}>
                  <div className="cx-flex-center" style={{ width: '42px', height: '42px', flexShrink: 0, borderRadius: '10px', background: `linear-gradient(135deg, ${productColor}20, ${productColor}08)`, border: `1px solid ${productColor}30` }}>
                    <FolderGit2 style={{ width: '20px', height: '20px', color: productColor }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="cx-flex cx-items-center cx-gap-8">
                      <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '15px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</h3>
                      {/* Status badge */}
                      <span className="cx-fw-600" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', textTransform: 'uppercase', whiteSpace: 'nowrap', backgroundColor: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isActive ? '#10B981' : '#EF4444' }}>
                        {project.status || 'active'}
                      </span>
                      <span className="cx-fw-600" style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', textTransform: 'uppercase', whiteSpace: 'nowrap', backgroundColor: `${productColor}15`, color: productColor }}>{productLabel}</span>
                    </div>
                    <div className="cx-flex cx-items-center cx-gap-6" style={{ margin: '3px 0 0', flexWrap: 'wrap' }}>
                      {s.clientSlug && <span className="cx-text-muted cx-mono" style={{ fontSize: '11px' }}>{String(s.clientSlug)}</span>}
                      {s.domain && (
                        <span onClick={e => e.stopPropagation()}>
                          <a href={`http://www.${s.domain}`} target="_blank" rel="noopener noreferrer" className="cx-text-accent cx-flex cx-items-center cx-gap-4" style={{ fontSize: '11px', textDecoration: 'none' }}>
                            {String(s.domain)} <ExternalLink style={{ width: '10px', height: '10px' }} />
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="cx-flex cx-items-center cx-gap-4" style={{ flexShrink: 0 }}>
                  {/* Quick Deploy */}
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/deployments?project=${project.id}`); }}
                    title="Deploy"
                    className="cx-icon-btn cx-text-muted"
                    style={{ padding: '6px', backgroundColor: 'rgba(139,92,246,0.08)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.color = '#8B5CF6'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.08)'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}
                  >
                    <Rocket style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); router.push(`/projects/${project.id}`); }} title="Edit" className="cx-icon-btn cx-text-muted" style={{ padding: '6px' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.12)'; e.currentTarget.style.color = '#818CF8'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}>
                    <Edit3 style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteProject(project); }} title="Delete" className="cx-icon-btn cx-text-muted" style={{ padding: '6px' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              {/* Client config rows */}
              <div style={{ padding: '0 18px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '11px' }}>
                {s.domain && <div><span className="cx-fw-600 cx-text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Admin URL</span><p className="cx-mono cx-text-primary" style={{ margin: '2px 0 0', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(s.adminBaseUrl || '—')}</p></div>}
                {db.name && <div><span className="cx-fw-600 cx-text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Database</span><p className="cx-mono" style={{ margin: '2px 0 0', color: '#00758F', fontSize: '11px', wordBreak: 'break-all' }}>{db.name}</p></div>}
                {s.adminUser && <div><span className="cx-fw-600 cx-text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Admin User</span><p className="cx-mono" style={{ margin: '2px 0 0', color: '#A78BFA', fontSize: '11px' }}>{String(s.adminUser)}</p></div>}
                {s.adminPassword && <div><span className="cx-fw-600 cx-text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Admin Pass</span><div className="cx-flex cx-items-center cx-gap-6" style={{ margin: '2px 0 0' }}><span className="cx-mono" style={{ color: '#A78BFA', fontSize: '11px' }}>{visiblePassId === project.id ? String(s.adminPassword) : '••••••••'}</span><button onClick={e => { e.stopPropagation(); setVisiblePassId(visiblePassId === project.id ? null : project.id); }} className="cx-icon-btn cx-text-muted" style={{ padding: '2px', flexShrink: 0 }}>{visiblePassId === project.id ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}</button></div></div>}
                {s.androidVersion && <div><span className="cx-fw-600 cx-text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Android</span><p className="cx-mono cx-text-primary" style={{ margin: '2px 0 0', fontSize: '11px' }}>v{String(s.androidVersion)}</p></div>}
                {s.iosVersion && <div><span className="cx-fw-600 cx-text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>iOS</span><p className="cx-mono cx-text-primary" style={{ margin: '2px 0 0', fontSize: '11px' }}>v{String(s.iosVersion)}</p></div>}
              </div>

              {/* Tech Tags */}
              <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {[
                  ...(s.productType === 'trade' ? [{ label: 'Trade', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }] : [{ label: 'Lite', color: '#10B981', bg: 'rgba(16,185,129,0.1)' }]),
                  ...(db.name ? [{ label: db.name, color: '#00758F', bg: 'rgba(0,117,143,0.1)' }] : []),
                  ...(s.androidVersion ? [{ label: `Android v${s.androidVersion}`, color: '#3DDC84', bg: 'rgba(61,220,132,0.1)' }] : []),
                  ...(s.iosVersion ? [{ label: `iOS v${s.iosVersion}`, color: '#007AFF', bg: 'rgba(0,122,255,0.1)' }] : []),
                  ...(((s.deploy || {}) as Record<string, string>).serverId ? [{ label: `Srv ${((s.deploy || {}) as Record<string, string>).serverId}`, color: '#10B981', bg: 'rgba(16,185,129,0.1)' }] : []),
                ].map((tag, ti) => (
                  <span key={ti} className="cx-fw-600" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color: tag.color, backgroundColor: tag.bg }}>{tag.label}</span>
                ))}
              </div>

              {/* Footer */}
              <div className="cx-flex-between" style={{ padding: '10px 18px', borderTop: '1px solid rgb(var(--border))', marginTop: 'auto' }}>
                <div className="cx-flex cx-items-center cx-gap-6">
                  <div className="cx-flex cx-items-center cx-gap-4 cx-fw-500 cx-text-accent" style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(var(--primary),0.08)', fontSize: '11px' }}>
                    {project.repoProvider === 'github' ? <Github style={{ width: '11px', height: '11px' }} /> : <Globe style={{ width: '11px', height: '11px' }} />}
                    {project.repoProvider || 'github'}
                  </div>
                  <div className="cx-flex cx-items-center cx-gap-4 cx-fw-500 cx-text-muted" style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>
                    <GitBranchIcon style={{ width: '11px', height: '11px' }} />
                    {project.defaultBranch || 'main'}
                  </div>
                </div>
                <div className="cx-flex cx-items-center cx-gap-8">
                  <span className="cx-text-muted" style={{ fontSize: '10px' }}><Clock style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />{formatRelativeTime(project.updatedAt || project.createdAt)}</span>
                  {s.adminUser && <span className="cx-text-muted cx-flex cx-items-center cx-gap-4" style={{ fontSize: '10px' }}><UserCircle style={{ width: '10px', height: '10px' }} />{String(s.adminUser)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {allProjects.length === 0 && (
        <div className="cx-empty">
          <div className="cx-empty__icon-wrap">
            <FolderGit2 style={{ width: '28px', height: '28px', opacity: 0.8 }} className="cx-text-accent" />
          </div>
          <div>
            <p className="cx-empty__title">No projects yet</p>
            <p className="cx-empty__desc">Create your first client project to get started.</p>
          </div>
          <Link href="/projects/new" className="cx-btn-primary" style={{ textDecoration: 'none' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> New Project
          </Link>
        </div>
      )}

      {/* No results */}
      {allProjects.length > 0 && filtered.length === 0 && (
        <div className="cx-flex-col cx-flex-center" style={{ textAlign: 'center', padding: '48px 24px', borderRadius: '14px', border: '1px dashed rgb(var(--border))' }}>
          <Search className="cx-text-muted" style={{ width: '24px', height: '24px', margin: '0 auto 10px' }} />
          <p className="cx-text-muted" style={{ fontSize: '14px', margin: 0 }}>No projects match &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteProject && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && setDeleteProject(null)}>
          <div className="cx-r-16 cx-surface cx-border" style={{ width: '420px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
            <div className="cx-p-20 cx-border-b">
              <div className="cx-flex cx-gap-10 cx-items-center">
                <div className="cx-flex-center cx-r-10" style={{ width: '36px', height: '36px', backgroundColor: 'rgba(239,68,68,0.1)' }}>
                  <Trash2 style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                </div>
                <span className="cx-text-16 cx-fw-700 cx-text-primary">Delete Project</span>
              </div>
            </div>
            <div className="cx-p-20">
              <p className="cx-text-13 cx-text-secondary" style={{ margin: '0 0 16px', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong className="cx-text-primary">{deleteProject.name}</strong>? This action cannot be undone.
              </p>
              <div className="cx-flex cx-gap-8" style={{ justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteProject(null)} className="cx-btn-secondary" style={{ padding: '9px 18px' }}>Cancel</button>
                <button onClick={() => handleDelete(deleteProject)} disabled={deleting} className="cx-fw-600" style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '13px', cursor: deleting ? 'wait' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}