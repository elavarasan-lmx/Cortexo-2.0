'use client';

import { useState } from 'react';
import { X, Bug, Save, Loader2 } from 'lucide-react';

interface EditBugFormProps {
  bug?: { id: number; title: string; priority: string; assignee: string; description: string; status: string };
  onSave: (data: any) => void;
  onClose: () => void;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};

export default function EditBugForm({ bug, onSave, onClose }: EditBugFormProps) {
  const [title, setTitle] = useState(bug?.title || '');
  const [priority, setPriority] = useState(bug?.priority || 'medium');
  const [assignee, setAssignee] = useState(bug?.assignee || '');
  const [description, setDescription] = useState(bug?.description || '');
  const [status, setStatus] = useState(bug?.status || 'open');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSave({ title, priority, assignee, description, status });
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
        width: '540px', maxWidth: '90vw', borderRadius: '18px',
        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)', overflow: 'hidden',
        animation: 'slideUp 200ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(var(--border),0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug style={{ width: '16px', height: '16px', color: '#EF4444' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
              {bug ? `Edit Bug #${bug.id}` : 'Report Bug'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bug title..." style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Assignee</label>
            <input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="developer@team.com" style={inp} />
          </div>

          <div>
            <label style={lbl}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the bug..." rows={4} style={{ ...inp, minHeight: '80px', resize: 'vertical' as const }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '16px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px',
          borderTop: '1px solid rgba(var(--border),0.15)',
        }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || !title} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            color: '#fff', backgroundColor: '#EF4444', border: 'none', cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !title ? 0.6 : 1, boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          }}>
            {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            {bug ? 'Update Bug' : 'Create Bug'}
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
