'use client';

import { useState } from 'react';
import { X, Clock, Save, Loader2, Terminal } from 'lucide-react';

interface AddCronJobFormProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
};
const monoInp: React.CSSProperties = { ...inp, fontFamily: "'JetBrains Mono', monospace" };
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};

const PRESETS = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 min', cron: '*/5 * * * *' },
  { label: 'Hourly', cron: '0 * * * *' },
  { label: 'Daily midnight', cron: '0 0 * * *' },
  { label: 'Weekly Mon', cron: '0 0 * * 1' },
];

export default function AddCronJobForm({ onSave, onClose }: AddCronJobFormProps) {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('0 * * * *');
  const [command, setCommand] = useState('');
  const [server, setServer] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSave({ name, schedule, command, server, enabled });
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 150ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '560px', maxWidth: '90vw', borderRadius: '18px',
        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)', overflow: 'hidden',
        animation: 'slideUp 200ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{
          padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(var(--border),0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '16px', height: '16px', color: '#A855F7' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Add Cron Job</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>Job Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="backup-database" style={inp} />
          </div>

          <div>
            <label style={lbl}>Schedule (Cron Expression)</label>
            <input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="* * * * *" style={monoInp} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {PRESETS.map(p => (
                <button key={p.cron} onClick={() => setSchedule(p.cron)} style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                  border: schedule === p.cron ? '1px solid #A855F7' : '1px solid rgb(var(--border))',
                  backgroundColor: schedule === p.cron ? 'rgba(168,85,247,0.1)' : 'transparent',
                  color: schedule === p.cron ? '#A855F7' : 'rgb(var(--text-muted))',
                  cursor: 'pointer', transition: 'all 150ms',
                }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Command</label>
            <div style={{ position: 'relative' }}>
              <Terminal style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
              <input value={command} onChange={e => setCommand(e.target.value)} placeholder="/usr/bin/pg_dump -U postgres mydb > backup.sql" style={{ ...monoInp, paddingLeft: '34px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'end' }}>
            <div>
              <label style={lbl}>Target Server</label>
              <input value={server} onChange={e => setServer(e.target.value)} placeholder="prod-api-01" style={inp} />
            </div>
            <div>
              <label style={{ ...lbl, marginBottom: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                  <div onClick={() => setEnabled(!enabled)} style={{
                    width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
                    backgroundColor: enabled ? '#A855F7' : 'rgb(var(--surface-hover))',
                    border: enabled ? 'none' : '1px solid rgb(var(--border))',
                    transition: 'all 200ms', position: 'relative',
                  }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff',
                      position: 'absolute', top: '2px', left: enabled ? '18px' : '2px', transition: 'left 200ms',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))' }}>Enabled</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px',
          borderTop: '1px solid rgba(var(--border),0.15)',
        }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !name || !command} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            color: '#fff', backgroundColor: '#A855F7', border: 'none', cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !name || !command ? 0.6 : 1, boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
          }}>
            {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            Create Job
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
