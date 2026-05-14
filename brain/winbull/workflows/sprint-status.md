# /sprint-status Workflow (v1.0)

> Real-time sprint progress report from local bug data + GitHub Issues.
> Purpose: Sprint standup, status reporting, or anytime you need "where are we?"
> When to use: Daily standups, sprint reviews, or quick status checks.
> Differs from: `/overall-bug-dashboard` (full project view with attribution)

## Usage
Say: `/sprint-status`

---

## Prerequisites

- Read `brain/winbull/7_bugs_and_issues.md` for bug data
- GitHub MCP configured (optional, for live issue sync)
- Sprint scope defined in project tracker

---

## Prerequisites
- `brain/winbull/7_bugs_and_issues.md` is up to date
- Optionally: GitHub tracking for live issue counts

---

## Step 1: Load Bug Data

Read `brain/winbull/7_bugs_and_issues.md`:
- Extract all bugs with their severity and status
- Group by sprint assignment (P0 → Sprint 1, P1 → Sprint 2, P2 → Sprint 3, P3 → Sprint 4)

Read `brain/winbull/_SYSTEM/ACTIVE_BUGS.md` if it exists:
- Get in-progress and blocked bugs with timestamps

---

## Step 2: Query GitHub Issues (Optional)

If GitHub MCP is available, pull live counts:

```
mcp_github-mcp-server_list_issues(
  owner: "{REPO_OWNER}",
  repo: "{REPO_NAME}",
  state: "open",
  per_page: 100
)
```

Count by label status:
- **Open + `status:triaged`** = Queued
- **Open + `status:in-progress`** = In Progress
- **Open + `status:blocked`** = Blocked
- **Open + `status:testing`** = Testing
- **Closed** = Done

If GitHub unavailable → use local status from Step 1.

---

## Step 3: Read Velocity Data

Read `brain/winbull/_SYSTEM/FIX_VELOCITY.md` (if exists):
- Calculate average fix time
- Count bugs fixed today / this week
- Project sprint completion date

---

## Step 4: Generate Sprint Report

```markdown
# Sprint Status Report — {DATE}

## Sprint Overview

| Sprint | Milestone | Total | Done | In Progress | Blocked | Testing | Queued | % Complete |
|---|---|---|---|---|---|---|---|---|
| Sprint 1 | P0 Critical | {N} | {N} | {N} | {N} | {N} | {N} | {N}% |
| Sprint 2 | P1 High | {N} | {N} | {N} | {N} | {N} | {N} | {N}% |
| Sprint 3 | P2 Medium | {N} | {N} | {N} | {N} | {N} | {N} | {N}% |
| Sprint 4 | P3 Low | {N} | {N} | {N} | {N} | {N} | {N} | {N}% |
| **Total** | | **{N}** | **{N}** | **{N}** | **{N}** | **{N}** | **{N}** | **{N}%** |

## Blockers (Action Required)

| Bug ID | Module | Severity | Blocked At | Reason | Days Blocked |
|---|---|---|---|---|---|
| {from ACTIVE_BUGS.md} | | | | | |

## Active Work

| Bug ID | Module | Severity | Developer | Current Step | Started |
|---|---|---|---|---|---|
| {from ACTIVE_BUGS.md} | | | | | |

## Velocity (if data available)

| Metric | Value |
|---|---|
| Average fix time | {N} minutes |
| Bugs fixed today | {N} |
| Bugs fixed this week | {N} |
| Projected sprint completion | {date} |

## Next Up (Top 5 Queued)

| Bug ID | Module | Severity | Title | Category |
|---|---|---|---|---|
| {highest priority queued bug} | | | | |
```

---

## Step 5: Present Report

Display the report. Highlight:
1. Blocked bugs → need human decision NOW
2. Sprint % completion → on track or behind?
3. Velocity → trending up or down?

Optionally save to: `brain/winbull/_SYSTEM/SPRINT_REPORTS/sprint_status_{DATE}.md`

---

## Completion Report

```
✅ Sprint Status Report — {DATE}

   Sprint 1 (P0): {N}% complete ({N}/{N})
   Sprint 2 (P1): {N}% complete ({N}/{N})
   Sprint 3 (P2): {N}% complete ({N}/{N})
   Sprint 4 (P3): {N}% complete ({N}/{N})

   🚧 Blocked: {N} bugs — need human input
   🔧 In Progress: {N} bugs
   📊 Velocity: {N} min avg ({N} fixed this week)
```
