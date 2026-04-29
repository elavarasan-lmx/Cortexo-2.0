'use client';

import {
  BookOpen, Zap, Code2, Database, Shield, Wrench,
  Sparkles, CheckCircle, Clock, ArrowRight, Cpu,
  Lock, FileText,
} from 'lucide-react';

/* ─── Skill data ─── */
const skills = [
  {
    icon: Code2,
    name: 'PHP Error Analyzer',
    desc: 'Parse and categorize PHP error types, stack traces, and CodeIgniter patterns',
    status: 'active',
    version: '1.0',
    category: 'Debugging',
    categoryColor: '#EF4444',
    tags: ['PHP', 'CodeIgniter', 'Stack Trace'],
    color: '#818CF8',
  },
  {
    icon: Database,
    name: 'SQL Query Reviewer',
    desc: 'Detect slow queries, N+1 problems, and missing indexes in MariaDB',
    status: 'active',
    version: '1.0',
    category: 'Performance',
    categoryColor: '#3B82F6',
    tags: ['MariaDB', 'N+1', 'Indexes'],
    color: '#3B82F6',
  },
  {
    icon: Zap,
    name: 'Deploy Script Generator',
    desc: 'Auto-generate shell commands for PHP/CI deployment pipelines',
    status: 'active',
    version: '1.0',
    category: 'DevOps',
    categoryColor: '#10B981',
    tags: ['Shell', 'PHP', 'CI/CD'],
    color: '#10B981',
  },
  {
    icon: Shield,
    name: 'Security Scanner',
    desc: 'Detect SQL injection, XSS, CSRF, and hardcoded credentials in PHP code',
    status: 'coming-soon',
    version: '—',
    category: 'Security',
    categoryColor: '#F59E0B',
    tags: ['SQL Injection', 'XSS', 'CSRF'],
    color: '#F59E0B',
  },
  {
    icon: Wrench,
    name: 'Auto-Fix Suggester',
    desc: 'Generate code patches for common PHP and CodeIgniter bugs automatically',
    status: 'coming-soon',
    version: '—',
    category: 'Debugging',
    categoryColor: '#EF4444',
    tags: ['PHP', 'Patches', 'Auto-Fix'],
    color: '#8B5CF6',
  },
  {
    icon: BookOpen,
    name: 'Documentation Writer',
    desc: 'Auto-generate API docs and changelogs from git commits and code structure',
    status: 'coming-soon',
    version: '—',
    category: 'Productivity',
    categoryColor: '#6366F1',
    tags: ['API Docs', 'Changelog', 'Git'],
    color: '#6366F1',
  },
];

const activeSkills  = skills.filter(s => s.status === 'active');
const comingSkills  = skills.filter(s => s.status === 'coming-soon');

export default function SkillLibraryPage() {
  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Skill Library</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            AI agent capabilities available for your projects
          </p>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle style={{ width: '12px', height: '12px' }} />
            {activeSkills.length} Active
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, backgroundColor: 'rgba(107,114,128,0.1)', color: '#6B7280', border: '1px solid rgba(107,114,128,0.2)' }}>
            <Clock style={{ width: '12px', height: '12px' }} />
            {comingSkills.length} Coming Soon
          </div>
        </div>
      </div>

      {/* ─── Active skills ─── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Active Skills
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
          {activeSkills.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <div
                key={i}
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgb(var(--border))',
                  borderTop: `3px solid ${skill.color}`,
                  backgroundColor: 'rgb(var(--surface))',
                  padding: '18px 20px',
                  transition: 'box-shadow 200ms, transform 200ms',
                  cursor: 'default',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${skill.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '42px', height: '42px', flexShrink: 0, borderRadius: '11px',
                    background: `linear-gradient(135deg, ${skill.color}20, ${skill.color}08)`,
                    border: `1px solid ${skill.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '19px', height: '19px', color: skill.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + version */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
                        {skill.name}
                      </p>
                      <span style={{
                        padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                        backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}>
                        v{skill.version}
                      </span>
                    </div>
                    {/* Category */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
                      backgroundColor: `${skill.categoryColor}12`, color: skill.categoryColor,
                    }}>
                      <Cpu style={{ width: '9px', height: '9px' }} />
                      {skill.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.6 }}>
                  {skill.desc}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {skill.tags.map((tag, ti) => (
                    <span key={ti} style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: `${skill.color}10`, color: skill.color,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Use skill button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(var(--border),0.5)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#10B981' }}>
                    <CheckCircle style={{ width: '11px', height: '11px' }} /> Active
                  </span>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, color: skill.color,
                    backgroundColor: `${skill.color}10`,
                    transition: 'background-color 150ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${skill.color}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${skill.color}10`; }}
                  >
                    Use Skill <ArrowRight style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Coming Soon ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#6B7280' }} />
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(var(--text-muted))', margin: 0 }}>
            Coming Soon
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
          {comingSkills.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <div
                key={i}
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgb(var(--border))',
                  borderTop: `3px solid rgba(107,114,128,0.4)`,
                  backgroundColor: 'rgb(var(--surface))',
                  padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  position: 'relative', overflow: 'hidden',
                  opacity: 0.8,
                }}
              >
                {/* Coming soon ribbon */}
                <div style={{
                  position: 'absolute', top: '12px', right: '-22px',
                  backgroundColor: '#6B7280', color: '#fff',
                  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                  padding: '3px 28px', transform: 'rotate(35deg)',
                  letterSpacing: '0.05em',
                }}>
                  Soon
                </div>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', flexShrink: 0, borderRadius: '11px',
                    backgroundColor: 'rgba(107,114,128,0.1)',
                    border: '1px solid rgba(107,114,128,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '19px', height: '19px', color: '#9CA3AF' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--text-secondary))', margin: 0 }}>
                        {skill.name}
                      </p>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                        backgroundColor: 'rgba(107,114,128,0.1)', color: '#6B7280',
                        border: '1px solid rgba(107,114,128,0.2)',
                      }}>
                        <Lock style={{ width: '8px', height: '8px' }} />
                        Coming Soon
                      </span>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
                      backgroundColor: `${skill.categoryColor}10`, color: skill.categoryColor, opacity: 0.7,
                    }}>
                      <Cpu style={{ width: '9px', height: '9px' }} />
                      {skill.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0, lineHeight: 1.6 }}>
                  {skill.desc}
                </p>

                {/* Tags (greyed) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {skill.tags.map((tag, ti) => (
                    <span key={ti} style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: 'rgba(107,114,128,0.08)', color: '#9CA3AF',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(var(--border),0.5)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>
                    <Sparkles style={{ width: '11px', height: '11px' }} /> In development
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Info footer ─── */}
      <div style={{
        marginTop: '24px', borderRadius: '14px', padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(129,140,248,0.06), rgba(99,102,241,0.03))',
        border: '1px dashed rgba(129,140,248,0.3)',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{
          width: '36px', height: '36px', flexShrink: 0, borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(99,102,241,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles style={{ width: '16px', height: '16px', color: '#818CF8' }} />
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 2px' }}>
            Skills are automatically applied by the agent
          </p>
          <p style={{ fontSize: '12px', color: 'rgb(var(--text-muted))', margin: 0 }}>
            When the agent detects relevant code patterns or errors, it applies the appropriate skill automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
