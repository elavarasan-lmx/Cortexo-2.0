'use client';

import {
  Server, ArrowLeft, Activity, Cpu, MemoryStick, HardDrive,
  Globe, Clock, Terminal, GitBranch, Shield, Wifi, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const demoServer = {
  id: 1, name: 'prod-api-01', host: '103.21.58.92', port: '22',
  username: 'ubuntu', environment: 'production', status: 'online',
  os: 'Ubuntu 22.04 LTS', uptime: '45d 12h 30m',
  cpu: { usage: 34, cores: 8, model: 'AMD EPYC 7502' },
  memory: { used: 12.4, total: 32, percentage: 39 },
  disk: { used: 180, total: 500, percentage: 36 },
  network: { in: '2.4 GB/day', out: '8.1 GB/day' },
  lastDeploys: [
    { project: 'WinBull Web', branch: 'main', time: '2h ago', status: 'success' },
    { project: 'Rate Engine', branch: 'hotfix-rate', time: '6h ago', status: 'success' },
    { project: 'WinBull API', branch: 'feature/limit', time: '1d ago', status: 'failed' },
  ],
  services: [
    { name: 'nginx', status: 'running', pid: 1234 },
    { name: 'pm2 (node)', status: 'running', pid: 2345 },
    { name: 'mysql', status: 'running', pid: 3456 },
    { name: 'redis', status: 'running', pid: 4567 },
    { name: 'cron', status: 'running', pid: 5678 },
  ],
};

const statusColors: Record<string, { color: string; bg: string }> = {
  online:  { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  offline: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

function MetricBar({ label, used, total, unit, color }: { label: string; used: number; total: number; unit: string; color: string }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{label}</span>
        <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{used} / {total} {unit} ({pct}%)</span>
      </div>
      <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.3)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', backgroundColor: color, transition: 'width 600ms ease' }} />
      </div>
    </div>
  );
}

export default function ServerDetailPage() {
  const s = demoServer;
  const st = statusColors[s.status] || statusColors.online;

  return (
    <div>
      <Link href="/servers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Servers
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server style={{ width: '24px', height: '24px', color: '#F97316' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{s.name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color, textTransform: 'capitalize' }}>{s.status}</span>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', textTransform: 'uppercase' }}>{s.environment}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{s.host}:{s.port} • {s.os}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>Uptime</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#10B981', margin: 0 }}>{s.uptime}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: Cpu, label: 'CPU', value: `${s.cpu.usage}%`, color: '#3B82F6', sub: `${s.cpu.cores} cores` },
          { icon: MemoryStick, label: 'Memory', value: `${s.memory.percentage}%`, color: '#F59E0B', sub: `${s.memory.used}/${s.memory.total}GB` },
          { icon: HardDrive, label: 'Disk', value: `${s.disk.percentage}%`, color: '#8B5CF6', sub: `${s.disk.used}/${s.disk.total}GB` },
          { icon: Wifi, label: 'Network', value: s.network.out, color: '#10B981', sub: `In: ${s.network.in}` },
        ].map(m => (
          <div key={m.label} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon style={{ width: '16px', height: '16px', color: m.color }} />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>{m.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: m.color, margin: 0, lineHeight: 1 }}>{m.value}</p>
              <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Resource Usage */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Resource Usage</h3>
          </div>
          <div style={{ padding: '20px' }}>
            <MetricBar label="CPU" used={s.cpu.usage} total={100} unit="%" color="#3B82F6" />
            <MetricBar label="Memory" used={s.memory.used} total={s.memory.total} unit="GB" color="#F59E0B" />
            <MetricBar label="Disk" used={s.disk.used} total={s.disk.total} unit="GB" color="#8B5CF6" />
          </div>
        </div>

        {/* Running Services */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Services</h3>
            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
              <RefreshCw style={{ width: '10px', height: '10px' }} /> Refresh
            </button>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {s.services.map((svc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < s.services.length - 1 ? '1px solid rgba(var(--border),0.1)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{svc.name}</span>
                </div>
                <code style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>PID {svc.pid}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deploys */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Recent Deployments</h3>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {s.lastDeploys.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < s.lastDeploys.length - 1 ? '1px solid rgba(var(--border),0.1)' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.status === 'success' ? '#10B981' : '#EF4444' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', flex: 1 }}>{d.project}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                  <GitBranch style={{ width: '11px', height: '11px' }} /> {d.branch}
                </span>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{d.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
