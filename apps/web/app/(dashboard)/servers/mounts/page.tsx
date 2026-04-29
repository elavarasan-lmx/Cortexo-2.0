'use client';

import { useState, useCallback } from 'react';
import {
  HardDrive, Plus, Trash2, Edit3, Loader2, RefreshCw,
  FolderOpen, File, ChevronRight, ArrowLeft, Power, PowerOff,
  Server, Copy, X, Folder, FileCode, FileText as FileTextIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

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

/* ── Card style ── */
const cardStyle: React.CSSProperties = {
  borderRadius: 14, border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
  transition: 'box-shadow 200ms, transform 200ms', position: 'relative',
};

/* ── Button helpers ── */
const btnPrimary: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12,
  border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:'#fff',
  background:'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
  boxShadow:'0 4px 12px rgba(var(--primary), 0.3)',
};
const btnOutline: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
  border:'1px solid rgb(var(--border))', backgroundColor:'rgb(var(--surface))',
  fontSize:12, fontWeight:500, color:'rgb(var(--text-secondary))', cursor:'pointer',
};
const inputStyle: React.CSSProperties = {
  width:'100%', padding:'10px 14px', borderRadius:10, fontSize:13,
  border:'1px solid rgb(var(--border))', backgroundColor:'rgb(var(--surface))',
  color:'rgb(var(--text-primary))', outline:'none',
};

