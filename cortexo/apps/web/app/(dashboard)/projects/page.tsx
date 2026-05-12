'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderGit2,
  Plus, Search,
  Loader2, Github, Globe, X, Edit3, Trash2, Eye, EyeOff, GitBranch as GitBranchIcon,
  Filter, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Project } from '@/lib/api';
import { useCortexoQuery, useAutoLoadToken, useQueryClient } from '@/lib/hooks';

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
};

export default function ProjectsPage() {
  useAutoLoadToken();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: projects, isLoading: loading, refetch } = useCortexoQuery(['projects'], () => api.getProjects());


  const [search, setSearch] = useState('');
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [visiblePassId, setVisiblePassId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({ productType: null, serverId: null, repoProvider: null });
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    }
    if (showFilter) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFilter]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const allProjects = (projects as Project[]) || [];

  // Derive unique filter options from data (must be before any early return)
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

  const filtered = allProjects.filter(p => {
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
    return true;
  });

  const handleDelete = async (p: Project) => {
    setDeleting(true);
    try { await api.deleteProject(p.id); setDeleteProject(null); refetch(); useToastStore.getState().success('Project Deleted', `${p.name} has been removed`); } catch { useToastStore.getState().error('Failed', 'Could not delete project'); }
    setDeleting(false);
  };

  if (loading) return (
    <div className="cx-loading">
      <Loader2 className="cx-spinner" />
    </div>
  );


  const clearFilters = () => setFilters({ productType: null, serverId: null, repoProvider: null });

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

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
      {/* Header */}
      <div className="cx-page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="cx-page-title cx-fw-800">Projects</h1>
          <p className="cx-page-subtitle cx-text-muted" style={{ marginTop: '4px' }}>
            {allProjects.length} {allProjects.length === 1 ? 'project' : 'projects'} · {allProjects.filter(p => { const st = parseSettings(p); return st.productType === 'trade'; }).length} trade · {allProjects.filter(p => { const st = parseSettings(p); return st.productType === 'lite'; }).length} lite
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px',
                border: activeFilterCount > 0 ? '1.5px solid rgb(var(--primary))' : '1px solid rgb(var(--border))',
                backgroundColor: activeFilterCount > 0 ? 'rgba(var(--primary), 0.08)' : 'transparent',
                color: activeFilterCount > 0 ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
              }}
            >
              <Filter style={{ width: '13px', height: '13px' }} />
              Filter
              {activeFilterCount > 0 && (
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgb(var(--primary))',
                  color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown style={{ width: '12px', height: '12px', transition: 'transform 200ms', transform: showFilter ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Filter Dropdown */}
            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', zIndex: 100,
                borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
                boxShadow: '0 16px 48px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
                overflow: 'hidden', animation: 'fadeInDown 150ms ease',
              }}>
                {/* Dropdown Header */}
                <div className="cx-flex-between cx-p-16" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <span className="cx-text-13 cx-fw-700 cx-text-primary">Filters</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}>
                      Clear all
                    </button>
                  )}
                </div>

                {/* Product Type */}
                <div className="cx-p-16" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <div className="cx-label" style={{ marginBottom: '8px' }}>Product Type</div>
                  <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
                    <button onClick={() => toggleFilter('productType', 'trade')} style={chipStyle(filters.productType === 'trade', '#F59E0B')}>
                      Trade
                    </button>
                    <button onClick={() => toggleFilter('productType', 'lite')} style={chipStyle(filters.productType === 'lite', '#10B981')}>
                      Lite
                    </button>
                  </div>
                </div>

                {/* Server */}
                {filterOptions.servers.length > 0 && (
                  <div className="cx-p-16" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                    <div className="cx-label" style={{ marginBottom: '8px' }}>Server</div>
                    <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
                      {filterOptions.servers.map(sid => (
                        <button key={sid} onClick={() => toggleFilter('serverId', sid)} style={chipStyle(filters.serverId === sid, '#8B5CF6')}>
                          Server {sid}
                        </button>
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
                        <button key={rp} onClick={() => toggleFilter('repoProvider', rp)} style={chipStyle(filters.repoProvider === rp, '#3B82F6')}>
                          {rp === 'github' ? 'GitHub' : rp}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer with result count */}
                <div className="cx-p-16 cx-border-t" style={{ backgroundColor: 'rgba(var(--primary), 0.03)' }}>
                  <span className="cx-text-11 cx-text-muted">{filtered.length} of {allProjects.length} projects</span>
                </div>
              </div>
            )}
          </div>
          <Link href="/projects/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)', textDecoration: 'none' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add Project
          </Link>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontWeight: 600 }}>Active:</span>
          {filters.productType && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: filters.productType === 'trade' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)', color: filters.productType === 'trade' ? '#F59E0B' : '#10B981' }}>
              {filters.productType === 'trade' ? 'Trade' : 'Lite'}
              <button onClick={() => setFilters(f => ({ ...f, productType: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit', opacity: 0.7 }}><X style={{ width: '10px', height: '10px' }} /></button>
            </span>
          )}
          {filters.serverId && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
              Server {filters.serverId}
              <button onClick={() => setFilters(f => ({ ...f, serverId: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit', opacity: 0.7 }}><X style={{ width: '10px', height: '10px' }} /></button>
            </span>
          )}
          {filters.repoProvider && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
              {filters.repoProvider === 'github' ? 'GitHub' : filters.repoProvider}
              <button onClick={() => setFilters(f => ({ ...f, repoProvider: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit', opacity: 0.7 }}><X style={{ width: '10px', height: '10px' }} /></button>
            </span>
          )}
          <button onClick={clearFilters} style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '2px 4px' }}>Clear all</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="cx-stats-3" style={{ marginBottom: '20px' }}>
        {[
          { icon: '📂', value: allProjects.length, label: 'Total Projects', color: '#7C3AED' },
          { icon: '📈', value: allProjects.filter(p => parseSettings(p).productType === 'trade').length, label: 'Trade', color: '#F59E0B' },
          { icon: '📊', value: allProjects.filter(p => parseSettings(p).productType === 'lite').length, label: 'Lite', color: '#10B981' },
        ].map((stat, i) => (
          <div key={i} className="cx-flex cx-items-center cx-gap-12 cx-r-10 cx-surface cx-border" style={{ padding: '14px 20px' }}>
            <span style={{ fontSize: '22px' }}>{stat.icon}</span>
            <div>
              <div className="cx-fw-800" style={{ fontSize: '22px', color: stat.color }}>{stat.value}</div>
              <div className="cx-text-11 cx-fw-600 cx-text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      {allProjects.length > 0 && (
        <div className="cx-flex cx-gap-10 cx-items-center" style={{ marginBottom: '16px' }}>
          <div className="cx-flex cx-items-center cx-gap-8 cx-r-10 cx-surface cx-border" style={{ flex: 1, padding: '8px 14px' }}>
            <Search style={{ width: '14px', height: '14px', flexShrink: 0 }} className="cx-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, domains, slugs…" className="cx-text-primary cx-text-13" style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }} className="cx-text-muted"><X style={{ width: '12px', height: '12px' }} /></button>}
          </div>
          <span className="cx-text-12 cx-text-muted" style={{ whiteSpace: 'nowrap' }}>{filtered.length} of {allProjects.length}</span>
        </div>
      )}

      {/* Project grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '16px' }}>
        {filtered.map((project) => {
          const s = parseSettings(project);
          const db = (s.database || {}) as Record<string, string>;
          const productColor = s.productType === 'trade' ? '#F59E0B' : '#10B981';
          const productLabel = s.productType === 'trade' ? 'Trade' : 'Lite';

          return (
            <div key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px -8px ${productColor}20, 0 4px 12px rgba(0,0,0,0.2)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ height: '3px', backgroundColor: productColor, position: 'absolute', top: 0, left: 0, right: 0 }} />

              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 18px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', flexShrink: 0, borderRadius: '10px', background: `linear-gradient(135deg, ${productColor}20, ${productColor}08)`, border: `1px solid ${productColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderGit2 style={{ width: '20px', height: '20px', color: productColor }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', backgroundColor: `${productColor}15`, color: productColor }}>{productLabel}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0 0', flexWrap: 'wrap' }}>
                      {s.clientSlug && <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{String(s.clientSlug)}</span>}
                      {s.domain && <span onClick={e => e.stopPropagation()}><a href={`http://www.${s.domain}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'rgb(var(--primary))', textDecoration: 'none' }}>{String(s.domain)}</a></span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); router.push(`/projects/${project.id}`); }}
                    title="Edit"
                    style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', transition: 'all 150ms' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.12)'; e.currentTarget.style.color = '#818CF8'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}>
                    <Edit3 style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteProject(project); }}
                    title="Delete"
                    style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', transition: 'all 150ms' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              {/* Client config rows */}
              <div style={{ padding: '0 18px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '11px' }}>
                {s.domain && <div><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Admin URL</span><p style={{ margin: '2px 0 0', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(s.adminBaseUrl || '—')}</p></div>}
                {db.name && <div><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Database</span><p style={{ margin: '2px 0 0', color: '#00758F', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', wordBreak: 'break-all' }}>{db.name}</p></div>}
                {s.adminUser && <div><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Admin User</span><p style={{ margin: '2px 0 0', color: '#A78BFA', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>{String(s.adminUser)}</p></div>}
                {s.adminPassword && <div><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Admin Pass</span><div style={{ margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#A78BFA', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>{visiblePassId === project.id ? String(s.adminPassword) : '••••••••'}</span><button onClick={e => { e.stopPropagation(); setVisiblePassId(visiblePassId === project.id ? null : project.id); }} style={{ padding: '2px', border: 'none', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', display: 'flex', flexShrink: 0 }} title={visiblePassId === project.id ? 'Hide' : 'Show'}>{visiblePassId === project.id ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}</button></div></div>}
                {s.androidVersion && <div><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>Android</span><p style={{ margin: '2px 0 0', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>v{String(s.androidVersion)}</p></div>}
                {s.iosVersion && <div><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '9px' }}>iOS</span><p style={{ margin: '2px 0 0', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>v{String(s.iosVersion)}</p></div>}
              </div>

              {/* Tech Tags — dynamic based on actual project data */}
              <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {[
                  ...(s.productType === 'trade' ? [{ label: 'Trade', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }] : [{ label: 'Lite', color: '#10B981', bg: 'rgba(16,185,129,0.1)' }]),
                  ...(db.name ? [{ label: db.name, color: '#00758F', bg: 'rgba(0,117,143,0.1)' }] : []),
                  ...(s.androidVersion ? [{ label: `Android v${s.androidVersion}`, color: '#3DDC84', bg: 'rgba(61,220,132,0.1)' }] : []),
                  ...(s.iosVersion ? [{ label: `iOS v${s.iosVersion}`, color: '#007AFF', bg: 'rgba(0,122,255,0.1)' }] : []),
                  ...(((s.deploy || {}) as Record<string, string>).serverId ? [{ label: `Server ${((s.deploy || {}) as Record<string, string>).serverId}`, color: '#10B981', bg: 'rgba(16,185,129,0.1)' }] : []),
                ].map((tag, ti) => (
                  <span key={ti} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: tag.color, backgroundColor: tag.bg }}>{tag.label}</span>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderTop: '1px solid rgb(var(--border))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(var(--primary),0.08)', fontSize: '11px', fontWeight: 500, color: 'rgb(var(--primary))' }}>
                    {project.repoProvider === 'github' ? <Github style={{ width: '11px', height: '11px' }} /> : <Globe style={{ width: '11px', height: '11px' }} />}
                    {project.repoProvider || 'github'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>
                    <GitBranchIcon style={{ width: '11px', height: '11px' }} />
                    {project.defaultBranch || 'main'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>⏱ {(() => { const d = project.updatedAt ? new Date(project.updatedAt) : project.createdAt ? new Date(project.createdAt) : null; if (!d) return '—'; const s = Math.floor((Date.now() - d.getTime()) / 1000); if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`; })()}</span>
                  {s.adminUser && <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>👤 {String(s.adminUser)}</span>}
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
        <div style={{ textAlign: 'center', padding: '48px 24px', borderRadius: '14px', border: '1px dashed rgb(var(--border))' }}>
          <Search style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))', margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>No projects match &ldquo;{search}&rdquo;</p>
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
                <button onClick={() => handleDelete(deleteProject)} disabled={deleting} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: deleting ? 'wait' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
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
