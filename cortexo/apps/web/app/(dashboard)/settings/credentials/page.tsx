'use client';

import { useState, useEffect } from 'react';
import {
  Shield, Eye, EyeOff, Save, Trash2, Loader2, CheckCircle, XCircle,
  GitBranch, Key, Bot, Zap, Lock, Edit3, X, Mail,
} from 'lucide-react';
import { useModal } from '@/components/modal-provider';
import { useAutoLoadToken } from '@/lib/hooks';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
const DOTS = '••••••••••••••••••••';

interface CredentialKey {
  key: string;
  label: string;
  configured: boolean;
}

interface Category {
  id: string;
  keys: CredentialKey[];
}

interface SavedCred {
  id: string;
  category: string;
  label: string;
  key: string;
  maskedValue: string;
  createdAt: string;
  updatedAt: string;
}

const categoryMeta: Record<string, { icon: any; label: string; color: string; description: string }> = {
  github:  { icon: GitBranch, label: 'GitHub',     color: '#C9D1D9', description: 'Personal Access Token for repo listing, webhooks, and CI/CD' },
  openai:  { icon: Bot,       label: 'OpenAI',     color: '#10B981', description: 'API key for Knowledge Base AI Assistant and postmortem generation' },
  gemini:  { icon: Zap,       label: 'Google Gemini', color: '#4285F4', description: 'Free AI for Knowledge Base Assistant (gemini-2.5-flash)' },
  groq:    { icon: Zap,       label: 'Groq',       color: '#F55036', description: 'Free ultra-fast AI for Knowledge Base (Llama 3.3 70B, 30 RPM)' },
  email:   { icon: Mail,      label: 'Email/SMTP', color: '#3B82F6', description: 'SMTP credentials for sending email notifications' },
};

const card: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 14px',
  fontSize: '13px',
  borderRadius: '10px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))',
  outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
  transition: 'border-color 200ms',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'rgb(var(--text-muted))',
  marginBottom: '6px',
};