export default function ServerMountsPage() {
  useAutoLoadToken();
  const { data: mounts, loading, refetch } = useApiData(() => api.getServerMounts());
  const { data: servers } = useApiData(() => api.getServers());

  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [browsing, setBrowsing] = useState<{ mountId: number; mountName: string } | null>(null);
  const [browseData, setBrowseData] = useState<any>(null);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [viewFile, setViewFile] = useState<any>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ serverId: 0, name: '', remotePath: '', localMountPath: '', sshUser: 'ubuntu', autoMount: false });

  const setAction = (id: number, action: string) => setActionLoading(p => ({ ...p, [id]: action }));
  const clearAction = (id: number) => setActionLoading(p => { const n = { ...p }; delete n[id]; return n; });

  const handleMount = async (id: number) => {
    setAction(id, 'mounting');
    try { await api.mountServer(id); await refetch(); } catch (e: any) { alert(e.message); }
    clearAction(id);
  };

  const handleUnmount = async (id: number) => {
    setAction(id, 'unmounting');
    try { await api.unmountServer(id); await refetch(); } catch (e: any) { alert(e.message); }
    clearAction(id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this mount config?')) return;
    setAction(id, 'deleting');
    try { await api.deleteServerMount(id); await refetch(); } catch (e: any) { alert(e.message); }
    clearAction(id);
  };

  const handleCreate = async () => {
    if (!form.name || !form.remotePath || !form.localMountPath || !form.serverId) return alert('Fill all fields');
    try {
      await api.createServerMount(form);
      setShowCreate(false);
      setForm({ serverId: 0, name: '', remotePath: '', localMountPath: '', sshUser: 'ubuntu', autoMount: false });
      await refetch();
    } catch (e: any) { alert(e.message); }
  };

  const handleBrowse = async (mountId: number, mountName: string, path = '.') => {
    setBrowsing({ mountId, mountName });
    setBrowseLoading(true);
    setViewFile(null);
    try {
      const res = await api.browseServerMount(mountId, path);
      setBrowseData(res.data);
    } catch (e: any) { alert(e.message); setBrowseData(null); }
    setBrowseLoading(false);
  };

  const handleReadFile = async (mountId: number, filePath: string) => {
    setFileLoading(true);
    try {
      const res = await api.readServerFile(mountId, filePath);
      setViewFile(res.data);
    } catch (e: any) { alert(e.message); }
    setFileLoading(false);
  };

  const allMounts = (mounts as any[]) || [];
  const allServers = (servers as any[]) || [];
  const serverMap = allServers.reduce((a: any, s: any) => { a[s.id] = s; return a; }, {});

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:256 }}>
        <Loader2 style={{ width:32, height:32, color:'rgb(var(--primary))', animation:'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>Server Mounts</h1>
          <p style={{ fontSize:14, color:'rgb(var(--text-secondary))', marginTop:4 }}>
            {allMounts.length} mount{allMounts.length !== 1 ? 's' : ''} · SSHFS remote file access
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={refetch} style={btnOutline}><RefreshCw style={{ width:14, height:14 }} /> Refresh</button>
          <button onClick={() => setShowCreate(true)} style={btnPrimary}><Plus style={{ width:16, height:16 }} /> Add Mount</button>
        </div>
      </div>

      {/* Mount Cards Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(380px, 1fr))', gap:14, marginBottom:24 }}>
        {allMounts.map((m: any) => {
          const srv = serverMap[m.serverId];
          const isMounted = m.status === 'mounted';
          const accentColor = isMounted ? '#10B981' : '#6B7280';
          const act = actionLoading[m.id];

          return (
            <div key={m.id} style={cardStyle}
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
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                      {srv && <span style={{ fontSize:12, color:'rgb(var(--text-muted))', fontFamily:"'JetBrains Mono', monospace" }}>{srv.privateIp || srv.publicAddress}</span>}
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  <button title="Delete" onClick={() => handleDelete(m.id)} style={{ padding:6, borderRadius:6, border:'none', backgroundColor:'transparent', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                    <Trash2 style={{ width:14, height:14 }} />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding:'14px 18px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                  <div>
                    <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase', letterSpacing:'0.05em' }}>Remote Path</span>
                    <p style={{ fontSize:12, fontFamily:"'JetBrains Mono', monospace", color:'rgb(var(--text-primary))', margin:'2px 0 0', wordBreak:'break-all' }}>{m.remotePath}</p>
                  </div>
                  <div>
                    <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase', letterSpacing:'0.05em' }}>SSH User</span>
                    <p style={{ fontSize:12, fontFamily:"'JetBrains Mono', monospace", color:'rgb(var(--text-primary))', margin:'2px 0 0' }}>{m.sshUser}</p>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase', letterSpacing:'0.05em' }}>Local Mount</span>
                  <p style={{ fontSize:12, fontFamily:"'JetBrains Mono', monospace", color:'rgb(var(--text-primary))', margin:'2px 0 0', wordBreak:'break-all' }}>{m.localMountPath}</p>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  {isMounted ? (
                    <>
                      <button onClick={() => handleUnmount(m.id)} disabled={!!act}
                        style={{ ...btnOutline, flex:1, justifyContent:'center', borderColor:'#EF4444', color:'#EF4444' }}>
                        {act === 'unmounting' ? <Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }} /> : <PowerOff style={{ width:14, height:14 }} />}
                        Unmount
                      </button>
                      <button onClick={() => handleBrowse(m.id, m.name)}
                        style={{ ...btnOutline, flex:1, justifyContent:'center', borderColor:'rgb(var(--primary))', color:'rgb(var(--primary))' }}>
                        <FolderOpen style={{ width:14, height:14 }} /> Browse
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleMount(m.id)} disabled={!!act}
                      style={{ ...btnPrimary, flex:1, justifyContent:'center', padding:'8px 14px', fontSize:12, borderRadius:10 }}>
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
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>Add Server Mount</h2>
              <button onClick={() => setShowCreate(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgb(var(--text-muted))' }}><X style={{ width:18, height:18 }} /></button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4 }}>Server</label>
                <select value={form.serverId} onChange={e => setForm(p => ({ ...p, serverId: parseInt(e.target.value) }))}
                  style={{ ...inputStyle, cursor:'pointer' }}>
                  <option value={0}>Select a server...</option>
                  {allServers.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.privateIp})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4 }}>Mount Name</label>
                <input placeholder="e.g. RubySilver" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4 }}>Remote Path</label>
                <input placeholder="/var/www/html/rubysilver" value={form.remotePath} onChange={e => setForm(p => ({ ...p, remotePath: e.target.value }))} style={{ ...inputStyle, fontFamily:"'JetBrains Mono', monospace", fontSize:12 }} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4 }}>Local Mount Path</label>
                <input placeholder="~/ec2-rubysilver" value={form.localMountPath} onChange={e => setForm(p => ({ ...p, localMountPath: e.target.value }))} style={{ ...inputStyle, fontFamily:"'JetBrains Mono', monospace", fontSize:12 }} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4 }}>SSH User</label>
                <input placeholder="ubuntu" value={form.sshUser} onChange={e => setForm(p => ({ ...p, sshUser: e.target.value }))} style={inputStyle} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgb(var(--text-secondary))', cursor:'pointer' }}>
                <input type="checkbox" checked={form.autoMount} onChange={e => setForm(p => ({ ...p, autoMount: e.target.checked }))} style={{ accentColor:'rgb(var(--primary))' }} />
                Auto-mount on startup
              </label>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={btnOutline}>Cancel</button>
              <button onClick={handleCreate} style={btnPrimary}>Create Mount</button>
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
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <FolderOpen style={{ width:18, height:18, color:'rgb(var(--primary))' }} />
                <span style={{ fontSize:15, fontWeight:700, color:'rgb(var(--text-primary))' }}>{browsing.mountName}</span>
                {browseData && (
                  <span style={{ fontSize:12, color:'rgb(var(--text-muted))', fontFamily:"'JetBrains Mono', monospace" }}>
                    /{browseData.currentPath === '.' ? '' : browseData.currentPath}
                  </span>
                )}
              </div>
              <button onClick={() => { setBrowsing(null); setBrowseData(null); setViewFile(null); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                <X style={{ width:18, height:18 }} />
              </button>
            </div>

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
                  <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                    <Loader2 style={{ width:24, height:24, color:'rgb(var(--primary))', animation:'spin 1s linear infinite' }} />
                  </div>
                ) : browseData?.entries?.map((entry: any, i: number) => (
                  <button key={i}
                    onClick={() => {
                      if (entry.isDirectory) handleBrowse(browsing.mountId, browsing.mountName, entry.path);
                      else handleReadFile(browsing.mountId, entry.path);
                    }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 16px', border:'none', borderBottom:'1px solid rgba(var(--border), 0.5)', backgroundColor: viewFile?.filePath === entry.path ? 'rgba(var(--primary), 0.08)' : 'transparent', cursor:'pointer', color:'rgb(var(--text-primary))', fontSize:13, textAlign:'left', transition:'background 150ms' }}
                    onMouseEnter={e => { if (viewFile?.filePath !== entry.path) e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                    onMouseLeave={e => { if (viewFile?.filePath !== entry.path) e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <FileIcon type={viewFile.type} />
                      <span style={{ fontSize:13, fontWeight:600, color:'rgb(var(--text-primary))' }}>{viewFile.fileName}</span>
                      <span style={{ fontSize:11, color:'rgb(var(--text-muted))' }}>{viewFile.lines} lines · {fmtSize(viewFile.size)}</span>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => { navigator.clipboard.writeText(viewFile.content); }}
                        style={{ ...btnOutline, padding:'4px 10px', fontSize:11 }}>
                        <Copy style={{ width:12, height:12 }} /> Copy
                      </button>
                      <button onClick={() => setViewFile(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                        <X style={{ width:16, height:16 }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ flex:1, overflow:'auto', padding:0 }}>
                    {fileLoading ? (
                      <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
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
    </div>
  );
}
