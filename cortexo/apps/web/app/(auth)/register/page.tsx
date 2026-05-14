'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

/* ── Design 35_Register.png ──────────────────────────────────────────
 * Split-screen layout:
 *   LEFT  → Dark navy (#1a1a3e) panel with "Join the DevOps Revolution"
 *   RIGHT → White panel with registration form
 * ──────────────────────────────────────────────────────────────────── */

const BRAND_BG     = '#1a1a3e';
const BRAND_PURPLE = '#7c5cfc';
const INPUT_BG     = '#f3f1f9';
const TEXT_MUTED   = '#8b8b9e';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        orgName: orgName.trim() || undefined,
      });
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
            marginBottom: '24px',
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

          <h2 style={{
            fontSize: '22px', fontWeight: 600,
            marginBottom: '12px', lineHeight: 1.3,
          }}>
            Join the DevOps Revolution
          </h2>
          <p style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
          }}>
            Automate deployments, monitor infrastructure,<br />
            and collaborate with AI-powered agents.
          </p>

          {/* Feature bullets */}
          <div style={{
            marginTop: '32px', textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            {['70+ client environments', 'AI-powered automation', 'Real-time monitoring'].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: BRAND_PURPLE, flexShrink: 0,
                }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{text}</span>
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
            Create Account
          </h1>
          <p style={{
            fontSize: '14px', color: TEXT_MUTED,
            marginBottom: '32px', textAlign: 'center',
          }}>
            Start deploying smarter today
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Name + Org row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="name" style={{
                  display: 'block', marginBottom: '8px',
                  fontSize: '14px', fontWeight: 600, color: '#1a1a2e',
                }}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jerry"
                  required
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: '10px', border: 'none',
                    backgroundColor: INPUT_BG,
                    fontSize: '14px', color: '#1a1a2e',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${BRAND_PURPLE}40`}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
              <div>
                <label htmlFor="org" style={{
                  display: 'block', marginBottom: '8px',
                  fontSize: '14px', fontWeight: 600, color: '#1a1a2e',
                }}>
                  Organization
                </label>
                <input
                  id="org"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="My Company"
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: '10px', border: 'none',
                    backgroundColor: INPUT_BG,
                    fontSize: '14px', color: '#1a1a2e',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${BRAND_PURPLE}40`}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: 'block', marginBottom: '8px',
                fontSize: '14px', fontWeight: 600, color: '#1a1a2e',
              }}>
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@logimaxindia.com"
                required
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: '10px', border: 'none',
                  backgroundColor: INPUT_BG,
                  fontSize: '14px', color: '#1a1a2e',
                  outline: 'none',
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
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px',
                    borderRadius: '10px', border: 'none',
                    backgroundColor: INPUT_BG,
                    fontSize: '14px', color: '#1a1a2e',
                    outline: 'none',
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
              id="register-submit"
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
                'Create Account →'
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: TEXT_MUTED }}>
              By signing up, you agree to our{' '}
              <a href="#" style={{ color: BRAND_PURPLE, textDecoration: 'none' }}>Terms</a>
              {' '}and{' '}
              <a href="#" style={{ color: BRAND_PURPLE, textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          </form>

          {/* Login link */}
          <p style={{
            marginTop: '28px', textAlign: 'center',
            fontSize: '14px', color: TEXT_MUTED,
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{
              fontWeight: 600, color: BRAND_PURPLE, textDecoration: 'none',
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Responsive */}
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
