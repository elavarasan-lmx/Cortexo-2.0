'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Flame, ArrowLeft, Play, Loader2, CheckCircle, XCircle,
  Globe, Monitor, Tablet, Smartphone, Link2, LogIn, Zap,
  Clock, ChevronDown, ChevronUp, Image, ExternalLink,
  AlertTriangle, RefreshCw,
} from 'lucide-react';
import { api, type SmokeTestResult, type LoginConfig } from '@/lib/api';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TEST_TYPES = [
  { id: 'probe', label: 'Health Probe', icon: Zap, color: '#10B981', desc: 'Quick HTTP status check' },
  { id: 'login', label: 'Login Flow', icon: LogIn, color: '#818CF8', desc: 'Automated login test' },
  { id: 'responsive', label: 'Responsive', icon: Monitor, color: '#F59E0B', desc: 'Desktop/Tablet/Mobile' },
  { id: 'links', label: 'Link Check', icon: Link2, color: '#EF4444', desc: 'Broken link scanner' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export default function SmokeTestPage() {
  const [targets, setTargets] = useState<{ id: number; name: string; baseUrl: string }[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [selectedTest, setSelectedTest] = useState('probe');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SmokeTestResult | null>(null);
  const [history, setHistory] = useState<{ id: number; runType: string; passed: number; durationMs: number; createdAt: string; summary: Record<string, unknown> }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRun, setExpandedRun] = useState<number | null>(null);

  // Login config state
  const [loginConfig, setLoginConfig] = useState<LoginConfig>({
    loginUrl: '/admin',
    username: '',
    password: '',
    userSelector: '#user_name',
    passSelector: '#user_password',
    submitSelector: '#login',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        api.getTestTargets(),
        api.getSmokeTestRuns(),
      ]);
      setTargets(t.data || []);
      setHistory(h.data || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runTest = async () => {
    const url = selectedTarget
      ? targets.find(t => t.id === selectedTarget)?.baseUrl
      : customUrl;

    if (!url) return;

    setRunning(true);
    setResult(null);

    try {
      const payload: { testType: string; baseUrl: string; targetId?: number; loginConfig?: LoginConfig } = {
        testType: selectedTest,
        baseUrl: url,
        targetId: selectedTarget || undefined,
      };

      if (selectedTest === 'login') {
        payload.loginConfig = loginConfig;
      }

      const res = await api.runSmokeTest(payload);
      setResult(res.data ?? null);
      fetchData(); // refresh history
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setResult({
        testType: selectedTest,
        url,
        success: false,
        durationMs: 0,
        timestamp: new Date().toISOString(),
        details: { error: errMsg },
        screenshots: [],
        errors: [errMsg],
      });
    }
    setRunning(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/testing" style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Testing Hub
        </Link>
        <div style={{ flex: 1 }} />
        <button onClick={fetchData} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#94A3B8', cursor: 'pointer', fontSize: 13 }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Flame size={28} color="#F97316" />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Smoke Testing</h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Automated health probes, login flows, responsive checks & link scanning</p>
        </div>
      </div>

      {/* Test Configuration Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: 24,
      }}>
        {/* Target Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>
            Target URL
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={selectedTarget || ''}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedTarget(v ? parseInt(v) : null);
                if (v) setCustomUrl('');
              }}
              style={{ flex: '1 1 200px', padding: '10px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9', fontSize: 14 }}
            >
              <option value="">— Custom URL —</option>
              {targets.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.baseUrl})</option>
              ))}
            </select>
            {!selectedTarget && (
              <input
                type="text"
                placeholder="https://staging.rubypreciousmetals.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={{ flex: '2 1 300px', padding: '10px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9', fontSize: 14 }}
              />
            )}
          </div>
        </div>

        {/* Test Type Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>
            Test Type
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TEST_TYPES.map(tt => {
              const Icon = tt.icon;
              const active = selectedTest === tt.id;
              return (
                <button key={tt.id} onClick={() => setSelectedTest(tt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: active ? `${tt.color}15` : '#0F172A',
                    border: `1px solid ${active ? tt.color : '#334155'}`,
                    borderRadius: 10, cursor: 'pointer',
                    color: active ? tt.color : '#94A3B8',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    transition: 'all 0.2s ease',
                  }}>
                  <Icon size={16} />
                  {tt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Config (conditional) */}
        {selectedTest === 'login' && (
          <div style={{
            background: '#0F172A', border: '1px solid #334155', borderRadius: 10,
            padding: 20, marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#818CF8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogIn size={14} /> Login Configuration
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { key: 'loginUrl', label: 'Login Path', placeholder: '/admin' },
                { key: 'username', label: 'Username', placeholder: '9677942808' },
                { key: 'password', label: 'Password', placeholder: '••••••••' },
                { key: 'userSelector', label: 'Username Selector', placeholder: '#user_name' },
                { key: 'passSelector', label: 'Password Selector', placeholder: '#user_password' },
                { key: 'submitSelector', label: 'Submit Selector', placeholder: '#login' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 11, color: '#64748B', marginBottom: 4, display: 'block' }}>{field.label}</label>
                  <input
                    type={field.key === 'password' ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={loginConfig[field.key as keyof LoginConfig]}
                    onChange={(e) => setLoginConfig({ ...loginConfig, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: 6, color: '#F1F5F9', fontSize: 13 }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={runTest}
          disabled={running || (!selectedTarget && !customUrl)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 32px',
            background: running ? '#334155' : 'linear-gradient(135deg, #F97316, #EA580C)',
            border: 'none', borderRadius: 10, cursor: running ? 'not-allowed' : 'pointer',
            color: '#fff', fontSize: 14, fontWeight: 600,
            width: '100%',
            transition: 'all 0.2s ease',
          }}>
          {running ? <><Loader2 size={18} className="animate-spin" /> Running Test...</> : <><Play size={18} /> Run {TEST_TYPES.find(t => t.id === selectedTest)?.label}</>}
        </button>
      </div>

      {/* Results Panel */}
      {result && (
        <div style={{
          background: result.success ? 'linear-gradient(135deg, #022c2210, #10B98108)' : 'linear-gradient(135deg, #1E293B, #2D1B1B)',
          border: `1px solid ${result.success ? '#10B981' : '#EF4444'}40`,
          borderRadius: 12,
          padding: 24,
          animation: 'fadeIn 0.3s ease',
        }}>
          {/* Status Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {result.success
              ? <CheckCircle size={24} color="#10B981" />
              : <XCircle size={24} color="#EF4444" />}
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: result.success ? '#10B981' : '#EF4444' }}>
                {result.success ? 'Test Passed' : 'Test Failed'}
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                {result.testType.toUpperCase()} • {result.url} • {result.durationMs}ms
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ background: '#0F172A', borderRadius: 8, padding: 16, marginBottom: result.screenshots.length ? 16 : 0 }}>
            <pre style={{ margin: 0, fontSize: 12, color: '#94A3B8', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {JSON.stringify(result.details, null, 2)}
            </pre>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {result.errors.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#EF444410', borderRadius: 6, color: '#FCA5A5', fontSize: 13, marginBottom: 4 }}>
                  <AlertTriangle size={14} /> {e}
                </div>
              ))}
            </div>
          )}

          {/* Screenshots */}
          {result.screenshots.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Image size={14} /> Screenshots
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {result.screenshots.map((s, i) => (
                  <a key={i} href={`${API_BASE}/smoke-tests/screenshot/${s}`} target="_blank" rel="noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                      background: '#1E293B', border: '1px solid #334155', borderRadius: 8,
                      color: '#60A5FA', fontSize: 12, textDecoration: 'none',
                    }}>
                    <ExternalLink size={12} /> {s.replace(/smoke-/, '').replace(/\.png$/, '')}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Run History */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} /> Recent Smoke Tests
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            Loading...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#475569', background: '#0F172A', borderRadius: 12, border: '1px solid #1E293B' }}>
            No smoke tests run yet. Configure a target above and run your first test.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.slice(0, 20).map((run) => {
              const summary = run.summary || {};
              const isExpanded = expandedRun === run.id;
              const passed = run.passed > 0;
              const runType = (run.runType || '').replace('smoke-', '');
              const tt = TEST_TYPES.find(t => t.id === runType);

              return (
                <div key={run.id} style={{
                  background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10,
                  overflow: 'hidden', transition: 'all 0.2s ease',
                }}>
                  <div
                    onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      cursor: 'pointer',
                    }}>
                    {passed
                      ? <CheckCircle size={16} color="#10B981" />
                      : <XCircle size={16} color="#EF4444" />}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      background: `${tt?.color || '#64748B'}20`,
                      color: tt?.color || '#94A3B8',
                      borderRadius: 4, textTransform: 'uppercase',
                    }}>{runType || 'smoke'}</span>
                    <span style={{ fontSize: 13, color: '#CBD5E1', flex: 1 }}>
                      {String(summary.url || '—')}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>
                      {run.durationMs}ms
                    </span>
                    <span style={{ fontSize: 11, color: '#475569' }}>
                      {run.createdAt ? timeAgo(run.createdAt) : '—'}
                    </span>
                    {isExpanded ? <ChevronUp size={14} color="#64748B" /> : <ChevronDown size={14} color="#64748B" />}
                  </div>
                  {isExpanded && summary && (
                    <div style={{ padding: '0 16px 12px', borderTop: '1px solid #1E293B' }}>
                      <pre style={{ margin: '12px 0 0', fontSize: 11, color: '#94A3B8', whiteSpace: 'pre-wrap', lineHeight: 1.5, background: '#1E293B', borderRadius: 6, padding: 12 }}>
                        {JSON.stringify(summary, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
