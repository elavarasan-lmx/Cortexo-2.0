'use client';

import { useState } from 'react';
import {
  Users, Plus, Trash2, Copy, Eye, Search, Loader2, RefreshCw,
  Globe, Database, Radio, Shield, Activity, ChevronDown,
  ExternalLink, History, Code2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';
import Link from 'next/link';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: 'Draft' },
  provisioning: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', label: 'Provisioning' },
  active: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'Active' },
  maintenance: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Maintenance' },
  degraded: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Degraded' },
  archived: { bg: 'rgba(107,114,128,0.1)', color: '#9CA3AF', label: 'Archived' },
};

const MIGRATION_STYLES: Record<string, { color: string; label: string }> = {
  pending: { color: '#F59E0B', label: 'Pending' },
  in_progress: { color: '#3B82F6', label: 'In Progress' },
  current: { color: '#10B981', label: 'Current' },
  diverged: { color: '#EC4899', label: 'Diverged' },
  failed: { color: '#EF4444', label: 'Failed' },
};

export default function ClientConfigsPage() {
  useAutoLoadToken();
  const toast = useToastStore();
  const { data: clients, loading, refetch } = useApiData(() => api.getClientConfigs());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cloneSlug, setCloneSlug] = useState<string | null>(null);
  const [cloneForm, setCloneForm] = useState({ newSlug: '', newDisplayName: '', newDomain: '' });
  const [cloning, setCloning] = useState(false);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const allClients = ((clients as any[]) || []).filter((c: any) => {
    const matchSearch = !search || c.clientSlug?.toLowerCase().includes(search.toLowerCase()) || c.displayName?.toLowerCase().includes(search.toLowerCase()) || c.domain?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const deleteClient = async (slug: string) => {
    if (!confirm(`Delete client config "${slug}"? This cannot be undone.`)) return;
    try {
      await api.deleteClientConfig(slug);
      toast.success('Deleted', `Client "${slug}" removed`);
      await refetch();
    } catch { toast.error('Failed', 'Could not delete client config'); }
  };

  const cloneClient = async () => {
    if (!cloneForm.newSlug || !cloneForm.newDisplayName) return;
    setCloning(true);
    try {
      await api.cloneClientConfig(cloneSlug!, cloneForm);
      toast.success('Cloned', `New client "${cloneForm.newSlug}" created`);
      setCloneSlug(null);
      setCloneForm({ newSlug: '', newDisplayName: '', newDomain: '' });
      await refetch();
    } catch { toast.error('Failed', 'Clone failed'); }
    setCloning(false);
  };

  const previewConfig = async (slug: string) => {
    if (previewSlug === slug) { setPreviewSlug(null); return; }
    setLoadingPreview(true);
    try {
      const res = await api.renderClientConfig(slug);
      setPreviewContent((res.data as any).rendered || '');
      setPreviewSlug(slug);
    } catch { toast.error('Error', 'Could not render config'); }
    setLoadingPreview(false);
  };

  const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'Inter', sans-serif" };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '28px', height: '28px', color: '#8B5CF6' }} />
            Client Configurations
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            {allClients.length} client{allClients.length !== 1 ? 's' : ''} · per-client Winbull configs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
          </button>
          <Link href="/sources/provision" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)', textDecoration: 'none' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> New Client
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--text-muted))' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: '160px', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="provisioning">Provisioning</option>
          <option value="maintenance">Maintenance</option>
          <option value="degraded">Degraded</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Client Cards */}
      {allClients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', border: '1px dashed rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          <Users className="float-icon" style={{ width: '48px', height: '48px', color: 'rgb(var(--text-muted))', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>No Client Configs Yet</h3>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', maxWidth: '400px', margin: '0 auto 16px' }}>
            Create your first client configuration using the New Client Wizard.
          </p>
          <Link href="/sources/provision" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', textDecoration: 'none' }}>
            <Plus style={{ width: 14, height: 14 }} /> New Client Wizard
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '14px' }}>
          {allClients.map((client: any, i: number) => {
            const st = STATUS_STYLES[client.status] || STATUS_STYLES.draft;
            const ms = MIGRATION_STYLES[client.migrationStatus] || MIGRATION_STYLES.pending;
            const health = client.healthScore ?? 100;
            const healthColor = health >= 80 ? '#10B981' : health >= 50 ? '#F59E0B' : '#EF4444';
            const isCloning = cloneSlug === client.clientSlug;
            const isPreviewing = previewSlug === client.clientSlug;

            return (
              <div key={client.id || i} className="card-enter" style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', animationDelay: `${i * 40}ms` }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px -8px ${st.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ height: '3px', background: `linear-gradient(90deg, ${st.color}, ${st.color}66)` }} />

                {/* Card Header */}
                <div style={{ padding: '18px 18px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{client.displayName}</h3>
                      <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace", marginTop: '3px' }}>{client.clientSlug}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', background: st.bg, color: st.color, border: `1px solid ${st.color}30` }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Info Row */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {client.domain && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>
                        <Globe style={{ width: 12, height: 12 }} /> {client.domain}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: ms.color }}>
                      <Database style={{ width: 12, height: 12 }} /> {ms.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: healthColor }}>
                      <Activity style={{ width: 12, height: 12 }} /> {health}%
                    </div>
                  </div>
                  {client.deployedVersion && (
                    <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '6px' }}>
                      Deployed: v{client.deployedVersion} · {timeAgo(client.lastDeployedAt)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: '0 18px 14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => previewConfig(client.clientSlug)} className="action-btn">
                    <Code2 style={{ width: 12, height: 12 }} /> {isPreviewing ? 'Hide' : 'Preview'}
                  </button>
                  <button onClick={() => { setCloneSlug(isCloning ? null : client.clientSlug); setCloneForm({ newSlug: '', newDisplayName: '', newDomain: '' }); }} className="action-btn">
                    <Copy style={{ width: 12, height: 12 }} /> Clone
                  </button>
                  <button onClick={() => deleteClient(client.clientSlug)} className="action-btn action-btn--danger">
                    <Trash2 style={{ width: 12, height: 12 }} /> Delete
                  </button>
                </div>

                {/* Clone Form */}
                {isCloning && (
                  <div style={{ padding: '14px 18px', borderTop: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 10px' }}>Clone to New Client</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div><label style={labelStyle}>New Slug *</label><input value={cloneForm.newSlug} onChange={e => setCloneForm(f => ({ ...f, newSlug: e.target.value }))} placeholder="e.g. sriram_gold" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Display Name *</label><input value={cloneForm.newDisplayName} onChange={e => setCloneForm(f => ({ ...f, newDisplayName: e.target.value }))} placeholder="e.g. Sriram Gold" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Domain</label><input value={cloneForm.newDomain} onChange={e => setCloneForm(f => ({ ...f, newDomain: e.target.value }))} placeholder="e.g. www.sriramgold.com" style={inputStyle} /></div>
                      <button onClick={cloneClient} disabled={!cloneForm.newSlug || !cloneForm.newDisplayName || cloning} style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', opacity: (!cloneForm.newSlug || cloning) ? 0.5 : 1 }}>
                        {cloning ? 'Cloning...' : 'Create Clone'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Config Preview */}
                {isPreviewing && previewContent && (
                  <div style={{ borderTop: '1px solid rgb(var(--border))' }}>
                    <div style={{ padding: '10px 18px', fontSize: '11px', fontWeight: 700, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>Generated global_configs.php</div>
                    <pre style={{ padding: '0 18px 14px', fontSize: '11px', lineHeight: 1.6, color: 'rgb(var(--text-secondary))', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', margin: 0 }}>
                      {previewContent}
                    </pre>
                  </div>
                )}
                {isPreviewing && loadingPreview && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite', color: 'rgb(var(--text-muted))' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
