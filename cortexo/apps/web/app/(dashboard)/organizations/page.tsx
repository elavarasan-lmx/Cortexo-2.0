'use client';
import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Building2, Globe, Server, Users, Plus, Search, ChevronRight,
  Clock, CheckCircle, AlertTriangle, Settings, FileText,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  domain: string;
  servers: number;
  env: string;
  status: string;
  lastDeploy: string;
}

export default function OrganizationsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const filtered = search ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase())) : clients;

  const activeCount = clients.filter(c => c.status === 'active').length;
  const totalServers = clients.reduce((s, c) => s + c.servers, 0);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Organizations' }]} />
      <div className="cx-page-header cx-mb-24">
        <div>
          <h1 className="cx-flex cx-items-center cx-gap-10 cx-page-title">
            <Building2 style={{ width: '24px', height: '24px' }} className="cx-text-accent" />
            Organizations
          </h1>
          <p className="cx-page-subtitle">{clients.length} client{clients.length !== 1 ? 's' : ''} · {totalServers} server{totalServers !== 1 ? 's' : ''} · White-label bullion platforms</p>
        </div>
        <button className="cx-btn-primary" style={{ backgroundColor: '#10B981' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="cx-card-sm cx-border" style={{ padding: '16px 20px' }}>
          <div className="cx-label" style={{ marginBottom: '6px' }}>Total Clients</div>
          <div className="cx-fw-800 cx-text-28 cx-text-accent">{clients.length}</div>
        </div>
        <div className="cx-card-sm cx-border" style={{ padding: '16px 20px' }}>
          <div className="cx-label" style={{ marginBottom: '6px' }}>Active</div>
          <div className="cx-fw-800 cx-text-28" style={{ color: '#10B981' }}>{activeCount}</div>
        </div>
        <div className="cx-card-sm cx-border" style={{ padding: '16px 20px' }}>
          <div className="cx-label" style={{ marginBottom: '6px' }}>Total Servers</div>
          <div className="cx-fw-800 cx-text-28" style={{ color: '#06B6D4' }}>{totalServers}</div>
        </div>
        <div className="cx-card-sm cx-border" style={{ padding: '16px 20px' }}>
          <div className="cx-label" style={{ marginBottom: '6px' }}>In Setup</div>
          <div className="cx-fw-800 cx-text-28" style={{ color: '#F59E0B' }}>{clients.filter(c => c.status === 'setup').length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="cx-search-wrap" style={{ marginBottom: '16px', maxWidth: '400px' }}>
        <Search className="cx-search-icon" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..." className="cx-search-input" style={{ boxSizing: 'border-box' }}
        />
      </div>

      {/* Client Cards */}
      {filtered.length === 0 ? (
        <div className="cx-card cx-border cx-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Building2 style={{ width: '48px', height: '48px', opacity: 0.3, margin: '0 auto 16px' }} className="cx-text-muted" />
          <p className="cx-fw-600 cx-text-muted" style={{ fontSize: '15px' }}>
            {search ? 'No clients match your search' : 'No organizations yet'}
          </p>
          <p className="cx-text-muted" style={{ fontSize: '13px' }}>
            {search ? 'Try a different search term' : 'Add your first client to get started'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
          {filtered.map(c => {
            const isActive = c.status === 'active';
            return (
              <div key={c.id} className="cx-card cx-border" style={{ display: 'flex', flexDirection: 'column', padding: '20px', transition: 'border-color 200ms', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; }}
              >
                <div className="cx-flex-between" style={{ marginBottom: '12px' }}>
                  <div className="cx-flex cx-items-center cx-gap-10">
                    <div className="cx-flex-center cx-r-10" style={{ width: '40px', height: '40px', background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
                      <Building2 style={{ width: '20px', height: '20px', color: isActive ? '#10B981' : '#F59E0B' }} />
                    </div>
                    <div>
                      <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>{c.name}</h3>
                      <div className="cx-flex cx-items-center cx-gap-6 cx-text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                        <Globe style={{ width: '11px', height: '11px' }} /> {c.domain}
                      </div>
                    </div>
                  </div>
                  <span className="cx-fw-700" style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
                    backgroundColor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: isActive ? '#10B981' : '#F59E0B', textTransform: 'uppercase' as const,
                  }}>{c.status}</span>
                </div>

                <div className="cx-flex cx-gap-16" style={{ marginBottom: '14px' }}>
                  <div className="cx-flex cx-items-center cx-gap-6 cx-text-muted" style={{ fontSize: '12px' }}>
                    <Server style={{ width: '12px', height: '12px' }} /> {c.servers} server{c.servers !== 1 ? 's' : ''}
                  </div>
                  <div className="cx-flex cx-items-center cx-gap-6 cx-text-muted" style={{ fontSize: '12px' }}>
                    <Clock style={{ width: '12px', height: '12px' }} /> Deploy {c.lastDeploy}
                  </div>
                  <span className="cx-fw-600" style={{
                    fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                    backgroundColor: c.env === 'production' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: c.env === 'production' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase' as const,
                  }}>{c.env}</span>
                </div>

                <div className="cx-flex cx-gap-8" style={{ marginTop: 'auto' }}>
                  <button className="cx-btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}>
                    <Settings style={{ width: '13px', height: '13px' }} /> Manage
                  </button>
                  <button className="cx-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', backgroundColor: '#7C3AED' }}>
                    Deploy <ChevronRight style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
