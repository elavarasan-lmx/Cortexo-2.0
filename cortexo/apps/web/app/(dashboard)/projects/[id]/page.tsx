'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { api } from '@/lib/api';
import {
  ArrowLeft, GitBranch, Loader2,
  CheckCircle, Edit3, Trash2, Save,
  ExternalLink, Copy, Github, Globe, Database, Radio, Server,
  Eye, EyeOff
} from 'lucide-react';
import { useModal } from '@/components/modal-provider';
import { useToastStore } from '@/lib/toast-store';

const feedLabels: Record<string, string> = { '0': 'PHP Encryption', '1': 'Broadcast', '2': 'Text File', '3': 'WebSocket', '4': 'Native Socket' };
const wsLabels: Record<string, string> = { '1': 'Socket.io', '2': 'Native WebSocket' };

interface SettingsForm {
  clientSlug: string; productType: string; androidVersion: string; iosVersion: string;
  domain: string; webBaseUrl: string; adminBaseUrl: string; appBaseUrl: string; adminUser: string; adminPassword: string;
  dbHost: string; dbPort: string; dbName: string; dbUser: string; dbPassword: string;
  rateFeed: string; websocketType: string; socketBaseUrl: string; nativeSocketUrl: string; wsPort: string; socketIoPort: string;
  environment: string; serverPath: string; serverId: string;
}

