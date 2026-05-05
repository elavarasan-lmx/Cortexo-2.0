/**
 * Cortexo API — Domain Types
 * All shared TypeScript interfaces for frontend ↔ backend communication.
 * Extracted from the monolithic api.ts to improve maintainability.
 */

// ─── Response Wrapper ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  total?: number;
  unread?: number;
  error?: string;
  cached?: boolean;
  demo?: boolean;
}

// ─── Projects ───────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  repoUrl?: string | null;
  repoProvider?: string;
  defaultBranch?: string;
  stack?: string | null;
  sdkApiKey?: string | null;
  apiKey?: string | null;
  healthScore?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateProjectInput {
  name: string;
  repoUrl?: string;
  repoProvider?: 'github' | 'gitlab' | 'bitbucket';
  defaultBranch?: string;
  stack?: string;
  description?: string;
}

// ─── Pipelines ──────────────────────────────────────────────────────────────

export interface Pipeline {
  id: string;
  projectId: string;
  name: string;
  stages?: unknown;
  trigger?: string;
  status?: string;
  createdAt: string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: string;
  triggeredBy?: string;
  startedAt?: string;
  completedAt?: string;
  logs?: string;
  createdAt: string;
}

// ─── Deployments ────────────────────────────────────────────────────────────

export interface Deployment {
  id: string;
  projectId: string;
  targetId?: string;
  status: string;
  commitSha?: string;
  branch?: string;
  triggeredBy?: string;
  createdAt: string;
}

export interface DeployTarget {
  id: string;
  orgId: string;
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
  remotePath: string;
  isActive: boolean;
}

export interface DeployResolveInfo {
  projectId: string;
  projectName: string;
  clientSlug: string;
  branch: string;
  matchedServerId: number | null;
  matchedServerName: string | null;
  matchedServerIp: string | null;
  remotePath: string;
  postDeployCmd: string;
  healthCheckUrl: string | null;
  winbullStatus: string | null;
  domain: string | null;
}

export interface TriggerDeployInput {
  projectId: string;
  branch: string;
  environment: string;
  serverId?: number;
  deployTargetId?: string;
  remotePath: string;
  preDeployCmd?: string;
  postDeployCmd?: string;
  healthCheckUrl?: string;
  notifyOnComplete?: boolean;
  nginx?: Record<string, unknown>;
  crons?: { schedule: string; command: string }[];
  permissions?: Record<string, unknown>;
  database?: Record<string, unknown>;
  pm2?: Record<string, unknown>;
}

export interface DeploymentLogs {
  logs: DeployLogEntry[];
  result: DeployResult | null;
  isRunning: boolean;
}

export interface DeployLogEntry {
  step: string;
  command?: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  timestamp: string;
}

export interface DeployResult {
  success: boolean;
  status: string;
  totalDurationMs: number;
  error?: string;
  commitSha?: string;
}

// ─── Errors ─────────────────────────────────────────────────────────────────

export interface TrackedError {
  id: string;
  projectId: string;
  fingerprint: string;
  type: string;
  message: string;
  file?: string | null;
  line?: number | null;
  severity: string;
  status: string;
  eventCount: number;
  assignedTo?: string | null;
  assignedToName?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  events?: ErrorEvent[];
}

export interface ErrorEvent {
  id?: string;
  errorId: string;
  stackTrace?: string | null;
  context?: string | null;
  environment?: string | null;
  release?: string | null;
  createdAt?: string;
}

export interface RootCause {
  id: string;
  errorId: string;
  summary: string;
  explanation?: string;
  suggestedFix?: string;
  confidence?: number;
  status: string;
  createdAt: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

// ─── Health ─────────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
}

export interface HealthReadiness {
  status: string;
  checks: {
    database: string;
    redis: string;
  };
  timestamp: string;
}

// ─── Health Check Results ───────────────────────────────────────────────────

export interface HealthCheckResult {
  url: string;
  status: number;
  ok: boolean;
  responseTimeMs: number;
  checkedAt: string;
}

