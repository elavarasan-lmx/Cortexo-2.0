'use client';

import { useState } from 'react';
import {
  Server, Plus, Trash2, Edit3, HardDrive, Cpu, MemoryStick,
  Loader2, RefreshCw, Wifi, WifiOff, Globe, Shield, FolderSync, Plug,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';



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
  const { data: resources, refetch: refetchResources } = useApiData(() => api.getServerResourcesLatest());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', privateIp: '', publicAddress: '', sshKey: '' });
  const [testingIds, setTestingIds] = useState<Set<number>>(new Set());
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; latencyMs: number; hostname?: string; uptime?: string; error?: string }>>({});

  const testConnection = async (srv: any) => {
    setTestingIds(prev => new Set(prev).add(srv.id));
    try {
      const res = await api.testServerConnection(srv.id);
      setTestResults(prev => ({ ...prev, [srv.id]: res.data as any }));
      if ((res.data as any)?.success) {
        useToastStore.getState().success('Connected', `${srv.name} — ${(res.data as any).latencyMs}ms`);
      } else {
        useToastStore.getState().error('Failed', (res.data as any)?.error || 'Connection failed');
      }
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [srv.id]: { success: false, latencyMs: 0, error: err.message } }));
      useToastStore.getState().error('Failed', err.message);
    }
    setTestingIds(prev => { const n = new Set(prev); n.delete(srv.id); return n; });
  };

  const collectLiveMetrics = async () => {
    setCollecting(true);
    try {
      await api.collectServerMetrics();
      await refetchResources();
    } catch (err) { console.error(err); }
    setCollecting(false);
  };

  const addServer = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await api.createServer(form as any);
      setForm({ name: '', privateIp: '', publicAddress: '', sshKey: '' });
      setShowForm(false);
      await refetch();
      useToastStore.getState().success('Server Added', `${form.name} has been added successfully`);
    } catch (err) { console.error(err); useToastStore.getState().error('Failed', 'Could not add server'); }
    setSaving(false);
  };

  const deleteServer = async () => {
    if (!deleteTarget) return;
    try {
      const name = deleteTarget.name;
      await api.deleteServer(deleteTarget.id);
      setDeleteTarget(null);
      await refetch();
      useToastStore.getState().success('Server Deleted', `${name} has been removed`);
    } catch (err) { console.error(err); useToastStore.getState().error('Failed', 'Could not delete server'); }
  };

  const openEdit = (srv: any) => {
    setEditTarget({ id: srv.id, name: srv.name, privateIp: srv.privateIp || '', publicAddress: srv.publicAddress || '', sshKey: srv.sshKey || '' });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await api.updateServer(editTarget.id, { name: editTarget.name, privateIp: editTarget.privateIp, publicAddress: editTarget.publicAddress, sshKey: editTarget.sshKey });
      useToastStore.getState().success('Server Updated', `${editTarget.name} has been updated`);
      setEditTarget(null);
      await refetch();
    } catch (err) { console.error(err); useToastStore.getState().error('Failed', 'Could not update server'); }
    setSaving(false);
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
          <Link href="/servers/mounts" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))', cursor: 'pointer', textDecoration: 'none' }}>
            <FolderSync style={{ width: '14px', height: '14px' }} /> SSHFS Mounts
          </Link>
          <button onClick={collectLiveMetrics} disabled={collecting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: collecting ? 'wait' : 'pointer', opacity: collecting ? 0.7 : 1 }}>
            {collecting ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <RefreshCw style={{ width: '14px', height: '14px' }} />} {collecting ? 'Scanning...' : 'Refresh'}
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add Server
          </button>
        </div>
      </div>

      {/* Add Server Modal */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', borderRadius: '16px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(var(--primary),0.15), rgba(var(--agent),0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server style={{ width: '18px', height: '18px', color: 'rgb(var(--primary))' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Add New Server</h3>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Register a server for monitoring</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              {(() => {
                const chipStyle: React.CSSProperties = { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, border: '1px solid rgba(var(--primary), 0.25)', backgroundColor: 'rgba(var(--primary), 0.06)', color: 'rgb(var(--primary))', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms' };
                const chipRow: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' };
                // Compute suggestions
                const existingIps = allServers.map((s: any) => s.privateIp).filter(Boolean);
                const usedNums = existingIps.map((ip: string) => { const m = ip.match(/10\.0\.1\.(\d+)/); return m ? parseInt(m[1]) : 0; }).filter(Boolean);
                const nextNum = usedNums.length > 0 ? Math.max(...usedNums) + 1 : 41;
                const suggestedIps = [nextNum, nextNum + 1, nextNum + 10].map(n => `10.0.1.${n}`);
                const serverCount = allServers.length + 1;
                const nameHints = [`Server ${serverCount}`, `Production Web ${serverCount}`, `Staging ${serverCount}`, `DB Server ${serverCount}`];
                const sshHints = ['~/.ssh/winbull.pem', '~/.ssh/id_rsa', '~/.ssh/cortexo.pem'];
                const existingSshKeys = [...new Set(allServers.map((s: any) => s.sshKey).filter(Boolean))];
                const allSshHints = [...new Set([...existingSshKeys, ...sshHints])].slice(0, 4);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Server Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Production Web 1" style={inputStyle} autoFocus />
                        <div style={chipRow}>
                          {nameHints.map(h => <button key={h} type="button" onClick={() => setForm(f => ({ ...f, name: h }))} style={chipStyle} onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = 'rgba(var(--primary), 0.15)'; }} onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'rgba(var(--primary), 0.06)'; }}>{h}</button>)}
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Private IP *</label>
                        <input value={form.privateIp} onChange={e => setForm(f => ({ ...f, privateIp: e.target.value }))} placeholder="e.g. 10.0.1.50" style={inputStyle} />
                        <div style={chipRow}>
                          {suggestedIps.map(ip => <button key={ip} type="button" onClick={() => setForm(f => ({ ...f, privateIp: ip }))} style={chipStyle} onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = 'rgba(var(--primary), 0.15)'; }} onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'rgba(var(--primary), 0.06)'; }}>{ip}</button>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><label style={labelStyle}>Public Address</label><input value={form.publicAddress} onChange={e => setForm(f => ({ ...f, publicAddress: e.target.value }))} placeholder="e.g. ec2-xx.compute.amazonaws.com" style={inputStyle} /></div>
                      <div>
                        <label style={labelStyle}>SSH Key Path</label>
                        <input value={form.sshKey} onChange={e => setForm(f => ({ ...f, sshKey: e.target.value }))} placeholder="e.g. ~/.ssh/id_rsa" style={inputStyle} />
                        <div style={chipRow}>
                          {allSshHints.map(h => <button key={h} type="button" onClick={() => setForm(f => ({ ...f, sshKey: h }))} style={chipStyle} onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = 'rgba(var(--primary), 0.15)'; }} onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'rgba(var(--primary), 0.06)'; }}>{h}</button>)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgb(var(--border))', display: 'flex', gap: '8px', justifyContent: 'flex-end', backgroundColor: 'rgba(var(--surface-hover), 0.5)' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
              <button onClick={addServer} disabled={!form.name || saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: !form.name ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', opacity: !form.name ? 0.5 : 1, boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
                {saving ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Plus style={{ width: 14, height: 14 }} />} {saving ? 'Adding...' : 'Add Server'}
              </button>
            </div>
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
                      {testResults[srv.id] ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                          backgroundColor: testResults[srv.id].success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: testResults[srv.id].success ? '#10B981' : '#EF4444',
                        }}>
                          {testResults[srv.id].success ? <Wifi style={{ width: '8px', height: '8px' }} /> : <WifiOff style={{ width: '8px', height: '8px' }} />}
                          {testResults[srv.id].success ? `${testResults[srv.id].latencyMs}ms` : 'offline'}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, backgroundColor: 'rgba(var(--border), 0.3)', color: 'rgb(var(--text-muted))' }}>
                          untested
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button title="Test SSH" onClick={() => testConnection(srv)} disabled={testingIds.has(srv.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: testingIds.has(srv.id) ? 'wait' : 'pointer', color: 'rgb(var(--text-muted))' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--primary))'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}
                  >{testingIds.has(srv.id) ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Plug style={{ width: '14px', height: '14px' }} />}</button>
                  <button title="Edit" onClick={() => openEdit(srv)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}><Edit3 style={{ width: '14px', height: '14px' }} /></button>
                  <button title="Delete" onClick={() => setDeleteTarget({ id: srv.id, name: srv.name })} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}
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

      {/* Edit Server Modal */}
      {editTarget && (
        <div onClick={() => setEditTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', borderRadius: '16px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(var(--primary),0.15), rgba(var(--agent),0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 style={{ width: '18px', height: '18px', color: 'rgb(var(--primary))' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Edit Server</h3>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Update server details</p>
                </div>
              </div>
              <button onClick={() => setEditTarget(null)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Server Name *</label><input value={editTarget.name} onChange={e => setEditTarget((p: any) => ({ ...p, name: e.target.value }))} style={inputStyle} autoFocus /></div>
                  <div><label style={labelStyle}>Private IP *</label><input value={editTarget.privateIp} onChange={e => setEditTarget((p: any) => ({ ...p, privateIp: e.target.value }))} style={inputStyle} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Public Address</label><input value={editTarget.publicAddress} onChange={e => setEditTarget((p: any) => ({ ...p, publicAddress: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>SSH Key Path</label><input value={editTarget.sshKey} onChange={e => setEditTarget((p: any) => ({ ...p, sshKey: e.target.value }))} style={inputStyle} /></div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgb(var(--border))', display: 'flex', gap: '8px', justifyContent: 'flex-end', backgroundColor: 'rgba(var(--surface-hover), 0.5)' }}>
              <button onClick={() => setEditTarget(null)} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
              <button onClick={saveEdit} disabled={!editTarget.name || saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: !editTarget.name ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', opacity: !editTarget.name ? 0.5 : 1, boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
                {saving ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Edit3 style={{ width: 14, height: 14 }} />} {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div onClick={() => setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 style={{ width: '22px', height: '22px', color: '#EF4444' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>Delete Server</h3>
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: 'rgb(var(--text-primary))' }}>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgb(var(--border))', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
              <button onClick={deleteServer} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', backgroundColor: '#EF4444', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
