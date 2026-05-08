# 🏗️ IDP Architecture Overview — Cortexo Platform

> **Version**: 4.0 | **Author**: System Architect | **Date**: 2026-05-01
> **Scope**: Multi-tenant Internal Developer Platform for 70+ SaaS client deployments

---

## 1. Executive Summary

Cortexo IDP is a **Control Plane** that orchestrates deployments, pipelines, observability, and infrastructure across 70+ tenant environments (the **Data Plane**). It is not a PaaS — it is an **engineering intelligence layer** that sits above your existing infrastructure and provides unified visibility, automation, and governance.

> [!IMPORTANT]
> This system is designed for **real-world production constraints**: flaky networks, partial failures, concurrent deployments, credential rotation, and operator error. Every design decision assumes things WILL fail.

---

## 2. Architectural Principles

| Principle | Implementation |
|---|---|
| **Queue-First** | Every operation > 100ms is a background job. API returns `job_id` immediately. Never blocks on enqueue. |
| **Idempotent Everything** | Every deployment, pipeline run, and webhook carries an idempotency key. Duplicate execution is safe. |
| **Tenant Isolation** | PostgreSQL RLS + namespaced Redis keys + scoped Vault paths + ClickHouse `tenant_id` partition + WebSocket channel isolation. |
| **Event-Driven** | All cross-module communication via Redis Streams events — never direct function calls between workers. |
| **Immutable Audit** | Audit log is append-only. No UPDATE/DELETE on `audit_events`. Partitioned by month. App role has INSERT only. |
| **Fail-Safe Defaults** | Unknown states → halt and alert. Never auto-proceed on ambiguous failure. |
| **Soft Delete** | `deleted_at` timestamp on all user-facing entities — no hard deletes except on scheduled data purge (audited). |
| **Opinionated Decisions** | When two paths exist, pick one and justify it. No fence-sitting. |

---

## 3. Tech Stack (Fixed — Do Not Substitute)

| Component | Technology | Role | Key Constraint |
|---|---|---|---|
| Backend API | Node.js + Fastify | Central orchestrator | Must not be on the log ingestion path |
| Frontend | Next.js (App Router) | SSR dashboards + WebSocket client | RBAC-controlled component visibility |
| Primary Database | PostgreSQL + Drizzle ORM | All structured application data | RLS enabled on every table |
| Queue System | Redis + BullMQ-style workers | All async operations | Workers must be idempotent |
| Realtime | WebSockets (bidirectional) | Live deployment status, log streaming, heartbeat | Stateless server design for horizontal scale |
| CI/CD Trigger | GitHub Actions | External pipeline trigger | Webhook verified by HMAC-SHA256 |
| Containerization | Docker | All services containerized | No host-level dependencies |
| Monorepo | Turborepo (npm workspaces) | Single repo, multiple packages | Build caching critical for CI speed |
| Secret Management | HashiCorp Vault or AWS Secrets Manager | All credentials | Never store raw values in Postgres |
| **Log Storage** | **ClickHouse (OLAP)** | **All log data** | **API queries only — never ingests** |
| **Log Shipping** | **Fluent Bit or Vector** | **Agent on each server** | **Bypasses API entirely, ships direct to ClickHouse** |
| Connection Pooling | PgBouncer | DB connection management | 20 connections per worker type max |
| Metrics | Prometheus + Grafana | API, worker, and DB pool metrics | Scrape interval: 15 seconds |
| Tracing | OpenTelemetry | Distributed traces across pipeline steps | Trace ID propagated through event bus |

> [!CAUTION]
> **API never ingests logs.** Logs ship directly from managed servers via Fluent Bit/Vector to ClickHouse over TLS. API only QUERIES ClickHouse for log retrieval.

---

