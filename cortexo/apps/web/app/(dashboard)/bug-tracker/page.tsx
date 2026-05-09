'use client';

import React, { useState } from 'react';
import { 
  Bug, AlertOctagon, CheckCircle2, CircleDashed, 
  Search, Plus, Filter, ChevronRight, AlertTriangle,
  Users, Sparkles, ChevronDown, Activity, Clock, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

const priorityConfig: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', icon: AlertOctagon },
  high: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', icon: AlertTriangle },
  medium: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', icon: Activity },
  low: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', icon: CircleDashed },
};

const statusConfig: Record<string, { bg: string; color: string }> = {
  unresolved: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
  investigating: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' },
  resolved: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' },
  ignored: { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748B' },
};

const statusLabels: Record<string, string> = {
  unresolved: 'Open',
  investigating: 'In Progress',
  resolved: 'Resolved',
  ignored: 'Ignored',
};

const getBadgeColor = (name: string) => {
  const colors = ['#7C3AED', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
  return colors[(name || 'U').charCodeAt(0) % colors.length];
};

export default function BugTrackerPage() {
  useAutoLoadToken();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);

  const { data: errorsData, loading, refetch } = useApiData(
    () => api.getErrors(),
    { default: [] as any[] }
  );

  const errors = errorsData || [];

  // Compute stats from real data
  const totalBugs = errors.length;
  const criticalCount = errors.filter((e: any) => e.severity === 'critical').length;
  const openCount = errors.filter((e: any) => e.status === 'unresolved').length;
  const resolvedCount = errors.filter((e: any) => e.status === 'resolved').length;

  const filteredBugs = errors.filter((bug: any) => {
    if (filter !== 'all') {
      if (filter === 'critical' && bug.severity !== 'critical') return false;
      if (filter === 'unresolved' && bug.status !== 'unresolved') return false;
      if (filter === 'investigating' && bug.status !== 'investigating') return false;
    }
    if (searchQuery && !bug.message?.toLowerCase().includes(searchQuery.toLowerCase()) && !bug.type?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedBug = errors.find((b: any) => b.id === selectedBugId);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

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
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{totalBugs}</p>
            </div>
          </div>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertOctagon style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>Critical</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{criticalCount}</p>
          </div>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircleDashed style={{ width: '24px', height: '24px', color: '#3B82F6' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>Open</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{openCount}</p>
          </div>
        </div>
        
        <div style={{ borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', padding: '20px', border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 style={{ width: '24px', height: '24px', color: '#22C55E' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>Resolved</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{resolvedCount}</p>
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
          }}>All ({totalBugs})</button>
          
          <button onClick={() => setFilter('critical')} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === 'critical' ? 600 : 500,
            backgroundColor: filter === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'critical' ? '#EF4444' : 'rgb(var(--text-muted))', transition: 'all 150ms'
          }}>Critical ({criticalCount})</button>
          
          <button onClick={() => setFilter('unresolved')} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === 'unresolved' ? 600 : 500,
            backgroundColor: filter === 'unresolved' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'unresolved' ? '#3B82F6' : 'rgb(var(--text-muted))', transition: 'all 150ms'
          }}>Open ({openCount})</button>
          
          <button onClick={() => setFilter('investigating')} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === 'investigating' ? 600 : 500,
            backgroundColor: filter === 'investigating' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(var(--text-muted), 0.1)',
            color: filter === 'investigating' ? '#6366F1' : 'rgb(var(--text-muted))', transition: 'all 150ms'
          }}>In Progress ({errors.filter((e: any) => e.status === 'investigating').length})</button>
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
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Error</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Severity</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Assignee</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.length > 0 ? filteredBugs.map((bug: any) => {
                const pc = priorityConfig[bug.severity] || priorityConfig.medium;
                const sc = statusConfig[bug.status] || statusConfig.unresolved;
                const isSelected = selectedBugId === bug.id;
                const assigneeName = bug.assignedToName || bug.assignedTo || 'Unassigned';
                
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
                      #{bug.id.toString().substring(0, 6)}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{bug.type}</span>
                        <br />
                        <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{bug.message?.substring(0, 80)}{bug.message?.length > 80 ? '...' : ''}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: pc.bg, color: pc.color, textTransform: 'capitalize'
                      }}>
                        <pc.icon style={{ width: '10px', height: '10px' }} />
                        {bug.severity}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: sc.bg, color: sc.color
                      }}>
                        {statusLabels[bug.status] || bug.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '12px', backgroundColor: getBadgeColor(assigneeName),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px', fontWeight: 600
                        }}>
                          {assigneeName.substring(0, 1).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))' }}>{assigneeName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'rgb(var(--text-secondary))' }}>
                      {timeAgo(bug.lastSeenAt || bug.firstSeenAt)}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                    <Bug style={{ width: '24px', height: '24px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>No bugs found</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgb(var(--text-secondary))' }}>
                      {searchQuery ? 'Try a different search term.' : 'All systems running clean! 🎉'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgb(var(--border))' }}>
            <span style={{ fontSize: '13px', color: 'rgb(var(--text-muted))' }}>Showing {filteredBugs.length} of {totalBugs} bugs</span>
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
                Bug Detail — #{selectedBug.id.toString().substring(0, 6)}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: '11px', fontWeight: 600 }}>{statusLabels[selectedBug.status] || selectedBug.status}</span>
              </div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>Error Details</h3>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{selectedBug.type}</p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'rgb(var(--text-secondary))' }}>
                  {selectedBug.message}
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search style={{ width: '14px', height: '14px' }} /> Error Info
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>File:</span>
                  <span style={{ color: 'rgb(var(--text-primary))', fontFamily: 'JetBrains Mono, monospace' }}>{selectedBug.file || '—'}{selectedBug.line ? `:${selectedBug.line}` : ''}</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Severity:</span>
                  <span style={{ color: 'rgb(var(--text-primary))', textTransform: 'capitalize' }}>{selectedBug.severity}</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Events:</span>
                  <span style={{ color: 'rgb(var(--text-primary))' }}>{selectedBug.eventCount || 0} occurrences</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>First Seen:</span>
                  <span style={{ color: 'rgb(var(--text-primary))' }}>{timeAgo(selectedBug.firstSeenAt)}</span>
                  <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 500 }}>Last Seen:</span>
                  <span style={{ color: 'rgb(var(--text-primary))' }}>{timeAgo(selectedBug.lastSeenAt)}</span>
                </div>
              </div>

              {selectedBug.assignedToName && (
                <div style={{ border: '1px solid rgb(var(--border))', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '16px', backgroundColor: getBadgeColor(selectedBug.assignedToName),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '13px', fontWeight: 600
                  }}>
                    {selectedBug.assignedToName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>Assigned to {selectedBug.assignedToName}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgb(var(--text-muted))' }}>Fingerprint: {selectedBug.fingerprint?.substring(0, 20)}...</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
