'use client';

import {
  HardDrive, ArrowLeft, FolderTree, RefreshCw, Activity,
  Clock, CheckCircle, XCircle, Server, FolderOpen,
  Upload, Download, Wifi,
} from 'lucide-react';
import Link from 'next/link';

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

const demoMount = {
  id: 1, name: 'Production Assets', status: 'connected',
  server: 'prod-api-01', host: '103.21.58.92',
  remotePath: '/var/www/html/assets', localPath: '/mnt/sshfs/prod-assets',
  username: 'ubuntu', port: 22,
  stats: { filesSync: 12453, totalSize: '4.2 GB', lastSync: '5 min ago', latency: '12ms' },
  recentFiles: [
    { name: 'uploads/logo-new.png', size: '245 KB', modified: '10 min ago', action: 'uploaded' },
    { name: 'css/main.min.css', size: '18 KB', modified: '1h ago', action: 'modified' },
    { name: 'js/app.bundle.js', size: '1.2 MB', modified: '2h ago', action: 'modified' },
    { name: 'images/hero-bg.webp', size: '380 KB', modified: '3h ago', action: 'uploaded' },
    { name: 'config/.env.production', size: '2 KB', modified: '1d ago', action: 'modified' },
  ],
  syncHistory: [
    { time: '2025-05-02 14:30', files: 3, direction: 'push', status: 'success' },
    { time: '2025-05-02 12:00', files: 12, direction: 'pull', status: 'success' },
    { time: '2025-05-02 03:00', files: 145, direction: 'push', status: 'success' },
    { time: '2025-05-01 22:00', files: 2, direction: 'push', status: 'failed' },
    { time: '2025-05-01 18:00', files: 8, direction: 'pull', status: 'success' },
  ],
};

export default function SSHFSDetailPage() {
  const m = demoMount;

  return (
    <div>
      <Link href="/servers/mounts" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to SSHFS Mounts
      </Link>

      {/* Hero */}
      <div style={{ ...card, marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive style={{ width: '24px', height: '24px', color: '#10B981' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{m.name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', textTransform: 'capitalize' }}>{m.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Server style={{ width: '11px', height: '11px' }} />{m.server} ({m.host})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wifi style={{ width: '11px', height: '11px' }} />Latency: {m.stats.latency}</span>
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} /> Re-mount
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Files Synced', value: m.stats.filesSync.toLocaleString(), color: '#818CF8', icon: FolderTree },
          { label: 'Total Size', value: m.stats.totalSize, color: '#3B82F6', icon: HardDrive },
          { label: 'Last Sync', value: m.stats.lastSync, color: '#10B981', icon: Clock },
          { label: 'Latency', value: m.stats.latency, color: '#F59E0B', icon: Activity },
        ].map(s => (
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
        {/* Mount Config */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Mount Configuration</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {[
              { label: 'Remote Path', value: m.remotePath },
              { label: 'Local Path', value: m.localPath },
              { label: 'Username', value: m.username },
              { label: 'Port', value: m.port.toString() },
              { label: 'Server', value: `${m.server} (${m.host})` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(var(--border),0.08)' : 'none' }}>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Recent Files</h3>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {m.recentFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < m.recentFiles.length - 1 ? '1px solid rgba(var(--border),0.08)' : 'none' }}>
                <FolderOpen style={{ width: '12px', height: '12px', color: '#F59E0B', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>{f.name}</p>
                  <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: '1px 0 0' }}>{f.size} • {f.modified}</p>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase',
                  backgroundColor: f.action === 'uploaded' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                  color: f.action === 'uploaded' ? '#3B82F6' : '#F59E0B',
                }}>{f.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sync History */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Sync History</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(var(--border),0.15)' }}>
                {['Time', 'Files', 'Direction', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.syncHistory.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(var(--border),0.06)' }}>
                  <td style={{ padding: '10px 20px', fontSize: '12px', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{s.time}</td>
                  <td style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{s.files}</td>
                  <td style={{ padding: '10px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: s.direction === 'push' ? '#3B82F6' : '#8B5CF6' }}>
                      {s.direction === 'push' ? <Upload style={{ width: '11px', height: '11px' }} /> : <Download style={{ width: '11px', height: '11px' }} />}
                      {s.direction}
                    </span>
                  </td>
                  <td style={{ padding: '10px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: s.status === 'success' ? '#10B981' : '#EF4444' }}>
                      {s.status === 'success' ? <CheckCircle style={{ width: '11px', height: '11px' }} /> : <XCircle style={{ width: '11px', height: '11px' }} />}
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
