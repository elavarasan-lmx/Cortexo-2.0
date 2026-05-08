# 🎨 UI/UX Specification — Cortexo IDP

> **Source**: IDP_Master_Prompt_v4 Part 8 (§25–32) — Full specification
> Dark-first theme throughout. AAA accessible contrast ratios. Risk indicators use shape + colour (never colour alone).
>
> **Scope**: This document specifies the **self-hosted IDP operator views** (Command Center, Pipeline DAG,
> Drift UI, Log Viewer, etc.) for internal DevOps teams managing 70+ clients.
> For the **SaaS product UI** (landing page, billing, agent intelligence dashboard), see
> [`planning/03_ui_ux_design.md`](../planning/03_ui_ux_design.md).

---

## View 1 — System Command Center

**Purpose**: Single-page global health overview. The first screen every operator sees. Must convey: what is broken, what is at risk, what is in progress — within 3 seconds of page load.

### Layout

- **Top row**: Four global KPI cards — Active deployments, Servers with missed heartbeat, Open critical bugs, DLQ depth. Each KPI shows delta vs prior 24h.
- **Main grid**: Client health score cards. 70+ client grid, sortable by: health score (default), name, last deploy, region. Each card: health score badge (colour + number), last deploy time, active bugs count, drift indicator, active deployment spinner.
- **Right panel**: Live activity feed — deployment events, heartbeat alerts, DLQ items, approval requests. WebSocket-driven, newest first, max 50 visible, older collapse into expandable history.
- **Bottom strip**: Server map — grouped by region. Each server node coloured by heartbeat recency (green < 60s, amber 60-90s, red > 90s). Click server: modal with CPU/memory/disk from last heartbeat.

### Interactions

- Click client card → navigate to Client Project Dashboard
- Click alert in activity feed → navigate to relevant entity (deployment, bug, server)
- Filter bar: filter client grid by status (healthy/warning/critical), region, tag
- Quick action button (floating): trigger deploy, force drift scan, view DLQ — with role gate

### Real-Time Updates

- **WebSocket channel**: `tenant::{tenant_id}::command_center`
- **Events pushed**: client health_score changes, deployment status changes, heartbeat_missed, drift.detected, DLQ depth changes

### Empty/Error States

- **No clients yet**: Onboarding prompt to add first client with wizard deep link
- **WebSocket disconnected**: Stale-data banner with reconnect button; data still displayed from last push
- **SSR API timeout**: Render skeleton with cached last-known data, surface warning

---

## View 2 — Client Project Dashboard

**Purpose**: Deep-dive into a single client's health, deployments, modules, and bugs.

### Sections

- **Header**: Client name, health score trend (sparkline last 30 days), region, environment selector, last deploy metadata
- **Module grid**: Each module card shows — current version, last deploy status, test pass rate, drift badge, linked open bugs count. Click: module detail drawer.
- **Deployment timeline**: Last 20 deployments, newest first. Each row: commit SHA (linked to Git), author, environment, status badge, duration, changelog icon. Click: deployment detail.
- **Pre-deploy diff panel**: Shown when a deployment is queued or pending approval. Files changed since last deploy in target env, modules affected, risk indicator (low/medium/high based on scope).
- **Bug summary strip**: Open bugs by priority (critical bar, high bar, medium, low). Click priority: filtered bug list.
- **Test coverage bar**: Per-module coverage percentage vs prior deploy delta (arrow up/down).
- **Server panel**: Linked servers with heartbeat status, mount paths, SSH terminal shortcut.

### Real-Time Updates

- **WebSocket channel**: `tenant::{tenant_id}::client::{client_id}`
- **Events**: deployment status changes, module version updates, heartbeat changes, bug created/resolved

---

## View 3 — Pipeline Visualizer

**Purpose**: Visual DAG rendering of pipeline execution with real-time step status updates.

### Layout

