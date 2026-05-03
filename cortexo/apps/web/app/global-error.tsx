'use client';

/**
 * Global error boundary — catches unhandled React errors.
 * Prevents full-page crashes and provides a user-friendly recovery UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0F172A',
          color: '#F1F5F9',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div
            style={{
              fontSize: '64px',
              marginBottom: '16px',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            💥
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '8px',
              color: '#F87171',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: '#94A3B8',
              fontSize: '14px',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {error.message || 'An unexpected error occurred. Our team has been notified.'}
          </p>
          {error.digest && (
            <p
              style={{
                color: '#64748B',
                fontSize: '12px',
                fontFamily: 'monospace',
                marginBottom: '16px',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#818CF8',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6366F1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#818CF8';
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
