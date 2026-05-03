'use client';
import { Bot, Plus, Activity, Zap, Shield, Brain, Eye, Wrench } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const demoAgents = [
  { id: '1', name: 'DeployBot', type: 'Deployment', status: 'active', runs: 1247, accuracy: '99.2%', lastActive: '2m ago', avatar: '🤖' },
  { id: '2', name: 'BugHunter', type: 'Error Detection', status: 'active', runs: 892, accuracy: '96.8%', lastActive: '5m ago', avatar: '🐛' },
  { id: '3', name: 'SecurityGuard', type: 'Security', status: 'active', runs: 456, accuracy: '98.5%', lastActive: '1h ago', avatar: '🛡️' },
  { id: '4', name: 'LogAnalyzer', type: 'Monitoring', status: 'idle', runs: 2103, accuracy: '94.1%', lastActive: '3h ago', avatar: '📊' },
  { id: '5', name: 'DriftDetector', type: 'Compliance', status: 'active', runs: 312, accuracy: '97.3%', lastActive: '15m ago', avatar: '🔍' },
  { id: '6', name: 'AutoScaler', type: 'Infrastructure', status: 'paused', runs: 78, accuracy: '91.0%', lastActive: '2d ago', avatar: '⚡' },
];

const statusColors: Record<string, string> = { active: '#10B981', idle: '#F59E0B', paused: '#6B7280' };

export default function AgentsPage() {
  useAutoLoadToken();
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Agents', value: String(demoAgents.length), color: '#A78BFA' },
          { label: 'Active Now', value: String(demoAgents.filter(a => a.status === 'active').length), color: '#10B981' },
          { label: 'Total Runs', value: '5,088', color: '#3B82F6' },
          { label: 'Avg Accuracy', value: '96.2%', color: '#F59E0B' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
        {demoAgents.map(agent => {
          const sc = statusColors[agent.status] || '#6B7280';
          return (
            <div key={agent.id} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '22px', transition: 'all 200ms', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px -4px ${sc}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: sc }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: `${sc}12`, fontSize: '22px' }}>{agent.avatar}</div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{agent.name}</h3>
                  <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{agent.type}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: sc, textTransform: 'capitalize', padding: '3px 8px', borderRadius: '6px', backgroundColor: `${sc}12` }}>{agent.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[{ l: 'Runs', v: String(agent.runs) }, { l: 'Accuracy', v: agent.accuracy }, { l: 'Last Active', v: agent.lastActive }].map(m => (
                  <div key={m.l} style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(var(--border), 0.15)' }}>
                    <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: 0 }}>{m.l}</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '2px 0 0' }}>{m.v}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
