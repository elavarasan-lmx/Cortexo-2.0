/**
 * Root loading skeleton — shown during route transitions.
 */
export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'rgb(var(--background, 15 23 42))',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(var(--border, 51 65 85), 0.5)',
            borderTopColor: 'rgb(var(--primary, 129 140 248))',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p
          style={{
            color: 'rgb(var(--text-muted, 100 116 139))',
            fontSize: '14px',
          }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