- **DAG canvas**: Directed acyclic graph. Nodes = steps. Edges = dependencies. Parallel steps rendered in vertical columns side-by-side.
- **Node states**: pending (gray outline), running (blue fill + pulse animation), passed (green fill + checkmark), failed (red fill + X), awaiting_approval (amber fill + lock icon), cancelled (gray fill + dash).
- **Step detail drawer**: Click any node — shows step_name, step_type, started_at, duration, output JSONB rendered as key-value pairs, error_message if failed, retry_count, link to ClickHouse log stream for that step.
- **Approval gate UI**: Shows approver list, who has approved, quorum progress bar, one-click approve/reject with comment field, timeout countdown.
- **Re-run control**: "Re-run from step" button on failed steps — replays pipeline from selected step without re-creating snapshot. Audited action.
- **Artifact panel**: Test steps show artifact badge — click opens: test results summary, JUnit report viewer, flaky test flags, coverage delta chart.

### Real-Time Updates

- **WebSocket channel**: `tenant::{tenant_id}::pipeline_run::{pipeline_run_id}`
- Node state changes animate in real time without page refresh

---

## View 4 — Bug Timeline + RCA View

**Purpose**: Full bug lifecycle with event timeline and AI-assisted root cause analysis.

### Layout

- **Left column**: Bug metadata — title, client, module, priority badge, status workflow bar (visual step indicator), version_introduced, version_fixed, assigned_to.
- **Centre**: Vertical event timeline — each bug_event as a card: event_type label, actor name + avatar, timestamp, previous → new value. Newest at bottom.
- **Right column**: RCA panel. Phase 1: manually filled fields (cause_type, affected_files, root_cause_summary). Phase 2: AI-generated section with confidence score badge, ai_summary, ai_suggested_fix, reviewed_by indicator. AI section greyed-out if not yet reviewed by lead.
- **Linked deployments section**: Which deploy introduced the bug (with diff link), which resolved it.
- **Linked test run**: test_run that verified the fix — status badge + link to test results.
- **Comment thread**: Inline discussion attached to bug, stored in bug_events as event_type=commented.

### Interactions

- Status transition buttons: contextual to current status (e.g., in_progress → in_review button visible only to assignee and lead)
- Create bug from log: accessible from log viewer — pre-populates title and log excerpt in bug creation form

---

## View 5 — Comparison and Drift UI

**Purpose**: Visual comparison of source vs deployed state, and client-to-client comparison.

### Modes

- **Source vs client**: Compare source_registry HEAD vs deployed snapshot for one client + environment. Shows: module version delta table, files added/removed/modified per module, config structure diff.
- **Client vs client**: Select two clients + environment. Side-by-side module version table. Highlight cells where versions differ. Click differing module: file-level comparison.
- **Drift severity badge**: Low (gray), medium (amber), high (red), acknowledged (teal). Acknowledge button available to admin — removes from alert backlog, records acknowledged_by.
- **History panel**: Prior drift_reports for same client+environment in collapsible list — shows trend (drift growing, stable, shrinking).

---

## View 6 — Real-Time Log Viewer

**Purpose**: Query and stream logs from ClickHouse with rich filtering.

### Filter Bar

- **Level selector**: all / error / warn / info / debug (multi-select)
- **Module picker**: Dropdown of modules for selected client
- **Server picker**: Dropdown of servers for selected client
- **Time range**: Relative (last 5min / 15min / 1h / 6h / 24h) or absolute range picker
- **Full-text search**: Searches log message field in ClickHouse — min 3 chars, debounced 300ms
- **Trace ID filter**: Paste trace_id to see all related log lines across services

### Log Display

- **Virtual-scrolled list** — handles 10,000+ visible lines without DOM bloat
- **Live tail toggle**: WebSocket stream ON/OFF. When ON, pauses scroll on user interaction, shows "N new lines" banner
- **Expand line**: Structured metadata rendered as indented key-value pairs. Timestamp shown in user local timezone.
- **Correlation shortcut**: Error lines show "Create bug" and "Open trace" inline actions

### Export

- Export button: applies current filters. Downloads as NDJSON or CSV. Max 10M rows. Progress bar for large exports. Action audited.

---

## View 7 — Testing Module UI

**Purpose**: Dual-track testing interface for automated pipeline tests and manual QA workflows.

### Test Plan Manager

