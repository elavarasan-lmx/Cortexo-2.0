'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen, Code2, Zap, GitBranch, Shield, Key, ExternalLink, ChevronRight, Search,
  Rocket, Bug, Server, Brain, BarChart3, Settings, Boxes, Activity, FolderGit2,
  FileText, AlertTriangle, Database, RefreshCw, Plug, Wifi, ShieldCheck, Wand2,
  ArrowRight, Hash, Layers, X, Clock, Star,
} from 'lucide-react';

const DOCS = [
  {
    section: 'Getting Started', icon: Zap, color: '#818CF8', gradient: 'linear-gradient(135deg, #818CF8, #6366F1)',
    articles: [
      { title: 'Quick Start Guide', desc: 'Set up Cortexo in under 5 minutes — install, configure, and deploy', tag: 'Essential' },
      { title: 'Architecture Overview', desc: 'Next.js 16 frontend + Fastify 5 API + MariaDB + BullMQ workers' },
      { title: 'Environment Variables', desc: 'DATABASE_URL, API_PORT, NEXTAUTH_SECRET — full .env reference' },
      { title: 'Database Setup', desc: 'MariaDB/MySQL setup, Drizzle ORM schema push, and migration guide' },
    ],
  },
  {
    section: 'Projects', icon: FolderGit2, color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    articles: [
      { title: 'Create & Configure Projects', desc: 'Connect a GitHub/GitLab repo, set language, and assign deploy targets' },
      { title: 'Project Dashboard', desc: 'Error count, deploy history, pipeline status — at-a-glance project health' },
      { title: 'Environment Management', desc: 'Dev / staging / production configs with per-environment secrets' },
    ],
  },
  {
    section: 'CI/CD Pipelines', icon: GitBranch, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)',
    articles: [
      { title: 'Pipeline YAML Reference', desc: 'All pipeline config options: stages, steps, conditions, and parallelism', tag: 'Popular' },
      { title: 'Pipeline Editor (Visual)', desc: 'Drag-and-drop visual pipeline builder with live YAML preview' },
      { title: 'Pipeline Runs & Logs', desc: 'Real-time build logs, step-by-step status, duration, and re-run support' },
      { title: 'GitHub Webhook Triggers', desc: 'Auto-trigger pipelines on push, PR, or tag events via GitHub webhooks' },
    ],
  },
  {
    section: 'Deployments', icon: Rocket, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    articles: [
      { title: 'Deployment Flow', desc: 'SSH-based deploy: pull → build → symlink → reload — zero-downtime strategy', tag: 'Essential' },
      { title: 'Canary Releases', desc: '5% → 25% → 100% phased rollout with automatic health-check gating' },
      { title: 'Rollback Strategies', desc: 'One-click rollback, auto-rollback on error spike, and version pinning' },
      { title: 'Deploy Targets (SSH)', desc: 'Configure SSH servers with AES-256 encrypted credentials for deploys' },
    ],
  },
  {
    section: 'Error Tracking & Bugs', icon: Bug, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    articles: [
      { title: 'Error Ingestion', desc: 'SDK sends errors via POST /v1/ingest — stack traces, breadcrumbs, context' },
      { title: 'Error Dashboard', desc: 'Group, filter, assign, and resolve errors — sorted by frequency and impact' },
      { title: 'AI Root Cause Analysis', desc: 'OpenAI-powered root cause detection with similar bug finder and fix suggestions', tag: 'AI' },
      { title: 'Security Scan Results', desc: 'Static analysis: SQL injection, XSS, CSRF, OWASP Top 10 coverage' },
    ],
  },
  {
    section: 'Operations', icon: AlertTriangle, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    articles: [
      { title: 'Postmortem Reports', desc: 'Structured incident reports: timeline, root cause, action items, and lessons' },
      { title: 'Deprecation Tracker', desc: 'Track deprecated APIs, libraries, and PHP versions across all 70+ panels' },
    ],
  },
  {
    section: 'Infrastructure', icon: Server, color: '#14B8A6', gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    articles: [
      { title: 'Server Management', desc: 'Add, monitor, and manage SSH servers — CPU, memory, disk, uptime tracking' },
      { title: 'Server Mounts', desc: 'SFTP mount points for remote file access and deployment path configuration' },
      { title: 'Deploy Sources', desc: 'Git source configurations for each server — branch, remote, and auto-pull settings' },
      { title: 'Log Viewer', desc: 'Real-time server logs with search, filtering, level highlighting, and tail mode' },
      { title: 'Client Fleet Dashboard', desc: 'Monitor all 70+ client panels — domain, server, version, health status' },
    ],
  },
  {
    section: 'Source Sync & Migration', icon: RefreshCw, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    articles: [
      { title: 'Source Sync Engine', desc: 'Git-based code sync across servers — diff preview, conflict resolution, batch push' },
      { title: 'DB Migration Tool', desc: 'Schema diff, migration script generation, and safe rollback for MariaDB/MySQL' },
    ],
  },
  {
    section: 'Agent Intelligence', icon: Brain, color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    articles: [
      { title: 'Agent Memory', desc: 'Persistent memory store — the AI agent remembers past decisions and context', tag: 'AI' },
      { title: 'Skill Library', desc: '5 built-in skills: code-review, deploy-ssh, migration, security-scan, tdd-cycle' },
      { title: 'Context Monitor', desc: 'View what the agent sees — active files, recent errors, pipeline state' },
      { title: 'Agent Performance', desc: 'Token usage, latency, success rate, and cost tracking per agent run' },
      { title: 'Agent Runner', desc: 'Execute agent tasks with risk-level guardrails: safe → cautious → destructive' },
      { title: 'Marketplace', desc: 'Community and custom skill packages — install, configure, and extend the agent' },
    ],
  },
  {
    section: 'WinBull', icon: Wand2, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    articles: [
      { title: 'Client Configurations', desc: 'Manage 70+ bullion client panels — rate configs, trading limits, app settings' },
      { title: 'Provision Wizard', desc: 'One-click new client setup: domain → server → DB → app deploy → DNS — automated' },
    ],
  },
  {
    section: 'Analytics & Reports', icon: BarChart3, color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    articles: [
      { title: 'Insights Dashboard', desc: 'Error trends, deploy frequency, MTTR, and performance metrics over time' },
      { title: 'Reports', desc: 'Weekly/monthly reports — error summaries, deploy stats, team activity logs' },
    ],
  },
  {
    section: 'Testing', icon: Activity, color: '#84CC16', gradient: 'linear-gradient(135deg, #84CC16, #65A30D)',
    articles: [
      { title: 'Load Testing', desc: 'HTTP load tests with configurable concurrency, duration, and endpoint targets' },
      { title: 'Socket Testing', desc: 'WebSocket connection tester — verify real-time rate feeds and socket health' },
      { title: 'Module Testing', desc: 'Per-module unit and integration test runner with coverage tracking' },
      { title: 'Deployment Checklist', desc: 'Pre-deploy checklist: DB backup, cache clear, env check, rollback plan' },
      { title: 'API Health Monitor', desc: 'Endpoint health checks with response time, status code, and uptime tracking' },
      { title: 'SSL Certificate Monitor', desc: 'Track SSL expiry dates across all client domains with renewal alerts' },
    ],
  },
  {
    section: 'SDKs & Integrations', icon: Code2, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    articles: [
      { title: 'PHP SDK (Composer)', desc: 'composer require cortexo/sdk — one-line setup for CodeIgniter 3/4 apps' },
      { title: 'JavaScript SDK', desc: 'Browser window.onerror + Node.js process error tracking with source maps' },
      { title: 'Flutter SDK', desc: 'FlutterError + runZonedGuarded integration with Dart stack trace symbolication' },
      { title: 'React Native SDK', desc: 'ErrorUtils + AppState breadcrumbs for iOS and Android crash reporting' },
      { title: 'Python SDK', desc: 'Exception handler middleware for Django, Flask, and FastAPI applications' },
      { title: 'Node.js SDK', desc: 'Express/Fastify middleware with automatic request context and error capture' },
    ],
  },
  {
    section: 'Settings & Configuration', icon: Settings, color: '#64748B', gradient: 'linear-gradient(135deg, #64748B, #475569)',
    articles: [
      { title: 'Profile & Account', desc: 'Update name, email, phone, timezone, password, and avatar' },
      { title: 'Organization Settings', desc: 'Org name, slug, plan, and member management' },
      { title: 'Team Management', desc: 'Invite members, assign roles (owner, admin, developer, viewer)' },
      { title: 'API Keys', desc: 'Generate, rotate, and revoke SDK keys for error ingestion endpoints' },
      { title: 'Notification Preferences', desc: 'Toggle deploy alerts, error spikes, Slack, email, and digest notifications' },
      { title: 'Integrations', desc: 'Connect GitHub, GitLab, Slack, Email (Resend), and OpenAI API keys' },
      { title: 'Sidebar Modules', desc: 'Show/hide sidebar sections per user — saved via menu-permissions API' },
    ],
  },
  {
    section: 'API Reference', icon: Key, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    articles: [
      { title: 'Authentication API', desc: 'POST /auth/login, /auth/register, JWT refresh, forgot/reset password' },
      { title: 'Projects API', desc: 'CRUD for projects — GET/POST/PUT/DELETE /v1/projects' },
      { title: 'Pipelines API', desc: 'Create, trigger, list pipeline runs — /v1/pipelines, /v1/pipeline-runs' },
      { title: 'Error Ingest API', desc: 'POST /v1/ingest/error — SDK payload format, batching, and rate limits' },
      { title: 'Webhooks API', desc: 'GitHub/GitLab webhook payload reference and signature verification' },
      { title: 'Integrations API', desc: 'OAuth connect/disconnect, Slack webhook config — /v1/integrations/*' },
      { title: 'Server & Infrastructure API', desc: '/v1/servers, /v1/server-mounts, /v1/log-viewer, /v1/sync endpoints' },
      { title: 'Agent API', desc: '/v1/agent/*, /v1/agent-memory, /v1/agent-engine — AI agent endpoints' },
    ],
  },
];

