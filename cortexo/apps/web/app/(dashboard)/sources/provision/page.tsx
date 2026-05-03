'use client';

import { useState, useEffect } from 'react';
import {
  Wand2, ChevronRight, ChevronLeft, Check, Loader2,
  User, Globe, Database, Settings, Bell, Radio,
  Lock, Smartphone, Mail, Shield, Eye, EyeOff,
  AlertTriangle, Sparkles, Code2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';
import { useToastStore } from '@/lib/toast-store';
import { useRouter } from 'next/navigation';

/* ── Step definitions ── */
const STEPS = [
  { key: 'identity', label: 'Identity', icon: User, color: '#EC4899' },
  { key: 'urls', label: 'URLs', icon: Globe, color: '#3B82F6' },
  { key: 'database', label: 'Database', icon: Database, color: '#10B981' },
  { key: 'rateFeed', label: 'Rate Feed', icon: Radio, color: '#F59E0B' },
  { key: 'socket', label: 'Socket', icon: Settings, color: '#06B6D4' },
  { key: 'encryption', label: 'Encryption', icon: Lock, color: '#EF4444' },
  { key: 'notifications', label: 'Notifications', icon: Bell, color: '#8B5CF6' },
  { key: 'mobileApps', label: 'Mobile', icon: Smartphone, color: '#14B8A6' },
  { key: 'review', label: 'Review', icon: Check, color: '#10B981' },
];

/* ── Field renderer based on JSON Schema property ── */
function SchemaField({ fieldKey, schema, value, onChange }: {
  fieldKey: string; schema: any; value: any; onChange: (v: any) => void;
}) {
  const isPassword = schema.format === 'password';
  const [showPw, setShowPw] = useState(false);
  const isEnum = !!schema.enum;
  const isNumber = schema.type === 'integer' || schema.type === 'number';

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '13px',
    borderRadius: '10px', border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))',
    outline: 'none', fontFamily: isPassword ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
    transition: 'border-color 200ms',
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '5px' }}>
        {schema.title || fieldKey}
        {schema.description && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: '6px', opacity: 0.7 }}>— {schema.description}</span>}
      </label>
      {isEnum ? (
        <select value={value ?? schema.default ?? ''} onChange={e => onChange(isNumber ? parseInt(e.target.value) : e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          {schema.enum.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type={isPassword && !showPw ? 'password' : isNumber ? 'number' : 'text'}
            value={value ?? schema.default ?? ''}
            onChange={e => onChange(isNumber ? parseInt(e.target.value) || 0 : e.target.value)}
            placeholder={schema.examples?.[0] || `Enter ${schema.title || fieldKey}`}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(var(--primary), 0.5)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; }}
          />
          {isPassword && (
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px' }}>
              {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProvisionPage() {
  useAutoLoadToken();
  const toast = useToastStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [schema, setSchema] = useState<any>(null);
  const [configData, setConfigData] = useState<Record<string, Record<string, any>>>({});
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [sourceId, setSourceId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPHP, setPreviewPHP] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load schema + source ID on mount
  useEffect(() => {
    (async () => {
      try {
        const schemaRes = await api.getSourceSchema('winbull');
        setSchema((schemaRes as any).data);
        const sourcesRes = await api.getSources();
        const sources = (sourcesRes as any).data || (sourcesRes as any);
        const winbull = (Array.isArray(sources) ? sources : []).find((s: any) => s.slug === 'winbull');
        if (winbull) setSourceId(winbull.id);
      } catch { /* schema not found, will show message */ }
    })();
  }, []);

  const currentStep = STEPS[step];
  const sectionSchema = schema?.properties?.[currentStep.key];
  const sectionFields = sectionSchema?.properties || {};
  const sectionData = configData[currentStep.key] || {};

  const updateField = (key: string, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [currentStep.key]: { ...prev[currentStep.key], [key]: value },
    }));
  };

  const validate = async () => {
    try {
      const res = await api.validateClientConfig({ sourceSlug: 'winbull', configData });
      const data = (res as any).data || res;
      setValidationErrors(data.errors || []);
      return data.valid;
    } catch { return true; }
  };

  const handleSubmit = async () => {
    const isValid = await validate();
    if (!isValid) { toast.error('Validation Failed', 'Please fix the errors below'); return; }

    const slug = configData.identity?.client;
    const displayName = configData.identity?.web_title;
    if (!slug || !displayName) { toast.error('Missing', 'Client slug and title are required'); return; }

    setSaving(true);
    try {
      await api.createClientConfig({
        sourceId: sourceId || 1,
        clientSlug: slug,
        displayName,
        domain: configData.urls?.web_base_url?.replace(/https?:\/\//, '').replace(/\/$/, '') || '',
        configData,
      });
      toast.success('Created!', `Client "${displayName}" has been provisioned`);
      router.push('/sources/clients');
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to create client config');
    }
    setSaving(false);
  };

  if (!schema) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wand2 style={{ width: '28px', height: '28px', color: '#8B5CF6' }} />
          New Client Wizard
        </h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Configure a new Winbull client step-by-step
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          const StepIcon = s.icon;
          return (
            <button key={s.key} onClick={() => setStep(i)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '10px', border: isActive ? `2px solid ${s.color}` : '1px solid rgb(var(--border))',
              backgroundColor: isActive ? `${s.color}12` : isDone ? 'rgba(16,185,129,0.06)' : 'rgb(var(--surface))',
              cursor: 'pointer', transition: 'all 200ms', whiteSpace: 'nowrap',
              fontSize: '12px', fontWeight: isActive ? 700 : 500,
              color: isActive ? s.color : isDone ? '#10B981' : 'rgb(var(--text-muted))',
            }}>
              {isDone ? <Check style={{ width: 14, height: 14 }} /> : <StepIcon style={{ width: 14, height: 14 }} />}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Form Area */}
      <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${currentStep.color}, ${currentStep.color}66)` }} />

        <div style={{ padding: '28px' }}>
          {currentStep.key !== 'review' ? (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => { const Icon = currentStep.icon; return <Icon style={{ width: 22, height: 22, color: currentStep.color }} />; })()}
                {sectionSchema?.title || currentStep.label}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginBottom: '24px' }}>
                Step {step + 1} of {STEPS.length} — fill in the fields below
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {Object.entries(sectionFields).map(([key, fieldSchema]: [string, any]) => (
                  <SchemaField key={key} fieldKey={key} schema={fieldSchema} value={sectionData[key]} onChange={v => updateField(key, v)} />
                ))}
              </div>
            </>
          ) : (
            /* Review Step */
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: 22, height: 22, color: '#10B981' }} />
                Review & Create
              </h2>
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginBottom: '20px' }}>
                Review your configuration before creating the client
              </p>

              {validationErrors.length > 0 && (
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#EF4444', marginBottom: '8px' }}>
                    <AlertTriangle style={{ width: 16, height: 16 }} /> Validation Errors
                  </div>
                  {validationErrors.map((e, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#EF4444', paddingLeft: '22px', marginBottom: '2px' }}>• {e}</div>
                  ))}
                </div>
              )}

              {/* Config Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {Object.entries(configData).filter(([, v]) => Object.keys(v || {}).length > 0).map(([section, values]) => (
                  <div key={section} style={{ borderRadius: '10px', border: '1px solid rgb(var(--border))', padding: '14px', backgroundColor: 'rgb(var(--surface))' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgb(var(--text-muted))', marginBottom: '8px' }}>{section}</h4>
                    {Object.entries(values).filter(([, v]) => v !== '' && v !== undefined).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: 'rgb(var(--text-secondary))' }}>{k}</span>
                        <span style={{ color: 'rgb(var(--text-primary))', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", textAlign: 'right', wordBreak: 'break-all', maxWidth: '180px' }}>
                          {schema?.properties?.[section]?.properties?.[k]?.format === 'password' ? '••••••' : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid rgb(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
            borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent',
            fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))',
            cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1,
          }}>
            <ChevronLeft style={{ width: 16, height: 16 }} /> Back
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep.key === 'review' && (
              <button onClick={handleSubmit} disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
                borderRadius: '12px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)', opacity: saving ? 0.6 : 1,
              }}>
                {saving ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: 16, height: 16 }} />}
                {saving ? 'Creating...' : 'Create Client'}
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button onClick={() => setStep(s => s + 1)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
                borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, color: '#fff',
                background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}CC)`,
                boxShadow: `0 4px 12px ${currentStep.color}30`,
              }}>
                Next <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
