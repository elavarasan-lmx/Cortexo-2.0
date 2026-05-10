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

export { notifications, notificationPreferences } from './notifications';
export type { Notification, NewNotification, NotificationPreference } from './notifications';

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
export { sourceProfiles, dbProfiles, clientGitProfiles, clientDbProfiles } from './profiles';
export type {
  SourceProfile, NewSourceProfile,
  DbProfile, NewDbProfile,
  ClientGitProfile, NewClientGitProfile,
  ClientDbProfile, NewClientDbProfile,
} from './profiles';

// WinBull Configs (legacy client config lookup)
export { winbullConfigs } from './winbull-configs';
export type { WinbullConfig, NewWinbullConfig } from './winbull-configs';

// Phase 15: Alerts & AI Judge
export {
  alertChannels, alertRules, alertHistory,
  judgeScores,
} from './automation';
export type {
  AlertChannel, NewAlertChannel,
  AlertRule, NewAlertRule,
  AlertHistoryRow, NewAlertHistory,
  JudgeScore, NewJudgeScore,
} from './automation';

// Phase 22: Knowledge Base / Q&A Engine (F36)
export { knowledgeDocs, qaHistory } from './knowledge';
export type {
  KnowledgeDoc, NewKnowledgeDoc,
  QaHistory, NewQaHistory,
} from './knowledge';
