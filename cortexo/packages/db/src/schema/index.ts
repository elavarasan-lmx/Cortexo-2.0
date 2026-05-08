/**
 * Cortexo Database Schema — Central export
 * All tables defined as Drizzle ORM schemas for PostgreSQL 18.3.
 * Migrated from MySQL to enable native Row-Level Security (RLS).
 */

// Phase 1: Foundation
export { organizations } from './organizations';
export type { Organization, NewOrganization } from './organizations';

export { users } from './users';
export type { User, NewUser } from './users';

export { sessions } from './auth';

export { projects } from './projects';
export type { Project, NewProject } from './projects';

export { notifications } from './notifications';
export type { Notification, NewNotification } from './notifications';

// Phase 2: CI/CD Engine
export { pipelines, pipelineRuns, deployTargets, deployments } from './pipelines';
export type {
  Pipeline, NewPipeline,
  PipelineRun, NewPipelineRun,
  DeployTarget, NewDeployTarget,
  Deployment, NewDeployment,
} from './pipelines';

// Phase 3: Bug Detection + AI Root Cause
export { errors, errorEvents, rootCauses } from './errors';
export type {
  Error, NewError,
  ErrorEvent, NewErrorEvent,
  RootCause, NewRootCause,
} from './errors';

// Phase 6: Operations (Integrations)
export { integrations } from './operations';
export type {
  Integration, NewIntegration,
} from './operations';



// Phase 8: Source Sync & Fleet Management
export {
  syncHistory, syncExcludeRules, syncClients,
  divergenceAnalyses, monoDeployments, deploymentApprovals,
} from './sync';
export type {
  SyncHistoryRow, NewSyncHistory, SyncExcludeRule,
  SyncClient, DivergenceAnalysis,
  MonoDeployment, DeploymentApproval,
} from './sync';

// Phase 9: Infrastructure (Servers, Metrics, Logs, Mounts, Deploy Configs)
export { servers, serverResources, logSources, serverMounts, deployConfigs } from './infrastructure';
export type {
  Server, NewServer, ServerResource, LogSource,
  ServerMount, NewServerMount,
  DeployConfig, NewDeployConfig,
} from './infrastructure';



// Phase 11: Menu Permissions (per-user sidebar control)
export { userMenuPermissions } from './menu-permissions';
export type { UserMenuPermission, NewUserMenuPermission } from './menu-permissions';

// Phase 12: Audit Trail
export { auditLogs, type AuditLog, type NewAuditLog } from './audit';

// Phase 13: Deployment Profiles (reusable credentials)
export { sourceProfiles, dbProfiles } from './profiles';
export type {
  SourceProfile, NewSourceProfile,
  DbProfile, NewDbProfile,
} from './profiles';

// Phase 14: Source Registry & Client Configs
export { managedSources, clientConfigs, configChangeHistory } from './sources';
export type {
  ManagedSource, NewManagedSource,
  ClientConfig, NewClientConfig,
  ConfigChangeHistory, NewConfigChangeHistory,
} from './sources';

// WinBull Configs (legacy client config lookup)
export { winbullConfigs } from './winbull-configs';
export type { WinbullConfig, NewWinbullConfig } from './winbull-configs';

// Phase 15: Automation & Intelligence (cron, alerts, deprecation, AI judge)
export {
  cronJobs, cronExecutions,
  alertChannels, alertRules, alertHistory,
  deprecationResults,
  judgeScores,
} from './automation';
export type {
  CronJob, NewCronJob,
  CronExecution, NewCronExecution,
  AlertChannel, NewAlertChannel,
  AlertRule, NewAlertRule,
  AlertHistoryRow, NewAlertHistory,
  DeprecationResult, NewDeprecationResult,
  JudgeScore, NewJudgeScore,
} from './automation';

// Phase 16: Load Testing & Module Testing
export { loadTestRuns, moduleTestSuites, moduleTestResults } from './testing';
export type {
  LoadTestRun, NewLoadTestRun,
  ModuleTestSuite, NewModuleTestSuite,
  ModuleTestResult, NewModuleTestResult,
} from './testing';

// Phase 17: AI Agents
export { agents, agentRuns } from './agents';
export type {
  Agent, NewAgent,
  AgentRun, NewAgentRun,
} from './agents';
