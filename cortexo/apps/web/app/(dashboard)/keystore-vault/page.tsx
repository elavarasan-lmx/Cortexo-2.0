'use client';

import { useState } from 'react';
import {
  Key, Shield, Copy, Eye, EyeOff, Search, Plus, Download,
  CheckCircle, AlertTriangle, Trash2, Edit3, Save, X, Lock,
} from 'lucide-react';

interface KeystoreEntry {
  id: string;
  clientName: string;
  keystoreFile: string;
  alias: string;
  storePassword: string;
  keyPassword: string;
  sha1: string;
  sha256: string;
  location: string;
  organization: string;
  validUntil: string;
  package: string;
  type: 'flutter' | 'ionic';
  createdAt: string;
}

const initialKeystores: KeystoreEntry[] = [
  { id: '1', clientName: 'MNT Traders', keystoreFile: 'mnttraders.keystore', alias: 'mnttraders', storePassword: 'logimax', keyPassword: 'logimax', sha1: '9E:6F:37:C1:A2:E8:1D:A6:48:3C:AD:DF:A9:59:1E:AB:EA:FA:DB:FB', sha256: '1E:98:E0:FA:8A:CB:F6:17:C9:61:55:B6:30:39:C0:8B', location: 'Salem', organization: 'logimax', validUntil: '2053-09-24', package: 'com.lmx.mnt', type: 'flutter', createdAt: '2026-05-09' },
  { id: '2', clientName: 'Trust Bullion', keystoreFile: 'trustbullion.keystore', alias: 'trustbullion', storePassword: 'logimax', keyPassword: 'logimax', sha1: 'FE:0B:FD:5F:05:6C:DE:F6:FE:21:A8:4B:0A:86:C5:34:C5:08:B7:76', sha256: '39:AB:79:DF:40:01:E8:53:F9:73:DA:74:B5:B5:FF:9A', location: 'Singapore', organization: 'Trust Bullion', validUntil: '2049-06-22', package: 'trustbullion.bullion.price', type: 'ionic', createdAt: '2022-02-04' },
  { id: '3', clientName: 'Maharaja Bullion', keystoreFile: 'maharajabullion.keystore', alias: 'maharajabullion', storePassword: 'logimax', keyPassword: 'logimax', sha1: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12', sha256: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90', location: 'Coimbatore', organization: 'logimax', validUntil: '2052-01-15', package: 'com.lmx.maharajabulliondealers', type: 'ionic', createdAt: '2023-01-15' },
  { id: '4', clientName: 'Alfa Gold', keystoreFile: 'alfagold.keystore', alias: 'alfagold', storePassword: 'logimax', keyPassword: 'logimax', sha1: '11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD:EE:FF:11:22:33:44', sha256: '11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD:EE:FF', location: 'Chennai', organization: 'logimax', validUntil: '2051-08-20', package: 'com.lmx.alfagold', type: 'ionic', createdAt: '2022-08-20' },
  { id: '5', clientName: 'KTS Silvers', keystoreFile: 'ktssilvers.keystore', alias: 'ktssilvers', storePassword: 'logimax', keyPassword: 'logimax', sha1: 'AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD', sha256: 'AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00', location: 'Salem', organization: 'logimax', validUntil: '2050-03-10', package: 'com.lmx.ktssilvers', type: 'ionic', createdAt: '2021-03-10' },
  { id: '6', clientName: 'Ruby Precious', keystoreFile: 'rubyprecious.keystore', alias: 'rubyprecious', storePassword: 'logimax', keyPassword: 'logimax', sha1: 'DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00', sha256: 'DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC', location: 'Coimbatore', organization: 'logimax', validUntil: '2054-11-05', package: 'com.lmx.rubyprecious', type: 'ionic', createdAt: '2024-11-05' },
];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function KeystoreVaultPage() {
  const [keystores] = useState<KeystoreEntry[]>(initialKeystores);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filtered = keystores.filter(k =>
    k.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.package.includes(searchQuery.toLowerCase()) ||
    k.alias.includes(searchQuery.toLowerCase())
  );

  const togglePassword = (id: string) => {
    const next = new Set(showPasswords);
    next.has(id) ? next.delete(id) : next.add(id);
    setShowPasswords(next);
  };

  const handleCopy = (text: string, fieldId: string) => {
    copyToClipboard(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isExpiring = (date: string) => {
    const expiry = new Date(date);
    const now = new Date();
    const diffYears = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return diffYears < 3;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            Keystore Vault
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Shield style={{ width: '12px', height: '12px', color: '#10B981' }} />
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#10B981', fontFamily: 'Inter, sans-serif' }}>
              {keystores.length} Keystores Secured
            </span>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: 'rgb(var(--primary))', fontFamily: 'Inter, sans-serif' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Add Keystore
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Keystores', value: keystores.length, color: '#8B5CF6', icon: Key },
          { label: 'Valid', value: keystores.filter(k => !isExpiring(k.validUntil)).length, color: '#10B981', icon: CheckCircle },
          { label: 'Expiring Soon', value: keystores.filter(k => isExpiring(k.validUntil)).length, color: '#F59E0B', icon: AlertTriangle },
          { label: 'Unique Passwords', value: new Set(keystores.map(k => k.storePassword)).size, color: '#3B82F6', icon: Lock },
        ].map((stat, i) => (
          <div key={i} style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '18px', border: '1px solid rgb(var(--border))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>{stat.label}</p>
              <stat.icon style={{ width: '16px', height: '16px', color: stat.color }} />
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', marginBottom: '16px', maxWidth: '360px' }}>
        <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
        <input type="text" placeholder="Search by client, package, or alias..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: 'rgb(var(--text-primary))', width: '100%' }} />
      </div>

      {/* Keystore Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(ks => {
          const expanded = expandedId === ks.id;
          const pwVisible = showPasswords.has(ks.id);
          return (
            <div key={ks.id} style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', overflow: 'hidden', transition: 'box-shadow 200ms' }}>
              {/* Card Header */}
              <div onClick={() => setExpandedId(expanded ? null : ks.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Key style={{ width: '18px', height: '18px', color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', fontFamily: 'Inter, sans-serif' }}>{ks.clientName}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, backgroundColor: ks.type === 'flutter' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', color: ks.type === 'flutter' ? '#3B82F6' : '#F59E0B' }}>
                        {ks.type.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: 'JetBrains Mono, monospace' }}>{ks.package}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>Valid until {ks.validUntil}</span>
                  <span style={{ fontSize: '16px', transition: 'transform 200ms', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded && (
                <div style={{ borderTop: '1px solid rgb(var(--border))', padding: '20px', backgroundColor: 'rgba(var(--text-muted), 0.02)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {/* Column 1 - File Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>File Info</p>
                      {[
                        { label: 'Keystore', value: ks.keystoreFile },
                        { label: 'Alias', value: ks.alias },
                        { label: 'Location', value: ks.location },
                        { label: 'Organization', value: ks.organization },
                      ].map(field => (
                        <div key={field.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', fontFamily: 'Inter, sans-serif' }}>{field.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-primary))', fontFamily: 'JetBrains Mono, monospace' }}>{field.value}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleCopy(field.value, `${ks.id}-${field.label}`); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', color: copiedField === `${ks.id}-${field.label}` ? '#10B981' : 'rgb(var(--text-muted))' }}>
                              {copiedField === `${ks.id}-${field.label}` ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Column 2 - Passwords */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Credentials</p>
                        <button onClick={() => togglePassword(ks.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
                          {pwVisible ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
                          {pwVisible ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {[
                        { label: 'Store Pass', value: ks.storePassword },
                        { label: 'Key Pass', value: ks.keyPassword },
                      ].map(field => (
                        <div key={field.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{field.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-primary))', fontFamily: 'JetBrains Mono, monospace' }}>
                              {pwVisible ? field.value : '••••••••'}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); handleCopy(field.value, `${ks.id}-${field.label}`); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', color: copiedField === `${ks.id}-${field.label}` ? '#10B981' : 'rgb(var(--text-muted))' }}>
                              {copiedField === `${ks.id}-${field.label}` ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: '4px', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                        <span style={{ fontSize: '10px', color: '#8B5CF6', fontFamily: 'Inter, sans-serif' }}>🔒 Passwords encrypted at rest</span>
                      </div>
                    </div>

                    {/* Column 3 - Fingerprints */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fingerprints</p>
                      {[
                        { label: 'SHA-1', value: ks.sha1 },
                        { label: 'SHA-256', value: ks.sha256 },
                      ].map(field => (
                        <div key={field.label}>
                          <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', display: 'block', marginBottom: '4px' }}>{field.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <code style={{ fontSize: '10px', color: 'rgb(var(--text-secondary))', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', lineHeight: 1.4 }}>{field.value}</code>
                            <button onClick={(e) => { e.stopPropagation(); handleCopy(field.value, `${ks.id}-${field.label}`); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, color: copiedField === `${ks.id}-${field.label}` ? '#10B981' : 'rgb(var(--text-muted))' }}>
                              {copiedField === `${ks.id}-${field.label}` ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* keytool command */}
                  <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#0d1117', border: '1px solid #21262d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'Inter, sans-serif' }}>Verify Command</span>
                      <button onClick={(e) => { e.stopPropagation(); handleCopy(`keytool -list -v -keystore ${ks.keystoreFile} -storepass ${ks.storePassword} -alias ${ks.alias}`, `${ks.id}-cmd`); }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: copiedField === `${ks.id}-cmd` ? '#3fb950' : '#8b949e', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {copiedField === `${ks.id}-cmd` ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <code style={{ fontSize: '11px', color: '#c9d1d9', fontFamily: '"JetBrains Mono", monospace' }}>
                      keytool -list -v -keystore {ks.keystoreFile} -storepass {pwVisible ? ks.storePassword : '****'} -alias {ks.alias}
                    </code>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
