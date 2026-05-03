'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, FolderGit2, Loader2, ArrowLeft, ArrowRight, Github, Search, Database, Globe, Radio, Bell, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData } from '@/lib/hooks';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

const steps = [
  { id: 1, label: 'Client Info', icon: FolderGit2 },
  { id: 2, label: 'Domain & URLs', icon: Globe },
  { id: 3, label: 'MySQL Database', icon: Database },
  { id: 4, label: 'Rate & Socket', icon: Radio },
  { id: 5, label: 'Deploy & Notify', icon: Bell },
];



/* ─── Auto-detect repo provider from URL ─── */
function detectProvider(url: string): string {
  if (url.includes('github.com')) return 'github';
  if (url.includes('gitlab.com')) return 'gitlab';
  if (url.includes('bitbucket.org')) return 'bitbucket';
  return 'github';
}

/* ─── shared styles ─── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 200ms',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '6px',
  color: 'rgb(var(--text-muted))',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '16px',
  padding: '32px',
};

const DEFAULT_FORM = {
  // Step 1: Client Info
  name: '', clientSlug: '', productType: 'lite' as 'lite' | 'trade', repoUrl: '', branch: 'main', description: '',
  androidVersion: '1.0.0', iosVersion: '1.0.0',
  // Step 2: Domain & URLs
  domain: '', webBaseUrl: '', adminBaseUrl: '', appBaseUrl: '', webTitle: '', webCopyright: '',
  adminUser: '', adminPassword: '',
  // Step 3: MySQL
  dbHost: '', dbPort: '3306', dbName: '', dbUser: '', dbPassword: '',
  // Step 4: Rate & Socket
  rateFeed: '4', websocketType: '2', socketBaseUrl: '', nativeSocketUrl: '',
  lsRateUrl: 'http://72.52.178.11:8080', lsRateAdapter: 'WLSTOCKLIST_REMOTE',
  lsRateProvider: 'WLQUOTE_ADAPTER', lsRateUsername: 'lmxwinbullliteapp',
  bcClient: '', bcUsername: '', bcPassword: '', bcUpdateTime: '800',
  encryptionKey: '12@^tyh8901tt56789012345$y89012',
  // Step 5: Deploy & Notifications
  environment: 'production', serverId: '', serverUser: 'root', serverPath: '/var/www/html',
  onesignalAppId: '', onesignalAuth: '', androidUrl: '', iosUrl: '',
  whatsappUrl: 'http://whatsappsms.creativepoint.in/api/', whatsappInstanceId: '',
};

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { data: servers } = useApiData(() => api.getServers());
  const allServers = (servers as any[]) || [];

  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedForm = localStorage.getItem('cortexo_new_project_form');
      const savedStep = localStorage.getItem('cortexo_new_project_step');
      if (savedForm) setForm(JSON.parse(savedForm));
      if (savedStep) setStep(parseInt(savedStep));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cortexo_new_project_form', JSON.stringify(form));
      localStorage.setItem('cortexo_new_project_step', step.toString());
    }
  }, [form, step, isClient]);

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear the draft project details?')) {
      setForm(DEFAULT_FORM);
      setStep(1);
      localStorage.removeItem('cortexo_new_project_form');
      localStorage.removeItem('cortexo_new_project_step');
    }
  };

  // GitHub repos from credentials vault
  const [ghRepos, setGhRepos] = useState<{ name: string; url: string; defaultBranch: string; private: boolean }[]>([]);
  const [ghLoading, setGhLoading] = useState(true);
  const [ghError, setGhError] = useState('');
  const [repoSearch, setRepoSearch] = useState('');
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [repoMode, setRepoMode] = useState<'github' | 'manual'>('github');

  useEffect(() => {
    const token = localStorage.getItem('cortexo_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`${API}/credentials/github/repos`, { headers })
      .then(r => r.json())
      .then(d => {
        if (d.data) { setGhRepos(d.data); setGhError(''); }
        else { setGhError(d.error || 'No repos'); setRepoMode('manual'); }
      })
      .catch(() => { setGhError('API error'); setRepoMode('manual'); })
      .finally(() => setGhLoading(false));
  }, []);

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  /* Auto-fill slug, paths, and broadcast creds when name changes */
  function updateName(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '');
    setForm(f => ({
      ...f, name, clientSlug: slug,
      serverPath: slug ? `/var/www/html/${slug}` : '/var/www/html',
      dbName: slug || f.dbName,
      bcClient: slug, bcUsername: slug, bcPassword: slug ? `${slug}-trade` : '',
    }));
  }

  /* Auto-fill all URLs when domain changes */
  function updateDomain(domain: string) {
    const base = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    setForm(f => ({
      ...f, domain: base,
      webBaseUrl: base ? `http://www.${base}/` : '',
      adminBaseUrl: base ? `http://www.${base}/admin/` : '',
      appBaseUrl: base ? `http://www.${base}/mobileapi/` : '',
      socketBaseUrl: base ? `http://www.${base}/` : '',
      nativeSocketUrl: base ? `ws://${base}/ws` : '',
      webTitle: f.webTitle || f.name,
      webCopyright: f.name ? `© ${new Date().getFullYear()} ${f.name}. All Rights Reserved` : '',
    }));
  }

  async function finish() {
    setSaving(true);
    try {
      api.loadToken();
      const repoProvider = detectProvider(form.repoUrl) as 'github' | 'gitlab' | 'bitbucket';
      const projResult = await api.createProject({
        name: form.name,
        repoUrl: form.repoUrl || undefined,
        repoProvider,
        defaultBranch: form.branch,
        description: `${form.productType === 'trade' ? 'Trade' : 'Lite'} | ${form.clientSlug} | ${form.domain || '—'}`,
      } as any);
      const projId = (projResult as any).data.id;

      // Save all client config into project settings JSON
      const settings = {
        clientSlug: form.clientSlug, productType: form.productType,
        androidVersion: form.androidVersion, iosVersion: form.iosVersion,
        domain: form.domain, webBaseUrl: form.webBaseUrl, adminBaseUrl: form.adminBaseUrl, appBaseUrl: form.appBaseUrl,
        adminUser: form.adminUser, adminPassword: form.adminPassword,
        database: { host: form.dbHost, port: form.dbPort, name: form.dbName, user: form.dbUser, password: form.dbPassword },
        socket: { rateFeed: form.rateFeed, websocketType: form.websocketType, socketBaseUrl: form.socketBaseUrl, nativeSocketUrl: form.nativeSocketUrl },
        deploy: { environment: form.environment, serverPath: form.serverPath, serverId: form.serverId },
      };
      await api.updateProject(projId, { settings: JSON.stringify(settings) } as any);

      if (form.serverId) {
        await (api as any).createDeployConfig({
          projectId: projId, serverId: parseInt(form.serverId), deployPath: form.serverPath,
          deployUser: form.serverUser, gitRepo: form.repoUrl || undefined, gitBranch: form.branch || 'main', appFramework: form.environment,
        });
      }

      await api.createPipeline({
        projectId: projId, name: `${form.name} Pipeline`,
        stages: [{ name: 'Install dependencies', type: 'build' }, { name: 'Run tests', type: 'test' }, { name: 'Build', type: 'build' }, { name: 'Deploy to server', type: 'deploy' }],
      });

      setDone(true);
      localStorage.removeItem('cortexo_new_project_form');
      localStorage.removeItem('cortexo_new_project_step');
      setTimeout(() => router.push(`/projects/${projId}`), 1500);
    } catch (e: unknown) {
      alert('Failed: ' + (e as Error).message);
    } finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/projects')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))',
              color: 'rgb(var(--text-muted))',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            New Project
          </h1>
        </div>
        {!done && (
          <button
            onClick={clearDraft}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444', border: 'none', cursor: 'pointer',
              transition: 'background-color 200ms',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} /> Clear Draft
          </button>
        )}
      </div>

      {/* ─── Step Indicator ─── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
        {steps.map((s, i) => {
          const isDone = step > s.id || done;
          const isCurrent = step === s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isDone ? '#10B981' : isCurrent ? 'rgb(var(--primary))' : 'rgb(var(--surface-hover))',
                  border: isDone || isCurrent ? 'none' : '1px solid rgb(var(--border))',
                  color: isDone || isCurrent ? '#fff' : 'rgb(var(--text-muted))',
                  transition: 'all 300ms',
                  boxShadow: isCurrent ? '0 4px 12px rgba(var(--primary), 0.35)' : 'none',
                }}>
                  {isDone ? <Check style={{ width: '16px', height: '16px' }} /> : <Icon style={{ width: '16px', height: '16px' }} />}
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap',
                  color: isCurrent ? 'rgb(var(--primary))' : isDone ? '#10B981' : 'rgb(var(--text-muted))',
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: '2px', margin: '0 8px',
                  backgroundColor: step > s.id ? '#10B981' : 'rgb(var(--border))',
                  borderRadius: '1px',
                  transition: 'background-color 300ms',
                  marginBottom: '20px',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Step Content Card ─── */}
      <div style={cardStyle}>

        {/* Step 1: Client Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
              Client Info
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Project Name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Vijay Bullion"
                  value={form.name}
                  onChange={e => updateName(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Client Slug <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '9px', color: 'rgb(var(--text-muted))' }}>(auto)</span></label>
                <input
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
                  placeholder="vijaybullion"
                  value={form.clientSlug}
                  onChange={e => update('clientSlug', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Product Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([{ key: 'lite', label: 'Winbull Lite', color: '#10B981' }, { key: 'trade', label: 'Winbull Trade', color: '#F59E0B' }] as const).map(pt => (
                  <button key={pt.key} onClick={() => update('productType', pt.key)} style={{
                    padding: '10px 22px', borderRadius: '10px', fontSize: '12px', fontWeight: form.productType === pt.key ? 600 : 500, cursor: 'pointer', transition: 'all 200ms',
                    border: form.productType === pt.key ? `1.5px solid ${pt.color}` : '1px solid rgb(var(--border))',
                    backgroundColor: form.productType === pt.key ? `${pt.color}15` : 'transparent',
                    color: form.productType === pt.key ? pt.color : 'rgb(var(--text-muted))',
                  }}>{pt.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Android App Version</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="1.0.0" value={form.androidVersion} onChange={e => update('androidVersion', e.target.value)} /></div>
              <div><label style={labelStyle}>iOS App Version</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="1.0.0" value={form.iosVersion} onChange={e => update('iosVersion', e.target.value)} /></div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, margin: 0 }}>Repository</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => setRepoMode('github')} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: repoMode === 'github' ? 'rgba(var(--primary),0.12)' : 'transparent', color: repoMode === 'github' ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))' }}>
                    GitHub
                  </button>
                  <button onClick={() => setRepoMode('manual')} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: repoMode === 'manual' ? 'rgba(var(--primary),0.12)' : 'transparent', color: repoMode === 'manual' ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))' }}>
                    Manual URL
                  </button>
                </div>
              </div>

              {repoMode === 'github' ? (
                <div style={{ position: 'relative' }}>
                  {ghLoading ? (
                    <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: '8px', color: 'rgb(var(--text-muted))' }}>
                      <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Loading repos...
                    </div>
                  ) : ghError ? (
                    <div>
                      <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '12px', color: '#F59E0B', marginBottom: '8px' }}>
                        ⚠️ {ghError}. <button onClick={() => setRepoMode('manual')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--primary))', fontWeight: 600, textDecoration: 'underline', fontSize: '12px' }}>Enter URL manually</button> or add your token in <a href="/settings/credentials" style={{ color: 'rgb(var(--primary))', fontWeight: 600 }}>Settings → Credentials</a>.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                        style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        {form.repoUrl ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Github style={{ width: 14, height: 14, color: 'rgb(var(--primary))' }} />
                            {ghRepos.find(r => r.url === form.repoUrl)?.name || form.repoUrl}
                          </span>
                        ) : (
                          <span style={{ color: 'rgb(var(--text-muted))' }}>Select a repository...</span>
                        )}
                        <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{ghRepos.length} repos</span>
                      </div>

                      {showRepoDropdown && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', zIndex: 50, borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', maxHeight: '280px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          {/* Search */}
                          <div style={{ padding: '8px', borderBottom: '1px solid rgb(var(--border))' }}>
                            <div style={{ position: 'relative' }}>
                              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'rgb(var(--text-muted))' }} />
                              <input
                                autoFocus
                                placeholder="Search repos..."
                                value={repoSearch}
                                onChange={e => setRepoSearch(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: '30px', border: '1px solid rgb(var(--border))' }}
                              />
                            </div>
                          </div>
                          {/* Repo list */}
                          <div style={{ overflowY: 'auto', maxHeight: '220px' }}>
                            {ghRepos
                              .filter(r => !repoSearch || r.name.toLowerCase().includes(repoSearch.toLowerCase()))
                              .map(repo => (
                                <button
                                  key={repo.url}
                                  onClick={() => {
                                    update('repoUrl', repo.url);
                                    update('branch', repo.defaultBranch || 'main');
                                    setShowRepoDropdown(false);
                                    setRepoSearch('');
                                  }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                                    backgroundColor: form.repoUrl === repo.url ? 'rgba(var(--primary),0.08)' : 'transparent',
                                    color: 'rgb(var(--text-primary))', fontSize: '13px', textAlign: 'left',
                                    transition: 'background-color 100ms',
                                  }}
                                  onMouseEnter={e => { if (form.repoUrl !== repo.url) e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.3)'; }}
                                  onMouseLeave={e => { if (form.repoUrl !== repo.url) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                  <Github style={{ width: 15, height: 15, color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</div>
                                  </div>
                                  {repo.private && <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>PRIVATE</span>}
                                  {form.repoUrl === repo.url && <Check style={{ width: 14, height: 14, color: 'rgb(var(--primary))' }} />}
                                </button>
                              ))}
                            {ghRepos.filter(r => !repoSearch || r.name.toLowerCase().includes(repoSearch.toLowerCase())).length === 0 && (
                              <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>No repos match &ldquo;{repoSearch}&rdquo;</div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  <input
                    style={inputStyle}
                    placeholder="https://github.com/yourname/project"
                    value={form.repoUrl}
                    onChange={e => update('repoUrl', e.target.value)}
                  />
                  {form.repoUrl && (
                    <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '4px 0 0 2px' }}>
                      Provider: <strong style={{ color: 'rgb(var(--primary))' }}>{detectProvider(form.repoUrl)}</strong>
                    </p>
                  )}
                </>
              )}
            </div>

            {form.repoUrl && (
              <div>
                <label style={labelStyle}>Default Branch</label>
                <input
                  style={inputStyle}
                  placeholder="main"
                  value={form.branch}
                  onChange={e => update('branch', e.target.value)}
                />
              </div>
            )}
          </div>
        )}


        {/* Step 2: Domain & URLs */}
        {step === 2 && !done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Domain & URLs</h2>
            <div>
              <label style={labelStyle}>Domain *</label>
              <input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="e.g. vijaybullion.com" value={form.domain} onChange={e => updateDomain(e.target.value)} />
              <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>All URLs below auto-generate from domain</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Admin URL</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }} placeholder="auto from domain" value={form.adminBaseUrl} onChange={e => update('adminBaseUrl', e.target.value)} /></div>
              <div><label style={labelStyle}>Admin Username</label><input style={inputStyle} placeholder="e.g. admin" value={form.adminUser} onChange={e => update('adminUser', e.target.value)} /></div>
              <div><label style={labelStyle}>Admin Password</label><input type="password" style={inputStyle} placeholder="••••••••" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} /></div>
            </div>
            <div>
              <label style={labelStyle}>Server <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '9px' }}>(optional)</span></label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.serverId} onChange={e => update('serverId', e.target.value)}>
                <option value="">No server (add later)</option>
                {allServers.map((s: Record<string, unknown>) => (<option key={String(s.id)} value={String(s.id)}>{String(s.name)} ({String(s.privateIp)})</option>))}
              </select>
            </div>
            {form.domain && (
              <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--border))' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>Generated URLs</label>
                {[{ l: 'Web', v: form.webBaseUrl }, { l: 'Mobile API', v: form.appBaseUrl }].map(u => (
                  <div key={u.l} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgb(var(--text-muted))', width: '70px' }}>{u.l}</span>
                    <code style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--primary))' }}>{u.v}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: MySQL Database */}
        {step === 3 && !done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>MySQL Database</h2>
              <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(0,117,143,0.1)', color: '#00758F' }}>MySQL</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Host / RDS Endpoint</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="database-1.cb86ugsw4aax.ap-south-1.rds.amazonaws.com" value={form.dbHost} onChange={e => update('dbHost', e.target.value)} /></div>
              <div><label style={labelStyle}>Port</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="3306" value={form.dbPort} onChange={e => update('dbPort', e.target.value)} /></div>
            </div>
            <div><label style={labelStyle}>Database Name</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder={form.clientSlug || 'e.g. maharaj'} value={form.dbName} onChange={e => update('dbName', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Username</label><input style={inputStyle} placeholder="admin" value={form.dbUser} onChange={e => update('dbUser', e.target.value)} /></div>
              <div><label style={labelStyle}>Password</label><input type="password" style={inputStyle} placeholder="••••••••" value={form.dbPassword} onChange={e => update('dbPassword', e.target.value)} /></div>
            </div>
            {form.dbHost && form.dbName && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--border))' }}>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Connection String</label>
                <code style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#00758F', wordBreak: 'break-all' }}>{`mysql://${form.dbUser || 'user'}:****@${form.dbHost}:${form.dbPort || '3306'}/${form.dbName}`}</code>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Rate & Socket */}
        {step === 4 && !done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Rate & Socket Config</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Rate Feed Type</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.rateFeed} onChange={e => update('rateFeed', e.target.value)}>
                  <option value="0">PHP Encryption</option><option value="1">Broadcast Rate</option><option value="2">Text File</option><option value="3">WebSocket</option><option value="4">Native Socket</option>
                </select></div>
              <div><label style={labelStyle}>WebSocket Type</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.websocketType} onChange={e => update('websocketType', e.target.value)}>
                  <option value="1">Socket.io</option><option value="2">Native WebSocket</option>
                </select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Socket Base URL</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="http://www.domain.com/" value={form.socketBaseUrl} onChange={e => update('socketBaseUrl', e.target.value)} /></div>
              <div><label style={labelStyle}>Native WS URL</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} placeholder="ws://domain.com/ws" value={form.nativeSocketUrl} onChange={e => update('nativeSocketUrl', e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* Step 5: Deploy & Notifications */}
        {step === 5 && !done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Deploy & Notifications</h2>
            <div><label style={labelStyle}>Environment</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['production', 'staging', 'development'].map(env => (
                  <button key={env} onClick={() => update('environment', env)} style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px', textTransform: 'capitalize' as const, cursor: 'pointer', transition: 'all 200ms', fontWeight: form.environment === env ? 600 : 500, border: form.environment === env ? '1.5px solid rgba(var(--primary), 0.5)' : '1px solid rgb(var(--border))', backgroundColor: form.environment === env ? 'rgba(var(--primary), 0.1)' : 'transparent', color: form.environment === env ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))' }}>{env}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Select Server <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.serverId} onChange={e => update('serverId', e.target.value)}>
                  <option value="">No server (add later)</option>
                  {allServers.map((s: Record<string, unknown>) => (<option key={String(s.id)} value={String(s.id)}>{String(s.name)} ({String(s.privateIp)})</option>))}
                </select></div>
              <div><label style={labelStyle}>Deploy Path</label><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} value={form.serverPath} onChange={e => update('serverPath', e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* Done */}
        {done && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Check style={{ width: '32px', height: '32px', color: '#10B981' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
              Project Created!
            </h2>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '6px' }}>
              Redirecting to project dashboard...
            </p>
          </div>
        )}
      </div>

      {/* ─── Navigation Buttons ─── */}
      {!done && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/projects')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 500,
              color: 'rgb(var(--text-secondary))',
              backgroundColor: 'transparent',
              border: '1px solid rgb(var(--border))',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
          >
            <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!form.name.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 24px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                border: 'none',
                cursor: !form.name.trim() ? 'not-allowed' : 'pointer',
                opacity: !form.name.trim() ? 0.5 : 1,
                boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
                transition: 'all 200ms',
              }}
            >
              Continue <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 24px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #10B981, rgb(var(--primary)))',
                border: 'none',
                cursor: saving ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                transition: 'all 200ms',
              }}
            >
              {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Check style={{ width: '14px', height: '14px' }} />}
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
