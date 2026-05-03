'use client';

import { FolderOpen, Search, Server, Bug, Rocket, GitBranch, Bot, Clock, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'folder' | 'search' | 'server' | 'bug' | 'deploy' | 'pipeline' | 'agent' | 'cron';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ICON_MAP = {
  folder: FolderOpen,
  search: Search,
  server: Server,
  bug: Bug,
  deploy: Rocket,
  pipeline: GitBranch,
  agent: Bot,
  cron: Clock,
};

const ICON_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  folder:   { color: '#818CF8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.15)' },
  search:   { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.15)' },
  server:   { color: '#F97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.15)' },
  bug:      { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.15)' },
  deploy:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.15)' },
  pipeline: { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.15)' },
  agent:    { color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)' },
  cron:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.15)' },
};

export default function EmptyState({
  icon = 'folder',
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Icon = ICON_MAP[icon];
  const cfg = ICON_COLORS[icon];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 40px', textAlign: 'center', gap: '20px',
      animation: 'fadeIn 300ms ease-out',
    }}>
      {/* Icon circle */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '24px',
        backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 32px ${cfg.color}15`,
      }}>
        <Icon style={{ width: '36px', height: '36px', color: cfg.color, opacity: 0.8 }} />
      </div>

      {/* Text */}
      <div style={{ maxWidth: '360px' }}>
        <h3 style={{
          fontSize: '18px', fontWeight: 700,
          color: 'rgb(var(--text-primary))',
          margin: '0 0 8px',
          fontFamily: "'Inter', sans-serif",
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '13px', lineHeight: 1.6,
          color: 'rgb(var(--text-secondary))',
          margin: 0,
        }}>
          {description}
        </p>
      </div>

      {/* CTA */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 22px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600,
            color: '#fff',
            backgroundColor: 'rgb(var(--primary))',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
            transition: 'all 200ms',
            marginTop: '4px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.3)';
          }}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
          {actionLabel}
        </button>
      )}

      {/* Decorative dots */}
      <div style={{
        display: 'flex', gap: '6px', marginTop: '8px', opacity: 0.3,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: cfg.color,
            animation: `pulse 1.5s infinite ${i * 0.3}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.3); } }
      `}</style>
    </div>
  );
}
