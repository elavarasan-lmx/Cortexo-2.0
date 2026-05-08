'use client';

import { useState } from 'react';
import { RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';

interface RollbackModalProps {
  open: boolean;
  deployId: string | number;
  serverName: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function RollbackModal({
  open,
  deployId,
  serverName,
  onConfirm,
  onCancel,
}: RollbackModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); } catch { /* */ }
    setLoading(false);
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && !loading && onCancel()}
      style={{
        position: 'fixed', inset: 0, zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{
        width: '480px', borderRadius: '20px', overflow: 'hidden',
        backgroundColor: '#fff', boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
        padding: '28px',
      }}>
        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <RotateCcw style={{ width: '26px', height: '26px', color: '#D97706' }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '22px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 10px',
          fontFamily: "'Inter', sans-serif",
        }}>
          Rollback Deployment?
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px',
        }}>
          You are about to rollback deployment <strong style={{ color: '#1a1a2e' }}>#{deployId}</strong> on{' '}
          <strong style={{ color: '#1a1a2e' }}>{serverName}</strong> to the previous stable version.
        </p>

        {/* Warning banner */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '14px 16px', borderRadius: '10px',
          backgroundColor: '#FFFBEB', border: '1px solid #FDE68A',
          marginBottom: '24px',
        }}>
          <AlertTriangle style={{ width: '18px', height: '18px', color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5, fontWeight: 500 }}>
            This action cannot be undone. A new deployment will be created.
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 22px', borderRadius: '10px',
              border: '1px solid #E5E7EB', backgroundColor: '#fff',
              color: '#6B7280', fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
            }}
          >
            {loading ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <RotateCcw style={{ width: '16px', height: '16px' }} />
            )}
            {loading ? 'Rolling back…' : 'Confirm Rollback'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
