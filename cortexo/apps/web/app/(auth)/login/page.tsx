'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, Rocket, Bot, BarChart3 } from 'lucide-react';

/* ── Design 34_Login.png ──────────────────────────────────────────────
 * Split-screen layout:
 *   LEFT  → Dark navy (#1a1a3e) panel with Cortexo branding
 *   RIGHT → White panel with "Welcome Back" form
 * ──────────────────────────────────────────────────────────────────── */

const BRAND_BG   = '#1a1a3e';
const BRAND_PURPLE = '#7c5cfc';
const INPUT_BG   = '#f3f1f9';
const TEXT_MUTED  = '#8b8b9e';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);

  async function handleOAuth(provider: 'github' | 'google') {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setOauthLoading(null);
    }
  }

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* ── LEFT PANEL: Branding ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BRAND_BG,
        color: 'white',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(124,92,252,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '380px' }}>
          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <img
              src="/logo.png"
              alt="Logimax Bullion"
              style={{
                height: '52px',
                objectFit: 'contain',
              }}
            />
          </div>

          <p style={{
            fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
          }}>
            DevOps Platform
          </p>
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7, marginBottom: '32px',
          }}>
            Trusted by 70+ client environments.<br />
            Manage deployments, servers, and AI agents — all in one place.
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '36px' }}>
            {[
              { Icon: Rocket, title: 'One-Click Deployments', desc: 'Deploy to production in seconds' },
              { Icon: Bot, title: 'AI-Powered Bug Detection', desc: 'Catch issues before users do' },
              { Icon: BarChart3, title: 'Real-time Monitoring', desc: 'Live dashboards with alert automations' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <f.Icon style={{ width: '18px', height: '18px', marginTop: '2px', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{f.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '2.4K+', label: 'Deployments' },
              { value: '12', label: 'AI Agents' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: '48px',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: 700, color: '#1a1a2e',
            marginBottom: '8px', textAlign: 'center',
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: '14px', color: TEXT_MUTED,
            marginBottom: '32px', textAlign: 'center',
          }}>
            Sign in to your account
          </p>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '16px', borderRadius: '10px',
              border: '1px solid rgba(239,68,68,0.2)',
              backgroundColor: 'rgba(239,68,68,0.06)',
              padding: '12px 16px', fontSize: '13px', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: 'block', marginBottom: '8px',
                fontSize: '14px', fontWeight: 600, color: '#1a1a2e',
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@logimaxindia.com"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  borderRadius: '10px', border: 'none',
                  backgroundColor: INPUT_BG,
                  fontSize: '14px', color: '#1a1a2e',
                  outline: 'none',
                  transition: 'box-shadow 0.2s',
                }}
                onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${BRAND_PURPLE}40`}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{
                display: 'block', marginBottom: '8px',
                fontSize: '14px', fontWeight: 600, color: '#1a1a2e',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '14px 44px 14px 16px',
                    borderRadius: '10px', border: 'none',
                    backgroundColor: INPUT_BG,
                    fontSize: '14px', color: '#1a1a2e',
                    outline: 'none',
                    transition: 'box-shadow 0.2s',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${BRAND_PURPLE}40`}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: TEXT_MUTED, padding: 0,
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ height: '16px', width: '16px' }} />
                    : <Eye style={{ height: '16px', width: '16px' }} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: TEXT_MUTED, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: BRAND_PURPLE, width: '16px', height: '16px' }} />
                Remember me
              </label>
              <Link href="/forgot-password" style={{
                fontSize: '13px', color: BRAND_PURPLE,
                textDecoration: 'none', fontWeight: 600,
              }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              style={{
                width: '100%', padding: '14px',
                borderRadius: '12px', border: 'none',
                background: `linear-gradient(135deg, ${BRAND_PURPLE}, #a855f7)`,
                fontSize: '15px', fontWeight: 600,
                color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.2s, transform 0.1s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? (
                <Loader2 style={{ height: '18px', width: '18px', animation: 'spin 1s linear infinite' }} />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Social login */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading || loading}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                border: '1px solid #e5e7eb', backgroundColor: '#fff',
                fontSize: '13px', fontWeight: 600, color: '#1a1a2e',
                cursor: (oauthLoading || loading) ? 'not-allowed' : 'pointer',
                opacity: (oauthLoading === 'google' || loading) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 0.2s, background-color 0.2s',
              }}
            >
              {oauthLoading === 'github' ? (
                <Loader2 style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="#24292e"/></svg>
              )}
              GitHub
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || loading}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                border: '1px solid #e5e7eb', backgroundColor: '#fff',
                fontSize: '13px', fontWeight: 600, color: '#1a1a2e',
                cursor: (oauthLoading || loading) ? 'not-allowed' : 'pointer',
                opacity: (oauthLoading === 'github' || loading) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 0.2s, background-color 0.2s',
              }}
            >
              {oauthLoading === 'google' ? (
                <Loader2 style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              )}
              Google
            </button>
          </div>

          {/* Register + Terms */}
          <p style={{
            marginTop: '28px', textAlign: 'center',
            fontSize: '14px', color: TEXT_MUTED,
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{
              fontWeight: 600, color: BRAND_PURPLE, textDecoration: 'none',
            }}>
              Request Access
            </Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#c0c0c0', marginTop: '8px' }}>
            By signing in, you agree to our <a href="#" style={{ color: TEXT_MUTED, textDecoration: 'underline' }}>Terms of Service</a>
          </p>
        </div>
      </div>

      {/* Responsive: hide left panel on mobile */}
      <style>{`
        @media (max-width: 768px) {
          div:first-child > div:first-child { display: none !important; }
          div:first-child > div:last-child { flex: unset !important; width: 100% !important; }
        }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
