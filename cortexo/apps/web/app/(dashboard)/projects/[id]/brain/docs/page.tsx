'use client';

import { FileText, Code2, Copy, CheckCircle, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData } from '@/lib/hooks';
import { useState } from 'react';

export default function BrainDocsPage({ params }: { params: { id: string } }) {
  const { data: docs, loading } = useApiData(() => api.request<any>('GET', `/projects/${params.id}/brain/docs`));
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopied(path);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'rgb(var(--text-muted))' }}>
        <Activity style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Generating AI Docs...
      </div>
    );
  }

  const items = docs || [];

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText style={{ width: '22px', height: '22px', color: '#8B5CF6' }} />
            AI Component Docs
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Auto-generated documentation based on learned codebase patterns
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed rgb(var(--border))', borderRadius: '12px', color: 'rgb(var(--text-muted))' }}>
          <Code2 style={{ width: '32px', height: '32px', opacity: 0.5, margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'rgb(var(--text-primary))' }}>No Docs Generated</p>
          <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>Trigger a Source Code Brain scan to generate component docs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {items.map((item: any, idx: number) => (
            <div key={idx} style={{
              backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
              borderRadius: '12px', overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', backgroundColor: 'rgba(var(--border), 0.2)', borderBottom: '1px solid rgb(var(--border))'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: 'rgb(var(--text-primary))' }}>{item.path}</span>
                <button
                  onClick={() => handleCopy(item.docs, item.path)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary))' }}
                >
                  {copied === item.path ? <CheckCircle style={{ width: '14px', height: '14px', color: '#10B981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
              <div style={{ padding: '16px', fontSize: '12px', color: 'rgb(var(--text-secondary))', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '300px', overflowY: 'auto' }}>
                {item.docs}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
