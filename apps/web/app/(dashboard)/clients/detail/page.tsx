'use client';

import {
  Users, ArrowLeft, Globe, Mail, Calendar, Activity,
  GitBranch, Server, Bug, Shield, Clock, Building,
} from 'lucide-react';
import Link from 'next/link';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const demoClient = {
  id: 1, name: 'VijayBullion', email: 'admin@vijaybullion.com',
  domain: 'vijaybullion.com', environment: 'production',
  status: 'active', joinedAt: '2025-01-10',
  projects: ['WinBull Web', 'WinBull Android', 'Rate Engine'],
  servers: ['prod-api-01', 'prod-db-01', 'cdn-edge-sg'],
  stats: { totalDeploys: 342, activeBugs: 7, uptime: '99.97%', lastDeploy: '2h ago' },
  recentActivity: [
    { action: 'Deployment triggered', project: 'WinBull Web', time: '2h ago', type: 'deploy' },
    { action: 'Bug resolved', project: 'Rate Engine', time: '5h ago', type: 'bug' },
    { action: 'SSL renewed', project: 'vijaybullion.com', time: '2d ago', type: 'security' },
    { action: 'Server scaled up', project: 'prod-api-01', time: '3d ago', type: 'server' },
  ],
};

export default function ClientDetailPage() {
  const c = demoClient;

  const statCards = [
    { label: 'Total Deploys', value: c.stats.totalDeploys, color: '#818CF8', icon: Activity },
    { label: 'Active Bugs', value: c.stats.activeBugs, color: '#EF4444', icon: Bug },
    { label: 'Uptime', value: c.stats.uptime, color: '#10B981', icon: Shield },
    { label: 'Last Deploy', value: c.stats.lastDeploy, color: '#3B82F6', icon: Clock },
  ];

  const typeIcons: Record<string, any> = {
    deploy: { icon: GitBranch, color: '#3B82F6' },
    bug: { icon: Bug, color: '#EF4444' },
    security: { icon: Shield, color: '#10B981' },
    server: { icon: Server, color: '#F97316' },
  };

  return (
    <div>
      <Link href="/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Clients
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff' }}>
            {c.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{c.name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', textTransform: 'capitalize' }}>{c.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail style={{ width: '12px', height: '12px' }} />{c.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe style={{ width: '12px', height: '12px' }} />{c.domain}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: '12px', height: '12px' }} />Since {new Date(c.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>{s.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Projects */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Projects ({c.projects.length})</h3>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {c.projects.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < c.projects.length - 1 ? '1px solid rgba(var(--border),0.1)' : 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(var(--primary),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building style={{ width: '14px', height: '14px', color: 'rgb(var(--primary))' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Servers */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Servers ({c.servers.length})</h3>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {c.servers.map((srv, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < c.servers.length - 1 ? '1px solid rgba(var(--border),0.1)' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{srv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Recent Activity</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {c.recentActivity.map((a, i) => {
              const t = typeIcons[a.type] || typeIcons.deploy;
              const TIcon = t.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < c.recentActivity.length - 1 ? '14px' : 0, position: 'relative' }}>
                  {i < c.recentActivity.length - 1 && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-6px', width: '1px', backgroundColor: 'rgb(var(--border))' }} />}
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: `${t.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <TIcon style={{ width: '10px', height: '10px', color: t.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', margin: '0 0 2px', fontWeight: 500 }}>{a.action}</p>
                    <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>{a.project} • {a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
