'use client';

import { useState } from 'react';
import { Rocket, Server, CheckCircle, XCircle, Loader2, Play, GitBranch, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, useProjectLookup, resolveProjectName, timeAgo } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';

export default function BatchDeployPage() {
  useAutoLoadToken();
  const toast = useToastStore();
  const { data: projects } = useApiData(() => api.getProjects());
  const { data: targets } = useApiData(() => api.getDeployTargets());
  const { lookup } = useProjectLookup();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [branch, setBranch] = useState('main');
  const [environment, setEnvironment] = useState('production');
  const [deploying, setDeploying] = useState(false);
  const [results, setResults] = useState<{ projectId: string; status: 'success' | 'failed' | 'pending'; message: string }[]>([]);

  const projectList = (projects || []) as any[];
  const targetList = (targets || []) as any[];

  const toggleProject = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === projectList.length) setSelected(new Set());
    else setSelected(new Set(projectList.map((p: any) => p.id)));
  };

  const runBatch = async () => {
    setDeploying(true);
    const newResults: typeof results = [];
    for (const projectId of selected) {
      try {
        await api.triggerDeploy({ projectId, branch, environment, remotePath: '/var/www/html' });
        newResults.push({ projectId, status: 'success', message: 'Deploy triggered' });
      } catch (err: any) {
        newResults.push({ projectId, status: 'failed', message: err.message || 'Failed' });
      }
      setResults([...newResults]);
    }
    setDeploying(false);
    const successCount = newResults.filter(r => r.status === 'success').length;
    const failCount = newResults.filter(r => r.status === 'failed').length;
    if (failCount === 0) toast.success('Batch Complete', `All ${successCount} deploys triggered.`);
    else toast.warning('Batch Finished', `${successCount} succeeded, ${failCount} failed.`);
  };

  const inputStyle: React.CSSProperties = { padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: 'rgb(var(--text-muted))', marginBottom: '6px', letterSpacing: '0.04em' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Batch Deploy</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))' }}>Deploy multiple projects simultaneously. {selected.size} of {projectList.length} selected.</p>
        </div>
        <button onClick={runBatch} disabled={deploying || selected.size === 0} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
          background: deploying ? '#F59E0B' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
          opacity: selected.size === 0 ? 0.5 : 1,
          boxShadow: '0 4px 12px rgba(var(--primary), 0.3)',
        }}>
          {deploying ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <Rocket style={{ width: 15, height: 15 }} />}
          {deploying ? `Deploying ${selected.size}...` : `Deploy ${selected.size} Projects`}
        </button>
      </div>

      {/* Config row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', marginBottom: '20px', padding: '16px', borderRadius: '14px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
        <div>
          <label style={labelStyle}>Branch</label>
          <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="main" style={{ ...inputStyle, width: '100%', fontFamily: "'JetBrains Mono', monospace" }} />
        </div>
        <div>
          <label style={labelStyle}>Environment</label>
          <select value={environment} onChange={e => setEnvironment(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={selectAll} style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
            {selected.size === projectList.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Server info bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', backgroundColor: 'rgba(var(--primary), 0.04)', border: '1px solid rgba(var(--primary), 0.12)', marginBottom: '16px' }}>
        <Server style={{ width: 14, height: 14, color: 'rgb(var(--primary))' }} />
        <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>
          {targetList.length} deploy target{targetList.length !== 1 ? 's' : ''} available: {targetList.map((t: any) => t.name).join(', ') || 'None configured'}
        </span>
      </div>

      {/* Project grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
        {projectList.map((p: any) => {
          const isSelected = selected.has(p.id);
          const result = results.find(r => r.projectId === p.id);
          return (
            <div key={p.id} onClick={() => !deploying && toggleProject(p.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
              borderRadius: '12px', cursor: deploying ? 'default' : 'pointer',
              border: `1px solid ${isSelected ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
              backgroundColor: isSelected ? 'rgba(var(--primary), 0.04)' : 'rgb(var(--surface))',
              transition: 'all 150ms',
            }}>
              {/* Checkbox */}
              <div style={{
                width: '22px', height: '22px', borderRadius: '7px', flexShrink: 0,
                border: `2px solid ${isSelected ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
                backgroundColor: isSelected ? 'rgb(var(--primary))' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms',
              }}>
                {isSelected && <CheckCircle style={{ width: 14, height: 14, color: '#fff' }} />}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{p.slug || p.repoUrl || '—'}</div>
              </div>
              {/* Result indicator */}
              {result && (
                result.status === 'success'
                  ? <CheckCircle style={{ width: 16, height: 16, color: '#10B981', flexShrink: 0 }} />
                  : <XCircle style={{ width: 16, height: 16, color: '#EF4444', flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* No projects */}
      {projectList.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 32px', textAlign: 'center', borderRadius: '14px', border: '1px dashed rgb(var(--border))' }}>
          <Rocket style={{ width: 32, height: 32, color: 'rgb(var(--text-muted))', opacity: 0.4 }} />
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>No projects available. Add projects first to use batch deploy.</p>
        </div>
      )}

      {/* Results summary */}
      {results.length > 0 && (
        <div style={{ marginTop: '24px', borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rocket style={{ width: 14, height: 14, color: 'rgb(var(--primary))' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Batch Results</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', marginLeft: 'auto' }}>
              {results.filter(r => r.status === 'success').length}/{results.length} succeeded
            </span>
          </div>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: i < results.length - 1 ? '1px solid rgba(var(--border), 0.4)' : 'none' }}>
              {r.status === 'success' ? <CheckCircle style={{ width: 14, height: 14, color: '#10B981' }} /> : <XCircle style={{ width: 14, height: 14, color: '#EF4444' }} />}
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{resolveProjectName(r.projectId, lookup)}</span>
              <span style={{ fontSize: '12px', color: r.status === 'success' ? '#10B981' : '#EF4444', marginLeft: 'auto' }}>{r.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
