'use client';
import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Shield, Lock, Unlock, EyeOff, Globe, HardDrive,
  Copy, CheckCircle, AlertTriangle, Key, Fingerprint,
  ShieldCheck, ShieldAlert, Archive, Clock, FileText,
} from 'lucide-react';

type Tab = 'encrypt' | 'redact' | 'ssrf' | 'backup';
const TABS: { key: Tab; label: string; icon: any; color: string }[] = [
  { key: 'encrypt', label: 'Encrypt / Decrypt', icon: Lock, color: '#8B5CF6' },
  { key: 'redact',  label: 'PII Redactor',      icon: EyeOff, color: '#F59E0B' },
  { key: 'ssrf',    label: 'URL Guard',          icon: Globe,  color: '#EF4444' },
  { key: 'backup',  label: 'Backups',            icon: HardDrive, color: '#06B6D4' },
];

interface Backup {
  id: number;
  name: string;
  size: string;
  date: string;
  status: string;
}

export default function SecurityPage() {
  const [tab, setTab] = useState<Tab>('encrypt');
  const [encInput, setEncInput] = useState('');
  const [encMode, setEncMode] = useState<'encrypt'|'decrypt'>('encrypt');
  const [encResult, setEncResult] = useState('');
  const [redactInput, setRedactInput] = useState('');
  const [redactResult, setRedactResult] = useState('');
  const [ssrfUrl, setSsrfUrl] = useState('');
  const [ssrfResult, setSsrfResult] = useState<{safe:boolean;reason:string}|null>(null);
  const [copied, setCopied] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleRedact = () => {
    let o = redactInput;
    o = o.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');
    o = o.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE REDACTED]');
    o = o.replace(/(?:api[_-]?key|token|secret|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{16,}['"]?/gi, '[CREDENTIAL REDACTED]');
    o = o.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP REDACTED]');
    setRedactResult(o);
  };

  const handleSsrfCheck = () => {
    try {
      const host = new URL(ssrfUrl).hostname;
      const blocked = [/^127\./,/^10\./,/^172\.(1[6-9]|2\d|3[01])\./,/^192\.168\./,/^0\./,/^169\.254\./,/^localhost$/i,/^\[::1\]$/];
      const isBlocked = blocked.some(p => p.test(host));
      setSsrfResult({ safe: !isBlocked, reason: isBlocked ? `Blocked: ${host} is internal` : `Safe: ${host} is public` });
    } catch { setSsrfResult({ safe: false, reason: 'Invalid URL format' }); }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Security Center' }]} />
      <div className="cx-page-header cx-mb-24">
        <div>
          <h1 className="cx-flex cx-items-center cx-gap-10 cx-page-title">
            <Shield style={{ width:'24px', height:'24px' }} className="cx-text-accent" />
            Security Center
          </h1>
          <p className="cx-page-subtitle">Encryption · PII redaction · SSRF protection · Backup management</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'12px', marginBottom:'24px' }}>
        {[
          { icon: ShieldCheck, label:'Encryption', val:'AES-256', sub:'GCM authenticated', color:'#10B981' },
          { icon: Fingerprint, label:'PII Patterns', val:'17+', sub:'regex detectors', color:'#8B5CF6' },
          { icon: ShieldAlert, label:'SSRF Guard', val:'Active', sub:'DNS pinning enabled', color:'#EF4444' },
          { icon: Archive, label:'Backups', val:String(backups.length), sub:'snapshots stored', color:'#06B6D4' },
        ].map(s => (
          <div key={s.label} className="cx-card-sm cx-border" style={{ padding:'16px 20px' }}>
            <div className="cx-flex cx-items-center cx-gap-8" style={{ marginBottom:'8px' }}>
              <s.icon style={{ width:'16px', height:'16px', color:s.color }} /><span className="cx-label">{s.label}</span>
            </div>
            <div className="cx-fw-800 cx-text-28" style={{ color:s.color }}>{s.val}</div>
            <div className="cx-text-muted" style={{ fontSize:'11px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="cx-flex cx-gap-4" style={{ marginBottom:'20px', borderBottom:'1px solid rgb(var(--border))' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className="cx-flex cx-items-center cx-gap-6 cx-fw-600" style={{
            padding:'10px 18px', fontSize:'13px', border:'none', backgroundColor:'transparent', cursor:'pointer',
            color: tab === t.key ? t.color : 'rgb(var(--text-muted))',
            borderBottom: tab === t.key ? `2px solid ${t.color}` : '2px solid transparent', transition:'all 150ms',
          }}><t.icon style={{ width:'14px', height:'14px' }} />{t.label}</button>
        ))}
      </div>

      {tab === 'encrypt' && (
        <div className="cx-card cx-border" style={{ padding:'24px' }}>
          <div className="cx-flex cx-gap-8" style={{ marginBottom:'16px' }}>
            {(['encrypt','decrypt'] as const).map(m => (
              <button key={m} onClick={() => setEncMode(m)} className="cx-btn-primary" style={{
                backgroundColor: encMode===m ? '#8B5CF6' : 'transparent',
                color: encMode===m ? '#fff' : 'rgb(var(--text-muted))',
                border: encMode===m ? 'none' : '1px solid rgb(var(--border))',
              }}>{m==='encrypt' ? <Lock style={{width:'14px',height:'14px'}}/> : <Unlock style={{width:'14px',height:'14px'}}/>} {m}</button>
            ))}
          </div>
          <textarea value={encInput} onChange={e=>setEncInput(e.target.value)} placeholder={encMode==='encrypt'?'Plaintext...':'Ciphertext...'} className="cx-input" style={{ minHeight:'100px', resize:'vertical', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', marginBottom:'12px' }} />
          <button className="cx-btn-primary" style={{ backgroundColor:'#8B5CF6' }} onClick={() => setEncResult(`[Connect to cortexo security ${encMode} CLI]`)}>
            {encMode==='encrypt'?<Lock style={{width:'14px',height:'14px'}}/>:<Unlock style={{width:'14px',height:'14px'}}/>} {encMode}
          </button>
          {encResult && (
            <div className="cx-flex-between cx-r-12" style={{ padding:'14px 18px', marginTop:'12px', border:'1px solid rgba(139,92,246,0.2)', backgroundColor:'rgba(139,92,246,0.06)' }}>
              <code style={{ flex:1, wordBreak:'break-all', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px' }}>{encResult}</code>
              <button onClick={() => handleCopy(encResult)} className="cx-icon-btn cx-text-muted">
                {copied ? <CheckCircle style={{width:'16px',height:'16px',color:'#10B981'}}/> : <Copy style={{width:'16px',height:'16px'}}/>}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'redact' && (
        <div className="cx-card cx-border" style={{ padding:'24px' }}>
          <p className="cx-text-muted cx-text-13" style={{ marginBottom:'16px' }}>Strips emails, phones, IPs, API keys, and credentials.</p>
          <textarea value={redactInput} onChange={e=>setRedactInput(e.target.value)} placeholder="Paste text containing PII to redact..." className="cx-input" style={{ minHeight:'120px', resize:'vertical', fontSize:'13px', marginBottom:'12px' }} />
          <button className="cx-btn-primary" style={{ backgroundColor:'#F59E0B' }} onClick={handleRedact}><EyeOff style={{width:'14px',height:'14px'}}/> Redact PII</button>
          {redactResult && <div className="cx-r-12" style={{ padding:'16px 18px', marginTop:'12px', border:'1px solid rgba(245,158,11,0.2)', backgroundColor:'rgba(245,158,11,0.06)', fontFamily:"'JetBrains Mono', monospace", fontSize:'12px', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{redactResult}</div>}
        </div>
      )}

      {tab === 'ssrf' && (
        <div className="cx-card cx-border" style={{ padding:'24px' }}>
          <p className="cx-text-muted cx-text-13" style={{ marginBottom:'16px' }}>Blocks requests to internal networks (127.x, 10.x, 192.168.x, localhost).</p>
          <div className="cx-flex cx-gap-10" style={{ marginBottom:'16px' }}>
            <input value={ssrfUrl} onChange={e=>setSsrfUrl(e.target.value)} placeholder="https://example.com" className="cx-input" style={{ flex:1, fontFamily:"'JetBrains Mono', monospace", fontSize:'12px' }} />
            <button className="cx-btn-primary" style={{ backgroundColor:'#EF4444' }} onClick={handleSsrfCheck}><Globe style={{width:'14px',height:'14px'}}/> Check</button>
          </div>
          {ssrfResult && (
            <div className="cx-flex cx-items-center cx-gap-10 cx-r-12" style={{ padding:'14px 18px', border:`1px solid ${ssrfResult.safe?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}`, backgroundColor:ssrfResult.safe?'rgba(16,185,129,0.06)':'rgba(239,68,68,0.06)' }}>
              {ssrfResult.safe ? <CheckCircle style={{width:'18px',height:'18px',color:'#10B981'}}/> : <AlertTriangle style={{width:'18px',height:'18px',color:'#EF4444'}}/>}
              <span className="cx-fw-600 cx-text-13" style={{ color:ssrfResult.safe?'#10B981':'#EF4444' }}>{ssrfResult.reason}</span>
            </div>
          )}
          <div style={{ marginTop:'20px' }}>
            <p className="cx-label" style={{ marginBottom:'8px' }}>Quick Tests</p>
            <div className="cx-flex cx-gap-6" style={{ flexWrap:'wrap' }}>
              {['http://127.0.0.1','http://10.0.0.1:8080','http://169.254.169.254','https://google.com','http://localhost:3000'].map(u => (
                <button key={u} onClick={() => { setSsrfUrl(u); setSsrfResult(null); }} className="cx-btn-secondary" style={{ fontSize:'11px', padding:'4px 10px', fontFamily:"'JetBrains Mono', monospace" }}>{u}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'backup' && (
        <div>
          <div className="cx-flex-between" style={{ marginBottom:'16px' }}>
            <p className="cx-text-muted cx-text-13">Config + skills + database snapshots.</p>
            <button className="cx-btn-primary" style={{ backgroundColor:'#06B6D4' }}><Archive style={{width:'14px',height:'14px'}}/> Create Backup</button>
          </div>
          {backups.length === 0 ? (
            <div className="cx-card cx-border cx-empty" style={{ padding:'60px 20px', textAlign:'center' }}>
              <Archive style={{ width:'48px', height:'48px', opacity:0.3, marginBottom:'16px', margin:'0 auto 16px' }} className="cx-text-muted" />
              <p className="cx-fw-600 cx-text-muted" style={{ fontSize:'15px' }}>No backups yet</p>
              <p className="cx-text-muted" style={{ fontSize:'13px' }}>Create your first backup to get started</p>
            </div>
          ) : (
            <div className="cx-table-wrap">
              {backups.map((b,i) => (
                <div key={b.id} className="cx-flex cx-items-center cx-gap-14" style={{ padding:'14px 18px', borderBottom:i<backups.length-1?'1px solid rgb(var(--border))':'none', transition:'background 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div className="cx-flex-center cx-r-8" style={{ width:'36px', height:'36px', background:'rgba(6,182,212,0.1)', flexShrink:0 }}>
                    <Archive style={{ width:'18px', height:'18px', color:'#06B6D4' }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="cx-fw-600 cx-text-primary" style={{ fontSize:'14px' }}>{b.name}</div>
                    <div className="cx-flex cx-gap-8 cx-text-muted" style={{ fontSize:'11px', marginTop:'2px' }}>
                      <span className="cx-flex cx-items-center cx-gap-4"><Clock style={{width:'10px',height:'10px'}}/> {b.date}</span>
                      <span>{b.size}</span>
                    </div>
                  </div>
                  <span className="cx-fw-700" style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'5px', backgroundColor:'rgba(16,185,129,0.1)', color:'#10B981', textTransform:'uppercase' as const }}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
