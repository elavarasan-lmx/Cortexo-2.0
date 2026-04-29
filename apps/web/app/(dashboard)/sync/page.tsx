'use client';

import { useState, useEffect } from 'react';
import {
  GitCompareArrows, Play, Clock, CheckCircle, AlertTriangle, XCircle,
  Loader2, RefreshCw, Filter, Zap, BarChart3, Users, FolderSync,
  Search, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, useProjectLookup, resolveProjectName, timeAgo } from '@/lib/hooks';
import PushUpdateWizard from '@/components/push-update-wizard';

const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
  pending:  { bg: 'rgba(107,114,128,0.10)', text: '#6B7280', icon: Clock },
  syncing:  { bg: 'rgba(129,140,248,0.10)', text: '#818CF8', icon: Loader2 },
  success:  { bg: 'rgba(16,185,129,0.10)',  text: '#10B981', icon: CheckCircle },
  failed:   { bg: 'rgba(239,68,68,0.10)',   text: '#EF4444', icon: XCircle },
  conflict: { bg: 'rgba(245,158,11,0.10)',  text: '#F59E0B', icon: AlertTriangle },
};

function StatCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', borderTop: `3px solid ${color}`, backgroundColor: 'rgb(var(--surface))', padding: '14px 18px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 6px 0' }}>{label}</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: '20px', height: '20px', color }} />
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'push', label: 'Push Update', icon: FolderSync, color: '#818CF8' },
  { id: 'history', label: 'Sync History', icon: Clock, color: '#3B82F6' },
  { id: 'status', label: 'Client Status', icon: Users, color: '#10B981' },
] as const;

export default function SyncPage() {
  useAutoLoadToken();
  const [tab, setTab] = useState<string>('push');
  const [showWizard, setShowWizard] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: syncData, loading, refetch } = useApiData(() => api.getSyncHistory());
  const { data: clientsData } = useApiData(() => api.getSyncClients());
  const { data: projectsData } = useApiData(() => api.getProjects());
  const { lookup } = useProjectLookup();

  const syncs = (syncData as any)?.syncs || (syncData as any)?.data?.syncs || (syncData as any)?.data || [];
  const clients = (clientsData as any)?.clients || (clientsData as any)?.data?.clients || (clientsData as any)?.data || [];
  const projects = ((projectsData as any) || []) as any[];

  const stats = {
    total: syncs.length,
    success: syncs.filter((s: any) => s.status === 'success').length,
    failed: syncs.filter((s: any) => s.status === 'failed').length,
    syncing: syncs.filter((s: any) => s.status === 'syncing' || s.status === 'pending').length,
  };

  const filtered = statusFilter === 'all' ? syncs : syncs.filter((s: any) => s.status === statusFilter);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Source Sync</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Push source updates to clients · {projects.length} clients registered</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
          </button>
          <button onClick={() => setShowWizard(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)', transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--primary), 0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary), 0.3)'; e.currentTarget.style.transform = 'none'; }}>
            <Play style={{ width: '16px', height: '16px' }} /> Push Update
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Total Syncs" value={stats.total} color="#818CF8" icon={BarChart3} />
        <StatCard label="Successful" value={stats.success} color="#10B981" icon={CheckCircle} />
        <StatCard label="Failed" value={stats.failed} color="#EF4444" icon={XCircle} />
        <StatCard label="In Progress" value={stats.syncing} color="#F59E0B" icon={Zap} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid rgb(var(--border))', paddingBottom: '0' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: active ? 700 : 500, backgroundColor: 'transparent',
              color: active ? t.color : 'rgb(var(--text-muted))', borderBottom: active ? `3px solid ${t.color}` : '3px solid transparent',
              transition: 'all 150ms', marginBottom: '-1px',
            }}>
              <Icon style={{ width: '14px', height: '14px' }} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Push Update */}
      {tab === 'push' && (
        <div>
          {projects.length === 0 && !loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 32px', textAlign: 'center', borderRadius: '16px', border: '1px dashed rgb(var(--border))' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))' }}>
                <FolderSync style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', opacity: 0.8 }} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>No clients registered yet</p>
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Add projects from the Projects page first, then push updates here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {projects.map((p: any) => {
                let domain = '';
                try { const s = typeof p.settings === 'string' ? JSON.parse(p.settings) : p.settings; domain = s?.domain || ''; } catch {}
                return (
                  <div key={p.id} style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '16px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'rgb(var(--primary))' }}>{p.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        {domain && <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{domain}</p>}
                      </div>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>SYNCED</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                      <Clock style={{ width: '10px', height: '10px' }} /> Last sync: {p.updatedAt ? timeAgo(p.updatedAt) : 'Never'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* CTA */}
          {projects.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button onClick={() => setShowWizard(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 16px rgba(var(--primary), 0.3)' }}>
                <Play style={{ width: '16px', height: '16px' }} /> Push Update to Selected Clients
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Sync History */}
      {tab === 'history' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Filter style={{ width: '13px', height: '13px', color: 'rgb(var(--text-muted))' }} />
            {['all', 'success', 'failed', 'syncing', 'pending', 'conflict'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                backgroundColor: statusFilter === s ? 'rgba(var(--primary), 0.12)' : 'transparent',
                color: statusFilter === s ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
              }}>{s}</button>
            ))}
          </div>
          <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 100px 120px 80px', padding: '10px 18px', borderBottom: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--border), 0.05)' }}>
              {['Client', 'Source', 'Target', 'Status', 'Time', 'By'].map(h => (
                <span key={h} style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))' }}>{h}</span>
              ))}
            </div>
            {filtered.map((sync: any) => {
              const sc = statusConfig[sync.status] || statusConfig.pending;
              const Icon = sc.icon;
              return (
                <div key={sync.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 100px 120px 80px', padding: '12px 18px', borderBottom: '1px solid rgb(var(--border))', transition: 'background-color 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{sync.clientName || sync.clientId}</span>
                    {sync.errorMessage && <p style={{ fontSize: '11px', color: '#EF4444', margin: '2px 0 0', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sync.errorMessage}</p>}
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', fontFamily: "'JetBrains Mono', monospace" }}>{sync.sourceBranch}</span>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', fontFamily: "'JetBrains Mono', monospace" }}>{sync.targetBranch}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, backgroundColor: sc.bg, color: sc.text, width: 'fit-content' }}>
                    <Icon style={{ width: '10px', height: '10px', ...(sync.status === 'syncing' ? { animation: 'spin 1s linear infinite' } : {}) }} />{sync.status}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{timeAgo(sync.createdAt)}</span>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{sync.triggeredBy}</span>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>No sync records match this filter.</div>}
          </div>
        </div>
      )}

      {/* Tab: Client Status */}
      {tab === 'status' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>No clients registered.</div>
          ) : projects.map((p: any) => {
            let domain = '', dbName = '';
            try { const s = typeof p.settings === 'string' ? JSON.parse(p.settings) : p.settings; domain = s?.domain || ''; dbName = s?.database?.name || ''; } catch {}
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', transition: 'box-shadow 200ms' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'rgb(var(--primary))' }}>{p.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{p.name}</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '3px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                    {domain && <span>🌐 {domain}</span>}
                    {dbName && <span>🗄️ {dbName}</span>}
                    <span><Clock style={{ width: '10px', height: '10px', display: 'inline' }} /> {p.updatedAt ? timeAgo(p.updatedAt) : 'Never synced'}</span>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>UP TO DATE</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Wizard modal */}
      {showWizard && <PushUpdateWizard onClose={() => setShowWizard(false)} onSuccess={() => { setShowWizard(false); refetch(); }} />}
    </div>
  );
}
