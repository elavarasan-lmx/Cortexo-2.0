'use client';

import { useState, useEffect } from 'react';
import { Rocket, ArrowLeft, Save, Loader2, Trash2, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';
import { useModal } from '@/components/modal-provider';

export default function EditDeployPage() {
  const router = useRouter();
  const toast = useToastStore();
  const searchParams = useSearchParams();
  const deployId = searchParams.get('id');

  const { data: deployData, isLoading: loading } = useCortexoQuery(
    ['deployment', deployId],
    () => deployId ? api.getDeployment(deployId) : Promise.resolve({ data: null as null }),
    { enabled: !!deployId }
  );

  const [form, setForm] = useState({
    project: '', branch: 'main', server: '', environment: 'production',
    buildCmd: '', deployCmd: '', preDeployHook: '', postDeployHook: '',
    autoRollback: true, notifySlack: true, healthCheck: '/api/health',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (deployData) {
      const d = deployData as unknown as { [k: string]: string | boolean | number | undefined };
      setForm({
        project: String(d.projectName || d.project || ''),
        branch: String(d.branch || 'main'),
        server: String(d.serverName || d.server || ''),
        environment: String(d.environment || 'production'),
        buildCmd: String(d.buildCmd || ''),
        deployCmd: String(d.deployCmd || ''),
        preDeployHook: String(d.preDeployHook || ''),
        postDeployHook: String(d.postDeployHook || ''),
        autoRollback: Boolean(d.autoRollback ?? true),
        notifySlack: Boolean(d.notifySlack ?? true),
        healthCheck: String(d.healthCheck || '/api/health'),
      });
    }
  }, [deployData]);

  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleSave() {
    if (!deployId) return;
    setSaving(true);
    try {
      await api.updateDeployment(deployId, {
        branch: form.branch,
        environment: form.environment,
      });
      toast.success('Deployment Updated', 'Changes saved');
    } catch (err: unknown) {
      toast.error('Save Failed', err instanceof Error ? err.message : 'Could not update deployment');
    }
    setSaving(false);
  }

  const { confirm: confirmModal } = useModal();

  async function handleDelete() {
    if (!deployId) return;
    const ok = await confirmModal({ title: 'Delete Deployment', message: 'Delete this deployment? This cannot be undone.', variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    setDeleting(true);
    try {
      await api.deleteDeployment(deployId);
      toast.success('Deployment Deleted', 'Removed successfully');
      router.push('/deployments');
    } catch (err: unknown) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Could not delete deployment');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(var(--border),0.3)', borderTopColor: 'rgb(var(--primary))', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const d = deployData as unknown as { [k: string]: string | boolean | number | undefined } | null;

  return (
    <div className="cx-flex-col" style={{ gap: '24px' }}>
      <Link href="/deployments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none' }}><ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Deployments</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div className="cx-flex cx-items-center cx-gap-12">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Rocket style={{ width: '20px', height: '20px', color: '#fff' }} /></div>
          <div><h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0 }}>Edit Deploy {d?.id ? `#${String(d.id).slice(0, 6)}` : ''}</h1><span style={{ fontSize: '11px', fontWeight: 600, color: d?.status === 'success' ? '#10B981' : '#F59E0B', padding: '2px 8px', borderRadius: '4px', backgroundColor: d?.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>{d?.status || 'pending'}</span></div>
        </div>
        <div className="cx-flex cx-gap-10">
          <button onClick={handleDelete} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #EF4444', backgroundColor: 'transparent', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: deleting ? 'wait' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
            {deleting ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Trash2 style={{ width: '14px', height: '14px' }} />} Delete
          </button>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />} {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="cx-card cx-border">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}><h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Deploy Target</h3></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label className="cx-label">Project</label><input className="cx-input" value={form.project} onChange={e => u('project', e.target.value)} /></div>
              <div><label className="cx-label">Branch</label><div className="cx-flex cx-items-center cx-gap-6"><GitBranch style={{ width: '14px', height: '14px', color: '#7C3AED' }} /><input className="cx-input" style={{ flex: 1 }} value={form.branch} onChange={e => u('branch', e.target.value)} /></div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label className="cx-label">Server</label><input className="cx-input" value={form.server} onChange={e => u('server', e.target.value)} /></div>
              <div><label className="cx-label">Environment</label><select className="cx-input" style={{ cursor: 'pointer' }} value={form.environment} onChange={e => u('environment', e.target.value)}><option>production</option><option>staging</option><option>development</option></select></div>
            </div>
            <div><label className="cx-label">Health Check URL</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.healthCheck} onChange={e => u('healthCheck', e.target.value)} /></div>
          </div>
        </div>
        <div className="cx-card cx-border">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}><h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Build &amp; Hooks</h3></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label className="cx-label">Build Command</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.buildCmd} onChange={e => u('buildCmd', e.target.value)} /></div>
            <div><label className="cx-label">Deploy Command</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.deployCmd} onChange={e => u('deployCmd', e.target.value)} /></div>
            <div><label className="cx-label">Pre-Deploy Hook</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.preDeployHook} onChange={e => u('preDeployHook', e.target.value)} /></div>
            <div><label className="cx-label">Post-Deploy Hook</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.postDeployHook} onChange={e => u('postDeployHook', e.target.value)} /></div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