function parseSettings(p: Record<string, unknown>): SettingsForm {
  let s: Record<string, unknown> = {};
  try { s = typeof p.settings === 'string' ? JSON.parse(p.settings as string) : (p.settings || {}); } catch { /* */ }
  const db = (s.database || {}) as Record<string, string>;
  const sk = (s.socket || {}) as Record<string, string>;
  const dp = (s.deploy || {}) as Record<string, string>;
  return {
    clientSlug: String(s.clientSlug || ''), productType: String(s.productType || 'lite'),
    androidVersion: String(s.androidVersion || ''), iosVersion: String(s.iosVersion || ''),
    domain: String(s.domain || ''), webBaseUrl: String(s.webBaseUrl || ''), adminBaseUrl: String(s.adminBaseUrl || ''),
    appBaseUrl: String(s.appBaseUrl || ''), adminUser: String(s.adminUser || ''), adminPassword: String(s.adminPassword || ''),
    dbHost: db.host || '', dbPort: db.port || '3306', dbName: db.name || '', dbUser: db.user || '', dbPassword: db.password || '',
    rateFeed: sk.rateFeed || '4', websocketType: sk.websocketType || '2', socketBaseUrl: sk.socketBaseUrl || '', nativeSocketUrl: sk.nativeSocketUrl || '', wsPort: sk.wsPort || '', socketIoPort: sk.socketIoPort || '',
    environment: dp.environment || 'production', serverPath: dp.serverPath || '', serverId: dp.serverId || '',
  };
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useAutoLoadToken();
  const { id } = use(params);
  const router = useRouter();
  const { data: project, loading, refetch } = useApiData(() => api.getProject(id), [id]);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showDbPass, setShowDbPass] = useState(false);

  // Fetch server name for display
  const { data: servers } = useApiData(() => api.getServers(), []);
  const serverList = Array.isArray(servers) ? servers : ((servers as any)?.data || []);

  const [form, setForm] = useState<SettingsForm & { name: string; repoUrl: string; defaultBranch: string }>({
    name: '', repoUrl: '', defaultBranch: 'main',
    clientSlug: '', productType: 'lite', androidVersion: '', iosVersion: '',
    domain: '', webBaseUrl: '', adminBaseUrl: '', appBaseUrl: '', adminUser: '', adminPassword: '',
    dbHost: '', dbPort: '3306', dbName: '', dbUser: '', dbPassword: '',
    rateFeed: '4', websocketType: '2', socketBaseUrl: '', nativeSocketUrl: '', wsPort: '', socketIoPort: '',
    environment: 'production', serverPath: '', serverId: '',
  });

  const p = project as Record<string, unknown> | null;
  const s = p ? parseSettings(p) : form;
  const serverName = s.serverId ? serverList.find((sv: any) => String(sv.id) === String(s.serverId))?.name || `Server ${s.serverId}` : '—';

  const startEdit = () => {
    if (!p) return;
    const parsed = parseSettings(p);
    setForm({ ...parsed, name: String(p.name || ''), repoUrl: String(p.repoUrl || ''), defaultBranch: String(p.defaultBranch || 'main') });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const settings = JSON.stringify({
        clientSlug: form.clientSlug, productType: form.productType,
        androidVersion: form.androidVersion, iosVersion: form.iosVersion,
        domain: form.domain, webBaseUrl: form.webBaseUrl, adminBaseUrl: form.adminBaseUrl,
        appBaseUrl: form.appBaseUrl, adminUser: form.adminUser, adminPassword: form.adminPassword,
        database: { host: form.dbHost, port: form.dbPort, name: form.dbName, user: form.dbUser, password: form.dbPassword },
        socket: { rateFeed: form.rateFeed, websocketType: form.websocketType, wsPort: form.wsPort, socketIoPort: form.socketIoPort, socketBaseUrl: form.socketBaseUrl, nativeSocketUrl: form.nativeSocketUrl },
        deploy: { environment: form.environment, serverPath: form.serverPath, serverId: form.serverId },
      });
      await api.updateProject(id, { name: form.name, repoUrl: form.repoUrl || undefined, defaultBranch: form.defaultBranch, settings } as Record<string, unknown>);
      setEditing(false);
      refetch();
      useToastStore.getState().success('Project Saved', `${form.name} settings updated`);
    } catch { useToastStore.getState().error('Save Failed', 'Could not save project settings'); }
    setSaving(false);
  };

  const { confirm: confirmModal } = useModal();

  const handleDelete = async () => {
    if (!p) return;
    const ok = await confirmModal({ title: 'Delete Project', message: `Delete "${p.name}"? This cannot be undone.`, variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    try { await api.deleteProject(id); useToastStore.getState().success('Project Deleted', `${p.name} has been removed`); router.push('/projects'); } catch { useToastStore.getState().error('Failed', 'Could not delete project'); }
  };

  const copyKey = () => {
    if (p?.sdkApiKey) { navigator.clipboard.writeText(String(p.sdkApiKey)); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const u = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  if (loading) return (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} /></div>);
  if (!p) return (<div style={{ textAlign: 'center', padding: '100px 0' }}><p style={{ fontSize: '15px', color: 'rgb(var(--text-muted))' }}>Project not found</p><button onClick={() => router.push('/projects')} style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--primary))', cursor: 'pointer', fontSize: '13px' }}>← Back to Projects</button></div>);

  const productColor = (editing ? form.productType : s.productType) === 'trade' ? '#F59E0B' : '#10B981';
  const productLabel = (editing ? form.productType : s.productType) === 'trade' ? 'Winbull Trade' : 'Winbull Lite';

  // Helper: show value or input
  const field = (key: string, val: string, placeholder?: string) =>
    editing ? <input className="cx-input" value={(form as unknown as Record<string, string>)[key] || ''} onChange={e => u(key, e.target.value)} placeholder={placeholder} />
    : <span className="cx-value">{val || '—'}</span>;

  return (
    <div>
      <div className="cx-flex-between" style={{ marginBottom: "20px" }}>
        <button onClick={() => router.push('/projects')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Projects
        </button>
      </div>

      <div className="cx-card cx-border" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              {editing ? <input className="cx-input" style={{ fontSize: "18px", fontWeight: 700, fontFamily: "inherit", padding: "6px 12px" }} value={form.name} onChange={e => u('name', e.target.value)} />
                : <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{String(p.name)}</h1>}
              <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: `${productColor}15`, color: productColor, border: `1px solid ${productColor}30` }}>
                {productLabel}
              </span>
              {p.repoProvider ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, backgroundColor: 'rgba(var(--primary),0.08)', color: 'rgb(var(--primary))' }}>
                  {p.repoProvider === 'github' ? <Github style={{ width: '11px', height: '11px' }} /> : <Globe style={{ width: '11px', height: '11px' }} />}
                  {String(p.repoProvider)}
                </span>
              ) : null}
            </div>
            {!editing && p.repoUrl ? (
              <a href={String(p.repoUrl)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--primary))', textDecoration: 'none' }}>
                <GitBranch style={{ width: '13px', height: '13px' }} /> {String(p.repoUrl)} <ExternalLink style={{ width: '11px', height: '11px' }} />
              </a>
            ) : null}
            {!editing && (s.domain || s.androidVersion || s.iosVersion) && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                {s.domain && <div><span style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>Domain</span><p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgb(var(--primary))' }}>{s.domain}</p></div>}
                {s.androidVersion && <div><span style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>Android</span><p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgb(var(--text-primary))' }}>v{s.androidVersion}</p></div>}
                {s.iosVersion && <div><span style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>iOS</span><p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgb(var(--text-primary))' }}>v{s.iosVersion}</p></div>}
              </div>
            )}
          </div>
          {/* Action buttons - right corner */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {editing ? (
              <>
                <button onClick={saveEdit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', opacity: saving ? 0.7 : 1 }}>
                  {saving ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '13px', height: '13px' }} />}
                  {saving ? 'Saving…' : 'Save All'}
                </button>
                <button onClick={() => setEditing(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
              </>
            ) : (
              <>
                <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-secondary))', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                  <Edit3 style={{ width: '13px', height: '13px' }} /> Edit
                </button>
                <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                  <Trash2 style={{ width: '13px', height: '13px' }} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Config Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Client Info */}
        <div className="cx-card cx-border" style={{ padding: '20px' }}>
          <h3 className="cx-sec-head"><Globe style={{ width: '14px', height: '14px', color: 'rgb(var(--primary))' }} /> Client Info</h3>
          <div className="cx-row"><span className="cx-label">Slug</span>{field('clientSlug', s.clientSlug, 'e.g. vijaybullion')}</div>
          <div className="cx-row"><span className="cx-label">Product</span>
            {editing ? (
              <div className="cx-flex cx-gap-6">
                {(['lite', 'trade'] as const).map(t => (
                  <button key={t} onClick={() => u('productType', t)} style={{ padding: '4px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: form.productType === t ? `1.5px solid ${t === 'trade' ? '#F59E0B' : '#10B981'}` : '1px solid rgb(var(--border))', backgroundColor: form.productType === t ? `${t === 'trade' ? '#F59E0B' : '#10B981'}15` : 'transparent', color: form.productType === t ? (t === 'trade' ? '#F59E0B' : '#10B981') : 'rgb(var(--text-muted))' }}>{t === 'trade' ? 'Trade' : 'Lite'}</button>
                ))}
              </div>
            ) : <span className="cx-value" style={{ fontFamily: "inherit", fontWeight: 600, color: productColor }}>{productLabel}</span>}
          </div>
          <div className="cx-row"><span className="cx-label">Android Ver</span>{field('androidVersion', s.androidVersion, '1.0.0')}</div>
          <div className="cx-row"><span className="cx-label">iOS Ver</span>{field('iosVersion', s.iosVersion, '1.0.0')}</div>
          <div className="cx-row"><span className="cx-label">Repo</span>{field('repoUrl', String(p.repoUrl || ''), 'https://github.com/...')}</div>
          <div className="cx-row" style={{ borderBottom: "none" }}><span className="cx-label">Branch</span>{field('defaultBranch', String(p.defaultBranch || 'main'), 'main')}</div>
        </div>

        {/* Domain & URLs */}
        <div className="cx-card cx-border" style={{ padding: '20px' }}>
          <h3 className="cx-sec-head"><ExternalLink style={{ width: '14px', height: '14px', color: 'rgb(var(--primary))' }} /> Domain & URLs</h3>
          <div className="cx-row"><span className="cx-label">Domain</span>{field('domain', s.domain, 'vijaybullion.com')}</div>
          <div className="cx-row"><span className="cx-label">Web URL</span>{field('webBaseUrl', s.webBaseUrl, 'http://www.domain.com/')}</div>
          <div className="cx-row"><span className="cx-label">Admin URL</span>{field('adminBaseUrl', s.adminBaseUrl, 'http://www.domain.com/admin/')}</div>
          <div className="cx-row"><span className="cx-label">Mobile API</span>{field('appBaseUrl', s.appBaseUrl, 'http://www.domain.com/mobileapi/')}</div>
          <div className="cx-row"><span className="cx-label">Admin User</span>{field('adminUser', s.adminUser, 'admin')}</div>
          <div className="cx-row" style={{ borderBottom: "none" }}><span className="cx-label">Admin Pass</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
              {editing ? <input type={showAdminPass ? 'text' : 'password'} className="cx-input" style={{ flex: 1 }} value={form.adminPassword} onChange={e => u('adminPassword', e.target.value)} placeholder="••••••••" />
              : <span className="cx-value" style={{ flex: 1 }}>{s.adminPassword ? (showAdminPass ? s.adminPassword : '•'.repeat(8)) : '—'}</span>}
              {s.adminPassword && (
                <button onClick={() => setShowAdminPass(!showAdminPass)} style={{ padding: '4px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', display: 'flex', flexShrink: 0 }} title={showAdminPass ? 'Hide' : 'Show'}>
                  {showAdminPass ? <EyeOff style={{ width: '13px', height: '13px' }} /> : <Eye style={{ width: '13px', height: '13px' }} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MySQL Database */}
        <div className="cx-card cx-border" style={{ padding: '20px' }}>
          <h3 className="cx-sec-head"><Database style={{ width: '14px', height: '14px', color: '#00758F' }} /> MySQL Database</h3>
          <div className="cx-row"><span className="cx-label">Host</span>{field('dbHost', s.dbHost, 'localhost')}</div>
          <div className="cx-row"><span className="cx-label">Port</span>{field('dbPort', s.dbPort, '3306')}</div>
          <div className="cx-row"><span className="cx-label">Database</span>{field('dbName', s.dbName, 'client_db')}</div>
          <div className="cx-row"><span className="cx-label">Username</span>{field('dbUser', s.dbUser, 'root')}</div>
          <div className="cx-row" style={{ borderBottom: "none" }}><span className="cx-label">Password</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
              {editing ? <input type={showDbPass ? 'text' : 'password'} className="cx-input" style={{ flex: 1 }} value={form.dbPassword} onChange={e => u('dbPassword', e.target.value)} placeholder="••••••••" />
              : <span className="cx-value" style={{ flex: 1 }}>{s.dbPassword ? (showDbPass ? s.dbPassword : '•'.repeat(8)) : '—'}</span>}
              {s.dbPassword && (
                <button onClick={() => setShowDbPass(!showDbPass)} style={{ padding: '4px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', display: 'flex', flexShrink: 0 }} title={showDbPass ? 'Hide' : 'Show'}>
                  {showDbPass ? <EyeOff style={{ width: '13px', height: '13px' }} /> : <Eye style={{ width: '13px', height: '13px' }} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rate & Socket */}
        <div className="cx-card cx-border" style={{ padding: '20px' }}>
          <h3 className="cx-sec-head"><Radio style={{ width: '14px', height: '14px', color: '#818CF8' }} /> Rate & Socket</h3>

          <div className="cx-row"><span className="cx-label">WS Port</span>{field('wsPort', s.wsPort, '7124')}</div>
          <div className="cx-row"><span className="cx-label">Socket.io Port</span>{field('socketIoPort', s.socketIoPort, '7125')}</div>
          <div className="cx-row"><span className="cx-label">Socket URL</span>{field('socketBaseUrl', s.socketBaseUrl, 'http://www.domain.com/')}</div>
          <div className="cx-row" style={{ borderBottom: "none" }}><span className="cx-label">Native WS</span>{field('nativeSocketUrl', s.nativeSocketUrl, 'ws://domain.com/ws')}</div>
        </div>

        {/* Deploy & SDK */}
        <div className="cx-card cx-border" style={{ padding: '20px', gridColumn: '1 / -1' }}>
          <h3 className="cx-sec-head"><Server style={{ width: '14px', height: '14px', color: '#10B981' }} /> Deploy & SDK</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            <div>
              <div className="cx-row"><span className="cx-label">Environment</span>
                {editing ? (
                  <select className="cx-input" style={{ cursor: "pointer" }} value={form.environment} onChange={e => u('environment', e.target.value)}>
                    <option value="production">Production</option><option value="staging">Staging</option><option value="development">Development</option>
                  </select>
                ) : <span className="cx-value" style={{ fontFamily: "inherit", textTransform: "capitalize" }}>{s.environment || '—'}</span>}
              </div>
              <div className="cx-row"><span className="cx-label">Server</span>
                <span className="cx-value cx-flex cx-items-center cx-gap-6" style={{ fontFamily: "inherit" }}>
                  <Server style={{ width: '13px', height: '13px', color: '#10B981' }} />
                  {serverName}
                </span>
              </div>
              <div className="cx-row" style={{ borderBottom: "none" }}><span className="cx-label">Server Path</span>{field('serverPath', s.serverPath, '/var/www/html/client')}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
