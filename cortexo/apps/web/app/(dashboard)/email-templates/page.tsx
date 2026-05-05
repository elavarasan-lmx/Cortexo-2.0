'use client';

import { useState } from 'react';
import { Mail, Copy, Eye, Code, CheckCircle, Loader2, RefreshCw, Plus, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

export default function EmailTemplatePage() {
  useAutoLoadToken();
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');

  const { data: templates, loading, error, refetch } = useApiData(
    () => api.getEmailTemplates(),
    { default: [] as any[] }
  );

  const templateList = (templates || []) as any[];
  const activeTemplate = selected ? templateList.find(t => t.id === selected || t.slug === selected) : templateList[0];

  const handleCopy = () => {
    if (activeTemplate?.htmlBody || activeTemplate?.body) {
      navigator.clipboard.writeText(activeTemplate.htmlBody || activeTemplate.body || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestSend = async () => {
    if (!activeTemplate) return;
    setSending(true);
    setSendResult('');
    try {
      await api.sendTestEmail(activeTemplate.id || activeTemplate.slug, { to: 'elavarasan@logimaxindia.com' });
      setSendResult('✅ Test email sent!');
    } catch (err: any) {
      setSendResult(`❌ ${err?.message || 'Failed to send'}`);
    }
    setSending(false);
    setTimeout(() => setSendResult(''), 4000);
  };

  return (
    <div style={{ padding: '32px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Email Templates</h1>
            <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              Transactional email templates used by Cortexo
              {templateList.length > 0 && ` · ${templateList.length} templates`}
            </p>
          </div>
        </div>
        <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>
          <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
        </button>
      </div>

      {sendResult && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, backgroundColor: sendResult.includes('❌') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: sendResult.includes('❌') ? '#EF4444' : '#10B981' }}>
          {sendResult}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading templates...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Failed to load: {error}</p>
          <button onClick={() => refetch()} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>Retry</button>
        </div>
      )}

      {!loading && !error && templateList.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px' }}>
          <Mail style={{ width: '40px', height: '40px', color: 'rgb(var(--text-muted))', marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>No email templates yet</p>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>Create templates to send transactional emails</p>
        </div>
      )}

      {!loading && !error && templateList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {templateList.map((t: any) => (
              <button key={t.id || t.slug} onClick={() => setSelected(t.id || t.slug)} style={{
                padding: '10px 14px', borderRadius: '10px', textAlign: 'left', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: (t.id || t.slug) === (activeTemplate?.id || activeTemplate?.slug) ? 600 : 500,
                backgroundColor: (t.id || t.slug) === (activeTemplate?.id || activeTemplate?.slug) ? 'rgba(var(--primary),0.1)' : 'transparent',
                color: (t.id || t.slug) === (activeTemplate?.id || activeTemplate?.slug) ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                transition: 'all 150ms',
              }}>
                {t.name || t.label || t.slug || 'Untitled'}
              </button>
            ))}
          </div>

          {/* Preview area */}
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['preview', 'code'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                    backgroundColor: view === v ? 'rgba(var(--primary),0.1)' : 'transparent',
                    color: view === v ? 'rgb(var(--primary))' : 'rgb(var(--text-muted))',
                  }}>
                    {v === 'preview' ? <Eye style={{ width: '12px', height: '12px' }} /> : <Code style={{ width: '12px', height: '12px' }} />}
                    {v}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleTestSend} disabled={sending} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', backgroundColor: 'rgba(var(--border),0.3)', border: 'none', cursor: 'pointer',
                }}>
                  {sending ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '12px', height: '12px' }} />}
                  Send Test
                </button>
                <button onClick={handleCopy} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 600, color: copied ? '#10B981' : 'rgb(var(--text-muted))',
                  backgroundColor: copied ? 'rgba(16,185,129,0.08)' : 'rgba(var(--border),0.3)', border: 'none', cursor: 'pointer',
                }}>
                  {copied ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTemplate && view === 'preview' ? (
              <div style={{ backgroundColor: '#F1F5F9', borderRadius: '16px', padding: '40px', display: 'flex', justifyContent: 'center', minHeight: '500px' }}>
                {activeTemplate.htmlBody ? (
                  <div style={{ width: '560px', maxWidth: '100%', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: activeTemplate.htmlBody }} />
                ) : (
                  <div style={{ width: '560px', maxWidth: '100%', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ padding: '32px 32px 20px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                      <p style={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED', margin: '0 0 8px' }}>◉ Cortexo</p>
                    </div>
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', margin: '0 0 16px' }}>
                        {activeTemplate.subject || activeTemplate.name || 'Email Template'}
                      </h2>
                      <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: '0 0 24px', whiteSpace: 'pre-wrap' }}>
                        {activeTemplate.body || activeTemplate.textBody || 'No body content'}
                      </p>
                    </div>
                    <div style={{ padding: '20px 32px', textAlign: 'center', borderTop: '1px solid #F1F5F9' }}>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>© 2026 Cortexo. All rights reserved.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTemplate ? (
              <pre style={{ backgroundColor: '#0B1120', color: '#A5B4FC', padding: '24px', borderRadius: '12px', fontSize: '12px', lineHeight: 1.6, overflow: 'auto', maxHeight: '500px', fontFamily: "'JetBrains Mono', monospace" }}>
                {activeTemplate.htmlBody || activeTemplate.body || activeTemplate.textBody || '<!-- No HTML body -->'}
              </pre>
            ) : null}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
