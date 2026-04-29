'use client';

import { useState } from 'react';
import {
  GitBranch, Plus, Trash2, Edit3, Loader2, RefreshCw,
  Globe, Database, Server, X, ExternalLink, Search,
  Code2, Wifi, Settings2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

/* ── Shared styles ── */
const cardStyle: React.CSSProperties = {
  borderRadius: 14, border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
  transition: 'box-shadow 200ms, transform 200ms', position: 'relative',
};
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
const labelStyle: React.CSSProperties = {
  fontSize:12, fontWeight:600, color:'rgb(var(--text-secondary))', display:'block', marginBottom:4,
};
const monoStyle: React.CSSProperties = {
  fontFamily:"'JetBrains Mono', monospace", fontSize:12,
};
const tagStyle = (bg: string, fg: string): React.CSSProperties => ({
  display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px',
  borderRadius:6, fontSize:10, fontWeight:600, backgroundColor:bg, color:fg,
});

/* ── Framework color map ── */
const fwColors: Record<string, { bg: string; fg: string }> = {
  CodeIgniter: { bg: 'rgba(221,72,30,0.12)', fg: '#DD481E' },
  Laravel:     { bg: 'rgba(255,45,32,0.12)', fg: '#FF2D20' },
  React:       { bg: 'rgba(97,218,251,0.12)', fg: '#61DAFB' },
  NextJS:      { bg: 'rgba(255,255,255,0.12)', fg: '#999' },
  Flutter:     { bg: 'rgba(2,169,244,0.12)', fg: '#02A9F4' },
};

/* ── Detail row component ── */
function DetailRow({ icon, label, value, mono, link }: { icon: React.ReactNode; label: string; value: string | null; mono?: boolean; link?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6 }}>
      <span style={{ flexShrink:0, marginTop:2, color:'rgb(var(--text-muted))' }}>{icon}</span>
      <div style={{ minWidth:0 }}>
        <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'rgb(var(--primary))', textDecoration:'none', marginTop:1, wordBreak:'break-all', ...(mono ? monoStyle : {}) }}>
            {value} <ExternalLink style={{ width:10, height:10, flexShrink:0 }} />
          </a>
        ) : (
          <p style={{ fontSize:12, color:'rgb(var(--text-primary))', margin:'1px 0 0', wordBreak:'break-all', ...(mono ? monoStyle : {}) }}>{value}</p>
        )}
      </div>
    </div>
  );
}

const emptyForm = {
  projectId:'', serverId:'', clientSlug:'', domain:'', protocol:'https',
  deployPath:'', deployUser:'ubuntu', dbHost:'', dbName:'', dbUser:'', dbPort:3306,
  gitRepo:'', gitBranch:'main', appFramework:'CodeIgniter', appVersion:'',
  socketIoPort:'', wsPort:'', ratePort:'', notes:'',
};

