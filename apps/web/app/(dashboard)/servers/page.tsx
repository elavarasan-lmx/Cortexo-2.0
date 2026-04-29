'use client';

import { useState } from 'react';
import {
  Server, Plus, Trash2, Edit3, HardDrive, Cpu, MemoryStick,
  Loader2, RefreshCw, Wifi, WifiOff, Globe, Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';



function MetricBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = pct > 85 ? '#EF4444' : pct > 70 ? '#F59E0B' : color;
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: barColor }}>{pct}%</span>
      </div>
      <div style={{ height: '5px', borderRadius: '3px', backgroundColor: 'rgba(var(--border), 0.8)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: `linear-gradient(90deg, ${barColor}99, ${barColor})`, transition: 'width 600ms ease' }} />
      </div>
      <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{value}{unit} / {max}{unit}</span>
    </div>
  );
}

export default function ServersPage() {
  useAutoLoadToken();
  const { data: servers, loading, error, refetch } = useApiData(() => api.getServers());
  const { data: resources } = useApiData(() => api.getServerResourcesLatest());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', privateIp: '', publicAddress: '', sshKey: '' });

  const addServer = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await api.createServer(form as any);
      setForm({ name: '', privateIp: '', publicAddress: '', sshKey: '' });
      setShowForm(false);
      await refetch();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const deleteServer = async (id: number) => {
    if (!confirm('Delete this server?')) return;
    try {
      await api.deleteServer(id);
      await refetch();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const allServers = (servers as any[]) || [];
  const allResources = (resources as any[]) || [];

  const resourceByIp = allResources.reduce((acc: Record<string, any>, r: any) => {
    acc[r.serverIp] = r;
    return acc;
  }, {});

  const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'JetBrains Mono', monospace" };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' };

  return (
    <div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Servers</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>{allServers.length} servers · resource monitoring & fleet management</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add Server
          </button>
        </div>
      </div>

      {/* Add Server Form */}
      {showForm && (
        <div style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', borderTop: '3px solid rgb(var(--primary))', backgroundColor: 'rgb(var(--surface))', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 16px' }}>Add New Server</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div><label style={labelStyle}>Server Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Production Web 1" style={inputStyle} /></div>
            <div><label style={labelStyle}>Private IP</label><input value={form.privateIp} onChange={e => setForm(f => ({ ...f, privateIp: e.target.value }))} placeholder="e.g. 172.31.0.10" style={inputStyle} /></div>
            <div><label style={labelStyle}>Public Address</label><input value={form.publicAddress} onChange={e => setForm(f => ({ ...f, publicAddress: e.target.value }))} placeholder="e.g. ec2-xx-xx-xx.compute.amazonaws.com" style={inputStyle} /></div>
            <div><label style={labelStyle}>SSH Key Path</label><input value={form.sshKey} onChange={e => setForm(f => ({ ...f, sshKey: e.target.value }))} placeholder="e.g. ~/.ssh/id_rsa" style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
            <button onClick={addServer} disabled={!form.name || saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: !form.name ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', opacity: !form.name ? 0.5 : 1 }}>
              {saving ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Plus style={{ width: 14, height: 14 }} />} {saving ? 'Adding...' : 'Add Server'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '14px' }}>
        {allServers.map((srv: any) => {
          const res = resourceByIp[srv.privateIp];
          const hasMetrics = !!res;
          const cpuPct = hasMetrics ? parseFloat(res.cpuPercent) : 0;
          const accentColor = cpuPct > 80 ? '#EF4444' : cpuPct > 60 ? '#F59E0B' : '#10B981';

          return (
            <div key={srv.id} style={{ borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px -8px ${accentColor}20, 0 4px 12px rgba(0,0,0,0.15)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ height: '3px', backgroundColor: accentColor, position: 'absolute', top: 0, left: 0, right: 0 }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 18px 12px', borderBottom: '1px solid rgb(var(--border))' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`, border: `1px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Server style={{ width: '20px', height: '20px', color: accentColor }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{srv.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{srv.privateIp}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        <Wifi style={{ width: '8px', height: '8px' }} /> online
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button title="Edit" style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}><Edit3 style={{ width: '14px', height: '14px' }} /></button>
                  <button title="Delete" onClick={() => deleteServer(srv.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}
                  ><Trash2 style={{ width: '14px', height: '14px' }} /></button>
                </div>
              </div>

              {hasMetrics ? (
                <div style={{ padding: '14px 18px' }}>
                  <MetricBar label="CPU" value={cpuPct} max={100} unit="%" color="#818CF8" />
                  <MetricBar label="RAM" value={res.ramUsedMb} max={res.ramTotalMb} unit="MB" color="#10B981" />
                  <MetricBar label="Disk" value={parseFloat(res.diskUsedGb)} max={parseFloat(res.diskTotalGb)} unit="GB" color="#F59E0B" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'rgb(var(--text-muted))' }}>
                    <span>Load: {res.loadAvg}</span>
                    <span>Uptime: {Math.round(res.uptimeHours / 24)}d</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px 18px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '12px' }}>
                  No metrics available
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
