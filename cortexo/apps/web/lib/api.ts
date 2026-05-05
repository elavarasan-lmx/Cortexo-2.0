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
    if (!res.ok) throw new ApiError(json.error || 'Request failed', res.status, json);
    return json;
  }

  // ─── Projects ─────────────────────────────────────────────────────────────
  getProjects()                                      { return this.request<Project[]>('GET', '/projects?limit=100'); }
  getProject(id: string)                             { return this.request<Project>('GET', `/projects/${id}`); }
  createProject(data: CreateProjectInput)            { return this.request<Project>('POST', '/projects', data); }
  deleteProject(id: string)                          { return this.request<{ success: boolean }>('DELETE', `/projects/${id}`); }
  updateProject(id: string, data: Partial<CreateProjectInput>) { return this.request<Project>('PATCH', `/projects/${id}`, data); }

  // ─── Pipelines ────────────────────────────────────────────────────────────
  getPipelines()                                     { return this.request<Pipeline[]>('GET', '/pipelines'); }
  getPipeline(id: string)                            { return this.request<Pipeline>('GET', `/pipelines/${id}`); }
  createPipeline(data: Partial<Pipeline>)            { return this.request<Pipeline>('POST', '/pipelines', data); }
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
  })                                                 { return this.request<{ id: string; status: string }>('POST', '/deployments', data); }
  rollbackDeployment(id: string)                     { return this.request<Deployment>('POST', `/deployments/${id}/rollback`); }
  deleteDeployment(id: string)                       { return this.request<{ success: boolean }>('DELETE', `/deployments/${id}`); }
  updateDeployment(id: string, data: { environment?: string; branch?: string; commitMessage?: string; status?: string; strategy?: string }) {
    return this.request<Deployment>('PUT', `/deployments/${id}`, data);
  }

  // ─── Canary Deployments ────────────────────────────────────────────────────
  createCanary(data: { deploymentId: string; projectId: string; branch: string; environment: string; autoPromote: boolean; autoRollbackThreshold: number }) {
    return this.request<Record<string, unknown>>('POST', '/deployments/canary', data);
  }
  getCanaries()                                      { return this.request<Record<string, unknown>[]>('GET', '/deployments/canary'); }
  promoteCanary(id: string)                          { return this.request<Record<string, unknown>>('POST', `/deployments/canary/${id}/promote`); }
  rollbackCanary(id: string)                         { return this.request<Record<string, unknown>>('POST', `/deployments/canary/${id}/rollback`); }

  // ─── Deploy Targets ───────────────────────────────────────────────────────
  getDeployTargets()                                 { return this.request<DeployTarget[]>('GET', '/deploy-targets'); }
  createDeployTarget(data: Partial<DeployTarget>)    { return this.request<DeployTarget>('POST', '/deploy-targets', data); }
  testDeployTarget(id: string)                       { return this.request<{ success: boolean; message: string; details?: Record<string, unknown>; durationMs: number }>('POST', `/deploy-targets/${id}/test`); }
  deleteDeployTarget(id: string)                     { return this.request<{ success: boolean }>('DELETE', `/deploy-targets/${id}`); }
  testServerSSH(id: number)                          { return this.request<{ success: boolean; message: string; details?: Record<string, unknown>; durationMs: number }>('POST', `/servers/${id}/test-ssh`); }

  // ─── Errors ───────────────────────────────────────────────────────────────
  getErrors(params?: { projectId?: string; status?: string; severity?: string }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<TrackedError[]>('GET', `/errors${qs}`);
  }
  getError(id: string)                               { return this.request<TrackedError>('GET', `/errors/${id}`); }
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

  // ─── Source Registry ──────────────────────────────────────────────────────
  getSources()                                       { return this.request<Record<string, unknown>[]>('GET', '/sources'); }
  getSource(slug: string)                            { return this.request<Record<string, unknown>>('GET', `/sources/${slug}`); }
  createSource(data: Record<string, unknown>)        { return this.request<Record<string, unknown>>('POST', '/sources', data); }
  getSourceSchema(slug: string)                      { return this.request<Record<string, unknown>>('GET', `/sources/${slug}/schema`); }
  getSourceManifest(slug: string)                    { return this.request<Record<string, unknown>>('GET', `/sources/${slug}/manifest`); }

  // ─── Client Configs ────────────────────────────────────────────────────────
  getClientConfigs(params?: { sourceId?: number; status?: string; limit?: number }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/client-configs${qs}`);
  }
  getClientConfig(slug: string)                      { return this.request<Record<string, unknown>>('GET', `/client-configs/${slug}`); }
  createClientConfig(data: Record<string, unknown>)  { return this.request<Record<string, unknown>>('POST', '/client-configs', data); }
  updateClientConfig(slug: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PUT', `/client-configs/${slug}`, data); }
  deleteClientConfig(slug: string)                   { return this.request<{ success: boolean }>('DELETE', `/client-configs/${slug}`); }
  cloneClientConfig(slug: string, data: { newSlug: string; newDisplayName: string; newDomain?: string }) {
    return this.request<Record<string, unknown>>('POST', `/client-configs/${slug}/clone`, data);
  }
  renderClientConfig(slug: string)                   { return this.request<{ rendered: string; clientSlug: string; sourceVersion: string }>('GET', `/client-configs/${slug}/render`); }
  validateClientConfig(data: { sourceSlug: string; configData: Record<string, unknown> }) {
    return this.request<{ valid: boolean; errors?: string[] }>('POST', '/client-configs/validate', data);
  }
  getClientConfigHistory(slug: string, limit?: number) {
    return this.request<Record<string, unknown>[]>('GET', `/client-configs/${slug}/history${limit ? `?limit=${limit}` : ''}`);
  }
  getClientConfigStats()                             { return this.request<Record<string, number>>('GET', '/client-configs/stats/summary'); }

  // ─── Drift Detection ──────────────────────────────────────────────────────
  scanClientDrift(slug: string, sshData: { host: string; username: string; port?: number; privateKey?: string; password?: string; remotePath: string }) {
    return this.request<{ status: string; driftedFiles: number; totalFiles: number; details: Record<string, unknown>[] }>('POST', `/client-configs/${slug}/scan-drift`, sshData);
  }
  getClientDriftReport(slug: string)                 { return this.request<Record<string, unknown>>('GET', `/client-configs/${slug}/drift-report`); }
  getClientDriftHistory(slug: string, limit?: number) {
    return this.request<Record<string, unknown>[]>('GET', `/client-configs/${slug}/drift-history${limit ? `?limit=${limit}` : ''}`);
  }

  // ─── Health Checks ───────────────────────────────────────────────────────
  runHealthCheckAll()                                { return this.request<{ results: { url: string; status: number; ok: boolean; responseTimeMs: number }[] }>('POST', '/health/check-all'); }
  checkSingleUrl(url: string)                       { return this.request<{ url: string; status: number; ok: boolean; responseTimeMs: number }>('POST', '/health/check-url', { url }); }
  controlHealthScheduler(action: 'start' | 'stop', intervalMinutes?: number) {
    return this.request<{ action: string; intervalMinutes?: number; status: string }>('POST', '/health/scheduler', { action, intervalMinutes });
  }

  // ─── DB Schema Validation ────────────────────────────────────────────────
  validateClientSchema(slug: string, data: {
    goldenHost: string; goldenUsername: string; goldenPort?: number; goldenKey?: string; goldenPassword?: string; goldenDb: string;
    clientHost: string; clientUsername: string; clientPort?: number; clientKey?: string; clientPassword?: string; clientDb: string;
  }) {
    return this.request<{ match: boolean; missingTables: string[]; extraTables: string[]; columnDiffs: Record<string, { missing: string[]; extra: string[] }> }>('POST', `/client-configs/${slug}/validate-schema`, data);
  }

  // ─── Log Aggregation ─────────────────────────────────────────────────────
  tailClientLogs(slug: string, sshData: { host: string; username: string; port?: number; privateKey?: string; password?: string; logPath?: string; lines?: number }) {
    return this.request<{ lines: string[]; total: number }>('POST', `/client-configs/${slug}/tail-logs`, sshData);
  }

  // ─── Fix Propagation ─────────────────────────────────────────────────────
  prepareSourceUpdate(sourceSlug: string)            { return this.request<{ ready: boolean; changes: string[]; version: string }>('GET', `/sources/${sourceSlug}/prepare-update`); }
  deployClientUpdate(slug: string, sshData: { host: string; username: string; port?: number; privateKey?: string; password?: string; remotePath: string }) {
    return this.request<{ success: boolean; filesUpdated: number; status: string }>('POST', `/client-configs/${slug}/deploy-update`, sshData);
  }
  saveSourceCheckpoint(sourceSlug: string)           { return this.request<{ success: boolean; version: string }>('POST', `/sources/${sourceSlug}/checkpoint`); }

  // ─── Module Testing ──────────────────────────────────────────────────────
  discoverModules(sourceSlug: string)                { return this.request<{ modules: { controller: string; path: string }[] }>('GET', `/sources/${sourceSlug}/modules`); }
  testSingleModule(data: { clientSlug: string; clientUrl: string; sourceSlug: string; controller: string; sessionCookie?: string }) {
    return this.request<{ controller: string; url: string; status: number; ok: boolean; responseTimeMs: number }>('POST', '/module-test/single', data);
  }
  testAllModules(data: { clientSlug: string; clientUrl: string; sourceSlug: string; sessionCookie?: string; layer?: 'admin' | 'web' }) {
    return this.request<{ results: { controller: string; url: string; status: number; ok: boolean; responseTimeMs: number }[]; summary: { total: number; passed: number; failed: number } }>('POST', '/module-test/full', data);
  }

  // ─── Source Sync ──────────────────────────────────────────────────────────
  getSyncHistory(params?: { status?: string; limit?: number }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<SyncHistory[]>('GET', `/sync${qs}`);
  }
  triggerSync(data: { clientId: string; branch?: string })     { return this.request<SyncHistory>('POST', '/sync/trigger', data); }
  getSyncClients()                                   { return this.request<SyncClient[]>('GET', '/sync/clients'); }
  createSyncClient(data: Partial<SyncClient>)        { return this.request<SyncClient>('POST', '/sync/clients', data); }
  getSyncExcludeRules()                              { return this.request<{ id: number; pattern: string; is_active: boolean }[]>('GET', '/sync/exclude-rules'); }
  createSyncExcludeRule(data: { pattern: string })   { return this.request<{ id: number }>('POST', '/sync/exclude-rules', data); }
  toggleSyncExcludeRule(id: number, active: boolean) { return this.request<{ success: boolean }>('PATCH', `/sync/exclude-rules/${id}`, { is_active: active }); }
  deleteSyncExcludeRule(id: number)                  { return this.request<{ success: boolean }>('DELETE', `/sync/exclude-rules/${id}`); }
  getDivergenceLatest()                              { return this.request<Record<string, unknown>>('GET', '/sync/analyze/latest'); }
  getDivergence(clientId: string)                    { return this.request<Record<string, unknown>>('GET', `/sync/analyze/${clientId}`); }
  getSyncDeployments(params?: { environment?: string; status?: string }) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<Deployment[]>('GET', `/sync/deployments${qs}`);
  }
  createSyncDeploy(data: { clientId: string; environment: string }) { return this.request<Deployment>('POST', '/sync/deploy', data); }
  approveSyncDeploy(id: number)                      { return this.request<{ success: boolean }>('POST', `/sync/approvals/${id}/approve`); }
  rejectSyncDeploy(id: number, reason?: string)      { return this.request<{ success: boolean }>('POST', `/sync/approvals/${id}/reject`, { reason }); }

  // ─── Servers ──────────────────────────────────────────────────────────────
  getServers()                                       { return this.request<Server[]>('GET', '/servers'); }
  getServer(id: number)                              { return this.request<Server>('GET', `/servers/${id}`); }
  createServer(data: Partial<Server>)                { return this.request<Server>('POST', '/servers', data); }
  updateServer(id: number, data: Partial<Server>)    { return this.request<Server>('PUT', `/servers/${id}`, data); }
  deleteServer(id: number)                           { return this.request<{ success: boolean }>('DELETE', `/servers/${id}`); }
  getServerResourcesLatest()                         { return this.request<Record<string, unknown>[]>('GET', '/servers/resources/latest'); }
  getServerResourceHistory(ip: string)               { return this.request<Record<string, unknown>[]>('GET', `/servers/resources/${ip}/history`); }
  getServerProjectCounts()                           { return this.request<Record<string, number>>('GET', '/servers/project-counts'); }

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

  // ─── Deploy Configs ────────────────────────────────────────────────────────
  getDeployConfigs()                                 { return this.request<DeployConfig[]>('GET', '/deploy-configs'); }
  getDeployConfig(id: number)                        { return this.request<DeployConfig>('GET', `/deploy-configs/${id}`); }
  createDeployConfig(data: Partial<DeployConfig>)    { return this.request<DeployConfig>('POST', '/deploy-configs', data); }
  updateDeployConfig(id: number, data: Partial<DeployConfig>) { return this.request<DeployConfig>('PUT', `/deploy-configs/${id}`, data); }
  deleteDeployConfig(id: number)                     { return this.request<{ success: boolean }>('DELETE', `/deploy-configs/${id}`); }

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

  // ─── Cron Jobs ────────────────────────────────────────────────────────────
  getCronJobs(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/cron-jobs${qs}`);
  }
  getCronJob(id: string)                               { return this.request<Record<string, unknown>>('GET', `/cron-jobs/${id}`); }
  createCronJob(data: Record<string, unknown>)         { return this.request<Record<string, unknown>>('POST', '/cron-jobs', data); }
  updateCronJob(id: string, data: Record<string, unknown>) { return this.request<Record<string, unknown>>('PUT', `/cron-jobs/${id}`, data); }
  deleteCronJob(id: string)                            { return this.request<{ success: boolean }>('DELETE', `/cron-jobs/${id}`); }
  runCronJob(id: string)                               { return this.request<Record<string, unknown>>('POST', `/cron-jobs/${id}/run`); }
  getCronExecutions(jobId: string, params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/cron-jobs/${jobId}/executions${qs}`);
  }

  // ─── Analytics ────────────────────────────────────────────────────────────
  getAnalyticsSummary()                                { return this.request<Record<string, unknown>>('GET', '/analytics/summary'); }
  getAnalyticsDaily(days?: number)                     { return this.request<Record<string, unknown>[]>('GET', `/analytics/daily${days ? `?days=${days}` : ''}`); }
  getAnalyticsErrorTrends(days?: number)               { return this.request<Record<string, unknown>[]>('GET', `/analytics/errors/trends${days ? `?days=${days}` : ''}`); }
  getAnalyticsServerUsage()                            { return this.request<Record<string, unknown>[]>('GET', '/analytics/servers/usage'); }
  getAnalyticsDeployFrequency()                        { return this.request<Record<string, unknown>[]>('GET', '/analytics/deployments/frequency'); }
  getAnalyticsHealthScore()                            { return this.request<Record<string, unknown>>('GET', '/analytics/health-score'); }

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

  // ─── Deprecation Scanner ─────────────────────────────────────────────────
  getDeprecationResults(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/deprecation/results${qs}`);
  }
  getDeprecationSummary()                              { return this.request<Record<string, unknown>>('GET', '/deprecation/summary'); }
  triggerDeprecationScan(data: { projectId: number; type?: string }) { return this.request<{ scanId: string }>('POST', '/deprecation/scan', data); }
  suppressDeprecation(id: string, data?: { reason?: string; until?: string }) { return this.request<{ success: boolean }>('POST', `/deprecation/${id}/suppress`, data); }
  getDeprecationScans(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/deprecation/scans${qs}`);
  }

  // ─── AI Judge Scores ─────────────────────────────────────────────────────
  getJudgeScores(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Record<string, unknown>[]>('GET', `/judge-scores${qs}`);
  }
  getJudgeScore(id: string)                            { return this.request<Record<string, unknown>>('GET', `/judge-scores/${id}`); }
  submitJudgeScore(data: Record<string, unknown>)      { return this.request<Record<string, unknown>>('POST', '/judge-scores', data); }
  getJudgeScoreStats()                                 { return this.request<Record<string, unknown>>('GET', '/judge-scores/stats/aggregate'); }
  triggerJudgeScore(data: { targetType: string; targetId: string }) { return this.request<{ jobId: string }>('POST', '/judge-scores/trigger', data); }

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
