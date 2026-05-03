'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Globe, Server, Activity, Search, Plus,
  ArrowUpRight, Shield, Bug, Clock,
} from 'lucide-react';

/* ── Design tokens (pencil.pen v2) ── */
const card: React.CSSProperties = {
  borderRadius: '14px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#94A3B8',
  margin: '0 0 2px',
};

/* ── Demo data ── */
const clients = [
  {
    id: 1,
    name: 'VijayBullion',
    domain: 'vijaybullion.com',
    status: 'active' as const,
    environment: 'production',
    projects: 3,
    servers: 3,
    deploys: 342,
    bugs: 7,
    uptime: '99.97%',
    lastDeploy: '2h ago',
    initials: 'VB',
    gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
  },
  {
    id: 2,
    name: 'GoldTrend',
    domain: 'goldtrend.in',
    status: 'active' as const,
    environment: 'production',
    projects: 2,
    servers: 2,
    deploys: 128,
    bugs: 3,
    uptime: '99.85%',
    lastDeploy: '6h ago',
    initials: 'GT',
    gradient: 'linear-gradient(135deg, #F59E0B, #F97316)',
  },
  {
    id: 3,
    name: 'MKR Jewellers',
    domain: 'mkrjewellers.com',
    status: 'active' as const,
    environment: 'production',
    projects: 1,
    servers: 1,
    deploys: 56,
    bugs: 1,
    uptime: '99.92%',
    lastDeploy: '1d ago',
    initials: 'MK',
    gradient: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
  },
  {
    id: 4,
    name: 'MNT Traders',
    domain: 'mnttraders.com',
    status: 'maintenance' as const,
    environment: 'staging',
    projects: 2,
    servers: 1,
    deploys: 34,
    bugs: 5,
    uptime: '98.5%',
    lastDeploy: '3d ago',
    initials: 'MT',
    gradient: 'linear-gradient(135deg, #10B981, #14B8A6)',
  },
  {
    id: 5,
    name: 'SilverEdge',
    domain: 'silveredge.io',
    status: 'inactive' as const,
    environment: 'development',
    projects: 1,
    servers: 0,
    deploys: 12,
    bugs: 0,
    uptime: '—',
    lastDeploy: '2w ago',
    initials: 'SE',
    gradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  maintenance: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  inactive: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
};

const filterOptions = ['All', 'Active', 'Maintenance', 'Inactive'];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' || c.status.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const totalClients = clients.length;
  const activeCount = clients.filter((c) => c.status === 'active').length;
  const totalProjects = clients.reduce((s, c) => s + c.projects, 0);
  const totalServers = clients.reduce((s, c) => s + c.servers, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            👥 Clients
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>
            Manage all platform clients and their environments
          </p>
        </div>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}
        >
          <Plus style={{ width: '14px', height: '14px' }} /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Clients', value: totalClients, color: '#7C3AED', icon: Users },
          { label: 'Active', value: activeCount, color: '#10B981', icon: Shield },
          { label: 'Projects', value: totalProjects, color: '#3B82F6', icon: Activity },
          { label: 'Servers', value: totalServers, color: '#F97316', icon: Server },
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
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            style={{
              width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px',
              border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none',
              backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: '20px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                backgroundColor: filter === f ? '#7C3AED' : '#F1F5F9',
                color: filter === f ? '#fff' : '#64748B',
                transition: 'all 180ms',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
        {filtered.map((c) => {
          const st = statusColors[c.status] || statusColors.inactive;
          return (
            <Link
              key={c.id}
              href="/clients/detail"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  ...card,
                  padding: '20px',
                  transition: 'all 200ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Client Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {c.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </h3>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, backgroundColor: st.bg, color: st.text, textTransform: 'capitalize', flexShrink: 0 }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                      <Globe style={{ width: '11px', height: '11px' }} /> {c.domain}
                    </div>
                  </div>
                  <ArrowUpRight style={{ width: '16px', height: '16px', color: '#CBD5E1', flexShrink: 0 }} />
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '12px 0', borderTop: '1px solid #F1F5F9' }}>
                  {[
                    { label: 'Deploys', value: c.deploys, icon: Activity, color: '#3B82F6' },
                    { label: 'Bugs', value: c.bugs, icon: Bug, color: c.bugs > 0 ? '#EF4444' : '#10B981' },
                    { label: 'Uptime', value: c.uptime, icon: Shield, color: '#10B981' },
                    { label: 'Last', value: c.lastDeploy, icon: Clock, color: '#8B5CF6' },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8', margin: '0 0 2px' }}>{s.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#94A3B8' }}>
                  <span>{c.projects} project{c.projects !== 1 ? 's' : ''} • {c.servers} server{c.servers !== 1 ? 's' : ''}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgb(var(--surface-hover))', fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>{c.environment}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
          <Users style={{ width: '40px', height: '40px', color: '#CBD5E1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', margin: '0 0 4px' }}>No clients found</p>
          <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
