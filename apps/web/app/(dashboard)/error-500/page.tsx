'use client';

import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error500Page() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgb(var(--background))', padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
      gap: '28px',
    }}>
      {/* Animated error icon */}
      <div style={{
        width: '120px', height: '120px', borderRadius: '50%',
        backgroundColor: '#FEE2E2',
        border: '3px solid #FECACA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 40px rgba(239,68,68,0.15)',
        animation: 'err-pulse 2s ease-in-out infinite',
      }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#EF4444' }} />
      </div>

      {/* Error code */}
      <span style={{
        fontSize: '72px', fontWeight: 800,
        color: '#EF4444', letterSpacing: '-2px',
        lineHeight: 1,
        textShadow: '0 4px 12px rgba(239,68,68,0.2)',
      }}>
        500
      </span>

      {/* Title */}
      <h1 style={{
        fontSize: '28px', fontWeight: 700,
        color: '#1E293B', margin: 0,
      }}>
        Internal Server Error
      </h1>

      {/* Description */}
      <p style={{
        fontSize: '15px', lineHeight: 1.6,
        color: '#64748B', margin: 0,
        textAlign: 'center', maxWidth: '420px',
      }}>
        Something went wrong on our end. Our team has been notified and is working on a fix.
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600,
            color: '#fff', backgroundColor: '#7C3AED',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
            transition: 'all 200ms',
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
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          Try Again
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600,
            color: '#64748B',
            backgroundColor: '#fff',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 200ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))';
            e.currentTarget.style.borderColor = '#CBD5E1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <Home style={{ width: '14px', height: '14px' }} />
          Go Home
        </button>
      </div>

      {/* Support line */}
      <p style={{
        fontSize: '13px', color: '#94A3B8', margin: 0,
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <Mail style={{ width: '12px', height: '12px' }} />
        If this persists, contact support@cortexo.dev
      </p>

      <style>{`
        @keyframes err-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 12px 40px rgba(239,68,68,0.15); }
          50% { transform: scale(1.05); box-shadow: 0 16px 48px rgba(239,68,68,0.25); }
        }
      `}</style>
    </div>
  );
}
