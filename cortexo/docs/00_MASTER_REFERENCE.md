# Cortexo DevOps Platform — Master Reference

> **Status:** PRD v134 LOCKED | 134 features | 21 categories | ~30% built
> **Monorepo:** `cortexo/` (inside Devops workspace)
> **Last Updated:** 2026-05-04

---

## 🚀 Quick Start for New Sessions

**Say this to the AI in any new session:**

```
Read the Cortexo knowledge item and cortexo/docs/01_PRD.md — I want to continue working on Cortexo.
```

Or for specific work:

```
Read the Cortexo KI. I need to work on [specific feature/task].
```

---

## 📁 File Map — Where Everything Lives

### 1. Source of Truth (in project)

| File | What It Contains | When to Read |
|:---|:---|:---|
| `cortexo/docs/01_PRD.md` | **THE PRD** — 134 features, 21 categories, all audit enhancements | ALWAYS read first |

### 2. Architecture Docs (in project)

| Doc | Path | Contents |
|:---|:---|:---|
| **Tech Architecture** | `cortexo/docs/02_tech_architecture.md` | Dual stack, MySQL schema (22 tables), agent subsystem, security |
| **UI/UX Design** | `cortexo/docs/03_ui_ux_design.md` | Design system, 22 screens, 3 user flows, agent dashboards |
| **SDK & API** | `cortexo/docs/04_sdk_api_reference.md` | 5 SDKs (PHP/JS/Node/Python/Flutter), 50+ endpoints, agent API |
| **Roadmap & GTM** | `cortexo/docs/05_roadmap_gtm.md` | 7 phases (24 weeks), go-to-market, risks, budget |

### 3. Audit Trail (archived — from Windows-era session `fb6f6300`)

> These were generated during the initial PRD/architecture planning on Windows.
> Key insights are already incorporated into the docs above.

| Doc | Contents |
|:---|:---|
| Skills Final Comparison | Cross-repo comparison matrix |
| Antigravity Skills Deep-dive | 57 skills fully analyzed |
| Awesome Skills Features | 1,431 skills categorized |
| Awesome Skills Usefulness | Gold/Silver/Skip classification |

### 4. External Skill Repos (reference — installed as Antigravity skills)

> These repos were analyzed during planning. Key patterns are now available as
> Antigravity skills at `~/.gemini/antigravity/skills/`.

| Repo | Skills | Key Value | Relevant Features |
|:---|:---:|:---|:---|
| Antigravity Skills | 57 | Memory systems, BDI, context engineering, verification | F107-F129 |
| Antigravity Awesome Skills | 1,431 | PHP, MySQL, testing, observability, security patterns | F5-F8, F24-F25 |
| Planning with Files | 3 | 2-Action Rule, hook system | F127 |
| Flutter AI Rules | 28+13 | MVVM architecture, Firebase patterns | F121 |
| UI UX Pro Max | 1 (complex) | 161 rules, 67 styles, 57 fonts, 16 stacks | F62-F68 |

---

## 🏗️ Tech Stack Summary

### Existing (70+ Client Panels)
```
PHP 7.4→8.2 (CodeIgniter 3→4) + MySQL 8.0 + jQuery/Bootstrap
Flutter + Ionic (mobile)
SSH/SFTP deployment (single-server per client)
```

### New (Cortexo Platform)
```
Next.js 16 + TypeScript + Shadcn/UI + Tailwind CSS 4
Fastify API + BullMQ + Redis 7
MySQL 8.0 (primary DB) + Drizzle ORM
OpenAI GPT-4o + Claude API (AI engine)
Docker + Firecracker (pipeline isolation)
AWS (ECS + RDS + ElastiCache)
```

---

## 🧠 Agent Intelligence — Critical Implementation Details

### Memory Escalation Path
```
File-system (baseline) → Mem0 (multi-tenant) → Zep/Graphiti (temporal KG)
Start simple. Only escalate if retrieval degrades.
```

### 8 Production Guardrails