## 4. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CONTROL PLANE                                  │
│                                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────────────┐    │
│  │  Next.js App  │   │  Fastify API │   │  BullMQ Workers (N pods)  │    │
│  │  (Presentation)│   │  (API Layer) │   │  (Background Processing)  │    │
│  └──────┬───────┘   └──────┬───────┘   └─────────┬─────────────────┘    │
│         │                   │                      │                      │
│         │      ┌────────────┴────────────┐        │                      │
│         │      │      Redis Cluster      │────────┘                      │
│         │      │  (Queues/Streams/Locks) │                               │
│         │      └─────────────────────────┘                               │
│         │                   │                                             │
│         │      ┌────────────┴────────────┐   ┌─────────────────────┐    │
│         └─────▶│   PostgreSQL (Primary)  │   │   ClickHouse (OLAP) │    │
│                │   + Read Replicas       │   │   (Log Storage)     │    │
│                │   + PgBouncer           │   └──────────▲──────────┘    │
│                └─────────────────────────┘              │                │
│                                                         │                │
│  ┌──────────────────────────────────────────────────────│────────────┐   │
│  │              Observability Layer                      │            │   │
│  │  Prometheus (Metrics) │ OpenTelemetry (Traces) │ Grafana (Viz)   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                               │                          │
                     ┌─────────┴─────────┐    ┌──────────┘
                     │   DATA PLANE       │    │ Fluent Bit/Vector
                     │                    │    │ (logs ship DIRECT
                     │  ┌──────────────┐  │    │  to ClickHouse
                     │  │ Client Env 1 │──┼────┘   over TLS:9440)
                     │  │ (Agent+FB)   │  │
                     │  └──────────────┘  │
                     │  ┌──────────────┐  │
                     │  │ Client Env 2 │  │
                     │  │ (Agent+FB)   │  │
                     │  └──────────────┘  │
                     │       ...          │
                     │  ┌──────────────┐  │
                     │  │ Client Env N │  │
                     │  │ (Agent+FB)   │  │
                     │  └──────────────┘  │
                     └────────────────────┘
