'use client';

import React, { useState } from 'react';
import {
  ClipboardCheck, Plus, Trash2, Check, X, GripVertical,
  ChevronDown, ChevronRight, Save, RotateCcw,
} from 'lucide-react';

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

interface CheckGroup {
  id: string;
  title: string;
  collapsed: boolean;
  items: CheckItem[];
}

const DEFAULT_GROUPS: CheckGroup[] = [
  {
    id: 'pre-deploy', title: '🚀 Pre-Deploy', collapsed: false,
    items: [
      { id: '1', label: 'Code review approved', checked: false },
      { id: '2', label: 'All tests passing (unit + integration)', checked: false },
      { id: '3', label: 'Database migrations ready', checked: false },
      { id: '4', label: 'Environment variables updated', checked: false },
      { id: '5', label: 'Branch merged to main/master', checked: false },
      { id: '6', label: 'Changelog updated', checked: false },
    ],
  },
  {
    id: 'post-deploy', title: '✅ Post-Deploy', collapsed: false,
    items: [
      { id: '7', label: 'Health endpoint responding 200', checked: false },
      { id: '8', label: 'Login flow working', checked: false },
      { id: '9', label: 'Rate feed / WebSocket connected', checked: false },
      { id: '10', label: 'Admin panel accessible', checked: false },
      { id: '11', label: 'Cron jobs restarted', checked: false },
    ],
  },
  {
    id: 'security', title: '🔒 Security', collapsed: true,
    items: [
      { id: '12', label: 'SSL certificate valid (> 30 days)', checked: false },
      { id: '13', label: 'CORS config verified', checked: false },
      { id: '14', label: 'Sensitive .env not in repo', checked: false },
      { id: '15', label: 'Debug mode OFF in production', checked: false },
    ],
  },
  {
    id: 'infra', title: '🖥️ Infrastructure', collapsed: true,
    items: [
      { id: '16', label: 'Server disk space > 20%', checked: false },
      { id: '17', label: 'PHP-FPM reloaded', checked: false },
      { id: '18', label: 'Nginx/Apache config tested', checked: false },
      { id: '19', label: 'Redis/Queue workers running', checked: false },
      { id: '20', label: 'Backup taken before deploy', checked: false },
      { id: '21', label: 'CDN cache purged', checked: false },
      { id: '22', label: 'DNS propagation confirmed', checked: false },
    ],
  },
];

export default function ChecklistPage() {
  const [groups, setGroups] = useState<CheckGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cortexo_checklist');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_GROUPS;
  });

  const save = (g: CheckGroup[]) => {
    setGroups(g);
    localStorage.setItem('cortexo_checklist', JSON.stringify(g));
  };

  const toggleItem = (groupId: string, itemId: string) => {
    save(groups.map(g => g.id === groupId ? { ...g, items: g.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) } : g));
  };

  const toggleGroup = (groupId: string) => {
    save(groups.map(g => g.id === groupId ? { ...g, collapsed: !g.collapsed } : g));
  };

  const addItem = (groupId: string) => {
    const label = prompt('New checklist item:');
    if (!label) return;
    save(groups.map(g => g.id === groupId ? { ...g, items: [...g.items, { id: Date.now().toString(), label, checked: false }] } : g));
  };

  const removeItem = (groupId: string, itemId: string) => {
    save(groups.map(g => g.id === groupId ? { ...g, items: g.items.filter(i => i.id !== itemId) } : g));
  };

  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);
  const checkedItems = groups.reduce((s, g) => s + g.items.filter(i => i.checked).length, 0);
  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Deployment Checklist</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>{checkedItems}/{totalItems} complete · {pct}%</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => save(DEFAULT_GROUPS)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>
            <RotateCcw style={{ width: '13px', height: '13px' }} /> Reset
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgb(var(--border))', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: pct === 100 ? '#10B981' : 'linear-gradient(90deg, rgb(var(--primary)), rgb(var(--agent)))', transition: 'width 300ms' }} />
      </div>

      {/* Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {groups.map(group => {
          const gc = group.items.filter(i => i.checked).length;
          const gt = group.items.length;
          return (
            <div key={group.id} style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
              <div onClick={() => toggleGroup(group.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', borderBottom: group.collapsed ? 'none' : '1px solid rgb(var(--border))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {group.collapsed ? <ChevronRight style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} /> : <ChevronDown style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />}
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{group.title}</span>
                  <span style={{ fontSize: '11px', color: gc === gt ? '#10B981' : 'rgb(var(--text-muted))' }}>{gc}/{gt}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); addItem(group.id); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', cursor: 'pointer' }}>
                  <Plus style={{ width: '12px', height: '12px' }} /> Add
                </button>
              </div>
              {!group.collapsed && (
                <div>
                  {group.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderBottom: '1px solid rgba(var(--border), 0.3)', transition: 'background-color 100ms' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <div onClick={() => toggleItem(group.id, item.id)} style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${item.checked ? '#10B981' : 'rgb(var(--border))'}`, backgroundColor: item.checked ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms', flexShrink: 0 }}>
                        {item.checked && <Check style={{ width: '12px', height: '12px', color: '#fff' }} />}
                      </div>
                      <span style={{ flex: 1, fontSize: '13px', color: item.checked ? 'rgb(var(--text-muted))' : 'rgb(var(--text-primary))', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.label}</span>
                      <button onClick={() => removeItem(group.id, item.id)} style={{ padding: '4px', borderRadius: '4px', border: 'none', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))', cursor: 'pointer', opacity: 0.4 }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#EF4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}>
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
