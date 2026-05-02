# 📦 IDP Module Design — Cortexo Platform (v4 Aligned)

> Each module: Purpose → Key Entities → How It Works → Interactions → Failure Modes (min 2 per module)

---

## Module Catalogue — Quick Reference

> **Data ownership rule**: Each table is owned by exactly one module. Only the owning module may INSERT/UPDATE/DELETE. Other modules may SELECT (read) but never mutate another module's data directly — they emit events instead.

| # | Module | Data Owned | Worker Interactions | Key Events |
|---|---|---|---|---|
| 1 | **Pipeline System** | `pipelines`, `pipeline_runs`, `pipeline_steps`, `pipeline_test_artifacts` | Triggers: pipeline step worker, notification worker | `pipeline.step_failed` |
| 2 | **Deployment System** | `deployments`, `deployment_snapshots`, `deployment_windows`, `changelogs`, `environments` | Triggers: deployment worker, changelog worker, health score worker | `deployment.started/.completed/.failed/.rollback_triggered` |
| 3 | **Bug + RCA System** | `bugs`, `bug_events`, `rca_records` | Triggers: RCA worker (Ph2), notification worker | `bug.created`, `bug.resolved` |
| 4 | **Logging + Observability** | Reads: ClickHouse (shipped by Fluent Bit) | No workers — API queries ClickHouse directly | — |
| 5 | **Drift Detection** | `drift_reports` (writes); reads `deployment_snapshots`, `source_registry` | Triggers: drift scanner worker | `drift.detected` |
| 6 | **Code Difference Engine** | Reads: Git provider API, deployment history | No dedicated worker — computed on-demand | — |
| 7 | **Database Management** | `db_connections`, `db_migrations`, `db_backups` | Triggers: migration worker | — |
| 8 | **Credential Management** | `credentials` (vault_path refs only) | No worker — sync Vault calls at deploy time | `credential.accessed` |
| 9 | **Terminal System** | `terminal_sessions`; session logs in ClickHouse | No worker — real-time WebSocket session | — |
| 10 | **Analytics Dashboard** | Reads: all tables; Phase 3: FinOps data | Triggers: health score worker on deploy/bug events | — |
| 11 | **Testing Module** | `test_plans`, `test_cases`, `test_runs`, `test_results`, `pipeline_test_artifacts`, `flaky_tests` | Triggers: flaky test scorer (async after test step) | — |
| 12 | **Notification Engine** | `notification_rules`; reads events from Redis Streams | Triggers: notification worker. Fallback: email if primary fails | — |
| 13 | **Git Source Registry** | `source_registry` | No worker — webhook processing at API layer | — |
| 14 | **Onboarding Wizard** | `onboarding_states` | No worker — wizard state persisted on debounce | — |
| 15 | **CLI Tools** | No data owned — calls API | No worker — CLI is an API client | — |
| 16 | **Audit System** | `audit_events` (INSERT-only, append-only) | No worker — sync writes from event bus | — |
| 17 | **Source Sync Engine** | `sync_configs`, `sync_history`, `sync_exclude_rules`, `divergence_analysis` | Triggers: source sync worker, divergence scanner | `sync.completed`, `sync.failed` |
| 18 | **Config Management** | `config_templates`, `client_configs`, `config_history` | Triggers: config renderer worker | `config.deployed`, `config.rollback` |
| 19 | **Deprecation Scanner** | `deprecation_scans`, `deprecation_items`, `migration_estimates`, `deprecation_rules`, `deprecation_trends` | Triggers: deprecation scan worker (scheduled) | — |
| 20 | **Menu Permissions** | `menu_permissions` | No worker — runtime permission checks | — |
| 21 | **Uptime SLA Tracker** | `uptime_sla` | Triggers: SLA calculator worker (monthly cron + on-demand) | `sla.below_threshold` |
| 22 | **Cost Tracking (FinOps)** | `cost_entries`, `invoices` | No worker — CRUD + monthly aggregation query | `cost.budget_exceeded` |
| 23 | **Post-Deploy Scripts** | `post_deploy_scripts` | Triggered BY deployment worker on success | `postdeploy.script_failed` |
| 24 | **Error Tracking & SDK Ingest** | `errors`, `error_events`, `root_causes` | Triggers: email worker, Slack webhook, notification worker | `error.new`, `error.spike` |
| 25 | **AI Quality Scoring** | `judge_scores`, `root_cause_patterns`, `degradation_checks` | LLM judge worker (async scoring), pattern matcher | — |
| 26 | **Agent Orchestration** | `orchestration_sessions`, `sub_agents`, `consensus_votes` | Sub-agent spawner, consensus evaluator | `agent.escalated`, `agent.budget_exceeded` |
| 27 | **SSHFS Mount Manager** | `server_mounts`, `server_mount_sessions` | No worker — SSHFS operations at API layer | `mount.connected`, `mount.disconnected` |
| 28 | **Migration Tracking** | `client_migrations`, `daily_stats` | No worker — deploy script callback writes migration results | — |
| 29 | **Server Permission Audit** | No persistent data — runs on-demand | Triggers: permission audit worker (scheduled + on-demand) | `permissions.drift_detected` |
| 30 | **File Classifier Engine** | `file_classifications` | No worker — deterministic sync-time classification | — |
| 31 | **In-App Notifications** | `notifications` | Notification worker (Redis Streams consumer) | — |
| 32 | **Deploy Target Management** | `deploy_targets`, `deploy_configs` | No worker — CRUD + SSH test at API layer | — |
| 33 | **Menu Permission System** | `user_menu_permissions` | No worker — runtime permission checks | — |
| 34 | **Client Provisioning System** | `provision_runs`, `provision_step_logs` | Triggers: provisioner worker (SSH-based, multi-step) | `provision.started`, `provision.completed`, `provision.failed`, `provision.aborted` |
| 35 | **Email Alert System** | `email_alert_config` | Triggers: notification worker (SMTP channel via Resend API) | — |
| 36 | **Client Migration Executor** | `migration_runs` | Triggers: migration script worker (shell-based, Socket.IO streaming) | `migration.started`, `migration.completed`, `migration.failed` |
| 37 | **Recipe Engine** | `recipes`, `recipe_files` | Triggers: recipe scanner worker (scheduled + on-demand) | `recipe.match_found`, `recipe.applied` |
| 38 | **Playbook System** | `playbooks`, `playbook_steps` | No worker — symptom-to-playbook routing at UI layer | — |
| 39 | **Client Recipe Tracker** | `client_recipes` | No worker — CRUD + matrix API | `recipe.client_status_changed` |

---

## Module 1: Pipeline System (DAG-Based)

**Purpose**: Orchestrate multi-step CI/CD workflows as directed acyclic graphs with parallel step support.

**Key Entities**: `pipelines` (DAG definitions), `pipeline_runs` (execution records), `pipeline_steps` (per-step run records), `pipeline_test_artifacts` (test outputs)

**How It Works**:
- Pipeline defined as DAG in JSONB (`dag_definition`): nodes = steps, edges = dependencies, parallel steps rendered in columns
- On trigger → create `pipeline_run` → enqueue root steps (zero dependencies)
- Each step completion triggers dependent steps (fan-out). Parallel steps execute concurrently.
- Step types: `build`, `test`, `deploy`, `approval`, `health_check`, `custom_script`
- Approval steps pause pipeline → emit `approval.required` → WebSocket notification with deep link → wait for human quorum
- **Re-run from step**: allows restart from any completed step — does not re-create snapshot. Audited action.
- Test steps: JUnit XML parsed, coverage delta computed, flaky test scorer runs async, artifacts stored in `pipeline_test_artifacts`

**Interactions**: Triggers deployments, consumes test results, emits events to notification engine, feeds analytics.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Step timeout | BullMQ job TTL expires | Mark step FAILED, abort all downstream, emit `pipeline.step_failed`, notify |
| Worker crash mid-step | Job visibility timeout expires, job re-queued | Another worker picks up — idempotency key ensures no duplicate effect |
| Circular dependency in DAG | DAG validation on pipeline save (topological sort) | Reject at API layer with specific cycle path in error |
| Concurrent pipeline on same client | Distributed lock check | Queue with backoff or reject per policy. Lock key scoped to client+env. |

---

## Module 2: Deployment System

**Purpose**: Manage the full deployment lifecycle with snapshot-based rollback, window policies, approval matrix, and environment promotion.

**Key Entities**: `deployments`, `deployment_snapshots`, `deployment_windows`, `changelogs`, `environments`

**How It Works**:
1. API creates deployment record (status: `PENDING`, trigger_type: manual/webhook/schedule/rollback)
2. **Deployment window check**: current time within `deployment_windows` for client+env? → queue if outside, status = `window_blocked`
3. **Concurrent deployment check**: attempt Redis lock. If locked → check queue depth. If < 3 queued: enqueue 30s delay. If >= 3: reject with QUEUE_FULL.
4. **Approval matrix**: evaluate rules per client+environment → pause if needed. Emit `approval.required`. Timeout → escalate or auto-reject.
5. **Pre-deploy snapshot captured** (immutable — INSERT only, no UPDATE/DELETE):
   - Git commit SHA, branch, tag
   - Environment variable Vault reference IDs (NEVER raw values)
   - DB migration version, artifact version
   - Module list with individual versions (`module_versions` JSONB)
   - Pipeline step config hash
6. **Record `health_before`**: capture client health score before deploy
7. **Pre-deploy diff**: generate diff preview (files changed, modules affected, risk indicator)
8. Worker executes: Docker build → push to registry → DB migration (if needed) → pull image → health check → swap traffic → verify
9. On success: record `health_after` → emit `deployment.completed` → changelog worker → health score recalc → drift scan triggered
10. On failure at any step: auto-rollback → emit `deployment.failed` → create bug → preserve snapshot → release lock

**Environment Promotion**: Engineer promotes from staging→UAT→prod. System verifies: same git_commit SHA (no rebuild), test_run gate (if required), approval matrix, deploy window. Snapshot env_var_refs swapped for target environment scope.

**State machine**: `PENDING → WINDOW_BLOCKED → APPROVED → BUILDING → MIGRATING → DEPLOYING → VERIFYING → SUCCEEDED | FAILED | ROLLED_BACK`

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Build failure | Non-zero exit code | Mark FAILED, no deploy attempt, notify |
| Health check failure post-deploy | HTTP health endpoint non-200 within 30s | Auto-rollback to previous snapshot |
| Concurrent deploy + rollback | Distributed lock conflict | Rollback wins (safety-first). Deploy queued 30s backoff x3, then DLQ. |
| Vault unreachable at deploy time | Circuit breaker opens (5 failures in 30s) | Abort deploy; emit `deployment.failed` with VAULT_UNREACHABLE; alert on-call |

---

## Module 3: Bug + RCA System

**Purpose**: Track bugs with full lifecycle, link to deployments and modules, support manual RCA (Phase 1) and AI-assisted RCA (Phase 2).

**Key Entities**: `bugs`, `bug_events` (append-only), `rca_records`

**How It Works**:
- Bugs created: manually via UI, auto from deployment failure, auto from failed test result, or from ClickHouse error log alert rule
- Each state change → immutable `bug_event` record (vertical timeline in UI)
- **Bug linked to**: client_id, module_id, `version_introduced`, `version_fixed`
- **RCA Phase 1** (manual): cause_type, affected_files (JSONB), root_cause_summary, linked deployment_id
- **RCA Phase 2** (AI-powered): RCA worker queries ClickHouse logs ±30min around version_introduced deploy, fetches Git diff, calls AI → `ai_summary`, `ai_suggested_fix`, `ai_confidence_score`. **Human review gate**: output held until lead reviews (`reviewed_by` field). Never auto-acts.
- States: `OPEN → TRIAGED → IN_PROGRESS → IN_REVIEW → RESOLVED → CLOSED` (reopenable)
- Auto-linking: deployment failure → creates bug → links to pipeline run + snapshot
- Bug closed: after 7-day observation post-resolution (no regression detected), auto-transition to CLOSED

