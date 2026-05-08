'use client';
import { useState } from 'react';
import { Save, GripVertical, RotateCcw, LayoutDashboard, Rocket, Bug, Heart, Server, Clock, Bot, FileText, Key, Eye, EyeOff } from 'lucide-react';

const iconMap: Record<string, any> = {
  Dashboard: LayoutDashboard, Deployments: Rocket, 'Bug Tracker': Bug,
  Heartbeat: Heart, Servers: Server, 'Cron Jobs': Clock,
  'AI Agents': Bot, 'API Keys': Key, 'Audit Log': FileText,
};
const colorMap: Record<string, string> = {
  Dashboard: '#7C3AED', Deployments: '#3B82F6', 'Bug Tracker': '#EF4444',
  Heartbeat: '#EC4899', Servers: '#10B981', 'Cron Jobs': '#F59E0B',
  'AI Agents': '#06B6D4', 'API Keys': '#8B5CF6', 'Audit Log': '#6B7280',
};

const initialItems = [
  { id: '1', title: 'Dashboard', visible: true },
  { id: '2', title: 'Deployments', visible: true },
  { id: '3', title: 'Bug Tracker', visible: true },
  { id: '4', title: 'Heartbeat', visible: true },
  { id: '5', title: 'Servers', visible: true },
  { id: '6', title: 'Cron Jobs', visible: true },
  { id: '7', title: 'AI Agents', visible: true },
  { id: '8', title: 'API Keys', visible: true },
  { id: '9', title: 'Audit Log', visible: true },
];

const card: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))', overflow: 'hidden',
};

export default function MenuOrderPage() {
  const [items, setItems] = useState(initialItems);
  const [dragging, setDragging] = useState<string | null>(null);

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const arr = [...items];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setItems(arr);
  };

  const toggleVisibility = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
  };

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) return;
    const fromIdx = items.findIndex(i => i.id === dragging);
    const toIdx = items.findIndex(i => i.id === targetId);
    moveItem(fromIdx, toIdx);
  };
  const handleDragEnd = () => setDragging(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
            📋 Menu Order
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Drag to reorder sidebar navigation items for all users.
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Save style={{ width: '14px', height: '14px' }} /> Save Order
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>

        {/* Left: Reorder list */}
        <div style={card}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(var(--border),0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Sidebar Navigation Order</h3>
            <button onClick={() => setItems(initialItems)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-muted))', background: 'none', border: 'none', cursor: 'pointer' }}>
              <RotateCcw style={{ width: '13px', height: '13px' }} /> Reset Default
            </button>
          </div>
          <div style={{ padding: '12px 16px', marginBottom: '4px' }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', fontSize: '12px', color: '#7C3AED', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 Drag the handles to reorder. Changes apply to all users immediately after saving.
            </div>
          </div>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map((item, index) => {
              const Icon = iconMap[item.title] || FileText;
              const color = colorMap[item.title] || '#6B7280';
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '10px',
                    border: dragging === item.id ? '1.5px solid #7C3AED' : '1px solid rgb(var(--border))',
                    backgroundColor: dragging === item.id ? 'rgba(124,58,237,0.06)' : 'transparent',
                    cursor: 'grab', transition: 'all 150ms',
                    opacity: item.visible ? 1 : 0.5,
                  }}
                >
                  <GripVertical style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-muted))', width: '20px', flexShrink: 0 }}>{index + 1}.</span>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '15px', height: '15px', color }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', flex: 1 }}>{item.title}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                    backgroundColor: item.visible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: item.visible ? '#10B981' : '#EF4444',
                    textTransform: 'uppercase',
                  }}>
                    {item.visible ? 'Visible' : 'Hidden'}
                  </span>
                  <button
                    onClick={() => toggleVisibility(item.id)}
                    style={{ padding: '4px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))', display: 'flex' }}
                  >
                    {item.visible ? <Eye style={{ width: '14px', height: '14px' }} /> : <EyeOff style={{ width: '14px', height: '14px' }} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Preview + Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>
          {/* Live Preview */}
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Live Preview</h4>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ borderRadius: '10px', backgroundColor: '#0F172A', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', marginBottom: '8px', padding: '0 8px' }}>CORTEXO</div>
                {items.filter(i => i.visible).map((item, idx) => {
                  const Icon = iconMap[item.title] || FileText;
                  const color = colorMap[item.title] || '#6B7280';
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', borderRadius: '6px',
                      backgroundColor: idx === 0 ? 'rgba(124,58,237,0.15)' : 'transparent',
                    }}>
                      <Icon style={{ width: '13px', height: '13px', color: idx === 0 ? '#7C3AED' : '#94A3B8' }} />
                      <span style={{ fontSize: '12px', fontWeight: idx === 0 ? 600 : 400, color: idx === 0 ? '#fff' : '#94A3B8' }}>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(var(--border),0.4)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'rgb(var(--text-primary))' }}>Legend</h4>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: <GripVertical style={{ width: '14px', height: '14px' }} />, text: 'Drag to reorder', color: '#7C3AED' },
                { icon: <Eye style={{ width: '14px', height: '14px' }} />, text: 'Visible but removable', color: '#10B981' },
                { icon: <EyeOff style={{ width: '14px', height: '14px' }} />, text: 'Currently hiding menu item', color: '#EF4444' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                  <span style={{ color: l.color, display: 'flex' }}>{l.icon}</span>
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
