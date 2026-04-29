'use client';

import { useState } from 'react';
import {
  Star, Download, CheckCircle, Search,
  Zap, Shield, Code2, Database, GitBranch, Bot,
  BadgeCheck, Users, Package, Loader2, Trash2,
} from 'lucide-react';

/* ─── Category config ─── */
const catCfg: Record<string, { color: string; bg: string }> = {
  'Code Quality': { color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
  'Security':     { color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
  'Migration':    { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  'Testing':      { color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  'Database':     { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  'Ops':          { color: '#F97316', bg: 'rgba(249,115,22,0.1)'  },
};

const tagColors = ['#818CF8','#10B981','#F59E0B','#3B82F6','#EF4444','#F97316','#8B5CF6','#EC4899'];
const tagColor  = (t: string) => tagColors[t.charCodeAt(0) % tagColors.length];

/* ─── Skills data ─── */
const SKILLS: { id: string; name: string; author: string; official: boolean; category: string; stars: number; downloads: number; description: string; tags: string[]; icon: typeof Code2; installed: boolean; featured: boolean }[] = [];

const CATEGORIES = ['All', 'Code Quality', 'Security', 'Migration', 'Testing', 'Database', 'Ops'];

export default function MarketplacePage() {
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [installed,  setInstalled]  = useState<Set<string>>(new Set(SKILLS.filter(s => s.installed).map(s => s.id)));
  const [installing, setInstalling] = useState<string | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);

  const filtered = SKILLS.filter(s => {
    const matchCat    = category === 'All' || s.category === category;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.description.toLowerCase().includes(search.toLowerCase()) ||
                        s.tags.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  async function handleInstall(id: string) {
    setInstalling(id);
    await new Promise(r => setTimeout(r, 1200));
    setInstalled(p => new Set([...p, id]));
    setInstalling(null);
  }
  function handleUninstall(id: string) {
    setInstalled(p => { const n = new Set(p); n.delete(id); return n; });
  }

  const installedCount = installed.size;

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Skill Marketplace</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
            Browse and install community skills to extend Cortexo's AI agent capabilities
          </p>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Available Skills',   value: SKILLS.length,   color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', icon: Package      },
          { label: 'Installed',          value: installedCount,  color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  icon: CheckCircle  },
          { label: 'Community Authors',  value: 2,               color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  icon: Users        },
        ].map((s, i) => (
          <div key={i} style={{
            borderRadius: '14px', padding: '16px 20px',
            backgroundColor: s.bg, border: `1px solid ${s.border}`,
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px', backgroundColor: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: '18px', height: '18px', color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '26px', fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', margin: 0, marginTop: '2px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search + Category filters ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 14px', borderRadius: '10px', flex: '0 0 220px',
          backgroundColor: 'rgb(var(--surface))',
          border: `1px solid ${searchFocus ? 'rgba(var(--primary),0.5)' : 'rgb(var(--border))'}`,
          boxShadow: searchFocus ? '0 0 0 3px rgba(var(--primary),0.08)' : 'none',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'rgb(var(--text-primary))', width: '100%' }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat;
            const cc = cat === 'All' ? { color: '#818CF8', bg: 'rgba(129,140,248,0.12)' } : (catCfg[cat] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' });
            return (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? cc.bg : 'transparent',
                color: isActive ? cc.color : 'rgb(var(--text-muted))',
                outline: isActive ? `1px solid ${cc.color}40` : '1px solid transparent',
                transition: 'all 150ms',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = cc.bg; e.currentTarget.style.color = cc.color; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; } }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgb(var(--text-muted))', flexShrink: 0 }}>
          {filtered.length} skill{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ─── Skills grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '12px' }}>
        {filtered.map(skill => {
          const Icon        = skill.icon;
          const isInstalled = installed.has(skill.id);
          const isInstalling = installing === skill.id;
          const cc          = catCfg[skill.category] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };

          return (
            <div
              key={skill.id}
              style={{
                borderRadius: '14px', overflow: 'hidden',
                backgroundColor: 'rgb(var(--surface))',
                border: `1px solid ${isInstalled ? 'rgba(16,185,129,0.25)' : 'rgb(var(--border))'}`,
                borderTop: `3px solid ${isInstalled ? '#10B981' : cc.color}`,
                display: 'flex', flexDirection: 'column',
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${cc.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                    {/* Icon box */}
                    <div style={{
                      width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px',
                      backgroundColor: cc.bg, border: `1px solid ${cc.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: '18px', height: '18px', color: cc.color }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
                          {skill.name}
                        </span>
                        {skill.featured && (
                          <span style={{ padding: '1px 6px', borderRadius: '5px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {/* Author */}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                          {skill.official
                            ? <BadgeCheck style={{ width: '11px', height: '11px', color: 'rgb(var(--primary))' }} />
                            : <Users style={{ width: '11px', height: '11px' }} />}
                          {skill.author}
                        </span>
                        {/* Category */}
                        <span style={{ padding: '1px 6px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, backgroundColor: cc.bg, color: cc.color }}>
                          {skill.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600, color: '#F59E0B' }}>
                      <Star style={{ width: '11px', height: '11px' }} fill="#F59E0B" />
                      {skill.stars}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                      <Download style={{ width: '10px', height: '10px' }} />
                      {skill.downloads.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.6 }}>
                  {skill.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skill.tags.map(t => {
                    const tc = tagColor(t);
                    return (
                      <span key={t} style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, backgroundColor: `${tc}12`, color: tc }}>
                        #{t}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action footer */}
              <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(var(--border),0.4)' }}>
                {isInstalled ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '8px', borderRadius: '9px', fontSize: '12px', fontWeight: 700,
                      backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}>
                      <CheckCircle style={{ width: '13px', height: '13px' }} />
                      Installed
                    </div>
                    <button
                      onClick={() => handleUninstall(skill.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600,
                        backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444',
                        transition: 'background-color 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.16)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                    >
                      <Trash2 style={{ width: '12px', height: '12px' }} />
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleInstall(skill.id)}
                    disabled={!!isInstalling}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      padding: '9px', borderRadius: '9px', border: 'none', cursor: isInstalling ? 'not-allowed' : 'pointer',
                      fontSize: '13px', fontWeight: 600, color: '#fff',
                      background: `linear-gradient(135deg, ${cc.color}, ${cc.color}bb)`,
                      opacity: isInstalling ? 0.8 : 1,
                      boxShadow: `0 4px 12px ${cc.color}30`,
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={e => { if (!isInstalling) { e.currentTarget.style.boxShadow = `0 6px 18px ${cc.color}45`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 12px ${cc.color}30`; e.currentTarget.style.transform = 'none'; }}
                  >
                    {isInstalling
                      ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Installing...</>
                      : <><Download style={{ width: '14px', height: '14px' }} /> Install Skill</>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
          padding: '60px 24px', textAlign: 'center', borderRadius: '14px',
          border: '1px dashed rgb(var(--border))', backgroundColor: 'rgb(var(--surface))',
        }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(var(--border),0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))' }} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>No skills match your search</p>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>Try a different keyword or category</p>
        </div>
      )}
    </div>
  );
}