**RCA Categories**: `code_defect`, `config_error`, `infra_failure`, `dependency_issue`, `human_error`, `unknown`

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Duplicate bug creation from same error | Fingerprint collision (hash of source + error_signature + client_id) | De-duplicate within 24h window — link to existing bug |
| AI RCA returns high-confidence wrong analysis (Phase 2) | Confidence < 0.7 flags for mandatory review | Output held until reviewed_by populated. Wrong suggestions logged for model feedback. |

---

## Module 4: Logging + Observability

**Purpose**: Centralized log storage in ClickHouse with real-time streaming and structured query.

> [!IMPORTANT]
> Logs NEVER flow through the API. Fluent Bit/Vector ships directly from servers to ClickHouse over TLS on port 9440.

**Key Entities**: ClickHouse `logs` table (not Postgres), `server_heartbeats` (Postgres, partitioned)

**How It Works**:
1. **Fluent Bit/Vector agent** installed on each managed server at onboarding. TLS certificate provisioned for ClickHouse connection.
2. Agent tails: application stdout/stderr, deployment output, error log files, system syslog, Nginx/Apache access logs. Each source configured with `log_source` label.
3. Agent enriches each line with: `server_id`, `client_id`, `tenant_id`, `environment`, `log_source`, `host`, `agent_version`, `timestamp` (UTC nanoseconds)
4. **Batched shipping**: buffer 1000 lines or 5 seconds (whichever first). Ship batch over TLS to ClickHouse HTTP interface.
5. ClickHouse stores in partitioned table: `(tenant_id, toYYYYMMDD(timestamp))` as partition key
6. **User queries logs via API**: API constructs ClickHouse query with `tenant_id` filter enforced server-side (cannot be overridden). LIMIT 500 default. Max 7-day window for interactive queries.
7. **Real-time streaming**: API opens ClickHouse tail query → pushes new lines to subscribed WebSocket clients. Re-validates tenant scope on each push.
8. **Log search**: full-text + structured field filters (level, module, time range, server, trace_id)
9. **Log export**: API streams ClickHouse result as NDJSON or CSV. Chunked transfer. Max 10M rows per export. Export action audited.
10. **Correlation**: clickable trace_id → trace detail. Click error log → create bug shortcut with log excerpt pre-populated.
11. **Retention**: ClickHouse TTL policy — logs older than tenant-configured retention (default 90 days) auto-deleted at partition level.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Fluent Bit loses connectivity | Buffer fills on disk. Backpressure metrics rise. | Logs buffered locally (default 1GB). Alert on buffer > 80%. Connectivity restored → flush in order. |
| ClickHouse query timeout | API query > 30s | Return partial results with truncation notice. Suggest narrowing time range. |
| ClickHouse cluster unavailable | Write failures from Fluent Bit | Persistent disk buffer, retry with exponential backoff. Alert before data loss. |

---

## Module 5: Drift Detection

**Purpose**: Detect source vs deployed state differences between environments and across clients.

**Key Entities**: `drift_reports`

**How It Works**:
1. **Scheduled scan** (BullMQ repeatable job, every 6h configurable per-tenant) + **on-deploy trigger** (`deployment.completed` event)
2. Worker loads all active clients for tenant. For each client: loads all environments with at least one successful deployment.
3. **Source state**: fetch current HEAD of default branch from `source_registry` via Git provider API. Extract module paths and file hashes.
4. **Deployed state**: load `deployment_snapshot` for last successful deployment. Extract module_versions, git_commit, artifact_version.
5. **Comparison**: file-level hash comparison. Module version comparison. Config structure comparison (excluding secret values).
6. Records diff as structured report in `drift_reports.diff_summary` JSONB: `{added:[], removed:[], modified:[], module_deltas:{}}`
7. **Severity**: low (cosmetic/docs), medium (config/dependency), high (code > 3 files or security-related), critical (core module or breaking API)
8. If drift detected: emit `drift.detected` event with severity
9. Notification worker routes alert based on tenant `notification_rules`. High/critical → immediate. Low/medium → daily digest.
10. Drift report surfaced in **comparison UI with visual diff**. Badge clears only on `acknowledged_at` populated.
11. **Health impact**: client health score penalised for unacknowledged drift beyond 24 hours
12. **Accept drift**: admin marks expected drift as acknowledged → removes from alert backlog, records `acknowledged_by`

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Agent/server unreachable during scan | SSH/API connection timeout | Mark scan as PARTIAL, retry on next heartbeat |
| Git provider API rate limit hit | 403/429 from provider | Backoff and retry. Log partial scan result. |

---

## Module 6: Code Difference Engine

**Purpose**: Module-level code insights, commit summary, pre-deploy diff preview, and cross-client comparison.

**How It Works**:
- Integrates with Git providers (GitHub, GitLab, Bitbucket) via `source_registry`
- Generates: per-module file-level and line-level diffs
- Pre-deploy diff preview: files changed since last deploy in target env, modules affected, risk indicator (low/medium/high based on scope), dependency impact (from `service_dependencies`)
- **Source vs client**: side-by-side module version comparison with file-level drill-down
- **Client vs client**: compare two clients on any module, environment, or config dimension. Highlight differing versions.
- Powers: pre-deploy review UI, auto-changelog generation (via changelog worker), PR-to-deploy traceability

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Git provider unreachable | Circuit breaker on Git API calls | Show cached last-known diff. Surface degraded-mode banner. |
| Diff computation timeout (large repo) | Worker job timeout | Return partial diff with warning. Suggest narrowing module scope. |

---

## Module 7: Database Management

**Purpose**: Manage database connections, migrations, and backup manifest across clients.

**Key Entities**: `db_connections`, `db_migrations`, `db_backups`

**How It Works**:
- Registry of all client databases in `db_connections` (host, port, db_name, db_type). Credentials resolved via `credential_id → vault_path` at runtime only.
- Migration tracking: `db_migrations` tracks which version each db_connection is on. Checksums prevent duplicate runs.
- **Migration worker**: dedicated worker — one retry only, manual DBA review after second failure. Snapshot DB before any migration.
- **DB rollback**: DOWN migrations executed sequentially. If any DOWN fails: stop, alert DBA, leave in partial state — never re-run UP.
- Backup manifest in `db_backups`: storage path (object storage), size, checksum, encryption key ref (Vault), verified_at (from restore-test job).
- Pre-deploy: verify migration compatibility before proceeding

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Migration failure mid-apply | Heartbeat timeout, job in DLQ | Alert admin; do NOT auto-retry. DB may be in partial state — DBA reviews with diagnostic query. |
| DB connection pool exhaustion | PgBouncer metrics exceed threshold | Alert + separate pools per worker type prevent starvation |
| Backup verification fails | Restore-test job detects corruption | Alert DBA. Mark backup as `unverified`. Do not use for rollback. |

---

## Module 8: Credential Management (Vault-Backed)

**Purpose**: Secure storage and rotation of secrets. Raw credentials NEVER stored in application DB.

**Key Entities**: `credentials` (metadata + vault_path only — actual secrets in Vault)

**How It Works**:
1. Engineer creates credential record: name, type, client association → stored in `credentials` table
2. API calls Vault to store raw value at path `secrets/{tenant_id}/{client_id}/{name}`
3. Vault returns path; API stores ONLY the path reference + metadata (type, last_accessed_at, last_rotated_at)
4. **Raw credential NEVER stored in Postgres** — not even encrypted
5. At deploy time, worker fetches secret from Vault using short-lived token (< 15min TTL lease)
6. `credential.accessed` event emitted with actor_id, vault_path, timestamp BEFORE value is used
7. Audit log written synchronously from event — access trail exists even if deploy then fails
8. **Rotation**: Vault handles rotation schedule; platform detects stale lease and forces re-fetch on next deploy
- **Types**: SSH keys, API keys, SFTP passwords, email credentials, database passwords

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Vault unavailable | Circuit breaker opens (5 failures in 30s) | Cache short-lived secrets (encrypted in memory). Abort deploy if cache expired. Alert on circuit open immediately. |
| Credential rotation not propagated | Vault lease expiry detection | Auto-refresh before deploy; rotation event audit trail |

---

## Module 9: Terminal System

**Purpose**: Secure remote shell access from the UI. Role-gated.

**Key Entities**: `terminal_sessions`

**How It Works**:
- WebSocket connection from browser → Fastify → SSH tunnel to client server
- **Session recorded**: full command log stored in ClickHouse (via `session_log_ref`)
- RBAC: only `admin` and `developer+` roles can access
- Session timeout: 30 minutes idle, 2 hours max
- All sessions logged to `terminal_sessions` (start/end time, user, server, IP, closed_by)
- Session open/close audited in `audit_events`
- Alert on session > 2h (potential unauthorized use)

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| SSH connection drops | WebSocket error event | Auto-reconnect attempt. Show disconnected banner in UI. |
| Session exceeds max duration | Timer check every 60s | Force close session. Record `closed_by: timeout`. |

---

## Module 10: Analytics Dashboard

**Purpose**: Health scores, deployment metrics, bug metrics, and trend analysis.

**Client Health Score (0–100)**: Weighted composite of:
- Uptime/heartbeats (30%)
- Deployment success rate (20%)
- Open bug count by severity (15%)
- Drift score (15%)
- Response time p95 (20%)

**Other Metrics**: Deployment frequency, MTTR, pipeline success rate, drift percentage, QA velocity, flaky test rate.

**Computation**: `health_score` worker recomputes after deploy/bug events. Results cached in Redis + materialized views. All queries go to **read replica**, never primary.

**Daily Stats Aggregation** (from DevOps_deploy_tool `stats_aggregator.js`):
- **Cron job** runs at midnight UTC → aggregates into `daily_stats` table
- Metrics captured per day: total deployments, success count, failure count, success rate %, avg deploy duration (seconds), total syncs, sync success rate %
- **Upsert strategy**: `INSERT ON CONFLICT UPDATE` — re-aggregation safe for late-arriving data
- **Sparkline API**: `/api/stats/sparklines?days=7` → returns daily data points for chart rendering
- **Weekly comparison**: `/api/stats/trends` → this week vs last week deploy counts with % change
- **Hourly heatmap**: hourly deploy distribution over last 24h for peak-time analysis

**Cross-Track Analytics**:
- Per-module test pass rate trend over last 30 deployments
- Flaky test leaderboard: top 10 per client with trend (improving/worsening)
- Bug-to-test correlation: bugs with no linked test case surfaced as coverage gaps
- Coverage regression alerts: deploy that drops coverage > 5% triggers notification

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Health score computation fails | Worker job fails | Serve stale cached score with `stale` indicator. Retry on next event. |
| Read replica lag | Monitoring replica lag metric | Switch to primary for critical queries. Alert on lag > 10s. |
| Daily stats cron fails | Cron monitoring | Next midnight run re-aggregates. Manual trigger via admin panel. |

---

## Module 11: Testing Module (Dual-Track)

### Track 1 — Pipeline Test Execution (Automated)
- Pipeline step type `test` runs test suites in Docker containers
- **`pipeline_test_artifacts`**: stores JUnit XML, screenshots, video recordings, coverage JSON, performance benchmarks
- **`flaky_tests`** table: computed by flaky test analyser from rolling 30-run window per `test_identifier`
- **Flaky detection**: fail_rate > 15% and < 85% = flaky. Flagged in pipeline step detail (warning badge), module dashboard, analytics.
- Flaky test does NOT fail pipeline by default — configurable per pipeline definition
- **Coverage enforcement**: pipeline step can include minimum coverage threshold. If coverage drops below → step fails. Delta displayed.
- **Performance baseline**: response time benchmarks compared vs prior run. Alert if regression > 10%.

