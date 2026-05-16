'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Building2, Globe, Type, Clock, Calendar, Download, Upload, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useToastStore } from '@/lib/toast-store';
import { PLATFORM_DEFAULTS } from '@/lib/platform-config';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'UTC', label: 'UTC' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (05/15/2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/05/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-05-15)' },
  { value: 'MMMM D, YYYY', label: 'MMMM D, YYYY (May 15, 2026)' },
];

interface SettingsData {
  platformName: string;
  shortName: string;
  tagline: string;
  timezone: string;
  dateFormat: string;
  logoUrl?: string;
}

function getDefaultSettings(): SettingsData {
  return {
    platformName: PLATFORM_DEFAULTS.name,
    shortName: PLATFORM_DEFAULTS.shortName,
    tagline: PLATFORM_DEFAULTS.tagline,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    dateFormat: 'MM/DD/YYYY',
  };
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(getDefaultSettings());
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getCredentials();
        const creds = (res.data as { credentials?: Record<string, string> } | null)?.credentials || {};
        setSettings({
          platformName: creds.PLATFORM_NAME || PLATFORM_DEFAULTS.name,
          shortName: creds.PLATFORM_SHORT_NAME || PLATFORM_DEFAULTS.shortName,
          tagline: creds.PLATFORM_TAGLINE || PLATFORM_DEFAULTS.tagline,
          timezone: creds.PLATFORM_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          dateFormat: creds.PLATFORM_DATE_FORMAT || 'MM/DD/YYYY',
          logoUrl: creds.PLATFORM_LOGO || '',
        });
      } catch {
        // Use defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.setCredential('PLATFORM_NAME', settings.platformName);
      await api.setCredential('PLATFORM_SHORT_NAME', settings.shortName);
      await api.setCredential('PLATFORM_TAGLINE', settings.tagline);
      await api.setCredential('PLATFORM_TIMEZONE', settings.timezone);
      await api.setCredential('PLATFORM_DATE_FORMAT', settings.dateFormat);
      useToastStore.getState().success('Settings Saved', 'Your settings have been updated.');
    } catch (err: unknown) {
      useToastStore.getState().error('Save Failed', err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: {
          platformName: settings.platformName,
          shortName: settings.shortName,
          tagline: settings.tagline,
          timezone: settings.timezone,
          dateFormat: settings.dateFormat,
        },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      useToastStore.getState().success('Export Complete', 'Settings exported to JSON file.');
    } catch {
      useToastStore.getState().error('Export Failed', 'Could not export settings.');
    } finally {
      setExporting(false);
    }
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.settings) {
          setSettings(prev => ({
            ...prev,
            platformName: imported.settings.platformName || prev.platformName,
            shortName: imported.settings.shortName || prev.shortName,
            tagline: imported.settings.tagline || prev.tagline,
            timezone: imported.settings.timezone || prev.timezone,
            dateFormat: imported.settings.dateFormat || prev.dateFormat,
          }));
          useToastStore.getState().success('Import Complete', 'Settings imported from file.');
        }
      } catch {
        useToastStore.getState().error('Import Failed', 'Invalid settings file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function handleReset() {
    setSettings(getDefaultSettings());
    useToastStore.getState().info('Reset Complete', 'Settings reset to defaults.');
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

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgb(var(--text-muted))' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
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
      {/* Platform Branding */}
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

      {/* Branding Form */}
      <div className="cx-card cx-border" style={{ padding: '24px' }}>
        <div className="cx-flex-col" style={{ gap: '20px' }}>
          <div>
            <label style={labelStyle}>
              <Type style={{ width: '14px', height: '14px' }} />
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              placeholder="Logimax Bullion DevOps"
              style={inputStyle}
            />
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Full display name used in the sidebar logo and email headers.
            </p>
          </div>

          <div>
            <label style={labelStyle}>
              <Globe style={{ width: '14px', height: '14px' }} />
              Short Name
            </label>
            <input
              type="text"
              value={settings.shortName}
              onChange={(e) => setSettings({ ...settings, shortName: e.target.value })}
              placeholder="LB DevOps"
              style={inputStyle}
            />
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Abbreviated name for compact UI areas and browser tab titles.
            </p>
          </div>

          <div>
            <label style={labelStyle}>
              <Building2 style={{ width: '14px', height: '14px' }} />
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              placeholder="Internal Developer Platform"
              style={inputStyle}
            />
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Shown below the platform name in the sidebar and landing pages.
            </p>
          </div>
        </div>
      </div>

      {/* Localization Settings */}
      <div className="cx-card cx-border" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Clock style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Localization
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <label style={labelStyle}>
              <Globe style={{ width: '14px', height: '14px' }} />
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              style={selectStyle}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Used for displaying dates and times across the platform.
            </p>
          </div>

          <div>
            <label style={labelStyle}>
              <Calendar style={{ width: '14px', height: '14px' }} />
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              style={selectStyle}
            >
              {DATE_FORMATS.map(df => (
                <option key={df.value} value={df.value}>{df.label}</option>
              ))}
            </select>
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              How dates are displayed throughout the application.
            </p>
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="cx-card cx-border" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Download style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            Backup & Restore
          </h2>
        </div>
        <div className="cx-flex cx-gap-12" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="cx-btn-primary cx-flex cx-items-center cx-gap-8"
            style={{ padding: '10px 18px', fontSize: '13px', opacity: exporting ? 0.6 : 1 }}
          >
            <Download style={{ width: '14px', height: '14px' }} />
            {exporting ? 'Exporting...' : 'Export Settings'}
          </button>
          <label
            className="cx-flex cx-items-center cx-gap-8 cx-btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px', cursor: 'pointer' }}
          >
            <Upload style={{ width: '14px', height: '14px' }} />
            Import Settings
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button
            onClick={handleReset}
            className="cx-flex cx-items-center cx-gap-8"
            style={{
              padding: '10px 18px', fontSize: '13px',
              backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444',
              border: 'none', borderRadius: '10px', cursor: 'pointer'
            }}
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} />
            Reset to Defaults
          </button>
        </div>
        <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '12px' }}>
          Export your settings to a JSON file for backup or import them to another instance.
        </p>
      </div>

      {/* Preview */}
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
          <img
            src="/logo.png"
            alt={settings.platformName}
            style={{ height: '36px', objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>
              {settings.platformName}
            </div>
            <div style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {settings.tagline}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="cx-flex" style={{ justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="cx-btn-primary cx-flex cx-items-center cx-gap-8"
          style={{
            padding: '10px 24px',
            fontSize: '13px',
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}