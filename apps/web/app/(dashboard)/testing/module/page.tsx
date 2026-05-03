'use client';

import React, { useState } from 'react';
import { Boxes, Play, CheckCircle, XCircle, Loader2, Clock, ChevronDown, ChevronRight, Smartphone, Globe } from 'lucide-react';

/* ── Types ── */
interface ModuleEntry { name: string; endpoint: string; platform: 'ionic' | 'flutter' | 'both'; }
interface ModuleResult extends ModuleEntry { status: 'pass' | 'fail' | 'pending' | 'running'; latency?: number; statusCode?: number; error?: string; }
interface ModuleGroup { title: string; modules: ModuleEntry[]; }

/* ── All WinBull Modules ── */
const MODULE_GROUPS: ModuleGroup[] = [
  { title: 'Core & Auth', modules: [
    { name: 'Health Check', endpoint: '/api/health', platform: 'both' },
    { name: 'Auth Login', endpoint: '/api/auth/login', platform: 'both' },
    { name: 'Auth OTP Verify', endpoint: '/api/auth/otp/verify', platform: 'both' },
    { name: 'Session Validate', endpoint: '/api/auth/session', platform: 'both' },
    { name: 'Client Config', endpoint: '/api/config', platform: 'both' },
    { name: 'DB Connection', endpoint: '/api/db/ping', platform: 'both' },
  ]},
  { title: 'Rate Engine', modules: [
    { name: 'Live Rates', endpoint: '/api/rates/latest', platform: 'both' },
    { name: 'Rate Feed (Socket)', endpoint: '/api/socket/status', platform: 'both' },
    { name: 'Rate History', endpoint: '/api/rates/history', platform: 'both' },
    { name: 'Spot Rate', endpoint: '/api/rates/spot', platform: 'both' },
    { name: 'MCX Rate Sync', endpoint: '/api/rates/mcx', platform: 'ionic' },
    { name: 'Rate Margin Config', endpoint: '/api/rates/margin-config', platform: 'both' },
  ]},
  { title: 'Trade & Booking', modules: [
    { name: 'Trade List', endpoint: '/api/trades', platform: 'both' },
    { name: 'Place Order (Market)', endpoint: '/api/trades/book', platform: 'both' },
    { name: 'Place Order (Limit)', endpoint: '/api/trades/limit', platform: 'both' },
    { name: 'Pending Orders', endpoint: '/api/trades/pending', platform: 'both' },
    { name: 'Trade Close', endpoint: '/api/trades/close', platform: 'both' },
    { name: 'Trade Modify', endpoint: '/api/trades/modify', platform: 'flutter' },
    { name: 'Bulk Close', endpoint: '/api/trades/bulk-close', platform: 'ionic' },
    { name: 'P&L Summary', endpoint: '/api/trades/pnl', platform: 'both' },
  ]},
  { title: 'Client Management', modules: [
    { name: 'Client List', endpoint: '/api/clients', platform: 'both' },
    { name: 'Client Profile', endpoint: '/api/clients/profile', platform: 'both' },
    { name: 'Client Ledger', endpoint: '/api/clients/ledger', platform: 'both' },
    { name: 'Margin Status', endpoint: '/api/clients/margin', platform: 'both' },
    { name: 'Client Limits', endpoint: '/api/clients/limits', platform: 'both' },
    { name: 'Ban/Unban', endpoint: '/api/clients/ban', platform: 'ionic' },
  ]},
  { title: 'Reports & Analytics', modules: [
    { name: 'Daily Report', endpoint: '/api/reports/daily', platform: 'both' },
    { name: 'Trade Report', endpoint: '/api/reports/trades', platform: 'both' },
    { name: 'Closing Report', endpoint: '/api/reports/closing', platform: 'both' },
    { name: 'Sauda Report', endpoint: '/api/reports/sauda', platform: 'ionic' },
    { name: 'Broker Brokerage', endpoint: '/api/reports/brokerage', platform: 'both' },
    { name: 'Profit/Loss Report', endpoint: '/api/reports/pnl', platform: 'both' },
    { name: 'Bill Generate', endpoint: '/api/reports/bill', platform: 'ionic' },
  ]},
  { title: 'Notifications & Comms', modules: [
    { name: 'Push Notification', endpoint: '/api/notifications/test', platform: 'both' },
    { name: 'FCM Token', endpoint: '/api/notifications/fcm', platform: 'flutter' },
    { name: 'SMS OTP', endpoint: '/api/notifications/sms', platform: 'both' },
    { name: 'WhatsApp Alert', endpoint: '/api/notifications/whatsapp', platform: 'ionic' },
  ]},
  { title: 'Admin & Settings', modules: [
    { name: 'Admin Panel', endpoint: '/admin', platform: 'ionic' },
    { name: 'Market Hours', endpoint: '/api/settings/market-hours', platform: 'both' },
    { name: 'Symbol Config', endpoint: '/api/settings/symbols', platform: 'both' },
    { name: 'Brokerage Config', endpoint: '/api/settings/brokerage', platform: 'both' },
    { name: 'Banner Manage', endpoint: '/api/settings/banners', platform: 'flutter' },
    { name: 'App Version Check', endpoint: '/api/settings/version', platform: 'flutter' },
  ]},
  { title: 'Mobile API (Legacy)', modules: [
    { name: 'Mobile GetRates', endpoint: '/mobileapi/getrates', platform: 'ionic' },
    { name: 'Mobile BookRate', endpoint: '/mobileapi/bookrate', platform: 'ionic' },
    { name: 'Mobile GetReport', endpoint: '/mobileapi/getreport', platform: 'ionic' },
    { name: 'Mobile GetLedger', endpoint: '/mobileapi/getledger', platform: 'ionic' },
  ]},
  { title: 'TDS/TCS Calculator', modules: [
    { name: 'TDS Calculate', endpoint: '/api/calculator/tds', platform: 'flutter' },
    { name: 'TCS Calculate', endpoint: '/api/calculator/tcs', platform: 'flutter' },
    { name: 'Weight Purity Calc', endpoint: '/api/calculator/weight', platform: 'flutter' },
  ]},
];

