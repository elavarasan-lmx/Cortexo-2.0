'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Server, FileCode, CheckCircle, XCircle, Loader2, FolderSearch, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface DeployConfig {
  id: number;
  projectId: string;
  serverId: number;
  clientSlug: string;
  domain: string;
  deployPath: string;
  deployUser: string;
}

interface TargetResult {
  clientSlug: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  filesProcessed: number;
  errors: string[];
  durationMs: number;
  fileStatuses: Record<string, 'pending' | 'running' | 'success' | 'failed' | 'skipped'>;
}

// ── Styles ────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(var(--surface), 0.6)', borderRadius: '16px', border: '1px solid rgba(var(--border), 0.15)',
  padding: '24px', backdropFilter: 'blur(20px)',
};
const label: React.CSSProperties = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: 'rgba(var(--foreground), 0.5)', marginBottom: '8px' };
const input: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(var(--border), 0.2)',
  background: 'rgba(var(--background), 0.5)', color: 'rgb(var(--foreground))', fontSize: '13px', outline: 'none',
};
const btn = (primary = false): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
  border: primary ? 'none' : '1px solid rgba(var(--border), 0.2)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
  color: primary ? '#fff' : 'rgb(var(--foreground))',
  background: primary ? 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))' : 'rgba(var(--surface), 0.8)',
});
const chip = (selected: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
  fontSize: '12px', fontWeight: 500, transition: 'all 0.2s',
  border: selected ? '1px solid rgba(var(--primary), 0.5)' : '1px solid rgba(var(--border), 0.15)',
  background: selected ? 'rgba(var(--primary), 0.15)' : 'rgba(var(--surface), 0.4)',
  color: selected ? 'rgb(var(--primary))' : 'rgba(var(--foreground), 0.7)',
});
const fileItem = (selected: boolean): React.CSSProperties => ({
  padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace',
  background: selected ? 'rgba(var(--primary), 0.1)' : 'transparent',
  color: selected ? 'rgb(var(--primary))' : 'rgba(var(--foreground), 0.7)',
  borderLeft: selected ? '2px solid rgb(var(--primary))' : '2px solid transparent',
});