- **List view**: All test plans for client, with version, status badge, linked client, case count, last run date
- **Plan editor**: Drag-reorder test cases, inline edit steps (JSONB step editor with structured form), mark priority
- **Version history**: View prior versions in read-only mode for comparison

### Test Run UI

- **Run list**: All test_runs for client, linked to deployment and environment, with status, tester, date
- **Active run**: Checklist view of all test cases. Tester clicks each case: expands steps, marks pass/fail/blocked per case, adds notes, uploads evidence (image upload → object storage URL).
- **Blocked case modal**: Text explanation required — reason stored in test_results.notes
- **Run summary**: Doughnut chart of pass/fail/blocked. Completion percentage. Pass gate indicator.

### Pipeline Test Artifacts

- **Per-deployment**: Test artifact browser — list of artifacts by step, download links, JUnit report viewer (parsed pass/fail table), coverage report viewer.
- **Flaky test dashboard**: Table of flaky tests with fail_rate, run_count, trend chart, link to create bug.

---

## View 8 — Global Navigation and UX System

**Purpose**: Platform-wide navigation, discovery, and interaction patterns.

### Sidebar Navigation

- Role-based sidebar: menu items visibility controlled by role + feature toggles
- Admin sees all. Viewer sees dashboards and logs only.
- Menu items have pending-action badges (e.g., "3 approvals needed")

### Command Palette

- `Cmd/Ctrl+K` — Fuzzy search across: clients, deployments, bugs, servers, pipelines, credentials (name only, not values)
- Recent actions section. Keyboard-navigable.

### Notification Centre

- Bell icon with unread count
- Grouped by type: deployments, bugs, approvals, alerts
- Mark all read. Click: deep link to entity.

### Toast System

- Action confirmations (green), warnings (amber), errors (red)
- Auto-dismiss after 5s. Errors persist until dismissed.
- Never covers primary content.

### Auto-Save Drafts

- All multi-step forms (project creation, pipeline config, onboarding) auto-save on every 500ms debounce
- Draft indicator with "Resume" prompt on re-open
- State persisted to `onboarding_states` table with resume token

### Input Validation

- Inline, non-blocking
- Min/max length, format (email, URL, slug), duplicate prevention with async uniqueness check, number-only fields
- Validation runs on blur + on submit

### Loader System

- Skeleton screens for initial SSR data load
- Spinner overlay for modal actions
- Progress bar for long async operations (deploy, export)
- Never blank screens

### Onboarding Wizard

- Multi-step flow for first client setup
- Steps: Connect Git → Add server → Create project → Configure pipeline → Trigger first deploy
- Progress persisted in `onboarding_states`. Wizard accessible from empty state prompts throughout app.

---

## WebSocket Channel Naming Convention

| Channel Pattern | Used By | Events |
|---|---|---|
| `tenant::{tenant_id}::command_center` | System Command Center | health_score, deployment status, heartbeat, drift, DLQ |
| `tenant::{tenant_id}::client::{client_id}` | Client Dashboard | deployment status, module versions, heartbeat, bugs |
| `tenant::{tenant_id}::pipeline_run::{run_id}` | Pipeline Visualizer | Step state changes (real-time node animation) |
| `tenant::{tenant_id}::logs::{client_id}` | Log Viewer (live tail) | New log lines matching current filter |
| `tenant::{tenant_id}::deploy::{deployment_id}` | Deployment Detail | Step-by-step progress updates |

---

## Responsive Breakpoints

| Breakpoint | Target | Adaptation |
|---|---|---|
| ≥ 1440px | Desktop (primary) | Full layout with all panels |
| 1024–1439px | Laptop | Side panels collapse to drawers |
| 768–1023px | Tablet | Single-column layout, tabs replace panels |
| < 768px | Mobile | Read-only dashboard cards, no pipeline visualizer |

---

## Accessibility Requirements

- WCAG 2.1 AA minimum (AAA for contrast ratios)
- All interactive elements keyboard-navigable
- Screen reader labels on all icons and badges
- Focus management: modal trap, return focus on close
- Risk indicators use **shape + colour** — never colour alone
- High-contrast mode support