export default function DeploySourcesPage() {
  useAutoLoadToken();
  const { data: configs, loading, refetch } = useApiData(() => api.getDeployConfigs());
  const { data: projects } = useApiData(() => api.getProjects());
  const { data: servers } = useApiData(() => api.getServers());

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const allConfigs = (configs as any[]) || [];
  const allProjects = (projects as any[]) || [];
  const allServers = (servers as any[]) || [];

  const filtered = search
    ? allConfigs.filter((c: any) =>
        (c.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.clientSlug || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.domain || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.serverName || '').toLowerCase().includes(search.toLowerCase())
      )
    : allConfigs;

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({
      projectId: c.projectId || '', serverId: c.serverId || '',
      clientSlug: c.clientSlug || '', domain: c.domain || '', protocol: c.protocol || 'https',
      deployPath: c.deployPath || '', deployUser: c.deployUser || 'ubuntu',
      dbHost: c.dbHost || '', dbName: c.dbName || '', dbUser: c.dbUser || '', dbPort: c.dbPort || 3306,
      gitRepo: c.gitRepo || '', gitBranch: c.gitBranch || 'main',
      appFramework: c.appFramework || '', appVersion: c.appVersion || '',
      socketIoPort: c.socketIoPort || '', wsPort: c.wsPort || '', ratePort: c.ratePort || '',
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.projectId) return alert('Select a project');
    setSaving(true);
    const payload = {
      ...form,
      serverId: form.serverId ? parseInt(form.serverId) : null,
      dbPort: parseInt(form.dbPort) || 3306,
      socketIoPort: form.socketIoPort ? parseInt(form.socketIoPort) : null,
      wsPort: form.wsPort ? parseInt(form.wsPort) : null,
      ratePort: form.ratePort ? parseInt(form.ratePort) : null,
    };
    try {
      if (editId) await api.updateDeployConfig(editId, payload);
      else await api.createDeployConfig(payload);
      setShowModal(false);
      await refetch();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this deploy config?')) return;
    try { await api.deleteDeployConfig(id); await refetch(); } catch (e: any) { alert(e.message); }
  };

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
          <h1 style={{ fontSize:24, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>Deploy Sources</h1>
          <p style={{ fontSize:14, color:'rgb(var(--text-secondary))', marginTop:4 }}>
            {allConfigs.length} config{allConfigs.length !== 1 ? 's' : ''} · Git, Database & Deploy settings for CI/CD
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ position:'relative' }}>
            <Search style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'rgb(var(--text-muted))' }} />
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft:32, width:200 }} />
          </div>
          <button onClick={refetch} style={btnOutline}><RefreshCw style={{ width:14, height:14 }} /> Refresh</button>
          <button onClick={openCreate} style={btnPrimary}><Plus style={{ width:16, height:16 }} /> Add Config</button>
        </div>
      </div>

      {/* Config Cards Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', gap:14 }}>
        {filtered.map((c: any) => {
          const fw = fwColors[c.appFramework] || { bg:'rgba(107,114,128,0.12)', fg:'#6B7280' };
          const accent = '#8B5CF6';
          return (
            <div key={c.id} style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px -8px ${accent}20, 0 4px 12px rgba(0,0,0,0.15)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ height:3, background:`linear-gradient(90deg, ${accent}, #06B6D4)`, position:'absolute', top:0, left:0, right:0 }} />

              {/* Card Header */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'18px 18px 12px', borderBottom:'1px solid rgb(var(--border))' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:`linear-gradient(135deg, ${accent}20, ${accent}08)`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <GitBranch style={{ width:20, height:20, color:accent }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>{c.projectName || c.clientSlug || 'Unnamed'}</h3>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4, flexWrap:'wrap' }}>
                      {c.clientSlug && <span style={{ ...monoStyle, fontSize:11, color:'rgb(var(--text-muted))' }}>{c.clientSlug}</span>}
                      {c.appFramework && <span style={tagStyle(fw.bg, fw.fg)}>{c.appFramework}</span>}
                      {c.appVersion && <span style={tagStyle('rgba(16,185,129,0.12)', '#10B981')}>v{c.appVersion}</span>}
                      {c.serverName && <span style={tagStyle('rgba(99,102,241,0.12)', '#6366F1')}>{c.serverName}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  <button title="Edit" onClick={() => openEdit(c)} style={{ padding:6, borderRadius:6, border:'none', backgroundColor:'transparent', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                    <Edit3 style={{ width:14, height:14 }} />
                  </button>
                  <button title="Delete" onClick={() => handleDelete(c.id)} style={{ padding:6, borderRadius:6, border:'none', backgroundColor:'transparent', cursor:'pointer', color:'rgb(var(--text-muted))' }}>
                    <Trash2 style={{ width:14, height:14 }} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding:'14px 18px' }}>
                <DetailRow icon={<GitBranch style={{ width:13, height:13 }} />} label="Git Repository" value={c.gitRepo} link mono />
                <DetailRow icon={<Code2 style={{ width:13, height:13 }} />} label="Branch" value={c.gitBranch} mono />
                <DetailRow icon={<Globe style={{ width:13, height:13 }} />} label="Domain" value={c.domain ? `${c.protocol || 'https'}://${c.domain}` : null} link />
                <DetailRow icon={<Server style={{ width:13, height:13 }} />} label="Deploy Path" value={c.deployPath} mono />
                <DetailRow icon={<Database style={{ width:13, height:13 }} />} label="Database" value={c.dbName ? `${c.dbUser}@${c.dbHost || 'localhost'}/${c.dbName}` : null} mono />
                {(c.socketIoPort || c.wsPort || c.ratePort) && (
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                    <Wifi style={{ width:13, height:13, color:'rgb(var(--text-muted))' }} />
                    <span style={{ fontSize:10, fontWeight:600, color:'rgb(var(--text-muted))', textTransform:'uppercase' }}>Ports</span>
                    <span style={{ ...monoStyle, fontSize:11, color:'rgb(var(--text-primary))', marginLeft:4 }}>
                      {[c.socketIoPort && `SIO:${c.socketIoPort}`, c.wsPort && `WS:${c.wsPort}`, c.ratePort && `Rate:${c.ratePort}`].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn:'1 / -1', textAlign:'center', padding:60, color:'rgb(var(--text-muted))' }}>
            <Settings2 style={{ width:48, height:48, margin:'0 auto 12px', opacity:0.3 }} />
            <p style={{ fontSize:15, fontWeight:600 }}>{search ? 'No matching configs' : 'No deploy configs yet'}</p>
            <p style={{ fontSize:13, marginTop:4 }}>Click "Add Config" to set up Git, DB & deploy settings</p>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ width:640, maxHeight:'90vh', overflow:'auto', borderRadius:16, backgroundColor:'rgb(var(--surface))', border:'1px solid rgb(var(--border))', boxShadow:'0 24px 48px rgba(0,0,0,0.25)', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>{editId ? 'Edit' : 'Add'} Deploy Config</h2>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgb(var(--text-muted))' }}><X style={{ width:18, height:18 }} /></button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Project + Server */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Project *</label>
                  <select value={form.projectId} onChange={e => setForm((p: any) => ({ ...p, projectId: e.target.value }))} style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="">Select project...</option>
                    {allProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Server</label>
                  <select value={form.serverId} onChange={e => setForm((p: any) => ({ ...p, serverId: e.target.value }))} style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="">Select server...</option>
                    {allServers.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.privateIp})</option>)}
                  </select>
                </div>
              </div>

              {/* Client slug + framework */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Client Slug</label>
                  <input placeholder="e.g. rubysilver" value={form.clientSlug} onChange={e => setForm((p: any) => ({ ...p, clientSlug: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>Framework</label>
                  <select value={form.appFramework} onChange={e => setForm((p: any) => ({ ...p, appFramework: e.target.value }))} style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="">Select...</option>
                    {['CodeIgniter','Laravel','React','NextJS','Flutter','Node.js','Other'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Section: Git */}
              <div style={{ fontSize:12, fontWeight:700, color:'rgb(var(--primary))', borderBottom:'1px solid rgb(var(--border))', paddingBottom:4, marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                <GitBranch style={{ width:14, height:14 }} /> Source Control
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Git Repository URL</label>
                  <input placeholder="https://github.com/org/repo" value={form.gitRepo} onChange={e => setForm((p: any) => ({ ...p, gitRepo: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>Branch</label>
                  <input placeholder="main" value={form.gitBranch} onChange={e => setForm((p: any) => ({ ...p, gitBranch: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>App Version</label>
                <input placeholder="1.0.0" value={form.appVersion} onChange={e => setForm((p: any) => ({ ...p, appVersion: e.target.value }))} style={{ ...inputStyle, width:160 }} />
              </div>

              {/* Section: Database */}
              <div style={{ fontSize:12, fontWeight:700, color:'rgb(var(--primary))', borderBottom:'1px solid rgb(var(--border))', paddingBottom:4, marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                <Database style={{ width:14, height:14 }} /> Database
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>DB Host</label>
                  <input placeholder="localhost" value={form.dbHost} onChange={e => setForm((p: any) => ({ ...p, dbHost: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>DB Name</label>
                  <input placeholder="mydb" value={form.dbName} onChange={e => setForm((p: any) => ({ ...p, dbName: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>DB User</label>
                  <input placeholder="root" value={form.dbUser} onChange={e => setForm((p: any) => ({ ...p, dbUser: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
              </div>

              {/* Section: Deploy */}
              <div style={{ fontSize:12, fontWeight:700, color:'rgb(var(--primary))', borderBottom:'1px solid rgb(var(--border))', paddingBottom:4, marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                <Server style={{ width:14, height:14 }} /> Deployment
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Protocol</label>
                  <select value={form.protocol} onChange={e => setForm((p: any) => ({ ...p, protocol: e.target.value }))} style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="https">HTTPS</option>
                    <option value="http">HTTP</option>
                  </select>
                </div>
                <div style={{ gridColumn:'span 2' }}>
                  <label style={labelStyle}>Domain</label>
                  <input placeholder="www.example.com" value={form.domain} onChange={e => setForm((p: any) => ({ ...p, domain: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Deploy Path</label>
                  <input placeholder="/var/www/html/project" value={form.deployPath} onChange={e => setForm((p: any) => ({ ...p, deployPath: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>Deploy User</label>
                  <input placeholder="ubuntu" value={form.deployUser} onChange={e => setForm((p: any) => ({ ...p, deployUser: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Section: Ports */}
              <div style={{ fontSize:12, fontWeight:700, color:'rgb(var(--primary))', borderBottom:'1px solid rgb(var(--border))', paddingBottom:4, marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                <Wifi style={{ width:14, height:14 }} /> Ports (Optional)
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Socket.IO Port</label>
                  <input placeholder="3001" value={form.socketIoPort} onChange={e => setForm((p: any) => ({ ...p, socketIoPort: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>WebSocket Port</label>
                  <input placeholder="8080" value={form.wsPort} onChange={e => setForm((p: any) => ({ ...p, wsPort: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>Rate Port</label>
                  <input placeholder="9001" value={form.ratePort} onChange={e => setForm((p: any) => ({ ...p, ratePort: e.target.value }))} style={{ ...inputStyle, ...monoStyle }} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))}
                  style={{ ...inputStyle, minHeight:60, resize:'vertical' }} />
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={btnOutline}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                {saving && <Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }} />}
                {editId ? 'Update' : 'Create'} Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
