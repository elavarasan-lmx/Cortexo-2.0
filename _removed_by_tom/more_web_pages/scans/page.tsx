'use client';

import { useState } from 'react';
import {
  Shield, AlertTriangle, XCircle, Info, CheckCircle,
  Search, Loader2, FileSearch, Tag, Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, useProjectLookup, resolveProjectName } from '@/lib/hooks';

/* ─── Severity config ─── */
const sevCfg: Record<string, { color: string; bg: string; border: string; icon: typeof XCircle; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: '#EF444430', icon: XCircle,       label: 'Critical' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: '#F9731630', icon: AlertTriangle, label: 'High'     },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: '#F59E0B30', icon: AlertTriangle, label: 'Medium'   },
  low:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: '#3B82F630', icon: Info,           label: 'Low'      },
};

/* ─── Category colors ─── */
const catColor: Record<string, { color: string; bg: string }> = {
  Security:     { color: '#EF4444', bg: 'rgba(239,68,68,0.08)'    },
  'Best Practice':{ color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
  Compatibility:{ color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'   },
  Style:        { color: '#6B7280', bg: 'rgba(107,114,128,0.08)'  },
};

const statCards = [
  { key: 'critical', label: 'Critical', color: '#EF4444', icon: XCircle    },
  { key: 'high',     label: 'High',     color: '#F97316', icon: AlertTriangle },
  { key: 'medium',   label: 'Medium',   color: '#F59E0B', icon: AlertTriangle },
  { key: 'fixed',    label: 'Fixed',    color: '#10B981', icon: CheckCircle },
] as const;

export default function ScansPage() {
  useAutoLoadToken();
  const { data: errors, loading, refetch } = useApiData(() => api.getErrors());
  const { lookup } = useProjectLookup();
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [scanning, setScanning] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  // Map errors to scan findings
  const findings = (errors || []).map((e: any) => {
    const sevMap: Record<string, string> = { critical: 'critical', error: 'high', warning: 'medium', info: 'low' };
    const severity = sevMap[e.severity] || 'medium';
    return {
      file: e.filePath || e.message?.split(' ')[0] || 'unknown',
      line: e.lineNumber || 0,
      snippet: e.stackTrace || e.message || '',
      fixed: e.status === 'resolved',
      rule: {
        id: `ERR-${String(e.id).slice(0, 8)}`,
        name: e.message || 'Unknown error',
        severity,
        category: e.type === 'security' ? 'Security' : e.type === 'deprecation' ? 'Compatibility' : 'Best Practice',
        cwe: null,
      },
    };
  });

  const filtered = findings.filter((f: any) => {
    const matchFilter = filter === 'all' || f.rule?.severity === filter;
    const matchSearch = !search
      || f.file.toLowerCase().includes(search.toLowerCase())
      || f.rule?.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    critical: findings.filter((f: any) => f.rule?.severity === 'critical').length,
    high:     findings.filter((f: any) => f.rule?.severity === 'high').length,
    medium:   findings.filter((f: any) => f.rule?.severity === 'medium').length,
    fixed:    findings.filter((f: any) => f.fixed).length,
  };

  async function runScan() {
    setScanning(true);
    await refetch();
    setLastScan(new Date());
    setScanning(false);
  }

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Security Scans</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Static analysis for PHP security, SQL injection, XSS, and CSRF vulnerabilities
          </p>
          {lastScan && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <Clock style={{ width: '11px', height: '11px', color: 'rgb(var(--text-muted))' }} />
              <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                Last scan: <strong style={{ color: 'rgb(var(--text-secondary))' }}>{lastScan.toLocaleTimeString()}</strong>
                <span style={{ margin: '0 4px' }}>·</span>
                <strong style={{ color: 'rgb(var(--text-secondary))' }}>{findings.length}</strong> findings
              </span>
            </div>
          )}
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
            padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: scanning ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600, color: '#fff',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: scanning ? 'none' : '0 4px 12px rgba(var(--primary), 0.3)',
            opacity: scanning ? 0.75 : 1,
            transition: 'all 150ms',
          }}
          onMouseEnter={e => { if (!scanning) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--primary), 0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = scanning ? 'none' : '0 4px 12px rgba(var(--primary), 0.3)'; e.currentTarget.style.transform = 'none'; }}
        >
          {scanning
            ? <Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} />
            : <FileSearch style={{ width: '15px', height: '15px' }} />}
          {scanning ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(s => (
          <div
            key={s.key}
            style={{
              borderRadius: '14px',
              border: '1px solid rgb(var(--border))',
              borderTop: `3px solid ${s.color}`,
              backgroundColor: 'rgb(var(--surface))',
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'box-shadow 200ms, transform 200ms', cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${s.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon style={{ width: '17px', height: '17px', color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '26px', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{stats[s.key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search + Filter row ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px', borderRadius: '10px',
          backgroundColor: 'rgb(var(--surface))',
          border: `1px solid ${searchFocused ? 'rgba(var(--primary),0.5)' : 'rgb(var(--border))'}`,
          boxShadow: searchFocused ? '0 0 0 3px rgba(var(--primary),0.08)' : 'none',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search files or rules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              backgroundColor: 'transparent', border: 'none', outline: 'none',
              fontSize: '13px', color: 'rgb(var(--text-primary))', width: '200px',
            }}
          />
        </div>

        {/* Severity filter pills */}
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map(f => {
          const active = filter === f;
          const sc = sevCfg[f];
          const activeColor  = f === 'all' ? 'rgb(var(--primary))' : sc?.color;
          const activeBg     = f === 'all' ? 'rgba(var(--primary),0.1)' : `${sc?.color}18`;
          const activeOutline= f === 'all' ? 'rgba(var(--primary),0.4)' : `${sc?.color}50`;
          const count = f === 'all' ? findings.length : findings.filter(fi => fi.rule?.severity === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 600 : 500,
                backgroundColor: active ? activeBg : 'rgb(var(--surface))',
                color: active ? activeColor : 'rgb(var(--text-secondary))',
                outline: active ? `1px solid ${activeOutline}` : '1px solid rgb(var(--border))',
                transition: 'all 150ms',
              }}
            >
              {f !== 'all' && sc && <sc.icon style={{ width: '10px', height: '10px', color: active ? sc.color : 'rgb(var(--text-muted))' }} />}
              <span style={{ textTransform: 'capitalize' }}>{f === 'all' ? 'All' : sc?.label}</span>
              <span style={{
                padding: '1px 5px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                backgroundColor: active ? (f === 'all' ? 'rgba(var(--primary),0.15)' : `${sc?.color}20`) : 'rgba(0,0,0,0.05)',
                color: active ? activeColor : 'rgb(var(--text-muted))',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Findings ─── */}
      {scanning ? (
        <div style={{
          borderRadius: '14px', padding: '64px 24px', textAlign: 'center',
          backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        }}>
          <Loader2 style={{ width: '40px', height: '40px', color: 'rgb(var(--primary))', margin: '0 auto 14px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Scanning codebase...</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Checking SQL injection, XSS, CSRF, auth, path traversal...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          borderRadius: '14px', padding: '64px 24px', textAlign: 'center',
          backgroundColor: 'rgb(var(--surface))', border: '1px dashed rgb(var(--border))',
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 14px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield style={{ width: '26px', height: '26px', color: '#10B981' }} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>No findings</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            {filter === 'all' ? 'Your code is clean! 🎉' : `No ${sevCfg[filter]?.label || filter} severity findings.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((f, i) => {
            const sev = sevCfg[f.rule?.severity || 'low'];
            const cat = catColor[f.rule?.category || 'Style'] || catColor.Style;
            const Icon = sev.icon;

            return (
              <div
                key={i}
                style={{
                  borderRadius: '12px',
                  border: '1px solid rgb(var(--border))',
                  borderLeft: `4px solid ${sev.color}`,
                  backgroundColor: 'rgb(var(--surface))',
                  opacity: f.fixed ? 0.72 : 1,
                  transition: 'box-shadow 200ms, transform 200ms',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!f.fixed) { e.currentTarget.style.boxShadow = `0 4px 16px -4px ${sev.color}20`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ padding: '14px 16px' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Severity icon */}
                    <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '9px', backgroundColor: sev.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                      <Icon style={{ width: '16px', height: '16px', color: sev.color }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Badge row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        {/* Severity */}
                        <span style={{ padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: sev.bg, color: sev.color }}>
                          {sev.label}
                        </span>
                        {/* Category */}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, backgroundColor: cat.bg, color: cat.color }}>
                          <Tag style={{ width: '9px', height: '9px' }} />
                          {f.rule?.category}
                        </span>
                        {/* CWE */}
                        {f.rule?.cwe && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, fontFamily: 'monospace', backgroundColor: 'rgba(var(--border),0.6)', color: 'rgb(var(--text-muted))' }}>
                            {f.rule.cwe}
                          </span>
                        )}
                        {/* Fixed */}
                        {f.fixed && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                            <CheckCircle style={{ width: '10px', height: '10px' }} /> Fixed
                          </span>
                        )}
                        {/* Rule ID */}
                        <span style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: 'rgb(var(--text-muted))', backgroundColor: 'rgba(var(--border),0.4)' }}>
                          {f.rule?.id}
                        </span>
                      </div>

                      {/* Rule name */}
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 6px', lineHeight: 1.4 }}>
                        {f.rule?.name}
                      </p>

                      {/* File location */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <code style={{
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          fontSize: '11px', color: 'rgb(var(--primary))',
                          backgroundColor: 'rgba(var(--primary),0.08)',
                          padding: '2px 8px', borderRadius: '4px',
                        }}>
                          {f.file}:{f.line}
                        </code>
                      </div>

                      {/* Code snippet */}
                      <pre style={{
                        margin: 0, padding: '10px 14px', borderRadius: '8px',
                        fontSize: '12px', lineHeight: 1.6,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        backgroundColor: f.fixed ? 'rgba(16,185,129,0.06)' : `${sev.color}08`,
                        color: f.fixed ? '#10B981' : 'rgb(var(--text-secondary))',
                        border: `1px solid ${f.fixed ? 'rgba(16,185,129,0.15)' : `${sev.color}20`}`,
                        overflowX: 'auto',
                      }}>
                        {f.snippet}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
