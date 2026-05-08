'use client';

import { useState } from 'react';
import { Mail, Plus, Edit3, Trash2, Clock, Search } from 'lucide-react';

export default function EmailTemplatesPage() {
  const [search, setSearch] = useState('');

  const templates = [
    { id: 1, name: 'Password Reset', subject: 'Reset your password', description: 'Triggered when user requests password reset', lastEdited: '2 days ago', status: 'Active' },
    { id: 2, name: 'Welcome Email', subject: 'Welcome to the platform', description: 'Sent to new users upon registration', lastEdited: '1 week ago', status: 'Active' },
    { id: 3, name: 'Deploy Notification', subject: 'Deployment Status: {{status}}', description: 'Sent to team on deploy success/failure', lastEdited: '3 weeks ago', status: 'Draft' },
    { id: 4, name: 'Invoice Receipt', subject: 'Your invoice from {{company_name}}', description: 'Sent to customers after successful payment', lastEdited: '1 month ago', status: 'Active' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Email Templates</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Manage transaction and marketing email templates.
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
          <Plus style={{ width: '16px', height: '16px' }} /> New Template
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
          <Search style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search templates..." 
            style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '14px', color: 'rgb(var(--text-primary))' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {templates.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{t.name}</h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: t.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: t.status === 'Active' ? '#10B981' : '#F59E0B' }}>
                    {t.status}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: '0 0 4px 0' }}>{t.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--primary))' }}>Subject: {t.subject}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                <Clock style={{ width: '14px', height: '14px' }} />
                {t.lastEdited}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-secondary))', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                  <Edit3 style={{ width: '16px', height: '16px' }} />
                </button>
                <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.05)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
