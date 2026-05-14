'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, FolderGit2, Loader2, ArrowLeft, ArrowRight, Github, Search, Trash2, GitBranch, ChevronDown, AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useModal } from '@/components/modal-provider';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

const steps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Domain & DB' },
  { id: 3, label: 'Review' },
];



/* ─── Auto-detect repo provider from URL ─── */
function detectProvider(url: string): string {
  if (url.includes('github.com')) return 'github';
  if (url.includes('gitlab.com')) return 'gitlab';
  if (url.includes('bitbucket.org')) return 'bitbucket';
  return 'github';
}

/* ─── shared styles ─── */



const DEFAULT_FORM = {
  // Step 1: Client Info
  name: '', clientSlug: '', productType: 'lite' as 'lite' | 'trade', repoUrl: '', branch: 'development', description: '',
  androidVersion: '1.0.0', iosVersion: '1.0.0',
  // Step 2: Domain & URLs
  domain: '', webBaseUrl: '', adminBaseUrl: '', appBaseUrl: '', webTitle: '', webCopyright: '',
  adminUser: '', adminPassword: '',
  // Step 3: MySQL
  dbHost: '', dbPort: '3306', dbName: '', dbUser: '', dbPassword: '',
  // Step 4: Rate & Socket
  rateFeed: '4', websocketType: '2', wsPort: '', socketIoPort: '', socketBaseUrl: '', nativeSocketUrl: '',
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
  useAutoLoadToken();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [isClient, setIsClient] = useState(false);

  const { data: servers } = useApiData(() => api.getServers());
  const allServers = (servers as any[]) || [];

  const [form, setForm] = useState(DEFAULT_FORM);

  // ─── Duplicate Validation State ─────────────────────────────────────
  const [conflicts, setConflicts] = useState<Record<string, { field: string; existingProject: string; existingValue: string }>>({}); 
  const [validating, setValidating] = useState(false);
  const validateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runValidation = useCallback(async (f: typeof DEFAULT_FORM) => {
    // Only validate if we have at least a slug
    if (!f.clientSlug) { setConflicts({}); return; }
    setValidating(true);
    try {
      api.loadToken();
      const res = await api.validateProjectUnique({
        clientSlug: f.clientSlug || undefined,
        dbName: f.dbName || undefined,
        wsPort: f.wsPort || undefined,
        socketIoPort: f.socketIoPort || undefined,
        serverPath: f.serverPath || undefined,
      });
      setConflicts(res.data?.conflicts || {});
    } catch {
      // API not reachable — don't block the user
      setConflicts({});
    } finally {
      setValidating(false);
    }
  }, []);

  // Debounced validation — 800ms after user stops typing
  useEffect(() => {
    if (!isClient) return;
    if (validateTimer.current) clearTimeout(validateTimer.current);
    validateTimer.current = setTimeout(() => runValidation(form), 800);
    return () => { if (validateTimer.current) clearTimeout(validateTimer.current); };
  }, [form.clientSlug, form.dbName, form.wsPort, form.socketIoPort, form.serverPath, isClient, runValidation]);

  const hasConflicts = Object.keys(conflicts).length > 0;
  const [showConflictModal, setShowConflictModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedForm = localStorage.getItem('cortexo_new_project_form');
      const savedStep = localStorage.getItem('cortexo_new_project_step');
      if (savedForm) setForm(JSON.parse(savedForm));
      if (savedStep) setStep(Math.min(parseInt(savedStep), 3));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cortexo_new_project_form', JSON.stringify(form));
      localStorage.setItem('cortexo_new_project_step', step.toString());
    }
  }, [form, step, isClient]);

  const { confirm: confirmModal, showAlert } = useModal();

  const clearDraft = async () => {
    const ok = await confirmModal({ title: 'Clear Draft', message: 'Are you sure you want to clear the draft project details?', variant: 'danger', confirmText: 'Clear All' });
    if (ok) {
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

  // Branch list state
  const [branches, setBranches] = useState<string[]>([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('cortexo_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`${API}/credentials/github/repos`, { headers })
      .then(r => r.json())
      .then(d => {
        if (d.tokenExpired || d.error?.includes('expired')) {
          setGhError('⚠️ GitHub token expired — update in Settings → Credentials');
          setRepoMode('manual');
        } else if (d.data && d.data.length > 0) {
          setGhRepos(d.data); setGhError('');
        } else if (d.error) {
          setGhError(d.error); setRepoMode('manual');
        } else {
          setGhError('No repositories found'); setRepoMode('manual');
        }
      })
      .catch(() => { setGhError('API not available'); setRepoMode('manual'); })
      .finally(() => setGhLoading(false));
  }, []);

  // Fetch branches when repo URL changes
  useEffect(() => {
    if (!form.repoUrl || !form.repoUrl.includes('github.com')) {
      setBranches([]);
      return;
    }
    const match = form.repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
    if (!match) return;
    const [, owner, repo] = match;
    setBranchLoading(true);
    const token = localStorage.getItem('cortexo_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`${API}/credentials/github/repos/${owner}/${repo}/branches`, { headers })
      .then(r => r.json())
      .then(d => {
        if (d.data && Array.isArray(d.data)) {
          setBranches(d.data.map((b: any) => typeof b === 'string' ? b : b.name));
        } else {
          // Fallback: try GitHub public API directly
          fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`)
            .then(r2 => r2.json())
            .then(d2 => {
              if (Array.isArray(d2)) setBranches(d2.map((b: any) => b.name));
              else setBranches(['main', 'development', 'staging']);
            })
            .catch(() => setBranches(['main', 'development', 'staging']));
        }
      })
      .catch(() => {
        fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`)
          .then(r2 => r2.json())
          .then(d2 => {
            if (Array.isArray(d2)) setBranches(d2.map((b: any) => b.name));
            else setBranches(['main', 'development', 'staging']);
          })
          .catch(() => setBranches(['main', 'development', 'staging']));
      })
      .finally(() => setBranchLoading(false));
  }, [form.repoUrl]);

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
      webTitle: name, webCopyright: name ? `© ${new Date().getFullYear()} ${name}` : '',
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
        webTitle: form.webTitle, webCopyright: form.webCopyright,
        androidVersion: form.androidVersion, iosVersion: form.iosVersion,
        domain: form.domain, webBaseUrl: form.webBaseUrl, adminBaseUrl: form.adminBaseUrl, appBaseUrl: form.appBaseUrl,
        adminUser: form.adminUser, adminPassword: form.adminPassword,
        database: { host: form.dbHost, port: form.dbPort, name: form.dbName, user: form.dbUser, password: form.dbPassword },
        socket: { rateFeed: form.rateFeed, websocketType: form.websocketType, wsPort: form.wsPort, socketIoPort: form.socketIoPort, socketBaseUrl: form.socketBaseUrl, nativeSocketUrl: form.nativeSocketUrl },
        broadcast: { client: form.bcClient, username: form.bcUsername, password: form.bcPassword, updateTime: form.bcUpdateTime },
        deploy: { environment: form.environment, serverPath: form.serverPath, serverId: form.serverId },
      };
      await api.updateProject(projId, { settings: JSON.stringify(settings) } as any);

      if (form.serverId) {
        await (api as any).createDeployConfig({
          projectId: projId, serverId: parseInt(form.serverId), deployPath: form.serverPath,
          deployUser: form.serverUser, gitRepo: form.repoUrl || undefined, gitBranch: form.branch || 'development', appFramework: form.environment,
        });
      }

      await api.createPipeline({
        projectId: projId, name: `${form.name} Pipeline`,
        stages: [{ name: 'Install dependencies', type: 'build' }, { name: 'Run tests', type: 'test' }, { name: 'Build', type: 'build' }, { name: 'Deploy to server', type: 'deploy' }],
      });

      setDone(true);
      localStorage.removeItem('cortexo_new_project_form');
      localStorage.removeItem('cortexo_new_project_step');

      // Redirect to project page — deployment is triggered separately from Deployments page
      setTimeout(() => router.push(`/projects/${projId}`), 1500);
    } catch (e: unknown) {
      showAlert({ title: 'Error', message: 'Failed: ' + (e as Error).message, variant: 'error' });
    } finally { setSaving(false); }
  }

  const previewPanel = (
    <div className="cx-card cx-border" style={{ width: "320px", flexShrink: 0, position: "sticky", top: "20px", alignSelf: "flex-start" }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 20px' }}>Project Preview</h3>
      <div className="cx-flex cx-items-center cx-gap-12" style={{ marginBottom: "20px" }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FolderGit2 style={{ width: '24px', height: '24px', color: '#7C3AED' }} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{form.name || 'project-name'}</div>
          <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{form.clientSlug || 'client-slug'} · {form.productType}</div>
        </div>
      </div>
      {form.domain && <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>🌐 {form.domain}</div>}
      {form.repoUrl && <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📦 {form.repoUrl.split('/').pop()}</div>}
      {form.dbName && <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>🗄 {form.dbName}</div>}
      <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#7C3AED', margin: '0 0 10px' }}>What happens next?</h4>
        <div className="cx-flex-col cx-gap-8">
          {['Project is registered in Cortexo', 'CI/CD pipeline is created', 'Ready for first deployment'].map((t, i) => (
            <div key={i} className="cx-flex cx-items-center cx-gap-8 cx-text-muted cx-text-12">
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#7C3AED', flexShrink: 0 }}>{i + 1}</span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* ─── Header ─── */}
      <div className="cx-flex-between" style={{ marginBottom: "28px" }}>
        <div className="cx-flex cx-items-center cx-gap-12">
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
      <div className="cx-flex cx-items-center" style={{ marginBottom: "28px" }}>
        {steps.map((s, i) => {
          const isDone = step > s.id || done;
          const isCurrent = step === s.id;
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
                  fontSize: '14px', fontWeight: 700,
                }}>
                  {isDone ? <Check style={{ width: '16px', height: '16px' }} /> : s.id}
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

      {/* ─── Main Content with Sidebar ─── */}
      <div className="cx-flex cx-gap-32">
      <div className="cx-card cx-border" style={{ flex: 1 }}>

        {/* Step 1: Client Info */}
        {step === 1 && (
          <div className="cx-flex-col" style={{ gap: "20px" }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
              Project Basic Information
            </h2>

            <div className="cx-grid-2">
              <div>
                <label className="cx-label">Project Name *</label>
                <input
                  className="cx-input"
                  placeholder="e.g. Vijay Bullion"
                  value={form.name}
                  onChange={e => updateName(e.target.value)}
                />
              </div>
              <div>
                <label className="cx-label">Client Slug <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '9px', color: 'rgb(var(--text-muted))' }}>(auto)</span></label>
                <input
                  className="cx-input cx-mono" style={{ borderColor: conflicts.clientSlug ? '#EF4444' : (form.clientSlug && !validating ? '#10B981' : undefined) }}
                  placeholder="vijaybullion"
                  value={form.clientSlug}
                  onChange={e => update('clientSlug', e.target.value)}
                />
                {conflicts.clientSlug ? (
                  <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle style={{ width: 12, height: 12 }} />
                    Already used by <strong>{conflicts.clientSlug.existingProject}</strong>
                  </p>
                ) : form.clientSlug && !validating ? (
                  <p style={{ fontSize: '11px', color: '#10B981', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check style={{ width: 12, height: 12 }} /> Available
                  </p>
                ) : validating && form.clientSlug ? (
                  <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>Checking...</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="cx-label">Product Type</label>
              <div className="cx-flex cx-gap-8">
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

            <div className="cx-grid-2">
              <div><label className="cx-label">Android App Version</label><input className="cx-input cx-mono" placeholder="1.0.0" value={form.androidVersion} onChange={e => update('androidVersion', e.target.value)} /></div>
              <div><label className="cx-label">iOS App Version</label><input className="cx-input cx-mono" placeholder="1.0.0" value={form.iosVersion} onChange={e => update('iosVersion', e.target.value)} /></div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="cx-label" style={{ margin: 0 }}>Repository</label>
                <div className="cx-flex cx-gap-4">
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
                    <div className="cx-input cx-flex cx-items-center cx-gap-8 cx-text-muted">
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
                        className="cx-input cx-flex cx-items-center cx-flex-between" style={{ cursor: "pointer" }}
                      >
                        {form.repoUrl ? (
                          <span className="cx-flex cx-items-center cx-gap-6">
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
                                className="cx-input" style={{ paddingLeft: "30px" }}
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
                                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>connected</span>
                                  {repo.private && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>PRIVATE</span>}
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
                    className="cx-input"
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
              <div style={{ position: 'relative' }}>
                <label className="cx-label">Default Branch</label>
                {branchLoading ? (
                  <div className="cx-input cx-flex cx-items-center cx-gap-8 cx-text-muted">
                    <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Loading branches...
                  </div>
                ) : branches.length > 0 ? (
                  <>
                    <div
                      onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                      className="cx-input cx-flex cx-items-center cx-flex-between" style={{ cursor: "pointer" }}
                    >
                      <span className="cx-flex cx-items-center cx-gap-6">
                        <GitBranch style={{ width: 14, height: 14, color: '#10B981' }} />
                        {form.branch || 'Select branch...'}
                      </span>
                      <ChevronDown style={{ width: 14, height: 14, color: 'rgb(var(--text-muted))', transform: showBranchDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                    </div>
                    {showBranchDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', zIndex: 50, borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', maxHeight: '240px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid rgb(var(--border))' }}>
                          <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'rgb(var(--text-muted))' }} />
                            <input
                              autoFocus
                              placeholder="Search branches..."
                              value={branchSearch}
                              onChange={e => setBranchSearch(e.target.value)}
                              className="cx-input" style={{ paddingLeft: "30px" }}
                            />
                          </div>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '180px' }}>
                          {branches
                            .filter(b => !branchSearch || b.toLowerCase().includes(branchSearch.toLowerCase()))
                            .map(branch => (
                              <button
                                key={branch}
                                onClick={() => { update('branch', branch); setShowBranchDropdown(false); setBranchSearch(''); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                                  backgroundColor: form.branch === branch ? 'rgba(16,185,129,0.08)' : 'transparent',
                                  color: 'rgb(var(--text-primary))', fontSize: '13px', textAlign: 'left',
                                  transition: 'background-color 100ms',
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                                onMouseEnter={e => { if (form.branch !== branch) e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.3)'; }}
                                onMouseLeave={e => { if (form.branch !== branch) e.currentTarget.style.backgroundColor = 'transparent'; }}
                              >
                                <GitBranch style={{ width: 14, height: 14, color: form.branch === branch ? '#10B981' : 'rgb(var(--text-muted))', flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{branch}</span>
                                {branch === 'main' && <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, backgroundColor: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>default</span>}
                                {form.branch === branch && <Check style={{ width: 14, height: 14, color: '#10B981' }} />}
                              </button>
                            ))}
                          {branches.filter(b => !branchSearch || b.toLowerCase().includes(branchSearch.toLowerCase())).length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>No branches match &ldquo;{branchSearch}&rdquo;</div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <input
                    className="cx-input"
                    placeholder="development"
                    value={form.branch}
                    onChange={e => update('branch', e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Server Selection */}
            <div style={{ borderTop: '1px solid rgb(var(--border))', paddingTop: '20px', marginTop: '4px' }}>
              <div className="cx-grid-2">
                <div>
                  <label className="cx-label">Deployment Server</label>
                  <select className="cx-input" style={{ cursor: "pointer" }} value={form.serverId} onChange={e => update('serverId', e.target.value)}>
                    <option value="">Select deployment server...</option>
                    {allServers.map((s: Record<string, unknown>) => (<option key={String(s.id)} value={String(s.id)}>🖥 {String(s.name)} ({String(s.privateIp)})</option>))}
                    {allServers.length === 0 && <option value="" disabled>No servers configured — add one in Servers page</option>}
                  </select>
                </div>
                <div>
                  <label className="cx-label">Server Path</label>
                  <input className="cx-input cx-mono" style={{ borderColor: conflicts.serverPath ? "#EF4444" : undefined }} placeholder="/var/www/html/client" value={form.serverPath} onChange={e => update('serverPath', e.target.value)} />
                  {conflicts.serverPath && (
                    <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle style={{ width: 12, height: 12 }} />
                      Folder already used by <strong>{conflicts.serverPath.existingProject}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}


        {/* Step 2: Domain & DB */}
        {step === 2 && !done && (
          <div className="cx-flex-col" style={{ gap: "20px" }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Domain & Access</h2>
            <div>
              <label className="cx-label">Domain *</label>
              <input className="cx-input cx-mono" placeholder="e.g. vijaybullion.com" value={form.domain} onChange={e => updateDomain(e.target.value)} />
              <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: '4px 0 0' }}>All URLs below auto-generate from domain</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div><label className="cx-label">Admin URL</label><input className="cx-input cx-mono" style={{ fontSize: "12px" }} placeholder="auto from domain" value={form.adminBaseUrl} onChange={e => update('adminBaseUrl', e.target.value)} /></div>
              <div><label className="cx-label">Admin Username</label><input className="cx-input" placeholder="e.g. admin" value={form.adminUser} onChange={e => update('adminUser', e.target.value)} /></div>
              <div><label className="cx-label">Admin Password</label><input type="password" className="cx-input" placeholder="••••••••" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} /></div>
            </div>

            {form.domain && (
              <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--border))' }}>
                <label className="cx-label" style={{ marginBottom: "10px" }}>Generated URLs</label>
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

        {/* Step 2 continued: Database section */}
        {step === 2 && !done && (
          <>
            <div style={{ borderTop: '1px solid rgb(var(--border))', marginTop: '8px', paddingTop: '20px' }}>
              <div className="cx-flex-between" style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Database</h3>
                <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(0,117,143,0.1)', color: '#00758F' }}>MySQL</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label className="cx-label">DB Host *</label><input className="cx-input cx-mono" placeholder="database-1.rds.amazonaws.com" value={form.dbHost} onChange={e => update('dbHost', e.target.value)} /></div>
                <div><label className="cx-label">DB Port</label><input className="cx-input cx-mono" placeholder="3306" value={form.dbPort} onChange={e => update('dbPort', e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div><label className="cx-label">DB Username *</label><input className="cx-input" placeholder="admin" value={form.dbUser} onChange={e => update('dbUser', e.target.value)} /></div>
                <div><label className="cx-label">DB Password *</label><input type="password" className="cx-input" placeholder="••••••••" value={form.dbPassword} onChange={e => update('dbPassword', e.target.value)} /></div>
                <div>
                  <label className="cx-label">DB Name *</label>
                  <input className="cx-input cx-mono" style={{ borderColor: conflicts.dbName ? "#EF4444" : undefined }} placeholder="winbullSource" value={form.dbName} onChange={e => update('dbName', e.target.value)} />
                  {conflicts.dbName && (
                    <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle style={{ width: 12, height: 12 }} />
                      DB already used by <strong>{conflicts.dbName.existingProject}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgb(var(--border))', marginTop: '8px', paddingTop: '20px' }}>
              <div className="cx-flex-between" style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Socket</h3>
                <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(168,85,247,0.1)', color: '#A855F7' }}>WebSocket</span>
              </div>
              <div className="cx-grid-2">
                <div>
                  <label className="cx-label">WS Port * <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '9px' }}>(Native)</span></label>
                  <input className="cx-input cx-mono" style={{ borderColor: conflicts.wsPort ? "#EF4444" : undefined }} placeholder="e.g. 57124" value={form.wsPort} onChange={e => update('wsPort', e.target.value)} />
                  {conflicts.wsPort && (
                    <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle style={{ width: 12, height: 12 }} />
                      Port used by <strong>{conflicts.wsPort.existingProject}</strong>
                    </p>
                  )}
                </div>
                <div>
                  <label className="cx-label">Socket.IO Port * <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '9px' }}>(Redis)</span></label>
                  <input className="cx-input cx-mono" style={{ borderColor: conflicts.socketIoPort ? "#EF4444" : undefined }} placeholder="e.g. 7124" value={form.socketIoPort} onChange={e => update('socketIoPort', e.target.value)} />
                  {conflicts.socketIoPort && (
                    <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle style={{ width: 12, height: 12 }} />
                      Port used by <strong>{conflicts.socketIoPort.existingProject}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && !done && (
          <div className="cx-flex-col" style={{ gap: "20px" }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Review & Create</h2>
            {hasConflicts ? (
              <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <AlertTriangle style={{ width: '18px', height: '18px', color: '#EF4444', flexShrink: 0 }} />
                  <div><span style={{ fontSize: '14px', fontWeight: 700, color: '#EF4444' }}>Duplicate Conflicts Found!</span><br/><span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Fix these before creating the project:</span></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '28px' }}>
                  {Object.entries(conflicts).map(([key, c]) => (
                    <div key={key} style={{ fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444', flexShrink: 0 }} />
                      <strong>{c.field}</strong> — already used by "{c.existingProject}"
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check style={{ width: '18px', height: '18px', color: '#10B981' }} />
                <div><span style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>Ready to Create Project!</span><br/><span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>No conflicts found. Please review all details before submitting.</span></div>
              </div>
            )}
            {[{ title: '🔹 Basic Info', items: [['Project', form.name], ['Slug', form.clientSlug], ['Product', form.productType], ['Repo', form.repoUrl || '—'], ['Server', allServers.find((s: Record<string, unknown>) => String(s.id) === form.serverId)?.name as string || '—'], ['Server Path', form.serverPath || '—']] },
              { title: '🔹 Domain & Access', items: [['Domain', form.domain || '—'], ['Admin URL', form.adminBaseUrl || '—'], ['Admin User', form.adminUser || '—']] },
              { title: '🔹 Database', items: [['DB Host', form.dbHost || '—'], ['DB Name', form.dbName || '—'], ['DB User', form.dbUser || '—'], ['DB Port', form.dbPort || '3306']] },
              { title: '🔹 Socket', items: [['WS Port (Native)', form.wsPort || '—'], ['Socket.IO Port (Redis)', form.socketIoPort || '—']] },
            ].map((section, si) => (
              <div key={si} style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgb(var(--border))' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 12px' }}>{section.title}</h4>
                {section.items.map(([label, value], ii) => (
                  <div key={ii} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: ii < section.items.length - 1 ? '1px solid rgba(var(--border),0.3)' : 'none' }}>
                    <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {/* Done */}
        {done && (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Check style={{ width: '28px', height: '28px', color: '#10B981' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>Project Created!</h2>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Redirecting to project dashboard...
            </p>
          </div>
        )}
      </div>
      {/* Right sidebar preview */}
      {!done && previewPanel}
      </div>

      {/* ─── Navigation Buttons ─── */}
      {!done && (
        <div className="cx-flex-between" style={{ marginTop: "20px" }}>
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

          {step < 3 ? (
            <button
              onClick={() => {
                if (hasConflicts) { setShowConflictModal(true); return; }
                setStep(s => s + 1);
              }}
              disabled={!form.name.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 24px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600,
                color: '#fff',
                background: hasConflicts ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                border: 'none',
                cursor: !form.name.trim() ? 'not-allowed' : 'pointer',
                opacity: !form.name.trim() ? 0.5 : 1,
                boxShadow: hasConflicts ? '0 4px 14px rgba(239,68,68,0.3)' : '0 4px 14px rgba(var(--primary), 0.3)',
                transition: 'all 200ms',
              }}
            >
              {hasConflicts && <AlertTriangle style={{ width: '14px', height: '14px' }} />}
              {validating ? 'Checking...' : hasConflicts ? `${Object.keys(conflicts).length} Conflict${Object.keys(conflicts).length > 1 ? 's' : ''}` : 'Continue'}
              {!hasConflicts && <ArrowRight style={{ width: '14px', height: '14px' }} />}
            </button>
          ) : (
            <button
              onClick={() => {
                if (hasConflicts) { setShowConflictModal(true); return; }
                finish();
              }}
              disabled={saving || hasConflicts}
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

      {/* ─── Conflict Modal ─── */}
      {showConflictModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && setShowConflictModal(false)}>
          <div style={{ width: '480px', maxHeight: '80vh', borderRadius: '16px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgb(var(--border))', background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))' }}>
              <div className="cx-flex cx-items-center cx-gap-10">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Duplicate Conflicts</div>
                  <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{Object.keys(conflicts).length} conflict{Object.keys(conflicts).length > 1 ? 's' : ''} found — fix before continuing</div>
                </div>
              </div>
              <button onClick={() => setShowConflictModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px', borderRadius: '6px' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            {/* Conflict List */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '50vh' }}>
              {Object.entries(conflicts).map(([key, c]) => {
                const fieldLabels: Record<string, string> = { clientSlug: 'Client Slug', dbName: 'Database Name', wsPort: 'WebSocket Port', socketIoPort: 'Socket.io Port', serverPath: 'Server Path' };
                return (
                  <div key={key} style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{fieldLabels[key] || c.field}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '9px', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>DUPLICATE</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>{c.existingValue}</div>
                    <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>Already used by <strong style={{ color: 'rgb(var(--text-primary))' }}>{c.existingProject}</strong></div>
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgb(var(--border))', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConflictModal(false)} style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms' }}>
                Got it, I&apos;ll fix them
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