const ALL_ARTICLES = DOCS.flatMap(s => s.articles.map(a => ({ ...a, section: s.section, color: s.color, gradient: s.gradient, icon: s.icon })));

/* ─── Tag colors ─── */
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Essential: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  Popular: { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  AI: { bg: 'rgba(139,92,246,0.12)', text: '#8B5CF6' },
};

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return ALL_ARTICLES.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
  }, [search]);

  const totalArticles = ALL_ARTICLES.length;
  const activeDocs = activeSection ? DOCS.find(d => d.section === activeSection) : null;

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ═══ Hero Header ═══ */}
      <div style={{
        borderRadius: 20, padding: '32px 36px', marginBottom: 28,
        background: 'linear-gradient(135deg, rgba(var(--primary),0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(14,165,233,0.04) 100%)',
        border: '1px solid rgba(var(--primary),0.12)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(var(--primary),0.05)' }} />
        <div style={{ position:'absolute', bottom:-30, right:80, width:100, height:100, borderRadius:'50%', background:'rgba(139,92,246,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <div style={{
              width:44, height:44, borderRadius:14,
              background:'linear-gradient(135deg, rgb(var(--primary)), rgba(139,92,246,0.9))',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <BookOpen style={{ width:22, height:22, color:'#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'rgb(var(--text-primary))', margin:0, letterSpacing:'-0.02em' }}>
                Documentation
              </h1>
              <p style={{ fontSize:13, color:'rgb(var(--text-secondary))', margin:0 }}>
                Everything you need to build, deploy, and monitor with Cortexo
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:24, marginTop:20, flexWrap:'wrap' }}>
            {[
              { label: 'Modules', value: DOCS.length, icon: Layers },
              { label: 'Articles', value: totalArticles, icon: FileText },
              { label: 'SDKs', value: '6', icon: Code2 },
              { label: 'API Endpoints', value: '50+', icon: Key },
            ].map(s => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <s.icon style={{ width:14, height:14, color:'rgb(var(--text-muted))' }} />
                <span style={{ fontSize:18, fontWeight:700, color:'rgb(var(--text-primary))' }}>{s.value}</span>
                <span style={{ fontSize:12, color:'rgb(var(--text-muted))' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Search Bar ═══ */}
      <div className="glass-card" style={{
        display:'flex', alignItems:'center', gap:12, padding:'14px 20px',
        borderRadius:14, marginBottom:28,
      }}>
        <Search style={{ width:18, height:18, color:'rgb(var(--text-muted))', flexShrink:0 }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveSection(null); }}
          placeholder={`Search ${totalArticles} articles across ${DOCS.length} modules...`}
          style={{
            flex:1, background:'transparent', border:'none', outline:'none',
            fontSize:14, color:'rgb(var(--text-primary))',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            width:24, height:24, borderRadius:8, border:'none', cursor:'pointer',
            background:'rgba(var(--border),0.5)', color:'rgb(var(--text-muted))',
          }}>
            <X style={{ width:12, height:12 }} />
          </button>
        )}
      </div>

      {/* ═══ Search Results ═══ */}
      {filtered && (
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'rgb(var(--text-muted))', marginBottom:12 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{search}&quot;
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(a => {
              const Icon = a.icon;
              return (
                <div key={a.title + a.section} className="glass-card shimmer-hover" style={{
                  display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
                  borderRadius:12, cursor:'pointer', borderLeft:`3px solid ${a.color}`,
                }}>
                  <div style={{
                    width:34, height:34, borderRadius:10, background:`${a.color}15`,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <Icon style={{ width:16, height:16, color: a.color }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:'rgb(var(--text-primary))' }}>{a.title}</span>
                      {(a as any).tag && (
                        <span style={{
                          fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6,
                          background: TAG_COLORS[(a as any).tag]?.bg, color: TAG_COLORS[(a as any).tag]?.text,
                        }}>{(a as any).tag}</span>
                      )}
                    </div>
                    <p style={{ fontSize:12, color:'rgb(var(--text-muted))', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.section} · {a.desc}
                    </p>
                  </div>
                  <ArrowRight style={{ width:14, height:14, color:'rgb(var(--text-muted))', flexShrink:0 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Module Grid + Detail Panel ═══ */}
      {!filtered && (
        <div style={{ display:'flex', gap:24 }}>
          {/* Left: Grid */}
          <div style={{ flex: activeSection ? '0 0 340px' : '1', transition:'flex 300ms ease' }}>
            <div style={{
              display:'grid',
              gridTemplateColumns: activeSection ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap:10,
            }}>
              {DOCS.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.section;
                return (
                  <div
                    key={section.section}
                    onClick={() => setActiveSection(isActive ? null : section.section)}
                    className="shimmer-hover"
                    style={{
                      borderRadius:14, padding:'18px 20px', cursor:'pointer',
                      background: isActive ? `${section.color}10` : 'rgb(var(--surface))',
                      border: `1px solid ${isActive ? section.color + '40' : 'rgb(var(--border))'}`,
                      transition:'all 200ms ease',
                      position:'relative', overflow:'hidden',
                    }}
                  >
                    {/* Top color line */}
                    <div style={{
                      position:'absolute', top:0, left:0, right:0, height:3,
                      background: section.gradient, opacity: isActive ? 1 : 0,
                      transition:'opacity 200ms',
                    }} />

                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{
                        width:40, height:40, borderRadius:12,
                        background: isActive ? section.gradient : `${section.color}12`,
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                        transition:'all 200ms',
                      }}>
                        <Icon style={{ width:18, height:18, color: isActive ? '#fff' : section.color }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:14, fontWeight:700, color:'rgb(var(--text-primary))' }}>
                            {section.section}
                          </span>
                          <span style={{
                            fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6,
                            background:`${section.color}15`, color: section.color,
                          }}>
                            {section.articles.length}
                          </span>
                        </div>
                        {!activeSection && (
                          <p style={{ fontSize:11, color:'rgb(var(--text-muted))', margin:'3px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {section.articles.map(a => a.title).join(' · ')}
                          </p>
                        )}
                      </div>
                      <ChevronRight style={{
                        width:15, height:15, color:'rgb(var(--text-muted))', flexShrink:0,
                        transition:'transform 200ms',
                        transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detail panel */}
          {activeDocs && (
            <div style={{
              flex:1, borderRadius:16, padding:'24px 28px',
              background:'rgb(var(--surface))',
              border:'1px solid rgb(var(--border))',
              animation:'fadeInDown 300ms ease',
            }}>
              {/* Panel header */}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:16, borderBottom:'1px solid rgba(var(--border),0.6)' }}>
                <div style={{
                  width:46, height:46, borderRadius:14,
                  background: activeDocs.gradient,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <activeDocs.icon style={{ width:22, height:22, color:'#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:'rgb(var(--text-primary))', margin:0, letterSpacing:'-0.01em' }}>
                    {activeDocs.section}
                  </h2>
                  <p style={{ fontSize:12, color:'rgb(var(--text-muted))', margin:'2px 0 0' }}>
                    {activeDocs.articles.length} article{activeDocs.articles.length !== 1 ? 's' : ''} in this module
                  </p>
                </div>
              </div>

              {/* Articles list */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {activeDocs.articles.map((article, i) => (
                  <div
                    key={article.title}
                    className="shimmer-hover"
                    style={{
                      display:'flex', alignItems:'flex-start', gap:14,
                      padding:'16px 18px', borderRadius:12,
                      border:'1px solid rgba(var(--border),0.5)',
                      cursor:'pointer', transition:'all 200ms',
                      animation:`fadeInDown 300ms ease ${i * 60}ms both`,
                    }}
                  >
                    <div style={{
                      width:28, height:28, borderRadius:8, flexShrink:0,
                      background:`${activeDocs.color}12`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700, color: activeDocs.color,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14, fontWeight:600, color:'rgb(var(--text-primary))' }}>{article.title}</span>
                        {(article as any).tag && (
                          <span style={{
                            fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:5, textTransform:'uppercase', letterSpacing:'0.05em',
                            background: TAG_COLORS[(article as any).tag]?.bg, color: TAG_COLORS[(article as any).tag]?.text,
                          }}>{(article as any).tag}</span>
                        )}
                      </div>
                      <p style={{ fontSize:12, color:'rgb(var(--text-secondary))', margin:'4px 0 0', lineHeight:1.5 }}>{article.desc}</p>
                    </div>
                    <ArrowRight style={{ width:14, height:14, color:'rgb(var(--text-muted))', flexShrink:0, marginTop:2 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Footer CTA ═══ */}
      <div style={{
        marginTop:32, borderRadius:16, padding:'22px 28px',
        background:'linear-gradient(135deg, rgba(var(--primary),0.06) 0%, rgba(139,92,246,0.04) 100%)',
        border:'1px solid rgba(var(--primary),0.12)',
        display:'flex', alignItems:'center', gap:16, flexWrap:'wrap',
      }}>
        <div style={{
          width:44, height:44, borderRadius:12,
          background:'linear-gradient(135deg, rgb(var(--primary)), rgba(139,92,246,0.9))',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <ExternalLink style={{ width:20, height:20, color:'#fff' }} />
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:700, color:'rgb(var(--text-primary))', margin:0 }}>Full Documentation Site</p>
          <p style={{ fontSize:12, color:'rgb(var(--text-secondary))', marginTop:2 }}>Complete API reference, tutorials, and deployment guides</p>
        </div>
        <a href="https://docs.cortexo.io" target="_blank" rel="noopener"
          style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'12px 24px', borderRadius:12,
            fontSize:13, fontWeight:700, color:'#fff',
            background:'linear-gradient(135deg, rgb(var(--primary)), rgba(139,92,246,0.9))',
            textDecoration:'none', flexShrink:0,
            boxShadow:'0 4px 14px -3px rgba(var(--primary),0.4)',
          }}>
          Visit docs.cortexo.io <ArrowRight style={{ width:14, height:14 }} />
        </a>
      </div>
    </div>
  );
}
