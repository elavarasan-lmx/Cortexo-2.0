'use client';

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'No Deployments Yet',
  description = 'Get started by creating your first deployment.',
  icon,
  actionLabel = 'Create First',
  onAction,
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 32px', textAlign: 'center',
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(var(--primary),0.08), rgba(var(--primary),0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        {icon || <Inbox style={{ width: '36px', height: '36px', color: 'rgb(var(--primary))' }} />}
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>{title}</h2>
      <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: '0 0 24px', maxWidth: '340px', lineHeight: 1.5 }}>{description}</p>

      {onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
