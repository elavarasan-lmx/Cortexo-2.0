'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  HardDrive, Plus, Trash2, Edit3, Loader2, RefreshCw,
  FolderOpen, File, ChevronRight, ArrowLeft, Power, PowerOff,
  Server as ServerIcon, Copy, X, Folder, FileCode, FileText as FileTextIcon,
  Shield, Eye, Clock, Lock, Unlock,
} from 'lucide-react';
import { AuditLog, MountFileEntry, Server, ServerMount, api } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';
import { useModal } from '@/components/modal-provider';
import { useToastStore } from '@/lib/toast-store';

/* ── Icon by file type ── */
function FileIcon({ type }: { type: string }) {
  const color: Record<string, string> = {
    php: '#777BB4', javascript: '#F7DF1E', typescript: '#3178C6', react: '#61DAFB',
    css: '#264de4', scss: '#CD6799', html: '#E34C26', json: '#292929',
    sql: '#e38c00', python: '#3776AB', ruby: '#CC342D', markdown: '#083FA1',
    image: '#10B981', config: '#6B7280', directory: 'rgb(var(--primary))',
  };
  const c = color[type] || 'rgb(var(--text-muted))';
  if (type === 'directory') return <Folder style={{ width: 16, height: 16, color: c }} />;
  if (['php','javascript','typescript','react','css','scss','html'].includes(type))
    return <FileCode style={{ width: 16, height: 16, color: c }} />;
  return <File style={{ width: 16, height: 16, color: c }} />;
}

/* ── Format file size ── */
function fmtSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    mounted:   { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Mounted' },
    unmounted: { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', label: 'Unmounted' },
    error:     { bg: 'rgba(239,68,68,0.12)',   color: '#EF4444', label: 'Error' },
  };
  const s = cfg[status] || cfg.unmounted;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:600, backgroundColor:s.bg, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', backgroundColor:s.color, boxShadow: status==='mounted' ? `0 0 6px ${s.color}` : 'none' }} />
      {s.label}
    </span>
  );
}



