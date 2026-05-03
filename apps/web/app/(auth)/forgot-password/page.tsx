'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Lock, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const BRAND_PURPLE = '#7c5cfc';
const INPUT_BG = '#f3f1f9';
const TEXT_MUTED = '#8b8b9e';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', backgroundColor: '#f5f5f8',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{
          borderRadius: '20px', backgroundColor: 'white',
          padding: '40px 36px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                margin: '0 auto 20px', display: 'flex',
                height: '64px', width: '64px',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.08)',
              }}>
                <CheckCircle style={{ height: '32px', width: '32px', color: '#10b981' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', marginBottom: '10px' }}>
                Check your email
              </h2>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '8px' }}>
                We sent a password reset link to
              </p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '28px' }}>
                {email}
              </p>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '14px', fontWeight: 600, color: BRAND_PURPLE, textDecoration: 'none',
              }}>
                <ArrowLeft style={{ height: '16px', width: '16px' }} />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div style={{
                margin: '0 auto 20px', display: 'flex',
                height: '64px', width: '64px',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', backgroundColor: `${BRAND_PURPLE}10`,
              }}>
                <Lock style={{ height: '28px', width: '28px', color: BRAND_PURPLE }} />
              </div>
              <h2 style={{
                fontSize: '22px', fontWeight: 700, color: '#1a1a2e',
                marginBottom: '10px', textAlign: 'center',
              }}>
                Forgot password?
              </h2>
              <p style={{
                fontSize: '14px', color: TEXT_MUTED,
                marginBottom: '28px', textAlign: 'center', lineHeight: 1.6,
              }}>
                No worries! Enter your email and we&apos;ll send you a reset link.
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div>
                  <label htmlFor="email" style={{
                    display: 'block', marginBottom: '8px',
                    fontSize: '14px', fontWeight: 600, color: '#1a1a2e',
                  }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      height: '16px', width: '16px', color: TEXT_MUTED,
                    }} />
                    <input
                      id="email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jerry@cortexo.dev" required
                      style={{
                        width: '100%', padding: '14px 16px 14px 42px',
                        borderRadius: '10px', border: 'none',
                        backgroundColor: INPUT_BG, fontSize: '14px',
                        color: '#1a1a2e', outline: 'none',
                      }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${BRAND_PURPLE}40`}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    />
                  </div>
                </div>
                <button type="submit" id="reset-submit" style={{
                  width: '100%', padding: '14px',
                  borderRadius: '12px', border: 'none',
                  background: `linear-gradient(135deg, ${BRAND_PURPLE}, #a855f7)`,
                  fontSize: '15px', fontWeight: 600,
                  color: 'white', cursor: 'pointer',
                }}>
                  Send Reset Link →
                </button>
              </form>
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '14px', fontWeight: 500,
                  color: BRAND_PURPLE, textDecoration: 'none',
                }}>
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