### Track 2 — Manual QA Workflow
**Key Entities**: `test_plans`, `test_cases`, `test_runs`, `test_results`
- Test plans: versioned collection of test cases. New version creates new record (old archived, not mutated).
- Test runs: execution of a test plan linked to specific deployment + environment
- Results: pass/fail/skip/blocked with evidence (screenshot URLs in object storage)
- Blocked case: text explanation required, counts as incomplete
- **Bug creation shortcut**: from failed test case — pre-populated with test case details, environment, deployment ref.

### Integration with Deployment Promotion
- Environment config includes: `require_test_run_pass = true/false` per environment type
- If `true`: promotion blocked until `test_run.status = passed` for the deployment being promoted
- If no test run exists: promotion blocked with explicit message — never silently skipped
- Admin can override promotion block — audited action

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Artifact upload fails | Upload error after test step | Step marked as warning (not failed), retry once. Test results still available. |
| JUnit XML parse error | Parse exception | Step status = warning, raw file stored for manual download |
| Coverage service unavailable | Health check fails | Threshold check skipped, alert logged — never silently passes |
| Tester unresponsive | Test run open > SLA (default 48h) | Escalation notification to admin. Admin can re-assign. |

---

## Module 12: Notification Engine

**Purpose**: Route alerts to channels based on configurable per-tenant rules.

**Key Entities**: `notification_rules`

**Channels**: Slack, email (Phase 1). PagerDuty for critical alerts (Phase 2).

**Routing**:
- Per-tenant notification preferences stored in `notification_rules` (event_type, channel, destination, conditions JSONB, severity filters)
- `client_id` nullable = tenant-wide rule; non-null = client-specific rule
- Severity-based routing: critical → Slack + email + PagerDuty(Ph2), warning → Slack, info → daily digest
- Escalation: unacknowledged critical alerts escalate after configurable SLA
- Dead-letter to **email fallback** if primary channel fails (3 retries with backoff)

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Slack webhook delivery failure | HTTP error from Slack API | 3 retries with backoff. Fall back to email. |
| Email delivery failure after fallback | SMTP error | Land in DLQ. Alert platform admin. |

---

## Module 13: Git Source Registry

**Purpose**: Manage Git provider connections per tenant.

**Key Entities**: `source_registry` (id, tenant_id, provider, repo_url, default_branch, webhook_secret_hash, connected_at)

**Supported Providers**: GitHub, GitLab, Bitbucket. Webhook ingestion verified by HMAC-SHA256 against stored `webhook_secret_hash`.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Webhook secret hash mismatch | HMAC verification fails | 401 response, audit log written, no further processing |
| Provider API rate limit | 403/429 from provider | Backoff with Retry-After header. Queue pending operations. |

---

## Module 14: Onboarding Wizard

**Purpose**: First-run experience for new tenant setup. Multi-step flow with auto-save. Includes automated mono-repo scaffolding.

**Key Entities**: `onboarding_states` (completed_steps JSONB, current_step, resume_token)

**Flow**:
1. Connect Git provider → store in `source_registry`
2. Register servers → store in `servers` + `server_mounts`
3. Install Fluent Bit on servers → verify ClickHouse connectivity
4. Create first client project → store in `clients`
5. Define modules → store in `modules`
6. Configure first pipeline → store in `pipelines`
7. Trigger first deploy → verify end-to-end flow

**Scaffolding Automation** (from DevOps_deploy_tool `monoClients.js`):
- **Auto-scaffold**: when a new client is created via onboarding or client management UI:
  1. Create `config/clients/{client_id}.json` in hub repo with default client config (features, flags, deploy URLs)
  2. Create override directories: `clients/{client_id}/{views,assets,models,controllers,helpers}/.gitkeep`
  3. Create a new branch `client/{client_id}` from PRODUCTION
  4. Auto-commit all scaffold files to the branch
  5. Create PR: `chore: onboard client {name} ({id})` → target PRODUCTION
  6. Auto-merge via squash merge if no conflicts
- **Idempotent**: if branch or files already exist → skip with `already_exists` status
- **Cache invalidation**: mono-client list cache (5-min TTL) invalidated on scaffold
- **Error handling**: partial success → return 207 Multi-Status with per-step results

**Auto-save**: Every step persists to `onboarding_states` with resume token (UUID). Draft indicator with "Resume" prompt on re-open. Wizard accessible from empty state prompts throughout app.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Git provider connection fails during setup | OAuth/webhook test failure | Show error with retry button. Allow skipping to next step. |
| Server registration fails (SSH unreachable) | Connection timeout | Surface specific error. Allow retry with different credentials. |
| Scaffold branch creation fails | GitHub API error (422) | Check if branch exists → treat as success. Otherwise retry. |
| Auto-merge conflict | PR merge fails | PR stays open for manual merge. Notify admin. |

---

## Module 15: CLI Tools

**Purpose**: Command-line interface for common operations. Authenticated via API token.

**Commands**: `deploy`, `rollback`, `logs tail`, `status`, `drift scan`

All actions audited. CLI calls same API endpoints as web UI — no separate auth path.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| API token expired | 401 response | Prompt for re-authentication |
| Network timeout during deploy | Connection error | Show last known status. Suggest checking web UI. |

---

## Module 16: Audit System

**Purpose**: Append-only, immutable audit trail for all critical platform actions.

**Key Entities**: `audit_events` (partitioned by month, INSERT only, no UPDATE/DELETE)

**Audited actions**: deploy trigger, rollback, credential access, RBAC change, DB query panel execution, terminal session open/close, approval granted/rejected, user create/delete/role-change, DLQ manual retry, promotion override, export actions.

**UI**: Admin-only, read-only, searchable by actor, action type, entity, time range. Export as CSV or NDJSON (export action itself audited).

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Audit write failure | INSERT exception | Block the triggering action. Never proceed without audit. |
| Audit partition not created | Scheduled job monitoring | Auto-create next month's partition 7 days early. Alert if missing. |

---

## Module 17: Source Sync Engine

> **Origin**: Live Cortexo codebase (`routes/sync.ts`, `schema/sync.ts`)

**Purpose**: Multi-client code distribution from hub (golden) repository to 70+ client repositories. Track sync history, handle conflicts, manage exclusions, and measure divergence.

**Key Entities**: `sync_configs` (branch mapping), `sync_history` (execution log), `sync_exclude_rules` (file exclusion patterns), `divergence_reports` (hub vs client analysis)

**How It Works**:
1. **Hub repo** is the golden source — all standard features maintained here
2. **Sync trigger**: manual (per-client or batch) or webhook (on hub push). Optionally cherry-pick specific commits.
3. **Branch mapping**: each client has a configured target branch (e.g., `STAGING`, `PRODUCTION`)
4. **Exclude rules**: pattern-based rules exclude client-specific customizations from sync (e.g., `config/*.php`, `client_assets/*`). Rules scoped by app category + layer (admin/web).
5. **Execution**: sync worker creates PR from hub → client repo. Status tracked: `pending → syncing → success | failed | conflict`
6. **Conflict resolution**: if merge conflict detected → status = `conflict`, notification sent, manual resolution required
7. **Stale sync cleanup**: automated job fails syncs stuck > 15 minutes with no response
8. **Divergence analysis**: periodic scan comparing client repo state against hub. Measures: files added by client, files modified from hub, files removed. Divergence score (0-100) per client.
9. **Cherry-pick**: selective file sync — push specific files from hub to specific clients without full sync

**Interactions**: Feeds drift detection, triggers deployment pipelines on sync completion, divergence data feeds analytics.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Sync stuck in `syncing` > 15 min | Stale cleanup job | Auto-fail with timeout message. Alert admin. |
| Merge conflict on client repo | Git merge conflict detection | Mark as `conflict`. Notify client owner with diff link. Manual resolution. |
| GitHub API rate limit during batch sync | 403/429 response | Backoff per client. Retry queue. Partial sync results surfaced. |

---

## Module 18: Config Management

> **Origin**: Live Cortexo codebase (`lib/config-renderer.ts`, `schema/sources.ts`)

**Purpose**: Template-based configuration file generation per client. Centralized config data with change history and diff capabilities.

**Key Entities**: `config_templates` (template files), `client_configs` (per-client JSONB config data + domain), `config_history` (change audit trail)

**How It Works**:
1. **Config templates**: PHP config files with token syntax `{{SECTION.KEY|default_value}}`. Stored per source type.
2. **Client config data**: JSONB blob per client storing all config sections (identity, URLs, database, versions, flags, rateFeed, socket, encryption, notifications, email, etc.)
3. **Rendering**: template + client config data → resolved config file. Supports nested token references and derived keys (e.g., `CLIENT_UPPER` from slug, `CLIENT_DOMAIN` from URL).
4. **Config diff**: compare configs between two clients or between client and template defaults. Surfaces unexpected deviations.
5. **Change history**: every config update creates a `config_history` entry (who, what changed, old value, new value, timestamp)
6. **Deploy integration**: rendered config pushed to server as part of deployment flow. Config changes can trigger re-deploy.
7. **Bulk config update**: update a config key across all clients (e.g., change API version globally) with preview before apply.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Template token unresolved (missing config key) | Render output contains `{{...}}` markers | Fail deploy with CONFIG_UNRESOLVED error. Surface missing keys in UI. |
| Config change breaks client | Health score drops post-deploy | Auto-rollback restores previous config from `config_history`. |

---

## Module 19: Deprecation Scanner (Phase 3)

> **Origin**: Live Cortexo codebase (`lib/deprecation-engine.ts`)

**Purpose**: Scan client codebases for deprecated APIs, framework-specific patterns, and PHP version incompatibilities. Generate migration plans.

**Key Entities**: `deprecation_scans`, `deprecation_findings`

**How It Works**:
1. **Scan types**: `ci3-to-ci4` (CodeIgniter migration), `php-upgrade` (PHP 7.4→8.2), `all`
2. **Pattern matching**: regex-based detection of deprecated function calls, class patterns, and removed APIs
3. **Severity classification**: critical (removed APIs), high (breaking changes), medium (deprecated), low (style/convention)
4. **Auto-fixable flag**: low/medium severity findings marked as auto-fixable candidates
5. **Estimated effort**: critical=2h, high=1h, medium=0.5h, low=0.25h per finding — total hours computed
6. **Per-client reports**: run against each client's codebase, stored as structured findings
7. **Trend tracking**: compare scan results over time to measure migration progress

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Scan timeout on large codebase | Worker job timeout | Return partial results. Suggest scanning per-module. |
| False positive on regex match | User reports via feedback | Adjust pattern regex. Mark finding as `dismissed`. |

---

## Module 20: Per-User Menu Permissions

> **Origin**: Live Cortexo codebase (`schema/menu-permissions.ts`, `routes/menu-permissions.ts`)

**Purpose**: Granular sidebar menu visibility control beyond role-based RBAC. Toggle specific menu items per user.

**Key Entities**: `user_menu_permissions`

**How It Works**:
- Roles define base permission set (admin sees everything, viewer sees dashboards only)
- Admin can further restrict individual users: hide specific menu items (e.g., hide "Terminal" from a specific developer)
- Menu permission check: `role_default AND NOT user_override_hidden`
- Changes audited in `audit_events`
- UI: admin panel toggle grid — users × menu items

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Permission override conflicts with role | Validation check on save | Warn admin. Role permission takes priority over user restriction. |

---

## Module Extensions (from Cortexo Codebase)

### Module 3 Extension: RCA Pattern Database

> **Origin**: `lib/pattern-db.ts`

