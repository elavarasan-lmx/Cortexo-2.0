'use client';
import { useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  SearchCode, FileSearch, AlertTriangle, ShieldAlert, CheckCircle,
  XCircle, Play, Loader2, FolderOpen, Clock, ChevronRight,
  Package, Code2, KeyRound, Scale, FileCode, FileText,
} from 'lucide-react';

type ScanType = 'deps' | 'debt' | 'secrets' | 'risk' | 'skill-lint';
const SCANS: { key: ScanType; label: string; icon: any; color: string; desc: string }[] = [
  { key: 'deps',       label: 'Dependencies',  icon: Package,   color: '#3B82F6', desc: '6 ecosystem vuln scanner (npm/pypi/go/cargo/ruby/php)' },
  { key: 'debt',       label: 'Tech Debt',     icon: Code2,     color: '#F59E0B', desc: 'TODO/FIXME, empty catch, large functions, eval()' },
  { key: 'secrets',    label: 'Secret Leaks',  icon: KeyRound,  color: '#EF4444', desc: '17+ patterns: API keys, tokens, passwords' },
  { key: 'risk',       label: 'Risk Classify',  icon: Scale,     color: '#8B5CF6', desc: '4-tier: offensive/critical/safe/none' },
  { key: 'skill-lint', label: 'Skill Lint',    icon: FileCode,  color: '#10B981', desc: 'SKILL.md frontmatter + structure validator' },
];

interface ScanResult {
  id: string;
  path: string;
  type: ScanType;
  date: string;
  findings: number;
  status: string;
}

export default function CodeAuditPage() {
  const [scanPath, setScanPath] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanType>('deps');
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  const handleScan = () => {
    if (!scanPath) return;
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Code Audit' }]} />
      <div className="cx-page-header cx-mb-24">
        <div>
          <h1 className="cx-flex cx-items-center cx-gap-10 cx-page-title">
            <SearchCode style={{ width: '24px', height: '24px' }} className="cx-text-accent" />
            Code Audit
          </h1>
          <p className="cx-page-subtitle">Dependency vulns · tech debt · secret leaks · risk classification</p>
        </div>
      </div>

      {/* Scan Types Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {SCANS.map(s => (
          <button key={s.key} onClick={() => setSelectedScan(s.key)}
            className="cx-flex cx-items-start cx-gap-12" style={{
              display: 'flex', alignItems: 'flex-start',
              padding: '16px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
              border: selectedScan === s.key ? `1px solid ${s.color}` : '1px solid rgb(var(--border))',
              backgroundColor: selectedScan === s.key ? `${s.color}08` : 'transparent',
              transition: 'all 200ms',
            }}>
            <div className="cx-flex-center cx-r-8" style={{ width: '36px', height: '36px', background: `${s.color}15`, flexShrink: 0 }}>
              <s.icon style={{ width: '18px', height: '18px', color: s.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cx-fw-700 cx-text-primary" style={{ fontSize: '13px' }}>{s.label}</div>
              <div className="cx-text-muted" style={{ fontSize: '10px', lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Run Scan */}
      <div className="cx-card cx-border" style={{ padding: '20px', marginBottom: '24px' }}>
        <p className="cx-fw-600 cx-text-primary" style={{ fontSize: '14px', marginBottom: '12px' }}>
          Run {SCANS.find(s => s.key === selectedScan)?.label} Scan
        </p>
        <div className="cx-flex cx-gap-10">
          <div className="cx-flex cx-items-center cx-gap-8" style={{ flex: 1, position: 'relative' }}>
            <FolderOpen style={{ width: '16px', height: '16px', position: 'absolute', left: '12px' }} className="cx-text-muted" />
            <input value={scanPath} onChange={e => setScanPath(e.target.value)}
              placeholder="/path/to/project or git repo URL..."
              className="cx-input" style={{ flex: 1, paddingLeft: '36px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
            />
          </div>
          <button className="cx-btn-primary" style={{ backgroundColor: SCANS.find(s => s.key === selectedScan)?.color }}
            onClick={handleScan} disabled={scanning || !scanPath}>
            {scanning ? <Loader2 className="cx-spinner" style={{ width: '14px', height: '14px' }} /> : <Play style={{ width: '14px', height: '14px' }} />}
            {scanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>
      </div>

      {/* Recent Scans */}
      <h2 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', marginBottom: '12px' }}>Recent Scans</h2>
      <div className="cx-table-wrap">
        {recentScans.length === 0 ? (
          <div className="cx-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText style={{ width: '48px', height: '48px', opacity: 0.3, margin: '0 auto 16px' }} className="cx-text-muted" />
            <p className="cx-fw-600 cx-text-muted" style={{ fontSize: '15px' }}>No scans yet</p>
            <p className="cx-text-muted" style={{ fontSize: '13px' }}>Run your first code audit scan above</p>
          </div>
        ) : recentScans.map((r, i) => {
          const scan = SCANS.find(s => s.key === r.type)!;
          const isClean = r.status === 'clean';
          return (
            <div key={r.id} className="cx-flex cx-items-center cx-gap-14" style={{
              padding: '14px 18px',
              borderBottom: i < recentScans.length - 1 ? '1px solid rgb(var(--border))' : 'none',
              transition: 'background 150ms', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="cx-flex-center cx-r-8" style={{
                width: '36px', height: '36px', flexShrink: 0,
                background: isClean ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              }}>
                {isClean ? <CheckCircle style={{ width: '18px', height: '18px', color: '#10B981' }} /> : <AlertTriangle style={{ width: '18px', height: '18px', color: '#F59E0B' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div className="cx-fw-600 cx-text-primary cx-mono" style={{ fontSize: '13px' }}>{r.path}</div>
                <div className="cx-flex cx-gap-8 cx-text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                  <span className="cx-flex cx-items-center cx-gap-4"><Clock style={{ width: '10px', height: '10px' }} /> {r.date}</span>
                </div>
              </div>
              <span className="cx-fw-700" style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '5px',
                backgroundColor: `${scan.color}15`, color: scan.color, textTransform: 'uppercase' as const,
              }}>{scan.label}</span>
              <span className="cx-fw-700" style={{
                fontSize: '12px', color: isClean ? '#10B981' : '#F59E0B',
              }}>{r.findings} finding{r.findings !== 1 ? 's' : ''}</span>
              <ChevronRight className="cx-text-muted" style={{ width: '14px', height: '14px' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
