'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bug, ArrowLeft, Clock, User, GitBranch, AlertTriangle, CheckCircle2,
  MessageSquare, Paperclip, Tag, ExternalLink, Brain, Lightbulb, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const priorityColors: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: '🔴 Critical' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: '🟠 High' },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: '🟡 Medium' },
  low:      { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: '🟢 Low' },
};

const statusColors: Record<string, { color: string; bg: string }> = {
  open:        { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  in_progress: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  resolved:    { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  closed:      { color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function inferPriority(severity: string): string {
  const s = (severity || '').toLowerCase();
  if (s.includes('critical') || s.includes('fatal')) return 'critical';
  if (s.includes('error') || s.includes('high')) return 'high';
  if (s.includes('warn') || s.includes('medium')) return 'medium';
  return 'low';
}

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

export default function BugDetailPage() {
  useAutoLoadToken();
  const params = useSearchParams();
  const bugId = params.get('id') || '';
  const [comment, setComment] = useState('');

  const { data: errors, loading, error: loadError } = useApiData(
    () => api.getErrors(),
    { default: [] as any[] }
  );

  const errItem = (errors || []).find((e: any) => String(e.id) === bugId) || (errors || [])[0];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '8px' }}>Loading bug...</p>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (loadError || !errItem) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ fontSize: '14px', color: '#EF4444' }}>{loadError || 'Bug not found'}</p>
      <Link href="/bugs" style={{ fontSize: '13px', color: 'rgb(var(--primary))' }}>← Back to Bugs</Link>
    </div>
  );

  const priority = inferPriority(errItem.severity || errItem.level || '');
  const status = errItem.status || 'open';
  const pr = priorityColors[priority] || priorityColors.medium;
  const st = statusColors[status] || statusColors.open;

  const bug = {
    id: `BUG-${errItem.id}`,
    title: errItem.message || errItem.error || 'Unknown Error',
    priority,
    status,
    assignee: errItem.assignee || '—',
    module: errItem.source || errItem.module || '—',
    file: errItem.file || errItem.stack?.split('\n')[0] || '—',
    createdAt: errItem.createdAt || errItem.firstSeen || '',
    updatedAt: errItem.updatedAt || errItem.lastSeen || '',
    description: errItem.stack || errItem.message || 'No description available',
    labels: [errItem.severity || 'error', errItem.source || 'system'].filter(Boolean),
    count: errItem.count || errItem.occurrences || 1,
  };

  return (
    <div>
      <Link href="/bugs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Bugs
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <code style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--primary))', backgroundColor: 'rgba(var(--primary),0.08)', padding: '2px 8px', borderRadius: '6px', fontFamily: "'JetBrains Mono', monospace" }}>{bug.id}</code>
            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: pr.bg, color: pr.color }}>{pr.label}</span>
            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color, textTransform: 'capitalize' }}>{bug.status.replace('_', ' ')}</span>
            <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>× {bug.count} occurrences</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, lineHeight: 1.3 }}>{bug.title}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Description / Stack */}
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Stack Trace / Description</h3>
            </div>
            <div style={{ padding: '16px 20px', fontSize: '12px', lineHeight: 1.7, color: 'rgb(var(--text-secondary))', whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace", maxHeight: '400px', overflowY: 'auto' }}>
              {bug.description}
            </div>
          </div>

          {/* Add Comment */}
          <div style={card}>
            <div style={{ padding: '16px 20px', display: 'flex', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare style={{ width: '14px', height: '14px', color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." rows={3} style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))',
                  backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px',
                  resize: 'vertical' as const, minHeight: '60px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button disabled={!comment.trim()} style={{
                    padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                    opacity: comment.trim() ? 1 : 0.5,
                  }}>
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={card}>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: User, label: 'Assignee', value: bug.assignee },
                { icon: GitBranch, label: 'Module', value: bug.module },
                { icon: ExternalLink, label: 'File', value: bug.file },
                { icon: Clock, label: 'First Seen', value: bug.createdAt ? timeAgo(bug.createdAt) : '—' },
                { icon: Clock, label: 'Last Seen', value: bug.updatedAt ? timeAgo(bug.updatedAt) : '—' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                    <m.icon style={{ width: '12px', height: '12px' }} /> {m.label}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: m.label === 'File' ? "'JetBrains Mono', monospace" : 'inherit', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div style={card}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag style={{ width: '12px', height: '12px' }} /> Labels
              </h4>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {bug.labels.map(l => (
                <span key={l} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, backgroundColor: 'rgba(var(--primary),0.08)', color: 'rgb(var(--primary))', border: '1px solid rgba(var(--primary),0.15)' }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