Added to Bug/RCA module:
- **Pattern DB**: confirmed root cause patterns stored with error fingerprint, root cause, suggested fix, language, framework tags
- **Pattern matching**: new errors matched against DB using fingerprint (exact) or error message similarity (Jaccard bigram, threshold > 40%)
- **Confidence scoring**: patterns have confidence score (0-100) adjusted by user feedback (+10 on confirm, -10 on reject)
- **AI bypass**: if pattern match found with confidence > 80% → skip AI RCA call, serve cached pattern directly
- **Usage tracking**: how many times each pattern has been matched — surfaces most common root causes

### Module 7 Extension: DB Schema Validation

> **Origin**: `lib/schema-validator.ts`

Added to Database Management module:
- **Golden schema**: reference database schema maintained per source type
- **Schema validation**: SSH into client DB → `SHOW TABLES` + `DESCRIBE` → compare against golden
- **Diff report**: missing tables, extra tables (client-specific), missing columns, extra columns, type mismatches
- **Schema drift** (different from code drift): tracks how far client DB schema has diverged from golden
- **Pre-migration check**: validate schema state before applying migrations

### Module 11 Extension: HTTP Module Endpoint Testing

> **Origin**: `lib/module-tester.ts`

Added to Testing module:
- **Controller discovery**: parse PHP controllers to extract all public methods (endpoints)
- **Endpoint classification**: CRUD methods (`open_listingform`, `open_entryform`, `DB_Controller`, `index`) identified
- **Live HTTP testing**: hit each discovered endpoint against client's live URL with session cookie
- **Result classification**: pass (2xx), auth_required (login page detected), redirect (3xx), error (4xx/5xx), crash (PHP fatal/timeout)
- **Per-module health score**: based on test results (pass=100%, auth=80%, error=0%, crash=0%)
- **Full fleet test**: test ALL modules across ALL clients — worst-scoring modules surfaced first

---

## Module Extensions (from Old_Tool Codebases)

### Module 2 Extension: Canary Deploy Mode

> **Origin**: `BullionDevops/routes/futuristic.js`

Added to Deployment System:
- **Canary mode**: deploy to a single designated canary client first before rolling out to fleet
- **Health check gate**: canary client must pass health check before remaining clients are queued
- **Auto-rollout**: on canary success → queue deploy for all remaining clients with configurable concurrency
- **Auto-abort**: on canary failure → cancel all remaining deploys, emit `deploy.canary_failed`, notify
- **Config**: `deployment_windows.canary_client_id` designates the canary per environment

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Canary health check fails | HTTP status non-200 within 30s | Abort rollout, `deploy.canary_failed` event, notification |
| Canary deploy succeeds but fleet deploy fails | Per-client deploy failure events | Individual client rollback, does not affect other clients |

---

### Module 2 Extension: Stale Deploy Auto-Expiry

> **Origin**: `DevOps_deploy_tool/server/src/index.js`

Added to Deployment System:
- **Pending expiry**: deployments in `pending_approval` status > 24h → auto-transition to `expired`
- **Running timeout**: deployments in `running` status > configurable threshold (default 1h) → auto-fail
- **Cron job**: runs every hour at startup + setInterval
- **WebSocket broadcast**: UI clients notified immediately on auto-expiry
- **Audit**: `deploy.auto_expired` event emitted for every auto-transition
- **Config**: `stale_deploy_expiry_hours` (default 24) and `stale_running_timeout_minutes` (default 60) per tenant

---

### Module 1 Extension: Static Analysis Quality Gate

> **Origin**: `DevOps_deploy_tool/deploy/deploy.sh`

Added to Pipeline System:
- **Lint step type**: `static_analysis` added as pipeline step type alongside build/test/deploy/approval
- **PHP lint**: `php -l` on all changed PHP files — syntax errors block pipeline
- **Debug detection**: scan diff for `print_r`, `var_dump`, `dd()`, `console.log`, `ini_set`, `error_reporting` — warning, does not block
- **Configurable rules**: per-language lint commands and debug patterns stored in `pipeline_lint_rules`
- **Extensible**: supports additional linters (ESLint for JS, pylint for Python) via custom command

---

### Module 21: Uptime SLA Tracker

**Purpose**: Track monthly uptime SLA percentage per client based on automated health checks.

**Key Entities**: `uptime_sla`, health check results

**How It Works**:
- SLA calculator worker runs monthly (1st of each month) + on-demand via admin UI
- Aggregates from `server_heartbeats` and HTTP health checks
- Calculates: `uptime_pct = (up_checks / total_checks) * 100`
- Stores monthly record per client with average response time
- Triggers `sla.below_threshold` event if uptime < configurable SLA target (default 99.5%)

**Interactions**: Reads health check data, writes `uptime_sla`, emits SLA breach events to notification engine.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| No health check data for month | Zero total_checks | Mark as "insufficient data", don't compute % |
| SLA calculation fails mid-run | Worker error | Retry once, then DLQ. Partial results stored. |

---

### Module 22: Cost Tracking (FinOps)

**Purpose**: Track per-client infrastructure costs by month with cost types and budget alerts.

**Key Entities**: `cost_entries`, `invoices`

**How It Works**:
- Admin enters cost entries: per client, per server, by cost type (hosting, storage, bandwidth, license)
- Monthly aggregation: total per client, total per server, total per cost type
- Budget alerts: configurable per-tenant spend threshold → `cost.budget_exceeded` event
- Invoice generation: auto-create invoice from cost entries with line items, tax calculation (configurable GST/VAT %), status tracking (draft → sent → paid)
- Invoice number: `INV-{tenant_slug}-{timestamp_base36}`

**Interactions**: Reads cost entries, generates invoices, emits budget alert events.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Duplicate cost entry | Unique constraint on (client_id, server_id, month_year, cost_type) | Reject with specific error |
| Invoice generation fails | Worker error | Retry 2x, then DLQ. Draft invoice preserved. |

---

### Module 23: Post-Deploy Script Registry

**Purpose**: Register scripts that auto-execute after successful deployments per client.

**Key Entities**: `post_deploy_scripts`

**How It Works**:
- Scripts registered with: client_id (nullable = global), script_name, command, run_on (local/remote)
- After deployment worker marks deploy as SUCCEEDED → fetch scripts for client + global scripts
- Execute in order: global scripts first, then client-specific
- Script output logged as part of deployment record
- Failure: individual script failure does NOT fail the deployment — warning logged, event emitted

**Interactions**: Triggered by deployment worker on success. Script output appended to deployment metadata.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Script times out | 60s execution timeout | Kill process, log warning, continue remaining scripts |
| Script returns non-zero | Exit code check | Log warning with stderr, do NOT fail deployment |

---

### Module 7 Extension: Schema Comparison Engine

> **Origin**: `BullionDevops/routes/dbmigration.js` (638 lines, 12 comparison modes)

Added to Database Management module — comprehensive DB comparison toolkit:
1. **Tables comparison**: identify missing tables in source vs target, auto-generate `CREATE TABLE`
2. **Columns comparison**: missing columns + auto-generate `ALTER TABLE ADD COLUMN`
3. **Column size comparison**: type size mismatches (e.g., `varchar(50)` vs `varchar(100)`) → `ALTER TABLE MODIFY`
4. **Row count comparison**: table-by-table row count between source and target
5. **INSERT data generator**: auto-generate `INSERT INTO ... SELECT` statements for data migration
6. **Primary + Foreign key comparison**: missing/extra keys between DBs
7. **Index comparison**: missing/extra/mismatched indexes + `CREATE INDEX` / `DROP INDEX` queries
8. **Checksum validation**: table-level `CHECKSUM TABLE` comparison
9. **Duplicate detection**: find duplicate primary keys per table
10. **Non-defaults detection**: NOT NULL columns without DEFAULT values
11. **Data transformation preview**: preview type transformations before applying (UPPERCASE, DATE_FORMAT, CAST)
12. **Password hash migration**: base64 → PBKDF2 hash conversion with SQL output

**Schema comparison results stored** in `schema_comparisons` table with generated ALTER queries (JSONB).

---

### Module 17 Extension: Sync Profiles

> **Origin**: `DevOps_deploy_tool/routes/syncProfiles.js`

Added to Source Sync Engine:
- **Named sync profiles**: e.g., "Retail Standard", "CRM Full", "Bullion Minimal"
- **Per-profile rules**: each profile has a set of `sync_profile_rules` with rule_type (never/exclude/include) and glob patterns
- **Client assignment**: clients select a profile instead of configuring individual rules
- **Profile inheritance**: profiles can extend a base profile
- **File classification**: files auto-classified as retail/crm_chit/shared/never based on filename patterns → only matching files sync to matching client types

### Module 17 Extension: File Classifier Engine

> **Origin**: `DevOps_deploy_tool/services/fileClassifier.js` (178 lines)

Added to Source Sync Engine — deterministic file classification for intelligent sync filtering:
- **Pattern-based rules** (evaluated in order): regex patterns map file paths to categories
  - `retail`: `admin_ret_*`, `ret_*_model` controllers/models
  - `crm_chit`: `crm_*`, `chit_*`, `chitapi*` controllers/models
  - `never`: `.github/`, `.vscode/`, `vendor/`, `config/database.php`, `.env`, `AI_docs/`, client-specific APIs (`sktm_*`, `khimji_*`)
  - `shared` (default): files matching no pattern — safe to sync to all clients
- **Manual override support**: `file_classifications` table stores admin overrides (manual classification takes priority over auto-detection)
- **Sync eligibility function**: `shouldSyncFile(filePath, classification, clientType, profileRules)` → boolean
  - NEVER files always blocked
  - Profile NEVER/EXCLUDE rules checked next (glob patterns)
  - SHARED files sync to everyone
  - Type-specific files sync only to matching client types (retail → retail clients)
- **Glob matcher**: supports `*` (any filename chars) and `**` (any path depth)
- **Integration**: called during sync worker execution to filter commit file lists per-client before creating PRs

### Module 2 Extension: Workflow Auto-Sync

> **Origin**: `DevOps_deploy_tool/routes/clients.js` (reprovision-workflows endpoint)

Added to Deployment System:
- **Auto-reprovision**: when a client's deploy branch, deploy mode, or environment config changes → auto-regenerate GitHub Actions workflow YAML via API
- **Batch reprovision**: admin can trigger `reprovision-workflows` for all clients at once (e.g., after workflow template update)
- **Workflow YAML generation**: dynamically builds `deploy.yml` and `sync-batch.yml` per client from templates with client-specific variables (webhook URL, branch, secret name)
- **Idempotent**: uses `createOrUpdateFileContents` API — safe to re-run
- **Audit**: every reprovision logged with client_id, trigger_reason, actor_id

### Module 17 Extension: Module Mapper

> **Origin**: `DevOps_deploy_tool/services/moduleMapper.js` (137 lines)

Added to Source Sync Engine — business module grouping for divergence analysis:
- **Module rules**: regex patterns map file paths to business modules (Billing, Reports, Tagging, Purchase, Customer, Payment, Scheme, Dashboard, Auth, etc.)
- **Divergence grouping**: `groupByModule(files)` → groups divergence results by business module
- **Module summary**: calculates per-module stats: total files, identical, source-only changed, client-only changed, both-changed, syncable %, divergence %
- **Sorted output**: modules sorted by divergence % descending — most divergent modules surfaced first
- **Use case**: enables divergence heatmap UI to show which business areas have the most client drift

---

### Module 4 Extension: Live Log Viewer (File-based)

> **Origin**: `BullionDevops/routes/logviewer.js` (396 lines)

