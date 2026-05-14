'use client';

import { useEffect, useState } from 'react';
import {
  Server as ServerIcon, ArrowLeft, Activity, Cpu, MemoryStick, HardDrive,
  Globe, Clock, Terminal, GitBranch, Shield, Wifi, RefreshCw, Loader2, XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, type Server } from '@/lib/api';


const statusColors: Record<string, { color: string; bg: string }> = {
  online:  { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  offline: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

function MetricBar({ label, used, total, unit, color }: { label: string; used: number; total: number; unit: string; color: string }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div className="cx-mb-16">
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
  const params = useSearchParams();
  const id = params.get('id');
  const [server, setServer] = useState<Server | null>(null);
  const [resources, setResources] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchData = () => {
    if (!id) { setLoading(false); setError('No server ID provided'); return; }
    const serverId = parseInt(id);
    setLoading(true);
    Promise.all([
      api.getServer(serverId).then(r => setServer(r.data as Server)).catch(() => setError('Server not found')),
      api.getServerResourcesLatest().then(r => {
        const res = (r.data || []) as any[];
        setResources(res.find((r: any) => r.serverId === serverId || r.server_id === serverId) || null);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleTestSSH = async () => {
    if (!id) return;
    setTesting(true); setTestResult(null);
    try {
      const res = await api.testServerSSH(parseInt(id));
      setTestResult(res.data?.success ? 'SSH connected successfully' : `Failed: ${res.data?.message || 'Unknown error'}`);
    } catch (err: any) {
      setTestResult(`Failed: ${err?.message || 'Connection failed'}`);
    }
    setTesting(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '10px' }}>
        <Loader2 style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>Loading server...</span>
        <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div>
        <Link href="/servers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Servers
        </Link>
        <div className="cx-card cx-border" style={{ padding: '40px', textAlign: 'center' }}>
          <XCircle style={{ width: '32px', height: '32px', color: '#EF4444', marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', color: '#EF4444', margin: 0 }}>{error || 'Server not found'}</p>
        </div>
      </div>
    );
  }

  const s = server as any;
  const st = statusColors[s.status || 'online'] || statusColors.online;
  const cpuUsage = resources?.cpu_percent || resources?.cpuPercent || 0;
  const memUsed = resources?.mem_used_gb || resources?.memUsedGb || 0;
  const memTotal = resources?.mem_total_gb || resources?.memTotalGb || 0;
  const diskUsed = resources?.disk_used_gb || resources?.diskUsedGb || 0;
  const diskTotal = resources?.disk_total_gb || resources?.diskTotalGb || 0;

  return (
    <div>
      <Link href="/servers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Servers
      </Link>

      {/* Hero */}
      <div className="cx-card cx-border" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(var(--primary),0.03))' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ServerIcon style={{ width: '24px', height: '24px', color: '#F97316' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{s.name || s.label || `Server #${s.id}`}</h1>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color, textTransform: 'capitalize' }}>{s.status || 'online'}</span>
              {s.environment && <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', textTransform: 'uppercase' }}>{s.environment}</span>}
            </div>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
              {s.host || s.ip}:{s.port || 22} • {s.os || s.username || 'Ubuntu'}
            </p>
          </div>
          <div className="cx-flex cx-gap-8">
            <button onClick={handleTestSSH} disabled={testing} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
              {testing ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <Terminal style={{ width: '13px', height: '13px' }} />}
              Test SSH
            </button>
            <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
              <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {testResult && (
        <div className="cx-card cx-border" style={{ padding: '12px 20px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: testResult.includes('successfully') ? '#10B981' : '#EF4444' }}>
          {testResult}
        </div>
      )}

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: Cpu, label: 'CPU', value: resources ? `${Math.round(cpuUsage)}%` : '—', color: '#3B82F6', sub: s.cpu?.model || `${s.cpu?.cores || '—'} cores` },
          { icon: MemoryStick, label: 'Memory', value: resources ? `${Math.round((memUsed / (memTotal || 1)) * 100)}%` : '—', color: '#F59E0B', sub: resources ? `${memUsed.toFixed(1)}/${memTotal.toFixed(1)}GB` : '—' },
          { icon: HardDrive, label: 'Disk', value: resources ? `${Math.round((diskUsed / (diskTotal || 1)) * 100)}%` : '—', color: '#8B5CF6', sub: resources ? `${diskUsed.toFixed(0)}/${diskTotal.toFixed(0)}GB` : '—' },
          { icon: Globe, label: 'Host', value: s.host || s.ip || '—', color: '#10B981', sub: `Port ${s.port || 22}` },
        ].map(m => (
          <div key={m.label} className="cx-card cx-border" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon style={{ width: '16px', height: '16px', color: m.color }} />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 2px' }}>{m.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: m.color, margin: 0, lineHeight: 1 }}>{m.value}</p>
              <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-grid-2">
        {/* Resource Usage */}
        <div className="cx-card cx-border">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Resource Usage</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {resources ? (
              <>
                <MetricBar label="CPU" used={Math.round(cpuUsage)} total={100} unit="%" color="#3B82F6" />
                <MetricBar label="Memory" used={parseFloat(memUsed.toFixed(1))} total={parseFloat(memTotal.toFixed(1))} unit="GB" color="#F59E0B" />
                <MetricBar label="Disk" used={Math.round(diskUsed)} total={Math.round(diskTotal)} unit="GB" color="#8B5CF6" />
              </>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No resource data available — install monitoring agent</p>
            )}
          </div>
        </div>

        {/* Server Info */}
        <div className="cx-card cx-border">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Server Details</h3>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {[
              { label: 'Name', value: s.name || '—' },
              { label: 'Host', value: s.host || s.ip || '—' },
              { label: 'Port', value: String(s.port || 22) },
              { label: 'Username', value: s.username || '—' },
              { label: 'Environment', value: s.environment || '—' },
              { label: 'Created', value: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(var(--border),0.1)' : 'none' }}>
                <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))' }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
