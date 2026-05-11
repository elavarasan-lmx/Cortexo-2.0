'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Terminal, Copy, Check, ChevronRight, ChevronDown, Lightbulb, FileCode2, ArrowLeft, Star, FileDown, Plus, ClipboardList, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAutoLoadToken } from '@/lib/hooks';

// ─── Syntax Highlighting (basic keyword coloring) ───────────────────
const KW_COLORS: Record<string, string[]> = {
  keyword: ['sudo', 'cd', 'ls', 'rm', 'cp', 'mv', 'cat', 'echo', 'grep', 'awk', 'sed', 'find', 'chmod', 'chown', 'export', 'set', 'alias', 'watch', 'tail', 'head', 'curl', 'wget', 'ssh', 'scp', 'rsync', 'git', 'npm', 'npx', 'node', 'pm2', 'docker', 'ionic', 'cordova', 'mysql', 'mysqldump', 'keytool', 'jarsigner', 'systemctl', 'journalctl', 'certbot', 'crontab', 'apt', 'install', 'netstat', 'ss', 'htop', 'free', 'ps', 'kill', 'truncate', 'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'CREATE', 'ALTER', 'DROP', 'INSERT', 'UPDATE', 'DELETE', 'GRANT', 'SHOW', 'SET', 'USE', 'BEGIN', 'END', 'IF', 'THEN', 'ELSE', 'ON', 'ALL', 'TABLE', 'EVENT', 'GLOBAL', 'INTO', 'VALUES', 'LIKE', 'AS', 'EVERY', 'ENABLE', 'DISABLE', 'FLUSH', 'PRIVILEGES', 'IDENTIFIED', 'OPTIMIZE', 'REPAIR', 'CHECK', 'TRUNCATE'],
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
function docToMarkdown(doc: any): string {
  let md = `# ${doc.title}\n\n${doc.description}\n\n`;
  md += `## Commands\n\n| Command | Description |\n|---|---|\n`;
  doc.commands.forEach((c: any) => { md += `| \`${c.cmd}\` | ${c.desc} |\n`; });
  if (doc.configSnippets?.length) {
    md += `\n## Config Snippets\n\n`;
    doc.configSnippets.forEach((s: any) => { md += `### ${s.title}\n\n\`\`\`${s.lang}\n${s.code}\n\`\`\`\n\n`; });
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
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        color: copied ? 'rgb(var(--success))' : 'rgb(var(--text-muted))',
        transition: 'color 200ms', flexShrink: 0,
      }}
    >
      {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function DevOpsDocsPage() {
  useAutoLoadToken();
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
    await api.createChecklist({ clientName: newClient.trim() });
    setNewClient('');
    fetchChecklists();
  };
  const toggleStep = async (cl: any, stepIdx: number) => {
    const steps = [...cl.steps];
    steps[stepIdx] = { ...steps[stepIdx], done: !steps[stepIdx].done };
    const allDone = steps.every((s: any) => s.done);
    await api.updateChecklist(cl.id, { steps, status: allDone ? 'completed' : 'in_progress' });
    fetchChecklists();
  };
  const deleteChecklist = async (id: number) => {
    await api.deleteChecklist(id);
    fetchChecklists();
  };

  const tools = [...new Set(docs.map((d: any) => d.tool))];

  // ─── Detail View ──────────────────────────────────────────────────
  if (selectedDoc) {
    const doc = selectedDoc;
    const toolColor = TOOL_COLORS[doc.tool] || 'rgb(var(--primary))';

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedDoc(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
            border: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary))',
            fontSize: '14px', padding: '8px 0', marginBottom: '16px', fontWeight: 500,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to all docs
        </button>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px',
          padding: '24px', borderRadius: '16px', border: '1px solid rgb(var(--border))',
          background: `linear-gradient(135deg, ${toolColor}12, transparent 60%)`,
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            backgroundColor: toolColor, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 800, flexShrink: 0,
          }}>
            {TOOL_ICONS[doc.tool] || doc.tool[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
              {doc.title}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', margin: '4px 0 0' }}>
              {doc.description}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { navigator.clipboard.writeText(docToMarkdown(doc)); setMdCopied(true); setTimeout(() => setMdCopied(false), 1500); }}
              title="Copy as Markdown"
              style={{ background: 'none', border: '1px solid rgb(var(--border))', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgb(var(--text-secondary))', fontSize: '12px', fontWeight: 500, transition: 'all 200ms' }}
            >
              <FileDown style={{ width: '14px', height: '14px' }} />
              {mdCopied ? 'Copied!' : 'Copy MD'}
            </button>
            <button
              onClick={() => handleBookmark(doc.id)}
              title={bookmarks.includes(doc.id) ? 'Unpin' : 'Pin to favorites'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: bookmarks.includes(doc.id) ? '#F59E0B' : 'rgb(var(--text-muted))', transition: 'color 200ms' }}
            >
              <Star style={{ width: '20px', height: '20px', fill: bookmarks.includes(doc.id) ? '#F59E0B' : 'none' }} />
            </button>
            <span style={{
              fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
              padding: '6px 12px', borderRadius: '8px', color: toolColor,
              backgroundColor: `${toolColor}18`, whiteSpace: 'nowrap',
            }}>
              {doc.category}
            </span>
          </div>
        </div>

        {/* Commands */}
        <div style={{
          marginBottom: '28px', backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))', borderRadius: '14px', overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <Terminal style={{ width: '18px', height: '18px', color: toolColor }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
              Commands ({doc.commands.length})
            </h2>
          </div>
          <div>
            {doc.commands.map((cmd: any, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px',
                  borderBottom: i < doc.commands.length - 1 ? '1px solid rgba(var(--border), 0.5)' : 'none',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(var(--surface-hover), 0.5)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <code style={{
                  flex: 1, fontSize: '13px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: toolColor, fontWeight: 500, wordBreak: 'break-all',
                }}>
                  {cmd.cmd}
                </code>
                <span style={{
                  fontSize: '12px', color: 'rgb(var(--text-muted))',
                  whiteSpace: 'nowrap', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {cmd.desc}
                </span>
                <CopyBtn text={cmd.cmd} />
              </div>
            ))}
          </div>
        </div>

        {/* Config Snippets */}
        {doc.configSnippets && doc.configSnippets.length > 0 && (
          <div style={{
            marginBottom: '28px', backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))', borderRadius: '14px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <FileCode2 style={{ width: '18px', height: '18px', color: toolColor }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
                Config Snippets ({doc.configSnippets.length})
              </h2>
            </div>
            {doc.configSnippets.map((snip: any, i: number) => {
              const key = `${doc.id}-snip-${i}`;
              const expanded = expandedSnippets[key] !== false; // default open
              return (
                <div key={i} style={{
                  borderBottom: i < doc.configSnippets.length - 1 ? '1px solid rgba(var(--border), 0.5)' : 'none',
                }}>
                  <button
                    onClick={() => toggleSnippet(key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgb(var(--text-primary))', fontSize: '14px', fontWeight: 600, textAlign: 'left',
                    }}
                  >
                    {expanded
                      ? <ChevronDown style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
                      : <ChevronRight style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
                    }
                    {snip.title}
                    <span style={{
                      marginLeft: 'auto', fontSize: '11px', fontWeight: 500,
                      color: 'rgb(var(--text-muted))', textTransform: 'uppercase',
                    }}>
                      {snip.lang}
                    </span>
                  </button>
                  {expanded && (
                    <div style={{ position: 'relative', margin: '0 20px 16px' }}>
                      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}>
                        <CopyBtn text={snip.code} />
                      </div>
                      <pre style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.45)', color: '#d4d4d4',
                        padding: '16px', borderRadius: '10px', overflow: 'auto',
                        fontSize: '12.5px', lineHeight: 1.6, margin: 0,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        maxHeight: '400px',
                      }}>
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
          <div style={{
            backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))', borderRadius: '14px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Lightbulb style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
                Pro Tips
              </h2>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {doc.tips.map((tip: string, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  fontSize: '13px', color: 'rgb(var(--text-secondary))', lineHeight: 1.5,
                }}>
                  <span style={{
                    flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                  }}>
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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))' }} />
            DevOps Docs
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '6px', margin: 0 }}>
            Quick-reference for Nginx, Apache, PM2, Git, Docker, SSH, and more
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'rgb(var(--surface))', borderRadius: '10px', padding: '4px', border: '1px solid rgb(var(--border))' }}>
          {[{ key: 'docs' as const, label: 'Runbooks', icon: BookOpen }, { key: 'checklists' as const, label: 'Checklists', icon: ClipboardList }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: activeTab === t.key ? 'rgba(var(--primary), 0.1)' : 'transparent',
              color: activeTab === t.key ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
              transition: 'all 200ms',
            }}>
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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input
              value={newClient}
              onChange={e => setNewClient(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createChecklist()}
              placeholder="Client name (e.g. PriyankaBullion)"
              style={{ flex: 1, padding: '11px 16px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '14px', outline: 'none' }}
            />
            <button onClick={createChecklist} style={{ padding: '11px 20px', borderRadius: '10px', border: 'none', backgroundColor: 'rgb(var(--primary))', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> New Checklist
            </button>
          </div>
          {clLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgb(var(--text-muted))' }}>Loading...</div>
          ) : checklists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgb(var(--text-muted))', fontSize: '14px' }}>
              No checklists yet. Create one for a client deployment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {checklists.map((cl: any) => {
                const done = cl.steps.filter((s: any) => s.done).length;
                const total = cl.steps.length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const statusColor = cl.status === 'completed' ? '#10B981' : cl.status === 'in_progress' ? '#F59E0B' : 'rgb(var(--text-muted))';
                return (
                  <div key={cl.id} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', overflow: 'hidden' }}>
                    {/* Checklist header */}
                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgb(var(--border))' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ClipboardList style={{ width: '20px', height: '20px', color: statusColor }} />
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{cl.clientName}</div>
                          <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>{cl.projectType} · {new Date(cl.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor }}>{done}/{total} ({pct}%)</span>
                        <div style={{ width: '80px', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(var(--border), 0.5)' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: statusColor, transition: 'width 300ms' }} />
                        </div>
                        <button onClick={() => deleteChecklist(cl.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px' }}>
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                    {/* Steps */}
                    <div style={{ padding: '8px 0' }}>
                      {cl.steps.map((step: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => toggleStep(cl, i)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', cursor: 'pointer', transition: 'background 150ms' }}
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
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            width: '16px', height: '16px', color: 'rgb(var(--text-muted))',
          }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search commands, configs, tips..."
            style={{
              width: '100%', padding: '11px 14px 11px 42px', borderRadius: '10px',
              border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
              color: 'rgb(var(--text-primary))', fontSize: '14px', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 200ms',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgb(var(--primary))')}
            onBlur={e => (e.target.style.borderColor = 'rgb(var(--border))')}
          />
        </div>

        {/* Tool Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTool('')}
            style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              backgroundColor: !activeTool ? 'rgba(var(--primary), 0.1)' : 'transparent',
              color: !activeTool ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
              transition: 'all 200ms',
            }}
          >
            All
          </button>
          {['Nginx', 'Apache', 'PM2', 'Git', 'Docker', 'Systemd', 'SSH', 'Certbot', 'MySQL', 'EC2', 'Ionic', 'Node.js', 'Cron'].map(tool => (
            <button
              key={tool}
              onClick={() => setActiveTool(activeTool === tool ? '' : tool)}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: `1px solid ${activeTool === tool ? TOOL_COLORS[tool] + '60' : 'rgb(var(--border))'}`,
                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                backgroundColor: activeTool === tool ? TOOL_COLORS[tool] + '18' : 'transparent',
                color: activeTool === tool ? TOOL_COLORS[tool] : 'rgb(var(--text-secondary))',
                transition: 'all 200ms',
              }}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Docs Grid */}
      {loading ? (
        <div style={{
          textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '60px',
          fontSize: '14px',
        }}>
          Loading documentation...
        </div>
      ) : docs.length === 0 ? (
        <div style={{
          textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '60px',
          fontSize: '14px',
        }}>
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
            const aPin = bookmarks.includes(a.id) ? 0 : 1;
            const bPin = bookmarks.includes(b.id) ? 0 : 1;
            return aPin - bPin;
          }).map((doc: any) => {
            const toolColor = TOOL_COLORS[doc.tool] || 'rgb(var(--primary))';
            const isPinned = bookmarks.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => openDoc(doc.id)}
                style={{
                  backgroundColor: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '14px', padding: '20px', cursor: 'pointer',
                  transition: 'all 250ms ease',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                }}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      backgroundColor: toolColor, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 800,
                    }}>
                      {TOOL_ICONS[doc.tool] || doc.tool[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '2px' }}>
                        {doc.tool}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={e => handleBookmark(doc.id, e)}
                      title={isPinned ? 'Unpin' : 'Pin'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isPinned ? '#F59E0B' : 'rgb(var(--text-muted))', transition: 'color 200ms' }}
                    >
                      <Star style={{ width: '16px', height: '16px', fill: isPinned ? '#F59E0B' : 'none' }} />
                    </button>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                      padding: '4px 8px', borderRadius: '6px',
                      color: toolColor, backgroundColor: `${toolColor}12`,
                    }}>
                      {doc.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '13px', color: 'rgb(var(--text-secondary))',
                  lineHeight: 1.5, margin: 0,
                }}>
                  {doc.description}
                </p>

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '12px',
                  borderTop: '1px solid rgba(var(--border), 0.5)',
                }}>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Terminal style={{ width: '12px', height: '12px' }} />
                    {doc.commandCount} commands
                  </span>
                  {doc.snippetCount > 0 && (
                    <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileCode2 style={{ width: '12px', height: '12px' }} />
                      {doc.snippetCount} snippets
                    </span>
                  )}
                  {doc.tipCount > 0 && (
                    <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
