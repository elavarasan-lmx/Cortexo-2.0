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

export { notifications, notificationPreferences, pushTokens } from './notifications';
export type { Notification, NewNotification, NotificationPreference, PushToken } from './notifications';

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

// Menu Items (DB-driven sidebar navigation)
export { menuItems } from './menu-items';
export type { MenuItem, NewMenuItem } from './menu-items';

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
export { loadTestRuns, moduleTestSuites, moduleTestResults, testSuites, testRuns } from './testing';
export type {
  LoadTestRun, NewLoadTestRun,
  ModuleTestSuite, NewModuleTestSuite,
  ModuleTestResult, NewModuleTestResult,
  TestSuite, NewTestSuite,
  TestRun, NewTestRun,
} from './testing';

// Phase 17: AI Agents
export { agents, agentRuns } from './agents';
export type {
  Agent, NewAgent,
  AgentRun, NewAgentRun,
} from './agents';

// Phase 18: Code Review Engine (F6)
export { codeReviews, codeReviewFindings } from './code-review';
export type {
  CodeReview, NewCodeReview,
  CodeReviewFinding, NewCodeReviewFinding,
} from './code-review';

// Phase 19: Fix Library & Bug Propagation (F29–F34)
export { fixRecipes, fixRollouts } from './fix-library';
export type {
  FixRecipe, NewFixRecipe,
  FixRollout, NewFixRollout,
} from './fix-library';

// Phase 20: Client Health Scores (F31, F39)
export { clientHealthScores } from './client-health';
export type {
  ClientHealthScore, NewClientHealthScore,
} from './client-health';

// Phase 21: Source Code Brain (F9, F10, F11)
export { projectBrains, brainPatterns, brainViolations } from './brain';
export type {
  ProjectBrain, NewProjectBrain,
  BrainPattern, NewBrainPattern,
  BrainViolation, NewBrainViolation,
} from './brain';

// Phase 22: Knowledge Base / Q&A Engine (F36)
export { knowledgeDocs, qaHistory } from './knowledge';
export type {
  KnowledgeDoc, NewKnowledgeDoc,
  QaHistory, NewQaHistory,
} from './knowledge';

// Phase 23: Security Scanners
export { securityScans, securityFindings } from './security';
export type {
  SecurityScan, NewSecurityScan,
  SecurityFinding, NewSecurityFinding,
} from './security';
