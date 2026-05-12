/**
 * Cortexo API Client v0.3.0
 * Central HTTP client for frontend → backend communication.
 * All response types are strongly typed — no `any`.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

// ─── Shared Response Wrapper ────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T;
  total?: number;
  unread?: number;
  error?: string;
  cached?: boolean;
  demo?: boolean;
}

// ─── Domain Types ───────────────────────────────────────────────────────────

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

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

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

export interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  privateIp?: string;
  publicAddress?: string;
  sshKey?: string;
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

export interface ErrorModuleStat {
  module: string;
  count: number;
  open: number;
  resolved: number;
}

export interface MountChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  size?: number;
  modifiedAt?: string;
}

export interface MenuItem {
  id: number;
  label: string;
  href: string;
  emoji: string;
  sectionTitle: string;
  sectionColor: string;
  sortOrder?: number;
  visible?: boolean;
}

export interface TestTarget {
  id: number;
  name: string;
  baseUrl: string;
  environment?: string;
  createdAt?: string;
}

export interface TestCase {
  id: number;
  title: string;
  category?: string;
  level?: string;
  method?: string;
  endpoint?: string;
  payload?: Record<string, unknown>;
  expectedStatus?: number;
  createdAt?: string;
}

export interface TestRun {
  id: number;
  targetId: number;
  status: string;
  totalCases: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs?: number;
  createdAt: string;
  completedAt?: string;
}

export interface TestRunDetail extends TestRun {
  results?: TestCaseResult[];
  levels?: Record<string, { passed: number; failed: number; total: number }>;
}

export interface TestCaseResult {
  id: number;
  testCaseId: number;
  runId: number;
  status: 'pass' | 'fail' | 'skip';
  durationMs?: number;
  error?: string;
  response?: Record<string, unknown>;
}

export interface TestBug {
  id: number;
  runId: number;
  testCaseId?: number;
  title: string;
  severity: string;
  status: string;
  description?: string;
  createdAt: string;
}

export interface TestScanResult {
  scanned: number;
  discovered: number;
  cases: TestCase[];
}

export interface TestExportResult {
  exported: number;
  format: string;
  url?: string;
}

export interface KnowledgeHistoryEntry {
  id: string;
  question: string;
  answer?: string;
  provider?: string;
  createdAt: string;
}

export interface KnowledgeProvider {
  id: string;
  name: string;
  available: boolean;
}

export interface KnowledgeAnswer {
  answer: string;
  provider?: string;
  sources?: string[];
  confidence?: number;
}

export interface DevopsDoc {
  id: string | number;
  title: string;
  content?: string;
  category?: string;
  tags?: string[];
  tool?: string;
  icon?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevopsTool {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  docsCount?: number;
}

export interface CustomDoc {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Checklist {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
  items?: ChecklistItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistItem {
  id?: number;
  label: string;
  done: boolean;
  order?: number;
}


// ─── API Client ─────────────────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) { this.token = token; }

  private async request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        this.token = null;
        if (typeof window !== 'undefined') localStorage.removeItem('cortexo_token');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new ApiError(json.error || 'Request failed', res.status, json);
    }
    return json;
  }

  // ─── Projects ─────────────────────────────────────────────────────────────
  getProjects()                                      { return this.request<Project[]>('GET', '/projects?limit=100'); }
  getProject(id: string)                             { return this.request<Project>('GET', `/projects/${id}`); }
  createProject(data: CreateProjectInput)            { return this.request<Project>('POST', '/projects', data); }
  deleteProject(id: string)                          { return this.request<{ success: boolean }>('DELETE', `/projects/${id}`); }
  updateProject(id: string, data: Partial<CreateProjectInput>) { return this.request<Project>('PATCH', `/projects/${id}`, data); }
  validateProjectUnique(data: { clientSlug?: string; dbName?: string; wsPort?: string; socketIoPort?: string; serverPath?: string; excludeProjectId?: string }) {
    return this.request<{ valid: boolean; conflicts: Record<string, { field: string; existingProject: string; existingValue: string }> }>('POST', '/projects/validate-unique', data);
  }

  // ─── Pipelines ────────────────────────────────────────────────────────────
  getPipelines()                                     { return this.request<Pipeline[]>('GET', '/pipelines'); }
  getPipeline(id: string)                            { return this.request<Pipeline>('GET', `/pipelines/${id}`); }
  createPipeline(data: Partial<Pipeline>)            { return this.request<Pipeline>('POST', '/pipelines', data); }
  updatePipeline(id: string, data: Partial<Pipeline>){ return this.request<Pipeline>('PUT', `/pipelines/${id}`, data); }
  deletePipeline(id: string)                         { return this.request<{ success: boolean }>('DELETE', `/pipelines/${id}`); }
  triggerPipelineRun(id: string, data?: Record<string, unknown>) { return this.request<PipelineRun>('POST', `/pipelines/${id}/run`, data || {}); }

  // ─── Pipeline Runs ────────────────────────────────────────────────────────
  getPipelineRuns(params?: { pipelineId?: string; limit?: number }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<PipelineRun[]>('GET', `/pipeline-runs${qs}`);
  }
  getPipelineRun(runId: string)                      { return this.request<PipelineRun>('GET', `/pipeline-runs/${runId}`); }
  retryPipelineRun(runId: string)                    { return this.request<PipelineRun>('POST', `/pipeline-runs/${runId}/retry`); }

  // ─── Deployments ──────────────────────────────────────────────────────────
  getDeployments()                                   { return this.request<Deployment[]>('GET', '/deployments'); }
  getDeployment(id: string)                          { return this.request<Deployment>('GET', `/deployments/${id}`); }
  getDeploymentLogs(id: string)                      { return this.request<{ logs: { step: string; command?: string; stdout: string; stderr: string; exitCode: number | null; durationMs: number; timestamp: string }[]; result: { success: boolean; status: string; totalDurationMs: number; error?: string; commitSha?: string } | null; isRunning: boolean }>('GET', `/deployments/${id}/logs`); }
  resolveDeployInfo(projectId: string)               { return this.request<{
    projectId: string; projectName: string; clientSlug: string; branch: string;
    matchedServerId: number | null; matchedServerName: string | null; matchedServerIp: string | null;
    remotePath: string; postDeployCmd: string; healthCheckUrl: string | null;
    winbullStatus: string | null; domain: string | null;
  }>('GET', `/deployments/resolve/${projectId}`); }
  triggerDeploy(data: {
    projectId: string;
    branch: string;
    environment: string;
    serverId?: number;
    deployTargetId?: string;
    remotePath?: string;
    preDeployCmd?: string;
    postDeployCmd?: string;
    healthCheckUrl?: string;
    notifyOnComplete?: boolean;
    truncateLogs?: boolean;
    nginx?: Record<string, unknown>;
    crons?: { schedule: string; command: string }[];
    permissions?: Record<string, unknown>;
    database?: Record<string, unknown>;
    sourceDatabase?: Record<string, unknown>;
    pm2?: Record<string, unknown>;
    sourceTemplate?: { repoUrl: string; branch: string };
  })                                                 { return this.request<{ id: string; status: string }>('POST', '/deployments', data); }
  rollbackDeployment(id: string)                     { return this.request<Deployment>('POST', `/deployments/${id}/rollback`); }
  deleteDeployment(id: string)                       { return this.request<{ success: boolean }>('DELETE', `/deployments/${id}`); }
  updateDeployment(id: string, data: { environment?: string; branch?: string; commitMessage?: string; status?: string; strategy?: string }) {
    return this.request<Deployment>('PUT', `/deployments/${id}`, data);
  }




  // ─── Deploy Targets ───────────────────────────────────────────────────────
  getDeployTargets()                                 { return this.request<DeployTarget[]>('GET', '/deploy-targets'); }
  createDeployTarget(data: Partial<DeployTarget>)    { return this.request<DeployTarget>('POST', '/deploy-targets', data); }
  testDeployTarget(id: string)                       { return this.request<{ success: boolean; message: string; details?: Record<string, unknown>; durationMs: number }>('POST', `/deploy-targets/${id}/test`); }
  deleteDeployTarget(id: string)                     { return this.request<{ success: boolean }>('DELETE', `/deploy-targets/${id}`); }
  testServerSSH(id: number)                          { return this.request<{ success: boolean; message: string; details?: Record<string, unknown>; durationMs: number }>('POST', `/servers/${id}/test-ssh`); }

  // ─── Errors ───────────────────────────────────────────────────────────────
  getErrors(params?: { projectId?: string; status?: string; severity?: string; module?: string }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<TrackedError[]>('GET', `/errors${qs}`);
  }
  getError(id: string)                               { return this.request<TrackedError>('GET', `/errors/${id}`); }
  getErrorModuleStats()                              { return this.request<ErrorModuleStat[]>('GET', '/errors/module-stats'); }
  updateError(id: string, data: { status?: string; assignedTo?: string }) { return this.request<{ success: boolean }>('PATCH', `/errors/${id}`, data); }

  // ─── Root Causes ──────────────────────────────────────────────────────────
  getRootCauses()                                    { return this.request<RootCause[]>('GET', '/root-causes'); }
  getRootCause(id: string)                           { return this.request<RootCause>('GET', `/root-causes/${id}`); }
  analyzeRootCause(errorId: string)                  { return this.request<RootCause>('POST', '/root-causes/analyze', { errorId }); }
  submitFeedback(id: string, rating: number, comment?: string) {
    return this.request<{ success: boolean }>('PATCH', `/root-causes/${id}/feedback`, { rating, comment });
  }

  // ─── Notifications ────────────────────────────────────────────────────────
  getNotifications()                                 { return this.request<Notification[]>('GET', '/notifications'); }
  markNotificationRead(id: string)                   { return this.request<{ success: boolean }>('PATCH', `/notifications/${id}/read`, {}); }
  markAllNotificationsRead()                         { return this.request<{ success: boolean }>('POST', '/notifications/read-all', {}); }

  // ─── Health ───────────────────────────────────────────────────────────────
  getHealth()                                        { return this.request<HealthStatus>('GET', '/health'); }
  getHealthReady()                                   { return this.request<HealthReadiness>('GET', '/health/ready'); }

  // ─── WinBull Config Manager ───────────────────────────────────────────────
  getWinbullConfigs()                                { return this.request<WinbullConfig[]>('GET', '/winbull'); }
  getWinbullConfig(slug: string)                     { return this.request<WinbullConfig>('GET', `/winbull/${slug}`); }
  createWinbullConfig(data: Partial<WinbullConfig>)  { return this.request<WinbullConfig>('POST', '/winbull', data); }
  updateWinbullConfig(slug: string, data: Partial<WinbullConfig>) { return this.request<WinbullConfig>('PUT', `/winbull/${slug}`, data); }
  deleteWinbullConfig(slug: string)                  { return this.request<{ success: boolean }>('DELETE', `/winbull/${slug}`); }
  cloneWinbullConfig(slug: string, data: { newSlug: string; newName: string }) { return this.request<WinbullConfig>('POST', `/winbull/${slug}/clone`, data); }
  validateWinbullConfig(data: Partial<WinbullConfig>){ return this.request<{ valid: boolean; errors?: string[] }>('POST', '/winbull/validate', data); }
  batchUpdateWinbull(data: { slugs: string[]; updates: Partial<WinbullConfig> }) { return this.request<{ updated: number }>('POST', '/winbull/batch/update', data); }
  getWinbullStats()                                  { return this.request<Record<string, number>>('GET', '/winbull/stats/summary'); }
  getWinbullChangelog(limit?: number)                { return this.request<AuditLog[]>('GET', `/winbull/changelog${limit ? `?limit=${limit}` : ''}`); }

  // ─── Servers ──────────────────────────────────────────────────────────────
  getServers()                                       { return this.request<Server[]>('GET', '/servers'); }
  getServer(id: number)                              { return this.request<Server>('GET', `/servers/${id}`); }
  createServer(data: Partial<Server>)                { return this.request<Server>('POST', '/servers', data); }
  updateServer(id: number, data: Partial<Server>)    { return this.request<Server>('PUT', `/servers/${id}`, data); }
  deleteServer(id: number)                           { return this.request<{ success: boolean }>('DELETE', `/servers/${id}`); }
  testServerConnection(id: number)                   { return this.request<{ success: boolean; latencyMs: number; hostname?: string; uptime?: string; error?: string }>('POST', `/servers/${id}/test-connection`); }
  getServerResourcesLatest()                         { return this.request<Record<string, unknown>[]>('GET', '/servers/resources/latest'); }
  getServerResourceHistory(serverId: number)          { return this.request<Record<string, unknown>[]>('GET', `/servers/${serverId}/resources/history`); }
  getServerProjectCounts()                           { return this.request<Record<string, number>>('GET', '/servers/project-counts'); }
  collectServerMetrics()                             { return this.request<{ success: boolean; collected: number }>('POST', '/servers/collect-metrics'); }

  // ─── Server Mounts (SSHFS) ────────────────────────────────────────────────
  getServerMounts()                                  { return this.request<ServerMount[]>('GET', '/server-mounts'); }
  getServerMount(id: number)                         { return this.request<ServerMount>('GET', `/server-mounts/${id}`); }
  createServerMount(data: Partial<ServerMount>)      { return this.request<ServerMount>('POST', '/server-mounts', data); }
  updateServerMount(id: number, data: Partial<ServerMount>) { return this.request<ServerMount>('PUT', `/server-mounts/${id}`, data); }
  deleteServerMount(id: number)                      { return this.request<{ success: boolean }>('DELETE', `/server-mounts/${id}`); }
  mountServer(id: number)                            { return this.request<{ success: boolean; message: string }>('POST', `/server-mounts/${id}/mount`); }
  unmountServer(id: number)                          { return this.request<{ success: boolean; message: string }>('POST', `/server-mounts/${id}/unmount`); }
  getServerMountStatus(id: number)                   { return this.request<{ mounted: boolean; path?: string }>('GET', `/server-mounts/${id}/status`); }
  browseServerMount(id: number, path: string = '.')  { return this.request<{ entries: { name: string; type: string; size: number }[] }>('POST', `/server-mounts/${id}/browse`, { path }); }
  readServerFile(id: number, filePath: string)       { return this.request<{ content: string; encoding: string }>('POST', `/server-mounts/${id}/read-file`, { filePath }); }
  toggleMountReadOnly(id: number, readOnly: boolean) { return this.request<{ readOnly: boolean; remounted: boolean }>('PUT', `/server-mounts/${id}/toggle-readonly`, { readOnly }); }
  scanMountChanges(id: number, minutes = 30)          { return this.request<{ mountName: string; totalChanges: number; changes: MountChange[] }>('POST', `/server-mounts/${id}/scan-changes`, { minutes }); }

  // ─── Log Viewer ───────────────────────────────────────────────────────────
  getLogSources()                                    { return this.request<LogSource[]>('GET', '/logs/sources'); }
  createLogSource(data: Partial<LogSource>)          { return this.request<LogSource>('POST', '/logs/sources', data); }
  deleteLogSource(id: number)                        { return this.request<{ success: boolean }>('DELETE', `/logs/sources/${id}`); }
  readLog(sourceId: number, lines?: number)          { return this.request<{ lines: string[]; total: number }>('GET', `/logs/read/${sourceId}${lines ? `?lines=${lines}` : ''}`); }
  readLogByPath(filePath: string, lines?: number)    { return this.request<{ lines: string[]; total: number }>('POST', '/logs/read', { filePath, lines }); }
  searchLog(sourceId: number, q: string)             { return this.request<{ matches: { line: number; content: string }[] }>('GET', `/logs/search/${sourceId}?q=${encodeURIComponent(q)}`); }
  browseLogDir(dirPath: string)                      { return this.request<{ entries: { name: string; type: string; size: number }[] }>('POST', '/logs/browse', { dirPath }); }
  getLogStats(sourceId: number)                      { return this.request<{ totalLines: number; sizeBytes: number }>('GET', `/logs/stats/${sourceId}`); }

  // ─── DB Migration ────────────────────────────────────────────────────────
  dbMigrationConnect(data: { host: string; port: number; user: string; password: string; database: string }) { return this.request<{ success: boolean }>('POST', '/db-migration/connect', data); }
  dbMigrationTables(data: { sourceDb: string; targetDb: string })   { return this.request<{ missing: string[]; extra: string[] }>('POST', '/db-migration/tables', data); }
  dbMigrationColumns(data: { sourceDb: string; targetDb: string })  { return this.request<Record<string, { missing: string[]; extra: string[] }>>('POST', '/db-migration/columns', data); }
  dbMigrationSize(data: { sourceDb: string; targetDb: string })     { return this.request<Record<string, { source: number; target: number }>>('POST', '/db-migration/size', data); }
  dbMigrationRowCount(data: { sourceDb: string; targetDb: string }) { return this.request<Record<string, { source: number; target: number }>>('POST', '/db-migration/row-count', data); }
  dbMigrationKeys(data: { sourceDb: string; targetDb: string })     { return this.request<Record<string, unknown>>('POST', '/db-migration/keys', data); }
  dbMigrationIndexes(data: { sourceDb: string; targetDb: string })  { return this.request<Record<string, unknown>>('POST', '/db-migration/indexes', data); }
  dbMigrationChecksum(data: { sourceDb: string; targetDb: string }) { return this.request<Record<string, { match: boolean }>>('POST', '/db-migration/checksum', data); }

  // ─── Provisioning ────────────────────────────────────────────────────────
  getProvisionDefaults()                             { return this.request<Record<string, unknown>>('GET', '/provision/defaults'); }
  getProvisionSteps()                                { return this.request<{ id: string; name: string; order: number }[]>('GET', '/provision/steps'); }
  provisionPreflight(data: { serverId: number; config: Record<string, unknown> }) { return this.request<{ ready: boolean; warnings?: string[] }>('POST', '/provision/preflight', data); }
  startProvision(data: { serverId: number; config: Record<string, unknown> })     { return this.request<{ runId: number }>('POST', '/provision/deploy', data); }
  abortProvision(runId: number)                      { return this.request<{ success: boolean }>('POST', '/provision/abort', { runId }); }
  getProvisionHistory(limit?: number)                { return this.request<{ id: number; status: string; createdAt: string }[]>('GET', `/provision/history${limit ? `?limit=${limit}` : ''}`); }
  getProvisionRun(id: number)                        { return this.request<{ id: number; status: string; logs: string[] }>('GET', `/provision/runs/${id}`); }
  getProvisionClients()                              { return this.request<{ id: string; name: string }[]>('GET', '/provision/clients'); }

  // ─── SSL Checks ───────────────────────────────────────────────────────────
  sslScan()                                          { return this.request<{ domain: string; clientName: string; valid: boolean; expiresAt: string | null; daysLeft: number | null; issuer: string | null; subject: string | null; serialNumber: string | null; protocol: string | null; error: string | null; status: string; checkedAt: string }[]>('GET', '/ssl/scan'); }
  sslCheckDomain(domain: string)                     { return this.request<{ domain: string; valid: boolean; expiresAt: string | null; daysLeft: number | null; issuer: string | null; error: string | null; status: string }>('POST', '/ssl/check', { domain }); }

  // ─── Menu Permissions ─────────────────────────────────────────────────────
  getMenuPermissions()                               { return this.request<Record<string, boolean>>('GET', '/menu-permissions'); }
  updateMenuPermissions(permissions: Record<string, boolean>) { return this.request<{ success: boolean }>('PUT', '/menu-permissions', { permissions }); }
  getAllMenuItems()                                   { return this.request<{ key: string; label: string; group: string }[]>('GET', '/menu-permissions/all'); }
  getUserMenuPermissions(userId: string)              { return this.request<Record<string, boolean>>('GET', `/menu-permissions/user/${userId}`); }
  setUserMenuPermissions(userId: string, permissions: Record<string, boolean>) { return this.request<{ success: boolean }>('PUT', `/menu-permissions/user/${userId}`, { permissions }); }

  // ─── Menu Items (DB-driven sidebar) ──────────────────────────────────────
  getMenuItems()                                     { return this.request<{ sections: { title: string; color: string; items: { label: string; href: string; emoji: string }[] }[] }>('GET', '/menu-items'); }
  getMenuItemsAll()                                  { return this.request<{ items: MenuItem[] }>('GET', '/menu-items/all'); }
  createMenuItem(data: { label: string; href: string; emoji: string; sectionTitle: string; sectionColor: string; sortOrder?: number; visible?: boolean }) { return this.request<{ success: boolean; item: MenuItem }>('POST', '/menu-items', data); }
  updateMenuItem(id: number, data: Record<string, unknown>) { return this.request<{ success: boolean }>('PUT', `/menu-items/${id}`, data); }
  deleteMenuItem(id: number)                         { return this.request<{ success: boolean }>('DELETE', `/menu-items/${id}`); }
  seedMenuItems()                                    { return this.request<{ success: boolean; count?: number }>('POST', '/menu-items/seed'); }

  // ─── Deploy Configs ────────────────────────────────────────────────────────
  getDeployConfigs()                                 { return this.request<DeployConfig[]>('GET', '/deploy-configs'); }
  getDeployConfig(id: number)                        { return this.request<DeployConfig>('GET', `/deploy-configs/${id}`); }
  createDeployConfig(data: Partial<DeployConfig>)    { return this.request<DeployConfig>('POST', '/deploy-configs', data); }
  updateDeployConfig(id: number, data: Partial<DeployConfig>) { return this.request<DeployConfig>('PUT', `/deploy-configs/${id}`, data); }
  deleteDeployConfig(id: number)                     { return this.request<{ success: boolean }>('DELETE', `/deploy-configs/${id}`); }

  // ─── Organization & Members ────────────────────────────────────────────────
  getUsers()                                         { return this.request<Record<string, unknown>[]>('GET', '/org/members'); }
  inviteMember(data: { email: string; role?: string }) { return this.request<Record<string, unknown>>('POST', '/org/members/invite', data); }
  updateMemberRole(id: string, role: string)         { return this.request<Record<string, unknown>>('PUT', `/org/members/${id}/role`, { role }); }
  removeMember(id: string)                           { return this.request<{ success: boolean }>('DELETE', `/org/members/${id}`); }

  // ─── Audit Trail ──────────────────────────────────────────────────────────
  getAuditLogs(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<AuditLog[]>('GET', `/audit${qs}`);
  }
  createAuditLog(data: { action: string; resource: string; resourceId?: string; description?: string; metadata?: Record<string, unknown> }) {
    return this.request<AuditLog>('POST', '/audit', data);
  }
  getAuditStats()                                    { return this.request<Record<string, number>>('GET', '/audit/stats'); }
  getUserAuditLogs(userId: string, page?: number)    { return this.request<AuditLog[]>('GET', `/audit/user/${userId}${page ? `?page=${page}` : ''}`); }

  // ─── Testing Module ───────────────────────────────────────────────────────
  getTestTargets()                                   { return this.request<TestTarget[]>('GET', '/testing/targets'); }
  createTestTarget(data: { name: string; baseUrl: string; environment?: string }) {
    return this.request<TestTarget>('POST', '/testing/targets', data);
  }
  deleteTestTarget(id: number)                       { return this.request<{ success: boolean }>('DELETE', `/testing/targets/${id}`); }
  scanProject(data?: { projectPath?: string })       { return this.request<TestScanResult>('POST', '/testing/scan', data || {}); }
  getTestCases(category?: string) {
    const qs = category ? `?category=${category}` : '';
    return this.request<TestCase[]>('GET', `/testing/cases${qs}`);
  }
  deleteTestCase(id: number)                         { return this.request<{ success: boolean }>('DELETE', `/testing/cases/${id}`); }
  clearTestCases()                                   { return this.request<{ success: boolean }>('DELETE', '/testing/cases'); }
  runTests(targetId: number)                         { return this.request<TestRun>('POST', '/testing/run', { targetId }); }
  runFullTests(targetId: number, levels?: string[])  { return this.request<TestRun>('POST', '/testing/run-full', { targetId, levels: levels || ['L1','L2','L3'] }); }
  getTestRuns()                                      { return this.request<TestRun[]>('GET', '/testing/runs'); }
  getTestRun(id: number)                             { return this.request<TestRunDetail>('GET', `/testing/runs/${id}`); }
  getTestBugs(runId: number)                         { return this.request<TestBug[]>('GET', `/testing/bugs/${runId}`); }
  getTestLevels(runId: number)                       { return this.request<Record<string, { passed: number; failed: number; total: number }>>('GET', `/testing/runs/${runId}/levels`); }
  getTestModules()                                   { return this.request<{ module: string; total: number; passed: number; failed: number }[]>('GET', '/testing/modules'); }
  getTestModuleResults(runId: number)                 { return this.request<{ module: string; total: number; passed: number; failed: number }[]>('GET', `/testing/modules/${runId}`); }
  exportTestBugs(runId: number, severity?: string) {
    const qs = severity ? `?severity=${severity}` : '';
    return this.request<TestExportResult>('POST', `/testing/bugs/${runId}/export${qs}`);
  }
  getExportedTestBugs()                              { return this.request<TestBug[]>('GET', '/testing/bugs/exported'); }

  // ─── Auth ─────────────────────────────────────────────────────────────────
  async register(data: { name: string; email: string; password: string; orgName?: string }) {
    const res = await this.request<AuthResponse>('POST', '/auth/register', data);
    if (res.data?.token) this._saveToken(res.data.token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<AuthResponse>('POST', '/auth/login', data);
    if (res.data?.token) this._saveToken(res.data.token);
    return res;
  }

  getMe() { return this.request<{ user: AuthUser }>('GET', '/auth/me'); }

  async updateProfile(data: { name?: string; email?: string }) {
    const res = await this.request<{ token: string; user: AuthUser }>('PUT', '/auth/profile', data);
    if (res.data?.token) this._saveToken(res.data.token);
    return res;
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('POST', '/auth/change-password', data);
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') localStorage.removeItem('cortexo_token');
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('cortexo_token');
      if (t) this.token = t;
    }
  }

  private _saveToken(token: string) {
    this.setToken(token);
    if (typeof window !== 'undefined') localStorage.setItem('cortexo_token', token);
  }
  // ─── Source Profiles (reusable Git credentials) ────────────────────────────
  getSourceProfiles()                                { return this.request<Record<string, unknown>[]>('GET', '/source-profiles'); }
  createSourceProfile(data: Record<string, unknown>) { return this.request<Record<string, unknown>>('POST', '/source-profiles', data); }
  updateSourceProfile(id: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PATCH', `/source-profiles/${id}`, data); }
  deleteSourceProfile(id: string)                    { return this.request<{ success: boolean }>('DELETE', `/source-profiles/${id}`); }

  // ─── DB Profiles (reusable database credentials) ──────────────────────────
  getDbProfiles()                                    { return this.request<Record<string, unknown>[]>('GET', '/db-profiles'); }
  createDbProfile(data: Record<string, unknown>)     { return this.request<Record<string, unknown>>('POST', '/db-profiles', data); }
  updateDbProfile(id: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PATCH', `/db-profiles/${id}`, data); }
  deleteDbProfile(id: string)                        { return this.request<{ success: boolean }>('DELETE', `/db-profiles/${id}`); }

  // ─── Client Git Profiles (new client provisioning) ────────────────────────
  getClientGitProfiles()                                    { return this.request<Record<string, unknown>[]>('GET', '/client-git-profiles'); }
  createClientGitProfile(data: Record<string, unknown>)     { return this.request<Record<string, unknown>>('POST', '/client-git-profiles', data); }
  updateClientGitProfile(id: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PATCH', `/client-git-profiles/${id}`, data); }
  deleteClientGitProfile(id: string)                        { return this.request<{ success: boolean }>('DELETE', `/client-git-profiles/${id}`); }

  // ─── Client DB Profiles (new client DB provisioning) ──────────────────────
  getClientDbProfiles()                                     { return this.request<Record<string, unknown>[]>('GET', '/client-db-profiles'); }
  createClientDbProfile(data: Record<string, unknown>)      { return this.request<Record<string, unknown>>('POST', '/client-db-profiles', data); }
  updateClientDbProfile(id: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PATCH', `/client-db-profiles/${id}`, data); }
  deleteClientDbProfile(id: string)                         { return this.request<{ success: boolean }>('DELETE', `/client-db-profiles/${id}`); }

  // ─── WinBull Deploy Engine ────────────────────────────────────────────────
  deployWinbull(data: { projectId: number; serverId: number; settings: Record<string, unknown> }) {
    return this.request<{ success: boolean; slug: string; steps: Array<{ step: string; status: string; output?: string; error?: string; duration?: number }>; summary: { total: number; success: number; failed: number; skipped: number } }>('POST', '/winbull/deploy', data);
  }

  // ─── Alert Channels ──────────────────────────────────────────────────────
  getAlertChannels()                                   { return this.request<Record<string, unknown>[]>('GET', '/alert-channels'); }
  createAlertChannel(data: Record<string, unknown>)    { return this.request<Record<string, unknown>>('POST', '/alert-channels', data); }
  updateAlertChannel(id: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PUT', `/alert-channels/${id}`, data); }
  deleteAlertChannel(id: string)                       { return this.request<{ success: boolean }>('DELETE', `/alert-channels/${id}`); }
  testAlertChannel(id: string)                         { return this.request<{ success: boolean; message: string }>('POST', `/alert-channels/${id}/test`); }
  getAlertRules()                                      { return this.request<Record<string, unknown>[]>('GET', '/alert-rules'); }
  createAlertRule(data: Record<string, unknown>)       { return this.request<Record<string, unknown>>('POST', '/alert-rules', data); }
  getAlertHistory(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/alert-history${qs}`);
  }

  // ─── Real-Time Metrics Stream ─────────────────────────────────────────
  getMetricsSnapshot()                                 { return this.request<Record<string, unknown>>('GET', '/metrics/snapshot'); }

  /**
   * Subscribe to live metrics via SSE.
   * Returns an EventSource instance — call .close() to unsubscribe.
   *
   * Usage:
   *   const es = api.subscribeMetrics((event, data) => { console.log(event, data); });
   *   // later: es.close();
   */
  subscribeMetrics(onMessage: (event: string, data: Record<string, unknown>) => void): EventSource {
    const url = `${this.baseUrl}/v1/metrics/stream`;
    const es = new EventSource(url);

    const events = ['server_health', 'deploy_activity', 'alert_count', 'kpi_update', 'worker_status', 'metric'];
    for (const evt of events) {
      es.addEventListener(evt, (e: MessageEvent) => {
        try { onMessage(evt, JSON.parse(e.data)); } catch { /* ignore parse errors */ }
      });
    }

    es.addEventListener('connected', () => {
      console.log('[metrics-stream] connected');
    });

    es.addEventListener('reconnect', () => {
      console.log('[metrics-stream] server requested reconnect');
    });

    es.onerror = () => {
      console.warn('[metrics-stream] connection error — will auto-reconnect');
    };

    return es;
  }

  // ─── Knowledge Base ─────────────────────────────────────────────────────────
  getKnowledgeDocs(params?: Record<string, string>)  {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/knowledge/docs${qs}`);
  }
  createKnowledgeDoc(data: Record<string, unknown>)  { return this.request<Record<string, unknown>>('POST', '/knowledge/docs', data); }
  updateKnowledgeDoc(id: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PUT', `/knowledge/docs/${id}`, data); }
  deleteKnowledgeDoc(id: string)                     { return this.request<{ success: boolean }>('DELETE', `/knowledge/docs/${id}`); }
  getKnowledgeHistory()                              { return this.request<KnowledgeHistoryEntry[]>('GET', '/knowledge/history'); }
  getKnowledgeProviders()                            { return this.request<KnowledgeProvider[]>('GET', '/knowledge/providers'); }
  askKnowledge(data: { question: string; provider?: string }) { return this.request<KnowledgeAnswer>('POST', '/knowledge/ask', data); }
  submitKnowledgeFeedback(id: string, data: Record<string, unknown>) {
    return this.request<{ success: boolean }>('POST', `/knowledge/feedback/${id}`, data);
  }

  // ─── DevOps Docs ──────────────────────────────────────────────────────────
  getDevopsDocs(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<DevopsDoc[]>('GET', `/devops-docs${qs}`);
  }
  getDevopsDoc(id: string)                         { return this.request<DevopsDoc>('GET', `/devops-docs/${id}`); }
  getDevopsTools()                                  { return this.request<DevopsTool[]>('GET', '/devops-docs/tools'); }
  searchDevopsDocs(q: string)                       { return this.request<DevopsDoc[]>('GET', `/devops-docs/search?q=${encodeURIComponent(q)}`); }
  // Custom docs CRUD
  getCustomDocs()                                   { return this.request<CustomDoc[]>('GET', '/devops-docs/custom'); }
  createCustomDoc(data: Omit<CustomDoc, 'id' | 'createdAt' | 'updatedAt'>) { return this.request<CustomDoc>('POST', '/devops-docs/custom', data); }
  updateCustomDoc(id: number, data: Partial<CustomDoc>) { return this.request<CustomDoc>('PUT', `/devops-docs/custom/${id}`, data); }
  deleteCustomDoc(id: number)                       { return this.request<{ success: boolean }>('DELETE', `/devops-docs/custom/${id}`); }
  // Deployment checklists
  getChecklists(status?: string)                    { return this.request<Checklist[]>('GET', `/devops-docs/checklists${status ? `?status=${status}` : ''}`); }
  createChecklist(data: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>) { return this.request<Checklist>('POST', '/devops-docs/checklists', data); }
  updateChecklist(id: number, data: Partial<Checklist>) { return this.request<Checklist>('PUT', `/devops-docs/checklists/${id}`, data); }
  deleteChecklist(id: number)                       { return this.request<{ success: boolean }>('DELETE', `/devops-docs/checklists/${id}`); }

  // ─── Notification Preferences ───────────────────────────────────────────────
  getNotificationPrefs()                              { return this.request<Record<string, unknown>[]>('GET', '/notifications/preferences'); }
  updateNotificationPrefs(data: Record<string, unknown>) {
    return this.request<{ success: boolean }>('PUT', '/notifications/preferences', data);
  }

  // ─── Testing / QA ───────────────────────────────────────────────────────────
  getQaHistory(params?: Record<string, string>)      {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/testing/history${qs}`);
  }
  runTest(data: Record<string, unknown>)              { return this.request<Record<string, unknown>>('POST', '/testing/run', data); }

  // ── File Push (Patch Deploy) ───────────────────────────────
  // Note: getDeployConfigs() is defined in the Deploy Configs section above
  listSourceFiles(serverId: number, path: string, pattern?: string) {
    return this.request<string[]>('POST', '/file-push/list-files', { serverId, path, pattern });
  }
}

class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const api = new ApiClient(API_BASE);
export { ApiError };
export type { ApiResponse };
