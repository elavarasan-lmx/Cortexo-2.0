# ⚖️ Trade-offs, Risks & Security — Cortexo IDP (v4 Aligned)

---

## 1. Architectural Trade-offs

### Trade-off 1: Log Storage — Postgres JSONB vs ClickHouse

| Option | Pros | Cons |
|---|---|---|
| Postgres JSONB with partitioning | Simpler ops, single DB | Poor query perf at log volume for 70+ clients |
| **ClickHouse OLAP** ✅ (Chosen) | Superior query performance, full-text search, aggregation at scale | Complex ops, separate infrastructure |

**Decision**: ClickHouse. Log volume at 70+ clients exceeds Postgres practical limits for full-text search and aggregation. Logs never stored in Postgres.

### Trade-off 2: Secret Storage — Encrypted DB Column vs Vault

| Option | Pros | Cons |
|---|---|---|
| AES-256 encrypted Postgres column | Simpler, no external dependency | Blast radius of DB leak is catastrophic |
| **HashiCorp Vault** ✅ (Chosen) | Dynamic secrets, lease rotation, scoped access | Operational overhead, HA required |

**Decision**: Vault. Blast radius of DB leak is too high. Dynamic secrets and lease rotation justify the complexity. No credentials ever stored in application database — not even encrypted.

### Trade-off 3: Tenant Isolation — Schema-per-Tenant vs RLS

| Option | Pros | Cons |
|---|---|---|
| Separate schema per tenant | Strong isolation, per-tenant backup | Hard to migrate, operationally unsustainable at 70+ |
| **Shared schema + RLS** ✅ (Chosen) | Simpler ops, easier migrations | Slightly weaker isolation |

**Decision**: Shared schema + RLS. 70+ tenants makes separate schemas operationally unsustainable. RLS provides sufficient isolation with automated test suite validation.

### Trade-off 4: Event Bus — Direct Function Calls vs Redis Streams

| Option | Pros | Cons |
|---|---|---|
| Direct worker-to-worker calls | Simple | Cascading failures, tight coupling |
| **Redis Streams event bus** ✅ (Chosen) | Async, decoupled, independent scaling | Additional complexity |

**Decision**: Redis Streams. Direct coupling creates cascading failures. Events enable independent scaling and loose coupling between all modules.

### Trade-off 5: Preview Environments — Self-hosted vs Managed Provider

| Option | Pros | Cons |
|---|---|---|
| Self-hosted Docker + Traefik | Full control | Operational burden |
| **Managed provider (Railway/Fly.io)** ✅ (Chosen) | Simple, fast to ship | Ongoing cost |

**Decision**: Managed provider for Phase 2b. Engineering bandwidth is better spent on core platform. TTL + cost cap per tenant controls spend.

---

## 2. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Vault single point of failure** | High | High | Vault HA cluster; cached short-lived tokens; fallback alert if vault unreachable |
| 2 | **DB migration corruption mid-run** | Medium | High | Snapshot before every migration; no auto-retry; manual DBA review path |
| 3 | **Redis queue data loss on restart** | Low | High | Redis persistence (AOF); Redis cluster; job deduplication at worker level |
| 4 | **Tenant data bleed via RLS misconfiguration** | Low | High | Automated RLS test suite; security audit before launch; separate read role per tenant |
| 5 | **ClickHouse query performance at scale** | Medium | Medium | Query result cache for dashboards; index strategy review at 50M rows per tenant |
| 6 | **Worker pile-up during mass deployment** | Medium | Medium | Backpressure + rate limiting; separate queue per worker type; autoscaling trigger |
| 7 | **Alert fatigue for 70+ client operators** | High | Medium | Notification routing rules per tenant; severity bucketing; daily digest option |
| 8 | **AI RCA false confidence (Phase 2)** | High | Medium | Display confidence score; human review gate; never auto-action based on AI output |
| 9 | **Credential rotation not propagated** | Medium | High | Vault lease expiry detection; auto-refresh before deploy; rotation event audit |
| 10 | **Ephemeral env cleanup failure (Phase 2b)** | Medium | Medium | TTL-enforced cleanup job; max active envs per tenant cap; cost alert on orphaned envs |
| 11 | **Session token hijacking** | Low | High | Refresh token rotation; httpOnly cookies; IP binding; revocation on role change |
| 12 | **Audit partition not created** | Low | High | Auto-create next month's partition 7 days early; monitor job verifies weekly |
| 13 | **Source sync merge conflicts at scale** | High | Medium | Exclude rules for client-specific files; conflict auto-detection; manual resolution workflow with diff link |
| 14 | **Config rendering breaks client** | Medium | High | Pre-render validation for unresolved tokens; diff preview before deploy; auto-rollback from config_history |
| 15 | **Client divergence accumulates silently** | High | Medium | Scheduled divergence analysis; divergence score on dashboard; alert on score > 50 |
| 16 | **Fleet test credential expiry** | Medium | Medium | Session cookie refresh before test run; fallback to non-auth test subset; alert on auth_required spike |

---

## 3. Failure Mode Analysis