Added to Logging + Observability module:
- **Log sources registry**: `log_sources` table — register log file paths per server (file or directory)
- **Read last N lines**: tail-style reading from any registered log file
- **Real-time tailing**: Socket.IO + `fs.watchFile` — new log lines pushed to UI as they appear
- **Log rotation detection**: file size decrease → emit "Log rotated" event
- **Log level auto-detection**: parse lines for fatal/error/warning/info/debug keywords
- **Timestamp extraction**: multiple patterns (ISO 8601, Apache, syslog, custom)
- **Full-text search**: search within log files with case-sensitive/insensitive option
- **Directory browsing**: list all `.log`/`.txt`/`.err` files in a directory
- **Per-source stats**: error/warning/info count from last 1000 lines

**Use case**: When ClickHouse centralized logging is insufficient for live debugging on a specific server.

---

## Module 24: Error Tracking & SDK Ingest

> **Origin**: Live Cortexo codebase (`routes/errors.ts` — 578 lines, `lib/email.ts`)

**Purpose**: Full error tracking lifecycle — SDK ingest from PHP/JS clients, fingerprint-based deduplication, cross-client error intelligence for fleet-wide bug discovery, and automated alerting.

**Key Entities**: `errors` (grouped by fingerprint), `error_events` (individual occurrences), `root_causes` (AI/manual RCA records)

**How It Works**:
1. **SDK Ingest** (`POST /ingest/error`): authenticated via `X-Api-Key` header (per-project SDK key). Accepts: type, message, file, line, stackTrace, severity, breadcrumbs, userContext, environment, release.
2. **Fingerprint deduplication**: `SHA256(type:file:line)` → first 16 chars. Same fingerprint within project → increment `event_count` + update `last_seen_at`. New fingerprint → INSERT error group.
3. **Error events**: every ingest creates individual `error_event` with stack trace, context, breadcrumbs, user info, server name, URL, method.
4. **Error → Deploy auto-correlation**: on new error group, auto-link to most recent deployment for that project (`linked_deploy_id`).
5. **Cross-client intelligence** (`GET /errors/:id/cross-client`): since 70+ clients run the same codebase, same fingerprint = same bug. Returns affected client count, total events across fleet, `is_fleet_wide_bug` flag (≥3 clients).
6. **Similar bug finder** (`GET /errors/:id/similar`): search by type prefix + file match within same project.
7. **Alerting**: new critical/error → email via Resend API + Slack webhook (non-blocking, best-effort).
8. **Performance ingest** (`POST /ingest/performance`): separate endpoint for client-side performance metrics.
9. **Breadcrumb ingest** (`POST /ingest/breadcrumb`): batch breadcrumb collection from SDK.
10. **Error assignment**: assign errors to team members with user ID + name.

**Email Templates** (from `lib/email.ts`):
- `sendCriticalErrorAlert`: styled HTML email with error type, message, occurrences, file/line, CTA button
- `sendDeploymentAlert`: success/failure deployment notification with branch, duration, environment
- `sendErrorSpikeAlert`: rate-based spike detection notification

**Interactions**: Consumes deployment events (auto-correlation), feeds bug system (linked bugs), triggers notification engine, feeds analytics (error rate trends).

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Invalid API key | Project lookup returns null | 401 response, no data stored |
| Ingest overload | Usage counter exceeds plan quota | 429 rate limit via `incrementErrorCount()` per org |
| Email/Slack send failure | Catch block in async alert | Best-effort — error is still stored, alert is logged |
| Cross-client query timeout | ClickHouse/PG query timeout | Return partial results with truncation notice |

---

## Module 25: AI Quality Scoring (LLM Judge + Pattern DB)

> **Origin**: Live Cortexo codebase (`lib/llm-judge.ts`, `lib/pattern-db.ts`, `lib/degradation-detector.ts`, `lib/verification-gate.ts`)

**Purpose**: Quantitative quality scoring for AI/agent outputs + confirmed root cause pattern reuse to reduce AI API calls + output degradation detection + verification gates for task completion.

**Key Entities**: `judge_scores` (in-memory, DB in production), `root_cause_patterns` (confirmed RCA reuse), `degradation_checks` (quality monitoring)

### Sub-module 25a: LLM-as-a-Judge Scoring Engine

**How It Works**:
1. **5-dimension scoring** (0-100 each): Correctness, Completeness, Code Quality, Security, Actionability
2. **Dual mode**: when `OPENAI_API_KEY` set → GPT-4o-mini judges. Otherwise → heuristic fallback (text analysis: code blocks, headers, sections, security terms, actionability markers).
3. **Score history**: last 500 scores retained with averages per dimension.
4. **Human review gate**: AI output held until `reviewed_by` populated. Confidence score colour-coded (<0.5 red, 0.5-0.7 amber, >0.7 green).

### Sub-module 25b: Root Cause Pattern Database

**How It Works**:
1. **Save confirmed patterns**: after human verifies an RCA → store as reusable pattern with fingerprint, root cause, suggested fix, language, framework, tags, confidence.
2. **Pattern matching**: new error → search by fingerprint (exact, 100% match) → fallback to fuzzy message similarity (Jaccard on word bigrams, threshold ≥40%).
3. **Confidence feedback**: users upvote/downvote pattern accuracy → confidence score adjusts.
4. **Usage tracking**: each match increments `usage_count` + updates `last_matched_at`.

### Sub-module 25c: Degradation Detector

**Tracks 5 key degradation patterns**:
1. Quality drift (scores declining over time)
2. Repetition increase (same outputs for different inputs)
3. Hallucination markers (confident assertions without evidence)
4. Context window overflow (truncation indicators)
5. Response latency spikes

### Sub-module 25d: Verification Gate (Iron Law)

**5-step strict verification for task completion**:
1. Syntax validation (code compiles/parses)
2. Test pass (automated tests green)
3. Lint clean (no new warnings)
4. Review approved (human sign-off)
5. Deploy verified (health check post-deploy)

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| OpenAI API unavailable | Fetch error / timeout | Auto-fallback to heuristic scoring (confidence: 55% vs 85%) |
| Pattern DB overflow | Size exceeds 10K patterns | LRU eviction by `last_matched_at` |
| False positive pattern match | User downvotes (<40% confidence) | Pattern auto-hidden below confidence threshold 20% |

---

## Module 26: Agent Orchestration System

> **Origin**: Live Cortexo codebase (`lib/orchestration.ts` — 211 lines)

**Purpose**: Multi-agent coordination with sub-agent caps, token budget management, forward_message protocol, and consensus voting for critical decisions.

**Key Entities**: `orchestration_sessions`, `sub_agents`, `forward_messages`, `consensus_votes`

**How It Works**:
1. **Session creation**: parent task spawns orchestration session with base token budget × 15 multiplier, max 3-5 sub-agents.
2. **Sub-agent spawning**: roles include `code_review`, `security`, `testing`, `deploy`, `custom`. Respects cap (MAX 5 per session).
3. **Token budget awareness**: total sub-agent token usage tracked. If exceeded → alert, no new spawns allowed.
4. **Forward messaging**: inter-agent communication via `forward_message` protocol. Types: `result`, `question`, `vote`, `escalation`.
5. **Consensus protocol**: majority wins. If no majority → session escalated to human. Unanimous decisions fast-tracked.
6. **Auto-escalation**: escalation-type messages automatically set session status to `escalated`.

**Orchestration Rules**:
- Max 5 sub-agents per session
- 15× token budget (if main task uses N tokens, total ≤ 15N)
- Majority consensus required for critical decisions
- Escalation to human when consensus fails

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Sub-agent cap exceeded | Count check before spawn | Return error, suggest waiting for running agents to complete |
| Token budget exceeded | Budget check on agent completion | Block new spawns, alert, complete with partial results |
| Consensus deadlock | No majority after all votes | Auto-escalate to human reviewer |
| Agent timeout | No completion within TTL | Mark agent FAILED, exclude from consensus |

---

## Module 27: SSHFS Mount Manager

> **Origin**: Live Cortexo codebase (`routes/server-mounts.ts` — 471 lines)

**Purpose**: Manage SSHFS filesystem mounts for remote server access — mount/unmount/browse/read files from deployed client servers directly from the IDP UI.

**Key Entities**: `server_mounts` (mount configurations linked to servers)

**How It Works**:
1. **Mount config CRUD**: link mount to a server with remote path, local mount point, SSH user, auto-mount flag.
2. **Mount execution**: `sshfs` command with reconnect, keepalive (15s interval, 3 retries), kernel cache, compression off, strict host checking off.
3. **Unmount**: `fusermount -u` with lazy fallback (`-uz`).
4. **Live status**: check `mount` output for active mounts. Enrich with `df -h` disk info.
5. **Directory browsing**: `POST /server-mounts/:id/browse` — list files/dirs with type icons, sizes, modification dates. Sort: dirs first, then alpha.
6. **File reading**: `POST /server-mounts/:id/read-file` — read text files up to 2MB. Binary detection by extension. Line count included.

**Security**:
- **Shell injection prevention**: `validateShellSafe()` rejects dangerous characters (`;|&$\`"'\\(){}[]<>!#~`) in all user inputs.
- **Path traversal protection**: `safePath()` resolves and validates that target path is within mount base.
- **Binary file protection**: known binary extensions blocked from text read.
- **Size limit**: 2MB max file read to prevent memory issues.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| SSHFS mount failure | Non-zero exit code from sshfs | Update mount status to `error`, return stderr details |
| Mount already active | Check `mount` output before mounting | Return `already mounted` — idempotent |
| Path traversal attempt | Resolved path outside base dir | 403 Forbidden with "Access denied" |
| Remote server unreachable | SSHFS connection timeout | Error response with server connectivity details |

---

## Module 28: In-App Notification System

> **Origin**: Live Cortexo codebase (`routes/notifications.ts` — 98 lines)

**Purpose**: In-app notification management with org-scoped CRUD, mark-as-read, and internal helper for system-generated notifications.

**Key Entities**: `notifications` (org-scoped, user-optional)

**How It Works**:
1. **List notifications**: paginated, org-isolated, ordered by creation date (newest first). Returns unread count.
2. **Mark single as read**: `PATCH /notifications/:id/read` — sets `read_at` timestamp.
3. **Mark all as read**: `POST /notifications/read-all` — bulk update for entire org.
4. **Internal helper**: `createNotification()` — async, best-effort (never throws). Used by deploy worker, drift scanner, sync engine, etc.
5. **Notification types**: `deploy_success`, `deploy_failed`, `drift_detected`, `sync_completed`, `error_spike`, `sla_breach`, `approval_required`.

**Interactions**: Consumed by ALL modules that emit events. Driven by Redis Streams event bus. Fallback: email if primary notification fails.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| DB unavailable | Catch block in list endpoint | Return empty array — graceful degradation |
| Notification flood | Event count per minute | Rate limit per notification type per org |

---

## Module 29: Deploy Target Management

> **Origin**: Live Cortexo codebase (`routes/deploy-targets.ts` — 162 lines, `routes/deploy-configs.ts` — 156 lines)

**Purpose**: CRUD for SSH/SFTP deployment targets with encrypted-at-rest credentials, connection testing, and per-project deployment configuration management.

### Sub-module 29a: Deploy Targets

**Key Entities**: `deploy_targets` (SSH/SFTP server configs with encrypted keys/passwords)

**How It Works**:
1. **Create target**: name, type (ssh/sftp), host, port, username, auth method (key/password), private key, password.
2. **Credential encryption**: private keys and passwords encrypted via `crypto.ts` (AES-256-GCM) before storage. Decrypted only at deploy time.
3. **List targets**: credentials NEVER returned in list response — only `hasKey`/`hasPassword` boolean flags.
4. **Connection test**: `POST /deploy-targets/:id/test` — SSH connect, run `uptime + whoami + hostname`, return success/failure with duration.
5. **Server SSH test**: `POST /servers/:id/test-ssh` — test connection to a server (from servers table) using its stored public address and SSH key.

### Sub-module 29b: Deploy Configs

