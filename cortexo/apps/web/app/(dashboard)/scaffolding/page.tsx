'use client';

import { useState } from 'react';
import {
  Package, Smartphone, Key, CheckCircle, Loader2,
  ArrowRight, FolderPlus, Settings,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Client Info', icon: Smartphone },
  { id: 2, label: 'App Config', icon: Settings },
  { id: 3, label: 'Keystore', icon: Key },
  { id: 4, label: 'Generate', icon: Package },
];

export default function ScaffoldingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    clientName: '', shortCode: '', city: '', state: 'Tamil Nadu', country: 'IN',
    appType: 'ionic' as 'ionic' | 'flutter',
    packageName: '', targetSdk: '36', minSdk: '23',
    keystoreAlias: '', keystorePassword: 'logimax',
    organization: 'logimax',
  });
  const [logs, setLogs] = useState<string[]>([]);

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const autoFillFromName = (name: string) => {
    const code = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    updateForm('clientName', name);
    updateForm('shortCode', code);
    updateForm('packageName', `com.lmx.${code}`);
    updateForm('keystoreAlias', code);
  };

  const startGenerate = async () => {
    setGenerating(true);
    setLogs([]);
    const add = (msg: string) => setLogs(prev => [...prev, msg]);
    add(`📁 Creating project: WTApp-${form.shortCode}`);
    await new Promise(r => setTimeout(r, 800));
    add(`📄 Generating config.xml (${form.packageName})`);
    await new Promise(r => setTimeout(r, 600));
    add(`🔑 Creating keystore: ${form.keystoreAlias}.keystore`);
    await new Promise(r => setTimeout(r, 1000));
    add(`   Alias: ${form.keystoreAlias} | Password: ${form.keystorePassword}`);
    add(`   Location: ${form.city}, ${form.state}, ${form.country}`);
    await new Promise(r => setTimeout(r, 500));
    add(`📋 Writing key.properties, build.json, production.txt`);
    await new Promise(r => setTimeout(r, 600));
    add(`📱 Configuring ${form.appType} project...`);
    await new Promise(r => setTimeout(r, 800));
    add(`✅ Client "${form.clientName}" scaffolded successfully!`);
    add(`📂 Output: /WTApp/WTApp-${form.shortCode}/`);
    setGenerating(false);
    setDone(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px', boxSizing: 'border-box',
    border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
    fontSize: '13px', fontFamily: 'Inter, sans-serif', color: 'rgb(var(--text-primary))', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))',
    fontFamily: 'Inter, sans-serif', marginBottom: '6px', display: 'block',
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: '0 0 8px' }}>
          🏗️ Client Scaffolding
        </h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif', margin: 0 }}>
          Onboard a new client in minutes — auto-generates keystore, config, and project files.
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div onClick={() => !generating && setCurrentStep(step.id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', cursor: generating ? 'default' : 'pointer',
              backgroundColor: currentStep === step.id ? 'rgb(var(--primary))' : currentStep > step.id ? 'rgba(16,185,129,0.1)' : 'rgba(var(--text-muted), 0.08)',
              color: currentStep === step.id ? '#fff' : currentStep > step.id ? '#10B981' : 'rgb(var(--text-muted))',
              transition: 'all 200ms', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {currentStep > step.id ? <CheckCircle style={{ width: '14px', height: '14px' }} /> : <step.icon style={{ width: '14px', height: '14px' }} />}
              {step.label}
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > step.id ? '#10B981' : 'rgb(var(--border))', borderRadius: '1px' }} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', padding: '28px' }}>
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: 0 }}>Client Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Client Name *</label><input style={inputStyle} placeholder="e.g. MNT Traders" value={form.clientName} onChange={e => autoFillFromName(e.target.value)} /></div>
              <div><label style={labelStyle}>Short Code (auto)</label><input style={inputStyle} value={form.shortCode} onChange={e => updateForm('shortCode', e.target.value)} /></div>
              <div><label style={labelStyle}>City *</label><input style={inputStyle} placeholder="e.g. Salem" value={form.city} onChange={e => updateForm('city', e.target.value)} /></div>
              <div><label style={labelStyle}>State</label><input style={inputStyle} value={form.state} onChange={e => updateForm('state', e.target.value)} /></div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: 0 }}>App Configuration</h2>
            <div>
              <label style={labelStyle}>App Type *</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['ionic', 'flutter'] as const).map(type => (
                  <button key={type} onClick={() => updateForm('appType', type)} style={{
                    flex: 1, padding: '16px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    border: form.appType === type ? '2px solid rgb(var(--primary))' : '1px solid rgb(var(--border))',
                    backgroundColor: form.appType === type ? 'rgba(var(--primary), 0.05)' : 'transparent',
                    fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600,
                    color: form.appType === type ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                  }}>
                    {type === 'ionic' ? '⚡ Ionic' : '💙 Flutter'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Package Name</label><input style={inputStyle} value={form.packageName} onChange={e => updateForm('packageName', e.target.value)} /></div>
              <div><label style={labelStyle}>Target SDK</label><input style={inputStyle} value={form.targetSdk} onChange={e => updateForm('targetSdk', e.target.value)} /></div>
              <div><label style={labelStyle}>Min SDK</label><input style={inputStyle} value={form.minSdk} onChange={e => updateForm('minSdk', e.target.value)} /></div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: 0 }}>Keystore Configuration</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={labelStyle}>Alias</label><input style={inputStyle} value={form.keystoreAlias} onChange={e => updateForm('keystoreAlias', e.target.value)} /></div>
              <div><label style={labelStyle}>Password</label><input style={inputStyle} value={form.keystorePassword} onChange={e => updateForm('keystorePassword', e.target.value)} /></div>
              <div><label style={labelStyle}>Organization</label><input style={inputStyle} value={form.organization} onChange={e => updateForm('organization', e.target.value)} /></div>
              <div><label style={labelStyle}>Keystore File (auto)</label><input style={{ ...inputStyle, opacity: 0.6 }} value={`${form.keystoreAlias}.keystore`} readOnly /></div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0d1117', border: '1px solid #21262d' }}>
              <span style={{ fontSize: '10px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>keytool command preview:</span>
              <code style={{ fontSize: '11px', color: '#c9d1d9', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.6, wordBreak: 'break-all' }}>
                keytool -genkey -v -keystore {form.keystoreAlias || '___'}.keystore -alias {form.keystoreAlias || '___'} -keyalg RSA -keysize 2048 -validity 10000 -storepass {form.keystorePassword} -keypass {form.keystorePassword}
              </code>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: 0 }}>
              {done ? '✅ Scaffolding Complete!' : 'Review & Generate'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { l: 'Client', v: form.clientName }, { l: 'Type', v: form.appType.toUpperCase() },
                { l: 'Package', v: form.packageName }, { l: 'Keystore', v: `${form.keystoreAlias}.keystore` },
                { l: 'Location', v: `${form.city}, ${form.state}` }, { l: 'Password', v: form.keystorePassword },
              ].map(item => (
                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(var(--text-muted), 0.04)', border: '1px solid rgb(var(--border))' }}>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{item.l}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'JetBrains Mono, monospace' }}>{item.v}</span>
                </div>
              ))}
            </div>
            {!done && (
              <button onClick={startGenerate} disabled={generating} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '14px', borderRadius: '10px', border: 'none', cursor: generating ? 'default' : 'pointer',
                fontSize: '14px', fontWeight: 600, color: '#fff', width: '100%',
                backgroundColor: generating ? '#6B7280' : '#10B981', fontFamily: 'Inter, sans-serif',
              }}>
                {generating ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Generating...</> : <><FolderPlus style={{ width: '16px', height: '16px' }} /> Generate Client Project</>}
              </button>
            )}
            {logs.length > 0 && (
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#0d1117', border: '1px solid #21262d', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', lineHeight: 1.8, color: '#c9d1d9', maxHeight: '250px', overflowY: 'auto' }}>
                {logs.map((line, i) => (
                  <div key={i} style={{ color: line.includes('✅') ? '#3fb950' : line.includes('📂') ? '#d2a8ff' : '#c9d1d9' }}>{line}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgb(var(--border))' }}>
          <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1 || generating}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgb(var(--border))', cursor: currentStep === 1 ? 'default' : 'pointer', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-secondary))', backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', opacity: currentStep === 1 ? 0.4 : 1 }}>
            ← Back
          </button>
          {currentStep < 4 && (
            <button onClick={() => setCurrentStep(currentStep + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: 'rgb(var(--primary))', fontFamily: 'Inter, sans-serif' }}>
              Next <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
