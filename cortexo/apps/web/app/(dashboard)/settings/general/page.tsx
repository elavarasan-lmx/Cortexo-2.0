'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Building2, Globe, Type } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/lib/toast-store';
import { PLATFORM_DEFAULTS } from '@/lib/platform-config';

/**
 * Settings → General
 *
 * Manages the dynamic platform name that appears across the entire UI.
 * Values are persisted via the Credentials Vault API under "PLATFORM_*" keys.
 * On first load, defaults come from `platform-config.ts`.
 */
export default function GeneralSettingsPage() {

  const [platformName, setPlatformName] = useState<string>(PLATFORM_DEFAULTS.name);
  const [shortName, setShortName] = useState<string>(PLATFORM_DEFAULTS.shortName);
  const [tagline, setTagline] = useState<string>(PLATFORM_DEFAULTS.tagline);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved values from credentials vault
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getCredentials();
        const creds = (res.data as any)?.credentials || {};
        if (creds.PLATFORM_NAME) setPlatformName(creds.PLATFORM_NAME);
        if (creds.PLATFORM_SHORT_NAME) setShortName(creds.PLATFORM_SHORT_NAME);
        if (creds.PLATFORM_TAGLINE) setTagline(creds.PLATFORM_TAGLINE);
      } catch {
        // First load — just use defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.setCredential('PLATFORM_NAME', platformName);
      await api.setCredential('PLATFORM_SHORT_NAME', shortName);
      await api.setCredential('PLATFORM_TAGLINE', tagline);
      useToastStore.getState().success('Branding Saved', 'Platform name updated across the application.');
    } catch (err: unknown) {
      useToastStore.getState().error('Save Failed', err instanceof Error ? err.message : 'Could not save branding.');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--surface))',
    color: 'rgb(var(--text-primary))',
    fontSize: '14px',
    fontFamily: 'Inter, system-ui, sans-serif',
    outline: 'none',
    transition: 'border-color 200ms, box-shadow 200ms',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgb(var(--text-secondary))',
    marginBottom: '6px',
  };

  if (!loaded) {
    return (
      <div className="cx-card cx-border" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
        <span className="cx-text-muted" style={{ fontSize: '14px' }}>Loading platform settings…</span>
      </div>
    );
  }

  return (
    <div className="cx-flex-col cx-gap-20">
      {/* Header info */}
      <div className="cx-card cx-border" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Building2 style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Platform Branding
          </h2>
        </div>
        <p className="cx-text-muted" style={{ fontSize: '13px', margin: 0 }}>
          Configure the platform name and tagline that appear across the sidebar, emails, and notifications.
        </p>
      </div>

      {/* Form */}
      <div className="cx-card cx-border" style={{ padding: '24px' }}>
        <div className="cx-flex-col" style={{ gap: '20px' }}>

          {/* Platform Name */}
          <div>
            <label style={labelStyle}>
              <Type style={{ width: '14px', height: '14px' }} />
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Logimax Bullion DevOps"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#7C3AED';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgb(var(--border))';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Full display name used in the sidebar logo and email headers.
            </p>
          </div>

          {/* Short Name */}
          <div>
            <label style={labelStyle}>
              <Globe style={{ width: '14px', height: '14px' }} />
              Short Name
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="LB DevOps"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#7C3AED';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgb(var(--border))';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Abbreviated name for compact UI areas and browser tab titles.
            </p>
          </div>

          {/* Tagline */}
          <div>
            <label style={labelStyle}>
              <Building2 style={{ width: '14px', height: '14px' }} />
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Internal Developer Platform"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#7C3AED';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgb(var(--border))';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Shown below the platform name in the sidebar and landing pages.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="cx-btn-primary cx-fw-600"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              fontSize: '13px',
              borderRadius: '10px',
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save style={{ width: '16px', height: '16px' }} />
            )}
            {saving ? 'Saving…' : 'Save Branding'}
          </button>
        </div>
      </div>

      {/* Preview card */}
      <div className="cx-card cx-border" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: '12px' }}>
          Preview
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
        }}>
          {/* Logo preview */}
          <img
            src="/logo.png"
            alt={platformName}
            style={{
              height: '36px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
              {platformName}
            </div>
            <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {tagline}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
