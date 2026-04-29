'use client';

import { useState } from 'react';
import { FileText, Clock, Loader2, Download, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Users, Zap } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface PostmortemReport {
  id: string; title: string; severity: string; status: string; generatedAt: string;
  durationMinutes: number; affectedUsers: number;
  summary: string; rootCause: string; impact: string; resolution: string;
  timeline: { time: string; event: string }[];
  actionItems: string[]; preventionSteps: string[];
}

const severityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  high:     { color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
  medium:   { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  low:      { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.1)' },
};

/* ─── Shared Styles ─── */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  padding: '24px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  marginBottom: '6px',
  color: 'rgb(var(--text-muted))',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 200ms',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: '10px',
  color: 'rgb(var(--text-muted))',
};

export default function PostmortemPage() {
  const [reports, setReports] = useState<PostmortemReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', severity: 'high', errorId: '', deploymentId: '' });

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('cortexo_token')}`, 'Content-Type': 'application/json' });

  async function generate() {
    setGenerating(true);
    try {
      const r = await fetch(`${API}/postmortem/generate`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.data) { setReports(p => [d.data, ...p]); setExpanded(d.data.id); setShowForm(false); }
    } catch {}
    setGenerating(false);
  }

  function downloadReport(report: PostmortemReport) {
    const md = `# Postmortem: ${report.title}\n\n**Severity:** ${report.severity} | **Duration:** ${report.durationMinutes}min | **Affected:** ${report.affectedUsers} users\n\n## Summary\n${report.summary}\n\n## Timeline\n${report.timeline.map(t => `- **${new Date(t.time).toLocaleTimeString()}** — ${t.event}`).join('\n')}\n\n## Root Cause\n${report.rootCause}\n\n## Impact\n${report.impact}\n\n## Resolution\n${report.resolution}\n\n## Action Items\n${report.actionItems.map(a => `- [ ] ${a}`).join('\n')}\n\n## Prevention Steps\n${report.preventionSteps.map(p => `- ${p}`).join('\n')}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `postmortem-${report.id.slice(0, 8)}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Postmortem Reports</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            AI-generated incident reports with timeline, root cause, and action items
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600, color: '#fff',
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
            flexShrink: 0,
            transition: 'all 200ms',
          }}
        >
          <Zap style={{ width: '14px', height: '14px' }} /> Generate Report
        </button>
      </div>

      {/* ─── Create Form ─── */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 16px 0' }}>
            New Incident Report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Incident Title</label>
              <input
                placeholder="e.g. Booking API null reference — 2026-04-24"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
                style={{ ...inputStyle, appearance: 'auto' as any }}
              >
                <option>critical</option>
                <option>high</option>
                <option>medium</option>
                <option>low</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Error ID (optional)</label>
              <input
                placeholder="UUID from Errors page"
                value={form.errorId}
                onChange={e => setForm(p => ({ ...p, errorId: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 500,
                border: '1px solid rgb(var(--border))',
                backgroundColor: 'transparent',
                color: 'rgb(var(--text-secondary))',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={generate}
              disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, color: '#fff',
                border: 'none', cursor: generating ? 'wait' : 'pointer',
                backgroundColor: 'rgb(var(--primary))',
                opacity: generating ? 0.6 : 1,
              }}
            >
              {generating
                ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                : <Zap style={{ width: '14px', height: '14px' }} />}
              {generating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Empty State ─── */}
      {reports.length === 0 && !showForm && (
        <div style={{
          ...cardStyle,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <FileText style={{ width: '48px', height: '48px', color: 'rgb(var(--text-muted))', opacity: 0.25, margin: '0 auto 16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
            No postmortem reports yet
          </p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>
            Generate your first incident report using AI
          </p>
        </div>
      )}

      {/* ─── Report List ─── */}
      {reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reports.map(r => {
            const sev = severityConfig[r.severity] || severityConfig.high;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 18px', cursor: 'pointer',
                    transition: 'background-color 200ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--surface-hover), 0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: sev.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <AlertTriangle style={{ width: '16px', height: '16px', color: sev.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{r.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock style={{ width: '11px', height: '11px' }} />{r.durationMinutes}min
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Users style={{ width: '11px', height: '11px' }} />{r.affectedUsers} users
                      </span>
                      <span>{new Date(r.generatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    backgroundColor: sev.bg, color: sev.color,
                    flexShrink: 0,
                  }}>
                    {r.severity}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); downloadReport(r); }}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'rgb(var(--surface-hover))',
                      border: '1px solid rgb(var(--border))',
                      color: 'rgb(var(--text-muted))',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <Download style={{ width: '13px', height: '13px' }} />
                  </button>
                  {isOpen
                    ? <ChevronUp style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
                    : <ChevronDown style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />}
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 18px 20px', borderTop: '1px solid rgb(var(--border))' }}>
                    {/* Summary */}
                    <div style={{ paddingTop: '16px' }}>
                      <p style={sectionLabelStyle}>Summary</p>
                      <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgb(var(--text-secondary))' }}>{r.summary}</p>
                    </div>

                    {/* Timeline */}
                    <div style={{ marginTop: '20px' }}>
                      <p style={sectionLabelStyle}>Timeline</p>
                      <div style={{ position: 'relative', paddingLeft: '18px', borderLeft: '2px solid rgb(var(--border))' }}>
                        {r.timeline.map((t, i) => (
                          <div key={i} style={{ position: 'relative', marginBottom: '12px' }}>
                            <div style={{
                              position: 'absolute', left: '-22px', top: '5px',
                              width: '8px', height: '8px', borderRadius: '50%',
                              backgroundColor: 'rgb(var(--primary))',
                            }} />
                            <p style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgb(var(--text-muted))', margin: 0 }}>
                              {new Date(t.time).toLocaleTimeString()}
                            </p>
                            <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '2px' }}>{t.event}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Root Cause + Resolution */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                      <div>
                        <p style={sectionLabelStyle}>Root Cause</p>
                        <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgb(var(--text-secondary))' }}>{r.rootCause}</p>
                      </div>
                      <div>
                        <p style={sectionLabelStyle}>Resolution</p>
                        <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgb(var(--text-secondary))' }}>{r.resolution}</p>
                      </div>
                    </div>

                    {/* Action Items */}
                    <div style={{ marginTop: '20px' }}>
                      <p style={sectionLabelStyle}>Action Items</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {r.actionItems.map((a, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '4px',
                              border: '1.5px solid rgb(var(--border))',
                              flexShrink: 0, marginTop: '2px',
                            }} />
                            <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prevention Steps */}
                    {r.preventionSteps && r.preventionSteps.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <p style={sectionLabelStyle}>Prevention Steps</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {r.preventionSteps.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <CheckCircle style={{ width: '14px', height: '14px', color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                              <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>{p}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
