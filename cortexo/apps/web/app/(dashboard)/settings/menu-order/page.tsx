'use client';

import { useState, useCallback } from 'react';
import { GripVertical, Save, Info, Eye, EyeOff, RotateCcw, Loader2 } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

const card: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))', overflow: 'hidden',
};

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

const DEFAULT_ITEMS: MenuItem[] = [
  { id: 'dashboard',   label: 'Dashboard',    icon: '◉',  visible: true },
  { id: 'projects',    label: 'Projects',     icon: '📁', visible: true },
  { id: 'deployments', label: 'Deployments',  icon: '🚀', visible: true },
  { id: 'clients',     label: 'Clients',      icon: '👥', visible: true },
  { id: 'heartbeat',   label: 'Heartbeat',    icon: '💓', visible: true },
  { id: 'logs',        label: 'Logs',         icon: '📋', visible: true },
  { id: 'error_tracker',label:'Error Tracker', icon: '🐛', visible: true },
  { id: 'bug_tracker', label: 'Bug Tracker',  icon: '🔍', visible: true },
  { id: 'servers',     label: 'Servers',      icon: '🖥️', visible: true },
  { id: 'cron_jobs',   label: 'Cron Jobs',    icon: '⏰', visible: true },
  { id: 'ai_agents',   label: 'AI Agents',    icon: '🤖', visible: true },
  { id: 'scaffolding', label: 'Scaffolding',  icon: '🏗️', visible: true },
  { id: 'auto_sync',   label: 'Auto Sync',    icon: '🔄', visible: true },
  { id: 'daily_stats', label: 'Daily Stats',  icon: '📊', visible: true },
  { id: 'api_keys',    label: 'API Keys',     icon: '🔑', visible: true },
  { id: 'audit_log',   label: 'Audit Log',    icon: '📜', visible: true },
  { id: 'testing',     label: 'Testing',      icon: '🧪', visible: false },
];

export default function MenuOrderPage() {
  useAutoLoadToken();
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleVisibility = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
    setSaved(false);
  };

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOver(id);
  };
  const handleDrop = (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    setItems(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(i => i.id === dragging);
      const toIdx = arr.findIndex(i => i.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    setDragging(null);
    setDragOver(null);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetOrder = () => {
    setItems(DEFAULT_ITEMS);
    setSaved(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GripVertical style={{ width: '24px', height: '24px', color: '#7C3AED' }} /> Menu Order
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Drag and drop to reorder sidebar navigation items.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={resetOrder}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderRadius: '8px', border: '1px solid rgb(var(--border))',
              backgroundColor: 'transparent', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', color: 'rgb(var(--text-primary))',
            }}
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderRadius: '8px', border: 'none',
              backgroundColor: saved ? '#10B981' : '#7C3AED',
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.7 : 1, transition: 'background-color 200ms',
            }}
          >
            {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '14px 18px', borderRadius: '10px',
        backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
      }}>
        <Info style={{ width: '16px', height: '16px', color: '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
        <span style={{ fontSize: '13px', color: '#D97706', lineHeight: 1.5 }}>
          Drag the handle to reorder. Changes apply to all users immediately after saving.
        </span>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>

        {/* Left: Draggable list */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>
              Sidebar Menu Items ({items.length})
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Visible
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} /> Hidden
              </span>
            </div>
          </div>
          <div style={{ padding: '8px 12px' }}>
            {items.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={() => handleDrop(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  border: dragOver === item.id ? '2px dashed #7C3AED' : '2px solid transparent',
                  backgroundColor: dragging === item.id ? 'rgba(124,58,237,0.08)' : 'transparent',
                  opacity: dragging === item.id ? 0.6 : 1,
                  cursor: 'grab', transition: 'all 150ms',
                  marginBottom: '2px',
                }}
              >
                {/* Grip */}
                <GripVertical style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0, opacity: 0.5 }} />

                {/* Order number */}
                <span style={{
                  width: '24px', height: '24px', borderRadius: '6px',
                  backgroundColor: 'rgba(var(--border), 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: 'rgb(var(--text-muted))', flexShrink: 0,
                }}>
                  {idx + 1}
                </span>

                {/* Icon */}
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>

                {/* Label */}
                <span style={{
                  flex: 1, fontSize: '14px', fontWeight: 600,
                  color: item.visible ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))',
                  textDecoration: item.visible ? 'none' : 'line-through',
                }}>
                  {item.label}
                </span>

                {/* Visibility badge */}
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '6px',
                  backgroundColor: item.visible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: item.visible ? '#10B981' : '#EF4444',
                }}>
                  {item.visible ? 'Default' : 'Hidden'}
                </span>

                {/* Toggle visibility */}
                <button
                  onClick={() => toggleVisibility(item.id)}
                  style={{
                    padding: '4px', borderRadius: '6px', border: '1px solid rgb(var(--border))',
                    backgroundColor: 'transparent', cursor: 'pointer',
                    color: item.visible ? '#10B981' : '#EF4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {item.visible ? <Eye style={{ width: '14px', height: '14px' }} /> : <EyeOff style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Live Preview</h3>
          </div>
          <div style={{ padding: '16px' }}>
            {/* Mini sidebar preview */}
            <div style={{
              backgroundColor: 'rgb(var(--surface))', borderRadius: '10px',
              border: '1px solid rgba(var(--border),0.3)', padding: '12px',
              display: 'flex', flexDirection: 'column', gap: '3px',
            }}>
              {items.filter(i => i.visible).map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '8px',
                  backgroundColor: idx === 0 ? 'rgba(124,58,237,0.1)' : 'transparent',
                  transition: 'background-color 150ms',
                }}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: idx === 0 ? 700 : 500,
                    color: idx === 0 ? '#7C3AED' : 'rgb(var(--text-primary))',
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '12px 0 0', textAlign: 'center' }}>
              {items.filter(i => i.visible).length} visible · {items.filter(i => !i.visible).length} hidden
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
