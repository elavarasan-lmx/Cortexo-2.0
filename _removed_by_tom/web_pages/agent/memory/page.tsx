'use client';

import { useState, useEffect } from 'react';
import {
  Brain, Database, Sparkles, Clock, Tag,
  Search, Server, Bug, Zap, Layers, Box,
  Trash2, ArrowUpRight, RefreshCw, AlertTriangle, Loader2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface Memory {
  id: number | string;
  key: string;
  value: string;
  tags: string[];
  age: string;
  type: string;
  score: number;
}

/* ─── Type config ─── */
const typeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Brain }> = {
  pattern:    { label: 'Pattern',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  icon: Zap    },
  lesson:     { label: 'Lesson',     color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: Bug    },
  preference: { label: 'Preference', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: Sparkles },
  fix:        { label: 'Fix',        color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: Server },
};

/* ─── Tag color cycling ─── */
const tagColors = [
  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentMemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeType, setActiveType] = useState('all');

  const fetchMemories = async () => {
    try {
      const token = localStorage.getItem('cortexo_token');
      const res = await fetch(`${API}/agent/memory`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      const rows = json?.data || json || [];
      setMemories(Array.isArray(rows) ? rows.map((r: any) => ({
        id: r.id,
        key: r.key || r.memoryKey || '',
        value: r.value || r.content || '',
        tags: Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : []),
        age: r.createdAt ? timeAgo(r.createdAt) : '',
        type: r.type || r.category || 'pattern',
        score: r.confidence ?? r.score ?? 50,
      })) : []);
    } catch { /* API may not be running */ }
    setLoading(false);
  };

  useEffect(() => { fetchMemories(); }, []);

  const filtered = memories.filter(m => {
    const matchType = activeType === 'all' || m.type === activeType;
    const matchSearch = !search
      || m.key.toLowerCase().includes(search.toLowerCase())
      || m.value.toLowerCase().includes(search.toLowerCase())
      || m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const types = ['all', ...Array.from(new Set(memories.map(m => m.type)))];

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Agent Memory</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Persistent knowledge base the AI agent learns about your projects
          </p>
        </div>
        {/* Memory count badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          padding: '8px 14px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.06))',
          border: '1px solid rgba(139,92,246,0.25)',
        }}>
          <Database style={{ width: '14px', height: '14px', color: '#8B5CF6' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#8B5CF6' }}>
            {memories.length} memories
          </span>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
        </div>
        {/* Consolidate Now button */}
        <button style={{
          padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: 'white',
          fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'box-shadow 200ms',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          <RefreshCw style={{ width: '13px', height: '13px' }} />
          Consolidate Now
        </button>
      </div>

      {/* ─── Stats: Memory by Type + Quality Distribution ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Memory by Type */}
        <div style={{
          backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
          borderRadius: '14px', padding: '20px',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 14px' }}>Memory by Type</h3>
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const count = memories.filter(m => m.type === key).length;
            const pct = Math.round((count / memories.length) * 100);
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ height: '6px', flex: 1, borderRadius: '3px', backgroundColor: 'rgba(var(--border), 0.3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: cfg.color, borderRadius: '3px' }} />
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: cfg.color, minWidth: '80px' }}>{cfg.label}</span>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', minWidth: '24px', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
        {/* Quality Distribution */}
        <div style={{
          backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
          borderRadius: '14px', padding: '20px',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 14px' }}>Quality Distribution</h3>
          {[
            { range: '90-100', color: '#10B981', count: memories.filter(m => (m as any).score >= 90).length },
            { range: '70-89',  color: '#3B82F6', count: memories.filter(m => (m as any).score >= 70 && (m as any).score < 90).length },
            { range: '50-69',  color: '#F59E0B', count: memories.filter(m => (m as any).score >= 50 && (m as any).score < 70).length },
            { range: '<50',    color: '#EF4444', count: memories.filter(m => (m as any).score < 50).length },
          ].map(q => {
            const pct = memories.length > 0 ? Math.round((q.count / memories.length) * 100) : 0;
            return (
              <div key={q.range} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: 'rgba(var(--border), 0.3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: q.color, borderRadius: '3px' }} />
                </div>
                <span style={{ fontSize: '12px', color: q.color, minWidth: '50px' }}>{q.range}</span>
                <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', minWidth: '24px', textAlign: 'right' }}>{q.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Search + filter row ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px', borderRadius: '10px',
          backgroundColor: 'rgb(var(--surface))',
          border: `1px solid ${searchFocused ? 'rgba(139,92,246,0.5)' : 'rgb(var(--border))'}`,
          boxShadow: searchFocused ? '0 0 0 3px rgba(139,92,246,0.08)' : 'none',
          transition: 'border-color 150ms, box-shadow 150ms',
          flex: 1, maxWidth: '280px',
        }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search keys, values, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              backgroundColor: 'transparent', border: 'none', outline: 'none',
              fontSize: '13px', color: 'rgb(var(--text-primary))', width: '100%',
            }}
          />
        </div>

        {/* Type filter pills */}
        {types.map(t => {
          const active = activeType === t;
          const cfg = typeConfig[t];
          const activeColor = t === 'all' ? '#8B5CF6' : cfg?.color;
          const activeBg    = t === 'all' ? 'rgba(139,92,246,0.12)' : `${cfg?.color}18`;
          const count = t === 'all' ? memories.length : memories.filter(m => m.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 600 : 500, textTransform: 'capitalize',
                backgroundColor: active ? activeBg : 'rgb(var(--surface))',
                color: active ? activeColor : 'rgb(var(--text-secondary))',
                outline: active ? `1px solid ${activeColor}50` : '1px solid rgb(var(--border))',
                transition: 'all 150ms',
              }}
            >
              {t !== 'all' && cfg && <cfg.icon style={{ width: '10px', height: '10px', color: active ? cfg.color : 'rgb(var(--text-muted))' }} />}
              {t === 'all' ? 'All' : cfg?.label}
              <span style={{
                padding: '1px 5px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                backgroundColor: active ? `${activeColor}20` : 'rgba(0,0,0,0.05)',
                color: active ? activeColor : 'rgb(var(--text-muted))',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Memory cards ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((m, idx) => {
          const cfg = typeConfig[m.type] || typeConfig.pattern;
          const TypeIcon = cfg.icon;

          return (
            <div
              key={m.id}
              style={{
                borderRadius: '14px',
                border: '1px solid rgb(var(--border))',
                borderLeft: `4px solid ${cfg.color}`,
                backgroundColor: 'rgb(var(--surface))',
                overflow: 'hidden',
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px -4px ${cfg.color}20`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ padding: '14px 18px' }}>
                {/* Top row: icon + key + type badge + age + actions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Type icon */}
                  <div style={{
                    width: '38px', height: '38px', flexShrink: 0, borderRadius: '10px',
                    backgroundColor: cfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '1px',
                  }}>
                    <TypeIcon style={{ width: '17px', height: '17px', color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Key row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                      <code style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: '13px', fontWeight: 700, color: cfg.color,
                        backgroundColor: `${cfg.color}10`,
                        padding: '2px 8px', borderRadius: '5px',
                      }}>
                        {m.key}
                      </code>
                      {/* Type badge */}
                      <span style={{
                        padding: '2px 7px', borderRadius: '5px', fontSize: '10px',
                        fontWeight: 700, textTransform: 'uppercase',
                        backgroundColor: cfg.bg, color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Value */}
                    <p style={{
                      fontSize: '13px', lineHeight: 1.65,
                      color: 'rgb(var(--text-secondary))',
                      margin: '0 0 8px',
                    }}>
                      {m.value}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {m.tags.map((tag, ti) => {
                        const tc = tagColors[ti % tagColors.length];
                        return (
                          <span key={tag} style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '3px 8px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 600,
                            backgroundColor: tc.bg, color: tc.color,
                          }}>
                            <Tag style={{ width: '9px', height: '9px' }} />
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right column: time + actions */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgb(var(--text-muted))', whiteSpace: 'nowrap' }}>
                      <Clock style={{ width: '10px', height: '10px' }} />
                      {m.age}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button style={{
                        width: '28px', height: '28px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                        backgroundColor: 'rgba(var(--primary),0.08)', color: 'rgb(var(--primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background-color 150ms',
                      }}
                        title="View full memory"
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary),0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary),0.08)'; }}
                      >
                        <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                      </button>
                      <button style={{
                        width: '28px', height: '28px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                        backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background-color 150ms',
                      }}
                        title="Delete memory"
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                      >
                        <Trash2 style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Empty state ─── */}
      {filtered.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          padding: '60px 24px', textAlign: 'center',
          borderRadius: '14px', border: '1px dashed rgb(var(--border))',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.06))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain style={{ width: '26px', height: '26px', color: '#8B5CF6', opacity: 0.7 }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>No memories found</p>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            {search ? `No results for "${search}"` : 'No memories in this category yet'}
          </p>
        </div>
      )}

      {/* ─── Stale Memories ─── */}
      {memories.length > 0 && (
        <div style={{
          marginTop: '20px', borderRadius: '14px', padding: '16px 20px',
          backgroundColor: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
              Stale Memories (valid_until expired): <span style={{ color: '#F59E0B' }}>{memories.filter(m => m.score < 50).length}</span>
            </span>
          </div>
          <a href="#" style={{
            fontSize: '12px', fontWeight: 600, color: '#F59E0B', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            Review →
          </a>
        </div>
      )}

      {/* ─── Auto-grow info panel ─── */}
      <div style={{
        marginTop: '12px', borderRadius: '14px', padding: '18px 20px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.03))',
        border: '1px dashed rgba(139,92,246,0.3)',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{
          width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles style={{ width: '18px', height: '18px', color: '#8B5CF6' }} />
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 3px' }}>
            Agent Memory grows automatically
          </p>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0, lineHeight: 1.5 }}>
            As the AI analyzes your deployments and errors, it builds a persistent knowledge base about your stack, patterns, and bug history.
          </p>
        </div>
      </div>
    </div>
  );
}