export default function FilePushPage() {
  useAutoLoadToken();
  const router = useRouter();
  const toast = useToastStore();

  // Data
  const { data: servers } = useApiData(() => api.getServers());
  const { data: deployConfigs } = useApiData(() => api.getDeployConfigs());

  // Form state
  const [sourceServerId, setSourceServerId] = useState<number>(0);
  const [sourcePath, setSourcePath] = useState('/var/www/html/winbullSource');
  const [baseSlug, setBaseSlug] = useState('lmxtrade');
  const [applySlugReplace, setApplySlugReplace] = useState(true);
  const [restartPm2, setRestartPm2] = useState(false);
  const [backupFirst, setBackupFirst] = useState(true);

  // File selection
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileSearchPattern, setFileSearchPattern] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Target selection
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]); // deploy config IDs

  // Push state
  const [pushing, setPushing] = useState(false);
  const [targetResults, setTargetResults] = useState<TargetResult[]>([]);
  const [pushComplete, setPushComplete] = useState(false);
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  // Load files from source server
  const loadFiles = useCallback(async () => {
    if (!sourceServerId) { toast.error('Select source server'); return; }
    setLoadingFiles(true);
    try {
      const res = await api.listSourceFiles(sourceServerId, sourcePath, fileSearchPattern || undefined);
      setAvailableFiles(res.data || []);
      if ((res.data || []).length === 0) toast.info('No files found', 'Try a different path or pattern');
    } catch (err: any) {
      toast.error('Failed to load files', err.message);
    } finally {
      setLoadingFiles(false);
    }
  }, [sourceServerId, sourcePath, fileSearchPattern, toast]);

  const toggleFile = (f: string) => {
    setSelectedFiles(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllTargets = () => {
    const configs = (deployConfigs || []) as DeployConfig[];
    if (selectedTargets.length === configs.length) setSelectedTargets([]);
    else setSelectedTargets(configs.map(c => String(c.id)));
  };

  // Push files via SSE
  const startPush = useCallback(() => {
    if (selectedFiles.length === 0) { toast.error('Select at least one file'); return; }
    if (selectedTargets.length === 0) { toast.error('Select at least one target client'); return; }

    const configs = (deployConfigs || []) as DeployConfig[];
    const targets = selectedTargets.map(id => {
      const cfg = configs.find(c => String(c.id) === id);
      return cfg ? { projectId: cfg.projectId, serverId: cfg.serverId, deployPath: cfg.deployPath, clientSlug: cfg.clientSlug } : null;
    }).filter(Boolean);

    if (targets.length === 0) { toast.error('Invalid targets'); return; }

    setPushing(true);
    setPushComplete(false);
    setTargetResults(targets.map(t => ({
      clientSlug: t!.clientSlug, status: 'pending', filesProcessed: 0, errors: [], durationMs: 0,
      fileStatuses: Object.fromEntries(selectedFiles.map(f => [f, 'pending' as const])),
    })));

    const body = JSON.stringify({
      sourceServerId, sourcePath, files: selectedFiles, targets, baseSlug, applySlugReplace, restartPm2, backupFirst,
    });

    fetch(`${API_BASE}/file-push`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      .then(response => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function processChunk() {
          reader?.read().then(({ done, value }) => {
            if (done) { setPushing(false); setPushComplete(true); return; }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const evt = JSON.parse(line.slice(6));
                setTargetResults(prev => {
                  const next = [...prev];
                  if (evt.type === 'target_start') {
                    if (next[evt.index]) next[evt.index] = { ...next[evt.index], status: 'running' };
                  } else if (evt.type === 'file_done' && next[evt.targetIndex]) {
                    const t = { ...next[evt.targetIndex] };
                    t.fileStatuses = { ...t.fileStatuses, [selectedFiles[evt.fileIndex]]: evt.status };
                    next[evt.targetIndex] = t;
                  } else if (evt.type === 'target_done') {
                    if (next[evt.index]) {
                      next[evt.index] = { ...next[evt.index], status: evt.status, filesProcessed: evt.filesProcessed || 0, errors: evt.errors || [], durationMs: evt.durationMs || 0 };
                    }
                  } else if (evt.type === 'complete') {
                    setPushComplete(true);
                    setPushing(false);
                  }
                  return next;
                });
              } catch { /* ignore parse errors */ }
            }
            processChunk();
          });
        }
        processChunk();
      })
      .catch(err => {
        toast.error('Push failed', err.message);
        setPushing(false);
      });
  }, [selectedFiles, selectedTargets, deployConfigs, sourceServerId, sourcePath, baseSlug, applySlugReplace, restartPm2, backupFirst, toast]);

  const configs = (deployConfigs || []) as DeployConfig[];
  const serverList = (servers || []) as { id: number; name: string }[];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => router.push('/pipelines')} style={{ ...btn(), padding: '8px' }}><ArrowLeft style={{ width: 16, height: 16 }} /></button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--foreground))' }}>File Push</h1>
          <p style={{ fontSize: '13px', color: 'rgba(var(--foreground), 0.5)', marginTop: '2px' }}>Push bug fixes from source to client servers</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Source + Files */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Source Config */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Server style={{ width: 16, height: 16, color: 'rgb(var(--primary))' }} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Source</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={label}>Source Server</div>
                <select value={sourceServerId} onChange={e => setSourceServerId(Number(e.target.value))} style={input}>
                  <option value={0}>Select server...</option>
                  {serverList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <div style={label}>Source Path</div>
                <input value={sourcePath} onChange={e => setSourcePath(e.target.value)} style={input} placeholder="/var/www/html/winbullSource" />
              </div>
              <div>
                <div style={label}>Base Slug (in source files)</div>
                <input value={baseSlug} onChange={e => setBaseSlug(e.target.value)} style={input} placeholder="lmxtrade" />
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: 'rgba(var(--foreground), 0.7)' }}>
                  <input type="checkbox" checked={applySlugReplace} onChange={e => setApplySlugReplace(e.target.checked)} /> Auto slug replace
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: 'rgba(var(--foreground), 0.7)' }}>
                  <input type="checkbox" checked={restartPm2} onChange={e => setRestartPm2(e.target.checked)} /> Restart PM2
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: 'rgba(var(--foreground), 0.7)' }}>
                  <input type="checkbox" checked={backupFirst} onChange={e => setBackupFirst(e.target.checked)} /> Backup first
                </label>
              </div>
            </div>
          </div>

          {/* File Browser */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode style={{ width: 16, height: 16, color: 'rgb(var(--agent))' }} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Files</span>
                {selectedFiles.length > 0 && (
                  <span style={{ fontSize: '11px', background: 'rgba(var(--primary), 0.15)', color: 'rgb(var(--primary))', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    {selectedFiles.length} selected
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input value={fileSearchPattern} onChange={e => setFileSearchPattern(e.target.value)} style={{ ...input, flex: 1 }} placeholder="*.php or leave empty for recent" />
              <button onClick={loadFiles} disabled={loadingFiles} style={btn()}>
                {loadingFiles ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <FolderSearch style={{ width: 14, height: 14 }} />}
                Scan
              </button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {availableFiles.length === 0 && (
                <p style={{ fontSize: '12px', color: 'rgba(var(--foreground), 0.4)', textAlign: 'center', padding: '20px' }}>
                  Click Scan to load files from source server
                </p>
              )}
              {availableFiles.map(f => (
                <div key={f} onClick={() => toggleFile(f)} style={fileItem(selectedFiles.includes(f))}>{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Targets + Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target Clients */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload style={{ width: 16, height: 16, color: 'rgb(var(--success))' }} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Target Clients</span>
              </div>
              <button onClick={selectAllTargets} style={{ ...btn(), padding: '4px 10px', fontSize: '11px' }}>
                {selectedTargets.length === configs.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            {configs.length === 0 && (
              <p style={{ fontSize: '12px', color: 'rgba(var(--foreground), 0.4)', textAlign: 'center', padding: '20px' }}>
                No deploy configs found. Add them in Deployments &rarr; Sources.
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {configs.map(cfg => (
                <div key={cfg.id} onClick={() => toggleTarget(String(cfg.id))} style={chip(selectedTargets.includes(String(cfg.id)))}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: selectedTargets.includes(String(cfg.id)) ? 'rgb(var(--primary))' : 'rgba(var(--foreground), 0.2)' }} />
                  {cfg.clientSlug}
                  {cfg.domain && <span style={{ fontSize: '10px', opacity: 0.5 }}>{cfg.domain}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Push Button */}
          <button onClick={startPush} disabled={pushing || selectedFiles.length === 0 || selectedTargets.length === 0}
            style={{ ...btn(true), justifyContent: 'center', padding: '14px', fontSize: '14px', borderRadius: '14px', opacity: (pushing || selectedFiles.length === 0 || selectedTargets.length === 0) ? 0.5 : 1 }}>
            {pushing ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Pushing...</> : <><Upload style={{ width: 16, height: 16 }} /> Push {selectedFiles.length} file(s) to {selectedTargets.length} client(s)</>}
          </button>

          {/* Progress */}
          {targetResults.length > 0 && (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Progress</span>
                {pushComplete && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600,
                    background: targetResults.every(r => r.status === 'success') ? 'rgba(var(--success), 0.15)' : 'rgba(var(--danger), 0.15)',
                    color: targetResults.every(r => r.status === 'success') ? 'rgb(var(--success))' : 'rgb(var(--danger))',
                  }}>
                    {targetResults.filter(r => r.status === 'success').length}/{targetResults.length} Done
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {targetResults.map((tr, i) => (
                  <div key={tr.clientSlug}>
                    <div onClick={() => setExpandedTarget(expandedTarget === tr.clientSlug ? null : tr.clientSlug)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                        background: tr.status === 'success' ? 'rgba(var(--success), 0.06)' : tr.status === 'failed' ? 'rgba(var(--danger), 0.06)' : 'rgba(var(--surface), 0.4)',
                        border: '1px solid rgba(var(--border), 0.1)',
                      }}>
                      {tr.status === 'pending' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(var(--foreground), 0.2)' }} />}
                      {tr.status === 'running' && <Loader2 style={{ width: 16, height: 16, color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />}
                      {tr.status === 'success' && <CheckCircle style={{ width: 16, height: 16, color: 'rgb(var(--success))' }} />}
                      {tr.status === 'failed' && <XCircle style={{ width: 16, height: 16, color: 'rgb(var(--danger))' }} />}
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{tr.clientSlug}</span>
                      {tr.durationMs > 0 && <span style={{ fontSize: '11px', color: 'rgba(var(--foreground), 0.4)' }}>{(tr.durationMs / 1000).toFixed(1)}s</span>}
                      {tr.filesProcessed > 0 && <span style={{ fontSize: '11px', color: 'rgba(var(--foreground), 0.5)' }}>{tr.filesProcessed} files</span>}
                      {expandedTarget === tr.clientSlug ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronRight style={{ width: 14, height: 14 }} />}
                    </div>
                    {expandedTarget === tr.clientSlug && (
                      <div style={{ padding: '8px 12px 8px 38px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Object.entries(tr.fileStatuses).map(([file, status]) => (
                          <div key={file} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
                            {status === 'success' && <CheckCircle style={{ width: 12, height: 12, color: 'rgb(var(--success))' }} />}
                            {status === 'failed' && <XCircle style={{ width: 12, height: 12, color: 'rgb(var(--danger))' }} />}
                            {status === 'skipped' && <span style={{ width: 12, height: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>-</span>}
                            {status === 'running' && <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />}
                            {status === 'pending' && <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(var(--foreground), 0.15)' }} />}
                            <span style={{ color: 'rgba(var(--foreground), 0.6)' }}>{file}</span>
                          </div>
                        ))}
                        {tr.errors.length > 0 && tr.errors.map((err, ei) => (
                          <div key={ei} style={{ fontSize: '11px', color: 'rgb(var(--danger))', marginTop: '4px' }}>{err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pushComplete && (
            <button onClick={() => { setTargetResults([]); setPushComplete(false); }} style={{ ...btn(), justifyContent: 'center' }}>
              <RotateCcw style={{ width: 14, height: 14 }} /> Push Again
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
