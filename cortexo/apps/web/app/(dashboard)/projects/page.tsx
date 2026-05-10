'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderGit2,
  Plus, Search,
  Loader2, Github, Globe, X, Edit3, Trash2, Eye, EyeOff, GitBranch as GitBranchIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Project } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';

function parseSettings(p: Project) {
  try {
    const raw = (p as unknown as Record<string, unknown>).settings;
    if (!raw) return {} as Record<string, unknown>;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch { return {} as Record<string, unknown>; }
}

export default function ProjectsPage() {
  useAutoLoadToken();
  const router = useRouter();
  const { data: projects, loading, refetch } = useApiData(() => api.getProjects());

  const [search, setSearch] = useState('');
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [visiblePassId, setVisiblePassId] = useState<string | null>(null);


  const handleDelete = async (p: Project) => {
    setDeleting(true);
    try { await api.deleteProject(p.id); setDeleteProject(null); refetch(); useToastStore.getState().success('Project Deleted', `${p.name} has been removed`); } catch { useToastStore.getState().error('Failed', 'Could not delete project'); }
    setDeleting(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
      <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const allProjects = (projects as Project[]) || [];
  const filtered = allProjects.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    const s = parseSettings(p);
    return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || String(s.domain || '').toLowerCase().includes(q) || String(s.clientSlug || '').toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0 }}>Projects</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>
            {allProjects.length} {allProjects.length === 1 ? 'project' : 'projects'} · {allProjects.filter(p => { const st = parseSettings(p); return st.productType === 'trade'; }).length} trade · {allProjects.filter(p => { const st = parseSettings(p); return st.productType === 'lite'; }).length} lite
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>⚡ Filter</button>
          <Link href="/projects/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)', textDecoration: 'none' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add Project
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { icon: '📂', value: allProjects.length, label: 'Total Projects', color: '#7C3AED' },
          { icon: '📈', value: allProjects.filter(p => parseSettings(p).productType === 'trade').length, label: 'Trade', color: '#F59E0B' },
          { icon: '📊', value: allProjects.filter(p => parseSettings(p).productType === 'lite').length, label: 'Lite', color: '#10B981' },
        ].map((stat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '10px', backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--border))' }}>
            <span style={{ fontSize: '22px' }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      {allProjects.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
            <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, domains, slugs…" style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', color: 'rgb(var(--text-primary))' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '2px' }}><X style={{ width: '12px', height: '12px' }} /></button>}
          </div>
          <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', whiteSpace: 'nowrap' }}>{filtered.length} of {allProjects.length}</span>
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
                  <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>⏱ 3 days ago · v1.1</span>
                  {s.adminUser && <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>👤 {String(s.adminUser)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {allProjects.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))' }}>
            <FolderGit2 style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>No projects yet</p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Create your first client project to get started.</p>
          </div>
          <Link href="/projects/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', textDecoration: 'none' }}>
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
          <div style={{ width: '420px', borderRadius: '16px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgb(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Delete Project</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: '0 0 16px', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: 'rgb(var(--text-primary))' }}>{deleteProject.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteProject(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-secondary))', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
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