export interface HealthSchedulerResponse {
  action: string;
  intervalMinutes?: number;
  status: string;
}

// ─── WinBull Configs ────────────────────────────────────────────────────────

export interface WinbullConfig {
  id?: string;
  clientSlug: string;
  clientId: string;
  displayName: string;
  domain: string;
  configJson?: Record<string, unknown>;
  status?: string;
  migrationStatus?: string;
  serverIp?: string;
  lastDeployedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Infrastructure ─────────────────────────────────────────────────────────

export interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  status?: string;
  createdAt?: string;
}

export interface ServerMount {
  id: number;
  serverId: number;
  localPath: string;
  remotePath: string;
  status: string;
}

export interface LogSource {
  id: number;
  name: string;
  filePath: string;
  serverId?: number;
}

export interface DeployConfig {
  id: number;
  name: string;
  config: Record<string, unknown>;
  createdAt?: string;
}

export interface FileEntry {
  name: string;
  type: string;
  size: number;
}

// ─── Audit ──────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId?: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Sync ───────────────────────────────────────────────────────────────────

export interface SyncHistory {
  id: number;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export interface SyncClient {
  id: string;
  name: string;
  environment: string;
}

export interface SyncExcludeRule {
  id: number;
  pattern: string;
  is_active: boolean;
}

// ─── Drift Detection ────────────────────────────────────────────────────────

export interface DriftScanResult {
  slug: string;
  status: string;
  driftedFiles: number;
  totalFiles: number;
  scannedAt: string;
  details: DriftFileEntry[];
}

export interface DriftFileEntry {
  path: string;
  status: 'modified' | 'added' | 'deleted';
  diff?: string;
}

// ─── SSH Connection Data ────────────────────────────────────────────────────

export interface SshConnectionData {
  host: string;
  username: string;
  port?: number;
  privateKey?: string;
  password?: string;
  remotePath?: string;
  logPath?: string;
  lines?: number;
}

// ─── Module Testing ─────────────────────────────────────────────────────────

export interface ModuleTestInput {
  clientSlug: string;
  clientUrl: string;
  sourceSlug: string;
  controller?: string;
  sessionCookie?: string;
  layer?: 'admin' | 'web';
}

export interface ModuleTestResult {
  controller: string;
  url: string;
  status: number;
  ok: boolean;
  responseTimeMs: number;
}

// ─── SSL ────────────────────────────────────────────────────────────────────

export interface SslScanResult {
  domain: string;
  clientName: string;
  valid: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  issuer: string | null;
  subject: string | null;
  serialNumber: string | null;
  protocol: string | null;
  error: string | null;
  status: string;
  checkedAt: string;
}

export interface SslCheckResult {
  domain: string;
  valid: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  issuer: string | null;
  error: string | null;
  status: string;
}

// ─── DB Schema Validation ───────────────────────────────────────────────────

export interface DbSchemaValidationInput {
  goldenHost: string;
  goldenUsername: string;
  goldenPort?: number;
  goldenKey?: string;
  goldenPassword?: string;
  goldenDb: string;
  clientHost: string;
  clientUsername: string;
  clientPort?: number;
  clientKey?: string;
  clientPassword?: string;
  clientDb: string;
}

export interface DbSchemaValidationResult {
  match: boolean;
  missingTables: string[];
  extraTables: string[];
  columnDiffs: Record<string, { missing: string[]; extra: string[] }>;
}

// ─── Provisioning ───────────────────────────────────────────────────────────

export interface ProvisionStep {
  id: string;
  name: string;
  order: number;
}

export interface ProvisionRun {
  id: number;
  status: string;
  logs: string[];
  createdAt?: string;
}

// ─── Log Viewer ─────────────────────────────────────────────────────────────

export interface LogReadResult {
  lines: string[];
  total: number;
}

export interface LogSearchMatch {
  line: number;
  content: string;
}

// ─── Menu Item ──────────────────────────────────────────────────────────────

export interface MenuItem {
  key: string;
  label: string;
  group: string;
}
