'use client';

import { useState, useEffect } from 'react';
import { Server, Save, ArrowLeft, Loader2, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';
import { useModal } from '@/components/modal-provider';


export default function EditServerPage() {
  const router = useRouter();
  const toast = useToastStore();
  const searchParams = useSearchParams();
  const serverId = searchParams.get('id');

  const { data: serverData, isLoading: loading } = useCortexoQuery(
    ['server', serverId],
    () => api.getServer(Number(serverId!)),
    { enabled: !!serverId }
  );

  const [form, setForm] = useState({
    name: '', privateIp: '', publicAddress: '', sshPort: '22', sshUser: 'ubuntu',
    provider: 'aws', region: '', os: '',
    sshKeyPath: '', tags: '', description: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Populate form when server data loads
  useEffect(() => {
    if (serverData) {
      const s = serverData as Record<string, string | number | undefined>;
      setForm({
        name: s.name || '',
        privateIp: s.privateIp || '',
        publicAddress: s.publicAddress || '',
        sshPort: String(s.sshPort || 22),
        sshUser: s.sshUser || 'ubuntu',
        provider: s.provider || 'aws',
        region: s.region || '',
        os: s.os || '',
        sshKeyPath: s.sshKeyPath || '',
        tags: s.tags || '',
        description: s.description || '',
      });
    }
  }, [serverData]);

  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleSave() {
    if (!serverId) return;
    setSaving(true);
    try {
      await api.updateServer(Number(serverId), {
        name: form.name,
        privateIp: form.privateIp,
        publicAddress: form.publicAddress,
        sshUser: form.sshUser,
        sshKeyPath: form.sshKeyPath,
        description: form.description,
      } as Partial<Server> & Record<string, string>);
      toast.success('Server Updated', `${form.name} saved successfully`);
    } catch (err: unknown) {
      toast.error('Save Failed', err instanceof Error ? err.message : 'Could not update server');
    }
    setSaving(false);
  }

  const { confirm: confirmModal } = useModal();

  async function handleDelete() {
    if (!serverId) return;
    const ok = await confirmModal({ title: 'Delete Server', message: `Delete server "${form.name}"? This cannot be undone.`, variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    setDeleting(true);
    try {
      await api.deleteServer(Number(serverId));
      toast.success('Server Deleted', `${form.name} removed`);
      router.push('/servers');
    } catch (err: unknown) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Could not delete server');
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

  if (!serverData && serverId) {
    return (
      <div>
        <Link href="/servers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Servers
        </Link>
        <div className="cx-card cx-border" style={{ padding: '60px 24px', marginTop: '16px', textAlign: 'center' }}>
          <Server style={{ width: '40px', height: '40px', color: 'rgb(var(--text-muted))', margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 6px' }}>Server not found</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Server ID "{serverId}" does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cx-flex-col" style={{ gap: "24px" }}>
      {/* Breadcrumb */}
      <Link href="/servers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Servers
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div className="cx-flex cx-items-center cx-gap-12">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0 }}>Edit Server: {form.name || 'Untitled'}</h1>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.1)' }}>● Active</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDelete} disabled={deleting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #EF4444', backgroundColor: 'transparent', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: deleting ? 'wait' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
            {deleting ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Trash2 style={{ width: '14px', height: '14px' }} />} Delete
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Connection */}
        <div className="cx-card cx-border">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Connection Details</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label className="cx-label">Server Name</label><input className="cx-input" value={form.name} onChange={e => u('name', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div><label className="cx-label">Private IP</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.privateIp} onChange={e => u('privateIp', e.target.value)} /></div>
              <div><label className="cx-label">SSH Port</label><input className="cx-input" value={form.sshPort} onChange={e => u('sshPort', e.target.value)} /></div>
            </div>
            <div><label className="cx-label">Public Address</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.publicAddress} onChange={e => u('publicAddress', e.target.value)} /></div>
            <div><label className="cx-label">SSH User</label><input className="cx-input" value={form.sshUser} onChange={e => u('sshUser', e.target.value)} /></div>
            <div><label className="cx-label">SSH Key Path</label><input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={form.sshKeyPath} onChange={e => u('sshKeyPath', e.target.value)} /></div>
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="cx-flex-col" style={{ gap: "16px" }}>
          <div className="cx-card cx-border">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Server Metadata</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="cx-label">Provider</label>
                <select className="cx-input" style={{ cursor: "pointer" }} value={form.provider} onChange={e => u('provider', e.target.value)}>
                  <option value="aws">AWS (EC2)</option><option value="gcp">Google Cloud</option><option value="azure">Azure</option><option value="digitalocean">DigitalOcean</option><option value="hetzner">Hetzner</option><option value="custom">Custom</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="cx-label">Region</label><input className="cx-input" value={form.region} onChange={e => u('region', e.target.value)} /></div>
                <div><label className="cx-label">OS</label><input className="cx-input" value={form.os} onChange={e => u('os', e.target.value)} /></div>
              </div>
              <div><label className="cx-label">Description</label><textarea className="cx-input" style={{ minHeight: "60px", resize: "vertical" }} value={form.description} onChange={e => u('description', e.target.value)} /></div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
