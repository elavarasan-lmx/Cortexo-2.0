'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useModal } from '@/components/modal-provider';

import {
  GitBranch, Database, Plus, Edit3, Trash2, Loader2,
  CheckCircle, XCircle, X, Server, MoreVertical, Copy, Search,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface SourceProfile {
  id: string; name: string; repoUrl: string; branch?: string;
  authType?: string; authValue?: string; notes?: string;
}
interface DbProfile {
  id: string; name: string; host: string; port?: number;
  username: string; password?: string; databaseName?: string; notes?: string;
}


/* ── Source Modal ── */
function SourceModal({ item, onClose, onSave }: { item: SourceProfile | null; onClose: () => void; onSave: (d: Partial<SourceProfile>) => Promise<void> }) {
  const [f, setF] = useState({ name: item?.name || '', repoUrl: item?.repoUrl || '', branch: item?.branch || 'main', notes: item?.notes || '' });
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'github' | 'manual'>('github');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [repos, setRepos] = useState<{id: number, name: string, url: string, cloneUrl?: string, defaultBranch?: string, private: boolean}[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  
  const [branches, setBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const u = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    let mounted = true;
    if (mode === 'github' && repos.length === 0) {
      setTimeout(() => { if (mounted) setLoadingRepos(true); }, 0);
      const token = localStorage.getItem('cortexo_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch(`${API}/credentials/github/repos`, { headers })
        .then(res => res.json())
        .then(data => {
          if (!mounted) return;
          if (data && data.data) setRepos(data.data);
        })
        .finally(() => { if (mounted) setLoadingRepos(false); });
    }
    return () => { mounted = false; };
  }, [mode, repos.length]);

  useEffect(() => {
    let mounted = true;
    let ghName = null;
    if (f.repoUrl && mode === 'github') {
       const match = f.repoUrl.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
       if (match) ghName = match[1];
    }
    if (ghName) {
      setTimeout(() => { if (mounted) setLoadingBranches(true); }, 0);
      const token = localStorage.getItem('cortexo_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch(`${API}/credentials/github/repos/${ghName}/branches`, { headers })
        .then(res => res.json())
        .then(data => {
          if (!mounted) return;
          if (data && data.data) setBranches(data.data);
        })
        .finally(() => { if (mounted) setLoadingBranches(false); });
    } else {
      setTimeout(() => { if (mounted) setBranches([]); }, 0);
    }
    return () => { mounted = false; };
  }, [f.repoUrl, mode]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <div onClick={e => { e.stopPropagation(); setDropdownOpen(false); setBranchDropdownOpen(false); }} style={{ width: '440px', borderRadius: '16px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderTop: '3px solid #818CF8', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgb(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgb(var(--surface))' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{item ? 'Edit' : 'Add'} Source Profile</h2>
          <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', cursor: 'pointer', backgroundColor: 'rgba(var(--border),0.5)', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: '13px', height: '13px' }} /></button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div><label className="cx-label">Profile Name</label><input className="cx-input cx-mono" value={f.name} onChange={e => u('name', e.target.value)} placeholder="e.g. WinBull App" /></div>

          {/* REPOSITORY SELECTION */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5px' }}>
              <label className="cx-label" style={{ marginBottom: 0 }}>Repository</label>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 600 }}>
                  <span onClick={() => setMode('github')} style={{ cursor: 'pointer', color: mode === 'github' ? '#818CF8' : 'rgb(var(--text-muted))', transition: 'color 0.2s' }}>GitHub</span>
                  <span onClick={() => setMode('manual')} style={{ cursor: 'pointer', color: mode === 'manual' ? '#818CF8' : 'rgb(var(--text-muted))', transition: 'color 0.2s' }}>Manual URL</span>
                </div>
            </div>

            {mode === 'manual' ? (
              <input className="cx-input cx-mono" value={f.repoUrl} onChange={e => u('repoUrl', e.target.value)} placeholder="git@github.com:org/repo.git" />
            ) : (
              <div style={{ position: 'relative' }}>
                <div onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); setBranchDropdownOpen(false); }} className="cx-input cx-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: 'rgba(var(--bg), 0.5)' }}>
                  <span style={{ color: f.repoUrl ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))' }}>
                    {f.repoUrl ? repos.find(r => `git@github.com:${r.name}.git` === f.repoUrl || r.url === f.repoUrl)?.name || f.repoUrl : 'Select a repository...'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{loadingRepos ? 'Loading...' : `${repos.length} repos`}</span>
                </div>
                
                {dropdownOpen && (
                  <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '10px', zIndex: 60, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid rgba(var(--border), 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', marginLeft: '4px' }} />
                      <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search repos..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none' }} />
                    </div>
                    <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>
                      {loadingRepos ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '12px' }}><Loader2 style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px', margin: '0 auto 8px' }}/> Fetching from GitHub...</div>
                      ) : repos.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '12px' }}>No repositories found. Check GitHub credentials.</div>
                      ) : repos.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(r => {
                        const url = `git@github.com:${r.name}.git`;
                        return (
                          <div key={r.id} onClick={() => { u('repoUrl', url); if (!f.name) u('name', r.name); if(r.defaultBranch) u('branch', r.defaultBranch); setDropdownOpen(false); }} style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.08)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <div className="cx-flex cx-items-center cx-gap-10">
                              <GitBranch style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
                              <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', fontWeight: 500 }}>{r.name}</span>
                            </div>
                            {r.private && <span style={{ fontSize: '9px', fontWeight: 700, color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>PRIVATE</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <label className="cx-label">Default Branch</label>
              {mode === 'github' ? (
                <div onClick={(e) => { e.stopPropagation(); setBranchDropdownOpen(!branchDropdownOpen); setDropdownOpen(false); }} className="cx-input cx-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: f.repoUrl ? 'pointer' : 'not-allowed', backgroundColor: 'rgba(var(--bg), 0.5)', opacity: f.repoUrl ? 1 : 0.5 }}>
                  <span style={{ color: f.branch ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))' }}>
                    {f.branch || 'Select branch...'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{loadingBranches ? 'Loading...' : `${branches.length} branches`}</span>
                </div>
              ) : (
                <input className="cx-input cx-mono" value={f.branch} onChange={e => u('branch', e.target.value)} placeholder="main" />
              )}
              
              {branchDropdownOpen && mode === 'github' && (
                <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '10px', zIndex: 60, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                    {loadingBranches ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '12px' }}><Loader2 style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px', margin: '0 auto 8px' }}/> Fetching branches...</div>
                    ) : branches.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '12px' }}>No branches found.</div>
                    ) : branches.map(b => (
                      <div key={b} onClick={() => { u('branch', b); setBranchDropdownOpen(false); }} style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.08)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <GitBranch style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', marginRight: '10px' }} />
                        <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', fontWeight: 500 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div><label className="cx-label">Notes (optional)</label><input className="cx-input cx-mono" value={f.notes} onChange={e => u('notes', e.target.value)} /></div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgb(var(--border))', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'rgb(var(--surface))' }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: '9px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', color: 'rgb(var(--text-secondary))' }}>Cancel</button>
          <button onClick={async () => { setSaving(true); await onSave(f); setSaving(false); onClose(); }} disabled={!f.name || !f.repoUrl || saving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px 24px', minWidth: '120px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #818CF8, #6366F1)', opacity: (!f.name || !f.repoUrl || saving) ? 0.7 : 1 }}>
            {saving && <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 0.8s linear infinite' }} />}{saving ? 'Saving...' : item ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── DB Modal ── */
function DbModal({ item, onClose, onSave }: { item: DbProfile | null; onClose: () => void; onSave: (d: Partial<DbProfile>) => Promise<void> }) {
  const [f, setF] = useState({ name: item?.name || '', host: item?.host || '', port: String(item?.port || 3306), username: item?.username || '', password: item?.password || '', databaseName: item?.databaseName || '', notes: item?.notes || '' });
  const [saving, setSaving] = useState(false);
  const u = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '400px', borderRadius: '16px', padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderTop: '3px solid #EC4899', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{item ? 'Edit' : 'Add'} DB Profile</h2>
          <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', cursor: 'pointer', backgroundColor: 'rgba(var(--border),0.5)', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: '13px', height: '13px' }} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
          <div><label className="cx-label">Profile Name</label><input className="cx-input cx-mono" value={f.name} onChange={e => u('name', e.target.value)} placeholder="Production MySQL" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div><label className="cx-label">Host</label><input className="cx-input cx-mono" value={f.host} onChange={e => u('host', e.target.value)} placeholder="192.168.1.100" /></div>
            <div><label className="cx-label">Port</label><input className="cx-input cx-mono" value={f.port} onChange={e => u('port', e.target.value)} /></div>
          </div>
          <div className="cx-grid-2-sm">
            <div><label className="cx-label">Username</label><input className="cx-input cx-mono" value={f.username} onChange={e => u('username', e.target.value)} placeholder="root" /></div>
            <div><label className="cx-label">Password</label><input type="password" className="cx-input cx-mono" value={f.password} onChange={e => u('password', e.target.value)} /></div>
          </div>
          <div><label className="cx-label">Default Database / Schema (optional)</label><input className="cx-input cx-mono" value={f.databaseName} onChange={e => u('databaseName', e.target.value)} placeholder="e.g. production_db" /></div>
          <div><label className="cx-label">Notes (optional)</label><input className="cx-input cx-mono" value={f.notes} onChange={e => u('notes', e.target.value)} /></div>
        </div>
        <div className="cx-flex cx-gap-8">
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', color: 'rgb(var(--text-secondary))' }}>Cancel</button>
          <button onClick={async () => { setSaving(true); await onSave({ ...f, port: parseInt(f.port) || 3306 }); setSaving(false); onClose(); }} disabled={!f.name || !f.host || !f.username || saving}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #EC4899, #BE185D)', opacity: (!f.name || !f.host || !f.username || saving) ? 0.7 : 1 }}>
            {saving && <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 0.8s linear infinite' }} />}{saving ? 'Saving...' : item ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function ProfilesPage() {
  useAutoLoadToken();
  const { confirm } = useModal();
  const [sources, setSources] = useState<SourceProfile[]>([]);
  const [dbs, setDbs] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [srcModal, setSrcModal] = useState<{ open: boolean; item: SourceProfile | null }>({ open: false, item: null });
  const [dbModal, setDbModal] = useState<{ open: boolean; item: DbProfile | null }>({ open: false, item: null });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const hdr = () => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('cortexo_token');
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(() => {
    Promise.all([
      fetch(`${API}/source-profiles`, { headers: hdr() }).then(r => r.json()),
      fetch(`${API}/db-profiles`, { headers: hdr() }).then(r => r.json()),
    ]).then(([s, d]) => { setSources(s.data || []); setDbs(d.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSrc = async (data: Partial<SourceProfile>) => {
    if (srcModal.item) {
      await fetch(`${API}/source-profiles/${srcModal.item.id}`, { method: 'PATCH', headers: hdr(), body: JSON.stringify(data) });
      showToast('Source profile updated');
    } else {
      await fetch(`${API}/source-profiles`, { method: 'POST', headers: hdr(), body: JSON.stringify(data) });
      showToast('Source profile created');
    }
    load();
  };

  const saveDb = async (data: Partial<DbProfile>) => {
    if (dbModal.item) {
      await fetch(`${API}/db-profiles/${dbModal.item.id}`, { method: 'PATCH', headers: hdr(), body: JSON.stringify(data) });
      showToast('DB profile updated');
    } else {
      await fetch(`${API}/db-profiles`, { method: 'POST', headers: hdr(), body: JSON.stringify(data) });
      showToast('DB profile created');
    }
    load();
  };


  const doDelete = async (id: string, name: string, type: 'source' | 'db') => {
    const ok = await confirm({
      title: 'Delete Profile',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const endpoint = type === 'source' ? 'source-profiles' : 'db-profiles';
      const token = localStorage.getItem('cortexo_token');
      const h: Record<string, string> = {};
      if (token) h['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API}/${endpoint}/${id}`, { method: 'DELETE', headers: h });
      if (!res.ok) throw new Error('Failed to delete');
      showToast(`${name} deleted`);
      load();
    } catch {
      showToast(`Error deleting ${name}`, false);
    }
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  

  const KebabMenu = ({ id, onEdit, onDelete }: { id: string; onEdit: () => void; onDelete: () => void }) => (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
      <button onClick={(e) => toggleMenu(id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px', borderRadius: '4px' }}>
        <MoreVertical style={{ width: '16px', height: '16px' }} />
      </button>
      {openMenuId === id && (
        <div style={{ position: 'absolute', top: '24px', right: '0', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '8px', padding: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '110px' }}>
           <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(null); onEdit(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'rgb(var(--text-primary))', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.3)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Edit3 style={{ width: '12px', height: '12px' }} /> Edit</button>
           <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(null); onDelete(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#EF4444', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 style={{ width: '12px', height: '12px' }} /> Delete</button>
        </div>
      )}
    </div>
  );

  return (
    <div onClick={() => setOpenMenuId(null)} style={{ minHeight: '100vh' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 60, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, backgroundColor: toast.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.ok ? '#10B981' : '#EF4444', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.ok ? <CheckCircle style={{ width: '15px', height: '15px' }} /> : <XCircle style={{ width: '15px', height: '15px' }} />}{toast.msg}
        </div>
      )}
      {srcModal.open && <SourceModal item={srcModal.item} onClose={() => setSrcModal({ open: false, item: null })} onSave={saveSrc} />}
      {dbModal.open && <DbModal item={dbModal.item} onClose={() => setDbModal({ open: false, item: null })} onSave={saveDb} />}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite', color: 'rgb(var(--primary))' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* ── Source Profiles Section ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '20px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(129,140,248,0.125), rgba(99,102,241,0.03))', border: '1px solid rgba(129,140,248,0.15)' }}>
              <div className="cx-flex cx-items-center cx-gap-14">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #818CF8, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(129,140,248,0.3)' }}>
                  <GitBranch style={{ width: '20px', height: '20px', color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0, letterSpacing: '-0.02em' }}>Source Profiles</h2>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>Git repositories & version control credentials</p>
                </div>
              </div>
              <button onClick={() => setSrcModal({ open: true, item: null })} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #818CF8, #6366F1)', boxShadow: '0 4px 14px rgba(129,140,248,0.25)', transition: 'transform 150ms, box-shadow 150ms' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(129,140,248,0.35)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(129,140,248,0.25)'; }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Source
              </button>
            </div>

            {sources.length === 0 ? (
              <div className="cx-card cx-border" style={{ padding: '40px', textAlign: 'center' }}>
                <GitBranch style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No source profiles yet — add your first Git repo</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                {sources.map(s => (
                  <div key={s.id} className="cx-card cx-border" style={{ borderLeft: '3px solid #818CF8', boxShadow: '0 4px 20px rgba(129,140,248,0.1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(129,140,248,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(129,140,248,0.1)'; e.currentTarget.style.transform = 'none'; }}>
                    <KebabMenu id={s.id} onEdit={() => setSrcModal({ open: true, item: s })} onDelete={() => doDelete(s.id, s.name, 'source')} />
                    <div style={{ padding: '16px 18px 0 18px' }}>
                      <div className="cx-flex cx-items-center cx-gap-10">
                        <div style={{ width: '36px', height: '36px', borderRadius: '9px', backgroundColor: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GitBranch style={{ width: '16px', height: '16px', color: '#818CF8' }} />
                        </div>
                        <div style={{ flex: 1, paddingRight: '24px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{s.name}</div>
                          <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{s.authType === 'ssh' ? 'SSH' : 'Token'} • {s.branch || 'main'}</div>
                        </div>
                      </div>
                      
                    </div>
                    <div style={{ padding: '12px 18px 16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '7px', backgroundColor: 'rgb(var(--surface-hover))' }}>
                        <div style={{ fontSize: '11px', fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", color: 'rgb(var(--text-secondary))', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{s.repoUrl}</div>
                        <button onClick={() => { navigator.clipboard.writeText(s.repoUrl); showToast('URL copied to clipboard'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: 'rgb(var(--text-muted))' }} title="Copy URL">
                          <Copy style={{ width: '13px', height: '13px' }} />
                        </button>
                      </div>
                      
                      {s.notes && <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '12px', borderTop: '1px solid rgb(var(--border))', paddingTop: '8px' }}>{s.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── DB Profiles Section ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '20px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(190,24,93,0.03))', border: '1px solid rgba(236,72,153,0.15)' }}>

              <div className="cx-flex cx-items-center cx-gap-14">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #EC4899, #BE185D)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(236,72,153,0.3)' }}>
                  <Database style={{ width: '20px', height: '20px', color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0, letterSpacing: '-0.02em' }}>Database Profiles</h2>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>MySQL server credentials for deployments</p>
                </div>
              </div>
              <button onClick={() => setDbModal({ open: true, item: null })} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #EC4899, #BE185D)', boxShadow: '0 4px 14px rgba(236,72,153,0.25)', transition: 'transform 150ms, box-shadow 150ms' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(236,72,153,0.35)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(236,72,153,0.25)'; }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Database
              </button>
            </div>

            {dbs.length === 0 ? (
              <div className="cx-card cx-border" style={{ padding: '40px', textAlign: 'center' }}>
                <Database style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No DB profiles yet — add your first MySQL server</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                {dbs.map(d => (
                  <div key={d.id} className="cx-card cx-border" style={{ borderLeft: '3px solid #EC4899', boxShadow: '0 4px 20px rgba(236,72,153,0.1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(236,72,153,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(236,72,153,0.1)'; e.currentTarget.style.transform = 'none'; }}>
                    <KebabMenu id={d.id} onEdit={() => setDbModal({ open: true, item: d })} onDelete={() => doDelete(d.id, d.name, 'db')} />
                    <div style={{ padding: '16px 18px 0 18px' }}>
                      <div className="cx-flex cx-items-center cx-gap-10">
                        <div style={{ width: '36px', height: '36px', borderRadius: '9px', backgroundColor: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Server style={{ width: '16px', height: '16px', color: '#EC4899' }} />
                        </div>
                        <div style={{ flex: 1, paddingRight: '24px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{d.name}</div>
                          <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>MySQL • Port {d.port || 3306}</div>
                        </div>
                      </div>
                      
                    </div>
                    <div style={{ padding: '0 18px 16px 18px' }}>
                      <div style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '7px', backgroundColor: 'rgb(var(--surface-hover))' }}>
                           <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '11px', fontFamily: "'Geist Mono', 'JetBrains Mono', monospace" }}>HOST</span>
                           <span style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{d.host}</span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '7px', backgroundColor: 'rgb(var(--surface-hover))', overflow: 'hidden' }}>
                             <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '11px', fontFamily: "'Geist Mono', 'JetBrains Mono', monospace" }}>USR</span>
                             <span style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{d.username}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '7px', backgroundColor: 'rgb(var(--surface-hover))', overflow: 'hidden' }}>
                             <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '11px', fontFamily: "'Geist Mono', 'JetBrains Mono', monospace" }}>PWD</span>
                             <span style={{ fontSize: '11px' }}>••••••••</span>
                          </div>
                        </div>
                        {d.databaseName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '7px', backgroundColor: 'rgb(var(--surface-hover))', overflow: 'hidden' }}>
                             <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '11px', fontFamily: "'Geist Mono', 'JetBrains Mono', monospace" }}>DB</span>
                             <span style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{d.databaseName}</span>
                          </div>
                        )}
                      </div>
                      
                      {d.notes && <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '12px', borderTop: '1px solid rgb(var(--border))', paddingTop: '8px' }}>{d.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
