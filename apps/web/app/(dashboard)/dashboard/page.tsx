'use client';

import {
  Activity, Rocket, Bug, Brain, FolderGit2, ArrowRight,
  Sparkles, GitBranch, CheckCircle, XCircle, Loader2, Clock,
  TrendingUp, Shield, Zap, Server,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useProjectLookup, useAutoLoadToken, resolveProjectName, timeAgo, formatDuration } from '@/lib/hooks';

const statusIcon: Record<string, { icon: typeof CheckCircle; color: string }> = {
  success: { icon: CheckCircle, color: '#10B981' },
  failed: { icon: XCircle, color: '#EF4444' },
  deploying: { icon: Loader2, color: '#3B82F6' },
  running: { icon: Loader2, color: '#3B82F6' },
  pending: { icon: Clock, color: '#F59E0B' },
};

/* ─── inline style objects ─── */
const cardBase: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  overflow: 'hidden',
};

export default function DashboardPage() {
  useAutoLoadToken();
  const { lookup } = useProjectLookup();
  const { data: projects } = useApiData(() => api.getProjects());
  const { data: deployments } = useApiData(() => api.getDeployments());
  const { data: errors } = useApiData(() => api.getErrors());
  const { data: targets } = useApiData(() => api.getDeployTargets());

  const projectCount = (projects || []).length;
  const avgHealth = projectCount > 0
    ? Math.round((projects || []).reduce((s: number, p: any) => s + (p.healthScore || 100), 0) / projectCount)
    : 0;
  const deployCount = (deployments || []).length;
  const errorCount = (errors || []).filter((e: any) => e.status === 'unresolved').length;

  const recentDeploys = (deployments || []).slice(0, 5).map((d: any) => ({
    id: d.id,
    type: 'deploy',
    status: d.status,
    title: `${resolveProjectName(d.projectId, lookup)} deployed to ${d.environment}`,
    time: timeAgo(d.createdAt),
    branch: d.branch || '—',
    commit: d.commitSha || '—',
  }));

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Welcome Banner ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(var(--primary), 0.18) 0%, rgba(var(--agent), 0.12) 50%, rgba(var(--primary), 0.06) 100%)',
          border: '1px solid rgba(var(--primary), 0.25)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(var(--primary), 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
              Welcome back, LMX 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
              Here&apos;s what&apos;s happening across your {projectCount} projects today.
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#10B981',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse-live 2s ease-in-out infinite' }} />
            All Systems Online
          </div>
        </div>
      </div>

      {/* ─── Stat Cards (2x2 on small, 4-col on large) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <StatCard label="Health Score" value={String(avgHealth)} suffix="/100" icon={Shield} color="#10B981" />
        <StatCard label="Deployments" value={String(deployCount)} icon={Rocket} color="#818CF8" />
        <StatCard label="Unresolved Errors" value={String(errorCount)} icon={Bug} color="#EF4444" />
        <StatCard label="Agent Score" value="—" icon={Brain} color="#A78BFA" subtitle="Phase 5" />
      </div>

      {/* ─── Main Content Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
      }}>
        {/* On large screens: 2-col layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          gap: '20px',
        }}>
          {/* Recent Activity */}
          <div style={cardBase}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgb(var(--border))',
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
                Recent Activity
              </h2>
              <a href="/deployments" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'rgb(var(--primary))', textDecoration: 'none' }}>
                View all <ArrowRight style={{ width: '12px', height: '12px' }} />
              </a>
            </div>
            <div>
              {recentDeploys.map((item: any) => {
                const st = statusIcon[item.status] || statusIcon.success;
                const Icon = st.icon;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(var(--border), 0.5)',
                      transition: 'background-color 200ms',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{
                      width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '10px',
                      backgroundColor: `${st.color}15`,
                      flexShrink: 0,
                    }}>
                      <Icon
                        style={{
                          width: '16px', height: '16px', color: st.color,
                          animation: item.status === 'running' || item.status === 'deploying' ? 'spin 1s linear infinite' : 'none',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgb(var(--text-muted))', marginTop: '3px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <GitBranch style={{ width: '11px', height: '11px' }} />{item.branch}
                        </span>
                        <span>•</span>
                        <code style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--primary))' }}>{item.commit}</code>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.time}</span>
                  </div>
                );
              })}
              {recentDeploys.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '48px 20px', textAlign: 'center' }}>
                  <Rocket style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', opacity: 0.4 }} />
                  <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions + Deploy Targets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Actions */}
            <div style={{ ...cardBase, padding: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 14px 0' }}>
                Quick Actions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <QuickAction icon={Rocket} label="Deploy to Production" href="/deployments" color="#818CF8" />
                <QuickAction icon={GitBranch} label="Run Pipeline" href="/pipelines" color="#10B981" />
                <QuickAction icon={Bug} label="View Latest Errors" href="/errors" color="#EF4444" />
                <QuickAction icon={FolderGit2} label="Connect New Repo" href="/projects" color="#A78BFA" />
              </div>
            </div>

            {/* Deploy Targets */}
            <div style={{ ...cardBase, padding: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 14px 0' }}>
                Deploy Targets
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(targets || []).map((t: any) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: t.isActive ? '#10B981' : '#6B7280',
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'rgb(var(--text-muted))', flexShrink: 0 }}>
                      {t.host}
                    </span>
                  </div>
                ))}
                {(targets || []).length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgb(var(--text-muted))' }}>
                    <Server style={{ width: '14px', height: '14px', opacity: 0.5 }} />
                    No deploy targets configured
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row: Active Alerts + Agent Activity ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}>
          {/* Active Alerts */}
          <div style={cardBase}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))',
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                Active Alerts
              </h2>
              <span style={{ fontSize: '11px', fontWeight: 600, borderRadius: '9999px', padding: '2px 10px', backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                {errorCount > 0 ? errorCount : 0}
              </span>
            </div>
            <div style={{ padding: '0' }}>
              {errorCount > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px', borderBottom: '1px solid rgba(var(--border), 0.5)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', margin: 0 }}>
                        Error spike detected
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                        {errorCount} unresolved errors across projects
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', margin: 0 }}>
                        Slow response detected
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                        API latency &gt; 2s on recent deploys
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px 20px', textAlign: 'center' }}>
                  <CheckCircle style={{ width: '28px', height: '28px', color: '#10B981', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No active alerts — all clear ✅</p>
                </div>
              )}
            </div>
          </div>

          {/* Agent Activity */}
          <div style={cardBase}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))',
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain style={{ width: '14px', height: '14px', color: '#A78BFA' }} />
                Agent Activity
              </h2>
              <a href="/agent/performance" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'rgb(var(--primary))', textDecoration: 'none' }}>
                View all <ArrowRight style={{ width: '12px', height: '12px' }} />
              </a>
            </div>
            <div style={{ padding: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid rgba(var(--border), 0.5)' }}>
                <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: 'rgba(167,139,250,0.12)', flexShrink: 0 }}>
                  <Sparkles style={{ width: '14px', height: '14px', color: '#A78BFA' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', margin: 0 }}>
                    Code review completed
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                    Score: 92/100 • PSR-12 compliant
                  </p>
                </div>
                <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>2m ago</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px' }}>
                <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: 'rgba(59,130,246,0.12)', flexShrink: 0 }}>
                  <Activity style={{ width: '14px', height: '14px', color: '#3B82F6' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))', margin: 0 }}>
                    Root cause analyzing...
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '2px 0 0' }}>
                    Error #142 • booking API
                  </p>
                </div>
                <Loader2 style={{ width: '14px', height: '14px', color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── StatCard ─── */
function StatCard({ label, value, suffix, icon: Icon, color, trend, trendGood, subtitle }: {
  label: string; value: string; suffix?: string; icon: typeof Activity; color: string;
  trend?: string; trendGood?: boolean; subtitle?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderRadius: '14px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 200ms, transform 200ms',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 24px -4px ${color}25`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Colored top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>
          {label}
        </p>
        <div style={{
          width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '10px',
          backgroundColor: `${color}12`,
          flexShrink: 0,
        }}>
          <Icon style={{ width: '16px', height: '16px', color }} />
        </div>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <p style={{ fontSize: '28px', fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
        {suffix && <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-muted))' }}>{suffix}</span>}
      </div>
      {trend && (
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp style={{ width: '12px', height: '12px', color: '#10B981' }} />
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#10B981' }}>{trend} from yesterday</span>
        </div>
      )}
      {subtitle && (
        <p style={{ marginTop: '6px', fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '6px 0 0 0' }}>{subtitle}</p>
      )}
    </div>
  );
}

/* ─── QuickAction ─── */
function QuickAction({ icon: Icon, label, href, color }: {
  icon: typeof Rocket; label: string; href: string; color: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '10px',
        textDecoration: 'none',
        transition: 'background-color 200ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--surface-hover))'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <div style={{
        width: '34px', height: '34px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '10px',
        backgroundColor: `${color}12`,
        flexShrink: 0,
      }}>
        <Icon style={{ width: '16px', height: '16px', color }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>{label}</span>
      <ArrowRight style={{ width: '14px', height: '14px', color: 'rgb(var(--text-muted))', marginLeft: 'auto', flexShrink: 0 }} />
    </a>
  );
}
