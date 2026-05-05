'use client';

import { useState } from 'react';
import { Building2, Save, Users, FolderGit2, Globe, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = { backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '24px' };
const label: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'rgb(var(--text-muted))', marginBottom: '6px' };
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))', color: 'rgb(var(--text-primary))', outline: 'none' };

export default function OrganizationPage() {
  useAutoLoadToken();
  const [org, setOrg] = useState({ name: 'LogiMax India', slug: 'logimax', website: 'https://logimaxindia.com', industry: 'Fintech / Bullion Trading' });
  const [saved, setSaved] = useState(false);
  const { data: users } = useApiData(() => api.getUsers(), { default: [] as any[] });
  const { data: configs } = useApiData(() => api.getWinbullConfigs(), { default: [] as any[] });
  const { data: projects } = useApiData(() => api.getProjects(), { default: [] as any[] });
  const memberCount = (users || []).length || 0;
  const clientCount = (configs || []).length || 0;
  const projectCount = (projects || []).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Organization Settings</h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>Manage your organization details and preferences</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Plan', value: 'Pro', color: '#6366F1', icon: <Shield style={{ width: 16, height: 16 }} /> },
          { label: 'Members', value: String(memberCount), color: '#10B981', icon: <Users style={{ width: 16, height: 16 }} /> },
          { label: 'Projects', value: String(projectCount), color: '#F59E0B', icon: <FolderGit2 style={{ width: 16, height: 16 }} /> },
          { label: 'Clients', value: String(clientCount), color: '#E01E5A', icon: <Building2 style={{ width: 16, height: 16 }} /> },
        ].map(s => (
          <div key={s.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'rgb(var(--text-muted))' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div style={card}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 20px' }}>Organization Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div><label style={label}>Organization Name</label><input type="text" value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} style={input} /></div>
          <div><label style={label}>Slug</label><input type="text" value={org.slug} onChange={e => setOrg({ ...org, slug: e.target.value })} style={{ ...input, fontFamily: "'JetBrains Mono', monospace" }} /></div>
          <div><label style={label}>Website</label><input type="url" value={org.website} onChange={e => setOrg({ ...org, website: e.target.value })} style={input} /></div>
          <div><label style={label}>Industry</label><input type="text" value={org.industry} onChange={e => setOrg({ ...org, industry: e.target.value })} style={input} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: saved ? '#10B981' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 14px rgba(var(--primary), 0.3)', transition: 'all 200ms' }}>
          <Save style={{ width: 15, height: 15 }} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
