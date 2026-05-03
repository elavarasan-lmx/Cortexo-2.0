'use client';

import {
  TrendingUp, Rocket, Bug, GitBranch, Activity, BarChart3,
  ArrowUpRight, ArrowDownRight, Server, Clock, CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken } from '@/lib/hooks';

const cardBase: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  overflow: 'hidden',
};

export default function AnalyticsPage() {
  useAutoLoadToken();
  const { data: projects } = useApiData(() => api.getProjects());
  const { data: deployments } = useApiData(() => api.getDeployments());
  const { data: errors } = useApiData(() => api.getErrors());
  const { data: auditStats } = useApiData(() => api.getAuditStats());

  const projectCount = (projects || []).length;
  const deployCount = (deployments || []).length;
  const errorCount = (errors || []).length;
  const unresolvedErrors = (errors || []).filter((e: any) => e.status === 'unresolved').length;
  const successDeploys = (deployments || []).filter((d: any) => d.status === 'success').length;
  const successRate = deployCount > 0 ? Math.round((successDeploys / deployCount) * 100) : 0;

  const statCards = [
    { label: 'Deploy Success Rate', value: `${successRate}%`, icon: Rocket, color: '#10B981', trend: successRate >= 90 ? '↑ Excellent' : '↓ Needs attention', trendUp: successRate >= 90 },
    { label: 'Total Deployments', value: String(deployCount), icon: Activity, color: '#818CF8' },
    { label: 'Unresolved Errors', value: String(unresolvedErrors), icon: Bug, color: '#EF4444' },
    { label: 'Active Projects', value: String(projectCount), icon: GitBranch, color: '#3B82F6' },
  ];

  // Deployment status breakdown
  const deployByStatus = (deployments || []).reduce((acc: Record<string, number>, d: any) => {
    acc[d.status || 'unknown'] = (acc[d.status || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Error severity breakdown
  const errorBySeverity = (errors || []).reduce((acc: Record<string, number>, e: any) => {
    acc[e.severity || 'info'] = (acc[e.severity || 'info'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityColors: Record<string, string> = {
    critical: '#EF4444', error: '#F97316', warning: '#F59E0B', info: '#3B82F6',
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
          Platform Insights
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Analytics overview of deployments, errors, and platform health
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
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
                e.currentTarget.style.boxShadow = `0 8px 24px -4px ${card.color}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: card.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{card.label}</p>
                <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: `${card.color}12` }}>
                  <Icon style={{ width: '16px', height: '16px', color: card.color }} />
                </div>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: card.color, margin: '12px 0 0', lineHeight: 1 }}>{card.value}</p>
              {card.trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                  {card.trendUp
                    ? <ArrowUpRight style={{ width: '12px', height: '12px', color: '#10B981' }} />
                    : <ArrowDownRight style={{ width: '12px', height: '12px', color: '#EF4444' }} />
                  }
                  <span style={{ fontSize: '11px', fontWeight: 500, color: card.trendUp ? '#10B981' : '#EF4444' }}>{card.trend}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid: Deploy Status + Error Severity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Deploy Status Breakdown */}
        <div style={cardBase}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Rocket style={{ width: '14px', height: '14px', color: '#818CF8' }} />
              Deployment Status
            </h2>
          </div>
          <div style={{ padding: '20px' }}>
            {Object.entries(deployByStatus).length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', textAlign: 'center', padding: '20px' }}>No deployment data</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(deployByStatus).map(([status, count]) => {
                  const pct = Math.round(((count as number) / deployCount) * 100);
                  const color = status === 'success' ? '#10B981' : status === 'failed' ? '#EF4444' : status === 'deploying' || status === 'running' ? '#3B82F6' : '#F59E0B';
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-primary))', textTransform: 'capitalize' }}>{status}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color }}>{count as number} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'rgba(var(--border), 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px', transition: 'width 600ms ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Error Severity Breakdown */}
        <div style={cardBase}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bug style={{ width: '14px', height: '14px', color: '#EF4444' }} />
              Error Severity
            </h2>
          </div>
          <div style={{ padding: '20px' }}>
            {Object.entries(errorBySeverity).length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
                <CheckCircle style={{ width: '28px', height: '28px', color: '#10B981', opacity: 0.4, marginBottom: '8px' }} />
                <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: 0 }}>No errors tracked yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(errorBySeverity).sort(([a], [b]) => {
                  const order = ['critical', 'error', 'warning', 'info'];
                  return order.indexOf(a) - order.indexOf(b);
                }).map(([severity, count]) => {
                  const pct = Math.round(((count as number) / errorCount) * 100);
                  const color = severityColors[severity] || '#6B7280';
                  return (
                    <div key={severity}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--text-primary))', textTransform: 'capitalize' }}>{severity}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color }}>{count as number} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'rgba(var(--border), 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px', transition: 'width 600ms ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div style={cardBase}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgb(var(--border))' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 style={{ width: '14px', height: '14px', color: '#10B981' }} />
            Platform Health Summary
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', backgroundColor: 'rgb(var(--border))' }}>
          {[
            { label: 'Uptime', value: '99.9%', icon: Server, color: '#10B981' },
            { label: 'Avg Deploy Time', value: '2.4m', icon: Clock, color: '#818CF8' },
            { label: 'MTTR', value: '18m', icon: Activity, color: '#F59E0B' },
            { label: 'Error Resolution', value: `${errorCount > 0 ? Math.round(((errorCount - unresolvedErrors) / errorCount) * 100) : 100}%`, icon: CheckCircle, color: '#3B82F6' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ backgroundColor: 'rgb(var(--surface))', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: `${item.color}10`, flexShrink: 0 }}>
                  <Icon style={{ width: '18px', height: '18px', color: item.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(var(--text-muted))', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: item.color, margin: '2px 0 0', lineHeight: 1 }}>{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
