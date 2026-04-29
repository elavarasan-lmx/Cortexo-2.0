'use client';

import { useState, useEffect } from 'react';
import { Target, Cpu, Zap, Brain, Loader2, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface ContextItem {
  label: string;
  value: string;
  status: 'loaded' | 'active' | 'inactive';
}

interface SessionInfo {
  id: string;
  name: string;
  status: string;
  contextPercent: number;
  contextUsed: string;
  contextMax: string;
}

const statusColors: Record<string, { bg: string; text: string; dot: string; glow: string }> = {
  loaded: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', dot: '#10B981', glow: '0 0 8px rgba(16, 185, 129, 0.5)' },
  active: { bg: 'rgba(79, 70, 229, 0.1)', text: '#818CF8', dot: '#818CF8', glow: '0 0 8px rgba(79, 70, 229, 0.5)' },
  inactive: { bg: 'rgba(var(--border), 0.15)', text: 'rgb(var(--text-muted))', dot: 'rgb(var(--text-muted))', glow: 'none' },
};

const card: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
};

export default function ContextMonitorPage() {
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('cortexo_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        // Try to fetch context data from API
        const res = await fetch(`${API}/agent/context`, { headers });
        if (res.ok) {
          const json = await res.json();
          const data = json?.data || json;
          if (data?.contextItems) setContextItems(data.contextItems);
          if (data?.sessions) setSessions(data.sessions);
        }
      } catch { /* API may not have this route yet */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const hasData = contextItems.length > 0 || sessions.length > 0;

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
          Context Monitor
        </h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Real-time view of what context the AI agent has loaded
        </p>
      </div>

      {/* ─── Context Items Grid ─── */}
      {contextItems.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {contextItems.map((item, i) => {
            const colors = statusColors[item.status] || statusColors.inactive;
            return (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Target style={{ width: '18px', height: '18px', color: colors.text }} />
                </div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.dot, boxShadow: colors.glow, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>{item.value}</p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: colors.bg, color: colors.text, flexShrink: 0, textTransform: 'capitalize' }}>{item.status}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Active Sessions ─── */}
      {sessions.length > 0 && (
        <div style={{ ...card, padding: '0', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
              Active Sessions: {sessions.length}
            </h2>
          </div>
          {sessions.map((s, i) => (
            <div key={s.id} style={{ padding: '16px 20px', borderBottom: i < sessions.length - 1 ? '1px solid rgba(var(--border), 0.5)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{s.name}</span>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>{s.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Context:</span>
                <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: 'rgba(var(--border), 0.2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.contextPercent}%`, borderRadius: '4px', background: 'linear-gradient(90deg, rgb(var(--primary)), rgb(var(--agent)))' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))' }}>{s.contextPercent}% ({s.contextUsed} / {s.contextMax})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!hasData && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px', borderRadius: '16px', border: '1px dashed rgb(var(--border))',
          padding: '80px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(var(--primary),0.12), rgba(var(--agent),0.06))',
          }}>
            <Cpu style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))', opacity: 0.8 }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>No active context</p>
            <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
              The context monitor will display real-time data when AI agent sessions are active.
            </p>
          </div>
        </div>
      )}

      {/* ─── Agent Status Card ─── */}
      <div style={{
        ...card, padding: '24px', marginTop: '20px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 12px rgba(var(--primary), 0.3)',
        }}>
          <Brain style={{ width: '22px', height: '22px', color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Cortexo AI Agent
          </p>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', marginTop: '3px' }}>
            Context monitoring activates when AI agent sessions are running. Connect your projects and start deployments to generate context data.
          </p>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
          backgroundColor: 'rgba(var(--border), 0.15)', color: 'rgb(var(--text-muted))', flexShrink: 0,
        }}>
          Standby
        </span>
      </div>
    </div>
  );
}
