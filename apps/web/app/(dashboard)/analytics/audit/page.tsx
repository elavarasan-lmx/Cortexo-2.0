'use client';

import { useState } from 'react';
import {
  History, Shield, User, FileText, Settings, Rocket, Bug,
  GitBranch, Filter, Clock, Search, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

const actionIcons: Record<string, { icon: typeof Rocket; color: string }> = {
  deploy:    { icon: Rocket,    color: '#818CF8' },
  create:    { icon: FileText,  color: '#10B981' },
  update:    { icon: Settings,  color: '#3B82F6' },
  delete:    { icon: Bug,       color: '#EF4444' },
  login:     { icon: User,      color: '#A78BFA' },
  sync:      { icon: GitBranch, color: '#06B6D4' },
  rollback:  { icon: History,   color: '#F59E0B' },
};

export default function AuditLogPage() {
  useAutoLoadToken();
  const { data: logs, loading } = useApiData(() => api.getAuditLogs());
  const { data: stats } = useApiData(() => api.getAuditStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const items = logs || [];
  const filtered = items.filter((log: any) => {
    const matchSearch = !searchQuery ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.resource || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'all' || log.action?.toLowerCase().includes(activeFilter);
    return matchSearch && matchFilter;
  });

  const actionCounts = items.reduce((acc: Record<string, number>, log: any) => {
    const action = (log.action || 'other').split('.')[0].toLowerCase();
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statCards = [
    { label: 'Total Events', value: String(items.length), icon: History, color: '#818CF8' },
    { label: 'Today', value: String(stats?.today || items.filter((l: any) => {
      const d = new Date(l.createdAt);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length), icon: Clock, color: '#10B981' },
    { label: 'Users Active', value: String(stats?.activeUsers || new Set(items.map((l: any) => l.userId)).size), icon: User, color: '#3B82F6' },
    { label: 'Security Events', value: String(stats?.security || items.filter((l: any) => (l.action || '').includes('auth') || (l.action || '').includes('login')).length), icon: Shield, color: '#F59E0B' },
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'deploy', label: 'Deploy' },
    { key: 'create', label: 'Create' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' },
    { key: 'auth', label: 'Auth' },
  ];

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
            Activity Log
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Complete audit trail of all platform actions
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: 'rgb(var(--surface))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '14px',
                padding: '18px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 200ms, transform 200ms',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 24px -4px ${card.color}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: card.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{card.label}</p>
                <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${card.color}12` }}>
                  <Icon style={{ width: '15px', height: '15px', color: card.color }} />
                </div>
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: card.color, margin: '10px 0 0', lineHeight: 1 }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: '10px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          flex: '1 1 220px', maxWidth: '320px',
        }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '13px', color: 'rgb(var(--text-primary))', width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500,
                border: '1px solid',
                borderColor: activeFilter === f.key ? 'rgb(var(--primary))' : 'rgb(var(--border))',
                backgroundColor: activeFilter === f.key ? 'rgba(var(--primary), 0.08)' : 'transparent',
                color: activeFilter === f.key ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                cursor: 'pointer', transition: 'all 200ms',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'rgb(var(--text-muted))' }}>
            <History style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading audit trail...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 20px', textAlign: 'center',
          }}>
            <Shield style={{ width: '36px', height: '36px', color: 'rgb(var(--text-muted))', opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-secondary))', margin: 0 }}>No audit events found</p>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>Actions across the platform will appear here</p>
          </div>
        )}

        {filtered.map((log: any, idx: number) => {
          const actionKey = (log.action || 'update').split('.')[0].toLowerCase();
          const ai = actionIcons[actionKey] || actionIcons.update;
          const Icon = ai.icon;
          return (
            <div
              key={log.id || idx}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px',
                borderBottom: idx < filtered.length - 1 ? '1px solid rgba(var(--border), 0.5)' : 'none',
                transition: 'background-color 200ms',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '10px', backgroundColor: `${ai.color}12`, flexShrink: 0,
              }}>
                <Icon style={{ width: '15px', height: '15px', color: ai.color }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.description || `${log.action} on ${log.resource}`}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '3px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <User style={{ width: '10px', height: '10px' }} />{log.userId?.substring(0, 8) || 'system'}
                  </span>
                  <span>•</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: ai.color }}>{log.action}</span>
                  {log.resourceId && (
                    <>
                      <span>•</span>
                      <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>{log.resource}#{log.resourceId.substring(0, 8)}</code>
                    </>
                  )}
                </div>
              </div>

              <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(log.createdAt)}</span>
              <ChevronRight style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', opacity: 0.4, flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
