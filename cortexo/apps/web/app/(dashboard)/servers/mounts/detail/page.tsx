'use client';

import { useSearchParams } from 'next/navigation';
import {
  HardDrive, ArrowLeft, RefreshCw, Activity, CheckCircle, 
  Folder, Code, Power, Edit2, ArrowRight, XCircle, Zap,
  Loader2, Play, Circle
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))', overflow: 'hidden',
};

export default function SSHFSDetailPage() {
  useAutoLoadToken();
  const params = useSearchParams();
  const mountId = params.get('id') || '';

  const { data: mounts, loading, error, refetch } = useApiData(
    () => api.getServerMounts(),
    { default: [] as any[] }
  );

  const m = mountId
    ? (mounts || []).find((mt: any) => String(mt.id) === mountId)
    : (mounts || [])[0];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '12px' }}>Loading mount details...</p>
    </div>
  );

  const name = m?.name || m?.label || 'Production Storage Mount';
  const username = m?.username || 'sshfs_user';
  const serverIp = m?.host || m?.server?.ip || '192.168.1.10';
  const remotePath = m?.remotePath || '/mnt/data/production';
  const localPath = m?.localPath || m?.mountPoint || '/mnt/sshfs/production';
  const port = m?.port || 22;

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
    borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-primary))'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Breadcrumb */}
      <div>
        <Link href="/servers/mounts" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> SSHFS Mounts
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive style={{ width: '24px', height: '24px', color: '#7C3AED' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{name}</h1>
            <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              {username}@{serverIp}:{remotePath}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ ...btnStyle, color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
            <Circle fill="#EF4444" strokeWidth={0} style={{ width: '8px', height: '8px' }} /> Unmount
          </button>
          <button style={btnStyle}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Remount
          </button>
          <button style={{ ...btnStyle, backgroundColor: '#7C3AED', color: '#fff', border: 'none' }}>
            <Code style={{ width: '14px', height: '14px' }} /> Open in VSCode
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive style={{ width: '20px', height: '20px', color: '#7C3AED' }} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>1.2 TB</div>
            <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Disk Usage (of 2.4 TB)</div>
          </div>
        </div>

        <div style={{ ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity style={{ width: '20px', height: '20px', color: '#10B981' }} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>45 MB/s</div>
            <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Current Bandwidth</div>
          </div>
        </div>

        <div style={{ ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>12ms</div>
            <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Ping Latency</div>
          </div>
        </div>

        <div style={{ ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>Mounted</div>
            <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Since 4 days ago</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgb(var(--border))', paddingBottom: '16px' }}>
        <button style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#7C3AED', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Overview</button>
        <button style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>File Browser</button>
        <button style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Sync Logs</button>
        <button style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Settings</button>
      </div>

      {/* Main Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Col: Mount Config */}
        <div style={card}>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Mount Configuration</h3>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', cursor: 'pointer' }}>
              <Edit2 style={{ width: '12px', height: '12px' }} /> Edit
            </button>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {[
              { label: 'Server IP', value: serverIp },
              { label: 'Port', value: String(port) },
              { label: 'Username', value: username },
              { label: 'Remote Path', value: remotePath },
              { label: 'Local Path', value: localPath },
              { label: 'Auto Mount', value: <span style={{ color: '#10B981', fontWeight: 600 }}>Enabled (fstab)</span> },
              { label: 'Mount Options', value: 'allow_other, reconnect' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 6 ? '1px solid rgba(var(--border),0.2)' : 'none' }}>
                <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Activity & Browser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recent Activity */}
          <div style={card}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Recent Activity</h3>
              <button style={{ color: '#7C3AED', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(var(--border),0.2)' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ marginTop: '4px' }}><Circle fill="#10B981" strokeWidth={0} style={{ width: '8px', height: '8px' }} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', marginBottom: '2px' }}>Sync Completed</div>
                    <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>15 mins ago · 2.4 GB synced</div>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>Pull</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(var(--border),0.2)' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ marginTop: '4px' }}><Circle fill="#10B981" strokeWidth={0} style={{ width: '8px', height: '8px' }} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', marginBottom: '2px' }}>Mount Established</div>
                    <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>3 days ago</div>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' }}>Auto</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ marginTop: '4px' }}><Circle fill="#EF4444" strokeWidth={0} style={{ width: '8px', height: '8px' }} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#EF4444', marginBottom: '2px' }}>Connection Lost</div>
                    <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>4 days ago · Reconnecting...</div>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>Err</span>
              </div>
            </div>
          </div>

          {/* File Browser Preview */}
          <div style={card}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>File Browser</h3>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10B981' }}/> /mnt/preview
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.3)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Folder style={{ width: '18px', height: '18px', color: '#10B981' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: '2px' }}>/mnt/sshfs/production/images</div>
                    <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Folder · 14 items · 1.2 GB</div>
                  </div>
                </div>
                <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.3)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Folder style={{ width: '18px', height: '18px', color: '#10B981' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: '2px' }}>/mnt/sshfs/production/videos</div>
                    <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Folder · 2 items · 14.5 GB</div>
                  </div>
                </div>
                <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
