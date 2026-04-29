'use client';

import React, { useState } from 'react';
import {
  ShieldCheck, RefreshCw, Loader2, CheckCircle, AlertTriangle,
  XCircle, Globe, Clock, Lock, Search,
} from 'lucide-react';
import { api } from '@/lib/api';

interface SslResult {
  domain: string;
  clientName: string;
  valid: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  issuer: string | null;
  subject: string | null;
  serialNumber: string | null;
  protocol: string | null;
  error: string | null;
  status: 'valid' | 'expiring' | 'expired' | 'error' | 'checking';
  checkedAt?: string;
}

interface Summary {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
  error: number;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle; label: string }> = {
  valid:    { color: '#10B981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)',  icon: CheckCircle,   label: 'Valid' },
  expiring: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  icon: AlertTriangle, label: 'Expiring' },
  expired:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   icon: XCircle,       label: 'Expired' },
  error:    { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   icon: XCircle,       label: 'Error' },
  checking: { color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', icon: Loader2,       label: 'Checking' },
};

export default function SslMonitorPage() {
  const [domains, setDomains] = useState<SslResult[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [checking, setChecking] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [manualDomain, setManualDomain] = useState('');
  const [manualResult, setManualResult] = useState<SslResult | null>(null);
  const [manualChecking, setManualChecking] = useState(false);

  const scanAll = async () => {
    setChecking(true);
    setDomains([]);
    setSummary(null);
    try {
      api.loadToken();
      const res = await api.sslScan() as any;
      const data = res?.data || [];
      const sum = res?.summary || { total: 0, valid: 0, expiring: 0, expired: 0, error: 0 };
      setDomains(data);
      setSummary(sum);
    } catch {
      setDomains([]);
      setSummary(null);
    }
    setChecking(false);
  };

  const checkManual = async () => {
    if (!manualDomain.trim()) return;
    setManualChecking(true);
    setManualResult(null);
    try {
      api.loadToken();
      const res = await api.sslCheckDomain(manualDomain.trim()) as any;
      setManualResult({ ...res.data, clientName: 'Manual Check' } as SslResult);
    } catch {
      setManualResult({ domain: manualDomain, clientName: 'Manual Check', valid: false, expiresAt: null, daysLeft: null, issuer: null, subject: null, serialNumber: null, protocol: null, error: 'API request failed', status: 'error' });
    }
    setManualChecking(false);
  };

  const filtered = domains.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (search && !d.domain.toLowerCase().includes(search.toLowerCase()) && !d.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const daysColor = (days: number | null) => {
    if (days === null) return 'rgb(var(--text-muted))';
    if (days <= 0) return '#EF4444';
    if (days <= 7) return '#EF4444';
    if (days <= 30) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>SSL Monitor</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
            Server-side SSL certificate verification — real expiry dates, issuer, and TLS protocol
          </p>
        </div>
        <button
          onClick={scanAll}
          disabled={checking}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0,
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            cursor: checking ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600, color: '#fff',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 12px rgba(var(--primary),0.3)',
            opacity: checking ? 0.8 : 1, transition: 'all 150ms',
          }}
          onMouseEnter={e => { if (!checking) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--primary),0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary),0.3)'; e.currentTarget.style.transform = 'none'; }}
        >
          {checking
            ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Scanning...</>
            : <><RefreshCw style={{ width: '14px', height: '14px' }} /> Scan All Clients</>}
        </button>
      </div>

      {/* ─── Summary Cards ─── */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Domains', value: summary.total, color: '#818CF8', icon: Globe },
            { label: 'Valid', value: summary.valid, color: '#10B981', icon: CheckCircle },
            { label: 'Expiring Soon', value: summary.expiring, color: '#F59E0B', icon: AlertTriangle },
            { label: 'Expired', value: summary.expired, color: '#EF4444', icon: XCircle },
            { label: 'Errors', value: summary.error, color: '#6B7280', icon: XCircle },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ borderRadius: '14px', padding: '16px', backgroundColor: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>{s.label}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '13px', height: '13px', color: s.color }} />
                  </div>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Manual domain check ─── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'stretch' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
          <Lock style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
          <input
            value={manualDomain}
            onChange={e => setManualDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkManual()}
            placeholder="Check any domain... e.g. google.com"
            style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', color: 'rgb(var(--text-primary))' }}
          />
        </div>
        <button
          onClick={checkManual}
          disabled={manualChecking}
          style={{
            padding: '8px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))',
            backgroundColor: 'rgb(var(--surface))', fontSize: '12px', fontWeight: 600,
            color: 'rgb(var(--text-secondary))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          {manualChecking ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <ShieldCheck style={{ width: '12px', height: '12px' }} />}
          Check
        </button>
      </div>

      {/* ─── Manual result card ─── */}
      {manualResult && (
        <div style={{
          borderRadius: '14px', padding: '16px 20px', marginBottom: '20px',
          backgroundColor: 'rgb(var(--surface))', border: `1px solid rgb(var(--border))`,
          borderLeft: `4px solid ${statusConfig[manualResult.status]?.color || '#6B7280'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {React.createElement(statusConfig[manualResult.status]?.icon || XCircle, { style: { width: '18px', height: '18px', color: statusConfig[manualResult.status]?.color } })}
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{manualResult.domain}</span>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: statusConfig[manualResult.status]?.bg, color: statusConfig[manualResult.status]?.color }}>
              {statusConfig[manualResult.status]?.label}
            </span>
            {manualResult.valid && manualResult.daysLeft !== null && (
              <span style={{ fontSize: '13px', fontWeight: 700, color: daysColor(manualResult.daysLeft) }}>
                {manualResult.daysLeft}d remaining
              </span>
            )}
            {manualResult.valid && manualResult.issuer && (
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>Issuer: {manualResult.issuer}</span>
            )}
            {manualResult.valid && manualResult.protocol && (
              <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", backgroundColor: 'rgba(var(--border),0.4)', color: 'rgb(var(--text-muted))' }}>
                {manualResult.protocol}
              </span>
            )}
            {manualResult.error && (
              <span style={{ fontSize: '12px', color: '#EF4444' }}>{manualResult.error}</span>
            )}
            {manualResult.valid && manualResult.expiresAt && (
              <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                Expires: {new Date(manualResult.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── Search & Filter ─── */}
      {domains.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '9px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
            <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search domains…"
              style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', color: 'rgb(var(--text-primary))' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'valid', 'expiring', 'expired', 'error'].map(f => {
              const active = filter === f;
              const cfg = statusConfig[f];
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', transition: 'all 150ms',
                  backgroundColor: active ? (cfg?.bg || 'rgba(var(--primary),0.12)') : 'transparent',
                  color: active ? (cfg?.color || 'rgb(var(--primary))') : 'rgb(var(--text-muted))',
                }}>{f}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Results Table ─── */}
      {checking ? (
        <div style={{ borderRadius: '14px', padding: '64px 24px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
          <Loader2 style={{ width: '40px', height: '40px', color: 'rgb(var(--primary))', margin: '0 auto 14px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Scanning SSL certificates…</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Connecting to each domain via TLS on port 443</p>
        </div>
      ) : domains.length === 0 ? (
        <div style={{ borderRadius: '14px', padding: '64px 24px', textAlign: 'center', backgroundColor: 'rgb(var(--surface))', border: '1px dashed rgb(var(--border))' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 14px', backgroundColor: 'rgba(var(--primary),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck style={{ width: '26px', height: '26px', color: 'rgb(var(--primary))' }} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>No scan results yet</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Click &ldquo;Scan All Clients&rdquo; to check SSL certificates across all provisioned domains, or use the manual check above
          </p>
        </div>
      ) : (
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 90px 80px 1fr 100px', padding: '10px 16px', borderBottom: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--border),0.05)' }}>
            {['Client', 'Domain', 'Status', 'Days Left', 'Issuer', 'Protocol'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((d, i) => {
            const cfg = statusConfig[d.status] || statusConfig.error;
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1.2fr 90px 80px 1fr 100px',
                  alignItems: 'center', padding: '10px 16px',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(var(--border),0.3)' : 'none',
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--border),0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{d.clientName}</span>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{d.domain}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon style={{ width: '13px', height: '13px', color: cfg.color }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: d.valid ? daysColor(d.daysLeft) : 'rgb(var(--text-muted))' }}>
                  {d.valid && d.daysLeft !== null ? `${d.daysLeft}d` : '—'}
                </span>
                <span style={{ fontSize: '12px', color: d.error ? '#EF4444' : 'rgb(var(--text-muted))' }}>
                  {d.error || (d.valid ? d.issuer : null) || '—'}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  padding: '2px 8px', borderRadius: '5px',
                  backgroundColor: d.valid && d.protocol ? 'rgba(16,185,129,0.1)' : 'rgba(var(--border),0.3)',
                  color: d.valid && d.protocol ? '#10B981' : 'rgb(var(--text-muted))',
                  display: 'inline-block', width: 'fit-content',
                }}>
                  {d.valid && d.protocol ? d.protocol : '—'}
                </span>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>
              No domains match the current filter
            </div>
          )}
        </div>
      )}
    </div>
  );
}
