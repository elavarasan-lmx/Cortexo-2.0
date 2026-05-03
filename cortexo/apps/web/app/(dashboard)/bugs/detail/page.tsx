'use client';

import { useState } from 'react';
import {
  Bug, ArrowLeft, Clock, User, GitBranch, AlertTriangle, CheckCircle2,
  MessageSquare, Paperclip, Tag, ExternalLink, Brain, Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Demo data (replaced by API in production) ─── */
const demoBug = {
  id: 'BUG-1042',
  title: 'Rate calculation incorrect for gold spot above ₹85,000',
  priority: 'critical',
  status: 'open',
  assignee: 'Jerry',
  reporter: 'Tom',
  module: 'BookRates',
  file: 'controllers/BookRatesController.php:482',
  createdAt: '2026-05-01T10:30:00Z',
  updatedAt: '2026-05-02T03:15:00Z',
  description: `When gold spot price crosses ₹85,000, the rate formula for MCX margin produces negative values. This affects all client-facing dashboards and can cause incorrect P&L calculations.\n\n**Steps to Reproduce:**\n1. Navigate to BookRates panel\n2. Set spot price to ₹86,000\n3. Observe that calculated margin shows -₹1,200 instead of expected ₹3,800\n\n**Expected:** Margin should scale linearly above ₹85K threshold.\n**Actual:** Formula overflows into negative due to integer truncation in PHP.`,
  labels: ['financial-impact', 'client-reported', 'mcx'],
  affectedClients: [
    { name: 'VijayBullion', status: 'affected' },
    { name: 'MKRJewellers', status: 'affected' },
    { name: 'GoldStarTraders', status: 'fixed' },
  ],
  timeline: [
    { time: '2026-05-01T10:30:00Z', user: 'Tom', action: 'Created bug report' },
    { time: '2026-05-01T11:00:00Z', user: 'Jerry', action: 'Assigned to Jerry' },
    { time: '2026-05-01T14:00:00Z', user: 'Jerry', action: 'Identified root cause in rate_calc.php:line 482' },
    { time: '2026-05-02T03:15:00Z', user: 'Tom', action: 'Fixed for GoldStarTraders (hotfix-1042)' },
  ],
  aiSuggestion: `The bug originates from integer division in PHP when margin_rate = (spot - base) / factor. When spot > 85000, the result overflows int32 bounds. Fix: cast to float before division:\n\`\`\`php\n$margin = (float)($spot - $base) / $factor;\n\`\`\`\nAlternatively, use bcmath for financial precision.`,
};

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

const card: React.CSSProperties = {
  borderRadius: '14px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface))', overflow: 'hidden',
};

export default function BugDetailPage() {
  const bug = demoBug;
  const pr = priorityColors[bug.priority] || priorityColors.medium;
  const st = statusColors[bug.status] || statusColors.open;
  const [comment, setComment] = useState('');

  return (
    <div>
      {/* Back + Header */}
      <Link href="/bugs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgb(var(--text-muted))', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Bugs
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <code style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--primary))', backgroundColor: 'rgba(var(--primary),0.08)', padding: '2px 8px', borderRadius: '6px', fontFamily: "'JetBrains Mono', monospace" }}>{bug.id}</code>
            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: pr.bg, color: pr.color }}>{pr.label}</span>
            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color, textTransform: 'capitalize' }}>{bug.status.replace('_', ' ')}</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, lineHeight: 1.3 }}>{bug.title}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Description */}
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Description</h3>
            </div>
            <div style={{ padding: '16px 20px', fontSize: '13px', lineHeight: 1.7, color: 'rgb(var(--text-secondary))', whiteSpace: 'pre-wrap' }}>
              {bug.description}
            </div>
          </div>

          {/* AI Suggestion */}
          <div style={{ ...card, borderColor: 'rgba(168,85,247,0.3)', background: 'linear-gradient(135deg, rgba(168,85,247,0.03), rgba(59,130,246,0.02))' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain style={{ width: '16px', height: '16px', color: '#A855F7' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#A855F7' }}>AI Remediation Suggestion</h3>
              <Lightbulb style={{ width: '14px', height: '14px', color: '#F59E0B', marginLeft: 'auto' }} />
            </div>
            <div style={{ padding: '16px 20px', fontSize: '12px', lineHeight: 1.7, color: 'rgb(var(--text-secondary))', whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace" }}>
              {bug.aiSuggestion}
            </div>
          </div>

          {/* Timeline */}
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Activity Timeline</h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {bug.timeline.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < bug.timeline.length - 1 ? '16px' : 0, position: 'relative' }}>
                  {i < bug.timeline.length - 1 && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-8px', width: '1px', backgroundColor: 'rgb(var(--border))' }} />}
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(var(--primary),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <Clock style={{ width: '10px', height: '10px', color: 'rgb(var(--primary))' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgb(var(--text-primary))', margin: '0 0 2px', fontWeight: 500 }}>
                      <strong>{t.user}</strong> {t.action}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>{timeAgo(t.time)}</p>
                  </div>
                </div>
              ))}
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
                  <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                    <Paperclip style={{ width: '12px', height: '12px' }} /> Attach
                  </button>
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
          {/* Meta */}
          <div style={card}>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: User, label: 'Assignee', value: bug.assignee },
                { icon: User, label: 'Reporter', value: bug.reporter },
                { icon: GitBranch, label: 'Module', value: bug.module },
                { icon: ExternalLink, label: 'File', value: bug.file },
                { icon: Clock, label: 'Created', value: timeAgo(bug.createdAt) },
                { icon: Clock, label: 'Updated', value: timeAgo(bug.updatedAt) },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                    <m.icon style={{ width: '12px', height: '12px' }} /> {m.label}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: m.label === 'File' ? "'JetBrains Mono', monospace" : 'inherit' }}>{m.value}</span>
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

          {/* Affected Clients */}
          <div style={card}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(var(--border),0.15)' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle style={{ width: '12px', height: '12px', color: '#F59E0B' }} /> Affected Clients
              </h4>
            </div>
            <div style={{ padding: '14px 20px' }}>
              {bug.affectedClients.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < bug.affectedClients.length - 1 ? '1px solid rgba(var(--border),0.1)' : 'none' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>{c.name}</span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600,
                    color: c.status === 'fixed' ? '#10B981' : '#EF4444',
                  }}>
                    {c.status === 'fixed' ? <CheckCircle2 style={{ width: '11px', height: '11px' }} /> : <AlertTriangle style={{ width: '11px', height: '11px' }} />}
                    {c.status === 'fixed' ? 'Fixed' : 'Affected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
