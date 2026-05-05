'use client';
import { useState } from 'react';
import { Rocket, Server, GitBranch, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function DeployNewPage() {
  useAutoLoadToken();
  const router = useRouter();
  const [deploying, setDeploying] = useState(false);
  const [env, setEnv] = useState('production');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedServer, setSelectedServer] = useState('');
  const [branch, setBranch] = useState('main');

  const { data: projects } = useApiData(() => api.getProjects(), { default: [] as any[] });
  const { data: servers } = useApiData(() => api.getServers(), { default: [] as any[] });

  const handleDeploy = async () => {
    if (!selectedProject && !selectedServer) return;
    setDeploying(true);
    try {
      await api.triggerDeploy({
        projectId: Number(selectedProject) || undefined,
        serverId: Number(selectedServer) || undefined,
        branch,
        environment: env,
      });
      router.push('/deployments');
    } catch {}
    setDeploying(false);
  };

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--border),0.1)',
    color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Rocket style={{ width: '22px', height: '22px', color: '#10B981' }} /> New Deployment
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Deploy your application to an environment</p>
      </div>
      <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', marginBottom: '6px', display: 'block' }}>Project</label>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={selectStyle}>
              <option value="">Select a project...</option>
              {(projects || []).map((p: any) => (
                <option key={p.id} value={p.id}>{p.name || p.slug}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', marginBottom: '6px', display: 'block' }}>Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)} style={selectStyle}>
              <option>main</option><option>develop</option><option>staging</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', marginBottom: '6px', display: 'block' }}>Target Server</label>
            <select value={selectedServer} onChange={e => setSelectedServer(e.target.value)} style={selectStyle}>
              <option value="">Select a server...</option>
              {(servers || []).map((s: any) => (
                <option key={s.id} value={s.id}>{s.name || s.hostname} ({s.ip || s.host})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', marginBottom: '6px', display: 'block' }}>Environment</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Production', 'Staging', 'Development'].map(e => (
                <button key={e} onClick={() => setEnv(e.toLowerCase())} style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  border: env === e.toLowerCase() ? '2px solid #10B981' : '1px solid rgb(var(--border))',
                  backgroundColor: env === e.toLowerCase() ? '#10B98112' : 'transparent',
                  color: env === e.toLowerCase() ? '#10B981' : 'rgb(var(--text-secondary))',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>{e}</button>
              ))}
            </div>
          </div>
          <button onClick={handleDeploy} disabled={deploying} style={{
            width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff',
            fontSize: '14px', fontWeight: 600, cursor: deploying ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginTop: '8px', opacity: deploying ? 0.6 : 1,
          }}>
            {deploying ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Rocket style={{ width: '16px', height: '16px' }} />}
            {deploying ? 'Deploying...' : 'Deploy Now'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