export default function CredentialsPage() {
  useAutoLoadToken();
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedCreds, setSavedCreds] = useState<SavedCred[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('cortexo_token') : '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadCredentials() {
    try {
      const res = await fetch(`${API}/credentials`, { headers });
      const json = await res.json();
      setCategories(json.categories || []);
      setSavedCreds(json.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadCredentials(); }, []);

  async function handleSave(catId: string, key: string, label: string) {
    const val = values[key];
    if (!val?.trim()) return;
    setSaving(key);
    try {
      const res = await fetch(`${API}/credentials`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ category: catId, key, value: val.trim(), label }),
      });
      if (res.ok) {
        showToast(`${label} saved successfully`);
        setValues(v => ({ ...v, [key]: '' }));
        await loadCredentials();
      } else {
        showToast('Failed to save', false);
      }
    } catch { showToast('Network error', false); }
    setSaving(null);
  }

  const { confirm: confirmModal } = useModal();

  async function handleDelete(key: string) {
    const ok = await confirmModal({ title: 'Delete Credential', message: `Delete credential "${key}"? This cannot be undone.`, variant: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await fetch(`${API}/credentials/${key}`, { method: 'DELETE', headers });
      showToast('Credential deleted');
      await loadCredentials();
    } catch { showToast('Failed to delete', false); }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 60,
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          backgroundColor: toast.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toast.ok ? '#10B981' : '#EF4444',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {toast.ok ? <CheckCircle style={{ width: 15, height: 15 }} /> : <XCircle style={{ width: 15, height: 15 }} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
          Credentials Vault
        </h2>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          Securely store tokens, API keys, and cloud credentials. All values are AES-256 encrypted.
        </p>
      </div>

      {/* Security banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))',
        border: '1px solid rgba(16,185,129,0.15)',
      }}>
        <Lock style={{ width: 16, height: 16, color: '#10B981', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>
          All credentials are encrypted with AES-256-CBC before storage. Values are never logged or exposed in API responses.
        </span>
      </div>

      {/* Category cards */}
      {categories.map(cat => {
        const meta = categoryMeta[cat.id] || { icon: Key, label: cat.id, color: '#818CF8', description: '' };
        const Icon = meta.icon;
        const configuredCount = cat.keys.filter(k => k.configured).length;

        return (
          <div key={cat.id} style={{
            ...card,
            borderTop: `3px solid ${configuredCount === cat.keys.length ? '#10B981' : meta.color}`,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    backgroundColor: `${meta.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '18px', height: '18px', color: meta.color }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{meta.label}</span>
                      {configuredCount > 0 && (
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                          backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981',
                        }}>
                          {configuredCount}/{cat.keys.length} configured
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{meta.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Credential fields */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cat.keys.map(k => {
                const saved = savedCreds.find(c => c.key === k.key);

                return (
                  <div key={k.key}>
                    <label style={labelStyle}>{k.label}</label>
                    {saved && !editing[k.key] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          flex: 1, padding: '10px 14px', borderRadius: '10px',
                          border: '1px solid rgba(16,185,129,0.2)',
                          backgroundColor: 'rgba(16,185,129,0.04)',
                          fontSize: '13px', fontFamily: "'JetBrains Mono', monospace",
                          color: 'rgb(var(--text-secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <span>{revealed[k.key] ? saved.maskedValue : DOTS}</span>
                          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>
                            Updated {new Date(saved.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button onClick={() => setRevealed(r => ({ ...r, [k.key]: !r[k.key] }))}
                          title={revealed[k.key] ? 'Hide' : 'Reveal'}
                          style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
                          {revealed[k.key] ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                        </button>
                        <button onClick={async () => {
                          setEditing(e => ({ ...e, [k.key]: true }));
                          // Fetch and pre-fill the decrypted value
                          try {
                            const res = await fetch(`${API}/credentials/${k.key}/reveal`, { headers });
                            const json = await res.json();
                            if (json.data?.value) setValues(v => ({ ...v, [k.key]: json.data.value }));
                          } catch { setValues(v => ({ ...v, [k.key]: '' })); }
                        }}
                          title="Edit"
                          style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(var(--primary),0.2)', backgroundColor: 'rgba(var(--primary),0.04)', cursor: 'pointer', color: 'rgb(var(--primary))' }}>
                          <Edit3 style={{ width: 14, height: 14 }} />
                        </button>
                        <button onClick={() => handleDelete(k.key)}
                          title="Delete"
                          style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.04)', cursor: 'pointer', color: '#EF4444' }}>
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type={revealed[k.key] ? 'text' : 'password'}
                            autoFocus={!!editing[k.key]}
                            style={inputStyle}
                            placeholder={editing[k.key] ? 'Paste new token...' : `Enter ${k.label}...`}
                            value={values[k.key] || ''}
                            onChange={e => setValues(v => ({ ...v, [k.key]: e.target.value }))}
                          />
                          {(values[k.key] || '').length > 0 && (
                            <button
                              type="button"
                              onClick={() => setRevealed(r => ({ ...r, [k.key]: !r[k.key] }))}
                              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '2px', display: 'flex', alignItems: 'center' }}
                            >
                              {revealed[k.key] ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={async () => { await handleSave(cat.id, k.key, k.label); setEditing(e => ({ ...e, [k.key]: false })); }}
                          disabled={!values[k.key]?.trim() || saving === k.key}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
                            background: `linear-gradient(135deg, ${meta.color}, ${meta.color}bb)`,
                            opacity: (!values[k.key]?.trim() || saving === k.key) ? 0.5 : 1,
                          }}
                        >
                          {saving === k.key
                            ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                            : <Save style={{ width: 13, height: 13 }} />}
                          {editing[k.key] ? 'Update' : 'Save'}
                        </button>
                        {editing[k.key] && (
                          <button onClick={() => setEditing(e => ({ ...e, [k.key]: false }))}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
                            <X style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty state if no categories */}
      {categories.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))',
          padding: '60px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))',
          }}>
            <Shield style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Credentials Vault</p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Configure your API keys and tokens to enable integrations and CI/CD features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
