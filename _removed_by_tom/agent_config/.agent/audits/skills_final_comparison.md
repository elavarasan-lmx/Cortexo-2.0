# Repo Comparison: Antigravity Skills + Awesome Claude Skills vs Cortexo PRD

> **Compared against:** Cortexo PRD v134 (134 features, 21 categories)

---

## Repo 1: Antigravity Skills (57 Skills)

**Path:** `D:\lmx\antigravity-skills-main\antigravity-skills-main`
**Scale:** 57 curated skills | 7 categories | Cross-tool compatible (9 AI assistants)

### What It Is
A **quality-over-quantity** skill library. Unlike Awesome Skills (1,431+), this repo has only 57 hand-picked skills with deep, production-grade SKILL.md definitions. It focuses on **cognitive architecture** — how agents think, remember, and self-evaluate.

### Category Breakdown

| Category | Count | Key Skills |
|:---|:---:|:---|
| 🎨 Creative & Design | 11 | `ui-ux-pro-max`, `canvas-design`, `remotion`, `web-artifacts-builder` |
| 🛠️ Dev & Engineering | 11 | `react-best-practices`, `supabase-postgres`, `test-driven-development`, `webapp-testing` |
| 📄 Documentation | 11 | `docx`, `xlsx`, `pptx`, `pdf`, `obsidian-*`, `notebooklm` |
| 📅 Planning | 7 | `brainstorming`, `writing-plans`, `executing-plans`, `verification-before-completion` |
| 🧠 **Core Cognition** | 7 | `bdi-mental-states`, `memory-systems`, `context-fundamentals`, `context-optimization`, `context-compression`, `context-degradation`, `filesystem-context` |
| 📐 **System Design** | 4 | `project-development`, `tool-design`, `evaluation`, `advanced-evaluation` |
| 🧩 System Extension | 6 | `mcp-builder`, `skill-creator`, `dispatching-parallel-agents`, `multi-agent-patterns`, `hosted-agents` |

### Cortexo PRD Mapping

| Antigravity Skills Category | Cortexo Coverage | Status |
|:---|:---|:---|
| Creative & Design | F62-F68 (Customization Engine) | ✅ Covered |
| Dev & Engineering | F6, F12-F14, F33, F114 | ✅ Covered |
| Documentation | F11, F23, F40, F101 | ✅ Covered |
| Planning & Workflow | F111, F119-F122 | ✅ Covered |
| **Core Cognition** | **F127 (Context Engineering)**, F110 (Agent Memory) | ✅ Covered |
| **System Design** | F117 (Fractal Skills), F121 (Specialist Personas) | ✅ Covered |
| System Extension | F112 (Parallel Agents), F129 (Orchestration Rulebook) | ✅ Covered |

### Unique Patterns Not in Other Repos

| Pattern | Description | Cortexo Impact |
|:---|:---|:---|
| **BDI Mental States** | Belief-Desire-Intention model for agent reasoning | Already covered by F127 context hierarchy |
| **Context Degradation** | Diagnosing "lost in the middle" attention failures | Already covered by F127 |
| **Filesystem Context** | Offloading context to filesystem when window is full | Already covered by F118 (Dual-Scope) |
| **Agent Evaluation** | Multi-dimensional agent performance scoring + LLM-as-a-Judge | ⚠️ **Partial gap** — F110 (Agent Memory) records success/failure but lacks formal scoring |
| **Advanced Evaluation** | Pairwise comparison, quality gates for agent output | ⚠️ **Partial gap** — could strengthen F122 (Non-Negotiable Verification) |

### Verdict: ✅ No new features needed

Cortexo's Categories 19-21 (F106-F134) already cover everything here. The **evaluation** skills are the only partial gap — but they're a depth enhancement to F110/F122, not a new feature.

**Enhancement:** F110 (Agent Learning Memory) should include formal success/failure scoring metrics, not just recording outcomes.

---

## Repo 2: Awesome Claude Skills (78 SaaS + 32 Core)

**Path:** `D:\lmx\awesome-claude-skills-master\awesome-claude-skills-master`
**Scale:** 32 core skills + 78 SaaS automation skills + **833 Composio automation directories**
**Maintained by:** Composio (SaaS integration platform)

### What It Is
The **official community skills repository** for Claude Code, maintained by Composio. It has two layers:
1. **32 core skills** — Document processing, development, media, writing
2. **78 curated SaaS automations** — Pre-built workflows for CRM, PM, communication, email, DevOps
3. **833+ Composio automation directories** — Raw API integration templates for every SaaS app imaginable

### Core Skills Breakdown

| Category | Skills | Cortexo Map |
|:---|:---|:---|
| **Document Processing** | `docx`, `pdf`, `pptx`, `xlsx`, EPUB converter | F11, F101 ✅ |
| **Dev & Code Tools** | artifacts-builder, AWS skills, Playwright, TDD, git-worktrees, MCP builder | F1-F4, F12-F14, F114 ✅ |
| **Data & Analysis** | CSV summarizer, deep-research, PostgreSQL queries, root-cause-tracing | F8, F43-F44 ✅ |
| **Business & Marketing** | Brand guidelines, competitive ads, domain brainstormer, lead research | ⏭️ Out of scope |
| **Creative & Media** | Canvas design, image enhancer, Slack GIF, theme factory, video downloader | F62-F68 ✅ |
| **Productivity** | File organizer, invoice organizer, resume generator, Kaizen methodology | ⏭️ Out of scope |
| **Security** | Computer forensics, file deletion, metadata extraction, Sigma threat hunting | F24-F25 ✅ |

