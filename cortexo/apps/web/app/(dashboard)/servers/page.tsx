'use client';

import { useState } from 'react';
import {
  Server as ServerIcon, Plus, Trash2, Edit3, HardDrive, Cpu, MemoryStick,
  Loader2, RefreshCw, Wifi, WifiOff, Globe, Shield, FolderSync, Plug, X,
} from 'lucide-react';
import Link from 'next/link';
import { Server, api } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';

import { useToastStore } from '@/lib/toast-store';



function MetricBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = pct > 85 ? '#EF4444' : pct > 70 ? '#F59E0B' : color;
  return (
    <div style={{ marginBottom: '8px' }}>
      <div className="cx-flex-between" style={{ marginBottom: '3px' }}>
        <span className="cx-text-muted cx-text-11">{label}</span>
        <span className="cx-fw-600 cx-text-11" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="cx-metric-track">
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: `linear-gradient(90deg, ${barColor}99, ${barColor})`, transition: 'width 600ms ease' }} />
      </div>
      <span className="cx-text-muted cx-text-10">{value}{unit} / {max}{unit}</span>
    </div>
  );
}

export default function ServersPage() {
  const { data: servers, isLoading: loading, isError: error, refetch } = useCortexoQuery(['servers'], () => api.getServers());
  const { data: resources, refetch: refetchResources } = useCortexoQuery(['server-resources-latest'], () => api.getServerResourcesLatest());

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string; privateIp: string; publicAddress: string; sshKey: string } | null>(null);
  const [form, setForm] = useState({ name: '', privateIp: '', publicAddress: '', sshKey: '' });
  const [testingIds, setTestingIds] = useState<Set<number>>(new Set());
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; latencyMs: number; hostname?: string; uptime?: string; error?: string }>>({});

  const testConnection = async (srv: Server) => {
    setTestingIds(prev => new Set(prev).add(srv.id));
    try {
      const res = await api.testServerConnection(srv.id);
      const result = res.data;
      if (result) {
        setTestResults(prev => ({ ...prev, [srv.id]: result }));
        if (result.success) {
          useToastStore.getState().success('Connected', `${srv.name} — ${result.latencyMs}ms`);
        } else {
          useToastStore.getState().error('Failed', result.error || 'Connection failed');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setTestResults(prev => ({ ...prev, [srv.id]: { success: false, latencyMs: 0, error: message } }));
      useToastStore.getState().error('Failed', message);
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
      await api.createServer({ name: form.name, privateIp: form.privateIp, publicAddress: form.publicAddress, sshKey: form.sshKey });
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

  const openEdit = (srv: Server) => {
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
      <div className="cx-flex-center" style={{ height: '256px' }}>
        <Loader2 className="cx-spin cx-text-accent" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  const allServers: Server[] = (servers as Server[]) || [];
  const allResources: Record<string, unknown>[] = (resources as Record<string, unknown>[]) || [];

  const resourceByIp = allResources.reduce<Record<string, Record<string, unknown>>>((acc, r) => {
    const ip = r.serverIp as string;
    if (ip) acc[ip] = r;
    return acc;
  }, {});

  return (
    <div>
      <div className="cx-flex-between" style={{ alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 className="cx-fw-700 cx-text-primary cx-page-title" style={{ margin: 0 }}>Servers</h1>
          <p className="cx-text-secondary" style={{ fontSize: '14px', marginTop: '4px' }}>{allServers.length} servers · resource monitoring & fleet management</p>
        </div>
        <div className="cx-flex cx-gap-8">
          <Link href="/servers/mounts" className="cx-flex cx-items-center cx-gap-6 cx-btn-secondary cx-text-secondary" style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
            <FolderSync style={{ width: '14px', height: '14px' }} /> SSHFS Mounts
          </Link>
          <button onClick={collectLiveMetrics} disabled={collecting} className="cx-flex cx-items-center cx-gap-6 cx-btn-secondary cx-fw-600 cx-text-secondary" style={{ padding: '10px 16px', fontSize: '13px', cursor: collecting ? 'wait' : 'pointer', opacity: collecting ? 0.7 : 1 }}>
            {collecting ? <Loader2 className="cx-spin" style={{ width: '14px', height: '14px' }} /> : <RefreshCw style={{ width: '14px', height: '14px' }} />} {collecting ? 'Scanning...' : 'Refresh'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="cx-btn-primary cx-flex cx-items-center cx-gap-8" style={{ padding: '10px 20px' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add Server
          </button>
        </div>
      </div>

      {/* Add Server Modal */}
      {showForm && (
        <div onClick={() => setShowForm(false)} className="cx-modal-overlay">
          <div onClick={e => e.stopPropagation()} className="cx-modal" style={{ maxWidth: '520px' }}>
            {/* Header */}
            <div className="cx-modal-header">
              <div className="cx-flex cx-items-center cx-gap-10">
                <div className="cx-flex-center cx-r-10" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, rgba(var(--primary),0.15), rgba(var(--agent),0.1))' }}>
                  <ServerIcon style={{ width: '18px', height: '18px' }} className="cx-text-accent" />
                </div>
                <div>
                  <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Add New Server</h3>
                  <p className="cx-text-muted" style={{ fontSize: '12px', margin: 0 }}>Register a server for monitoring</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="cx-icon-btn" style={{ fontSize: '18px' }}><X style={{ width: '16px', height: '16px' }} /></button>
            </div>
            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              {(() => {
                // cx-chip + cx-chip-row classes used below (defined in globals.css)
                const existingIps = allServers.map((s: Server) => s.privateIp).filter((ip): ip is string => Boolean(ip));
                const usedNums = existingIps.map((ip: string) => { const m = ip.match(/10\.0\.1\.(\d+)/); return m ? parseInt(m[1]) : 0; }).filter(Boolean);
                const nextNum = usedNums.length > 0 ? Math.max(...usedNums) + 1 : 41;
                const suggestedIps = [nextNum, nextNum + 1, nextNum + 10].map(n => `10.0.1.${n}`);
                const serverCount = allServers.length + 1;
                const nameHints = [`Server ${serverCount}`, `Production Web ${serverCount}`, `Staging ${serverCount}`, `DB Server ${serverCount}`];
                const sshHints = ['~/.ssh/winbull.pem', '~/.ssh/id_rsa', '~/.ssh/cortexo.pem'];
                const existingSshKeys = [...new Set(allServers.map((s: Server) => s.sshKey).filter((k): k is string => Boolean(k)))];
                const allSshHints = [...new Set([...existingSshKeys, ...sshHints])].slice(0, 4);

                return (
                  <div className="cx-flex-col" style={{ gap: '14px' }}>
                    <div className="cx-grid-2-sm">
                      <div>
                        <label className="cx-label">Server Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Production Web 1" className="cx-input cx-mono" autoFocus />
                        <div className="cx-chip-row">
                          {nameHints.map(h => <button key={h} type="button" onClick={() => setForm(f => ({ ...f, name: h }))} className="cx-chip">{h}</button>)}
                        </div>
                      </div>
                      <div>
                        <label className="cx-label">Private IP *</label>
                        <input value={form.privateIp} onChange={e => setForm(f => ({ ...f, privateIp: e.target.value }))} placeholder="e.g. 10.0.1.50" className="cx-input cx-mono" />
                        <div className="cx-chip-row">
                          {suggestedIps.map(ip => <button key={ip} type="button" onClick={() => setForm(f => ({ ...f, privateIp: ip }))} className="cx-chip">{ip}</button>)}
                        </div>
                      </div>
                    </div>
                    <div className="cx-grid-2-sm">
                      <div><label className="cx-label">Public Address</label><input value={form.publicAddress} onChange={e => setForm(f => ({ ...f, publicAddress: e.target.value }))} placeholder="e.g. ec2-xx.compute.amazonaws.com" className="cx-input cx-mono" /></div>
                      <div>
                        <label className="cx-label">SSH Key Path</label>
                        <input value={form.sshKey} onChange={e => setForm(f => ({ ...f, sshKey: e.target.value }))} placeholder="e.g. ~/.ssh/id_rsa" className="cx-input cx-mono" />
                        <div className="cx-chip-row">
                          {allSshHints.map(h => <button key={h} type="button" onClick={() => setForm(f => ({ ...f, sshKey: h }))} className="cx-chip">{h}</button>)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Footer */}
            <div className="cx-modal-footer">
              <button onClick={() => setShowForm(false)} className="cx-btn-secondary cx-fw-600" style={{ padding: '10px 20px', fontSize: '13px' }}>Cancel</button>
              <button onClick={addServer} disabled={!form.name || saving} className="cx-btn-primary cx-flex cx-items-center cx-gap-6" style={{ padding: '10px 24px', fontSize: '13px', opacity: !form.name ? 0.5 : 1, cursor: !form.name ? 'not-allowed' : 'pointer' }}>
                {saving ? <Loader2 className="cx-spin" style={{ width: 14, height: 14 }} /> : <Plus style={{ width: 14, height: 14 }} />} {saving ? 'Adding...' : 'Add Server'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '14px' }}>
        {allServers.map((srv: Server) => {
          const res = srv.privateIp ? resourceByIp[srv.privateIp] : undefined;
          const hasMetrics = !!res;
          const cpuPct = hasMetrics ? parseFloat(String(res.cpuPercent)) : 0;
          const accentColor = cpuPct > 80 ? '#EF4444' : cpuPct > 60 ? '#F59E0B' : '#10B981';

          return (
            <div key={srv.id} className="cx-card" style={{ display: 'flex', flexDirection: 'column', borderRadius: '14px', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px -8px ${accentColor}20, 0 4px 12px rgba(0,0,0,0.15)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ height: '3px', backgroundColor: accentColor, position: 'absolute', top: 0, left: 0, right: 0 }} />

              <div className="cx-flex-between" style={{ alignItems: 'flex-start', padding: '18px 18px 12px', borderBottom: '1px solid rgb(var(--border))' }}>
                <div className="cx-flex cx-gap-12" style={{ alignItems: 'flex-start' }}>
                  <div className="cx-flex-center cx-r-10" style={{ width: '42px', height: '42px', background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`, border: `1px solid ${accentColor}30` }}>
                    <ServerIcon style={{ width: '20px', height: '20px', color: accentColor }} />
                  </div>
                  <div>
                    <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '15px', margin: 0 }}>{srv.name}</h3>
                    <div className="cx-flex cx-items-center cx-gap-6" style={{ marginTop: '4px' }}>
                      <span className="cx-text-muted cx-mono" style={{ fontSize: '12px' }}>{srv.privateIp}</span>
                      {testResults[srv.id] ? (
                        <span className="cx-flex cx-items-center cx-gap-3 cx-fw-600" style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '10px',
                          backgroundColor: testResults[srv.id].success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: testResults[srv.id].success ? '#10B981' : '#EF4444',
                        }}>
                          {testResults[srv.id].success ? <Wifi style={{ width: '8px', height: '8px' }} /> : <WifiOff style={{ width: '8px', height: '8px' }} />}
                          {testResults[srv.id].success ? `${testResults[srv.id].latencyMs}ms` : 'offline'}
                        </span>
                      ) : (
                        <span className="cx-flex cx-items-center cx-gap-3 cx-text-muted" style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, backgroundColor: 'rgba(var(--border), 0.3)' }}>
                          untested
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="cx-flex cx-gap-4">
                  <button title="Test SSH" onClick={() => testConnection(srv)} disabled={testingIds.has(srv.id)} className="cx-icon-btn" style={{ cursor: testingIds.has(srv.id) ? 'wait' : 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgb(var(--primary))'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}
                  >{testingIds.has(srv.id) ? <Loader2 className="cx-spin" style={{ width: '14px', height: '14px' }} /> : <Plug style={{ width: '14px', height: '14px' }} />}</button>
                  <button title="Edit" onClick={() => openEdit(srv)} className="cx-icon-btn"><Edit3 style={{ width: '14px', height: '14px' }} /></button>
                  <button title="Delete" onClick={() => setDeleteTarget({ id: srv.id, name: srv.name })} className="cx-icon-btn"
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}
                  ><Trash2 style={{ width: '14px', height: '14px' }} /></button>
                </div>
              </div>

              {hasMetrics ? (
                <div style={{ padding: '14px 18px' }}>
                  <MetricBar label="CPU" value={cpuPct} max={100} unit="%" color="#818CF8" />
                  <MetricBar label="RAM" value={Number(res.ramUsedMb) || 0} max={Number(res.ramTotalMb) || 0} unit="MB" color="#10B981" />
                  <MetricBar label="Disk" value={parseFloat(String(res.diskUsedGb))} max={parseFloat(String(res.diskTotalGb))} unit="GB" color="#F59E0B" />
                  <div className="cx-flex-between cx-text-muted" style={{ marginTop: '8px', fontSize: '10px' }}>
                    <span>Load: {String(res.loadAvg)}</span>
                    <span>Uptime: {Math.round(Number(res.uptimeHours) / 24)}d</span>
                  </div>
                </div>
              ) : (
                <div className="cx-text-muted" style={{ padding: '20px 18px', textAlign: 'center', fontSize: '12px' }}>
                  No metrics available
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Server Modal */}
      {editTarget && (
        <div onClick={() => setEditTarget(null)} className="cx-modal-overlay">
          <div onClick={e => e.stopPropagation()} className="cx-modal">
            <div className="cx-modal-header">
              <div className="cx-flex cx-items-center cx-gap-10">
                <div className="cx-flex-center cx-r-10" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, rgba(var(--primary),0.15), rgba(var(--agent),0.1))' }}>
                  <Edit3 style={{ width: '18px', height: '18px' }} className="cx-text-accent" />
                </div>
                <div>
                  <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Edit Server</h3>
                  <p className="cx-text-muted" style={{ fontSize: '12px', margin: 0 }}>Update server details</p>
                </div>
              </div>
              <button onClick={() => setEditTarget(null)} className="cx-icon-btn" style={{ fontSize: '18px' }}><X style={{ width: '16px', height: '16px' }} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div className="cx-flex-col" style={{ gap: '14px' }}>
                <div className="cx-grid-2-sm">
                  <div><label className="cx-label">Server Name *</label><input value={editTarget.name} onChange={e => setEditTarget(p => p ? ({ ...p, name: e.target.value }) : p)} className="cx-input cx-mono" autoFocus /></div>
                  <div><label className="cx-label">Private IP *</label><input value={editTarget.privateIp} onChange={e => setEditTarget(p => p ? ({ ...p, privateIp: e.target.value }) : p)} className="cx-input cx-mono" /></div>
                </div>
                <div className="cx-grid-2-sm">
                  <div><label className="cx-label">Public Address</label><input value={editTarget.publicAddress} onChange={e => setEditTarget(p => p ? ({ ...p, publicAddress: e.target.value }) : p)} className="cx-input cx-mono" /></div>
                  <div><label className="cx-label">SSH Key Path</label><input value={editTarget.sshKey} onChange={e => setEditTarget(p => p ? ({ ...p, sshKey: e.target.value }) : p)} className="cx-input cx-mono" /></div>
                </div>
              </div>
            </div>
            <div className="cx-modal-footer">
              <button onClick={() => setEditTarget(null)} className="cx-btn-secondary cx-fw-600" style={{ padding: '10px 20px', fontSize: '13px' }}>Cancel</button>
              <button onClick={saveEdit} disabled={!editTarget.name || saving} className="cx-btn-primary cx-flex cx-items-center cx-gap-6" style={{ padding: '10px 24px', fontSize: '13px', opacity: !editTarget.name ? 0.5 : 1, cursor: !editTarget.name ? 'not-allowed' : 'pointer' }}>
                {saving ? <Loader2 className="cx-spin" style={{ width: 14, height: 14 }} /> : <Edit3 style={{ width: 14, height: 14 }} />} {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div onClick={() => setDeleteTarget(null)} className="cx-modal-overlay">
          <div onClick={e => e.stopPropagation()} className="cx-modal" style={{ maxWidth: '400px' }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div className="cx-flex-center cx-r-12" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(239,68,68,0.1)', margin: '0 auto 16px' }}>
                <Trash2 style={{ width: '22px', height: '22px', color: '#EF4444' }} />
              </div>
              <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 8px' }}>Delete Server</h3>
              <p className="cx-text-muted" style={{ fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete <strong className="cx-text-primary">{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="cx-modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="cx-btn-secondary cx-fw-600" style={{ padding: '10px 20px', fontSize: '13px' }}>Cancel</button>
              <button onClick={deleteServer} className="cx-btn-danger cx-fw-600" style={{ padding: '10px 20px', fontSize: '13px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
