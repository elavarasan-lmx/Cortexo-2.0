'use client';
import { useState } from 'react';
import { GitBranch, Github, Plus, RefreshCw, ExternalLink, MoreHorizontal } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))', overflow: 'hidden',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace",
};

const providers = [
  { name: 'GitHub', icon: '🐙', color: '#24292E', connected: true, desc: 'Connected as cortexo-dev' },
  { name: 'GitLab', icon: '🦊', color: '#FC6D26', connected: false, desc: 'Not connected' },
  { name: 'Bitbucket', icon: '🪣', color: '#0052CC', connected: false, desc: 'Not connected' },
];

const repos = [
  { name: 'winbull/cortexo-web', branch: 'main', provider: 'GitHub', status: 'Active', lastPush: '2 min ago', lastSync: '✓ Auto' },
  { name: 'winbull/mobile-app', branch: 'develop', provider: 'GitHub', status: 'Active', lastPush: '15 min ago', lastSync: '✓ Auto' },
  { name: 'winbull/infra-config', branch: 'main', provider: 'GitHub', status: 'Active', lastPush: '1 hr ago', lastSync: '✓ Auto' },
  { name: 'winbull/cortexo-web', branch: 'main', provider: 'GitHub', status: 'Inactive', lastPush: '1 day ago', lastSync: 'Manual' },
  { name: 'winbull/server-metrics', branch: 'main', provider: 'GitHub', status: 'Active', lastPush: '3 hrs ago', lastSync: '✓ Syncing' },
];

export default function GitConfigPage() {
  useAutoLoadToken();
  const [pat, setPat] = useState('ghp_••••••••••••••••••••');
  const [webhook, setWebhook] = useState('whs_••••••••••••••••••••');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitBranch style={{ width: '24px', height: '24px', color: '#F59E0B' }} /> Git Configuration
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Manage repository connections, webhooks, and deployment branches.
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw style={{ width: '14px', height: '14px' }} /> Sync All Repos
        </button>
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left: Git Provider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={card}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Git Provider</h3>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {providers.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', border: p.connected ? '1.5px solid #10B981' : '1px solid rgb(var(--border))' }}>
                  <span style={{ fontSize: '24px' }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{p.desc}</div>
                  </div>
                  {p.connected ? (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(16,185,129,0.1)' }}>✓ Connected</span>
                  ) : (
                    <button style={{ fontSize: '11px', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer' }}>Connect</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Token fields */}
          <div style={card}>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: '6px', display: 'block' }}>Personal Access Token</label>
                <input type="password" style={inputStyle} value={pat} onChange={e => setPat(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: '6px', display: 'block' }}>Webhook Secret</label>
                <input type="password" style={inputStyle} value={webhook} onChange={e => setWebhook(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Connected Repositories */}
        <div style={card}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(var(--border),0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>
              Connected Repositories ({repos.length})
            </h3>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-primary))', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus style={{ width: '12px', height: '12px' }} /> Add Repo
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                {['Repository', 'Branch', 'Auto Deploy', 'Last Push', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repos.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(var(--border),0.5)', transition: 'background 150ms', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Github style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{r.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>
                      <GitBranch style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{r.branch}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: r.lastSync.includes('✓') ? '#10B981' : 'rgb(var(--text-muted))', fontWeight: 600 }}>{r.lastSync}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{r.lastPush}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                      backgroundColor: r.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                      color: r.status === 'Active' ? '#10B981' : '#6B7280',
                    }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button style={{ padding: '4px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex' }}>
                      <MoreHorizontal style={{ width: '14px', height: '14px' }} />
                    </button>
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
