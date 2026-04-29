'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '12px',
  border: '1px solid #334155',
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  padding: '12px 16px 12px 40px',
  fontSize: '14px',
  color: 'white',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  height: '16px',
  width: '16px',
  color: '#64748B',
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgb(15, 23, 42)',
      }}
    >
      {/* Background gradient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: '30%',
            top: '30%',
            height: '384px',
            width: '384px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '28rem' }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                height: '40px',
                width: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366F1, #9333EA)',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>C</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>Cortexo</span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid #1E293B',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            padding: '32px',
            backdropFilter: 'blur(24px)',
          }}
        >
          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  margin: '0 auto 16px',
                  display: 'flex',
                  height: '56px',
                  width: '56px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                }}
              >
                <Mail style={{ height: '28px', width: '28px', color: '#34D399' }} />
              </div>
              <h2 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 600, color: 'white' }}>
                Check your email
              </h2>
              <p style={{ marginBottom: '24px', fontSize: '14px', color: '#94A3B8' }}>
                We sent a password reset link to{' '}
                <span style={{ fontWeight: 500, color: 'white' }}>{email}</span>
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#818CF8',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft style={{ height: '16px', width: '16px' }} />
                Back to sign in
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 600, color: 'white' }}>
                Reset your password
              </h2>
              <p style={{ marginBottom: '24px', fontSize: '14px', color: '#94A3B8' }}>
                Enter the email address associated with your account and we&apos;ll send you a reset link.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#CBD5E1' }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={iconStyle} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="reset-submit"
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to right, #6366F1, #9333EA)',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  Send Reset Link
                  <ArrowRight style={{ height: '16px', width: '16px' }} />
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#818CF8',
                    textDecoration: 'none',
                  }}
                >
                  <ArrowLeft style={{ height: '16px', width: '16px' }} />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
