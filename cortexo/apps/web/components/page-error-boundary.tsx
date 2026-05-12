'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PageErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Optional module label shown in the error message, e.g. "Deployments" */
  module?: string;
}

/**
 * PageErrorBoundary — shared UI for all dashboard module error.tsx files.
 *
 * Usage in any module:
 *   'use client';
 *   import { PageErrorBoundary } from '@/components/page-error-boundary';
 *   export default function Error({ error, reset }) {
 *     return <PageErrorBoundary error={error} reset={reset} module="Deployments" />;
 *   }
 */
export function PageErrorBoundary({ error, reset, module }: PageErrorBoundaryProps) {
  useEffect(() => {
    // Log to console in dev; swap for a real error reporter (e.g. Sentry) in prod
    console.error(`[Cortexo] Page error${module ? ` in ${module}` : ''}:`, error);
  }, [error, module]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '20px',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: 'rgba(239,68,68,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertTriangle style={{ width: '28px', height: '28px', color: '#EF4444' }} />
      </div>

      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 700,
            color: 'rgb(var(--text-primary))',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {module ? `${module} failed to load` : 'Something went wrong'}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'rgb(var(--text-muted))',
            lineHeight: 1.6,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          An unexpected error occurred in this section. The rest of your dashboard is unaffected.
        </p>

        {/* Error detail in dev */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre
            style={{
              margin: '8px 0 0',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#EF4444',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
            {error.digest ? `\n\nDigest: ${error.digest}` : ''}
          </pre>
        )}
      </div>

      {/* Retry button */}
      <button
        onClick={reset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: '#fff',
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          boxShadow: '0 4px 14px rgba(124,58,237,0.25)',
          fontFamily: 'Inter, system-ui, sans-serif',
          transition: 'opacity 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <RefreshCw style={{ width: '14px', height: '14px' }} />
        Try again
      </button>
    </div>
  );
}
