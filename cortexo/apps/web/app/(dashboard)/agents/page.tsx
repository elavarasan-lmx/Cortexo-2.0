'use client';
import { Bot, Plus, Activity, Zap, Shield, Brain, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';

const typeEmoji: Record<string, string> = {
  deployment: '🤖', error_detection: '🐛', security: '🛡️', monitoring: '📊',
  compliance: '🔍', infrastructure: '⚡', performance: '🚀', custom: '🧠',
};
const statusColors: Record<string, string> = { active: '#10B981', idle: '#F59E0B', paused: '#6B7280', error: '#EF4444' };

export default function AgentsPage() {
  useAutoLoadToken();

  const { data: agents, loading, error } = useApiData(
    () => api.getAgents(),
    { default: [] as any[] }
  );

  const { data: stats } = useApiData(
    () => api.getAgentStats(),
    { default: { totalAgents: 0, activeNow: 0, totalRuns: 0, avgAccuracy: '0' } }
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading agents...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const list = agents || [];
  const s = stats || { totalAgents: list.length, activeNow: list.filter((a: any) => a.status === 'active').length, totalRuns: list.reduce((t: number, a: any) => t + (a.totalRuns || 0), 0), avgAccuracy: '0' };

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot style={{ width: '22px', height: '22px', color: '#A78BFA' }} /> AI Agents
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Autonomous intelligence agents powering your DevOps</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #A78BFA, #818CF8)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New Agent
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Agents', value: String(s.totalAgents), color: '#A78BFA' },
          { label: 'Active Now', value: String(s.activeNow), color: '#10B981' },
          { label: 'Total Runs', value: s.totalRuns.toLocaleString(), color: '#3B82F6' },
          { label: 'Avg Accuracy', value: `${s.avgAccuracy}%`, color: '#F59E0B' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px' }}>
          <Bot style={{ width: '40px', height: '40px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-secondary))', margin: '0 0 4px' }}>No agents yet</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Create your first AI agent to automate DevOps tasks</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
          {list.map((agent: any) => {
            const sc = statusColors[agent.status] || '#6B7280';
            const emoji = typeEmoji[agent.type] || '🧠';
            const accuracy = agent.accuracy ? (agent.accuracy / 10).toFixed(1) : '—';
            const lastActive = agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleString() : 'Never';
            return (
              <Link href={`/agents/${agent.id}`} key={agent.id} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '22px', transition: 'all 200ms', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px -4px ${sc}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: sc }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: `${sc}12`, fontSize: '22px' }}>{agent.avatar || emoji}</div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{agent.name}</h3>
                      <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0', textTransform: 'capitalize' }}>{(agent.type || 'custom').replace(/_/g, ' ')}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: sc, textTransform: 'capitalize', padding: '3px 8px', borderRadius: '6px', backgroundColor: `${sc}12` }}>{agent.status}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[{ l: 'Runs', v: String(agent.totalRuns || 0) }, { l: 'Accuracy', v: `${accuracy}%` }, { l: 'Last Active', v: agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleDateString() : 'Never' }].map(m => (
                      <div key={m.l} style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(var(--border), 0.15)' }}>
                        <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: 0 }}>{m.l}</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '2px 0 0' }}>{m.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
