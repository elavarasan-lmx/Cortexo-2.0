'use client';

import { useState } from 'react';
import {
  ScrollText, Search, File, Loader2, RefreshCw,
  Plus, Trash2, AlertTriangle, Info, Bug, Zap, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.08)',  text: '#EF4444', dot: '#EF4444' },
  error:    { bg: 'rgba(239,68,68,0.06)',  text: '#F87171', dot: '#F87171' },
  warning:  { bg: 'rgba(245,158,11,0.06)', text: '#F59E0B', dot: '#F59E0B' },
  info:     { bg: 'transparent',           text: 'rgb(var(--text-secondary))', dot: '#818CF8' },
  debug:    { bg: 'transparent',           text: 'rgb(var(--text-muted))',    dot: '#6B7280' },
};



function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function LogViewerPage() {
  useAutoLoadToken();
  const { data: sources, loading, error, refetch } = useApiData(() => api.getLogSources());
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [logLines, setLogLines] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [logLoading, setLogLoading] = useState(false);

  const allSources = (sources as any[]) || [];

  const handleSelectSource = async (sourceId: number) => {
    setSelectedSource(sourceId);
    setLogLoading(true);
    try {
      const result = await api.readLog(sourceId, 200);
      if (result && (result as any).lines) {
        setLogLines((result as any).lines);
      }
    } catch {
      setLogLines([]);
    }
    setLogLoading(false);
  };

  const handleSearch = async () => {
    if (!selectedSource || !searchQuery.trim()) return;
    setLogLoading(true);
    try {
      const result = await api.searchLog(selectedSource, searchQuery);
      if (result && (result as any).results) {
        setLogLines((result as any).results);
      }
    } catch {
      // Keep current lines
    }
    setLogLoading(false);
  };

  const filteredLines = levelFilter === 'all' ? logLines : logLines.filter((l: any) => l.level === levelFilter);

  return (
    <div>


      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Log Viewer</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>{allSources.length} sources · search, tail, and browse server logs</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
          <Plus style={{ width: '16px', height: '16px' }} /> Add Source
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '14px', height: 'calc(100vh - 230px)' }}>
        {/* Sources sidebar */}
        <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'auto' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgb(var(--border))', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(var(--text-muted))' }}>
            Log Sources
          </div>
          {allSources.map((src: any) => (
            <div key={src.id} onClick={() => handleSelectSource(src.id)} style={{
              padding: '12px 14px', borderBottom: '1px solid rgb(var(--border))', cursor: 'pointer', transition: 'background-color 150ms',
              backgroundColor: selectedSource === src.id ? 'rgba(var(--primary), 0.08)' : 'transparent',
              borderLeft: selectedSource === src.id ? '3px solid rgb(var(--primary))' : '3px solid transparent',
            }}
              onMouseEnter={e => { if (selectedSource !== src.id) e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.04)'; }}
              onMouseLeave={e => { if (selectedSource !== src.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <File style={{ width: '13px', height: '13px', color: src.exists ? '#10B981' : '#EF4444' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{src.name}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', marginLeft: '21px' }}>
                {src.server} · {src.exists ? formatBytes(src.fileSize) : 'not found'}
              </div>
            </div>
          ))}
        </div>

        {/* Log content */}
        <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid rgb(var(--border))' }}>
            <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search logs..."
              style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'rgb(var(--text-primary))', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }} />
            <div style={{ display: 'flex', gap: '4px' }}>
              {['all', 'critical', 'error', 'warning', 'info', 'debug'].map(lvl => {
                const lc = levelColors[lvl] || levelColors.info;
                return (
                  <button key={lvl} onClick={() => setLevelFilter(lvl)} style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer',
                    backgroundColor: levelFilter === lvl ? (lc.bg === 'transparent' ? 'rgba(var(--primary), 0.1)' : lc.bg) : 'transparent',
                    color: levelFilter === lvl ? (lvl === 'all' ? 'rgb(var(--primary))' : lc.text) : 'rgb(var(--text-muted))',
                  }}>{lvl}</button>
                );
              })}
            </div>
          </div>

          {/* Log lines */}
          <div style={{ flex: 1, overflow: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: '20px' }}>
            {logLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <Loader2 style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : filteredLines.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-muted))', fontSize: '13px' }}>
                {selectedSource ? 'No log lines found.' : 'Select a log source from the sidebar.'}
              </div>
            ) : (
              filteredLines.map((line: any, idx: number) => {
                const lc = levelColors[line.level] || levelColors.info;
                return (
                  <div key={idx} style={{
                    display: 'flex', padding: '2px 14px', backgroundColor: lc.bg,
                    borderLeft: `3px solid ${lc.dot}`,
                  }}>
                    <span style={{ width: '45px', textAlign: 'right', color: 'rgb(var(--text-muted))', marginRight: '12px', flexShrink: 0, userSelect: 'none' }}>{line.num}</span>
                    <span style={{ color: lc.text, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line.text}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