### SaaS Automation Breakdown (The BIG part — 78 curated + 833 raw)

| Category | Count | Key Platforms | Cortexo Map |
|:---|:---:|:---|:---|
| **CRM & Sales** | 5 | Close, HubSpot, Pipedrive, Salesforce, Zoho | ⏭️ Not relevant to DevOps |
| **Project Management** | 10 | Asana, Jira, Linear, Monday, Notion, Trello, ClickUp | F134 (partial — Jira only) |
| **Communication** | 6 | Slack, Discord, Teams, Telegram, WhatsApp, Intercom | F134 (partial — Slack/Discord) |
| **Email** | 4 | Gmail, Outlook, Postmark, SendGrid | F59 (Email Notifications) ✅ |
| **Code & DevOps** | 10 | GitHub, GitLab, Bitbucket, CircleCI, Datadog, PagerDuty, Sentry, Vercel | F134, F97, F28 ✅ |
| **Storage & Files** | 4 | Box, Dropbox, Google Drive, OneDrive | ⏭️ Not relevant |
| **Spreadsheets** | 3 | Airtable, Coda, Google Sheets | ⏭️ Not relevant |
| **Calendar** | 4 | Cal.com, Calendly, Google Calendar, Outlook Calendar | ⏭️ Not relevant |
| **Social Media** | 6 | Instagram, LinkedIn, Reddit, TikTok, Twitter, YouTube | ⏭️ Not relevant |
| **Marketing** | 5 | ActiveCampaign, Brevo, ConvertKit, Klaviyo, Mailchimp | ⏭️ Not relevant |
| **Support** | 4 | Freshdesk, Freshservice, Help Scout, Zendesk | ⏭️ Not relevant |
| **E-commerce** | 3 | Shopify, Square, Stripe | ⏭️ Not relevant |
| **Design** | 6 | Canva, Confluence, DocuSign, Figma, Miro, Webflow | ⏭️ Not relevant |
| **Analytics** | 5 | Amplitude, Google Analytics, Mixpanel, PostHog, Segment | ⏭️ Not relevant |

### 833 Composio Directories — What Are They?

These are **auto-generated API integration templates** for every SaaS app Composio supports. Each directory contains a SKILL.md with tool sequences, parameter guidance, and error handling for that specific API. Examples:
- `cloudflare-automation` — DNS, firewall, caching
- `docker-hub-automation` — Image management
- `digital-ocean-automation` — Server provisioning
- `stripe-automation` — Payment processing
- `virustotal-automation` — Malware scanning

**Quantity is impressive (833+), but quality varies.** These are thin API wrappers, not deep expert skills.

### Cortexo PRD Mapping

| Feature Area | Status | Notes |
|:---|:---|:---|
| Core development skills | ✅ Fully covered | F1-F16, F33, F106-F134 |
| Document processing | ✅ Covered | F11, F101 |
| Security skills | ✅ Covered | F24-F25 |
| DevOps integrations (GitHub, Sentry, etc.) | ✅ Covered by F134 | Native DevOps Integrations |
| 78 SaaS automations | ⏭️ **Not relevant** | Cortexo is DevOps, not CRM/marketing |
| 833 Composio directories | ⏭️ **Not relevant** | Thin API wrappers, not expert skills |

### Verdict: ✅ No new features needed

The Composio ecosystem is massive but almost entirely irrelevant to Cortexo's DevOps mission. The handful of relevant integrations (GitHub, Slack, Jira, Sentry, PagerDuty) are already captured by F134 (Native DevOps Integrations).

---

## Combined Verdict: Both Repos vs Cortexo PRD

| Repo | Unique Skills | New Features Needed | Enhancement |
|:---|:---:|:---:|:---|
| **Antigravity Skills** (57) | BDI mental states, evaluation framework | 0 | Strengthen F110 with agent performance scoring |
| **Awesome Claude Skills** (833+) | 78 SaaS automations, Composio integration | 0 | F134 already covers DevOps integrations |

### Final Score

```
Cortexo PRD: 134 Features / 21 Categories
New features from these repos: 0
Depth enhancements: 1 (F110 Agent Learning Memory → add scoring metrics)
```

### One Enhancement to Apply

**F110 (Agent Learning Memory)** — Currently records success/failure of execution paths. Should also include:
- **Quantitative scoring** (0-100) for each agent execution
- **LLM-as-a-Judge** evaluation for code quality of agent-generated fixes
- **Pairwise comparison** when multiple fix approaches are attempted
- This is inspired by the `evaluation` + `advanced-evaluation` skills from Antigravity Skills

> **Cortexo's architecture is confirmed complete.** No repository examined has surfaced a missing category or critical feature. The PRD is locked at 134 features.
