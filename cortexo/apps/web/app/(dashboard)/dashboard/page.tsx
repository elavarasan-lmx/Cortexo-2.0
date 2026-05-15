'use client';

import {
  FolderGit2, Rocket, Server as ServerIcon, Bug, Shield, SearchCode, FileBarChart, Bell, Search, Cpu, X, Loader2, Zap, Clock, CheckCircle, AlertTriangle, Activity, GitCommit, UserCheck, RefreshCw, TrendingUp, Timer,
} from 'lucide-react';
import { Deployment, Project, Server, TrackedError, JudgeAggregateStats, Notification, api } from '@/lib/api';
import { useCortexoQuery, useQueryClient } from '@/lib/hooks';
import Link from 'next/link';

import { useCountUp } from '@/hooks/useCountUp';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/* ─── Skeleton Components ─── */
function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`cx-skeleton ${className || ''}`} style={{ ...style }} />
  );
}



function StatCardSkeleton() {
  return (
    <div className="cx-card cx-border cx-flex-col" style={{ borderRadius: '14px', padding: '24px', gap: '16px' }}>
      <div className="cx-flex-between">
        <Skeleton style={{ width: '80px', height: '14px' }} />
        <Skeleton style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
      </div>
      <div className="cx-flex cx-items-center cx-gap-12">
        <Skeleton style={{ width: '60px', height: '32px' }} />
        <Skeleton style={{ width: '60px', height: '20px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="cx-card cx-border" style={{ padding: '24px' }}>
      <div className="cx-flex-between cx-mb-24">
        <Skeleton style={{ width: '180px', height: '16px' }} />
        <Skeleton style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
      </div>
      <Skeleton style={{ height: '240px' }} />
    </div>
  );
}

type DateRange = '7d' | '30d' | '90d';

interface ChartTooltip {
  show: boolean;
  x: number;
  y: number;
  value: number;
  label: string;
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [chartTooltip, setChartTooltip] = useState<ChartTooltip>({ show: false, x: 0, y: 0, value: 0, label: '' });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getDateFilter = useCallback(() => {
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }, [dateRange]);

  const dateFilter = getDateFilter();

  // Data fetching
  const { data: projects, isLoading: projectsLoading } = useCortexoQuery(['projects'], () => api.getProjects(), { staleTime: 0, refetchOnMount: true });
  const { data: deployments, isLoading: deploymentsLoading, refetch: refetchDeployments } = useCortexoQuery(['deployments'], () => api.getDeployments(), { staleTime: 0, refetchOnMount: true });
  const { data: errors, isLoading: errorsLoading } = useCortexoQuery(['errors'], () => api.getErrors(), { staleTime: 0, refetchOnMount: true });
  const { data: servers, isLoading: serversLoading } = useCortexoQuery(['servers'], () => api.getServers(), { staleTime: 0, refetchOnMount: true });
  const { data: judgeStatsRaw, isLoading: judgeLoading } = useCortexoQuery(['judge-stats'], () => api.getJudgeAggregateStats(), { staleTime: 0, refetchOnMount: true });
  const { data: notifications, isLoading: notificationsLoading } = useCortexoQuery(['notifications'], () => api.getNotifications(), { staleTime: 0, refetchOnMount: true });
  const { data: serverResources } = useCortexoQuery(['server-resources'], () => api.getServerResourcesLatest(), { staleTime: 0, refetchOnMount: true });

  // Update last refresh time
  useEffect(() => {
    if (!projectsLoading && !deploymentsLoading) setLastUpdated(new Date());
  }, [projectsLoading, deploymentsLoading]);

  // Real-time polling (30s)
  const queryClient = useQueryClient();
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['server-resources'] });
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Filter data by date range
  const filteredDeployments = useMemo(() => {
    if (!deployments) return [];
    return deployments.filter((d: Deployment) => new Date(d.createdAt) >= dateFilter);
  }, [deployments, dateFilter]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p: Project) => new Date(p.createdAt) >= dateFilter);
  }, [projects, dateFilter]);

  // Search filtering
  const searchFilteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects || [];
    const q = searchQuery.toLowerCase();
    return (projects || []).filter((p: Project) =>
      p.name?.toLowerCase().includes(q) || p.stack?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const searchFilteredDeployments = useMemo(() => {
    if (!searchQuery.trim()) return filteredDeployments;
    const q = searchQuery.toLowerCase();
    return filteredDeployments.filter((d: Deployment) =>
      d.environment?.toLowerCase().includes(q) || d.id?.toString().includes(q)
    );
  }, [filteredDeployments, searchQuery]);

  // Stats calculations
  const [userName, setUserName] = useState('Engineer');
  useEffect(() => {
    api.getMe().then(res => {
      if (res?.data?.user?.name) setUserName(res.data.user.name.split(' ')[0]);
    }).catch(() => { /* fallback */ });
  }, []);

  const projectCount = searchFilteredProjects.length;
  const deployCount = searchFilteredDeployments.length;
  const activeServers = (servers || []).filter((s: Server) => s.status === 'active').length;
  const totalServers = (servers || []).length;
  const offlineServers = (servers || []).filter((s: Server) => s.status === 'offline').length;
  const errorCount = (errors || []).filter((e: TrackedError) => e.status === 'unresolved').length;
  const resolvedCount = (errors || []).filter((e: TrackedError) => e.status === 'resolved').length;

  // Success rate
  const successCount = (filteredDeployments || []).filter((d: Deployment) => d.status === 'success').length;
  const successRate = deployCount > 0 ? Math.round((successCount / deployCount) * 100) : 100;

  // Avg deploy time (mock for now - would need actual timing data)
  const avgDeployTime = '2.4m';

  // Uptime calculation
  const serverUptime = totalServers > 0 ? Math.round((activeServers / totalServers) * 100) : 100;

  // Environment breakdown
  const envBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    (filteredDeployments || []).forEach((d: Deployment) => {
      const env = d.environment || 'unknown';
      counts[env] = (counts[env] || 0) + 1;
    });
    return counts;
  }, [filteredDeployments]);

  // Recent projects (last 4)
  const recentProjects = useMemo(() => searchFilteredProjects.slice(0, 4), [searchFilteredProjects]);

  // Unread notifications
  const unreadCount = (notifications || []).filter((n: Notification) => !n.read).length;

  // Activity feed with icons
  const activityFeed = useMemo(() => {
    const items: { id: string; type: string; title: string; time: string; icon: any; color: string }[] = [];
    (deployments || []).slice(0, 10).forEach((d: Deployment) => {
      items.push({
        id: `deploy-${d.id}`,
        type: 'deploy',
        title: `Deploy #${String(d.id).substring(0, 6)} → ${d.environment || 'prod'}`,
        time: d.createdAt ? new Date(d.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '—',
        icon: d.status === 'success' ? CheckCircle : d.status === 'failed' ? AlertTriangle : Rocket,
        color: d.status === 'success' ? '#10B981' : d.status === 'failed' ? '#EF4444' : '#3B82F6',
      });
    });
    (errors || []).slice(0, 5).forEach((e: TrackedError) => {
      items.push({
        id: `error-${e.id}`,
        type: 'error',
        title: `Error: ${e.message?.substring(0, 40) || 'Unknown error'}`,
        time: e.firstSeenAt ? new Date(e.firstSeenAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '—',
        icon: Bug,
        color: '#EF4444',
      });
    });
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }, [deployments, errors]);

  const filteredActivity = activityFilter === 'all' ? activityFeed : activityFeed.filter(a => a.type === activityFilter);

  // Trends
  const projectTrend = projectCount > 0 ? `${projectCount} total` : 'No projects';
  const deployTrend = deployCount > 0 ? `${deployCount} total` : 'No deploys';
  const serverTrend = totalServers > 0 ? `${activeServers} active` : 'None configured';
  const errorTrend = errorCount > 0 ? `${resolvedCount} resolved` : resolvedCount > 0 ? 'All clear' : 'No errors';

  // Chart data
  const chartData = useMemo(() => {
    const allDeploys = filteredDeployments || [];
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: number[] = [];
    const labels: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const count = allDeploys.filter((dep: Deployment) => {
        const t = new Date(dep.createdAt).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      }).length;
      counts.push(count);
      labels.push(days[d.getDay()]);
    }
    return { counts, labels };
  }, [filteredDeployments]);

  // Chart path
  const chartPath = useMemo(() => {
    const { counts } = chartData;
    const maxVal = Math.max(...counts, 1);
    const w = 800, h = 220, padding = 10;
    const points = counts.map((v, i) => ({
      x: padding + (i / (counts.length - 1)) * (w - padding * 2),
      y: h - padding - (v / maxVal) * (h - padding * 2),
    }));

    if (points.length < 2) return { line: '', area: '', dots: [] };

    let line = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpx = (points[i].x + points[i + 1].x) / 2;
      line += ` C${cpx},${points[i].y} ${cpx},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
    }

    const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
    return { line, area, dots: points };
  }, [chartData]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Could navigate to search results page or filter locally
  };

  // Format last updated
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Loading...';
    return lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="cx-flex-col cx-gap-24 page-enter">
      {/* Header */}
      <div className="cx-flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="cx-fw-700 cx-text-primary" style={{ fontSize: '24px', margin: 0 }}>
            Welcome back, {userName}
          </h1>
          <p className="cx-text-secondary" style={{ fontSize: '14px', marginTop: '4px' }}>
            Here's what's happening across your infrastructure today.
          </p>
          {lastUpdated && (
            <p className="cx-text-muted" style={{ fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw style={{ width: '10px', height: '10px' }} />
              Last updated: {formatLastUpdated()}
            </p>
          )}
        </div>
        <div className="cx-flex cx-items-center cx-gap-12">
          {/* Search */}
            <div className="cx-search-wrap">
              <Search className="cx-search-icon" />
              <input
                type="text"
                className="cx-search-input"
                placeholder="Search projects, deploys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '220px' }}
              />
            </div>

          {/* Date Range */}
          <div className="cx-flex cx-items-center cx-gap-4" style={{
            backgroundColor: 'rgb(var(--surface-hover))', padding: '4px', borderRadius: '8px',
          }}>
            {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  backgroundColor: dateRange === range ? '#7C3AED' : 'transparent',
                  color: dateRange === range ? '#fff' : 'rgb(var(--text-muted))',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative', width: '40px', height: '40px', borderRadius: '8px',
              border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--bg-card))',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Bell style={{ width: '18px', height: '18px', color: 'rgb(var(--text-muted))' }} />
              {unreadCount > 0 && (
                <span className="cx-badge-unread" style={{
                  position: 'absolute', top: '-4px', right: '-4px', minWidth: '18px', height: '18px',
                  borderRadius: '9px', backgroundColor: '#EF4444', color: '#fff', fontSize: '10px',
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
          </button>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="cx-notification-dropdown" style={{
          position: 'absolute', top: '120px', right: '20px', width: '360px', maxHeight: '400px',
          overflowY: 'auto', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
          borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100, padding: '16px',
        }}>
          <div className="cx-flex-between cx-mb-16">
            <h3 className="cx-fw-600 cx-text-primary" style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
            <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '18px', height: '18px', color: 'rgb(var(--text-muted))' }} />
            </button>
          </div>
          {notificationsLoading ? (
            <div className="cx-flex-center" style={{ padding: '24px' }}>
              <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', color: '#7C3AED' }} />
            </div>
          ) : (notifications || []).length === 0 ? (
            <p className="cx-text-muted cx-text-14" style={{ textAlign: 'center', padding: '24px' }}>No notifications</p>
          ) : (
            <div className="cx-flex-col cx-gap-12">
              {(notifications as Notification[]).slice(0, 10).map((n) => (
                <div key={n.id} className="cx-flex cx-items-start cx-gap-12" style={{
                  padding: '12px', borderRadius: '8px',
                  backgroundColor: n.read ? 'transparent' : 'rgba(124,58,237,0.06)',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: n.read ? 'rgb(var(--border))' : '#7C3AED', marginTop: '6px', flexShrink: 0,
                  }} />
                  <div className="cx-flex-col cx-gap-4" style={{ flex: 1 }}>
                    <span className="cx-fw-600 cx-text-primary cx-text-13">{n.title}</span>
                    {n.message && <span className="cx-text-muted cx-text-12">{n.message}</span>}
                    <span className="cx-text-muted cx-text-11">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stat Cards Row - 6 cards with staggered entrance */}
      <div className="cx-stagger-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {projectsLoading || deploymentsLoading || serversLoading || errorsLoading ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Projects" value={String(projectCount)} trend={projectTrend} color="#10B981" icon={FolderGit2} bg="rgba(16,185,129,0.1)" />
            <StatCard title="Deployments" value={String(deployCount)} trend={deployTrend} color="#8B5CF6" icon={Rocket} bg="rgba(139,92,246,0.1)" />
            <StatCard title="Success Rate" value={`${successRate}%`} trend={successCount > 0 ? `${successCount} successful` : 'No data'} color="#10B981" icon={CheckCircle} bg="rgba(16,185,129,0.1)" />
            <StatCard title="Active Servers" value={String(activeServers)} trend={`${serverUptime}% uptime`} color="#3B82F6" icon={ServerIcon} bg="rgba(59,130,246,0.1)" />
            <StatCard title="Open Bugs" value={String(errorCount)} trend={errorTrend} color="#F59E0B" icon={Bug} bg="rgba(245,158,11,0.1)" urgency={errorCount > 5 ? 'high' : undefined} />
            <StatCard title="Avg Deploy" value={avgDeployTime} trend="Per deployment" color="#06B6D4" icon={Timer} bg="rgba(6,182,212,0.1)" />
          </>
        )}
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Chart + Environment */}
        <div className="cx-flex-col cx-gap-20">
          {deploymentsLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="cx-card cx-border" style={{ padding: '24px', position: 'relative' }}>
              <div className="cx-flex-between cx-mb-24">
                <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Deployment Activity (7 Days)</h2>
                <span className="cx-fw-600" style={{ fontSize: '12px', color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                  {chartData.counts.reduce((a, b) => a + b, 0)} deploys
                </span>
              </div>
              <div style={{ height: '240px', width: '100%', position: 'relative' }} onMouseLeave={() => setChartTooltip(t => ({ ...t, show: false }))}>
                <svg viewBox="0 0 800 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
                      <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                    </linearGradient>
                  </defs>
                  {chartPath.area && <path d={chartPath.area} fill="url(#chartGradient)" className="cx-chart-area" />}
                  {chartPath.line && (
                    <ChartLine d={chartPath.line} />
                  )}
                  {chartPath.dots.map((dot, i) => (
                    <circle
                      key={i}
                      cx={dot.x} cy={dot.y} r="4"
                      fill="#8B5CF6"
                      className="cx-chart-dot"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => {
                        setChartTooltip({ show: true, x: dot.x, y: dot.y - 40, value: chartData.counts[i], label: chartData.labels[i] });
                      }}
                    />
                  ))}
                </svg>
                {/* Tooltip */}
                {chartTooltip.show && (
                  <div style={{
                    position: 'absolute', left: `${(chartTooltip.x / 800) * 100}%`, top: chartTooltip.y,
                    transform: 'translateX(-50%)', backgroundColor: '#1f2937', color: '#fff',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}>
                    {chartTooltip.label}: {chartTooltip.value} deploys
                  </div>
                )}
              </div>
              <div className="cx-flex-between cx-text-muted cx-fw-500" style={{ marginTop: '16px', fontSize: '11px', textTransform: 'uppercase' }}>
                {chartData.labels.map((label, i) => (
                  <span key={i} className="cx-flex-col cx-flex-center cx-gap-2">
                    {label}
                    <span className="cx-fw-600 cx-text-primary cx-text-10">{chartData.counts[i]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Environment Breakdown */}
          {Object.keys(envBreakdown).length > 0 && (
            <div className="cx-card cx-border" style={{ padding: '20px' }}>
              <h3 className="cx-fw-600 cx-text-primary cx-text-14" style={{ margin: '0 0 16px 0' }}>Deployments by Environment</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {Object.entries(envBreakdown).map(([env, count]) => {
                  const colors: Record<string, string> = { production: '#10B981', staging: '#F59E0B', development: '#3B82F6', dev: '#3B82F6', prod: '#10B981', unknown: '#6B7280' };
                  return (
                    <div key={env} className="cx-flex cx-items-center cx-gap-8" style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: `${colors[env.toLowerCase()] || '#6B7280'}15` }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: colors[env.toLowerCase()] || '#6B7280' }} />
                      <span className="cx-fw-600 cx-text-primary cx-text-13" style={{ textTransform: 'capitalize' }}>{env}</span>
                      <span className="cx-text-muted cx-text-12">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity with Filters */}
        {deploymentsLoading ? <ChartSkeleton /> : (
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <div className="cx-flex-between cx-mb-16">
            <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Recent Activity</h2>
            <Link href="/audit-log" className="cx-fw-600 cx-text-accent" style={{ fontSize: '12px', textDecoration: 'none' }}>View All →</Link>
          </div>
          {/* Activity Filters */}
          <div className="cx-flex cx-gap-8 cx-mb-16" style={{ flexWrap: 'wrap' }}>
            {['all', 'deploy', 'error'].map(f => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none', fontSize: '11px',
                  backgroundColor: activityFilter === f ? '#7C3AED' : 'rgba(var(--border), 0.5)',
                  color: activityFilter === f ? '#fff' : 'rgb(var(--text-muted))', cursor: 'pointer',
                }}
              >
                {f === 'all' ? 'All' : f === 'deploy' ? 'Deploys' : 'Errors'}
              </button>
            ))}
          </div>
          <div className="cx-timeline cx-flex-col cx-gap-16">
            {filteredActivity.slice(0, 6).map((item) => (
              <ActivityRow key={item.id} icon={item.icon} iconColor={item.color} title={item.title} time={item.time} status={item.type === 'error' ? 'error' : item.color === '#10B981' ? 'success' : 'deploy'} />
            ))}
            {filteredActivity.length === 0 && (
              <span className="cx-text-13 cx-text-muted" style={{ textAlign: 'center', padding: '20px' }}>No activity</span>
            )}
          </div>
        </div>)}
      </div>

      {/* AI Quality Intelligence */}
      <AiQualityWidget stats={(judgeStatsRaw as any)?.data || judgeStatsRaw} />

      {/* Bottom Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* Quick Actions with Tooltips */}
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 24px 0' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <QuickActionBtn title="New Deploy" icon={Rocket} bgColor="#7C3AED" href="/deployments/new" tooltip="Create a new deployment" />
            <QuickActionBtn title="Add Project" icon={FolderGit2} bgColor="#3B82F6" href="/projects/new" tooltip="Add a new project" />
            <QuickActionBtn title="Add Server" icon={ServerIcon} bgColor="#10B981" href="/servers" tooltip="Register a new server" />
            <QuickActionBtn title="Security" icon={Shield} bgColor="#EF4444" href="/security" tooltip="View security dashboard" />
            <QuickActionBtn title="Code Audit" icon={SearchCode} bgColor="#F59E0B" href="/code-audit" tooltip="Run code analysis" />
            <QuickActionBtn title="Reports" icon={FileBarChart} bgColor="#06B6D4" href="/reports" tooltip="View reports" />
          </div>
        </div>

        {/* Server Resources with Health Status */}
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 20px 0' }}>Server Health</h2>
          {serversLoading ? (
            <div className="cx-flex-col cx-gap-16">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="cx-flex-col cx-gap-8">
                  <Skeleton style={{ width: '100px', height: '14px' }} />
                  <Skeleton style={{ height: '4px', borderRadius: '2px' }} />
                </div>
              ))}
            </div>
          ) : servers && servers.length > 0 ? (
            <div className="cx-flex-col cx-gap-14">
              <div className="cx-flex cx-gap-12" style={{ marginBottom: '8px' }}>
                <span className="cx-fw-600 cx-text-11" style={{ color: '#10B981' }}>{activeServers} Active</span>
                {offlineServers > 0 && (
                  <span className="cx-fw-600 cx-text-11" style={{ color: '#EF4444' }}>{offlineServers} Offline</span>
                )}
              </div>
              {(servers as Server[]).slice(0, 3).map((srv: Server) => {
                const sr = (serverResources || []).find((r: any) => r.serverId === srv.id);
                const cpu = Number(sr?.cpu) || 0;
                return (
                  <div key={srv.id} className="cx-flex-col cx-gap-6">
                    <div className="cx-flex-between">
                      <div className="cx-flex cx-items-center cx-gap-8">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                          backgroundColor: srv.status === 'active' ? '#10B981' : srv.status === 'warning' ? '#F59E0B' : '#EF4444',
                        }} />
                        <span className="cx-fw-500 cx-text-primary cx-text-13">{srv.name}</span>
                      </div>
                      <Link href={`/servers/${srv.id}`} className="cx-text-accent cx-text-11" style={{ textDecoration: 'none' }}>Details</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <ResourceBar label="CPU" value={cpu} color="#8B5CF6" />
                      <ResourceBar label="MEM" value={Number(sr?.memory) || 0} color="#3B82F6" />
                      <ResourceBar label="DISK" value={Number(sr?.disk) || 0} color="#10B981" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cx-flex-col cx-items-center cx-gap-8" style={{ padding: '20px 0' }}>
              <Cpu style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))' }} />
              <span className="cx-text-muted cx-text-13">No servers configured</span>
              <Link href="/servers" className="cx-btn-primary cx-fw-600" style={{ padding: '8px 16px', fontSize: '12px', textDecoration: 'none', marginTop: '8px' }}>
                Add Server
              </Link>
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 20px 0' }}>Recent Projects</h2>
          {projectsLoading ? (
            <div className="cx-flex-col cx-gap-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="cx-flex cx-items-center cx-gap-12" style={{ padding: '12px', borderRadius: '8px' }}>
                  <Skeleton style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                  <div className="cx-flex-col">
                    <Skeleton style={{ width: '100px', height: '14px' }} />
                    <Skeleton style={{ width: '60px', height: '10px', marginTop: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="cx-flex-col cx-gap-12">
              {recentProjects.map((p: Project) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="cx-flex cx-items-center cx-gap-12" style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(var(--surface-hover))', textDecoration: 'none' }}>
                  <div className="cx-flex-center" style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)' }}>
                    <FolderGit2 style={{ width: '18px', height: '18px', color: '#10B981' }} />
                  </div>
                  <div className="cx-flex-col">
                    <span className="cx-fw-600 cx-text-primary cx-text-13">{p.name}</span>
                    {p.stack && <span className="cx-text-muted cx-text-11">{p.stack}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="cx-flex-col cx-items-center cx-gap-8" style={{ padding: '20px 0' }}>
              <FolderGit2 style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))' }} />
              <span className="cx-text-muted cx-text-13">No projects yet</span>
              <Link href="/projects/new" className="cx-btn-primary cx-fw-600" style={{ padding: '8px 16px', fontSize: '12px', textDecoration: 'none', marginTop: '8px' }}>
                Create Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, color, icon: Icon, bg, urgency }: { title: string; value: string; trend: string; color: string; icon: any; bg: string; urgency?: string }) {
  const numericVal = parseInt(value) || 0;
  const displayValue = useCountUp(numericVal);
  const isNumeric = /^\d+$/.test(value);
  return (
    <div className="cx-card cx-border cx-flex-col" data-urgency={urgency} style={{ borderRadius: '14px', padding: '20px', gap: '12px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }} />
      <div className="cx-flex-between">
        <span className="cx-fw-600 cx-text-secondary cx-text-12">{title}</span>
        <div className="cx-flex-center cx-r-10" style={{ width: '32px', height: '32px', backgroundColor: bg }}>
          <Icon style={{ width: '16px', height: '16px', color }} />
        </div>
      </div>
      <div className="cx-flex cx-items-center cx-gap-10">
        <span className="cx-fw-700 cx-text-primary" style={{ fontSize: '28px', lineHeight: 1 }}>{isNumeric ? displayValue : value}</span>
        <span className="cx-fw-600 cx-text-muted cx-text-11" style={{ backgroundColor: 'rgba(var(--text-muted), 0.08)', padding: '3px 8px', borderRadius: '10px' }}>{trend}</span>
      </div>
    </div>
  );
}

function ActivityRow({ icon: Icon, iconColor, title, time, status }: { icon: any; iconColor: string; title: string; time: string; status?: string }) {
  return (
    <div className="cx-timeline-item cx-flex-between" data-status={status === 'error' ? 'error' : status === 'success' ? 'success' : undefined}>
      <div className="cx-flex cx-items-center cx-gap-10">
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: '14px', height: '14px', color: iconColor }} />
        </div>
        <span className="cx-text-primary cx-fw-500 cx-text-13" style={{ lineHeight: 1.3 }}>{title}</span>
      </div>
      <span className="cx-text-11 cx-text-muted">{time}</span>
    </div>
  );
}

function QuickActionBtn({ title, icon: Icon, bgColor, href, tooltip }: { title: string; icon: any; bgColor: string; href: string; tooltip: string }) {
  return (
    <Link href={href} className="cx-quick-action cx-flex-col cx-flex-center cx-r-12" title={tooltip} style={{ backgroundColor: bgColor, padding: '20px 12px', gap: '10px', textDecoration: 'none', color: '#fff', cursor: 'pointer' }}>
      <Icon style={{ width: '22px', height: '22px' }} />
      <span className="cx-fw-600 cx-text-12">{title}</span>
    </Link>
  );
}

function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  const barColor = value > 80 ? '#EF4444' : value > 60 ? '#F59E0B' : color;
  const severity = value > 80 ? 'critical' : value > 60 ? 'warning' : undefined;
  return (
    <div className="cx-flex-col cx-gap-2">
      <div className="cx-flex-between">
        <span className="cx-text-muted cx-text-9 cx-fw-500">{label}</span>
        <span className="cx-text-muted cx-text-9">{value.toFixed(0)}%</span>
      </div>
      <div style={{ height: '3px', borderRadius: '2px', backgroundColor: 'rgba(var(--text-muted), 0.1)', overflow: 'hidden' }}>
        <div
          className="cx-gauge-bar"
          data-severity={severity}
          style={{ height: '100%', borderRadius: '2px', backgroundColor: barColor, '--fill-pct': `${Math.min(value, 100)}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function ChartLine({ d }: { d: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke="#8B5CF6"
      strokeWidth="3"
      className="cx-chart-line"
      style={{ '--path-length': pathLength } as React.CSSProperties}
    />
  );
}

function AiQualityWidget({ stats }: { stats?: JudgeAggregateStats }) {
  if (!stats) return null;

  const trendColor = stats.trend?.direction === 'improving' ? '#10B981' : stats.trend?.direction === 'declining' ? '#EF4444' : '#F59E0B';
  const trendArrow = stats.trend?.direction === 'improving' ? '↑' : stats.trend?.direction === 'declining' ? '↓' : '→';

  const gradeEntries = Object.entries(stats.gradeDistribution || {});
  const total = gradeEntries.reduce((sum, [, v]) => sum + v, 0) || 1;
  const gradeColorMap: Record<string, string> = { A: '#10B981', 'A-': '#34D399', B: '#F59E0B', 'C+': '#F97316', C: '#EF4444', D: '#DC2626' };

  let accumulatedAngle = 0;
  const donutSegments = gradeEntries.map(([grade, count]) => {
    const angle = (count / total) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    const endAngle = accumulatedAngle;
    const largeArc = angle > 180 ? 1 : 0;
    const rad = (a: number) => (a - 90) * (Math.PI / 180);
    const cx = 60, cy = 60, r = 48;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    return { grade, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`, fill: gradeColorMap[grade] || '#6B7280' };
  });

  return (
    <div className="cx-card cx-border" style={{ padding: '24px', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6, #10B981)' }} />
      <div className="cx-flex-between cx-mb-24">
        <div className="cx-flex cx-items-center cx-gap-12">
          <div className="cx-flex-center cx-r-10" style={{ width: '36px', height: '36px', backgroundColor: 'rgba(139,92,246,0.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>AI Quality Intelligence</h2>
            <p className="cx-text-muted" style={{ fontSize: '11px', margin: '2px 0 0' }}>Powered by AI Judge — {stats.totalScored} evaluations</p>
          </div>
        </div>
        <div className="cx-flex cx-items-center cx-gap-6" style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: `${trendColor}15`, border: `1px solid ${trendColor}30` }}>
          <span style={{ color: trendColor, fontSize: '14px', fontWeight: 700 }}>{trendArrow}</span>
          <span className="cx-fw-600" style={{ fontSize: '11px', color: trendColor }}>
            {stats.trend?.direction === 'improving' ? 'Improving' : stats.trend?.direction === 'declining' ? 'Declining' : 'Stable'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="cx-flex-col cx-flex-center" style={{ gap: '8px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
              {donutSegments.map((seg, i) => (
                <path key={i} d={seg.d} fill={seg.fill} opacity="0.85" />
              ))}
              <circle cx="60" cy="60" r="30" fill="rgb(var(--bg-card))" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="cx-fw-700 cx-text-primary" style={{ fontSize: '22px', lineHeight: 1 }}>{Math.round(stats.averageScore)}</span>
              <span className="cx-text-muted" style={{ fontSize: '9px', fontWeight: 600 }}>AVG SCORE</span>
            </div>
          </div>
          <div className="cx-flex" style={{ flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {gradeEntries.map(([grade, count]) => (
              <span key={grade} className="cx-flex cx-items-center cx-gap-4" style={{ fontSize: '10px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: gradeColorMap[grade] || '#6B7280' }} />
                <span className="cx-text-muted cx-fw-600">{grade}: {count}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="cx-flex-col cx-gap-12">
          <h3 className="cx-fw-600 cx-text-secondary cx-text-12" style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>By Category</h3>
          {Object.entries(stats.byType || {}).map(([type, data]: [string, any]) => {
            const barColor = data.avgScore >= 80 ? '#10B981' : data.avgScore >= 60 ? '#F59E0B' : '#EF4444';
            return (
              <div key={type} className="cx-flex-col cx-gap-4">
                <div className="cx-flex-between">
                  <span className="cx-text-primary cx-fw-500 cx-text-12" style={{ textTransform: 'capitalize' }}>{type.replace('-', ' ')}</span>
                  <span className="cx-fw-600 cx-mono cx-text-11" style={{ color: barColor }}>{data.avgScore.toFixed(1)}</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(var(--text-muted), 0.1)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.avgScore}%`, borderRadius: '2px', backgroundColor: barColor, transition: 'width 600ms ease' }} />
                </div>
              </div>
            );
          })}
          <div className="cx-flex cx-gap-12" style={{ marginTop: '4px' }}>
            <div className="cx-flex-col" style={{ gap: '2px' }}>
              <span className="cx-text-muted cx-text-10 cx-fw-500">7d avg</span>
              <span className="cx-fw-700 cx-text-primary cx-text-14">{stats.trend?.last7d}</span>
            </div>
            <div className="cx-flex-col" style={{ gap: '2px' }}>
              <span className="cx-text-muted cx-text-10 cx-fw-500">30d avg</span>
              <span className="cx-fw-700 cx-text-primary cx-text-14">{stats.trend?.last30d}</span>
            </div>
            <div className="cx-flex-col" style={{ gap: '2px' }}>
              <span className="cx-text-muted cx-text-10 cx-fw-500">90d avg</span>
              <span className="cx-fw-700 cx-text-primary cx-text-14">{stats.trend?.last90d}</span>
            </div>
          </div>
        </div>

        <div className="cx-flex-col cx-gap-10">
          <h3 className="cx-fw-600 cx-text-secondary cx-text-12" style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Suggestions</h3>
          {(stats.topSuggestions || []).slice(0, 5).map((s: any, i: number) => (
            <div key={i} className="cx-flex cx-items-center cx-gap-8">
              <span className="cx-flex-center cx-fw-700" style={{ minWidth: '20px', height: '20px', borderRadius: '6px', backgroundColor: 'rgba(139,92,246,0.12)', color: '#8B5CF6', fontSize: '10px' }}>
                {s.occurrences}
              </span>
              <span className="cx-text-primary cx-text-12 cx-fw-500" style={{ lineHeight: 1.3 }}>{s.suggestion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}