import Link from 'next/link';

/**
 * Custom 404 — shown when a route doesn't match any page.
 */
export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'rgb(var(--background, 15 23 42))',
        color: 'rgb(var(--text-primary, 241 245 249))',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '8px',
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            color: 'rgb(var(--text-secondary, 148 163 184))',
            fontSize: '14px',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            borderRadius: '10px',
            backgroundColor: 'rgb(var(--primary, 129 140 248))',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'opacity 200ms',
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
