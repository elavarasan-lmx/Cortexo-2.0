'use client';

export default function EmailTemplatePage() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>📧 Email Template Preview</h1>
      <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: '0 0 24px' }}>Preview of transactional emails sent by Cortexo</p>

      {/* Email Preview */}
      <div style={{
        borderRadius: '16px', border: '1px solid rgb(var(--border))',
        backgroundColor: '#ffffff', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        {/* Email Header */}
        <div style={{ padding: '32px 40px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 800 }}>◉</div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>Cortexo</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' }}>Reset Your Password</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>We received a request to reset your password</p>
        </div>

        {/* Email Body */}
        <div style={{ padding: '32px 40px' }}>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: '0 0 20px' }}>
            Hi <strong>Jerry</strong>,
          </p>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: '0 0 20px' }}>
            We received a request to reset the password for your Cortexo account. Click the button below to choose a new password:
          </p>

          <div style={{ textAlign: 'center', margin: '28px 0' }}>
            <button style={{
              padding: '14px 40px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
            }}>
              Reset Password
            </button>
          </div>

          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7, margin: '0 0 16px' }}>
            This link will expire in <strong>24 hours</strong>. If you didn't request a password reset, you can safely ignore this email.
          </p>

          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#F3F4F6', margin: '20px 0', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#6B7280', wordBreak: 'break-all' }}>
            https://app.cortexo.dev/reset?token=eyJhbGciOiJIUzI1NiJ9...
          </div>
        </div>

        {/* Email Footer */}
        <div style={{ padding: '20px 40px', borderTop: '1px solid #E5E7EB', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px' }}>© 2026 Cortexo · The Brain for Your Code</p>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
            <a href="#" style={{ color: '#7C3AED', textDecoration: 'none' }}>Unsubscribe</a> · <a href="#" style={{ color: '#7C3AED', textDecoration: 'none' }}>Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
