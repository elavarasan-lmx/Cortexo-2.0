'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, FolderGit2, Bug, Rocket, GitBranch, Server,
  ScrollText, BarChart3, Settings, BookOpen, Terminal,
} from 'lucide-react';
import { api } from '@/lib/api';

/* ─── Searchable items ─── */
const SEARCHABLE = [
  { label: 'Dashboard',         href: '/dashboard',           icon: BarChart3,       category: 'Pages' },
  { label: 'All Projects',      href: '/projects',            icon: FolderGit2,      category: 'Pages' },
  { label: 'Deployments',       href: '/deployments',         icon: Rocket,          category: 'CI/CD' },
  { label: 'Pipelines',         href: '/pipelines',           icon: GitBranch,       category: 'CI/CD' },
  { label: 'Bug Tracker',       href: '/bug-tracker',         icon: Bug,             category: 'Bugs' },
  { label: 'Servers',           href: '/servers',             icon: Server,          category: 'Infrastructure' },
  { label: 'Settings',          href: '/settings',            icon: Settings,        category: 'Settings' },
  { label: 'Deploy Profiles',   href: '/settings/profiles',   icon: Settings,        category: 'Settings' },
  { label: 'DevOps Docs',       href: '/devops-docs',         icon: BookOpen,        category: 'DevOps' },
];

const catColors: Record<string, string> = {
  Pages: '#818CF8', 'CI/CD': '#3B82F6', Bugs: '#EF4444', Infrastructure: '#F97316',
  Settings: '#6B7280', DevOps: '#10B981',
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [devopsResults, setDevopsResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? SEARCHABLE.filter(s => s.label.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase()))
    : SEARCHABLE;

  // DevOps docs search (debounced API call)
  useEffect(() => {
    if (!open || !query.trim() || query.length < 2) { setDevopsResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        api.loadToken();
        const res = await api.searchDevopsDocs(query) as any;
        const combined = [...(res.data?.static || []), ...(res.data?.custom || [])];
        setDevopsResults(combined.slice(0, 5));
      } catch { setDevopsResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelectedIdx(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const navigate = useCallback((href: string) => {
    handleClose();
    router.push(href);
  }, [handleClose, router]);

  /* Keyboard shortcut: Ctrl+K */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) handleClose(); else handleOpen();
      }
      if (e.key === 'Escape' && open) handleClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleOpen, handleClose]);

  /* Arrow keys / Enter */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIdx]) { navigate(filtered[selectedIdx].href); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, selectedIdx, navigate]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!open) return null;

  /* Group by category */
  const grouped: Record<string, typeof SEARCHABLE> = {};
  filtered.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  let flatIdx = -1;

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, width: '560px', maxWidth: '90vw',
        borderRadius: '16px', overflow: 'hidden',
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgba(var(--border),0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(var(--primary),0.1)',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(var(--border),0.2)',
        }}>
          <Search style={{ width: '18px', height: '18px', color: 'rgb(var(--primary))', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, features, settings…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              backgroundColor: 'transparent', color: 'rgb(var(--text-primary))',
              fontSize: '15px', fontWeight: 500,
            }}
          />
          <kbd style={{
            padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            backgroundColor: 'rgba(var(--border),0.3)', color: 'rgb(var(--text-muted))',
            border: '1px solid rgba(var(--border),0.2)',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{
          maxHeight: '380px', overflowY: 'auto', padding: '8px',
          scrollbarWidth: 'thin',
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: '6px' }}>
              <p style={{
                padding: '6px 10px 4px', margin: 0,
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: catColors[cat] || 'rgb(var(--text-muted))',
              }}>{cat}</p>

              {items.map(item => {
                flatIdx++;
                const isSelected = flatIdx === selectedIdx;
                const Icon = item.icon;
                const currentFlatIdx = flatIdx;
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelectedIdx(currentFlatIdx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                      padding: '9px 12px', borderRadius: '10px', border: 'none',
                      cursor: 'pointer', textAlign: 'left', transition: 'background-color 100ms',
                      backgroundColor: isSelected ? 'rgba(var(--primary),0.12)' : 'transparent',
                      color: isSelected ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                    }}
                  >
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      backgroundColor: isSelected ? 'rgba(var(--primary),0.15)' : 'rgba(var(--border),0.3)',
                    }}>
                      <Icon style={{ width: '14px', height: '14px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500 }}>{item.label}</span>
                    {isSelected && (
                      <span style={{
                        marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))',
                      }}>↵ Enter</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* DevOps Docs results */}
          {devopsResults.length > 0 && (
            <div style={{ marginBottom: '6px' }}>
              <p style={{
                padding: '6px 10px 4px', margin: 0,
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: catColors['DevOps'],
              }}>DevOps Docs</p>
              {devopsResults.map((doc: any) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/devops-docs?highlight=${doc.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '9px 12px', borderRadius: '10px', border: 'none',
                    cursor: 'pointer', textAlign: 'left', transition: 'background-color 100ms',
                    backgroundColor: 'transparent',
                    color: 'rgb(var(--text-secondary))',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.12)'; e.currentTarget.style.color = '#10B981'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; }}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    backgroundColor: doc.color ? `${doc.color}20` : 'rgba(var(--border),0.3)',
                  }}>
                    <Terminal style={{ width: '14px', height: '14px' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>{doc.title}</span>
                    <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))' }}>{doc.tool} · {doc.category}</span>
                  </div>
                  <BookOpen style={{ width: '12px', height: '12px', flexShrink: 0, opacity: 0.5 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          borderTop: '1px solid rgba(var(--border),0.15)', padding: '10px 18px',
          display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'rgb(var(--text-muted))',
        }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
          <span style={{ marginLeft: 'auto' }}>
            <kbd style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.3)', fontSize: '10px' }}>Ctrl</kbd>
            {' + '}
            <kbd style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(var(--border),0.3)', fontSize: '10px' }}>K</kbd>
          </span>
        </div>
      </div>
    </>
  );
}