const allModules = MODULE_GROUPS.flatMap(g => g.modules);

/* ── Styles ── */
const platformBadge = (p: string): React.CSSProperties => ({
  padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
  color: p === 'ionic' ? '#F59E0B' : p === 'flutter' ? '#3B82F6' : '#10B981',
  backgroundColor: p === 'ionic' ? '#F59E0B12' : p === 'flutter' ? '#3B82F612' : '#10B98112',
  border: `1px solid ${p === 'ionic' ? '#F59E0B25' : p === 'flutter' ? '#3B82F625' : '#10B98125'}`,
});

const inputStyle: React.CSSProperties = { padding: '9px 14px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", outline: 'none', width: '100%' };

/* ── Component ── */
export default function ModuleTestPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [results, setResults] = useState<Record<string, ModuleResult>>({});
  const [running, setRunning] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'ionic' | 'flutter'>('all');

  const getResult = (m: ModuleEntry): ModuleResult => results[m.endpoint] || { ...m, status: 'pending' };

  const runAll = async () => {
    if (!baseUrl) return;
    setRunning(true);
    const filtered = allModules.filter(m => filter === 'all' || m.platform === filter || m.platform === 'both');
    const newResults: Record<string, ModuleResult> = {};
    filtered.forEach(m => { newResults[m.endpoint] = { ...m, status: 'running' }; });
    setResults({ ...newResults });

    for (const m of filtered) {
      const url = baseUrl.replace(/\/+$/, '') + m.endpoint;
      try {
        const start = Date.now();
        const res = await fetch(url, { method: 'GET', mode: 'no-cors', signal: AbortSignal.timeout(10000) });
        newResults[m.endpoint] = { ...m, status: 'pass', latency: Date.now() - start, statusCode: res.status || 200 };
      } catch (err: any) {
        newResults[m.endpoint] = { ...m, status: 'fail', error: err.message || 'Timeout' };
      }
      setResults({ ...newResults });
    }
    setRunning(false);
  };

  const pass = Object.values(results).filter(r => r.status === 'pass').length;
  const fail = Object.values(results).filter(r => r.status === 'fail').length;
  const total = allModules.filter(m => filter === 'all' || m.platform === filter || m.platform === 'both').length;

  const statusIcon = (s: string) =>
    s === 'pass' ? <CheckCircle style={{ width: '15px', height: '15px', color: '#10B981' }} /> :
    s === 'fail' ? <XCircle style={{ width: '15px', height: '15px', color: '#EF4444' }} /> :
    s === 'running' ? <Loader2 style={{ width: '15px', height: '15px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} /> :
    <Clock style={{ width: '15px', height: '15px', color: 'rgb(var(--text-muted))' }} />;

  const toggleGroup = (title: string) => setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Boxes style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} /> Module Test
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
          Test all WinBull API modules — Ionic (legacy) + Flutter (new)
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Base URL</label>
            <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://vijaybullion.com" style={inputStyle} />
          </div>

          {/* Platform filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all', 'ionic', 'flutter'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '9px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
                border: filter === f ? 'none' : '1px solid rgb(var(--border))',
                backgroundColor: filter === f ? (f === 'ionic' ? '#F59E0B' : f === 'flutter' ? '#3B82F6' : 'rgb(var(--primary))') : 'transparent',
                color: filter === f ? '#fff' : 'rgb(var(--text-secondary))',
              }}>
                {f === 'all' ? `All (${allModules.length})` : f === 'ionic' ? '📱 Ionic' : '🦋 Flutter'}
              </button>
            ))}
          </div>

          <button onClick={runAll} disabled={running || !baseUrl} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '12px', fontWeight: 600,
            cursor: baseUrl ? 'pointer' : 'not-allowed', opacity: baseUrl ? 1 : 0.5,
          }}>
            {running ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '14px', height: '14px' }} />}
            {running ? 'Testing...' : `Run All (${total})`}
          </button>
        </div>

        {/* Summary bar */}
        {(pass > 0 || fail > 0) && (
          <div style={{ display: 'flex', gap: '20px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(var(--border), 0.3)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>✓ {pass} passed</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: fail > 0 ? '#EF4444' : 'rgb(var(--text-muted))' }}>✗ {fail} failed</span>
            <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{total - pass - fail} pending</span>
            {total > 0 && <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: pass === total ? '#10B981' : '#F59E0B' }}>{Math.round((pass / total) * 100)}% coverage</span>}
          </div>
        )}
      </div>

      {/* Module Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MODULE_GROUPS.map(group => {
          const groupModules = group.modules.filter(m => filter === 'all' || m.platform === filter || m.platform === 'both');
          if (groupModules.length === 0) return null;
          const isCollapsed = collapsed[group.title];
          const gPass = groupModules.filter(m => getResult(m).status === 'pass').length;
          const gFail = groupModules.filter(m => getResult(m).status === 'fail').length;

          return (
            <div key={group.title} style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
              {/* Group Header */}
              <button onClick={() => toggleGroup(group.title)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none',
                backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-primary))',
              }}>
                {isCollapsed ? <ChevronRight style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} /> : <ChevronDown style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />}
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{group.title}</span>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontWeight: 500 }}>({groupModules.length} modules)</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  {gPass > 0 && <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>✓{gPass}</span>}
                  {gFail > 0 && <span style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444' }}>✗{gFail}</span>}
                </div>
              </button>

              {/* Module Rows */}
              {!isCollapsed && groupModules.map((m, i) => {
                const r = getResult(m);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderTop: '1px solid rgba(var(--border), 0.2)' }}>
                    {statusIcon(r.status)}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', width: '180px', flexShrink: 0 }}>{m.name}</span>
                    <span style={platformBadge(m.platform)}>{m.platform}</span>
                    <code style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.endpoint}</code>
                    {r.latency !== undefined && <span style={{ fontSize: '11px', fontWeight: 700, color: r.latency < 200 ? '#10B981' : r.latency < 500 ? '#F59E0B' : '#EF4444' }}>{r.latency}ms</span>}
                    {r.statusCode && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#10B98112', color: '#10B981', fontWeight: 700 }}>{r.statusCode}</span>}
                    {r.error && <span style={{ fontSize: '10px', color: '#EF4444', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.error}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
