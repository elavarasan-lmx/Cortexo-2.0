'use client';

import {
  Brain, Database, Clock, Trash2, Search, Filter,
  FileText, Tag, ChevronRight, Sparkles, Plus,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

// Demo data — Agent Memory is Phase 5 (not yet API-backed)
const demoMemories = [
  { id: '1', key: 'deploy_pattern_winbull', type: 'pattern', summary: 'WinBull deploy requires post-deploy cache clear + PM2 restart', confidence: 95, accessCount: 47, lastAccessed: '2026-05-02T04:00:00Z', createdAt: '2026-04-20T10:00:00Z' },
  { id: '2', key: 'error_rca_booking_api', type: 'root_cause', summary: 'Booking API 500 errors caused by MySQL connection pool exhaustion under concurrent load', confidence: 88, accessCount: 12, lastAccessed: '2026-05-01T18:00:00Z', createdAt: '2026-04-28T14:00:00Z' },
  { id: '3', key: 'drift_fix_nginx_conf', type: 'fix', summary: 'Nginx config drift on production — SSL cert path mismatch fix applied 3 times', confidence: 92, accessCount: 8, lastAccessed: '2026-05-01T12:00:00Z', createdAt: '2026-04-25T09:00:00Z' },
  { id: '4', key: 'test_flaky_payment', type: 'observation', summary: 'Payment module tests flaky when Razorpay sandbox is slow (>3s timeout)', confidence: 75, accessCount: 5, lastAccessed: '2026-04-30T16:00:00Z', createdAt: '2026-04-27T11:00:00Z' },
  { id: '5', key: 'client_config_template', type: 'pattern', summary: 'Client provisioning best practice: always clone from golden config, never from scratch', confidence: 98, accessCount: 31, lastAccessed: '2026-05-02T02:00:00Z', createdAt: '2026-04-15T08:00:00Z' },
];

const typeColors: Record<string, { color: string; label: string }> = {
  pattern:    { color: '#818CF8', label: 'Pattern' },
  root_cause: { color: '#EF4444', label: 'Root Cause' },
  fix:        { color: '#10B981', label: 'Fix' },
  observation:{ color: '#F59E0B', label: 'Observation' },
};

export default function AgentMemoryPage() {
  useAutoLoadToken();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = demoMemories.filter((m) => {
    const matchSearch = !searchQuery || m.summary.toLowerCase().includes(searchQuery.toLowerCase()) || m.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'all' || m.type === activeFilter;
    return matchSearch && matchFilter;
  });

  const statCards = [
    { label: 'Total Memories', value: String(demoMemories.length), icon: Brain, color: '#818CF8' },
    { label: 'Patterns', value: String(demoMemories.filter(m => m.type === 'pattern').length), icon: Sparkles, color: '#A78BFA' },
    { label: 'Avg Confidence', value: `${Math.round(demoMemories.reduce((s, m) => s + m.confidence, 0) / demoMemories.length)}%`, icon: Database, color: '#10B981' },
    { label: 'Total Recalls', value: String(demoMemories.reduce((s, m) => s + m.accessCount, 0)), icon: Clock, color: '#3B82F6' },
  ];

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain style={{ width: '22px', height: '22px', color: '#A78BFA' }} />
            Agent Memory
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Persistent knowledge base the AI agent has learned from your platform
          </p>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>Phase 5 Preview</span>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${card.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', flex: '1 1 220px', maxWidth: '320px' }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input type="text" placeholder="Search memories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'rgb(var(--text-primary))', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          {['all', 'pattern', 'root_cause', 'fix', 'observation'].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid', borderColor: activeFilter === f ? 'rgb(var(--primary))' : 'rgb(var(--border))', backgroundColor: activeFilter === f ? 'rgba(var(--primary), 0.08)' : 'transparent', color: activeFilter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', cursor: 'pointer', transition: 'all 200ms', textTransform: 'capitalize' }}>
              {f === 'root_cause' ? 'Root Cause' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Memory List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((mem) => {
          const tc = typeColors[mem.type] || typeColors.observation;
          return (
            <div key={mem.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${tc.color}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${tc.color}12`, flexShrink: 0, marginTop: '2px' }}>
                <Brain style={{ width: '16px', height: '16px', color: tc.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <code style={{ fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--primary))' }}>{mem.key}</code>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${tc.color}15`, color: tc.color }}>{tc.label}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: '6px 0 0', lineHeight: 1.5 }}>{mem.summary}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <span>Confidence: <strong style={{ color: mem.confidence >= 80 ? '#10B981' : '#F59E0B' }}>{mem.confidence}%</strong></span>
                  <span>•</span>
                  <span>Recalled {mem.accessCount}×</span>
                </div>
              </div>
              <ChevronRight style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0, marginTop: '4px' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