**Key Entities**: `deploy_configs` (per-project deployment source configurations)

**How It Works**:
1. **CRUD**: manage per-project configs: server ID, client slug, domain, protocol, deploy path, deploy user, DB host/name/user/port, git repo/branch, app framework/version, socket/ws/rate ports, notes.
2. **Enrichment**: list endpoint enriches with project name, server name, server IP from related tables.
3. **Validation**: Zod schema validation on all creates and updates.

**Security**: Credentials NEVER leave the server in plaintext. Encrypted-at-rest, decrypted in-memory only during SSH operations.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| SSH connection test failure | testSSHConnection returns error | Display error details, suggest checking host/port/credentials |
| Encryption key missing | ENV check at startup | Fail-fast on boot — refuse to start without ENCRYPTION_KEY |
| Orphaned deploy config | Project deleted, config remains | Periodic cleanup job removes configs for deleted projects |

---

## Module 30: Menu Permission System

> **Origin**: Live Cortexo codebase (`routes/menu-permissions.ts` — 225 lines)

**Purpose**: Per-user sidebar menu visibility controls — restrict which modules/pages each user can see, with admin override capability.

**Key Entities**: `user_menu_permissions` (per-user, per-menu-key visibility records)

**How It Works**:
1. **Master menu list**: 35+ menu items across sections (Projects, CI/CD, Bugs & Errors, Operations, Infrastructure, Sync & Migration, Agent Intelligence, Analytics, Tools, Testing, Settings).
2. **Default behaviour**: all items visible for all users unless explicitly hidden.
3. **User self-service**: `PUT /menu-permissions` — user can hide/show their own menu items.
4. **Admin override**: `PUT /menu-permissions/user/:id` — admin can control other users' visibility (requires `admin` or `owner` role).
5. **Audit trail**: all menu permission changes logged to audit system with user ID, action, affected items.
6. **Upsert logic**: `ON DUPLICATE KEY UPDATE` — create permission record if not exists, update if exists.

**Section mapping**:
- Always visible: Dashboard, Settings
- Restrictable: Projects, CI/CD (Pipelines/Deployments/Canary/Rollbacks), Bugs & Errors, Operations (Postmortem/Deprecations), Infrastructure (Servers/Mounts/Logs), Sync & Migration, Agent Intelligence, Analytics, Tools, Testing

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| DB unavailable | Catch block | Return all-visible defaults — never block UI access |
| Non-admin tries admin endpoint | `requireAdmin` preHandler | 403 Forbidden |

---

## Module Extensions (from Old_Tool — Additional)

### Module 17 Extension: File Classifier Engine

> **Origin**: `BullionDevops/services/fileClassifier.js` (176 lines)

Added to Source Sync Engine — intelligent file routing for multi-tenant sync:
- **Pattern-based classification**: regex rules auto-classify files as `retail`, `crm_chit`, `shared`, or `never` based on filename/path patterns
- **Classification types**:
  - `retail` — retail-specific controllers/models (e.g., `admin_ret_*`, `ret_*_model`)
  - `crm_chit` — CRM/chit fund controllers/models (e.g., `crm_*`, `chit_*`)
  - `never` — files that should NEVER be synced (e.g., `.github/`, `vendor/`, `config/database.php`, `.env`, client-specific APIs like `sktm_*`, `khimji_*`)
  - `shared` — default classification, syncs to ALL clients
- **Manual overrides**: `file_classifications` table stores admin overrides (manual > auto). Override flag preserved across re-scans.
- **Client type filtering**: `shouldSyncFile()` checks file classification against client type (retail/crm_chit/general) — type-specific files only sync to matching clients
- **Glob matching**: supports `*` (any filename chars) and `**` (any path depth) for both classification rules and sync profile rules
- **Integration**: used by Source Sync Engine during sync execution AND by Divergence Analyzer during analysis

**Key Entities**: `file_classifications` (per-file overrides), `classification_rules` (pattern library)

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Classification rule regex invalid | Pattern compilation error | Skip rule, log warning, continue with remaining rules |
| Manual override conflicts with auto-classification | Validation on save | Manual always wins — surface warning in UI |

---

### Module 17 Extension: Module Mapper

> **Origin**: `BullionDevops/services/module-mapper.js` (144 lines)

Added to Source Sync Engine — maps file paths to business modules for divergence analysis:
- **Module rules**: regex-based mapping of file paths to business modules (Billing, Reports, Tagging, Purchase, Customer & Master, Payment, Scheme & Chit Fund, Estimation, Catalog, Dashboard, Admin & Auth, Mobile API, Config & System, Libraries, DevOps & Workflows, Assets & Styles, JavaScript, Views, Controllers, Models)
- **Group by module**: groups file arrays by detected module for module-level divergence summaries
- **Module summary**: per-module divergence stats (total, identical, sourceOnly, clientOnly, bothChanged, newInSource, newInClient, syncable %, divergence %)
- **Sorted output**: modules sorted by divergence score descending — worst-diverged modules surfaced first

---

### Module 6 Extension: Divergence Analyzer (Deep Analysis)

> **Origin**: `BullionDevops/services/divergence-analyzer.js` (416 lines)

