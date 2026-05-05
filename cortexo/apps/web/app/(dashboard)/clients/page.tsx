'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Globe, Server, Activity, Search, Plus,
  ArrowUpRight, Shield, Bug, Clock, Loader2, RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

/* ── Design tokens ── */
const card: React.CSSProperties = {
  borderRadius: '14px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const,
  letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 2px',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  maintenance: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  inactive: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
};

const gradients = [
  'linear-gradient(135deg, #3B82F6, #6366F1)',
  'linear-gradient(135deg, #F59E0B, #F97316)',
  'linear-gradient(135deg, #EC4899, #8B5CF6)',
  'linear-gradient(135deg, #10B981, #14B8A6)',
  'linear-gradient(135deg, #EF4444, #F97316)',
  'linear-gradient(135deg, #818CF8, #6366F1)',
  'linear-gradient(135deg, #6B7280, #9CA3AF)',
];

const filterOptions = ['All', 'Active', 'Maintenance', 'Inactive'];

export default function ClientsPage() {
  useAutoLoadToken();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const { data: clients, loading, error, refetch } = useApiData(
    () => api.getWinbullConfigs(),
    { default: [] as any[] }
  );

  const clientList = (clients || []).map((c: any, i: number) => ({
    id: c.id || c.slug || i,
    name: c.displayName || c.name || c.slug || 'Unknown',
    slug: c.slug || '',
    domain: c.domain || c.url || '—',
    status: c.status || 'active',
    environment: c.environment || 'production',
    initials: ((c.displayName || c.name || c.slug || 'U').substring(0, 2)).toUpperCase(),
    gradient: gradients[i % gradients.length],
    platform: c.platform || '—',
    dbHost: c.dbHost || '—',
  }));

  const filtered = clientList.filter((c: any) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const totalClients = clientList.length;
  const activeCount = clientList.filter((c: any) => c.status === 'active').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            👥 Clients
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>
            Manage all platform clients and their environments
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
            <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}>
            <Plus style={{ width: '14px', height: '14px' }} /> Add Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Clients', value: loading ? '—' : totalClients, color: '#7C3AED', icon: Users },
          { label: 'Active', value: loading ? '—' : activeCount, color: '#10B981', icon: Shield },
          { label: 'Configs', value: loading ? '—' : totalClients, color: '#3B82F6', icon: Activity },
          { label: 'Platforms', value: loading ? '—' : new Set(clientList.map((c: any) => c.platform)).size, color: '#F97316', icon: Server },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
            </div>
            <div>
              <p style={labelStyle}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ ...card, padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px', border: '1px solid rgb(var(--border))', fontSize: '13px', outline: 'none', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {filterOptions.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: '20px', border: 'none',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              backgroundColor: filter === f ? '#7C3AED' : 'rgba(var(--border),0.3)',
              color: filter === f ? '#fff' : 'rgb(var(--text-muted))',
              transition: 'all 180ms',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading clients...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {/* Client Cards Grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
          {filtered.map((c: any) => {
            const st = statusColors[c.status] || statusColors.inactive;
            return (
              <Link key={c.id} href={`/clients/detail?slug=${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ ...card, padding: '20px', transition: 'all 200ms ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {/* Client Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>{c.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</h3>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, backgroundColor: st.bg, color: st.text, textTransform: 'capitalize', flexShrink: 0 }}>{c.status}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>
                        <Globe style={{ width: '11px', height: '11px' }} /> {c.domain}
                      </div>
                    </div>
                    <ArrowUpRight style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
                  </div>

                  {/* Info Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px 0', borderTop: '1px solid rgba(var(--border),0.15)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>Slug</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{c.slug}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>Platform</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#3B82F6', margin: 0 }}>{c.platform}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>Environment</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', margin: 0 }}>{c.environment}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(var(--border),0.15)', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                    <span>DB: {c.dbHost}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.2)', fontSize: '10px', fontWeight: 600 }}>{c.environment}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
          <Users style={{ width: '40px', height: '40px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>No clients found</p>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            {totalClients === 0 ? 'Add your first client to get started' : 'Try adjusting your search or filter'}
          </p>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
