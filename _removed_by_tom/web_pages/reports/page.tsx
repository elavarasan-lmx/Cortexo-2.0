'use client';

import { FileText, Download, Calendar, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Clock, RefreshCw, Bug, FolderGit2 } from 'lucide-react';
import { useApiData } from '@/lib/hooks';
import { api } from '@/lib/api';

/* ─── shared card style ─── */
const card: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  overflow: 'hidden',
};

export default function ReportsPage() {
  const { data: deployments } = useApiData(() => api.getDeployments());
  const { data: errors } = useApiData(() => api.getErrors());
  const { data: projects } = useApiData(() => api.getProjects());

  const totalDeploys = (deployments || []).length;
  const successDeploys = (deployments || []).filter((d: any) => d.status === 'success').length;
  const failedDeploys = (deployments || []).filter((d: any) => d.status === 'failed').length;
  const successRate = totalDeploys > 0 ? Math.round((successDeploys / totalDeploys) * 100) : 0;

  const totalErrors = (errors || []).length;
  const unresolvedErrors = (errors || []).filter((e: any) => e.status === 'unresolved').length;
  const resolvedErrors = (errors || []).filter((e: any) => e.status === 'resolved').length;
  const resolutionRate = totalErrors > 0 ? Math.round((resolvedErrors / totalErrors) * 100) : 0;

  const summaryStats = [
    { label: 'Deploy Success Rate', value: `${successRate}%`, icon: TrendingUp, trend: '+2%', up: true, color: '#10B981' },
    { label: 'Total Deployments', value: String(totalDeploys), icon: BarChart3, trend: 'this month', up: true, color: '#818CF8' },
    { label: 'Unresolved Errors', value: String(unresolvedErrors), icon: Bug, trend: '-5 this week', up: false, color: '#EF4444' },
    { label: 'Active Projects', value: String((projects || []).length), icon: FolderGit2, trend: 'connected', up: true, color: '#A78BFA' },
  ];

  const reports = [
    {
      id: 1,
      title: 'Deployment Summary',
      description: 'Overview of all deployments, success rates, and environment breakdown',
      period: 'Last 30 days',
      type: 'CI/CD',
      color: '#818CF8',
      stats: [
        { label: 'Total Deploys', value: totalDeploys },
        { label: 'Success Rate', value: `${successRate}%` },
        { label: 'Failed', value: failedDeploys },
      ],
    },
    {
      id: 2,
      title: 'Error Tracking Report',
      description: 'Error frequency, severity distribution, and resolution metrics',
      period: 'Last 30 days',
      type: 'Bugs',
      color: '#EF4444',
      stats: [
        { label: 'Total Errors', value: totalErrors },
        { label: 'Unresolved', value: unresolvedErrors },
        { label: 'Resolution Rate', value: `${resolutionRate}%` },
      ],
    },
    {
      id: 3,
      title: 'Project Health Report',
      description: 'Health scores, activity, and status across all connected projects',
      period: 'Current',
      type: 'Projects',
      color: '#10B981',
      stats: [
        { label: 'Total Projects', value: (projects || []).length },
        { label: 'Avg Health', value: `${(projects || []).length > 0 ? Math.round((projects || []).reduce((s: number, p: any) => s + (p.healthScore || 100), 0) / (projects || []).length) : 0}/100` },
        { label: 'Active', value: (projects || []).filter((p: any) => p.isActive).length },
      ],
    },
    {
      id: 4,
      title: 'Pipeline Execution Report',
      description: 'Pipeline run history, stage timings, and failure analysis',
      period: 'Last 30 days',
      type: 'CI/CD',
      color: '#A78BFA',
      stats: [
        { label: 'Pipelines', value: 3 },
        { label: 'Runs', value: 1 },
        { label: 'Avg Duration', value: '51ms' },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Reports</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Analytics and insights across all your projects
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
            boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
            flexShrink: 0,
          }}
        >
          <RefreshCw style={{ width: '15px', height: '15px' }} />
          Refresh Data
        </button>
      </div>

      {/* ─── Summary Stats ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {summaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                ...card,
                padding: '20px',
                position: 'relative',
                transition: 'box-shadow 200ms, transform 200ms',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 24px -4px ${stat.color}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: stat.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-secondary))', margin: 0 }}>{stat.label}</p>
                <div style={{
                  width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '10px',
                  backgroundColor: `${stat.color}12`,
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '16px', height: '16px', color: stat.color }} />
                </div>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, lineHeight: 1 }}>{stat.value}</p>
              <p style={{
                marginTop: '6px',
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 500,
                color: stat.up ? '#10B981' : '#EF4444',
              }}>
                {stat.up
                  ? <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                  : <ArrowDownRight style={{ width: '12px', height: '12px' }} />}
                {stat.trend}
              </p>
            </div>
          );
        })}
      </div>

      {/* ─── Report Cards ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        {reports.map((report) => (
          <div
            key={report.id}
            style={{
              ...card,
              padding: '24px',
              transition: 'box-shadow 200ms, transform 200ms',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 24px -4px ${report.color}20`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px',
                  borderRadius: '12px',
                  backgroundColor: `${report.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FileText style={{ width: '20px', height: '20px', color: report.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{report.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: `${report.color}15`,
                      color: report.color,
                    }}>
                      {report.type}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'rgb(var(--text-muted))' }}>
                      <Calendar style={{ width: '11px', height: '11px' }} />
                      {report.period}
                    </span>
                  </div>
                </div>
              </div>
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '8px',
                  fontSize: '11px', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  backgroundColor: `${report.color}10`,
                  color: report.color,
                  opacity: 0.7,
                  transition: 'opacity 200ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
              >
                <Download style={{ width: '12px', height: '12px' }} />
                Export
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: '0 0 16px 0' }}>{report.description}</p>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {report.stats.map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(var(--surface-hover), 0.5)',
                    border: '1px solid rgba(var(--border), 0.5)',
                  }}
                >
                  <p style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, lineHeight: 1.2 }}>{stat.value}</p>
                  <p style={{ fontSize: '10px', fontWeight: 500, color: 'rgb(var(--text-muted))', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* View full report button */}
            <button
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: `${report.color}10`,
                color: report.color,
                transition: 'background-color 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${report.color}20`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${report.color}10`; }}
            >
              View Full Report →
            </button>
          </div>
        ))}
      </div>

      {/* ─── Coming Soon Notice ─── */}
      <div style={{
        padding: '32px 24px',
        borderRadius: '14px',
        textAlign: 'center',
        backgroundColor: 'rgba(var(--agent), 0.04)',
        border: '1px dashed rgba(var(--agent), 0.25)',
      }}>
        <Clock style={{ width: '32px', height: '32px', color: 'rgb(var(--agent))', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Scheduled Reports Coming Soon</h3>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '6px' }}>
          Automated weekly/monthly reports delivered to your email or Slack channel.
        </p>
      </div>
    </div>
  );
}
