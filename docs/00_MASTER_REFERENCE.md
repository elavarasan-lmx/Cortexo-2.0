# Cortexo DevOps Platform — Master Reference

> **Status:** PRD v134 LOCKED | 134 features | 21 categories | Architecture finalized
> **Monorepo:** `D:\Cortexo`
> **Last Updated:** 2026-04-23

---

## 🚀 Quick Start for New Sessions

**Say this to the AI in any new session:**

```
Read the Cortexo knowledge item and D:\Cortexo\docs\01_PRD.md — I want to continue working on Cortexo.
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
| `D:\Cortexo\docs\01_PRD.md` | **THE PRD** — 134 features, 21 categories, all audit enhancements | ALWAYS read first |

### 2. Architecture Docs (in conversation artifacts)

| Doc | Path | Contents |
|:---|:---|:---|
| **Tech Architecture** | `brain/fb6f6300.../tech_architecture.md` | Dual stack, MySQL schema (22 tables), agent subsystem, security |
| **UI/UX Design** | `brain/fb6f6300.../ui_ux_design.md` | Design system, 22 screens, 3 user flows, agent dashboards |
| **SDK & API** | `brain/fb6f6300.../sdk_api_reference.md` | 5 SDKs (PHP/JS/Node/Python/Flutter), 50+ endpoints, agent API |
| **Roadmap & GTM** | `brain/fb6f6300.../roadmap_gtm.md` | 7 phases (24 weeks), go-to-market, risks, budget |

### 3. Audit Trail (in conversation artifacts)

| Doc | Path | Contents |
|:---|:---|:---|
| **Skills Final Comparison** | `brain/fb6f6300.../skills_final_comparison.md` | Cross-repo comparison matrix |
| **Antigravity Skills Deep-dive** | `brain/fb6f6300.../antigravity_skills_deepdive.md` | 57 skills fully analyzed |
| **Awesome Skills Features** | `brain/fb6f6300.../awesome_skills_features.md` | 1,431 skills categorized |
| **Awesome Skills Usefulness** | `brain/fb6f6300.../awesome_skills_usefulness.md` | Gold/Silver/Skip classification |
| **Awesome Skills Deep-dive** | `brain/fb6f6300.../awesome_skills_deepdive.md` | Key patterns extracted |

### 4. External Skill Repos (on disk, read-only reference)

| Repo | Path | Skills | Key Value |
|:---|:---|:---:|:---|
| Antigravity Skills | `D:\lmx\antigravity-skills-main` | 57 | Memory systems, BDI, context engineering, verification |
| Antigravity Awesome Skills | `D:\lmx\antigravity-awesome-skills-main` | 1,431 | PHP, MySQL, testing, observability, security patterns |
| Awesome Claude Skills | `D:\lmx\awesome-claude-skills-master` | 833+ | SaaS automations (mostly CRM/social — limited DevOps value) |
| Planning with Files | `D:\lmx\planning-with-files-master` | 3 | 2-Action Rule, hook system → F127 |
| Flutter AI Rules | `D:\lmx\flutter-ai-rules-main` | 28+13 | MVVM architecture, Firebase patterns → F121 |
| UI UX Pro Max | `D:\lmx\ui-ux-pro-max-skill-main` | 1 (complex) | 161 rules, 67 styles, 57 fonts, 16 stacks → F62-F68 |
| Gentelella | `D:\lmx\gentelella-master` | — | Bootstrap 5 admin template, 10 color themes (UI reference only) |

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
Next.js 14 + TypeScript + Shadcn/UI + Tailwind CSS 4
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

## ⏭️ Next Steps (Implementation Phase)

1. **Monorepo Scaffolding** — Create `apps/`, `packages/`, `.agent/` in `D:\Cortexo`
2. **Pipeline Initialization** — F1 using GitHub Actions templates
3. **Testing Core** — F12 Playwright E2E for 70+ client panels
4. **Database Hardening** — F43-F44 MySQL optimization scripts
5. **Flutter Integration** — F121 using flutter-ai-rules patterns
6. **Agent Memory** — F110 starting with file-system, escalate to Mem0

---

## 🔗 Conversation ID

```
fb6f6300-4c3e-493b-bf76-ea1ab34d4092
```

Use `@conversation fb6f6300` to reference this session's full logs.
