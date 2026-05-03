'use client';

import {
  Store, Download, Star, Users, Search, Filter,
  Zap, Shield, Database, GitBranch, Terminal, Bug,
  Rocket, Brain, ChevronRight, ExternalLink,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const marketplaceItems = [
  { id: '1', name: 'Kubernetes Deployer', author: 'Cortexo Labs', description: 'Deploy and manage K8s clusters with intelligent rollback and canary support', category: 'deployment', downloads: 12400, rating: 4.9, icon: Rocket, featured: true },
  { id: '2', name: 'Security Scanner Pro', author: 'SecureAI', description: 'Deep security scanning for OWASP top 10, dependency vulnerabilities, and secrets detection', category: 'security', downloads: 8900, rating: 4.7, icon: Shield, featured: true },
  { id: '3', name: 'Database Optimizer', author: 'DataFlow', description: 'Automated query optimization, index suggestions, and schema migration planning', category: 'database', downloads: 6700, rating: 4.5, icon: Database, featured: false },
  { id: '4', name: 'Git Flow Automator', author: 'DevToolKit', description: 'Intelligent branch management, PR review automation, and release orchestration', category: 'vcs', downloads: 5200, rating: 4.4, icon: GitBranch, featured: false },
  { id: '5', name: 'Log Intelligence', author: 'ObsrvAI', description: 'Real-time log pattern detection, anomaly alerts, and root cause correlation', category: 'monitoring', downloads: 4100, rating: 4.3, icon: Terminal, featured: false },
  { id: '6', name: 'Smart Bug Triage', author: 'QualityFirst', description: 'AI-powered bug prioritization, duplicate detection, and auto-assignment', category: 'testing', downloads: 3800, rating: 4.2, icon: Bug, featured: false },
];

const catColors: Record<string, string> = {
  deployment: '#818CF8', security: '#EF4444', database: '#3B82F6',
  vcs: '#A78BFA', monitoring: '#10B981', testing: '#F59E0B',
};

export default function AgentMarketplacePage() {
  useAutoLoadToken();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = marketplaceItems.filter((item) => {
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'all' || item.category === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store style={{ width: '22px', height: '22px', color: '#818CF8' }} />
          Agent Marketplace
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Discover and install agent skills from the community
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', flex: '1 1 280px', maxWidth: '400px' }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input type="text" placeholder="Search marketplace..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'rgb(var(--text-primary))', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'deployment', 'security', 'database', 'monitoring', 'testing'].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid', borderColor: activeFilter === f ? 'rgb(var(--primary))' : 'rgb(var(--border))', backgroundColor: activeFilter === f ? 'rgba(var(--primary), 0.08)' : 'transparent', color: activeFilter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', cursor: 'pointer', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {activeFilter === 'all' && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#F59E0B' }} /> Featured
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {filtered.filter(i => i.featured).map((item) => {
              const Icon = item.icon;
              const color = catColors[item.category] || '#6B7280';
              return (
                <div key={item.id} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '22px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                      <Icon style={{ width: '22px', height: '22px', color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{item.name}</h3>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>Featured</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>by {item.author}</p>
                      <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '8px 0 0', lineHeight: 1.5 }}>{item.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Star style={{ width: '11px', height: '11px', color: '#F59E0B' }} /> {item.rating}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Download style={{ width: '11px', height: '11px' }} /> {(item.downloads / 1000).toFixed(1)}k</span>
                        <span style={{ textTransform: 'capitalize', color }}>{item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Skills */}
      <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 12px' }}>All Skills</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
        {filtered.filter(i => activeFilter !== 'all' || !i.featured).map((item) => {
          const Icon = item.icon;
          const color = catColors[item.category] || '#6B7280';
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '12px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                <Icon style={{ width: '16px', height: '16px', color }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{item.name}</h3>
                <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 6px' }}>by {item.author}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Star style={{ width: '10px', height: '10px', color: '#F59E0B' }} /> {item.rating}</span>
                  <span>{(item.downloads / 1000).toFixed(1)}k</span>
                </div>
              </div>
              <button style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid rgb(var(--primary))', backgroundColor: 'rgba(var(--primary), 0.08)', color: 'rgb(var(--primary))', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Install</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
