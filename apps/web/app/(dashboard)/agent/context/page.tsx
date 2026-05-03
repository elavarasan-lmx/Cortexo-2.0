'use client';

import {
  Target, Layers, Clock, AlertTriangle, CheckCircle,
  Cpu, MemoryStick, HardDrive, Activity, RefreshCcw,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const contextItems = [
  { id: '1', name: 'Production Environment', type: 'environment', status: 'healthy', memory: '2.4 GB', tokens: '12.5K', lastSync: '2m ago', priority: 'high' },
  { id: '2', name: 'WinBull Codebase', type: 'codebase', status: 'healthy', memory: '1.8 GB', tokens: '45.2K', lastSync: '5m ago', priority: 'high' },
  { id: '3', name: 'Bug Pattern DB', type: 'knowledge', status: 'healthy', memory: '890 MB', tokens: '8.1K', lastSync: '1m ago', priority: 'medium' },
  { id: '4', name: 'Deploy History', type: 'historical', status: 'stale', memory: '456 MB', tokens: '3.2K', lastSync: '2h ago', priority: 'low' },
  { id: '5', name: 'MySQL Schema', type: 'schema', status: 'healthy', memory: '234 MB', tokens: '6.7K', lastSync: '15m ago', priority: 'medium' },
  { id: '6', name: 'Client Config Registry', type: 'config', status: 'warning', memory: '156 MB', tokens: '2.1K', lastSync: '45m ago', priority: 'medium' },
];

const statusColors: Record<string, { color: string; label: string }> = {
  healthy: { color: '#10B981', label: 'Healthy' },
  stale:   { color: '#F59E0B', label: 'Stale' },
  warning: { color: '#EF4444', label: 'Warning' },
};

export default function AgentContextPage() {
  useAutoLoadToken();

  const totalMemory = contextItems.reduce((s, c) => s + parseFloat(c.memory), 0);
  const totalTokens = contextItems.reduce((s, c) => s + parseFloat(c.tokens), 0);

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target style={{ width: '22px', height: '22px', color: '#F59E0B' }} />
          Context Monitor
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Monitor agent context windows, memory usage, and data freshness
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Context Sources', value: String(contextItems.length), icon: Layers, color: '#818CF8' },
          { label: 'Total Memory', value: `${totalMemory.toFixed(1)} GB`, icon: MemoryStick, color: '#10B981' },
          { label: 'Token Usage', value: `${totalTokens.toFixed(1)}K`, icon: Cpu, color: '#3B82F6' },
          { label: 'Stale Sources', value: String(contextItems.filter(c => c.status !== 'healthy').length), icon: AlertTriangle, color: '#F59E0B' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${c.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
                <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${c.color}12` }}>
                  <Icon style={{ width: '15px', height: '15px', color: c.color }} />
                </div>
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Context Sources */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {contextItems.map((ctx) => {
          const st = statusColors[ctx.status] || statusColors.healthy;
          return (
            <div key={ctx.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${st.color}`, borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${st.color}12`, flexShrink: 0 }}>
                {ctx.status === 'healthy' ? <CheckCircle style={{ width: '16px', height: '16px', color: st.color }} /> : <AlertTriangle style={{ width: '16px', height: '16px', color: st.color }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{ctx.name}</h3>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: `${st.color}15`, color: st.color }}>{st.label}</span>
                  <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(var(--border), 0.5)', color: 'rgb(var(--text-muted))', textTransform: 'capitalize' }}>{ctx.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <span><strong>{ctx.memory}</strong> memory</span>
                  <span><strong>{ctx.tokens}</strong> tokens</span>
                  <span>Synced {ctx.lastSync}</span>
                  <span style={{ textTransform: 'capitalize' }}>Priority: {ctx.priority}</span>
                </div>
              </div>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', transition: 'all 200ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.08)'; e.currentTarget.style.color = 'rgb(var(--primary))'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}>
                <RefreshCcw style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
