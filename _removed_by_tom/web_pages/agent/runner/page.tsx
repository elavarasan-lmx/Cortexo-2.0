'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Play, Clock, CheckCircle, XCircle, Loader2, Code2, Shield, GitBranch, Zap, ChevronDown, ChevronUp, Copy } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface AgentTask {
  id: string; type: string; status: 'queued' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>; output?: string; steps: { step: string; result: string; timestamp: string }[];
  createdAt: string; completedAt?: string; tokensUsed?: number; model: string;
}
interface Capability { type: string; name: string; description: string; requiresCode: boolean; }

const typeIcons: Record<string, any> = { code_review: Code2, tdd: Zap, security_scan: Shield, migration_plan: GitBranch, custom: Bot };
const statusColorMap: Record<string, { color: string; bg: string }> = {
  queued:    { color: 'rgb(var(--text-muted))', bg: 'rgba(var(--border), 0.15)' },
  running:   { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.1)' },
  completed: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  failed:    { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

const fallbackCapabilities: Capability[] = [
  { type: 'code_review', name: 'Code Review', description: 'Analyze code quality, patterns, and suggest improvements', requiresCode: true },
  { type: 'tdd', name: 'TDD Generator', description: 'Generate test cases from a feature description', requiresCode: false },
  { type: 'security_scan', name: 'Security Scan', description: 'Scan code for vulnerabilities and security issues', requiresCode: true },
  { type: 'migration_plan', name: 'Migration Plan', description: 'Create a migration plan between frameworks', requiresCode: false },
  { type: 'custom', name: 'Custom Task', description: 'Run a custom autonomous agent task', requiresCode: false },
];

/* ─── Shared Styles ─── */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
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

export default function AgentRunnerPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>(fallbackCapabilities);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [form, setForm] = useState({ type: 'code_review', description: '', code: '' });
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('cortexo_token')}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    fetch(`${API}/agent/capabilities`, { headers: authHeader() }).then(r => r.json())
      .then(d => {
        if (d.data && d.data.length > 0) setCapabilities(d.data);
        setAiEnabled(d.aiEnabled || false);
      }).catch(() => {});
    loadTasks();
  }, []);

  function loadTasks() {
    fetch(`${API}/agent/tasks`, { headers: authHeader() }).then(r => r.json())
      .then(d => setTasks(d.data || [])).catch(() => {});
  }

  function pollTask(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const r = await fetch(`${API}/agent/tasks/${id}`, { headers: authHeader() });
      const d = await r.json();
      if (d.data) {
        setTasks(prev => prev.map(t => t.id === id ? d.data : t));
        if (d.data.status === 'completed' || d.data.status === 'failed') {
          clearInterval(pollRef.current!); setRunning(false); setExpanded(id);
        }
      }
    }, 1500);
  }

  async function handleRun() {
    if (!form.type) return;
    setRunning(true);
    try {
      const r = await fetch(`${API}/agent/run`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.data) { setTasks(prev => [d.data, ...prev]); setExpanded(d.data.id); pollTask(d.data.id); }
      else setRunning(false);
    } catch { setRunning(false); }
  }

  const selectedCap = capabilities.find(c => c.type === form.type);

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Agent Runner
          </h1>
          {!aiEnabled && (
            <span style={{
              padding: '3px 10px', borderRadius: '20px',
              fontSize: '10px', fontWeight: 700,
              backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B',
            }}>
              DEMO MODE — Add OPENAI_API_KEY to enable real AI
            </span>
          )}
        </div>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Run autonomous AI agent tasks — code review, TDD, security scan, migration planning
        </p>
      </div>

      {/* ─── Task Form ─── */}
      <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 16px 0' }}>
          New Agent Task
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
          {/* Left: Task type selection */}
          <div>
            <label style={labelStyle}>Task Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {capabilities.map(cap => {
                const Icon = typeIcons[cap.type] || Bot;
                const isSelected = form.type === cap.type;
                return (
                  <button
                    key={cap.type}
                    onClick={() => setForm(p => ({ ...p, type: cap.type }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid rgba(var(--primary), 0.5)' : '1px solid rgb(var(--border))',
                      backgroundColor: isSelected ? 'rgba(var(--primary), 0.08)' : 'transparent',
                      color: isSelected ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                      cursor: 'pointer',
                      transition: 'all 200ms',
                      textAlign: 'left' as const,
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <Icon style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <div>
                      <div>{cap.name}</div>
                      <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', marginTop: '1px', fontWeight: 400 }}>
                        {cap.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>
                {selectedCap?.requiresCode ? 'Task description' : 'Description / requirements'}
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder={
                  form.type === 'tdd' ? 'e.g. Create a user registration feature with email validation'
                  : form.type === 'migration_plan' ? 'e.g. Migrate our CI3 UserController to CI4'
                  : 'Describe what to analyze...'
                }
                rows={3}
                style={{
                  width: '100%',
                  resize: 'none',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgb(var(--border))',
                  backgroundColor: 'rgb(var(--surface-hover))',
                  color: 'rgb(var(--text-primary))',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            {selectedCap?.requiresCode && (
              <div>
                <label style={labelStyle}>PHP code to analyze</label>
                <textarea
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                  placeholder="<?php&#10;// Paste your PHP code here..."
                  rows={6}
                  style={{
                    width: '100%',
                    resize: 'none',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgb(var(--border))',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    color: '#e2e8f0',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>
            )}
            <button
              onClick={handleRun}
              disabled={running || !form.type}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                border: 'none',
                cursor: running || !form.type ? 'not-allowed' : 'pointer',
                opacity: running || !form.type ? 0.6 : 1,
                background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
                transition: 'all 200ms',
              }}
            >
              {running ? <Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '15px', height: '15px' }} />}
              {running ? 'Running Agent...' : 'Run Agent Task'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Task History ─── */}
      {tasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-muted))', margin: '0 0 4px 0', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
            Task History
          </h2>
          {tasks.map(task => {
            const Icon = typeIcons[task.type] || Bot;
            const sc = statusColorMap[task.status] || statusColorMap.queued;
            const isOpen = expanded === task.id;
            const cap = capabilities.find(c => c.type === task.type);
            return (
              <div key={task.id} style={{ ...cardStyle, overflow: 'hidden' }}>
                <div
                  onClick={() => setExpanded(isOpen ? null : task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 18px',
                    cursor: 'pointer',
                    transition: 'background-color 200ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--surface-hover), 0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: 'rgba(var(--primary), 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: '16px', height: '16px', color: 'rgb(var(--primary))' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
                      {cap?.name || task.type}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(task.input.description || task.input.code || '').slice(0, 60)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {task.tokensUsed && (
                      <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                        {task.tokensUsed} tokens
                      </span>
                    )}
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '10px', fontWeight: 700,
                      textTransform: 'uppercase' as const,
                      backgroundColor: sc.bg, color: sc.color,
                    }}>
                      {task.status === 'running' && <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} />}
                      {task.status}
                    </span>
                    {isOpen
                      ? <ChevronUp style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
                      : <ChevronDown style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />}
                  </div>
                </div>
                {isOpen && task.output && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgb(var(--border))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', margin: 0 }}>
                        Output
                      </p>
                      <button
                        onClick={() => navigator.clipboard.writeText(task.output || '')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '4px 8px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: 500,
                          color: 'rgb(var(--text-muted))',
                          backgroundColor: 'rgb(var(--surface-hover))',
                          border: '1px solid rgb(var(--border))',
                          cursor: 'pointer',
                        }}
                      >
                        <Copy style={{ width: '10px', height: '10px' }} /> Copy
                      </button>
                    </div>
                    <div style={{
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgb(var(--surface-hover))',
                      border: '1px solid rgb(var(--border))',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: 'rgb(var(--text-secondary))',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}>
                      {task.output}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Empty State ─── */}
      {tasks.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <Bot style={{ width: '48px', height: '48px', color: 'rgb(var(--text-muted))', opacity: 0.25, margin: '0 auto 16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
            No agent tasks yet
          </p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', marginTop: '4px' }}>
            Run your first task above
          </p>
        </div>
      )}
    </div>
  );
}
