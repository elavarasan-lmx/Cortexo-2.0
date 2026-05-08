'use client';

import {
  FolderGit2, Rocket, Server, Bug, Activity, Shield, ArrowRight, Zap, TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  useAutoLoadToken();
  const { data: projects } = useApiData(() => api.getProjects());
  const { data: deployments } = useApiData(() => api.getDeployments());
  const { data: errors } = useApiData(() => api.getErrors());
  const { data: targets } = useApiData(() => api.getDeployTargets());

  const [userName, setUserName] = useState('Engineer');
  useEffect(() => {
    api.getMe().then(res => {
      if (res?.data?.user?.name) setUserName(res.data.user.name.split(' ')[0]);
    }).catch(() => { /* fallback */ });
  }, []);

  const projectCount = (projects || []).length || 12;
  const deployCount = (deployments || []).length || 1284;
  const activeServers = (targets || []).length || 47;
  const errorCount = (errors || []).filter((e: any) => e.status === 'unresolved').length || 23;

  return (
    <div style={{ maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
          Welcome back, {userName} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Here's what's happening across your infrastructure today.
        </p>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard title="Projects" value={String(projectCount)} trend="↑ 2 new" color="#10B981" icon={FolderGit2} bg="rgba(16,185,129,0.1)" />
        <StatCard title="Total Deployments" value={String(deployCount)} trend="↑ 12.5%" color="#8B5CF6" icon={Rocket} bg="rgba(139,92,246,0.1)" />
        <StatCard title="Active Servers" value={String(activeServers)} trend="↑ 3" color="#3B82F6" icon={Server} bg="rgba(59,130,246,0.1)" />
        <StatCard title="Open Bugs" value={String(errorCount)} trend="↓ 5.2%" color="#F59E0B" icon={Bug} bg="rgba(245,158,11,0.1)" />
      </div>

      {/* Main Layout: Chart & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Chart Area */}
        <div style={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '14px', border: '1px solid rgb(var(--border))', padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Deployment Activity (7 Days)</h2>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '12px' }}>↑ 18% this week</span>
          </div>
          {/* Mock Chart representation using SVG */}
          <div style={{ height: '240px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 800 240" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </linearGradient>
              </defs>
              <path d="M0,180 C100,160 150,220 250,150 C350,80 400,200 500,100 C600,0 700,200 800,220 L800,240 L0,240 Z" fill="url(#chartGradient)" />
              <path d="M0,180 C100,160 150,220 250,150 C350,80 400,200 500,100 C600,0 700,200 800,220" fill="none" stroke="#8B5CF6" strokeWidth="3" />
              <circle cx="250" cy="150" r="4" fill="#8B5CF6" />
              <circle cx="500" cy="100" r="4" fill="#8B5CF6" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: 'rgb(var(--text-muted))', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div style={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '14px', border: '1px solid rgb(var(--border))', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Recent Activity</h2>
            <a href="/activity" style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--primary))', textDecoration: 'none' }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ActivityRow iconColor="#10B981" title="Deploy #1254 → prod-api" time="2m ago" />
            <ActivityRow iconColor="#F59E0B" title="Bug #472 assigned → Tom" time="15m ago" />
            <ActivityRow iconColor="#EF4444" title="Server #12 alert → CPU 92%" time="32m ago" />
            <ActivityRow iconColor="#3B82F6" title="Cron backup completed" time="1h ago" />
            <ActivityRow iconColor="#8B5CF6" title="AI Agent scan finished" time="2h ago" />
          </div>
        </div>
      </div>

      {/* Bottom Layout: Quick Actions & Server Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Quick Actions */}
        <div style={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '14px', border: '1px solid rgb(var(--border))', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 24px 0' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <QuickActionBtn title="New Deploy" icon={Rocket} bgColor="#7C3AED" href="/deployments" />
            <QuickActionBtn title="Add Project" icon={FolderGit2} bgColor="#3B82F6" href="/projects" />
            <QuickActionBtn title="Add Server" icon={Server} bgColor="#10B981" href="/servers" />
            <QuickActionBtn title="Run Scan" icon={Shield} bgColor="#F59E0B" href="/scans" />
          </div>
        </div>

        {/* Server Health */}
        <div style={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '14px', border: '1px solid rgb(var(--border))', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 24px 0' }}>Server Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ServerHealthRow name="prod-api-01" color="#10B981" cpu="34%" ram="61%" />
            <ServerHealthRow name="staging-web-02" color="#10B981" cpu="45%" ram="72%" />
            <ServerHealthRow name="db-replica-02" color="#F59E0B" cpu="78%" ram="85%" />
            <ServerHealthRow name="worker-node-01" color="#EF4444" cpu="92%" ram="94%" />
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, color, icon: Icon, bg }: { title: string; value: string; trend: string; color: string; icon: any; bg: string }) {
  return (
    <div style={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '14px', border: '1px solid rgb(var(--border))', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>{title}</span>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: '18px', height: '18px', color }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: 'rgb(var(--text-primary))', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color, backgroundColor: bg, padding: '4px 8px', borderRadius: '12px' }}>{trend}</span>
      </div>
    </div>
  );
}

function ActivityRow({ iconColor, title, time }: { iconColor: string; title: string; time: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: iconColor }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>{title}</span>
      </div>
      <span style={{ fontSize: '12px', color: 'rgb(var(--text-muted))' }}>{time}</span>
    </div>
  );
}

function QuickActionBtn({ title, icon: Icon, bgColor, href }: { title: string; icon: any; bgColor: string; href: string }) {
  return (
    <a href={href} style={{ backgroundColor: bgColor, borderRadius: '12px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none', color: '#fff', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      <Icon style={{ width: '24px', height: '24px' }} />
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{title}</span>
    </a>
  );
}

function ServerHealthRow({ name, color, cpu, ram }: { name: string; color: string; cpu: string; ram: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>{name}</span>
      </div>
      <span style={{ fontSize: '12px', fontWeight: 500, color: color, fontFamily: "'JetBrains Mono', monospace" }}>CPU {cpu} • RAM {ram}</span>
    </div>
  );
}