| Failure Mode | Detection | Immediate Fallback | Recovery Path | Prevention |
|---|---|---|---|---|
| **Deploy fails mid-pipeline** | Step status = failed | Emit `deployment.failed`, release lock, preserve snapshot | Admin reviews DLQ, re-triggers with fix | Idempotent steps; snapshot before start |
| **Migration worker crashes mid-run** | Heartbeat timeout, DLQ | Alert admin; do NOT auto-retry | DBA reviews DB state with snapshot diff | Snapshot DB before; manual review required |
| **Vault unreachable at deploy time** | Circuit breaker opens | Abort deploy; emit VAULT_UNREACHABLE | Check Vault cluster health; restart if needed | Cache short-lived secrets; Vault HA |
| **Two simultaneous rollbacks** | Second lock acquisition fails | Second request queued 30s x3, then DLQ | First rollback completes; admin re-assesses | Lock key scoped to client+env |
| **Server heartbeat goes silent** | Gap > 90s detected | `server.heartbeat_missed` event; alert | SSH check by operator; agent restart | Agent auto-restart; redundant monitoring |
| **Queue worker crashes under load** | Job visibility timeout expires | Job re-queued for another worker | Worker auto-restarts via container orchestrator | Idempotency key per job; dedup |
| **Log shipper loses connectivity** | Fluent Bit buffer fills | Logs buffered locally (1GB limit) | Connectivity restored → flush in order | Persistent buffer; alert on > 80% |
| **ClickHouse query timeout** | API query > 30s | Return partial results with truncation | Suggest narrowing time range | Query caching; tenant_id+date index |
| **Approval timeout (no response)** | Timer job detects pending > SLA | Escalate to secondary or auto-reject | Admin reviews escalation policy | Configurable timeout + escalation chain |
| **DLQ depth exceeds threshold** | DLQ monitor polls every 60s | Alert admin; block new jobs of same type | Admin reviews and replays from DLQ UI | DLQ review SLA: < 4h acknowledgement |
| **WebSocket disconnect** | Client heartbeat missed | Fall back to polling every 5s | Reconnect with exponential backoff | Stale-data banner shown to user |
| **Refresh token compromised** | Anomalous IP/user-agent change | Revoke all sessions for user | User re-authenticates; admin notified | Token rotation; IP binding; httpOnly |

---

## 4. Security Architecture

### RBAC Enforcement
- RBAC enforced at **API route level** — middleware checks permission before handler executes
- Every endpoint declares required resource + action (view/add/edit/delete)
- Default roles: Admin, Developer, Tester, Viewer

| Role | Deployments | Pipelines | Bugs | Credentials | Terminal | DB Query Panel | Admin |
|---|---|---|---|---|---|---|---|
| Admin | Full + approve | Full + execute | Full | Full | ✅ | ✅ | ✅ |
| Developer | Read + trigger | Read + execute | Full | ❌ | ✅ | ❌ | ❌ |
| Tester | Read | Read | Full | ❌ | ❌ | ❌ | ❌ |
| Viewer | Read | Read | Read | ❌ | ❌ | ❌ | ❌ |

### Tenant Isolation (Multi-Layer)
- **PostgreSQL**: RLS with `app.current_tenant` session variable. Application cannot bypass.
- **Redis**: Namespaced keys `{type}::{tenant_id}::{entity_id}`
- **ClickHouse**: `tenant_id` as partition key + enforced filter in every API query
- **Vault**: Scoped paths `secrets/{tenant_id}/{client_id}/{credential_name}`
- **WebSocket**: Channels namespaced by tenant_id; server validates on subscribe

### Communication Security
- **All communication over TLS** — internal service-to-service included
- **Webhook validation**: HMAC-SHA256 signature verification on all Git provider webhooks
- **Session management**: JWT 1h access token, 7d rotating refresh token, invalidation on role change via `sessions` table

### Credential Security
- **Vault for ALL secrets** — no credentials in env vars or config files
- Raw credentials NEVER stored in application database — not even encrypted
- Every credential access triggers `credential.accessed` event (audit trail)
- SSH keys, API keys, SFTP passwords, email credentials, DB passwords — all through Vault

### Zero-Trust DB Query Panel
- Parameterized queries only (no raw SQL)
- Read-only DB role (SELECT only)
- Per-query audit log with full query text
- Admin-only access

### Audit Coverage
Every critical action audited: deployments, rollbacks, credential access, RBAC changes, DB query panel use, terminal sessions, approval decisions, user create/delete/role-change, DLQ manual retry, promotion override, export actions.

### Rate Limiting
- Per-tenant and per-user limits
- Configurable by tenant admin
- Max concurrent deployments, pipeline runs/hour, query panel calls/day
- API returns 429 with Retry-After header on breach

---

## 5. Scalability Strategy

| Strategy | Implementation | Scale Trigger |
|---|---|---|
| **Queue-first** | Every operation > 100ms is a background job. API returns `job_id` immediately. | N/A — always active |
| **Worker horizontal scaling** | Add worker instances by queue type. Deploy workers scale independently from notification workers. | Queue depth > 50 per instance |
| **Backpressure** | Queue depth exceeds threshold → API returns 429 with Retry-After header. | Configurable per queue |
| **DB read replica** | All analytics, reporting, and log metadata queries → read replica. Primary handles writes only. | Always active |
| **PgBouncer pools** | Separate pools per worker type to prevent one worker type starving DB connections. Max 20 per type. | Alert at 15/20 |
| **ClickHouse sharding** | Partition by `tenant_id + date`. Queries never scan full table. | Review at 50M rows/tenant |
| **Redis cluster mode** | Queue HA — no single point of failure on job storage. | Always active |
| **CDN** | All static assets via CDN. Next.js static export for public pages. | Always active |
| **API scaling** | Horizontal pod scaling behind load balancer. | CPU > 70% for 5 min OR p95 > 200ms |
| **Worker autoscaling** | Expose queue depth as Prometheus metric. HPA scales on custom metric. | Depth > N items per worker |
