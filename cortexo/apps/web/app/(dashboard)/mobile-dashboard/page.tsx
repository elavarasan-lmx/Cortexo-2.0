'use client';

import { Smartphone, LayoutGrid, CheckCircle2, GripHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function MobileDashboardPage() {
  const [widgets, setWidgets] = useState([
    { id: '1', name: 'Quick Stats', enabled: true },
    { id: '2', name: 'Recent Deployments', enabled: true },
    { id: '3', name: 'Active Alerts', enabled: true },
    { id: '4', name: 'Agent Status', enabled: false },
    { id: '5', name: 'Pipeline Runs', enabled: true },
  ]);

  const toggleWidget = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Mobile Dashboard</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Configure the layout and widgets for the mobile view.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
        
        {/* Left Side: Configuration */}
        <div style={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '14px', border: '1px solid rgb(var(--border))', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <LayoutGrid style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Available Widgets</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {widgets.map(w => (
              <div 
                key={w.id} 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px', borderRadius: '10px', 
                  backgroundColor: w.enabled ? 'rgba(124,58,237,0.05)' : 'rgba(0,0,0,0.02)', 
                  border: `1px solid ${w.enabled ? 'rgba(124,58,237,0.2)' : 'rgb(var(--border))'}`,
                  cursor: 'pointer'
                }}
                onClick={() => toggleWidget(w.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <GripHorizontal style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: w.enabled ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))' }}>
                    {w.name}
                  </span>
                </div>
                {w.enabled ? (
                  <CheckCircle2 style={{ width: '20px', height: '20px', color: 'rgb(var(--primary))' }} />
                ) : (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgb(var(--border))' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Mobile Preview */}
        <div>
          <div style={{ position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone style={{ width: '16px', height: '16px' }} /> Live Preview
            </h3>
            
            <div style={{ width: '280px', height: '580px', backgroundColor: '#F8FAFC', borderRadius: '40px', border: '8px solid #1E293B', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative' }}>
              {/* Notch */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '24px', backgroundColor: '#1E293B', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', zIndex: 10 }} />
              
              <div style={{ padding: '48px 16px 20px', height: '100%', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B', margin: '0 0 20px 0' }}>Dashboard</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {widgets.filter(w => w.enabled).map((w, index) => (
                    <div key={index} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: '60%', height: '12px', backgroundColor: '#E2E8F0', borderRadius: '6px', marginBottom: '12px' }} />
                      <div style={{ width: '100%', height: '60px', backgroundColor: '#F1F5F9', borderRadius: '8px' }} />
                    </div>
                  ))}
                  {widgets.filter(w => w.enabled).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: '13px' }}>
                      No widgets selected. Enable widgets to see them here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