```

---

## 5. Layer-by-Layer Breakdown

### 5.1 Layer 1 — Presentation (Next.js App Router)

| Concern | Decision |
|---|---|
| **Rendering** | SSR dashboards with hydration for real-time data segments only — not full page. Client Components for pipeline visualizer, terminal. |
| **Auth** | JWT with **1h access token + 7d rotating refresh token**. httpOnly cookies. Immediate invalidation on role change via `sessions` table. |
| **Real-time** | WebSocket per session: deployment status, log streams, heartbeat indicators, notification toasts. |
| **Routing** | `/[tenantSlug]/clients/[clientId]/...` — tenant always in URL. |
| **RBAC UI** | Component visibility controlled by role + permission matrix fetched at session start. Dynamic sidebar per role with pending-action badges. |
| **Theme** | Dark-first with AAA accessible contrast ratios. Risk indicators use shape + colour (never colour alone). |
| **Navigation** | Command palette: `Cmd/Ctrl+K`, fuzzy search across clients, deployments, bugs, servers, credentials (name only). Keyboard-navigable. |
| **Forms** | Auto-save draft system: all multi-step forms persist to `onboarding_states` table with resume token on every 500ms debounce. |
| **Loading** | Skeleton screens for initial SSR load. Spinner overlay for modal actions. Progress bar for long async operations. Never blank screens. |
| **Validation** | Inline, non-blocking — min/max, format, duplicate prevention, async uniqueness check. Runs on blur + on submit. |
| **Failure** | WebSocket disconnect: fall back to polling every 5s, surface stale-data banner. SSR timeout: skeleton + cached last-known data + warning. |

**Key Pages**: System Command Center, Client Dashboard, Pipeline Visualizer, Bug Timeline + RCA, Drift/Comparison UI, Real-time Log Viewer, Terminal, Testing Module UI, Onboarding Wizard, Audit Log Viewer, Admin Panel (DLQ review), Notification Centre, Source Sync Dashboard, Config Manager, Fleet Test Report, Divergence Heatmap, Menu Permissions Grid, SLA Dashboard, Cost Tracker + Invoice Manager, Schema Comparison UI, Live File Log Viewer, Post-Deploy Script Registry, Migration Tracking Dashboard, Permission Audit Report.

### 5.2 Layer 2 — API (Fastify)

**Request Lifecycle**: `Auth → Tenant Resolution → RBAC → Rate Limit → Validation → Handler → Audit Log`

- Central orchestration layer — all client-initiated operations enter here, handled sync or enqueued as background jobs
- JWT-based auth with **refresh token rotation; session invalidation on role change** (revoked in `sessions` table)
- RBAC enforced at route level: every endpoint declares required resource + action (view/add/edit/delete); middleware checks before handler
- **Webhook ingestion for Git providers (GitHub, GitLab, Bitbucket) — verified by HMAC-SHA256 signature before any processing**
- Per-tenant rate limiting: configurable max concurrent deployments, max pipeline runs/hour, max DB query panel calls/day
- **Circuit breakers on all outbound calls**: Git providers, Vault, managed servers — open after 5 failures in 30s, half-open after 60s
- **API never ingests logs** — logs shipped directly from servers to ClickHouse
- **API queries ClickHouse for log retrieval only** — tenant_id filter enforced server-side, cannot be overridden
- WebSocket gateway: manages client subscriptions to deployment events, log streams, heartbeat channels
- Returns `job_id` immediately for any operation > 100ms — client polls or subscribes for result
- `X-Idempotency-Key` on all mutating endpoints (cached 24h in Redis)

**Failure domain**: Vault circuit open → abort deploy, return 503 with VAULT_UNREACHABLE. Git provider unreachable → webhook queued with 5-minute retry, UI shows degraded-mode banner.

### 5.3 Layer 3 — Background Processing (BullMQ Workers) — CRITICAL

> Every worker must be idempotent. Re-running any job with the same job ID must produce the same outcome. This is not optional — BullMQ guarantees at-least-once delivery, never exactly-once.

| Worker | Responsibility | Retry Strategy | Idempotency Mechanism | Special Constraint |
|---|---|---|---|---|
| **Deployment** | Execute deploy steps in order | Exponential backoff, max 3 | Job ID = deployment_id — duplicate insert ignored | Distributed lock per client+env for full duration |
| **Pipeline step** | Execute individual DAG steps; resolve parallel groups | Step-level retry, not full pipeline | Step ID check — status check before execute | Cancel all downstream on failure |
| **Migration** | Execute DB schema migrations | **One retry only — manual DBA review after** | Migration version check before apply | Snapshot DB before any migration |
| **Drift scanner** | Compare source vs deployed state | No retry — log and alert | Store scan_id — skip if same in last 10 min | Runs on deploy completion + cron (every 6h) |
| **Notification** | Route alerts to channels | 3 retries with exponential backoff | Dedup key = event_id + channel — skip if sent | Fall back to email if primary channel fails |
| **RCA (Phase 2)** | Analyse logs + diffs for root cause | 1 retry — expensive LLM call | Store rca_id — skip if exists for bug_id | Result stored even if partial; never blocks bug workflow |
| **Changelog** | Generate deploy changelog from commits | 2 retries | Keyed to deployment_id — skip if exists | Falls back to raw commit list if categorisation fails |
| **Heartbeat monitor** | Check server ping timestamps | No retry — fire event directly | Stateless — reads heartbeats table on each tick | Runs every 60 seconds. 2 missed = critical. |
| **Health score** | Recompute client health_score (0-100) | 2 retries | Versioned with updated_at — skip if same | Push updated score to dashboard via WebSocket |
| **Preview env (Phase 2b)** | Provision/teardown ephemeral envs | No retry on teardown (idempotent delete) | Env ID keyed to PR number + tenant_id | Hard TTL: 72h; cleanup scheduler runs every 30 min |
| **Source sync** | Hub → client repo sync via Git API | 3 retries with exponential backoff | Keyed to sync_config_id + commit_sha | Stale cleanup: auto-fail syncs > 15 min. Concurrency limited by GitHub API rate. |
| **Config renderer** | Template + client data → config file | 2 retries | Keyed to client_config_id + template version | Pre-render validation: fail if unresolved tokens. Auto-rollback from config_history. |
| **Module tester** | HTTP endpoint validation against live clients | No retry — log partial results | Keyed to client_id + test timestamp | Sequential per-module (safe GET only). Session cookie refresh before run. |
| **Divergence scanner** | Client repo vs hub comparison | No retry — log and alert | Keyed to client_id + analysis date | Runs post-sync + scheduled (daily). Feeds divergence score. |
| **SLA calculator** | Monthly uptime % per client | 2 retries | Keyed to client_id + month_year | Cron: 1st of month. Also on-demand. |
| **Stale deploy expiry** | Auto-expire pending/running deploys | No retry — stateless cron | Stateless scan per run | Runs every hour. Broadcasts WebSocket on transition. |
| **Schema comparator** | Compare 2 DB schemas | 1 retry | Keyed to comparison_id | Read-only DB connections only. Timeout: 60s. |
| **Post-deploy runner** | Execute post-deploy scripts | No retry — log and continue | Keyed to deployment_id | Individual script timeout: 60s. Failure ≠ deploy failure. |
| **Permission audit** | Verify/fix server dir permissions | 1 retry | Keyed to server_id + scan date | SSH-based. Production requires admin confirmation. Weekly cron. |
| **Stats aggregator** | Daily deploy/sync metrics rollup | 1 retry | Keyed to date (YYYY-MM-DD) | Midnight UTC cron. Upsert into `daily_stats`. |
| **Provisioner** | Full 17-step client onboarding via SSH | No retry — atomic run with preflight validation | Keyed to provision_run_id. Orphan cleanup on restart. | Distributed lock per server_ip. Real-time Socket.IO streaming. Abort support. |
| **Migration executor** | Execute shell migration scripts with streaming output | No retry — single-process guarantee | Keyed to migration_run_id. Kill existing before new. | Socket.IO real-time stdout/stderr. SIGKILL cancellation. Script validation before spawn. |
| **Cleanup** | Data retention enforcement, old artifact pruning, expired heartbeat cleanup | 1 retry | Stateless — idempotent per retention window | Daily schedule (02:00 UTC). Enforces retention policies from data model. |

**Dead-letter queue policy**: Every queue has a DLQ. Jobs exceeding max retries land in DLQ and trigger admin alert immediately. DLQ items are **never auto-retried** — they require human review via admin panel. DLQ depth is a first-class health metric on the System Command Center. DLQ depth > 10 triggers platform warning.

### 5.4 Layer 4 — Data (PostgreSQL + Drizzle)

- All tables include `tenant_id` as non-nullable indexed column
- **Row-Level Security (RLS)** enabled on all tables — app sets `app.current_tenant` at connection start
- RLS is the last line of defence — API also filters by tenant_id, but RLS cannot be bypassed by application bugs
- JSONB columns for flexible configs (env var references, pipeline step params, notification routing rules, module metadata)
- **Partitioning**: `audit_events` and `server_heartbeats` by month (RANGE on created_at); `pipeline_steps` by quarter
- **Read replica** for analytics, reporting, and log metadata queries — primary handles writes only
- **PgBouncer** connection pooling — max 20 connections per worker type; separate pools prevent one worker type starving others
- **Soft delete pattern**: `deleted_at` timestamp on all user-facing entities — no hard deletes except scheduled data purge (admin action, audited)
- **Data retention**: deployment metadata 24 months; audit_events permanent; heartbeats 90 days; preview env data purged on teardown

### 5.5 Layer 5 — Observability

| Component | Implementation |
|---|---|
| **Logs** | Fluent Bit/Vector on every managed server → ships enriched logs directly to ClickHouse over TLS on port 9440 |
| **Log Storage** | ClickHouse: partitioned by `(tenant_id, toYYYYMMDD(timestamp))`. Structured logs: deployment, application, error, server, user action |
| **Log Enrichment** | Agent enriches every log line with: server_id, client_id, tenant_id, environment, log_source, host, agent_version, timestamp (UTC) |
| **Log Query** | API provides query interface to ClickHouse — never writes logs itself. Enforces tenant_id filter server-side. |
| **Metrics** | Prometheus scrapes from API (request rates + latencies), workers (queue depths), and DB pools (utilisation). Scrape interval: 15s. |
| **Traces** | OpenTelemetry — distributed trace spans propagated through: API → event bus → worker → external calls. trace_id visible in log viewer. |
| **Heartbeat** | Heartbeat table in Postgres: one row per server, updated every 60s by agent — separate from ClickHouse for fast DB-level alerting |
| **Alerting** | Alertmanager or PagerDuty (Phase 2) — per-tenant notification rules |

---

## 6. Control Plane vs Data Plane

**Control Plane** owns: All business logic, pipeline orchestration, credential management (Vault), audit trail, auth/authz, event bus, analytics computation, session management.

**Data Plane** owns: Runtime deployment execution, local health metrics, log forwarding (Fluent Bit → ClickHouse), heartbeat reporting.

**Agent** (lightweight daemon per client server):
- Reports heartbeat every 60s to Postgres via API
- Accepts deployment commands from control plane (SSH or agent API)
- Zero business logic — pure execution

**Fluent Bit/Vector** (installed alongside agent):
- Tails: application stdout/stderr, deployment output, error log files, system syslog, Nginx/Apache access logs
- Enriches each log line with: `server_id`, `client_id`, `tenant_id`, `environment`, `log_source`, `timestamp`
- Buffers 1000 lines or 5 seconds (whichever first). Ships batch over TLS to ClickHouse HTTP interface.
- On ClickHouse unavailability: buffer to disk (default 1GB). Alert platform if buffer > 80%.
- **No logs pass through application API**

---

## 7. Communication Patterns

| Pattern | Used For | Implementation |
|---|---|---|
| Sync Request/Response | UI → API queries, CRUD | HTTP REST (Fastify) |
| Async Job Queue | Deployments, pipelines, migrations | BullMQ (Redis-backed) |
| Event Stream | Cross-module communication, real-time UI | Redis Streams + WebSocket |
| Distributed Lock | Deploy/rollback/migration mutex | Redis `SET NX PX` (Redlock) |
| Agent Communication | Control → client servers | SSH (primary) or agent gRPC |
| Log Shipping | Server → log store | Fluent Bit/Vector → ClickHouse (direct, no API, TLS) |
| **All internal comms** | **Service-to-service** | **TLS encrypted** |

---

## 8. Reliability Targets

| Metric | Target | Mechanism | Alert Threshold | Who Is Paged |
|---|---|---|---|---|
| API availability | 99.9% uptime | Circuit breakers + health check endpoint | < 99.5% over 5 min | On-call engineer |
| Pipeline execution | At-least-once delivery | Dead-letter queue + manual retry UI | DLQ depth > 5 items | Platform admin |
| Log delivery lag | Max 30 seconds | Fluent Bit persistent buffer + ClickHouse SLA | Lag > 60 seconds | Infra on-call |
| Rollback RTO | < 5 minutes total | Pre-validated snapshots + lock-first execution | > 8 minutes | Client lead + on-call |
| Audit log RPO | Zero data loss | Append-only + WAL-archived Postgres | Any gap detected | Security team |
| Secret access | < 500ms p99 | Cached short-lived token with TTL refresh | > 1 second p99 | Platform admin |
| Heartbeat alert latency | < 90 seconds to alert | 60s ping interval + 1 miss = warn, 2 = critical | > 3 minutes to alert | Client account owner |
| DLQ review SLA | < 4 hours acknowledgement | Admin notification + dashboard badge | > 4 hours unreviewed | Platform admin |
| Deploy lock timeout | 10 minutes max TTL | Redis SET NX PX 600000 | Manual release needed | Deploying engineer |
| Preview env cleanup | < 72h TTL | Scheduled cleanup worker with hard cap | Orphaned env > 80h | Platform admin |

---

## 9. Deployment Topology (Minimum Production)

| Component | Instances | Resources |
|---|---|---|
| Next.js App | 2 pods | 512MB RAM, 0.5 CPU |
| Fastify API | 3 pods | 1GB RAM, 1 CPU |
| BullMQ Workers | 4+ pods (scaled by queue depth) | 2GB RAM, 1 CPU |
| PostgreSQL Primary | 1 | 8GB RAM, 4 CPU, SSD |
| PostgreSQL Read Replica | 2 | 4GB RAM, 2 CPU |
| Redis Cluster | 3 primary + 3 replica nodes | 2GB RAM each |
| PgBouncer | 2 | 256MB RAM |
| ClickHouse | 1 cluster (3 nodes for HA) | 8GB RAM, 4 CPU, SSD |
| CDN | Managed | Next.js static export for public pages |

**Scaling triggers**:
- Worker autoscaling: queue depth > 50 items per worker instance
- API scaling: CPU > 70% over 5 min OR p95 > 200ms
- DB connection alert: any worker type consuming > 15 of 20 connections

---

## 10. Cross-Cutting Concerns

### Distributed Locking Protocol
```
Deploy lock key: lock::deploy::{tenant_id}::{client_id}::{environment}
Migration lock key: lock::migrate::{tenant_id}::{db_connection_id}

