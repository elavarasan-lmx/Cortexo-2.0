'use client';

import {
  BookOpen, Zap, Code2, Shield, Database, GitBranch,
  Search, Filter, Star, Clock, ChevronRight, Plus,
  Terminal, Bug, Rocket, Server, Brain,
} from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const demoSkills = [
  { id: '1', name: 'Deploy Orchestrator', category: 'deployment', description: 'Multi-server PM2 deploy with rollback awareness and health checks', version: '2.1', rating: 4.8, usageCount: 234, status: 'active', icon: Rocket },
  { id: '2', name: 'Bug Hunter', category: 'analysis', description: 'Automated bug detection using pattern matching across 19 known vulnerability patterns', version: '1.5', rating: 4.6, usageCount: 156, status: 'active', icon: Bug },
  { id: '3', name: 'Config Drift Detector', category: 'infra', description: 'Compare nginx/supervisor configs across servers and flag divergence', version: '1.2', rating: 4.3, usageCount: 89, status: 'active', icon: Shield },
  { id: '4', name: 'MySQL Query Analyzer', category: 'database', description: 'Identify slow queries, missing indexes, and schema optimization opportunities', version: '1.0', rating: 4.1, usageCount: 67, status: 'beta', icon: Database },
  { id: '5', name: 'Git Flow Manager', category: 'vcs', description: 'Automate branch management, merge conflict detection, and release tagging', version: '0.9', rating: 3.9, usageCount: 45, status: 'beta', icon: GitBranch },
  { id: '6', name: 'Log Pattern Analyzer', category: 'analysis', description: 'Extract actionable patterns from production log streams in real-time', version: '1.3', rating: 4.5, usageCount: 112, status: 'active', icon: Terminal },
];

const catColors: Record<string, string> = {
  deployment: '#818CF8', analysis: '#10B981', infra: '#F59E0B',
  database: '#3B82F6', vcs: '#A78BFA', security: '#EF4444',
};

export default function AgentSkillsPage() {
  useAutoLoadToken();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = demoSkills.filter((s) => {
    const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'all' || s.category === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen style={{ width: '22px', height: '22px', color: '#10B981' }} />
            Skill Library
          </h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Agent capabilities and automation skills
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgb(var(--primary))', backgroundColor: 'rgba(var(--primary), 0.08)', color: 'rgb(var(--primary))', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Create Skill
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Skills', value: String(demoSkills.length), icon: BookOpen, color: '#10B981' },
          { label: 'Active', value: String(demoSkills.filter(s => s.status === 'active').length), icon: Zap, color: '#818CF8' },
          { label: 'Total Runs', value: String(demoSkills.reduce((s, sk) => s + sk.usageCount, 0)), icon: Code2, color: '#3B82F6' },
          { label: 'Avg Rating', value: (demoSkills.reduce((s, sk) => s + sk.rating, 0) / demoSkills.length).toFixed(1), icon: Star, color: '#F59E0B' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${c.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: c.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{c.label}</p>
                <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${c.color}12` }}>
                  <Icon style={{ width: '15px', height: '15px', color: c.color }} />
                </div>
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: c.color, margin: '10px 0 0', lineHeight: 1 }}>{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', flex: '1 1 220px', maxWidth: '320px' }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))' }} />
          <input type="text" placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'rgb(var(--text-primary))', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'deployment', 'analysis', 'infra', 'database', 'vcs'].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, border: '1px solid', borderColor: activeFilter === f ? 'rgb(var(--primary))' : 'rgb(var(--border))', backgroundColor: activeFilter === f ? 'rgba(var(--primary), 0.08)' : 'transparent', color: activeFilter === f ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))', cursor: 'pointer', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filtered.map((skill) => {
          const Icon = skill.icon;
          const color = catColors[skill.category] || '#6B7280';
          return (
            <div key={skill.id} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '20px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 6px 20px -4px ${color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: `${color}12`, flexShrink: 0 }}>
                  <Icon style={{ width: '18px', height: '18px', color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{skill.name}</h3>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: skill.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: skill.status === 'active' ? '#10B981' : '#F59E0B' }}>{skill.status}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '6px 0 0', lineHeight: 1.5 }}>{skill.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Star style={{ width: '11px', height: '11px', color: '#F59E0B' }} /> {skill.rating}</span>
                    <span>v{skill.version}</span>
                    <span>{skill.usageCount} runs</span>
                    <span style={{ textTransform: 'capitalize', color }}>{skill.category}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
