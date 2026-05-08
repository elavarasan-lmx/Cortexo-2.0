'use client';

import React, { useState } from 'react';
import { 
  Bug, AlertOctagon, CheckCircle2, CircleDashed, 
  Search, Plus, Filter, ChevronRight, AlertTriangle,
  Users, Sparkles, ChevronDown, Activity, Clock
} from 'lucide-react';

// Mock Data
const MOCK_BUGS = [
  {
    id: 425,
    title: 'Payment gateway timeout on bulk orders',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Jerry',
    updated: '2 mins ago',
  },
  {
    id: 424,
    title: 'Rate calculation mismatch in gold module',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Tom',
    updated: '15 mins ago',
  },
  {
    id: 423,
    title: 'Session hijacking via expired JWT tokens',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Conor',
    updated: '1 hour ago',
  },
  {
    id: 420,
    title: 'Dashboard chart not loading for new users',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'Sathish',
    updated: '3 hours ago',
  },
  {
    id: 419,
    title: 'Email notification delivery failure on deploy',
    priority: 'High',
    status: 'Resolved',
    assignee: 'Jerry',
    updated: 'Yesterday',
  },
  {
    id: 410,
    title: 'Margin calculation wrong for silver orders',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Kavi',
    updated: 'Yesterday',
  }
];

const priorityConfig: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', icon: AlertOctagon },
  High: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', icon: AlertTriangle },
  Medium: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', icon: Activity },
};

