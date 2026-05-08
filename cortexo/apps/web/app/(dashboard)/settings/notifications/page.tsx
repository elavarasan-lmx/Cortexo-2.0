'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellOff, Mail, AlertTriangle, CheckCircle, Save, Zap, Bug, Rocket,
  FileText, Smartphone, MessageSquare, Shield, Activity, Brain, RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = { backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '24px' };

// ─── Toggle Component ───────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
      backgroundColor: on ? 'rgb(var(--primary))' : 'rgba(var(--border), 0.8)',
      position: 'relative', transition: 'background-color 200ms', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: '2px', left: on ? '20px' : '2px',
        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
        transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ─── Event icons map ────────────────────────────────────────────────

const eventIcons: Record<string, React.ReactNode> = {
  'deploy.success':        <Rocket style={{ width: 14, height: 14, color: '#10B981' }} />,
  'deploy.failed':         <Rocket style={{ width: 14, height: 14, color: '#EF4444' }} />,
  'deploy.rollback':       <RefreshCw style={{ width: 14, height: 14, color: '#F59E0B' }} />,
  'error.new':             <Bug style={{ width: 14, height: 14, color: '#EF4444' }} />,
  'error.spike':           <Activity style={{ width: 14, height: 14, color: '#F59E0B' }} />,
  'error.resolved':        <CheckCircle style={{ width: 14, height: 14, color: '#10B981' }} />,
  'scan.complete':         <FileText style={{ width: 14, height: 14, color: '#3B82F6' }} />,
  'code_review.complete':  <FileText style={{ width: 14, height: 14, color: '#818CF8' }} />,
  'rca.complete':          <Brain style={{ width: 14, height: 14, color: '#8B5CF6' }} />,
  'fix.propagated':        <Zap style={{ width: 14, height: 14, color: '#10B981' }} />,
  'health.degraded':       <AlertTriangle style={{ width: 14, height: 14, color: '#EF4444' }} />,
  'alert.triggered':       <Bell style={{ width: 14, height: 14, color: '#F59E0B' }} />,
  'agent.complete':        <Brain style={{ width: 14, height: 14, color: '#6366F1' }} />,
  'security.vulnerability': <Shield style={{ width: 14, height: 14, color: '#EF4444' }} />,
};

// ─── Channel headers ────────────────────────────────────────────────

const channels = [
  { key: 'inApp' as const,  label: 'In-App', icon: <Bell style={{ width: 13, height: 13 }} /> },
  { key: 'email' as const,  label: 'Email',  icon: <Mail style={{ width: 13, height: 13 }} /> },
  { key: 'push' as const,   label: 'Push',   icon: <Smartphone style={{ width: 13, height: 13 }} /> },
  { key: 'slack' as const,  label: 'Slack',  icon: <MessageSquare style={{ width: 13, height: 13 }} /> },
];

// ─── Types ──────────────────────────────────────────────────────────

interface EventPref {
  event: string;
  label: string;
  category: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  slack: boolean;
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function NotificationsPage() {
  useAutoLoadToken();
  const [prefs, setPrefs] = useState<EventPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load preferences
  useEffect(() => {
    api.request<any>('GET', '/notifications/preferences')
      .then((res) => setPrefs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Toggle a specific channel for an event
  const togglePref = useCallback((event: string, channel: keyof EventPref) => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.event === event ? { ...p, [channel]: !p[channel as keyof typeof p] } : p,
      ),
    );
    setSaved(false);
  }, []);

  // Save all preferences
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.request('PUT', '/notifications/preferences', {
        preferences: prefs.map((p) => ({
          event: p.event,
          inApp: p.inApp,
          email: p.email,
          push: p.push,
          slack: p.slack,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
    setSaving(false);
  }, [prefs]);

  // Group by category
  const categories = Array.from(new Set(prefs.map((p) => p.category)));

  const enabledCount = prefs.reduce(
    (sum, p) => sum + (p.inApp ? 1 : 0) + (p.email ? 1 : 0) + (p.push ? 1 : 0) + (p.slack ? 1 : 0),
    0,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))' }} />
          Notification Preferences
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          {enabledCount} channels active across {prefs.length} events
        </p>
      </div>

      {loading && (
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>
          Loading preferences...
        </div>
      )}

      {!loading && categories.map((cat) => {
        const catPrefs = prefs.filter((p) => p.category === cat);
        return (
          <div key={cat} style={card}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))', margin: '0 0 16px' }}>{cat}</h3>

            {/* Column headers */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(var(--border), 0.4)' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontWeight: 600 }}>Event</span>
              </div>
              {channels.map((ch) => (
                <div key={ch.key} style={{ width: '70px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {ch.icon} {ch.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Event rows */}
            {catPrefs.map((pref, i) => (
              <div
                key={pref.event}
                style={{
                  display: 'flex', alignItems: 'center', padding: '10px 8px', borderRadius: '8px',
                  borderBottom: i < catPrefs.length - 1 ? '1px solid rgba(var(--border), 0.2)' : 'none',
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(var(--border), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {eventIcons[pref.event] || <Bell style={{ width: 14, height: 14 }} />}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>{pref.label}</span>
                </div>
                {channels.map((ch) => (
                  <div key={ch.key} style={{ width: '70px', display: 'flex', justifyContent: 'center' }}>
                    <Toggle
                      on={pref[ch.key] as boolean}
                      onChange={() => togglePref(pref.event, ch.key)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}

      {/* Webhook URLs */}
      <div style={card}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 16px' }}>Webhook URLs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>Slack Webhook URL</label>
            <input placeholder="https://hooks.slack.com/services/..." style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>Discord Webhook URL</label>
            <input placeholder="https://discord.com/api/webhooks/..." style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>Webhooks receive a JSON POST with: {'{'} event, project, status, message, timestamp {'}'}</p>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
            borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer',
            background: saved ? '#10B981' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 14px rgba(var(--primary), 0.3)', transition: 'all 200ms',
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Save style={{ width: 15, height: 15 }} /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
