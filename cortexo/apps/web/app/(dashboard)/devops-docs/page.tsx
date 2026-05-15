'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Terminal, Copy, Check, ChevronRight, ChevronDown, Lightbulb, FileCode2, ArrowLeft, Star, FileDown, Plus, ClipboardList, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { ChecklistStep, DevopsChecklist, DevopsDoc, DevopsDocCommand, DevopsDocSnippet, api } from '@/lib/api';

// ─── Syntax Highlighting (basic keyword coloring) ───────────────────
const KW_COLORS: Record<string, string[]> = {
  keyword: ['sudo', 'cd', 'ls', 'rm', 'cp', 'mv', 'cat', 'echo', 'grep', 'awk', 'sed', 'find', 'chmod', 'chown', 'export', 'set', 'alias', 'watch', 'tail', 'head', 'curl', 'wget', 'ssh', 'scp', 'rsync', 'git', 'npm', 'npx', 'node', 'pm2', 'docker', 'ionic', 'cordova', 'flutter', 'dart', 'pod', 'xcrun', 'xcodebuild', 'open', 'security', 'mysql', 'mysqldump', 'keytool', 'jarsigner', 'systemctl', 'journalctl', 'certbot', 'crontab', 'apt', 'install', 'netstat', 'ss', 'htop', 'free', 'ps', 'kill', 'truncate', 'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'CREATE', 'ALTER', 'DROP', 'INSERT', 'UPDATE', 'DELETE', 'GRANT', 'SHOW', 'SET', 'USE', 'BEGIN', 'END', 'IF', 'THEN', 'ELSE', 'ON', 'ALL', 'TABLE', 'EVENT', 'GLOBAL', 'INTO', 'VALUES', 'LIKE', 'AS', 'EVERY', 'ENABLE', 'DISABLE', 'FLUSH', 'PRIVILEGES', 'IDENTIFIED', 'OPTIMIZE', 'REPAIR', 'CHECK', 'TRUNCATE'],
  string: [],
  comment: [],
};
function highlightCode(code: string): React.ReactNode[] {
  return code.split('\n').map((line, li) => {
    const trimmed = line.trimStart();
    // Comment lines
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('--')) {
      return <span key={li}><span style={{ color: '#6a9955' }}>{line}</span>{'\n'}</span>;
    }
    // Highlight keywords
    const parts: React.ReactNode[] = [];
    const regex = /(['"`].*?['"`])|(\$\{[^}]+\})|([\w.-]+)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
      const token = match[0];
      if (match[1]) {
        parts.push(<span key={`${li}-${match.index}`} style={{ color: '#ce9178' }}>{token}</span>);
      } else if (match[2]) {
        parts.push(<span key={`${li}-${match.index}`} style={{ color: '#9cdcfe' }}>{token}</span>);
      } else if (KW_COLORS.keyword.includes(token.toUpperCase()) || KW_COLORS.keyword.includes(token)) {
        parts.push(<span key={`${li}-${match.index}`} style={{ color: '#569cd6', fontWeight: 600 }}>{token}</span>);
      } else if (/^-{1,2}[\w-]+/.test(token)) {
        parts.push(<span key={`${li}-${match.index}`} style={{ color: '#9cdcfe' }}>{token}</span>);
      } else {
        parts.push(token);
      }
      lastIndex = match.index + token.length;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return <span key={li}>{parts}{'\n'}</span>;
  });
}

// ─── Copy as Markdown helper ────────────────────────────────────────
function docToMarkdown(doc: DevopsDoc & { commands?: DevopsDocCommand[]; configSnippets?: DevopsDocSnippet[] }): string {
  let md = `# ${doc.title}\n\n${doc.description}\n\n`;
  md += `## Commands\n\n| Command | Description |\n|---|---|\n`;
  doc.commands?.forEach((c: DevopsDocCommand) => { md += `| \`${c.cmd}\` | ${c.desc} |\n`; });
  if (doc.configSnippets?.length) {
    md += `\n## Config Snippets\n\n`;
    doc.configSnippets?.forEach((s: DevopsDocSnippet) => { md += `### ${s.title}\n\n\`\`\`${s.lang}\n${s.code}\n\`\`\`\n\n`; });
  }
  if (doc.tips?.length) {
    md += `## Pro Tips\n\n`;
    doc.tips.forEach((t: string, i: number) => { md += `${i + 1}. ${t}\n`; });
  }
  return md;
}

// ─── Bookmarks (localStorage) ───────────────────────────────────────
function getBookmarks(): string[] {
  try { return JSON.parse(localStorage.getItem('devops-doc-bookmarks') || '[]'); } catch { return []; }
}
function toggleBookmark(id: string): string[] {
  const bm = getBookmarks();
  const next = bm.includes(id) ? bm.filter(b => b !== id) : [...bm, id];
  localStorage.setItem('devops-doc-bookmarks', JSON.stringify(next));
  return next;
}

// ─── Tool Icon Colors ────────────────────────────────────────────────
const TOOL_COLORS: Record<string, string> = {
  Nginx: '#009639',
  Apache: '#D22128',
  PM2: '#2B037A',
  Git: '#F05032',
  Docker: '#2496ED',
  Systemd: '#555555',
  SSH: '#4EAA25',
  Certbot: '#FFD700',
  MySQL: '#4479A1',
  EC2: '#FF9900',
  Ionic: '#3880FF',
  Flutter: '#027DFD',
  'Node.js': '#339933',
  Cron: '#6C5CE7',
};

const TOOL_ICONS: Record<string, string> = {
  Nginx: 'N',
  Apache: 'A',
  PM2: 'P',
  Git: 'G',
  Docker: 'D',
  Systemd: 'S',
  SSH: '$',
  Certbot: 'C',
  MySQL: 'M',
  EC2: 'E',
  Ionic: 'I',
  Flutter: 'F',
  'Node.js': 'N',
  Cron: 'T',
};

// ─── Copy Button Component ──────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="cx-icon-btn"
      style={{ color: copied ? 'rgb(var(--success))' : 'rgb(var(--text-muted))', flexShrink: 0 }}
    >
      {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function DevOpsDocsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<string>('');
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mdCopied, setMdCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'docs' | 'checklists'>('docs');
  const [checklists, setChecklists] = useState<any[]>([]);
  const [clLoading, setClLoading] = useState(false);
  const [newClient, setNewClient] = useState('');

  // Load bookmarks from localStorage
  useEffect(() => { setBookmarks(getBookmarks()); }, []);

  const handleBookmark = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarks(toggleBookmark(id));
  }, []);

  // Fetch docs list
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (searchQuery) params.q = searchQuery;
        if (activeTool) params.tool = activeTool;
        const res = await api.getDevopsDocs(params) as any;
        setDocs(res.data || []);
      } catch { setDocs([]); }
      setLoading(false);
    };
    const timer = setTimeout(fetchDocs, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTool]);

  // Fetch doc detail
  const openDoc = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.getDevopsDoc(id) as any;
      setSelectedDoc(res.data);
    } catch { /* ignore */ }
    setDetailLoading(false);
  };

  const toggleSnippet = (key: string) => {
    setExpandedSnippets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch checklists
  const fetchChecklists = useCallback(async () => {
    setClLoading(true);
    try { const res = await api.getChecklists() as any; setChecklists(res.data || []); } catch { setChecklists([]); }
    setClLoading(false);
  }, []);
  useEffect(() => { if (activeTab === 'checklists') fetchChecklists(); }, [activeTab, fetchChecklists]);

  const createChecklist = async () => {
    if (!newClient.trim()) return;
    await api.createChecklist({ client_name: newClient.trim() } as any);
    setNewClient('');
    fetchChecklists();
  };
  const toggleStep = async (cl: DevopsChecklist, stepIdx: number) => {
    const steps = [...cl.steps];
    steps[stepIdx] = { ...steps[stepIdx], done: !steps[stepIdx].done };
    const allDone = steps.every((s: ChecklistStep) => s.done);
    await api.updateChecklist(cl.id, { steps, status: allDone ? 'done' : 'in_progress' } as any);
    fetchChecklists();
  };
  const deleteChecklist = async (id: number) => {
    await api.deleteChecklist(id);
    fetchChecklists();
  };

  const tools = [...new Set(docs.map((d: DevopsDoc) => d.tool))];

  // ─── Detail View ──────────────────────────────────────────────────
  if (selectedDoc) {
    const doc = selectedDoc;
    const toolColor = TOOL_COLORS[doc.tool ?? ''] || 'rgb(var(--primary))';

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedDoc(null)}
          className="cx-flex cx-items-center cx-gap-8 cx-text-secondary cx-icon-btn"
          style={{ fontSize: '14px', padding: '8px 0', marginBottom: '16px', fontWeight: 500, borderRadius: 0 }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to all docs
        </button>

        {/* Header */}
        <div className="cx-flex cx-items-center cx-gap-16" style={{ marginBottom: '28px', padding: '24px', borderRadius: '16px', border: '1px solid rgb(var(--border))', background: `linear-gradient(135deg, ${toolColor}12, transparent 60%)` }}>
          <div className="cx-flex-center cx-fw-800" style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: toolColor, color: '#fff', fontSize: '22px', flexShrink: 0 }}>
            {doc.tool ? (TOOL_ICONS[doc.tool] ?? doc.tool[0]) : '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="cx-fw-700 cx-text-primary" style={{ fontSize: '22px', margin: 0 }}>{doc.title}</h1>
            <p className="cx-text-secondary" style={{ fontSize: '14px', margin: '4px 0 0' }}>{doc.description}</p>
          </div>
          <div className="cx-flex cx-items-center cx-gap-8">
            <button
              onClick={() => { navigator.clipboard.writeText(docToMarkdown(doc)); setMdCopied(true); setTimeout(() => setMdCopied(false), 1500); }}
              title="Copy as Markdown"
              className="cx-flex cx-items-center cx-gap-6 cx-btn-secondary cx-text-secondary"
              style={{ fontSize: '12px', fontWeight: 500, padding: '6px 10px', borderRadius: '8px' }}
            >
              <FileDown style={{ width: '14px', height: '14px' }} />
              {mdCopied ? 'Copied!' : 'Copy MD'}
            </button>
            <button
              onClick={() => handleBookmark(doc.id)}
              title={bookmarks.includes(doc.id) ? 'Unpin' : 'Pin to favorites'}
              className="cx-icon-btn"
              style={{ color: bookmarks.includes(doc.id) ? '#F59E0B' : 'rgb(var(--text-muted))' }}
            >
              <Star style={{ width: '20px', height: '20px', fill: bookmarks.includes(doc.id) ? '#F59E0B' : 'none' }} />
            </button>
            <span className="cx-fw-600" style={{ fontSize: '11px', textTransform: 'uppercase', padding: '6px 12px', borderRadius: '8px', color: toolColor, backgroundColor: `${toolColor}18`, whiteSpace: 'nowrap' }}>
              {doc.category}
            </span>
          </div>
        </div>

        {/* Commands */}
        <div className="cx-table-wrap" style={{ marginBottom: '28px' }}>
          <div className="cx-flex cx-items-center cx-gap-10" style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
            <Terminal style={{ width: '18px', height: '18px', color: toolColor }} />
            <h2 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Commands ({doc.commands.length})</h2>
          </div>
          <div>
            {(doc.commands as DevopsDocCommand[] | undefined)?.map((cmd, i: number) => (
              <div
                key={i}
                className="cx-flex cx-items-center cx-gap-12"
                style={{ padding: '12px 20px', borderBottom: i < doc.commands.length - 1 ? '1px solid rgba(var(--border), 0.5)' : 'none', transition: 'background 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(var(--surface-hover), 0.5)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <code className="cx-mono" style={{ flex: 1, color: toolColor, fontWeight: 500, wordBreak: 'break-all', fontSize: '13px' }}>{cmd.cmd}</code>
                <span className="cx-truncate cx-text-muted" style={{ fontSize: '12px', maxWidth: '280px' }}>{cmd.desc}</span>
                <CopyBtn text={cmd.cmd} />
              </div>
            ))}
          </div>
        </div>

        {/* Config Snippets */}
        {doc.configSnippets && doc.configSnippets.length > 0 && (
          <div className="cx-table-wrap" style={{ marginBottom: '28px' }}>
            <div className="cx-flex cx-items-center cx-gap-10" style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
              <FileCode2 style={{ width: '18px', height: '18px', color: toolColor }} />
              <h2 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Config Snippets ({doc.configSnippets.length})</h2>
            </div>
            {(doc.configSnippets as DevopsDocSnippet[] | undefined)?.map((snip, i: number) => {
              const key = `${doc.id}-snip-${i}`;
              const expanded = expandedSnippets[key] !== false;
              return (
                <div key={i} style={{ borderBottom: i < doc.configSnippets.length - 1 ? '1px solid rgba(var(--border), 0.5)' : 'none' }}>
                  <button
                    onClick={() => toggleSnippet(key)}
                    className="cx-flex cx-items-center cx-gap-10 cx-fw-600 cx-text-primary"
                    style={{ width: '100%', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}
                  >
                    {expanded
                      ? <ChevronDown style={{ width: '16px', height: '16px' }} className="cx-text-muted" />
                      : <ChevronRight style={{ width: '16px', height: '16px' }} className="cx-text-muted" />
                    }
                    {snip.title}
                    <span className="cx-text-muted" style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{snip.lang}</span>
                  </button>
                  {expanded && (
                    <div style={{ position: 'relative', margin: '0 20px 16px' }}>
                      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}>
                        <CopyBtn text={snip.code} />
                      </div>
                      <pre style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', color: '#d4d4d4', padding: '16px', borderRadius: '10px', overflow: 'auto', fontSize: '12.5px', lineHeight: 1.6, margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", maxHeight: '400px' }}>
                        {highlightCode(snip.code)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        {doc.tips && doc.tips.length > 0 && (
          <div className="cx-table-wrap">
            <div className="cx-flex cx-items-center cx-gap-10" style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
              <Lightbulb style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
              <h2 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Pro Tips</h2>
            </div>
            <div className="cx-flex-col cx-gap-12" style={{ padding: '16px 20px' }}>
              {doc.tips.map((tip: string, i: number) => (
                <div key={i} className="cx-flex cx-flex-start cx-gap-10 cx-text-secondary" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                  <span className="cx-flex-center cx-fw-700" style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontSize: '11px' }}>
                    {i + 1}
                  </span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── List View ────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header + Tabs */}
      <div className="cx-flex-between" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
        <div>
          <h1 className="cx-flex cx-items-center cx-gap-10 cx-page-title">
            <BookOpen style={{ width: '24px', height: '24px' }} className="cx-text-accent" />
            DevOps Docs
          </h1>
          <p className="cx-text-secondary" style={{ fontSize: '14px', margin: '6px 0 0' }}>
            Quick-reference for Nginx, Apache, PM2, Git, Docker, SSH, and more
          </p>
        </div>
        <div className="cx-flex cx-gap-4 cx-r-10 cx-border cx-surface" style={{ padding: '4px' }}>
          {[{ key: 'docs' as const, label: 'Runbooks', icon: BookOpen }, { key: 'checklists' as const, label: 'Checklists', icon: ClipboardList }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className="cx-flex cx-items-center cx-gap-6 cx-fw-600 cx-r-8" style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '13px', backgroundColor: activeTab === t.key ? 'rgba(var(--primary), 0.1)' : 'transparent', color: activeTab === t.key ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', transition: 'all 200ms' }}>
              <t.icon style={{ width: '14px', height: '14px' }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Checklists Tab ─────────────────────────────────────── */}
      {activeTab === 'checklists' && (
        <div>
          {/* Create new */}
          <div className="cx-flex cx-gap-10 cx-mb-24">
            <input
              value={newClient}
              onChange={e => setNewClient(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createChecklist()}
              placeholder="Client name (e.g. PriyankaBullion)"
              className="cx-search-input"
              style={{ flex: 1, padding: '11px 16px', fontSize: '14px' }}
            />
            <button onClick={createChecklist} className="cx-btn-primary cx-flex cx-items-center cx-gap-6" style={{ padding: '11px 20px' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> New Checklist
            </button>
          </div>
          {clLoading ? (
            <div className="cx-empty cx-text-muted" style={{ padding: '40px', fontSize: '14px', textAlign: 'center' }}>Loading...</div>
          ) : checklists.length === 0 ? (
            <div className="cx-empty cx-text-muted" style={{ padding: '60px', fontSize: '14px', textAlign: 'center' }}>
              No checklists yet. Create one for a client deployment.
            </div>
          ) : (
            <div className="cx-flex-col cx-gap-16">
              {checklists.map((cl: DevopsChecklist) => {
                const done = cl.steps.filter((s: ChecklistStep) => s.done).length;
                const total = cl.steps.length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const statusColor = cl.status === 'completed' ? '#10B981' : cl.status === 'in_progress' ? '#F59E0B' : 'rgb(var(--text-muted))';
                return (
                  <div key={cl.id} className="cx-table-wrap">
                    {/* Checklist header */}
                    <div className="cx-flex-between cx-border-b" style={{ padding: '16px 20px' }}>
                      <div className="cx-flex cx-items-center cx-gap-12">
                        <ClipboardList style={{ width: '20px', height: '20px', color: statusColor }} />
                        <div>
                          <div className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px' }}>{cl.clientName}</div>
                          <div className="cx-text-muted" style={{ fontSize: '11px' }}>{cl.projectType} · {cl.createdAt ? new Date(cl.createdAt).toLocaleDateString() : '—'}</div>
                        </div>
                      </div>
                      <div className="cx-flex cx-items-center cx-gap-12">
                        <span className="cx-fw-600" style={{ fontSize: '12px', color: statusColor }}>{done}/{total} ({pct}%)</span>
                        <div style={{ width: '80px', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(var(--border), 0.5)' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: statusColor, transition: 'width 300ms' }} />
                        </div>
                        <button onClick={() => deleteChecklist(cl.id)} className="cx-icon-btn cx-text-muted">
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                    {/* Steps */}
                    <div style={{ padding: '8px 0' }}>
                      {cl.steps.map((step: ChecklistStep, i: number) => (
                        <div
                          key={i}
                          onClick={() => toggleStep(cl, i)}
                          className="cx-flex cx-items-center cx-gap-12"
                          style={{ padding: '10px 20px', cursor: 'pointer', transition: 'background 150ms' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(var(--surface-hover), 0.5)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {step.done
                            ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10B981', flexShrink: 0 }} />
                            : <Circle style={{ width: '18px', height: '18px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
                          }
                          <span style={{ fontSize: '13px', color: step.done ? 'rgb(var(--text-muted))' : 'rgb(var(--text-primary))', textDecoration: step.done ? 'line-through' : 'none', transition: 'all 200ms' }}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Docs Tab ───────────────────────────────────────────── */}
      {activeTab === 'docs' && (<>

      {/* Search + Filter Bar */}
      <div className="cx-flex cx-gap-12" style={{ marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="cx-search-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <Search className="cx-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search commands, configs, tips..."
            className="cx-search-input"
            style={{ padding: '11px 14px 11px 42px', fontSize: '14px', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = 'rgb(var(--primary))')}
            onBlur={e => (e.target.style.borderColor = 'rgb(var(--border))')}
          />
        </div>

        <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTool('')}
            className="cx-fw-600"
            style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))',
              cursor: 'pointer', fontSize: '12px', transition: 'all 200ms',
              backgroundColor: !activeTool ? 'rgba(var(--primary), 0.1)' : 'transparent',
              color: !activeTool ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
            }}
          >
            All
          </button>
          {['Nginx', 'Apache', 'PM2', 'Git', 'Docker', 'Systemd', 'SSH', 'Certbot', 'MySQL', 'EC2', 'Ionic', 'Flutter', 'Node.js', 'Cron'].map(tool => (
            <button
              key={tool}
              onClick={() => setActiveTool(activeTool === tool ? '' : tool)}
              className="cx-fw-600"
              style={{
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', transition: 'all 200ms',
                border: `1px solid ${activeTool === tool ? TOOL_COLORS[tool] + '60' : 'rgb(var(--border))'}`,
                backgroundColor: activeTool === tool ? TOOL_COLORS[tool] + '18' : 'transparent',
                color: activeTool === tool ? TOOL_COLORS[tool] : 'rgb(var(--text-secondary))',
              }}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Docs Grid */}
      {loading ? (
        <div className="cx-empty cx-text-muted" style={{ padding: '60px', fontSize: '14px', textAlign: 'center' }}>
          Loading documentation...
        </div>
      ) : docs.length === 0 ? (
        <div className="cx-empty cx-text-muted" style={{ padding: '60px', fontSize: '14px', textAlign: 'center' }}>
          No docs found{searchQuery ? ` matching "${searchQuery}"` : ''}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {/* Pinned docs first, then the rest */}
          {[...docs].sort((a, b) => {
            const aPin = bookmarks.includes(String(a.id)) ? 0 : 1;
            const bPin = bookmarks.includes(String(b.id)) ? 0 : 1;
            return aPin - bPin;
          }).map((doc: DevopsDoc) => {
            const toolColor = TOOL_COLORS[doc.tool ?? ''] || 'rgb(var(--primary))';
            const isPinned = bookmarks.includes(String(doc.id));
            return (
              <div
                key={String(doc.id)}
                onClick={() => openDoc(String(doc.id))}
                className="cx-card cx-flex-col cx-gap-14"
                style={{ display: 'flex', flexDirection: 'column', padding: '20px', cursor: 'pointer', transition: 'all 250ms ease' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = toolColor;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${toolColor}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgb(var(--border))';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Tool badge + category + pin */}
                <div className="cx-flex-between">
                  <div className="cx-flex cx-items-center cx-gap-10">
                    <div className="cx-flex-center cx-fw-800" style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      backgroundColor: toolColor, color: '#fff', fontSize: '16px',
                    }}>
                      {doc.tool ? (TOOL_ICONS[doc.tool] ?? doc.tool[0]) : '?'}
                    </div>
                    <div>
                      <div className="cx-fw-700 cx-text-primary" style={{ fontSize: '15px' }}>{doc.title}</div>
                      <div className="cx-text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>{doc.tool}</div>
                    </div>
                  </div>
                  <div className="cx-flex cx-items-center cx-gap-6">
                    <button
                      onClick={e => handleBookmark(String(doc.id), e)}
                      title={isPinned ? 'Unpin' : 'Pin'}
                      className="cx-icon-btn"
                      style={{ color: isPinned ? '#F59E0B' : 'rgb(var(--text-muted))' }}
                    >
                      <Star style={{ width: '16px', height: '16px', fill: isPinned ? '#F59E0B' : 'none' }} />
                    </button>
                    <span className="cx-fw-600" style={{
                      fontSize: '10px', textTransform: 'uppercase',
                      padding: '4px 8px', borderRadius: '6px',
                      color: toolColor, backgroundColor: `${toolColor}12`,
                    }}>
                      {doc.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="cx-text-secondary" style={{ fontSize: '13px', lineHeight: 1.5, margin: 0, flex: 1 }}>
                  {doc.description}
                </p>

                {/* Stats row */}
                <div className="cx-flex cx-gap-16" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(var(--border), 0.5)' }}>
                  <span className="cx-flex cx-items-center cx-gap-4 cx-text-muted" style={{ fontSize: '12px' }}>
                    <Terminal style={{ width: '12px', height: '12px' }} />
                    {doc.commandCount} commands
                  </span>
                  {(doc.snippetCount ?? 0) > 0 && (
                    <span className="cx-flex cx-items-center cx-gap-4 cx-text-muted" style={{ fontSize: '12px' }}>
                      <FileCode2 style={{ width: '12px', height: '12px' }} />
                      {doc.snippetCount} snippets
                    </span>
                  )}
                  {(doc.tipCount ?? 0) > 0 && (
                    <span className="cx-flex cx-items-center cx-gap-4 cx-text-muted" style={{ fontSize: '12px' }}>
                      <Lightbulb style={{ width: '12px', height: '12px' }} />
                      {doc.tipCount} tips
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>)}
    </div>
  );
}