Lock TTL: 10 minutes (max expected deployment duration) — auto-expiry prevents deadlocks
Lock acquired before snapshot capture, held until completion or failure, released in finally block
If lock acquisition fails: job re-queued with 30s delay — max 3 attempts, then DLQ with LOCK_CONTENTION
Lock state visible in admin panel with manual release capability — admin role only, release action audited
Migration locks use SEPARATE namespace — never shared with deploy locks
```

### Idempotency Protocol
```
1. Client sends X-Idempotency-Key header on all mutating endpoints
2. Redis check → exists? Return cached response : Process + cache (TTL: 24h)
3. Workers carry idempotency_key, check completion status before executing
4. Status check at job start: if already completed, skip and ack
```

### Event Bus (Redis Streams)
All cross-module communication happens via events — direct worker-to-worker function calls are forbidden (cascading failure coupling).

| Event | Payload | Subscribers | Failure if no event |
|---|---|---|---|
| `deployment.started` | deployment_id, client_id, environment, triggered_by | Audit log, drift scanner, notification router | No audit trail, no notifications |
| `deployment.completed` | deployment_id, client_id, duration_ms, health_after | Changelog worker, health score worker, notification router | No changelog, stale health score |
| `deployment.failed` | deployment_id, client_id, failed_step, error_code | Notification router, RCA worker (Ph2), alert router | No failure notification |
| `deployment.rollback_triggered` | deployment_id, snapshot_id, triggered_by | Audit log, notification router, in-flight job coordinator | No audit, concurrent jobs not paused |
| `pipeline.step_failed` | pipeline_run_id, step_id, step_name, error_message | Notification router, pipeline worker (abort downstream) | Downstream steps continue on broken state |
| `bug.created` | bug_id, client_id, module_id, priority | Audit log, notification router, RCA worker (Ph2) | No RCA triggered, no team alert |
| `bug.resolved` | bug_id, deployment_id, resolved_by | Health score worker, changelog updater, notification router | Health score not updated |
| `server.heartbeat_missed` | server_id, client_id, last_seen_at | Alert router, affected client lookup, notification router | Silent server failure |
| `drift.detected` | client_id, environment, severity, module_list | Notification router, dashboard badge updater, audit log | Drift unknown until next manual scan |
| `credential.accessed` | credential_id, client_id, actor_id, vault_path | Audit log only — synchronous write before access proceeds | No credential access audit trail |
| `approval.required` | pipeline_run_id, approval_step_id, approvers | Notification router with deep link to approval UI | Approvers unaware, pipeline stalls silently |
| `approval.granted` | pipeline_run_id, approval_step_id, granted_by | Pipeline worker (resume execution) | Pipeline never resumes |

### Multi-Tenancy Isolation
- **PostgreSQL**: RLS with `app.current_tenant` session variable. Application cannot bypass.
- **Redis**: Namespaced keys `{type}::{tenant_id}::{entity_id}`
- **ClickHouse**: `tenant_id` as partition key + enforced filter in every API query
- **Vault**: Scoped paths `secrets/{tenant_id}/{client_id}/{credential_name}`
- **WebSocket**: Subscription channels namespaced by tenant_id — server validates on subscribe
- **Quotas**: Configurable per-tenant limits (concurrent deploys, pipeline runs/hr, query calls/day)

### Security
- **TLS everywhere**: All inter-service communication on TLS. ClickHouse port 9440 (TLS). Vault TLS. Log shipping TLS.
- **Webhook validation**: HMAC-SHA256 signature verification on all Git provider webhooks — 401 on mismatch, audit log written
- **JWT**: 1h access token, 7d rotating refresh token, invalidation on role change via `sessions` table revocation
- **Vault for ALL secrets**: No credentials in environment variables or config files. Raw values NEVER in Postgres.
- **Zero-trust DB query panel**: Parameterized queries only, read-only DB role (SELECT only), per-query audit log, admin-only access
- **Rate limiting**: Per-tenant and per-user, configurable by tenant admin. API returns 429 with Retry-After header on breach.
- **Terminal security**: Role-gated (developer+), full command log to ClickHouse, session recorded, alert on session > 2h

### WebSocket Authentication & Authorization

> Added during documentation audit (2026-05-08). Closes the gap between the 5 WS channel patterns
> defined in `07_ui_ux.md` and the auth strategy.

**Connection Authentication:**
1. Client connects to `/ws` endpoint with JWT in `Sec-WebSocket-Protocol` header or `?token=` query param
2. Server validates JWT on `connection` event — reject with 4001 if invalid/expired
3. Tenant ID extracted from JWT claims and set as connection metadata
4. Connection registered in Redis set `ws::connections::{tenant_id}` with TTL = token expiry

**Channel Subscription Authorization:**
1. Client sends `subscribe` message with channel pattern (e.g., `tenant::{id}::client::{id}`)
2. Server validates: (a) `tenant_id` in channel matches JWT, (b) user role permits entity access
3. Unauthorized subscribe → `error` frame with reason, connection stays alive
4. All channel subscriptions logged to audit (level=info, not persisted to DB)

**Connection Lifecycle:**
- Max connections per tenant: configurable (default 100)
- Max connections per user: configurable (default 10)
- Idle timeout: 5 minutes without activity → server disconnect
- Client heartbeat: every 30s ping/pong — 2 missed = disconnect
- Token refresh: client re-authenticates via `auth_refresh` message before JWT expires
- On role change: server revokes all WS connections for user (via `sessions` table event)

