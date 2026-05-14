'use client';

import {
  FolderGit2, Rocket, Server as ServerIcon, Bug, Activity, Shield, ArrowRight, Zap, TrendingUp
} from 'lucide-react';
import { AuditLog, Deployment, Project, Server, TrackedError, api } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';

import { useState, useEffect, useMemo } from 'react';

export default function DashboardPage() {
  const { data: projects }    = useCortexoQuery(['projects'],    () => api.getProjects());
  const { data: deployments } = useCortexoQuery(['deployments'],  () => api.getDeployments());
  const { data: errors }      = useCortexoQuery(['errors'],       () => api.getErrors());
  const { data: servers }     = useCortexoQuery(['servers'],      () => api.getServers());


  const [userName, setUserName] = useState('Engineer');
  useEffect(() => {
    api.getMe().then(res => {
      if (res?.data?.user?.name) setUserName(res.data.user.name.split(' ')[0]);
    }).catch(() => { /* fallback */ });
  }, []);

  const projectCount = (projects || []).length;
  const deployCount = (deployments || []).length;
  const activeServers = (servers || []).filter((s: Server) => s.status === 'active').length;
  const totalServers = (servers || []).length;
  const errorCount = (errors || []).filter((e: TrackedError) => e.status === 'unresolved').length;
  const resolvedCount = (errors || []).filter((e: TrackedError) => e.status === 'resolved').length;

  // Compute trends from real data
  const projectTrend = projectCount > 0 ? `${projectCount} total` : 'No projects';
  const deployTrend = deployCount > 0 ? `${deployCount} total` : 'No deploys';
  const serverTrend = totalServers > 0 ? `${activeServers} active` : 'None configured';
  const errorTrend = errorCount > 0
    ? `${resolvedCount} resolved`
    : resolvedCount > 0 ? 'All clear' : 'No errors';

  // Build 7-day deployment activity chart from real data
  const chartData = useMemo(() => {
    const allDeploys = deployments || [];
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: number[] = [];
    const labels: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const count = allDeploys.filter((dep: any) => {
        const t = new Date(dep.createdAt).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      }).length;
      counts.push(count);
      labels.push(days[d.getDay()]);
    }
    return { counts, labels };
  }, [deployments]);

  // Generate SVG path from chart data
  const chartPath = useMemo(() => {
    const { counts } = chartData;
    const maxVal = Math.max(...counts, 1);
    const w = 800, h = 220, padding = 10;
    const points = counts.map((v, i) => ({
      x: padding + (i / (counts.length - 1)) * (w - padding * 2),
      y: h - padding - (v / maxVal) * (h - padding * 2),
    }));

    if (points.length < 2) return { line: '', area: '', dots: [] };

    // Build smooth curve
    let line = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpx = (points[i].x + points[i + 1].x) / 2;
      line += ` C${cpx},${points[i].y} ${cpx},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
    }

    const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

    return { line, area, dots: points };
  }, [chartData]);

  return (
    <div className="cx-flex-col cx-gap-24">
      {/* Welcome Header */}
      <div>
        <h1 className="cx-fw-700 cx-text-primary" style={{ fontSize: '24px', margin: 0 }}>
          Welcome back, {userName}
        </h1>
        <p className="cx-text-secondary" style={{ fontSize: '14px', marginTop: '4px' }}>
          Here's what's happening across your infrastructure today.
        </p>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard title="Projects" value={String(projectCount)} trend={projectTrend} color="#10B981" icon={FolderGit2} bg="rgba(16,185,129,0.1)" />
        <StatCard title="Total Deployments" value={String(deployCount)} trend={deployTrend} color="#8B5CF6" icon={Rocket} bg="rgba(139,92,246,0.1)" />
        <StatCard title="Active Servers" value={String(activeServers)} trend={serverTrend} color="#3B82F6" icon={ServerIcon} bg="rgba(59,130,246,0.1)" />
        <StatCard title="Open Bugs" value={String(errorCount)} trend={errorTrend} color="#F59E0B" icon={Bug} bg="rgba(245,158,11,0.1)" />
      </div>

      {/* Main Layout: Chart & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Chart Area */}
        <div className="cx-card cx-border" style={{ padding: '24px', position: 'relative' }}>
          <div className="cx-flex-between cx-mb-24">
            <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Deployment Activity (7 Days)</h2>
            <span className="cx-fw-600" style={{ fontSize: '12px', color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
              {chartData.counts.reduce((a, b) => a + b, 0)} deploys
            </span>
          </div>
          <div style={{ height: '240px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 800 240" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </linearGradient>
              </defs>
              {chartPath.area && <path d={chartPath.area} fill="url(#chartGradient)" />}
              {chartPath.line && <path d={chartPath.line} fill="none" stroke="#8B5CF6" strokeWidth="3" />}
              {chartPath.dots.map((dot, i) => (
                <circle key={i} cx={dot.x} cy={dot.y} r="4" fill="#8B5CF6" />
              ))}
            </svg>
            <div className="cx-flex-between cx-text-muted cx-fw-500" style={{ marginTop: '16px', fontSize: '11px', textTransform: 'uppercase' }}>
              {chartData.labels.map((label, i) => (
                <span key={i} className="cx-flex-col cx-flex-center cx-gap-2">
                  {label}
                  <span className="cx-fw-600 cx-text-primary cx-text-10">{chartData.counts[i]}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <div className="cx-flex-between cx-mb-24">
            <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: 0 }}>Recent Activity</h2>
            <a href="/audit-log" className="cx-fw-600 cx-text-accent" style={{ fontSize: '12px', textDecoration: 'none' }}>View All →</a>
          </div>
          <div className="cx-flex-col cx-gap-20">
            {(deployments || []).slice(0, 5).map((d: any, i: number) => (
              <ActivityRow key={d.id || i} iconColor={d.status === 'success' ? '#10B981' : d.status === 'failed' ? '#EF4444' : '#3B82F6'} title={`Deploy #${d.id?.toString().substring(0, 6)} → ${d.environment || 'prod'}`} time={d.createdAt ? new Date(d.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '—'} />
            ))}
            {(deployments || []).length === 0 && (
              <span className="cx-text-13 cx-text-muted">No recent activity</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Layout: Quick Actions & Server Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Quick Actions */}
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 24px 0' }}>Quick Actions</h2>
          <div className="cx-grid-4">
            <QuickActionBtn title="New Deploy" icon={Rocket} bgColor="#7C3AED" href="/deployments" />
            <QuickActionBtn title="Add Project" icon={FolderGit2} bgColor="#3B82F6" href="/projects" />
            <QuickActionBtn title="Add Server" icon={ServerIcon} bgColor="#10B981" href="/servers" />
            <QuickActionBtn title="Run Scan" icon={Shield} bgColor="#F59E0B" href="/scans" />
          </div>
        </div>

        {/* Server Health */}
        <div className="cx-card cx-border" style={{ padding: '24px' }}>
          <h2 className="cx-fw-600 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 24px 0' }}>Server Health</h2>
          <div className="cx-flex-col cx-gap-16">
            {(servers || []).slice(0, 7).map((s: any, i: number) => (
              <ServerHealthRow key={s.id || i} name={s.name} ip={s.privateIp} color={s.status === 'active' ? '#10B981' : '#EF4444'} status={s.status === 'active' ? 'Online' : 'Offline'} />
            ))}
            {(servers || []).length === 0 && (
              <span className="cx-text-13 cx-text-muted">No servers configured</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, color, icon: Icon, bg }: { title: string; value: string; trend: string; color: string; icon: any; bg: string }) {
  return (
    <div className="cx-card cx-border cx-flex-col" style={{ borderRadius: '14px', padding: '24px', gap: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }} />
      <div className="cx-flex-between">
        <span className="cx-fw-600 cx-text-secondary cx-text-13">{title}</span>
        <div className="cx-flex-center cx-r-10" style={{ width: '36px', height: '36px', backgroundColor: bg }}>
          <Icon style={{ width: '18px', height: '18px', color }} />
        </div>
      </div>
      <div className="cx-flex cx-items-center cx-gap-12">
        <span className="cx-fw-700 cx-text-primary" style={{ fontSize: '32px', lineHeight: 1 }}>{value}</span>
        <span className="cx-fw-600 cx-text-muted cx-text-12" style={{ backgroundColor: 'rgba(var(--text-muted), 0.08)', padding: '4px 8px', borderRadius: '12px' }}>{trend}</span>
      </div>
    </div>
  );
}

function ActivityRow({ iconColor, title, time }: { iconColor: string; title: string; time: string }) {
  return (
    <div className="cx-flex-between">
      <div className="cx-flex cx-items-center cx-gap-12">
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: iconColor }} />
        <span className="cx-text-primary cx-fw-500 cx-text-14">{title}</span>
      </div>
      <span className="cx-text-12 cx-text-muted">{time}</span>
    </div>
  );
}

function QuickActionBtn({ title, icon: Icon, bgColor, href }: { title: string; icon: any; bgColor: string; href: string }) {
  return (
    <a href={href} className="cx-flex-col cx-flex-center cx-r-12" style={{ backgroundColor: bgColor, padding: '24px 16px', gap: '12px', textDecoration: 'none', color: '#fff', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      <Icon style={{ width: '24px', height: '24px' }} />
      <span className="cx-fw-600 cx-text-14">{title}</span>
    </a>
  );
}

function ServerHealthRow({ name, ip, color, status }: { name: string; ip?: string; color: string; status: string }) {
  return (
    <div className="cx-flex-between">
      <div className="cx-flex cx-items-center cx-gap-12">
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
        <div className="cx-flex-col">
          <span className="cx-text-primary cx-fw-500 cx-text-14">{name}</span>
          {ip && <span className="cx-text-muted cx-mono cx-text-11">{ip}</span>}
        </div>
      </div>
      <span className="cx-fw-600 cx-mono cx-text-12" style={{ color }}>{status}</span>
    </div>
  );
}