export default function ServerMountsPage() {
  const { data: mounts, isLoading: loading, refetch } = useCortexoQuery(
    ['server-mounts'],
    () => api.getServerMounts(),
  );
  const { data: servers } = useCortexoQuery(['servers'], () => api.getServers());

  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [browsing, setBrowsing] = useState<{ mountId: number; mountName: string } | null>(null);
  const [browseData, setBrowseData] = useState<{ currentPath: string; parentPath: string | null; entries: MountFileEntry[] } | null>(null);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [viewFile, setViewFile] = useState<{ filePath: string; fileName: string; content: string; lines: number; size: number; type: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ serverId: 0, name: '', remotePath: '', localMountPath: '', sshUser: 'ubuntu', autoMount: false });

  // Read-only mode — backed by DB, enforced at OS level via SSHFS -o ro
  const isReadOnly = (mountId: number) => {
    const allM = mounts ?? [];
    const mount = allM.find((m: ServerMount) => m.id === mountId);
    return mount?.readOnly !== false; // default: true
  };
  const [togglingRO, setTogglingRO] = useState<number | null>(null);
  const toggleReadOnly = async (mountId: number) => {
    const newVal = !isReadOnly(mountId);
    setTogglingRO(mountId);
    try {
      await api.toggleMountReadOnly(mountId, newVal);
      toast.success('Access Changed', `Mount set to ${newVal ? 'Read Only' : 'Read Write'}${newVal ? '' : ' — remounted'}`);
      await refetch();
    } catch (e) { toast.error('Toggle Failed', (e instanceof Error ? e.message : String(e))); }
    setTogglingRO(null);
  };

  // Audit trail state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await api.getAuditLogs({ resource: 'server_mount', limit: '30' });
      setAuditLogs(res.data || []);
    } catch { setAuditLogs([]); }
    setAuditLoading(false);
  };

  useEffect(() => { if (showAudit) fetchAuditLogs(); }, [showAudit]);

  const setAction = (id: number, action: string) => setActionLoading(p => ({ ...p, [id]: action }));
  const clearAction = (id: number) => setActionLoading(p => { const n = { ...p }; delete n[id]; return n; });

  const { confirm: confirmModal } = useModal();
  const toast = useToastStore();

  const handleMount = async (id: number) => {
    setAction(id, 'mounting');
    try { await api.mountServer(id); await refetch(); } catch (e: any) {
      const details = e.details?.details || e.details?.error || '';
      toast.error('Mount Failed', details || e.message);
    }
    clearAction(id);
  };

  const handleUnmount = async (id: number) => {
    setAction(id, 'unmounting');
    try { await api.unmountServer(id); await refetch(); } catch (e) { toast.error('Unmount Failed', (e instanceof Error ? e.message : String(e))); }
    clearAction(id);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmModal({ title: 'Delete Mount', message: 'Delete this mount config?', variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    setAction(id, 'deleting');
    try { await api.deleteServerMount(id); await refetch(); } catch (e) { toast.error('Delete Failed', (e instanceof Error ? e.message : String(e))); }
    clearAction(id);
  };

  const handleCreate = async () => {
    if (!form.name || !form.remotePath || !form.localMountPath || !form.serverId) { toast.error('Validation', 'Fill all fields'); return; }
    try {
      await api.createServerMount(form);
      setShowCreate(false);
      setForm({ serverId: 0, name: '', remotePath: '', localMountPath: '', sshUser: 'ubuntu', autoMount: false });
      await refetch();
    } catch (e) { toast.error('Create Failed', (e instanceof Error ? e.message : String(e))); }
  };

  const handleBrowse = async (mountId: number, mountName: string, path = '.') => {
    setBrowsing({ mountId, mountName });
    setBrowseLoading(true);
    setViewFile(null);
    try {
      const res = await api.browseServerMount(mountId, path);
      setBrowseData(res.data);
    } catch (e) { toast.error('Browse Failed', (e instanceof Error ? e.message : String(e))); setBrowseData(null); }
    setBrowseLoading(false);
  };

  const handleReadFile = async (mountId: number, filePath: string) => {
    setFileLoading(true);
    try {
      const res = await api.readServerFile(mountId, filePath);
      setViewFile(res.data);
    } catch (e) { toast.error('Read Failed', (e instanceof Error ? e.message : String(e))); }
    setFileLoading(false);
  };

  const allMounts = mounts ?? [];
  const allServers = servers ?? [];
  const serverMap = allServers.reduce((a: Record<number, Server>, s: Server) => { a[s.id] = s; return a; }, {});

  if (loading) {
    return (
      <div className="cx-flex cx-items-center cx-justify-center" style={{ height:256 }}>
        <Loader2 style={{ width:32, height:32, color:'rgb(var(--primary))', animation:'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="cx-flex-between" style={{ alignItems:"flex-start", gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>Server Mounts</h1>
          <p style={{ fontSize:14, color:'rgb(var(--text-secondary))', marginTop:4 }}>
            {allMounts.length} mount{allMounts.length !== 1 ? 's' : ''} · SSHFS remote file access
          </p>
        </div>
        <div className="cx-flex cx-gap-8">
          <button onClick={() => refetch()} className="cx-btn cx-btn-outline"><RefreshCw style={{ width:14, height:14 }} /> Refresh</button>
          <button onClick={() => setShowCreate(true)} className="cx-btn cx-btn-primary"><Plus style={{ width:16, height:16 }} /> Add Mount</button>
        </div>
      </div>

      {/* Mount Cards Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(380px, 1fr))', gap:14, marginBottom:24 }}>
        {allMounts.map((m: ServerMount) => {
          const srv = serverMap[m.serverId];
          const isMounted = m.status === 'mounted';
          const accentColor = isMounted ? '#10B981' : '#6B7280';
          const act = actionLoading[m.id];

          return (
            <div key={m.id} className="cx-card cx-border"
              style={{ display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px -8px ${accentColor}20, 0 4px 12px rgba(0,0,0,0.15)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ height:3, backgroundColor:accentColor, position:'absolute', top:0, left:0, right:0 }} />

              {/* Header */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'18px 18px 12px', borderBottom:'1px solid rgb(var(--border))' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:`linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`, border:`1px solid ${accentColor}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <HardDrive style={{ width:20, height:20, color:accentColor }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>{m.name}</h3>
                    <div className="cx-flex cx-items-center cx-gap-6" style={{ marginTop:4 }}>
                      {srv && <span style={{ fontSize:12, color:'rgb(var(--text-muted))', fontFamily:"'JetBrains Mono', monospace" }}>{srv.privateIp || srv.publicAddress}</span>}
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                </div>
                <div className="cx-flex cx-gap-4">
                  <button title="Delete" onClick={() => handleDelete(m.id)} style={{ padding:6, borderRadius:6, border:'none', backgroundColor:'transparent', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                    <Trash2 style={{ width:14, height:14 }} />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding:'14px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                  <div>
                    <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase', letterSpacing:'0.05em' }}>Remote Path</span>
                    <p style={{ fontSize:12, fontFamily:"'JetBrains Mono', monospace", color:'rgb(var(--text-primary))', margin:'2px 0 0', wordBreak:'break-all' }}>{m.remotePath}</p>
                  </div>
                  <div>
                    <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase', letterSpacing:'0.05em' }}>Access</span>
                    <button
                      onClick={() => toggleReadOnly(m.id)}
                      disabled={togglingRO === m.id}
                      style={{ display:'flex', alignItems:'center', gap:6, marginTop:4, padding:0, border:'none', background:'none', cursor: togglingRO === m.id ? 'wait' : 'pointer', opacity: togglingRO === m.id ? 0.6 : 1 }}
                      title={isReadOnly(m.id) ? 'Click to enable Read-Write (will remount)' : 'Click to enable Read-Only (will remount)'}
                    >
                      {/* Toggle track */}
                      <div style={{
                        width:32, height:18, borderRadius:9, position:'relative', transition:'background 200ms',
                        backgroundColor: isReadOnly(m.id) ? '#10B981' : '#F59E0B',
                      }}>
                        <div style={{
                          width:14, height:14, borderRadius:'50%', backgroundColor:'#fff', position:'absolute', top:2,
                          left: isReadOnly(m.id) ? 16 : 2, transition:'left 200ms', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color: isReadOnly(m.id) ? '#10B981' : '#F59E0B', display:'flex', alignItems:'center', gap:3 }}>
                        {isReadOnly(m.id) ? <><Lock style={{ width:10, height:10 }} /> Read Only</> : <><Unlock style={{ width:10, height:10 }} /> Read Write</>}
                      </span>
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase', letterSpacing:'0.05em' }}>Local Mount</span>
                  <p style={{ fontSize:12, fontFamily:"'JetBrains Mono', monospace", color:'rgb(var(--text-primary))', margin:'2px 0 0', wordBreak:'break-all' }}>{m.localMountPath}</p>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop: 12 }}>
                  {isMounted ? (
                    <>
                      <button onClick={() => handleUnmount(m.id)} disabled={!!act}
                        className="cx-btn cx-btn-outline" style={{ flex:1, justifyContent:"center", borderColor:"#EF4444", color:"#EF4444" }}>
                        {act === 'unmounting' ? <Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }} /> : <PowerOff style={{ width:14, height:14 }} />}
                        Unmount
                      </button>
                      <button onClick={() => handleBrowse(m.id, m.name ?? '')}
                        className="cx-btn cx-btn-outline" style={{ flex:1, justifyContent:"center", borderColor:"rgb(var(--primary))", color:"rgb(var(--primary))" }}>
                        <FolderOpen style={{ width:14, height:14 }} /> Browse
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleMount(m.id)} disabled={!!act}
                      className="cx-btn cx-btn-primary" style={{ flex:1, justifyContent:"center", padding:"8px 14px", fontSize:12, borderRadius:10 }}>
                      {act === 'mounting' ? <Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }} /> : <Power style={{ width:14, height:14 }} />}
                      Mount
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {allMounts.length === 0 && (
          <div style={{ gridColumn:'1 / -1', textAlign:'center', padding:60, color:'rgb(var(--text-muted))' }}>
            <HardDrive style={{ width:48, height:48, margin:'0 auto 12px', opacity:0.3 }} />
            <p style={{ fontSize:15, fontWeight:600 }}>No mounts configured</p>
            <p style={{ fontSize:13, marginTop:4 }}>Click "Add Mount" to set up SSHFS access to your servers</p>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div style={{ width:520, maxHeight:'90vh', overflow:'auto', borderRadius:16, backgroundColor:'rgb(var(--surface))', border:'1px solid rgb(var(--border))', boxShadow:'0 24px 48px rgba(0,0,0,0.25)', padding:28 }}>
            <div className="cx-flex-between" style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>Add Server Mount</h2>
              <button onClick={() => setShowCreate(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgb(var(--text-muted))' }}><X style={{ width:18, height:18 }} /></button>
            </div>

            <div className="cx-flex-col" style={{ gap:14 }}>
              {(() => {
                // cx-chip + cx-chip-row classes used below (defined in globals.css)
                // Compute suggestions from existing data
                const existingNames = allMounts.map((m: ServerMount) => m.name).filter(Boolean);
                // Smart name-based auto-fill
                const fillFromName = (name: string) => {
                  const slug = name.toLowerCase().replace(/\s+/g, '');
                  setForm(p => ({
                    ...p,
                    name,
                    remotePath: p.remotePath || `/var/www/html/${slug}`,
                    localMountPath: p.localMountPath || `~/ec2-${slug}`,
                  }));
                };
                // Common project names for suggestion
                const nameHints = ['KJPL', 'JMBullion', 'RubySilver', 'TrustBullion', 'AJBullion'].filter(n => !existingNames.includes(n)).slice(0, 4);

                return (
                  <>
                    <div>
                      <label className="cx-label">Server</label>
                      <select value={form.serverId} onChange={e => setForm(p => ({ ...p, serverId: parseInt(e.target.value) }))}
                        className="cx-input" style={{ cursor:"pointer" }}>
                        <option value={0}>Select a server...</option>
                        {allServers.map((s: Server) => <option key={s.id} value={s.id}>{s.name} ({s.privateIp})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="cx-label">Mount Name</label>
                      <input placeholder="e.g. RubySilver" value={form.name} onChange={e => {
                        const val = e.target.value;
                        const slug = val.toLowerCase().replace(/\s+/g, '');
                        setForm(p => ({ ...p, name: val, remotePath: `/var/www/html/${slug}`, localMountPath: `~/ec2-${slug}` }));
                      }} className="cx-input" />
                      {nameHints.length > 0 && (
                        <div className="cx-chip-row">
                          {nameHints.map(h => <button key={h} type="button" onClick={() => fillFromName(h)} className="cx-chip">{h}</button>)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4 }}>Remote Path</label>
                      <input placeholder="/var/www/html/rubysilver" value={form.remotePath} onChange={e => setForm(p => ({ ...p, remotePath: e.target.value }))} className="cx-input cx-mono" style={{ fontSize:12 }} />
                      {form.remotePath && <p style={{ fontSize:10, color:'rgb(var(--text-muted))', margin:'4px 0 0' }}>Auto-filled from mount name</p>}
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4 }}>Local Mount Path</label>
                      <input placeholder="~/ec2-rubysilver" value={form.localMountPath} onChange={e => setForm(p => ({ ...p, localMountPath: e.target.value }))} className="cx-input cx-mono" style={{ fontSize:12 }} />
                      {form.localMountPath && <p style={{ fontSize:10, color:'rgb(var(--text-muted))', margin:'4px 0 0' }}>Auto-filled from mount name</p>}
                    </div>

                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgb(var(--text-secondary))', cursor:'pointer' }}>
                      <input type="checkbox" checked={form.autoMount} onChange={e => setForm(p => ({ ...p, autoMount: e.target.checked }))} style={{ accentColor:'rgb(var(--primary))' }} />
                      Auto-mount on startup
                    </label>
                  </>
                );
              })()}
            </div>

            <div className="cx-flex" style={{ gap:10, marginTop:20, justifyContent:"flex-end" }}>
              <button onClick={() => setShowCreate(false)} className="cx-btn cx-btn-outline">Cancel</button>
              <button onClick={handleCreate} className="cx-btn cx-btn-primary">Create Mount</button>
            </div>
          </div>
        </div>
      )}

      {/* ── File Browser Panel ── */}
      {browsing && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setBrowsing(null); setBrowseData(null); setViewFile(null); } }}>
          <div style={{ marginLeft:'auto', width: viewFile ? '85vw' : '520px', maxWidth:'95vw', height:'100vh', backgroundColor:'rgb(var(--surface))', borderLeft:'1px solid rgb(var(--border))', display:'flex', flexDirection:'column', boxShadow:'-8px 0 32px rgba(0,0,0,0.2)' }}>
            {/* Browser Header */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgb(var(--border))', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div className="cx-flex cx-items-center cx-gap-10">
                <FolderOpen style={{ width:18, height:18, color:'rgb(var(--primary))' }} />
                <span style={{ fontSize:15, fontWeight:700, color:'rgb(var(--text-primary))' }}>{browsing.mountName}</span>
                {browseData && (
                  <span style={{ fontSize:12, color:'rgb(var(--text-muted))', fontFamily:"'JetBrains Mono', monospace" }}>
                    /{browseData.currentPath === '.' ? '' : browseData.currentPath}
                  </span>
                )}
                {(() => {
                  const ro = isReadOnly(browsing.mountId);
                  return (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:6, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', backgroundColor: ro ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: ro ? '#10B981' : '#F59E0B', border: `1px solid ${ro ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                      {ro ? <><Lock style={{ width:10, height:10 }} /> Read Only</> : <><Unlock style={{ width:10, height:10 }} /> Read Write</>}
                    </span>
                  );
                })()}
              </div>
              <button onClick={() => { setBrowsing(null); setBrowseData(null); setViewFile(null); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                <X style={{ width:18, height:18 }} />
              </button>
            </div>

            {/* Security Banner */}
            {isReadOnly(browsing.mountId) ? (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 20px', backgroundColor:'rgba(16,185,129,0.04)', borderBottom:'1px solid rgba(16,185,129,0.1)', flexShrink:0 }}>
                <Eye style={{ width:13, height:13, color:'#10B981', flexShrink:0 }} />
                <span style={{ fontSize:11, color:'rgb(var(--text-muted))' }}>Reference-only access · No files can be modified, deleted, or created on the remote server</span>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 20px', backgroundColor:'rgba(245,158,11,0.04)', borderBottom:'1px solid rgba(245,158,11,0.1)', flexShrink:0 }}>
                <Unlock style={{ width:13, height:13, color:'#F59E0B', flexShrink:0 }} />
                <span style={{ fontSize:11, color:'rgb(var(--text-muted))' }}>Read-Write mode · File operations are logged in the audit trail</span>
              </div>
            )}

            <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
              {/* Directory listing */}
              <div style={{ width: viewFile ? 320 : '100%', borderRight: viewFile ? '1px solid rgb(var(--border))' : 'none', overflowY:'auto', flexShrink:0 }}>
                {browseData?.parentPath !== null && browseData?.currentPath !== '.' && (
                  <button onClick={() => handleBrowse(browsing.mountId, browsing.mountName, browseData.parentPath)}
                    style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 16px', border:'none', borderBottom:'1px solid rgb(var(--border))', backgroundColor:'transparent', cursor:'pointer', color:'rgb(var(--primary))', fontSize:13, fontWeight:500 }}>
                    <ArrowLeft style={{ width:14, height:14 }} /> Back
                  </button>
                )}

                {browseLoading ? (
                  <div className="cx-flex cx-justify-center" style={{ padding:40 }}>
                    <Loader2 style={{ width:24, height:24, color:'rgb(var(--primary))', animation:'spin 1s linear infinite' }} />
                  </div>
                ) : browseData?.entries?.map((entry: MountFileEntry, i: number) => (
                  <button key={i}
                    onClick={() => {
                      if (entry.isDirectory) handleBrowse(browsing.mountId, browsing.mountName, entry.path ?? '');
                      else handleReadFile(browsing.mountId, entry.path ?? '');
                    }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 16px', border:'none', borderBottom:'1px solid rgba(var(--border), 0.5)', backgroundColor: viewFile?.filePath === (entry.path ?? '') ? 'rgba(var(--primary), 0.08)' : 'transparent', cursor:'pointer', color:'rgb(var(--text-primary))', fontSize:13, textAlign:'left', transition:'background 150ms' }}
                    onMouseEnter={e => { if (viewFile?.filePath !== (entry.path ?? '')) e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                    onMouseLeave={e => { if (viewFile?.filePath !== (entry.path ?? '')) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <FileIcon type={entry.type} />
                    <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.name}</span>
                    {entry.isDirectory ? (
                      <ChevronRight style={{ width:14, height:14, color:'rgb(var(--text-muted))', flexShrink:0 }} />
                    ) : (
                      <span style={{ fontSize:10, color:'rgb(var(--text-muted))', flexShrink:0 }}>{fmtSize(entry.size)}</span>
                    )}
                  </button>
                ))}

                {browseData && !browseLoading && browseData.entries?.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color:'rgb(var(--text-muted))', fontSize:13 }}>Empty directory</div>
                )}
              </div>

              {/* File Viewer */}
              {viewFile && (
                <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                  <div style={{ padding:'10px 16px', borderBottom:'1px solid rgb(var(--border))', display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor:'rgba(var(--primary), 0.04)', flexShrink:0 }}>
                    <div className="cx-flex cx-items-center cx-gap-8">
                      <FileIcon type={viewFile.type} />
                      <span style={{ fontSize:13, fontWeight:600, color:'rgb(var(--text-primary))' }}>{viewFile.fileName}</span>
                      <span style={{ fontSize:11, color:'rgb(var(--text-muted))' }}>{viewFile.lines} lines · {fmtSize(viewFile.size)}</span>
                    </div>
                    <div className="cx-flex cx-gap-6">
                      <button onClick={() => { navigator.clipboard.writeText(viewFile.content); }}
                        className="cx-btn cx-btn-outline" style={{ padding:"4px 10px", fontSize:11 }}>
                        <Copy style={{ width:12, height:12 }} /> Copy
                      </button>
                      <button onClick={() => setViewFile(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                        <X style={{ width:16, height:16 }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ flex:1, overflow:'auto', padding:0 }}>
                    {fileLoading ? (
                      <div className="cx-flex cx-justify-center" style={{ padding:40 }}>
                        <Loader2 style={{ width:24, height:24, color:'rgb(var(--primary))', animation:'spin 1s linear infinite' }} />
                      </div>
                    ) : (
                      <pre style={{ margin:0, padding:16, fontSize:12, lineHeight:1.6, fontFamily:"'JetBrains Mono', 'Fira Code', monospace", color:'rgb(var(--text-primary))', whiteSpace:'pre-wrap', wordBreak:'break-word', counterReset:'line' }}>
                        {viewFile.content.split('\n').map((line: string, i: number) => (
                          <div key={i} style={{ display:'flex', minHeight:20 }}>
                            <span style={{ width:48, flexShrink:0, textAlign:'right', paddingRight:16, color:'rgb(var(--text-muted))', userSelect:'none', opacity:0.5, fontSize:11 }}>{i + 1}</span>
                            <span style={{ flex:1 }}>{line || ' '}</span>
                          </div>
                        ))}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── File Access Audit Trail ── */}
      <div className="cx-card cx-border" style={{ marginTop: 24 }}>
        <button
          onClick={() => setShowAudit(!showAudit)}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'16px 20px', border:'none', backgroundColor:'transparent', cursor:'pointer', color:'rgb(var(--text-primary))' }}
        >
          <div className="cx-flex cx-items-center cx-gap-10">
            <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.08))', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Clock style={{ width:16, height:16, color:'rgb(var(--primary))' }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <span style={{ fontSize:14, fontWeight:700 }}>File Access Audit Trail</span>
              <p style={{ fontSize:11, color:'rgb(var(--text-muted))', margin:'2px 0 0' }}>Track who browsed and read files on your servers</p>
            </div>
          </div>
          <ChevronRight style={{ width:16, height:16, color:'rgb(var(--text-muted))', transform: showAudit ? 'rotate(90deg)' : 'none', transition:'transform 200ms' }} />
        </button>

        {showAudit && (
          <div style={{ borderTop:'1px solid rgb(var(--border))' }}>
            {/* Refresh bar */}
            <div className="cx-flex-between" style={{ padding:"10px 20px", backgroundColor:"rgba(var(--surface-hover), 0.3)" }}>
              <span style={{ fontSize:11, color:'rgb(var(--text-muted))' }}>{auditLogs.length} events loaded</span>
              <button onClick={fetchAuditLogs} className="cx-btn cx-btn-outline" style={{ padding:"4px 12px", fontSize:11 }}>
                <RefreshCw style={{ width:12, height:12 }} /> Refresh
              </button>
            </div>

            {auditLoading ? (
              <div className="cx-flex cx-justify-center" style={{ padding:30 }}>
                <Loader2 style={{ width:20, height:20, color:'rgb(var(--primary))', animation:'spin 1s linear infinite' }} />
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding:30, textAlign:'center', color:'rgb(var(--text-muted))', fontSize:13 }}>
                <Shield style={{ width:28, height:28, margin:'0 auto 8px', opacity:0.3 }} />
                <p>No file access events yet</p>
                <p style={{ fontSize:11, marginTop:4 }}>Browse or read files to see the audit trail</p>
              </div>
            ) : (
              <div style={{ maxHeight:360, overflowY:'auto' }}>
                {auditLogs.map((log: AuditLog, i: number) => {
                  const isRead = log.action === 'file_read';
                  const isMod = log.action === 'file_modified';
                  const isToggle = log.action === 'set_readonly' || log.action === 'set_readwrite';
                  const badgeColor = isMod ? '#F59E0B' : isRead ? '#6366F1' : isToggle ? '#8B5CF6' : '#10B981';
                  const badgeLabel = isMod ? 'MODIFIED' : isRead ? 'READ' : isToggle ? 'ACCESS' : 'BROWSE';
                  const timeAgo = (() => {
                    const diff = Date.now() - new Date(log.createdAt).getTime();
                    const mins = Math.floor(diff / 60000);
                    if (mins < 1) return 'just now';
                    if (mins < 60) return `${mins}m ago`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs}h ago`;
                    return `${Math.floor(hrs / 24)}d ago`;
                  })();
                  const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata || '{}') : (log.metadata || {});

                  return (
                    <div key={log.id || i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 20px', borderBottom:'1px solid rgba(var(--border), 0.5)', transition:'background 150ms' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backgroundColor: `${badgeColor}18` }}>
                        {isMod
                          ? <Edit3 style={{ width:13, height:13, color: badgeColor }} />
                          : isRead
                            ? <FileTextIcon style={{ width:13, height:13, color: badgeColor }} />
                            : isToggle
                              ? <Lock style={{ width:13, height:13, color: badgeColor }} />
                              : <FolderOpen style={{ width:13, height:13, color: badgeColor }} />
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-primary))' }}>{log.userName || 'Unknown'}</span>
                          <span style={{ fontSize:10, padding:'1px 6px', borderRadius:4, fontWeight:600, backgroundColor: `${badgeColor}14`, color: badgeColor }}>
                            {badgeLabel}
                          </span>
                          <span style={{ fontSize:10, color:'rgb(var(--text-muted))', marginLeft:'auto', flexShrink:0 }}>{timeAgo}</span>
                        </div>
                        <p style={{ fontSize:11, color:'rgb(var(--text-muted))', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.description}</p>
                        {meta.fileName && (
                          <span style={{ fontSize:10, color:'rgb(var(--text-muted))', fontFamily:"'JetBrains Mono', monospace" }}>{meta.fileName} · {meta.size ? `${(meta.size / 1024).toFixed(1)} KB` : ''} {meta.lines ? `· ${meta.lines} lines` : ''}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
