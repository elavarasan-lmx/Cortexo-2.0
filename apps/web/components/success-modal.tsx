'use client';

import { X, CheckCircle, Rocket, Server, Bug, GitBranch, Bot } from 'lucide-react';

interface SuccessModalProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  variant?: 'deploy' | 'server' | 'bug' | 'pipeline' | 'agent' | 'default';
  onAction?: () => void;
  onClose: () => void;
}

const VARIANT_CFG = {
  deploy:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: Rocket },
  server:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: Server },
  bug:      { color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: Bug },
  pipeline: { color: '#818CF8', bg: 'rgba(129,140,248,0.12)', icon: GitBranch },
  agent:    { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: Bot },
  default:  { color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
};

export default function SuccessModal({
  title = 'Operation Successful!',
  message = 'The operation completed without errors.',
  actionLabel = 'Continue',
  variant = 'default',
  onAction,
  onClose,
}: SuccessModalProps) {
  const cfg = VARIANT_CFG[variant];
  const Icon = cfg.icon;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'sm-fadeIn 150ms ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '440px', maxWidth: '90vw',
          borderRadius: '20px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'sm-scaleIn 250ms cubic-bezier(0.22, 1, 0.36, 1)',
          textAlign: 'center',
          padding: '36px 28px 28px',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgb(var(--text-muted))', padding: '4px', borderRadius: '8px',
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Success icon with animated ring */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          backgroundColor: cfg.bg,
          border: `2px solid ${cfg.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'sm-bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms both',
          boxShadow: `0 8px 32px ${cfg.color}25`,
        }}>
          <Icon style={{ width: '32px', height: '32px', color: cfg.color }} />
        </div>

        {/* Confetti dots */}
        <div style={{ position: 'relative', height: '0px' }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: [cfg.color, '#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#A78BFA'][i],
                top: '-60px',
                left: `${50 + Math.cos((i * Math.PI) / 3) * 80}%`,
                animation: `sm-confetti 600ms ease-out ${200 + i * 80}ms both`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        <h3 style={{
          fontSize: '20px', fontWeight: 700,
          color: 'rgb(var(--text-primary))',
          margin: '0 0 8px',
          fontFamily: "'Inter', sans-serif",
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '13px', lineHeight: 1.6,
          color: 'rgb(var(--text-secondary))',
          margin: '0 0 24px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto',
        }}>
          {message}
        </p>

        <button
          onClick={onAction || onClose}
          style={{
            padding: '11px 32px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600,
            color: '#fff',
            backgroundColor: cfg.color,
            border: 'none', cursor: 'pointer',
            boxShadow: `0 4px 14px ${cfg.color}40`,
            transition: 'all 200ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.color}50`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = `0 4px 14px ${cfg.color}40`;
          }}
        >
          {actionLabel}
        </button>
      </div>

      <style>{`
        @keyframes sm-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sm-scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes sm-bounce { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes sm-confetti { from { opacity: 1; transform: translateY(0) scale(0); } to { opacity: 0; transform: translateY(-30px) scale(1.5); } }
      `}</style>
    </div>
  );
}