const statusConfig: Record<string, { bg: string; color: string }> = {
  Open: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
  'In Progress': { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' },
  Resolved: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' },
};

const getBadgeColor = (name: string) => {
  const colors = ['#7C3AED', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function BugTrackerPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBugId, setSelectedBugId] = useState<number | null>(425); // Default selection for demo

  const filteredBugs = MOCK_BUGS.filter(bug => {
    if (filter !== 'all' && bug.status !== filter && bug.priority !== filter) return false;
    if (searchQuery && !bug.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedBug = MOCK_BUGS.find(b => b.id === selectedBugId);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>
            <Bug style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))' }} />
            Bug Tracker
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgb(var(--text-muted))' }}>
            Monitor, triage & resolve bugs across all projects
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
            <input 
              type="text" 
              placeholder="Search bugs..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 16px 10px 36px', borderRadius: '8px', border: '1px solid rgb(var(--border))',
                backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))',
                fontSize: '14px', width: '250px', outline: 'none'
              }}
            />
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px',
            backgroundColor: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600, transition: 'background-color 150ms'
          }}>
            <Plus style={{ width: '16px', height: '16px' }} />
            Report Bug
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bug style={{ width: '24px', height: '24px', color: '#EF4444' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>Total Bugs</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>23</p>
            </div>
          </div>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertOctagon style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>Critical</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>5</p>
          </div>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircleDashed style={{ width: '24px', height: '24px', color: '#3B82F6' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>Open</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>12</p>
          </div>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 style={{ width: '24px', height: '24px', color: '#22C55E' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>Resolved</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>6</p>
          </div>
        </div>
      </div>

      {/* ─── Filter Row ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setFilter('all')} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === 'all' ? 600 : 500,
            backgroundColor: filter === 'all' ? 'rgb(var(--primary))' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'all' ? '#FFF' : 'rgb(var(--text-muted))', transition: 'all 150ms'
          }}>All (23)</button>
          
          <button onClick={() => setFilter('Critical')} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === 'Critical' ? 600 : 500,
            backgroundColor: filter === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'Critical' ? '#EF4444' : 'rgb(var(--text-muted))', transition: 'all 150ms'
          }}>Critical (5)</button>
          
          <button onClick={() => setFilter('Open')} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === 'Open' ? 600 : 500,
            backgroundColor: filter === 'Open' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'Open' ? '#3B82F6' : 'rgb(var(--text-muted))', transition: 'all 150ms'
          }}>Open (12)</button>
          
          <button onClick={() => setFilter('In Progress')} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === 'In Progress' ? 600 : 500,
            backgroundColor: filter === 'In Progress' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'In Progress' ? '#6366F1' : 'rgb(var(--text-muted))', transition: 'all 150ms'
          }}>In Progress (6)</button>
        </div>
        
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', 
          border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', color: 'rgb(var(--text-muted))',
          fontSize: '13px', cursor: 'pointer'
        }}>
          <Filter style={{ width: '14px', height: '14px' }} /> Sort
        </button>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedBug ? '1fr 450px' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Table Area */}
        <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--text-muted), 0.05)' }}>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>ID</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Title</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Priority</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Assignee</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.map(bug => {
                const pc = priorityConfig[bug.priority] || priorityConfig.Medium;
                const sc = statusConfig[bug.status] || statusConfig.Open;
                const isSelected = selectedBugId === bug.id;
                
                return (
                  <tr 
                    key={bug.id} 
                    onClick={() => setSelectedBugId(bug.id)}
                    style={{ 
                      borderBottom: '1px solid rgb(var(--border))', cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(var(--primary), 0.05)' : 'transparent',
                      transition: 'background-color 150ms'
                    }}
                    onMouseEnter={e => { if(!isSelected) e.currentTarget.style.backgroundColor = 'rgba(var(--text-muted), 0.05)'; }}
                    onMouseLeave={e => { if(!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--primary))', fontFamily: 'JetBrains Mono, monospace' }}>
                      #{bug.id}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>
                      {bug.title}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: pc.bg, color: pc.color
                      }}>
                        <pc.icon style={{ width: '10px', height: '10px' }} />
                        {bug.priority}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: sc.bg, color: sc.color
                      }}>
                        {bug.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '12px', backgroundColor: getBadgeColor(bug.assignee),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px', fontWeight: 600
                        }}>
                          {bug.assignee.substring(0, 1)}
                        </div>
                        <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))' }}>{bug.assignee}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'rgb(var(--text-secondary))' }}>
                      {bug.updated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgb(var(--border))' }}>
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))' }}>Showing 1-6 of 23 bugs</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgb(var(--border))', background: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>&lt;</button>
              <button style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', background: 'rgb(var(--primary))', color: '#fff', cursor: 'pointer' }}>1</button>
              <button style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid rgb(var(--border))', background: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-primary))' }}>2</button>
              <button style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid rgb(var(--border))', background: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-primary))' }}>3</button>
              <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgb(var(--border))', background: 'transparent', cursor: 'pointer', color: 'rgb(var(--text-muted))' }}>&gt;</button>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedBug && (
          <div style={{ 
            borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', 
            overflow: 'hidden', position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column' 
          }}>
            <div style={{ backgroundColor: 'rgb(var(--primary))', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug style={{ width: '18px', height: '18px' }} />
                Bug Detail — #{selectedBug.id}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: '11px', fontWeight: 600 }}>{selectedBug.status}</span>
              </div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>Bug Description</h3>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'rgb(var(--text-secondary))' }}>
                  Payment gateway timeout on bulk orders. When users place orders exceeding 50 items, the payment gateway fails with HTTP 504 after 30 seconds. This causes order loss and revenue impact.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search style={{ width: '14px', height: '14px' }} /> Root Cause Analysis
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Module:</span>
                  <span style={{ color: 'rgb(var(--primary))', fontWeight: 500 }}>PaymentGatewayService</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>File:</span>
                  <span style={{ color: 'rgb(var(--text-primary))', fontFamily: 'JetBrains Mono, monospace' }}>src/services/payment/BulkProcessor.js:142</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Cause:</span>
                  <span style={{ color: 'rgb(var(--text-primary))' }}>Synchronous DB batch write exceeds gateway timeout limit (30s)</span>
                </div>
              </div>

              <div style={{ border: '1px solid rgb(var(--border))', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(var(--text-muted), 0.05)', borderBottom: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users style={{ width: '14px', height: '14px' }} /> Affected Clients
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444' }}>2 of 12 affected</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { name: 'GoldMine Trading', affected: true },
                    { name: 'Silver Stack Inc.', affected: false },
                    { name: 'Platinum Bullion Ltd', affected: true },
                    { name: 'SuperBull Exchange', affected: false }
                  ].map((client, i) => (
                    <div key={i} style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < 3 ? '1px solid rgb(var(--border))' : 'none' }}>
                      <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))' }}>{client.name}</span>
                      <span style={{ 
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                        backgroundColor: client.affected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: client.affected ? '#EF4444' : '#22C55E'
                      }}>
                        {client.affected ? 'Affected' : 'Fine'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: '1px solid rgba(124, 58, 237, 0.2)', backgroundColor: 'rgba(124, 58, 237, 0.03)', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--primary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles style={{ width: '14px', height: '14px' }} /> AI Suggestions
                </h3>
                <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'rgb(var(--text-secondary))', lineHeight: 1.5 }}>
                  <li>Convert synchronous batch writes to async chunked processing (50 items -&gt; 10 chunks of 5).</li>
                  <li>Increase gateway timeout to 60s for bulk endpoints or implement request streaming.</li>
                  <li>Add retry logic with exponential backoff in <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>BulkProcessor.js</span> for transient failures.</li>
                  <li>Deploy hotfix to GoldMine & Platinum Bullion first (highest order volume clients).</li>
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