Added to Code Difference Engine — production-grade hub-vs-client divergence analysis:
1. **File tree comparison**: GitHub API recursive tree fetch for both hub and client repos
2. **SHA-based categorization**: files categorized as `identical`, `both_changed`, `new_in_source`, `new_in_client` by comparing SHA hashes
3. **Exclude pattern filtering**: glob-to-regex conversion with default excludes (vendor/**, .github/**, config/database.php, .env, assets/images/logo*, node_modules/**) + per-client custom excludes
4. **Line-level diffs**: for `both_changed` files, fetch blob content via GitHub API, compute line-by-line diff stats (changedLines, additions, deletions, changePercent)
5. **Batched diffing**: diffs processed in batches of 5 to respect GitHub API rate limits, configurable sample size (default 30)
6. **Severity classification**: minor (≤5% change), moderate (≤25%), major (>25%), unknown (no diff data)
7. **Divergence score**: `((totalFiles - identicalFiles) / totalFiles) * 100`
8. **Sync mode recommendation**: `full_sync` (≤10%), `safe_sync` (≤40%), `cherry_pick` (≤70%), `notify_only` (>70%)
9. **Module grouping**: files grouped by business module via Module Mapper for per-module divergence stats
10. **DB persistence**: analysis results stored in `divergence_analyses` table with full file lists, module summaries, commit SHAs, and duration
11. **Historical tracking**: `getLatestAnalysis()` and `getAllLatestAnalyses()` for trend views

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| GitHub API rate limit during tree fetch | 403/429 response | Backoff with Retry-After. Partial analysis with warning. |
| Blob fetch fails for diff (file too large) | Error response from GitHub | Skip diff for that file, mark severity as `unknown` |
| Tree truncated (>100k files) | `truncated: true` in API response | Log warning, proceed with partial tree, surface `treeTruncated` flag in result |

---

## Module 24: Client Provisioning System

> **Origin**: `BullionDevops/services/provision/provision.service.js` (1357 lines), `provision.controller.js` (336 lines)

**Purpose**: Fully automated white-label client onboarding — from git clone to live production deployment in a single workflow. Provisions infrastructure, database, web server, and application configuration via SSH with real-time progress streaming.

**Key Entities**: `provision_runs` (execution records), `provision_step_logs` (per-step audit)

**How It Works**:
1. **Preflight validation**: check for duplicate slugs, deploy paths, domains, database names, and PM2 process names against both `provision_runs` and `projects` tables. Returns conflicts with specific error messages.
2. **GitHub repo fork**: fork hub template repo into client organization, set up branch protection
3. **Git clone/pull**: clone source template repo to deploy path via SSH. If directory exists, pull latest. Inject GitHub token for HTTPS auth. Switch git remote to client's own repo.
4. **Clean media**: empty default advertisement/gallery/popup image directories
5. **Reset client files**: truncate log files, empty rate files (.enc/.txt), clean up previous client artifacts
6. **Composer install**: run `composer install --no-dev` in project root AND Lumen API subdirectory
7. **Clone RDS database**: create new MySQL database + user + grant. Clone from source DB via `mysqldump | mysql` pipeline. Supports fresh/schema/clone/import seed modes.
8. **Clean database**: truncate 40+ transactional tables (sessions, orders, customers, hedging, stock, content). Update company name, admin credentials, client codes, URLs, SMTP settings.
9. **Dynamic file patching**: replace hardcoded source paths, domain URLs, database credentials across PHP config files (`database.php`, `global_configs.php`). Upload client template files (rate socket, WebSocket, package.json).
10. **Assign PM2 socket port**: auto-detect next available port range on server for Socket.IO, rate socket, and native WebSocket processes.
11. **Start PM2 processes**: npm install → PM2 start for main socket, rate socket, and native WebSocket. Save PM2 process list.
12. **Write Nginx vhost**: generate complete Nginx server block with PHP-FPM, CodeIgniter routing, API routing, Socket.IO proxy, rate socket proxy, native WebSocket proxy, static caching, gzip, security headers. Also supports Apache reverse proxy generation.
13. **SSL via Certbot**: if SSL mode is `letsencrypt`, run `certbot --nginx` for automatic HTTPS provisioning
14. **File permissions**: `chown -R www-data:www-data`, reload php-fpm
15. **Register GitHub webhook**: create webhook on client repo for deployment automation
16. **Health check**: curl the deployed domain, verify HTTP 200 response
17. **Register in DevOps DB**: insert client record into projects table with all config metadata

**Real-time streaming**: every step emits `provision:step` and `provision:log` events via Socket.IO to connected dashboard client. Step status: `running → done | failed`.

**Safety features**:
- **Preflight checks** prevent duplicate deployments (slug, path, DB, PM2 process conflicts)
- **Abort support**: admin can abort a running provision — SSH connections disposed, run marked as failed with abort message
- **Orphan cleanup**: on server restart, all stuck `running` provisions auto-marked as `failed`
- **Email notifications**: `sendProvisionStarted`, `sendProvisionSuccess`, `sendProvisionFailed`, `sendProvisionAborted` via SMTP
- **Validation**: Joi schema validates all 30+ input fields before execution begins

**Interactions**: Creates entries in `projects` table (Config Management reads), triggers Git Source Registry webhook setup, feeds Deployment System for subsequent deploys.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| SSH connection to server fails | Connection timeout / auth failure | Abort provision, mark as failed, email alert with server IP |
| Database clone fails (source DB unreachable) | mysqldump exit code non-zero | Step fails, provision aborted, partial state preserved for debugging |
| Nginx config syntax error | `nginx -t` fails after vhost write | Remove broken config, reload previous config, step marked as failed |
| PM2 process port conflict | PM2 start exits with error | Auto-detect next available port range, retry once |
| Server restarted mid-provision | `status = 'running'` on startup | Auto-mark as `failed` with "Server restarted" message |
| Preflight detects duplicate | Conflict list returned | Provision blocked before SSH connection — zero side effects |

---

## Module 25: Server Mount Manager

> **Origin**: `BullionDevops/EC2/server.sh` (120 lines), `routes/common.js` — SSHFS mount endpoints

**Purpose**: Manage read-only SSHFS mounts to production EC2 servers for file browsing, log reading, and source comparison — without granting write access to live infrastructure.

**Key Entities**: `server_mount_sessions` (active mount records)

**How It Works**:
1. **Server registry**: associative map of server IDs to private IPs (behind bastion host)
2. **Mount command**: `sshfs -o ro,ProxyJump=$BASTION,StrictHostKeyChecking=no,ConnectTimeout=8 ubuntu@$IP:/ "$DIR"`
3. **Read-only enforcement**: `-o ro` flag ensures no writes possible to production filesystem
4. **Bastion proxy**: all connections tunnel through bastion host (public IP) to private subnet EC2 instances
5. **Mount status**: check via `mount | grep` for each server directory
6. **Unmount**: `fusermount -uz` for clean lazy unmount. Fallback: `sudo umount -f`
7. **Batch operations**: mount/unmount all servers or individual by ID
8. **Health status**: color-coded status display (MOUNTED/NOT MOUNTED) for all registered servers

**Security**: read-only mounts prevent accidental writes. SSH key-based auth via bastion host. No password-based access.

**Interactions**: Provides filesystem access for Source Sync (rsync source), Log Viewer (remote log files), and Code Difference Engine (deployed file comparison).

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Bastion host unreachable | SSH connection timeout (8s) | Mount marked as FAILED. Alert admin. Retry on next attempt. |
| SSHFS mount stale (server rebooted) | File access returns I/O error | `fusermount -uz` + re-mount. Auto-detect via periodic health check. |
| Mount directory doesn't exist | `mkdir` before mount | Auto-create mount point directory on first mount attempt |

---

## Module 27: Email Alert System

> **Origin**: `BullionDevops/services/email-alert.js` (207 lines)

**Purpose**: Templated SMTP-based email notifications for deployment, provisioning, and site health events. Provides rich HTML email templates with BullionOps branding.

**Key Entities**: `email_alert_config` (per-alert-type recipient configuration)

**How It Works**:
1. **Transporter setup**: Nodemailer SMTP with configurable host/port/user/pass via environment variables. TLS support with `rejectUnauthorized: false` for self-signed certs.
2. **Recipient management**: per-alert-type recipients stored in `email_alert_config` table (alert_type, recipients CSV, is_enabled). Fallback to `ALERT_EMAIL` env var if DB config missing.
3. **Alert types supported**:
   - `deploy_success` — successful deployment with client, server, branch, git SHA, duration, deployer info
   - `deploy_fail` — failed deployment with full error stack in red-bordered pre block
   - `site_down` — site downtime alert with domain, client, error details
   - `provision` — provision lifecycle (started/success/failed/aborted) with slug, domain, server IP, database
   - `alert` — generic alert (used by notification hub)
4. **HTML template engine**: base template with dark header, status-colored left border, and key-value table rows. IST timezone display.
5. **Status colors**: success (#10b981 green), failure (#ef4444 red), info (#3b82f6 blue), warning (#f59e0b amber)
6. **Subject prefix**: all emails prefixed with `[BullionOps]` for easy filtering

**Integration with Notification Engine (Module 12)**: Email Alert System serves as the SMTP channel implementation for the Notification Engine. When a notification rule routes to email channel, the Notification Engine delegates to this module.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| SMTP server unreachable | Nodemailer transport error | Return `{ sent: false, reason }` — caller logs and continues. Never blocks deployment. |
| No recipients configured for alert type | Empty recipients list | Return `{ sent: false, reason: 'No recipients' }` — fail silently |
| SMTP auth failure | Auth error from transport | Log error, return failure status. Admin notified via fallback channel (Slack). |

---

## Module 28: Client Migration Executor

> **Origin**: `BullionDevops/routes/migrate.js` (157 lines)

**Purpose**: Execute client migration/provisioning shell scripts from the dashboard with real-time output streaming via Socket.IO. Provides a web-based terminal experience for infrastructure automation.

**Key Entities**: `migration_runs` (execution records with stdout/stderr logs)

**How It Works**:
1. **Script execution**: spawns `migrate-client.sh` as a child process with client-specific parameters (clientName, clientSlug, domain, packageId, primaryColor, storagePrefix, apiKey, oneSignalId)
2. **Real-time streaming**: stdout/stderr lines emitted via Socket.IO to `migrate-output` room with timestamps and line types (stdout/stderr/system)
3. **Process management**: only one active migration at a time. New requests kill existing process (`SIGKILL`) before starting.
4. **Cancellation**: admin can cancel active migration via `POST /cancel` — sends SIGKILL to running process
5. **Status check**: `GET /status` returns whether migration is running, script exists, and script path
6. **Completion signals**: emits `__MIGRATE_COMPLETE__` (exit code 0) or `__MIGRATE_FAILED__` (non-zero) as system events for UI state management
7. **Script validation**: verifies migration script exists at configured path before execution
8. **Working directory**: executes in monorepo root for access to all project resources

**Interactions**: Complements Client Provisioning System (Module 24) for cases requiring custom migration scripts. Output logs feed into Logging + Observability module.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Migration script not found | `fs.existsSync` check | Return 400 with script path in error message |
| Script execution fails (non-zero exit) | `proc.on('close', code)` handler | Emit `__MIGRATE_FAILED__` with exit code. UI shows failure state. |
| Process spawn error (permissions, missing bash) | `proc.on('error')` handler | Emit error event via Socket.IO. Log with full error message. |
| Concurrent migration conflict | Active process check | Kill existing process before starting new one. Single-process guarantee. |

---

### Module 2 Extension: GitHub Workflow Trigger

> **Origin**: `BullionDevops/routes/sync.routes.js` — `triggerWorkflow`

Added to Deployment System:
- **GitHub Actions integration**: trigger GitHub Actions workflows on client repositories via `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`
- **Workflow inputs**: pass client-specific inputs (branch, environment, deploy target) as `inputs` to workflow dispatch
- **Multi-tenant workflow**: supports triggering across 70+ client repos with per-client workflow configuration
- **Secret management**: manages GitHub repository secrets via API (create/update/delete) for deployment automation
- **Setup wizard integration**: provisions GitHub secrets (SSH keys, deploy paths, server IPs) during initial client setup
- **Branch management**: create deployment branches on client repos from hub branches

---

### Module 14 Extension: System Settings Manager

> **Origin**: `BullionDevops/routes/advanced.routes.js` (101 lines)

Added to Onboarding Wizard / Platform Settings:
- **Key-value settings store**: `system_settings` table with `setting_key` + `setting_value` (JSON). Supports arbitrary settings.
- **Theme configuration**: store and retrieve platform UI theme (colors, fonts, logo URLs) via `GET/PUT /settings/theme`
- **Menu configuration**: dynamic sidebar menu structure stored as JSON via `GET/PUT /settings/menu-config`
- **Generic settings**: any setting by key via `GET/PUT /settings/:key` — extensible without schema changes
- **Admin-only writes**: middleware checks user role (`admin` or `superadmin`) for all PUT operations
- **UPSERT pattern**: `INSERT ... ON DUPLICATE KEY UPDATE` for atomic create-or-update

---

### Module 9 Extension: Source Sync (Local Dev ↔ EC2)

> **Origin**: `BullionDevops/routes/source-sync.js` (447 lines)

Added to Terminal System — developer-facing source code synchronization:
- **Mount-based file access**: SSHFS mounts production server directories for read-only browsing and diffing
- **Real-time diff**: compare local development repository files against mounted EC2 server files using `diff` command. Output parsed into structured `DiffResult` objects.
- **Rsync execution**: one-way sync from local dev → EC2 server using `rsync -avz --delete` with exclusion patterns. Real-time progress via Socket.IO.
- **Sync history**: every sync operation logged with source/target paths, file count, timestamp, and git context
- **Git integration**: wrapper endpoints for `git status`, `git log`, `git branch`, `git diff` on local development repositories
- **Server selection**: dynamic server target selection with bastion host proxy configuration
- **Exclude patterns**: configurable exclusion list (node_modules/, .git/, vendor/, *.log) for both diff and sync operations
- **Dry-run mode**: preview changes before syncing with `rsync --dry-run`

---

### Module 28: Migration Tracking Dashboard

> **Origin**: `DevOps_deploy_tool/routes/migrations.js` (127 lines) + `Migrations.jsx` (14KB)

**Purpose**: Track per-client database migration status linked to deployments. Provide fleet-wide migration overview.

**Key Entities**: `client_migrations`, linked to `deployment_history`

**How It Works**:
1. **Migration report callback**: deploy scripts call `/api/migrations/report` after running migrations on client servers
2. **Data captured per migration**: client_id, environment, migration_name, status (applied/failed), applied_by, duration_ms, error_message, deployment_id
3. **Upsert strategy**: `ON CONFLICT UPDATE` keyed on (client_id, environment, migration_name) — re-applying a migration updates its status
4. **Fleet overview API**: `/api/migrations` → latest migration per client+environment, total applied, total failed
5. **Per-client history**: `/api/migrations/:clientId?environment=production` → last 100 migrations with full detail
6. **Summary stats**: total clients with migrations, total applied, total failed, last migration timestamp
7. **UI page**: filterable table showing client migration status grid — color-coded (green=applied, red=failed)

**Interactions**: Linked to deployment records via `deployment_id`. Migration failures feed into Bug module for RCA.

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Migration report callback fails | Deploy script HTTP error | Script retries once. If still fails, logs locally for manual import. |
| Duplicate migration report | ON CONFLICT clause | Silently updates — idempotent by design |

---

### Module 29: Server Permission Audit

> **Origin**: `DevOps_deploy_tool/legacy/set_perm.sh` (112 lines)

**Purpose**: Verify and fix directory permissions across managed servers. Ensures correct ownership and permission bits for web deployments.

**How It Works**:
1. **Scheduled scan** (weekly cron) or **on-demand** via admin UI
2. **Per-environment** (production, staging, QA, dev): SSH into managed server
3. **Ownership check**: verify `ubuntu:www-data` on web root directories
4. **Permission rules**:
   - Standard directories: `755` (rwxr-xr-x)
   - Standard files: `644` (rw-r--r--)
   - Writable directories (uploads, logs, cache, sessions): `2775` (rwxrwsr-x with setgid)
   - Executable scripts (.sh, .bash): preserve execute bit
5. **15 writable directory patterns**: uploads, temp, generated, reports, logs, error_logs, sessions, views, cache, exports, attachments, backups, cron_logs, excel_uploads, pdf_uploads
6. **Confirmation gate**: production environment requires explicit admin confirmation before applying fixes
7. **Audit log**: every permission change logged with timestamp, server, path, old→new permissions
8. **Drift detection**: if permissions differ from expected → emit `permissions.drift_detected` event

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| SSH connection fails | Connection timeout | Skip server, retry next cycle. Alert admin. |
| Permission change fails | Non-zero exit code | Log error, continue with remaining directories |

---

### Module 30: File Classifier Engine

> See **Module 17 Extension: File Classifier Engine** above for full specification.

**Key Entity**: `file_classifications` — stores manual admin overrides of auto-classification.

---

## Architecture Decision Records (ADRs)

### ADR-001: Deployment Strategy Selection

> **Origin**: `DevOps_deploy_tool/legacy/code_deployment_strategies.md` (651 lines)

**Context**: Evaluated 9 deployment strategies for multi-client ERP management:
1. Fork-per-Client (Multi-Repo) — current legacy approach
2. Branch-per-Client (Single Repo)
3. **Mono-Repo with Override Directories** ← selected for Phase 2
4. Git Submodules
5. Git Subtree
6. Package Manager / Composer Modules
7. **Feature Flags (Config-Driven)** ← selected for Phase 1
8. **Multi-Tenancy (Single Deployment)** ← target for Phase 3
9. Template Repo + Downstream Forks

**Decision**: Layered approach — Feature Flags (immediate) → Mono-Repo Overrides (months 2-4) → Multi-Tenancy (months 6-12)

**Rationale**: Mono-Repo with Overrides scored highest for maintenance (★★★★★), scalability (★★★★★), and CI2/CI3 compatibility while preserving client customization. Feature Flags handle 60-80% of behavioral customizations as config rows. Multi-Tenancy is the end-game.

**Impact on IDP**: The Source Sync Engine (Module 17) evolves from sync manager → deploy manager as mono-repo eliminates per-client repos. Divergence Analysis becomes unnecessary at Phase 3 (no divergence in multi-tenant model).

---

## Module 37: Recipe Engine (from bug-recipes/)

> **Source**: Integrated from `/Devops/bug-recipes/` — 33 recipes, 30+ patterns, 17 playbooks.

**Purpose**: Store, detect, and apply standardized bug fix recipes across all 77+ clients. A recipe is a structured "before→after" code fix with detection logic, root cause analysis, and verification steps.

**Key Entities**: `recipes`, `recipe_files`

**How It Works**:
1. **Recipe ingestion**: Recipes can be created manually (UI) or by Tom (AI via `POST /api/recipes`). Each recipe follows the template from `bug-recipes/recipes/_TEMPLATE.md`.
2. **Recipe structure**: Every recipe contains:
   - **Metadata**: pattern_id (e.g. `PAT-CSRF-001`), severity, modules affected, auto-fixable flag
   - **Client Scope**: ALL clients or specific clients (with reason)
   - **Detection**: grep/regex command that identifies vulnerable code
   - **Symptom**: What the user sees when the bug is active
   - **Root Cause**: Technical explanation of why the bug exists
   - **Fix**: Before/after code snippets (exact replacement)
   - **Verification**: Steps to confirm fix works + edge cases to test
3. **Recipe Scanner (worker)**: Scheduled + on-demand. For each recipe with `detection_cmd`:
   - Runs detection command against target client's codebase (via SSH or Git clone)
   - If match found → creates `client_recipes` entry with status `vulnerable`
   - Emits `recipe.match_found` event → notification to dashboard
4. **Auto-fix flow** (for recipes where `auto_fixable = true`):
   - Scanner detects match → creates Git branch → applies fix (string replacement)
   - Runs `php -l` syntax check on affected files
   - Creates PR for human review
   - On approval → deploys to staging → runs unit tests → promote to production
5. **Recipe versioning**: Recipes are immutable once published. Updates create new version, preserving history.

**Recipe Categories** (from bug-recipes patterns):
- **Security**: SQL injection, XSS, CSRF, plaintext passwords, CORS wildcard
- **Transaction**: Orphaned trans_begin, missing status check, race conditions
- **Query Logic**: UNION scope leak, ambiguous columns, subquery issues
- **Variable**: Null object, copy-paste mismatch, implicit type coercion
- **JavaScript**: Global scope leak, event accumulation, hardcoded IDs
- **Business Logic**: Blind ratio distribution, return omission, round-off

**Interactions**: 
- Triggers client_recipes tracking (Module 39)
- Links to bugs (Module 3) — bug fix can become a recipe
- Links to deployments (Module 2) — recipe applied via deployment
- Links to testing (Module 11) — recipe fix must pass unit tests

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Detection command hangs/timeout | Worker job TTL (30s per recipe per client) | Mark scan incomplete, retry next cycle |
| Auto-fix creates invalid code | `php -l` syntax check fails | Abort fix, mark recipe as `manual_only`, notify developer |
| Recipe detection false positive | Human reviews vulnerable status → marks `not_applicable` | Excluded from future scans for that client |

---

## Module 38: Playbook System (from bug-recipes/playbooks/)

> **Source**: Integrated from `/Devops/bug-recipes/playbooks/` — 17 debug playbooks.

**Purpose**: Route developers to the right debugging methodology based on the symptom type. Playbooks are step-by-step investigation guides, NOT automated processes.

**Key Entities**: `playbooks`, `playbook_steps`

**How It Works**:
1. **Symptom → Playbook routing**: When a bug is created (manual or by Tom), the `symptom_type` field maps to a playbook:

   | Symptom Type | Playbook | First Check |
   |---|---|---|
   | `action_error` | Action Error Playbook | HTTP status code + server error log |
   | `silent_failure` | Silent Failure Playbook | PHP error_reporting setting + form action URL |
   | `wrong_data` | Wrong Data Playbook | SQL query trace + WHERE clause audit |
   | `performance` | Performance Playbook | EXPLAIN ANALYZE + Redis KEYS check |
   | `permission_denied` | Permission Playbook | Session check + rights table audit |
   | `dropdown_wrong` | Dropdown Data Playbook | Model query + JOIN conditions |
   | `notification_missing` | Notification Playbook | SMS/WhatsApp API log + queue status |
   | `regression` | Regression Playbook | Git diff + recent deploy changes |
   | `duplicate_records` | Duplicates Playbook | Unique constraint + race condition check |
   | `cancel_corrupt` | Cancel Corruption Playbook | Transaction log + status field audit |
   | `css_print` | CSS/Print Playbook | Print media query + @page rules |
   | `js_error` | JS Debugging Playbook | Console errors + event listener audit |
   | `data_mismatch` | Data Mismatch Playbook | Source vs display query comparison |
   | `client_specific` | Client-Specific Playbook | global_configs.php diff + custom code check |
   | `ci_framework` | CI Framework Playbook | CI3 session + routing + helper issues |

2. **Playbook rendering**: Each playbook stored as structured steps in `playbook_steps` table. UI renders as an interactive checklist.
3. **Step types**: `check` (verify something), `command` (run a command), `decision` (yes/no branch), `note` (context info)
4. **Bug integration**: When a bug has symptom_type set, the bug detail page shows "Recommended Playbook: {name}" with a direct link.
5. **AI Debugger Role integration**: The debugger methodology from `bug-recipes/roles/debugger.md` is embedded:
   - **5 Laws of Debugging**: Never assume, always verify, binary search, time-box, document
   - **Binary Search Protocol**: Narrow the fault domain by halving scope each step
   - **Smell Tests**: Quick pattern recognition (e.g., "500 error + recent deploy = regression")

**Interactions**:
- Linked FROM bugs (Module 3) via `symptom_type` → playbook mapping
- Playbook completion can generate checklist data saved in `bug_events.metadata`

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Playbook outdated (new symptom type has no playbook) | `symptom_type` not in mapping table | Show generic "Investigation Checklist" + flag for playbook creation |
| Playbook step references deleted file path | Step validation check (scheduled) | Mark step as outdated, highlight in UI |

---

## Module 39: Client Recipe Tracker

> **Source**: Cross-cutting feature — maps which bug-recipe fixes are applied to which clients.

**Purpose**: Track per-client recipe application status. Provides the "Client × Recipe Matrix" — a grid showing which clients have which fixes applied, which are vulnerable, and which are not applicable.

**Key Entities**: `client_recipes`

**How It Works**:
1. **Matrix view**: Grid with clients as rows, recipes as columns. Each cell shows status:
   - 🔴 `vulnerable` — recipe detected as applicable but not yet applied
   - 🟡 `applied` — fix applied but not verified
   - 🟢 `verified` — fix applied and verified working
   - ⚪ `not_applicable` — recipe doesn't apply to this client (custom code, different module set)
2. **Population**: 
   - Recipe Scanner (Module 37) auto-populates `vulnerable` entries when detection matches
   - Tom marks `applied` via API after fixing a client
   - Jerry marks `verified` after testing
   - `not_applicable` set manually by admin or by scanner when detection shows no match
3. **Dashboard widgets**:
   - "X of 77 clients have PAT-CSRF-001 applied" — progress bar per recipe
   - "Client NSK has 5 unapplied critical recipes" — alert per client
   - "Fleet fix coverage: 89%" — overall recipe application rate
4. **Deployment integration**: When a deploy includes recipe fixes:
   - Deploy log references `recipes_applied[]`
   - `client_recipes` status auto-updates from `vulnerable` → `applied`
   - Verification remains manual (Jerry must test and mark `verified`)
5. **Bulk operations**: "Apply PAT-CSRF-001 to all vulnerable clients" — creates batch of deployment tasks

**Interactions**:
- Reads from recipes (Module 37) — which recipes exist
- Reads from clients — which clients exist  
- Links to deploys (Module 2) — which deploy applied which recipe
- Links to bugs (Module 3) — recipe may originate from a bug fix

**Failure Modes**:
| Failure | Detection | Recovery |
|---|---|---|
| Recipe applied but client_recipes not updated | Deploy log has recipe_id but client_recipes still shows vulnerable | Reconciliation job checks deploy logs vs client_recipes weekly |
| Bulk apply creates too many concurrent deploys | Rate limiter on batch operations | Queue with max 5 concurrent, backpressure UI |

---

## Bug-Recipes Integration: Additional Assets

> **Source**: Features from `bug-recipes/` that are embedded across modules rather than having their own module.

### Error Log Parser Patterns (→ Module 38 / Playbooks)

Structured error-to-root-cause mappings from `playbooks/error_log_parser.md`, integrated into the Playbook System for instant pattern recognition:

| Error Pattern | Root Cause | Fix Direction |
|---|---|---|
| `Undefined variable: $xxx` | Variable assigned inside if/else that didn't execute | Add initialization before the if/else |
| `Trying to access array offset on null` | `->row_array()` returned NULL | Add `if ($result)` check before accessing |
| `Cannot modify header information` | Output before `redirect()` | Remove stray debug output |
| `Maximum execution time exceeded` | N+1 query or unindexed WHERE | See performance playbook |
| `Allowed memory size exhausted` | Unbounded query or large file | Add LIMIT or chunk processing |
| `Call to undefined method` | Method renamed/deleted, model not loaded | Check `$this->load->model()` |
| `A Database Error Occurred` | SQL syntax, constraint, wrong column | Read SQL in error message |
| `Deadlock found` | Two transactions competing for same rows | Retry logic or reorder operations |

**Storage**: These patterns are seeded into the `recipes` table with `category = 'error_pattern'` and `auto_fixable = false`. They serve as lookup references during debugging, not automated fixes.

### Investigation SQL Templates (→ Module 38 / Playbooks)

10 pre-built SQL query templates from `playbooks/investigation_templates.md` for common debugging scenarios. Stored as `playbook_steps` with `step_type = 'command'`:

1. **Record Lifecycle Trace** — full history of a specific record
2. **Orphan Detection** — find child records with missing parents
3. **Bill Integrity Check** — header vs detail total comparison
4. **Payment Reconciliation** — payment received vs bill amount
5. **Tag Status Audit** — tag_status consistency check
6. **Journal Verification** — debit/credit balance validation
7. **Cross-Module Write Detection** — trace who wrote to a record
8. **Settings Value Check** — dump relevant settings
9. **Date/Branch Filter Verification** — report filter sanity check
10. **Duplicate Detection** — find duplicate values in any table

**Storage**: Seeded into `playbook_steps` for the relevant symptom-type playbooks. Each template has `{placeholders}` that the developer fills in during debugging.

### GitHub MCP Setup Workflow (→ External / Developer Onboarding)

The `setup-github-mcp.md` workflow from `.agent/workflows/` defines how to configure GitHub MCP server in Antigravity for direct repo access (issues, PRs, file reads). This is a **developer onboarding step**, not a platform feature.

**Integration**: Documented in the platform's onboarding wizard (Module 27) as a prerequisite step for developers who use AI-assisted bug fixing via Antigravity/Tom.

### Bi-Directional Sync Infrastructure (→ Replaced by Module 37 + 39)

The PowerShell sync scripts (`.agent/scripts/sync-bug-recipes.ps1`) and Task Scheduler integration are **replaced** by the Recipe Engine (Module 37) + Client Recipe Tracker (Module 39). The old file-system sync approach:

| Old (File Sync) | New (Cortexo DB) |
|---|---|
| PowerShell copies .md files between repos | API-based recipe CRUD |
| Task Scheduler runs every 30 min | Recipe Scanner worker (on-demand + scheduled) |
| Validates `## Symptom` + `## Fix` sections | DB schema enforces required fields |
| `git commit + push` to central repo | Versioned records in PostgreSQL |
| `sync-config.json` for path mappings | `client_recipes` table for status tracking |

