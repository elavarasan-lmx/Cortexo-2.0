'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

export default function SuccessModal({
  open,
  title = 'Operation Successful!',
  description = '',
  actionLabel = 'View Details',
  onAction,
  onClose,
}: SuccessModalProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (open) setTimeout(() => setAnimateIn(true), 50);
    else setAnimateIn(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose?.()}
      style={{
        position: 'fixed', inset: 0, zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        transition: 'opacity 200ms',
        opacity: animateIn ? 1 : 0,
      }}
    >
      <div style={{
        width: '420px', borderRadius: '20px', overflow: 'hidden',
        backgroundColor: '#fff', boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
        textAlign: 'center', padding: '40px 32px',
        transform: animateIn ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
        transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Animated checkmark circle */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
          border: '3px solid #10B981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'successPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <CheckCircle2 style={{ width: '36px', height: '36px', color: '#10B981' }} />
        </div>

        <h2 style={{
          fontSize: '22px', fontWeight: 800, color: '#1a1a2e',
          margin: '0 0 8px', fontFamily: "'Inter', sans-serif",
        }}>
          {title}
        </h2>

        {description && (
          <p style={{
            fontSize: '14px', color: '#6B7280', margin: '0 0 28px',
            lineHeight: 1.5,
          }}>
            {description}
          </p>
        )}

        <button
          onClick={onAction || onClose}
          style={{
            padding: '12px 32px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            color: '#fff', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)';
          }}
        >
          {actionLabel}
        </button>
      </div>

      <style>{`
        @keyframes successPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
