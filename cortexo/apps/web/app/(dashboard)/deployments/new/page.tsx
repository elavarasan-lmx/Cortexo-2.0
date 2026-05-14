'use client';
import { useState } from 'react';
import { Rocket, Check, ArrowLeft, ArrowRight, Loader2, Save, GitBranch, Server, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 1, label: 'Configuration' },
  { id: 2, label: 'Options' },
  { id: 3, label: 'Review & Deploy' },
];


export default function DeployNewPage() {
  useAutoLoadToken();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [env, setEnv] = useState('production');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedServer, setSelectedServer] = useState('');
  const [branch, setBranch] = useState('main');
  const [commitTag, setCommitTag] = useState('HEAD (latest)');
  const [strategy, setStrategy] = useState('Rolling Update');
  const [notes, setNotes] = useState('');
  const [preCheck, setPreCheck] = useState(true);
  const [runTests, setRunTests] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);
  const [autoRollback, setAutoRollback] = useState(true);

  const { data: projects } = useApiData(() => api.getProjects(), { default: [] as any[] });
  const { data: servers } = useApiData(() => api.getServers(), { default: [] as any[] });

  const projName = (projects || []).find((p: any) => String(p.id) === selectedProject)?.name || 'Select project';
  const serverName = (servers || []).find((s: any) => String(s.id) === selectedServer)?.name || 'Select server';

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await api.triggerDeploy({
        projectId: selectedProject,
        serverId: Number(selectedServer) || undefined,
        branch,
        environment: env,
      });
      router.push('/deployments');
    } catch {}
    setDeploying(false);
  };

  const recentDeploys = [
    { id: '#1581', label: 'rollback api', color: '#F59E0B', time: '2m ago' },
    { id: '#1543', label: 'cortexo check', color: '#10B981', time: '1h ago' },
    { id: '#1581', label: 'rollback web', color: '#EF4444', time: '3h ago' },
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="cx-flex-between">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🚀 New Deployment
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Configure and trigger a new deployment to your infrastructure.
          </p>
        </div>
        <div className="cx-flex cx-gap-8">
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>✓ Deployment</span>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>⚡ Auto Deploy</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {steps.map((s, i) => {
          const isDone = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isDone ? '#10B981' : isCurrent ? '#7C3AED' : 'rgb(var(--surface-hover))',
                  border: isDone || isCurrent ? 'none' : '1px solid rgb(var(--border))',
                  color: isDone || isCurrent ? '#fff' : 'rgb(var(--text-muted))',
                  fontSize: '13px', fontWeight: 700,
                }}>
                  {isDone ? <Check style={{ width: '15px', height: '15px' }} /> : s.id}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', color: isCurrent ? '#7C3AED' : isDone ? '#10B981' : 'rgb(var(--text-muted))' }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', margin: '0 8px', backgroundColor: step > s.id ? '#10B981' : 'rgb(var(--border))', marginBottom: '20px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Main + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Left: Form */}
        <div className="cx-card cx-border" style={{ padding: '24px' }}>

          {/* Step 1: Configuration */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="cx-grid-2">
                <div>
                  <label className="cx-label">🗂 Project *</label>
                  <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="cx-input" style={{ cursor: 'pointer' }}>
                    <option value="">Select project...</option>
                    {(projects || []).map((p: any) => (<option key={p.id} value={p.id}>{p.name || p.slug}</option>))}
                  </select>
                </div>
                <div>
                  <label className="cx-label">🌿 Branch *</label>
                  <select value={branch} onChange={e => setBranch(e.target.value)} className="cx-input" style={{ cursor: 'pointer' }}>
                    <option>main</option><option>develop</option><option>staging</option>
                  </select>
                </div>
              </div>
              <div className="cx-grid-2">
                <div>
                  <label className="cx-label">🌐 Environment *</label>
                  <div className="cx-flex cx-gap-6">
                    {['Production', 'Staging', 'Development'].map(e => (
                      <button key={e} onClick={() => setEnv(e.toLowerCase())} style={{
                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        border: env === e.toLowerCase() ? '1.5px solid #7C3AED' : '1px solid rgb(var(--border))',
                        backgroundColor: env === e.toLowerCase() ? 'rgba(124,58,237,0.08)' : 'transparent',
                        color: env === e.toLowerCase() ? '#7C3AED' : 'rgb(var(--text-muted))',
                      }}>{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="cx-label">🖥 Server *</label>
                  <select value={selectedServer} onChange={e => setSelectedServer(e.target.value)} className="cx-input" style={{ cursor: 'pointer' }}>
                    <option value="">Select server...</option>
                    {(servers || []).map((s: any) => (<option key={s.id} value={s.id}>{s.name || s.hostname}</option>))}
                  </select>
                </div>
              </div>
              <div className="cx-grid-2">
                <div>
                  <label className="cx-label">🏷 Commit / Tag</label>
                  <input className="cx-input" style={{ fontFamily: "'JetBrains Mono', monospace" }} value={commitTag} onChange={e => setCommitTag(e.target.value)} />
                </div>
                <div>
                  <label className="cx-label">📋 Deploy Strategy</label>
                  <select className="cx-input" style={{ cursor: 'pointer' }} value={strategy} onChange={e => setStrategy(e.target.value)}>
                    <option>Rolling Update</option><option>Blue/Green</option><option>Canary</option><option>Recreate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="cx-label">📝 Deploy Notes</label>
                <textarea className="cx-input" style={{ minHeight: '70px', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace" }} placeholder="Add deployment notes or changelog..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Pre-Deploy Options */}
          {step === 2 && (
            <div className="cx-flex-col" style={{ gap: "16px" }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Pre-Deploy Options</h3>
              {[
                { label: 'Run pre-deploy script', desc: 'Execute setup scripts before deployment', checked: preCheck, toggle: () => setPreCheck(!preCheck) },
                { label: 'Run tests before deploy', desc: 'Abort deployment if tests fail', checked: runTests, toggle: () => setRunTests(!runTests) },
                { label: 'Notify on Slack', desc: 'Send deployment notification to Slack channel', checked: notifySlack, toggle: () => setNotifySlack(!notifySlack) },
                { label: 'Auto rollback on failure', desc: 'Automatically revert if health check fails', checked: autoRollback, toggle: () => setAutoRollback(!autoRollback) },
              ].map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))' }}>
                  <button onClick={opt.toggle} style={{
                    width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative', padding: 0,
                    backgroundColor: opt.checked ? '#7C3AED' : 'rgb(var(--border))', transition: 'background-color 200ms', flexShrink: 0,
                  }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '3px', left: opt.checked ? '21px' : '3px', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Review & Deploy */}
          {step === 3 && (
            <div className="cx-flex-col" style={{ gap: "16px" }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Review & Deploy</h3>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check style={{ width: '18px', height: '18px', color: '#10B981' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>Ready to Deploy!</div>
                  <div style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>All checks passed. Review details below.</div>
                </div>
              </div>
              {[
                { title: 'Configuration', items: [['Project', projName], ['Branch', branch], ['Environment', env], ['Server', serverName], ['Commit', commitTag], ['Strategy', strategy]] },
                { title: 'Options', items: [['Pre-deploy script', preCheck ? '✓ Enabled' : '✗ Disabled'], ['Run tests', runTests ? '✓ Enabled' : '✗ Disabled'], ['Slack notify', notifySlack ? '✓ Enabled' : '✗ Disabled'], ['Auto rollback', autoRollback ? '✓ Enabled' : '✗ Disabled']] },
              ].map((sec, si) => (
                <div key={si} style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgb(var(--border))' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px', color: '#7C3AED' }}>🔹 {sec.title}</h4>
                  {sec.items.map(([label, value], ii) => (
                    <div key={ii} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: ii < sec.items.length - 1 ? '1px solid rgba(var(--border),0.3)' : 'none' }}>
                      <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', textTransform: 'capitalize' }}>{value}</span>
                    </div>
                  ))}
                </div>
              ))}
              {notes && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', marginBottom: '4px' }}>DEPLOY NOTES</div>
                  <div style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace" }}>{notes}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Deploy Summary Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>
          {/* Summary */}
          <div className="cx-card cx-border">
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Deploy Summary</h4>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { l: 'Project', v: projName },
                { l: 'Branch', v: branch },
                { l: 'Environment', v: env },
                { l: 'Strategy', v: strategy },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'rgb(var(--text-muted))' }}>{r.l}</span>
                  <span style={{ fontWeight: 600, color: 'rgb(var(--text-primary))', textTransform: 'capitalize' }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Server */}
          <div className="cx-card cx-border">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Target Server</h4>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server style={{ width: '18px', height: '18px', color: '#10B981' }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{serverName}</div>
                  <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>prod · ap-south-1</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[{ v: '23%', l: 'CPU', c: '#10B981' }, { v: '4.2 GB', l: 'RAM', c: '#3B82F6' }, { v: '67%', l: 'Disk', c: '#F59E0B' }].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '8px', border: '1px solid rgb(var(--border))' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', fontWeight: 600, marginTop: '2px' }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Deploys */}
          <div className="cx-card cx-border">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Recent Deploys</h4>
            </div>
            <div style={{ padding: '8px 12px' }}>
              {recentDeploys.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderBottom: i < recentDeploys.length - 1 ? '1px solid rgba(var(--border),0.3)' : 'none' }}>
                  <div style={{ width: '4px', height: '28px', borderRadius: '2px', backgroundColor: d.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{d.id} — {d.label}</div>
                    <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{d.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/deployments')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-primary))' }}>
          {step === 1 ? 'Cancel' : <><ArrowLeft style={{ width: '14px', height: '14px' }} /> Back</>}
        </button>
        <div className="cx-flex cx-gap-10">
          {step === 3 && (
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-primary))' }}>
              <Save style={{ width: '14px', height: '14px' }} /> Save as Draft
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Next <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          ) : (
            <button onClick={handleDeploy} disabled={deploying} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: deploying ? 'not-allowed' : 'pointer', opacity: deploying ? 0.6 : 1 }}>
              {deploying ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Rocket style={{ width: '14px', height: '14px' }} />}
              {deploying ? 'Deploying...' : '🚀 Deploy Now'}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