| # | Guardrail | Source | Rule |
|:---|:---|:---|:---|
| 1 | **2-Action Rule** | Planning-with-Files | Persist to disk after every 2 external operations |
| 2 | **3-5 Sub-agent Cap** | multi-agent-patterns | Never exceed 5 sub-agents per supervisor |
| 3 | **15x Token Budget** | multi-agent-patterns | Multi-agent = 15x single-agent cost |
| 4 | **70% Compaction** | context-optimization | Trigger compaction at 70%, NEVER 90% |
| 5 | **Iron Law** | verification-before-completion | 5-step verification gate before any completion claim |
| 6 | **LLM-as-a-Judge** | evaluation | Different model family evaluates agent output |
| 7 | **10-20 Tool Limit** | tool-design | Max tools per agent context |
| 8 | **forward_message** | multi-agent-patterns | Direct sub-agent→user (prevent telephone game) |

### 5 Context Degradation Patterns (F127)

| Pattern | Signal | Fix |
|:---|:---|:---|
| Lost-in-Middle | Model ignores correct info in context | Place critical info at start/end |
| Context Poisoning | Hallucination enters context, compounds | Truncate to before poisoning point |
| Context Distraction | Irrelevant docs degrade performance | Aggressive pre-filtering |
| Context Confusion | Wrong-task constraints applied | Isolate task contexts |
| Context Clash | Contradictory but correct sources | Priority rules, version filtering |

---

## 📊 PRD v134 — Category Index

| # | Category | Features | Key Features |
|:---|:---|:---:|:---|
| 1 | CI/CD Pipeline Builder | F1-F4 | Pipeline builder, SSH deploy, rollback, GitOps |
| 2 | Code Quality | F5-F8 | Linting, quality gate, PSR-12 |
| 3 | Project Management | F9-F11 | Project setup, health score, docs |
| 4 | Testing Automation | F12-F16 | Playwright E2E, k6 load, TDD, regression |
| 5 | Database Management | F17 | Zero-downtime migrations (pt-online-schema-change) |
| 6 | Bug Detection | F18-F23 | SDK error capture, fingerprinting, correlation |
| 7 | Security Scanning | F24-F25 | SAST, CVE/Trivy, PHP security |
| 8 | AI Root Cause | F26-F32 | Deploy-diff analysis, fix suggestions, patterns |
| 9 | AI Code Review | F33-F39 | Uncle Bob checklists, structured review |
| 10 | Documentation | F40-F42 | API docs, changelog, Obsidian |
| 11 | Database Optimizer | F43-F44 | MySQL sys.schema_unused_indexes, slow query |
| 12 | Architecture & Migration | F45-F52 | CI3→4, PHP 7.4→8.2, dependency audit |
| 13 | Team & Collaboration | F53-F58 | RBAC, notifications, audit logs |
| 14 | Notifications | F59-F61 | Email, Slack, webhook alerts |
| 15 | Customization Engine | F62-F68 | White-label, themes, design tokens |
| 16 | Billing & Monetization | F69-F78 | Stripe, usage metering, plans |
| 17 | Observability | F79-F98 | RED/USE methods, Grafana-as-Code, chaos eng |
| 18 | Landing & Marketing | F99-F106 | SEO, blog, onboarding |
| 19 | Agent Intelligence | F107-F122 | Autonomous exec, memory, skills, verification |
| 20 | Advanced Agent | F123-F129 | Context engineering, deprecation engine, orchestration |
| 21 | AI Gateway | F130-F134 | Skill risk, accessibility, postmortem, marketplace |

---

## 📈 Progress & Next Steps

### ✅ Completed (~30%)
- [x] Phase 1: Foundation (monorepo, auth, design system)
- [x] Phase 2: CI/CD Engine scaffolding (schemas, UI, API)
- [x] Phase 3: Bug Detection scaffolding (schemas, UI, API)
- [x] Drizzle ORM schemas (14 tables)
- [x] Fastify API routes (16 endpoints)
- [x] Next.js dashboard UI (basic pages)

### 🔲 Pending (~70%)
- [ ] Phase 4: AI Root Cause Analysis (F26-F32)
- [ ] Phase 5: Agent Intelligence (F107-F134)
- [ ] SDK clients (PHP/JS/Node) — stubs only
- [ ] Pipeline execution engine (Docker/Firecracker)
- [ ] Billing & Monetization (F69-F78)
- [ ] Production deployment (AWS ECS)

---

## 🔗 Original Planning Session

```
Conversation: fb6f6300-4c3e-493b-bf76-ea1ab34d4092 (Windows era)
```

> PRD and architecture were finalized in this session. Project has since moved to Fedora Linux.
