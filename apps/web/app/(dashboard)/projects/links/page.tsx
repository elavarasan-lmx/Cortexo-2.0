'use client';

import { useState } from 'react';
import {
  ExternalLink, Plus, Copy, Trash2, Globe, Github,
  FileText, Monitor, Database, Link2, CheckCircle,
  Figma, LayoutDashboard, X,
} from 'lucide-react';

/* ── Type & Data ────────────────────────────────── */
type LinkCategory = 'source' | 'design' | 'live' | 'testing' | 'project';

type LinkItem = {
  id: number;
  label: string;
  url: string;
  category: LinkCategory;
};

const categoryConfig: Record<LinkCategory, { icon: any; color: string; bg: string; label: string }> = {
  source:  { icon: Github,          color: '#6366F1', bg: '#6366F115', label: 'Source Code' },
  design:  { icon: Figma,           color: '#A855F7', bg: '#A855F715', label: 'Design' },
  live:    { icon: Globe,           color: '#10B981', bg: '#10B98115', label: 'Live' },
  testing: { icon: Monitor,         color: '#F59E0B', bg: '#F59E0B15', label: 'Testing' },
  project: { icon: LayoutDashboard, color: '#3B82F6', bg: '#3B82F615', label: 'Project Mgmt' },
};

const initialLinks: LinkItem[] = [
  { id: 1, label: 'GitHub Repository',       url: 'https://github.com/winbull/cortexo-idp',       category: 'source' },
  { id: 2, label: 'Figma Designs',           url: 'https://figma.com/file/cortexo-idp',           category: 'design' },
  { id: 3, label: 'Production Environment',  url: 'https://cortexo.io',                           category: 'live' },
  { id: 4, label: 'Staging Environment',     url: 'https://staging.cortexo.io',                   category: 'testing' },
  { id: 5, label: 'Jira Board',              url: 'https://jira.winbull.com/cortexo-idp',         category: 'project' },
];

/* ── Shared inline styles ───────────────────────── */
const rowCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px 20px',
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '12px',
  transition: 'box-shadow 200ms, border-color 200ms',
  cursor: 'default',
};

const iconBox = (bg: string): React.CSSProperties => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const badge = (color: string): React.CSSProperties => ({
  padding: '3px 10px',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  color,
  backgroundColor: `${color}15`,
  border: `1px solid ${color}25`,
  whiteSpace: 'nowrap',
});

const actionBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  padding: '7px 14px',
  borderRadius: '8px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'transparent',
  color: 'rgb(var(--text-secondary))',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 200ms',
  whiteSpace: 'nowrap',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '13px',
  borderRadius: '10px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))',
  outline: 'none',
  transition: 'border-color 200ms',
};

/* ── Component ──────────────────────────────────── */
export default function ProjectLinksPage() {
  const [links, setLinks] = useState(initialLinks);
  const [copied, setCopied] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '', category: 'source' as LinkCategory });

  function copyUrl(id: number, url: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function addLink() {
    if (!newLink.label || !newLink.url) return;
    setLinks([...links, { ...newLink, id: Date.now() }]);
    setNewLink({ label: '', url: '', category: 'source' });
    setShowAdd(false);
  }

  function removeLink(id: number) {
    setLinks(links.filter(l => l.id !== id));
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
            Project Links
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
            Manage external URLs and resources for Cortexo IDP
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px -2px rgba(var(--primary), 0.4)',
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {showAdd ? <X style={{ width: '13px', height: '13px' }} /> : <Plus style={{ width: '13px', height: '13px' }} />}
          {showAdd ? 'Cancel' : '+ Add Link'}
        </button>
      </div>

      {/* ── Add Link Form ── */}
      {showAdd && (
        <div style={{
          padding: '20px 24px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          borderRadius: '14px',
          marginBottom: '16px',
          animation: 'fadeInDown 250ms ease-out',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 14px' }}>
            Add New Link
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 160px', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>
                Label *
              </label>
              <input
                type="text"
                value={newLink.label}
                onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                placeholder="Production Website"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>
                URL *
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={newLink.category}
                onChange={e => setNewLink({ ...newLink, category: e.target.value as LinkCategory })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', gap: '8px' }}>
            <button
              onClick={() => setShowAdd(false)}
              style={{ ...actionBtn }}
            >
              Cancel
            </button>
            <button
              onClick={addLink}
              style={{
                ...actionBtn,
                border: 'none',
                backgroundColor: '#10B981',
                color: '#fff',
              }}
            >
              <Plus style={{ width: '12px', height: '12px' }} /> Save Link
            </button>
          </div>
        </div>
      )}

      {/* ── Links List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="stagger-children">
        {links.map(link => {
          const cfg = categoryConfig[link.category] || categoryConfig.source;
          const CatIcon = cfg.icon;
          const isCopied = copied === link.id;

          return (
            <div
              key={link.id}
              style={rowCard}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = `rgba(var(--primary), 0.15)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgb(var(--border))';
              }}
            >
              {/* Icon */}
              <div style={iconBox(cfg.bg)}>
                <CatIcon style={{ width: '18px', height: '18px', color: cfg.color }} />
              </div>

              {/* Label + Badge */}
              <div style={{ minWidth: '180px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
                  {link.label}
                </p>
                <span style={badge(cfg.color)}>{cfg.label}</span>
              </div>

              {/* URL */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                <code style={{
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgb(var(--text-muted))',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}>
                  {link.url}
                </code>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => copyUrl(link.id, link.url)}
                  title="Copy URL"
                  style={{
                    ...actionBtn,
                    color: isCopied ? '#10B981' : 'rgb(var(--text-secondary))',
                    borderColor: isCopied ? 'rgba(16,185,129,0.3)' : 'rgb(var(--border))',
                    backgroundColor: isCopied ? 'rgba(16,185,129,0.06)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isCopied) { e.currentTarget.style.borderColor = 'rgba(var(--primary),0.3)'; e.currentTarget.style.color = 'rgb(var(--primary))'; } }}
                  onMouseLeave={e => { if (!isCopied) { e.currentTarget.style.borderColor = 'rgb(var(--border))'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; } }}
                >
                  {isCopied
                    ? <><CheckCircle style={{ width: '12px', height: '12px' }} /> Copied</>
                    : <><Copy style={{ width: '12px', height: '12px' }} /> Copy</>
                  }
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit"
                  style={{
                    ...actionBtn,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(var(--primary),0.3)'; e.currentTarget.style.color = 'rgb(var(--primary))'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; }}
                >
                  Visit <ExternalLink style={{ width: '11px', height: '11px' }} />
                </a>
                <button
                  onClick={() => removeLink(link.id)}
                  title="Delete"
                  style={{
                    ...actionBtn,
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: 'rgb(var(--text-muted))',
                    padding: '7px 10px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#EF4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}
                >
                  <Trash2 style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {links.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'rgb(var(--text-muted))',
        }}>
          <div className="float-icon" style={{ marginBottom: '16px' }}>
            <Link2 style={{ width: '40px', height: '40px', opacity: 0.4 }} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px', color: 'rgb(var(--text-secondary))' }}>
            No links yet
          </p>
          <p style={{ fontSize: '13px', margin: 0 }}>
            Add your first project link to get started
          </p>
        </div>
      )}
    </div>
  );
}
