'use client';
import { Rocket, ArrowRight, Server, GitBranch, Shield, Users } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const steps = [
  { id: 1, title: 'Connect Infrastructure', desc: 'Add your first server or cloud provider', icon: Server, color: '#10B981' },
  { id: 2, title: 'Setup Repository', desc: 'Link a Git repository for deployments', icon: GitBranch, color: '#3B82F6' },
  { id: 3, title: 'Configure Security', desc: 'Enable 2FA and set access controls', icon: Shield, color: '#F59E0B' },
  { id: 4, title: 'Invite Team', desc: 'Add team members and assign roles', icon: Users, color: '#A78BFA' },
  { id: 5, title: 'First Deployment', desc: 'Deploy your application to production', icon: Rocket, color: '#EF4444' },
];

export default function OnboardingPage() {
  useAutoLoadToken();

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Welcome to Cortexo 🚀</h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '6px' }}>Complete these steps to get your platform ready</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', cursor: 'pointer', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: `${s.color}12`, flexShrink: 0 }}>
                <Icon style={{ width: '20px', height: '20px', color: s.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{s.title}</h3>
                <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>{s.desc}</p>
              </div>
              <ArrowRight style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
