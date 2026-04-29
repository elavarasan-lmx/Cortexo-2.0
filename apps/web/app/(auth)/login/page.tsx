'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Github, Mail, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

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

const inputStyleNoIcon: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '16px',
  paddingRight: '40px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#CBD5E1',
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

const oauthBtnStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  borderRadius: '12px',
  border: '1px solid #334155',
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 500,
  color: 'white',
  cursor: 'pointer',
  transition: 'border-color 0.2s, background-color 0.2s',
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }


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
        <div
          style={{
            position: 'absolute',
            right: '30%',
            bottom: '30%',
            height: '384px',
            width: '384px',
            borderRadius: '50%',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
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
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#94A3B8' }}>
            Welcome back — sign in to your account
          </p>
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
          {/* OAuth buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              style={oauthBtnStyle}
              id="login-github"
            >
              <Github style={{ height: '20px', width: '20px' }} />
              Continue with GitHub
            </button>
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              style={oauthBtnStyle}
              id="login-google"
            >
              <svg style={{ height: '20px', width: '20px' }} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ height: '1px', flex: 1, backgroundColor: '#1E293B' }} />
            <span style={{ fontSize: '12px', color: '#64748B' }}>or continue with email</span>
            <div style={{ height: '1px', flex: 1, backgroundColor: '#1E293B' }} />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#F87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="email" style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={iconStyle} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="password" style={labelStyle}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: '#818CF8', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyleNoIcon}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff style={{ height: '16px', width: '16px' }} /> : <Eye style={{ height: '16px', width: '16px' }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'box-shadow 0.2s, opacity 0.2s',
              }}
            >
              {loading ? (
                <Loader2 style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  Sign In
                  <ArrowRight style={{ height: '16px', width: '16px' }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#94A3B8' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ fontWeight: 500, color: '#818CF8', textDecoration: 'none' }}>
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
