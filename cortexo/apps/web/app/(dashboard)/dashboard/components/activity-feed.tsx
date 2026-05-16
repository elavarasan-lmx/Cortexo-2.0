'use client';

import { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, Rocket, Bug } from 'lucide-react';
import { Deployment, TrackedError } from '@/lib/api';
import Link from 'next/link';
import { ChartSkeleton } from './deployment-chart';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  time: string;
  icon: any;
  color: string;
}

export function ActivityRow({ icon: Icon, iconColor, title, time, status }: {
  icon: any; iconColor: string; title: string; time: string; status?: string;
}) {
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

export function ActivityFeed({ deployments, errors, isLoading }: {
  deployments: Deployment[];
  errors: TrackedError[];
  isLoading: boolean;
}) {
  const [activityFilter, setActivityFilter] = useState<string>('all');

  const activityFeed = useMemo(() => {
    const items: ActivityItem[] = [];
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

  if (isLoading) return <ChartSkeleton />;

  return (
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
    </div>
  );
}
