'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

/* ── Design 34_Login.png ──────────────────────────────────────────────
 * Split-screen layout:
 *   LEFT  → Dark navy (#1a1a3e) panel with ◉ Cortexo branding
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
            gap: '14px', marginBottom: '20px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                backgroundColor: 'white',
              }} />
            </div>
            <span style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px' }}>Cortexo</span>
          </div>

          <p style={{
            fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
          }}>
            Internal Developer Platform
          </p>
          <p style={{
            fontSize: '14px', color: 'rgba(124,92,252,0.8)',
            lineHeight: 1.6,
          }}>
            Manage deployments, servers, and AI agents<br />
            across 70+ client environments.
          </p>
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
                placeholder="jerry@cortexo.dev"
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

          {/* Forgot password link */}
          <div style={{ marginTop: '16px', textAlign: 'left' }}>
            <Link href="/forgot-password" style={{
              fontSize: '13px', color: BRAND_PURPLE,
              textDecoration: 'none', fontWeight: 500,
            }}>
              Forgot password?
            </Link>
          </div>

          {/* Register link */}
          <p style={{
            marginTop: '32px', textAlign: 'center',
            fontSize: '14px', color: TEXT_MUTED,
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{
              fontWeight: 600, color: BRAND_PURPLE, textDecoration: 'none',
            }}>
              Sign up
            </Link>
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
