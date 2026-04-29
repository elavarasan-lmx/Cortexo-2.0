'use client';

import { useState } from 'react';
import {
  ArrowLeftRight, Database, Loader2, AlertCircle, CheckCircle,
  XCircle, Table2, Columns3, Key, Hash, Ruler, BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

type DbConfig = { host: string; user: string; password: string; database: string };

const tabs = [
  { key: 'tables',   label: 'Tables',    icon: Table2,   desc: 'Compare table structures' },
  { key: 'columns',  label: 'Columns',   icon: Columns3, desc: 'Find missing columns + ALTER queries' },
  { key: 'size',     label: 'Size',      icon: Ruler,    desc: 'Column size mismatches' },
  { key: 'rowcount', label: 'Row Count', icon: BarChart3, desc: 'Row count comparison' },
  { key: 'keys',     label: 'Keys',      icon: Key,      desc: 'Primary & foreign key diff' },
  { key: 'indexes',  label: 'Indexes',   icon: Hash,     desc: 'Index comparison' },
  { key: 'checksum', label: 'Checksum',  icon: CheckCircle, desc: 'Data integrity validation' },
];

function DbInput({ label, config, setConfig, status }: { label: string; config: DbConfig; setConfig: (c: DbConfig) => void; status: 'idle' | 'ok' | 'err' }) {
  const borderColor = status === 'ok' ? '#10B981' : status === 'err' ? '#EF4444' : 'rgb(var(--border))';
  return (
    <div style={{ flex: 1, borderRadius: '12px', border: `1px solid ${borderColor}`, backgroundColor: 'rgb(var(--surface))', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Database style={{ width: '16px', height: '16px', color: borderColor !== 'rgb(var(--border))' ? borderColor : '#818CF8' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{label}</span>
        {status === 'ok' && <CheckCircle style={{ width: '14px', height: '14px', color: '#10B981' }} />}
        {status === 'err' && <XCircle style={{ width: '14px', height: '14px', color: '#EF4444' }} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {(['host', 'user', 'password', 'database'] as (keyof DbConfig)[]).map(field => (
          <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={config[field]}
            onChange={e => setConfig({ ...config, [field]: e.target.value })}
            type={field === 'password' ? 'password' : 'text'}
            style={{
              padding: '8px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--background), 0.5)',
              color: 'rgb(var(--text-primary))', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", outline: 'none',
            }} />
        ))}
      </div>
    </div>
  );
}

function ResultRenderer({ tab, results }: { tab: string; results: any }) {
  if (tab === 'tables') {
    return (
      <div style={{ padding: '16px' }}>
        <h3 style={{ marginTop: 0, fontSize: '15px' }}>Missing in New DB ({results.missingInNew?.length || 0})</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {results.missingInNew?.map((t: string) => <span key={t} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: '4px', fontSize: '12px' }}>{t}</span>)}
        </div>
        
        <h3 style={{ fontSize: '15px' }}>Missing in Old DB ({results.missingInOld?.length || 0})</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {results.missingInOld?.map((t: string) => <span key={t} style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '4px', fontSize: '12px' }}>{t}</span>)}
        </div>

        {Object.keys(results.createQueries || {}).length > 0 && (
          <div>
            <h3 style={{ fontSize: '15px' }}>SQL to Fix (Create Tables)</h3>
            <pre style={{ background: '#111', padding: '16px', borderRadius: '8px', color: '#A5B4FC', fontSize: '12px', overflowX: 'auto' }}>
              {Object.values(results.createQueries).join('\n\n')}
            </pre>
          </div>
        )}
      </div>
    );
  }
  if (tab === 'columns') {
    return (
      <div style={{ padding: '16px' }}>
        <h3 style={{ marginTop: 0, fontSize: '15px' }}>Total Missing Columns: {results.totalMissing}</h3>
        {Object.keys(results.alterQueries || {}).length > 0 ? (
          <div>
            {Object.entries(results.alterQueries).map(([table, queries]: any) => (
              <div key={table} style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: 'rgb(var(--primary))' }}>Table: {table}</div>
                <pre style={{ background: '#111', padding: '12px', borderRadius: '8px', color: '#A5B4FC', fontSize: '12px', overflowX: 'auto', margin: 0 }}>
                  {queries.join('\n')}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'rgb(var(--text-muted))', fontSize: '13px' }}>No column mismatches found.</div>
        )}
      </div>
    );
  }
  if (tab === 'size') {
    return (
      <div style={{ padding: '16px', overflowX: 'auto' }}>
        <h3 style={{ marginTop: 0, fontSize: '15px' }}>Size Mismatches ({results.mismatches?.length || 0})</h3>
        {results.mismatches?.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Table</th>
                <th style={{ padding: '8px' }}>Column</th>
                <th style={{ padding: '8px' }}>Old Type</th>
                <th style={{ padding: '8px' }}>New Type</th>
                <th style={{ padding: '8px' }}>Fix Query</th>
              </tr>
            </thead>
            <tbody>
              {results.mismatches.map((m: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <td style={{ padding: '8px', color: 'rgb(var(--primary))' }}>{m.table}</td>
                  <td style={{ padding: '8px' }}>{m.column}</td>
                  <td style={{ padding: '8px', color: '#10B981' }}>{m.oldType}</td>
                  <td style={{ padding: '8px', color: '#EF4444' }}>{m.newType}</td>
                  <td style={{ padding: '8px' }}><code style={{ background: '#111', padding: '4px', borderRadius: '4px', color: '#A5B4FC' }}>{m.alterQuery}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: 'rgb(var(--text-muted))', fontSize: '13px' }}>No size mismatches found.</div>
        )}
      </div>
    );
  }
  if (tab === 'rowcount') {
    return (
      <div style={{ padding: '16px', overflowX: 'auto' }}>
        <h3 style={{ marginTop: 0, fontSize: '15px' }}>Row Count Comparison</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgb(var(--border))', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Table</th>
              <th style={{ padding: '8px' }}>Old Count</th>
              <th style={{ padding: '8px' }}>New Count</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.results?.map((r: any) => (
              <tr key={r.table} style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                <td style={{ padding: '8px', color: 'rgb(var(--primary))' }}>{r.table}</td>
                <td style={{ padding: '8px' }}>{r.oldCount}</td>
                <td style={{ padding: '8px' }}>{r.newCount}</td>
                <td style={{ padding: '8px', color: r.status === 'Match' ? '#10B981' : '#EF4444' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback for indexes, keys, checksum
  return (
    <div style={{ padding: '16px' }}>
      <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgb(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0, lineHeight: '20px' }}>
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}

export default function DbMigrationPage() {
  useAutoLoadToken();
  const [oldDb, setOldDb] = useState<DbConfig>({ host: '', user: '', password: '', database: '' });
  const [newDb, setNewDb] = useState<DbConfig>({ host: '', user: '', password: '', database: '' });
  const [connStatus, setConnStatus] = useState<{ old: 'idle' | 'ok' | 'err'; new: 'idle' | 'ok' | 'err' }>({ old: 'idle', new: 'idle' });
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('tables');
  const [results, setResults] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await api.dbMigrationConnect({ oldDb, newDb }) as any;
      setConnStatus({
        old: res.oldDb?.ok ? 'ok' : 'err',
        new: res.newDb?.ok ? 'ok' : 'err',
      });
    } catch {
      setConnStatus({ old: 'err', new: 'err' });
    }
    setConnecting(false);
  };

  const handleAnalyze = async (tab: string) => {
    setActiveTab(tab);
    setAnalyzing(true);
    setResults(null);
    try {
      const methods: Record<string, (d: any) => Promise<any>> = {
        tables: api.dbMigrationTables.bind(api),
        columns: api.dbMigrationColumns.bind(api),
        size: api.dbMigrationSize.bind(api),
        rowcount: api.dbMigrationRowCount.bind(api),
        keys: api.dbMigrationKeys.bind(api),
        indexes: api.dbMigrationIndexes.bind(api),
        checksum: api.dbMigrationChecksum.bind(api),
      };
      const res = await methods[tab]({ oldDb, newDb });
      setResults(res);
    } catch (e: any) {
      setResults({ error: e.message || 'Analysis failed' });
    }
    setAnalyzing(false);
  };

  const isConnected = connStatus.old === 'ok' && connStatus.new === 'ok';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>DB Migration</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Compare and migrate database schemas across environments</p>
        </div>
      </div>

      {/* Connection panel */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'stretch' }}>
        <DbInput label="Source Database (Old)" config={oldDb} setConfig={setOldDb} status={connStatus.old} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(var(--surface))' }}>
            <ArrowLeftRight style={{ width: '18px', height: '18px', color: 'rgb(var(--text-muted))' }} />
          </div>
        </div>
        <DbInput label="Target Database (New)" config={newDb} setConfig={setNewDb} status={connStatus.new} />
      </div>

      <button onClick={handleConnect} disabled={connecting} style={{
        display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto 24px', padding: '10px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
        fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
        opacity: connecting ? 0.6 : 1,
      }}>
        {connecting ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Database style={{ width: '16px', height: '16px' }} />}
        {connecting ? 'Connecting...' : 'Test Connections'}
      </button>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => isConnected && handleAnalyze(tab.key)} disabled={!isConnected} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgb(var(--border))', cursor: isConnected ? 'pointer' : 'not-allowed',
            fontSize: '12px', fontWeight: 600, transition: 'all 150ms', opacity: isConnected ? 1 : 0.4,
            backgroundColor: activeTab === tab.key ? 'rgba(var(--primary), 0.1)' : 'rgb(var(--surface))',
            color: activeTab === tab.key ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
          }}>
            <tab.icon style={{ width: '13px', height: '13px' }} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Results area */}
      <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', minHeight: '200px', overflow: 'hidden' }}>
        {analyzing ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))' }}>Analyzing {activeTab}...</span>
          </div>
        ) : !results ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '8px' }}>
            <ArrowLeftRight style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))' }} />
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))' }}>
              {isConnected ? 'Click a tab above to start analysis' : 'Connect both databases first'}
            </span>
          </div>
        ) : results.error ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '8px' }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            <span style={{ fontSize: '13px', color: '#EF4444' }}>{results.error}</span>
          </div>
        ) : (
          <ResultRenderer tab={activeTab} results={results} />
        )}
      </div>
    </div>
  );
}
