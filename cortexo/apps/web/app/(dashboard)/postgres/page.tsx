'use client';

import { Database, Play, Clock, Table2, Search, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const demoTables = [
  { name: 'tbl_orders', rows: '2.4M', size: '456 MB', schema: 'public', lastAnalyzed: '2d ago' },
  { name: 'tbl_rates', rows: '890K', size: '124 MB', schema: 'public', lastAnalyzed: '5d ago' },
  { name: 'tbl_users', rows: '12K', size: '8 MB', schema: 'auth', lastAnalyzed: '1w ago' },
  { name: 'tbl_transactions', rows: '5.1M', size: '1.2 GB', schema: 'public', lastAnalyzed: '3d ago' },
  { name: 'tbl_audit_log', rows: '15M', size: '3.8 GB', schema: 'audit', lastAnalyzed: '1d ago' },
  { name: 'tbl_client_config', rows: '450', size: '2 MB', schema: 'config', lastAnalyzed: '1w ago' },
];

export default function PostgreSQLPage() {
  useAutoLoadToken();
  const [query, setQuery] = useState('');

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database style={{ width: '22px', height: '22px', color: '#336791' }} /> PostgreSQL Console
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Advanced database management, query optimizer, and schema explorer</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Tables', value: String(demoTables.length), color: '#336791' },
          { label: 'Active Connections', value: '42', color: '#818CF8' },
          { label: 'Database Size', value: '5.6 GB', color: '#10B981' },
          { label: 'WAL Size', value: '128 MB', color: '#F59E0B' },
        ].map((c) => (
          <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Query Editor */}
      <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#F59E0B' }} /> SQL Runner
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgb(var(--border))', background: 'transparent', color: 'rgb(var(--text-secondary))', fontSize: '11px', cursor: 'pointer' }}>EXPLAIN ANALYZE</button>
             <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgb(var(--border))', background: 'transparent', color: 'rgb(var(--text-secondary))', fontSize: '11px', cursor: 'pointer' }}>History</button>
          </div>
        </div>
        <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="SELECT * FROM public.tbl_orders LIMIT 10;"
          style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--border), 0.15)', color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', resize: 'vertical', outline: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #336791, #818CF8)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <Play style={{ width: '13px', height: '13px' }} /> Run Query
          </button>
        </div>
      </div>

      {/* Tables List */}
      <div style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Table2 style={{ width: '14px', height: '14px', color: '#336791' }} /> Schema Explorer
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(var(--border), 0.15)' }}>
                {['Table', 'Schema', 'Rows', 'Size', 'Last Analyzed'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', borderBottom: '1px solid rgb(var(--border))' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demoTables.map((t) => (
                <tr key={t.name} style={{ transition: 'background-color 200ms', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--border), 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgb(var(--border))' }}>
                    <code style={{ fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#336791' }}>{t.name}</code>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgb(var(--border))' }}>
                    <span style={{ fontSize: '11px', backgroundColor: 'rgba(var(--border), 0.3)', padding: '2px 6px', borderRadius: '4px', color: 'rgb(var(--text-secondary))' }}>{t.schema}</span>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgb(var(--border))', color: 'rgb(var(--text-secondary))' }}>{t.rows}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgb(var(--border))', color: 'rgb(var(--text-secondary))' }}>{t.size}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgb(var(--border))', color: 'rgb(var(--text-muted))' }}>{t.lastAnalyzed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
