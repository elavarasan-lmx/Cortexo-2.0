# Cortexo — Product Brain & Architecture

Cortexo is an intelligent DevOps automation platform, designed to centralize and automate server management, deployments, testing, and security auditing. It originated as an evolution of the previous `BullionDevops` scripts, modernized into a scalable monorepo using Fastify, Drizzle ORM, Zod, and a typed TypeScript CLI.

## Core Pillars
1. **API First**: The core of Cortexo is a Fastify-based REST API (`apps/api`) powered by a PostgreSQL database and Drizzle ORM (`packages/db`).
2. **CLI Driven**: Developers interact with Cortexo via a powerful Commander-based CLI (`packages/cli`) with multi-layer config resolution and rich terminal outputs.
3. **AI Integrated**: Cortexo leverages local AI models (via Ollama) to securely audit and analyze code without sending proprietary or private data to external vendors.

## Feature Evolution

### 🏛️ Legacy / Old Features (Ported & Modernized)
*These features were ported from the original `BullionDevops` Node.js scripts into the new Cortexo monorepo architecture.*

- **Server Inventory Management**: Centralized registry of EC2 instances and physical servers with metadata (IPs, SSH keys, public addresses).
- **Resource Monitoring**: Live metrics collection (CPU, RAM, Disk, Uptime) via remote SSH scripts, historically stored in the database for trend analysis.
- **Project Counts**: Mapping internal services/projects to specific servers.
- **SSH Connectivity Testing**: Automated tunnel and latency testing through jump hosts/bastions to target servers.

### ✨ New Features (Cortexo Exclusives)
*These features represent the new capabilities built specifically for Cortexo.*

- **Modular Monorepo Architecture**: Turborepo-powered workspace separating the Database schema (`@cortexo/db`), API server (`@cortexo/api`), and CLI (`@cortexo/cli`).
- **Interactive CLI Setup Wizard**: Developer onboarding via `cortexo config init`.
- **4-Layer Configuration Manager**: A scriptable CLI configuration system that prioritizes defaults < file (`~/.cortexo/config.json`) < env variables < CLI flags.
- **Automated Output Formatting**: CLI automatically detects TTY usage; humans get `cli-table3` colored tables, while CI/CD pipelines and bash pipes get raw JSON for tools like `jq`.
- **Intelligent Error Recovery**: The CLI intercepts standard HTTP status codes (e.g., 401 Unauthorized) and injects actionable terminal hints (e.g., "Run cortexo config set token").
- **Local AI Security Audit**: Inspired by *The VibeCode Bible*, the `cortexo audit repo` command uses a local Ollama instance to scan external GitHub repositories' configuration files (`.env`, `docker-compose.yml`, etc.) for hardcoded secrets, returning a severity-categorized report.
- **Client Organization Management (`cortexo orgs`)**: Ported from *AgentBrain CLI*, enabling multi-tenant DevOps administration by segregating servers and resources per client (Winbull, Vijay Bullion, MNT Traders, etc).
- **Background ETL & Workflow Jobs (`cortexo workflows`)**: Ported from *AgentBrain CLI*, allowing DevOps engineers to schedule, trigger, and monitor automated cron jobs and remote tasks natively.
- **AI Skill Knowledge Base (`cortexo skills`)**: Ported from *SkillX* research framework. A complete AI-powered skill extraction, filtering, and merging engine that learns reusable DevOps playbooks from operational history. Features:
  - `cortexo skills learn <file>` — Extract planning/functional/atomic skills from JSON trajectory logs via local Ollama
  - `cortexo skills list/show/stats` — Browse and inspect the knowledge base
  - `cortexo skills add/remove` — Manual curation of skills
  - `cortexo skills merge` — AI-powered deduplication and consolidation of similar skills
  - Stored locally at `~/.cortexo/skills/knowledge-base.json` — no cloud dependency
- **Browser Smoke Testing (`cortexo test`)**: Ported from *playwright-skill*. Playwright-powered server health validation for deployed web applications. Features:
  - `cortexo test smoke <url>` — Page load, JS errors, screenshot capture
  - `cortexo test login <url>` — Automated login form flow validation
  - `cortexo test responsive <url>` — Multi-viewport (Desktop/Tablet/Mobile) screenshot comparison
  - `cortexo test links <url>` — Broken link scanner
  - `cortexo test probe <url...>` — Lightweight HTTP health check (no Playwright needed)
  - `cortexo test detect` — Local dev server port scanner
- **BullionLite Automation Engine (`cortexo test` extensions)**: Ported from *BullionLite* Java automation framework. Production-grade test execution patterns originally built for Selenium, adapted for Playwright. Features:
  - `test-runner.ts` — Fail-forward module orchestrator with per-module timing, PASS/FAIL/PARTIAL/SKIP classification, 60-char error truncation, and ANSI-colored summary tables (from `Main.java`)
  - `device-profiles.ts` — 8 predefined device profiles (iPhone SE/12 Pro, Samsung Galaxy, Pixel 5, iPad/Pro, Desktop 1080p/720p) with user-agent, DPR, and viewport dimensions (from `DeviceProfile.java`)
  - `responsive-validator.ts` — 6-check responsive validation suite: viewport meta tag, horizontal overflow detection, hamburger menu presence, page body load, title verification, duplicate menu detection (from `MobileScreenValidator.java` + `MobileViewUtil.java`)
  - `responsive-validator.ts` — Popup/modal force-close via multi-locator button clicks + JS fallback for bootstrap/mfp modals + backdrop removal (from `Bfun.closePopupIfPresent()`)
  - `responsive-validator.ts` — Toast/notification detection with 8-selector ordered probe array for fast feedback (from `Bfun.getToastMessageIfPresent()`)
  - `bug-reporter.ts` — Severity-tagged step tracking (PASS/FAIL/WARNING/BLOCKED/INFO) with auto-persistence to JSON and `cortexo report generate --type bugs` pipeline integration (from `BugReporter.java`)
- **Security & Encryption Suite (`cortexo security`)**: Ported from *GoClaw*'s crypto, SSRF, audit, and backup modules. A complete security hardening layer for the DevOps platform. Features:
  - `cortexo security keygen` — Generate a new AES-256 encryption key
  - `cortexo security encrypt <value>` — Encrypt API keys, SSH passwords, tokens at rest using AES-256-GCM
  - `cortexo security decrypt <value>` — Decrypt with backward-compatible plaintext passthrough
  - `cortexo security redact <text>` — Strip PII (emails, Bearer tokens, sk-* keys, AWS keys) from log output
  - `cortexo security check-url <url>` — SSRF validation: block requests to internal IPs (127.x, 10.x, 169.254.x, Docker bridge)
  - `cortexo security backup` — Full system backup (config + skills + optional pg_dump) as versioned tar.gz with manifest
  - `cortexo security backup-list` — List available backup archives
- **Report Generator (`cortexo report`)**: Ported from *frontend-slides*. Self-contained, zero-dependency HTML report generator with an optional Playwright-based PDF export pipeline. Produces beautiful, dark-themed, animation-rich reports using the Bold Signal design system with `clamp()` responsive typography and `prefers-reduced-motion` accessibility support. Features:
  - `cortexo report generate <data.json>` — Auto-detect report type from JSON and generate self-contained HTML
  - `cortexo report generate --type test-run|bugs|audit|deployment` — Type-specific report generation
  - `cortexo report export-pdf <file.html>` — Convert any HTML report to PDF via Playwright's headless Chromium (local HTTP server + font/animation wait + page.pdf())
  - `cortexo report export-pdf --compact` — Compact 1280×720 viewport for smaller PDFs
  - `cortexo report list` — List all generated reports in `~/.cortexo/reports/`
  - `cortexo report demo` — Generate a sample test run report with realistic Winbull-style endpoint data to preview the design
  - Report types: Test Run (endpoint table + pass/fail badges + latency), Bug Report (severity cards + priority details), Security Audit (risk score + recommendations), Deployment (step-by-step pipeline status)
- **Codebase Audit Suite (`cortexo audit deps|debt|secrets|risk|skill-lint`)**: Ported from *claude-skills/engineering* + *antigravity-awesome-skills*. Zero-dependency local codebase analysis tools that run entirely offline. Features:
  - `cortexo audit deps <path>` — Multi-ecosystem dependency vulnerability scanner (npm, pypi, go, cargo, rubygems, composer) with built-in CVE database matching. Parses package.json, requirements.txt, go.mod, Cargo.toml, Gemfile, and composer.json.
  - `cortexo audit debt <path>` — Tech debt analysis via regex pattern matching. Detects TODO/FIXME markers, empty catch blocks, large functions (configurable threshold), deep nesting, hardcoded secrets, SQL injection risks, eval() usage, console.log debugging, and commented-out code. Outputs a weighted "Debt Score" and top-file rankings.
  - `cortexo audit secrets <path>` — Credential leak scanner with 17+ high-signal regex patterns covering OpenAI, GitHub PAT, AWS, Stripe, Razorpay, Google, Twilio, SendGrid, Slack, JWT, private key blocks, database URLs, and generic secret assignments. Includes automatic secret masking in output.
  - `cortexo audit risk <path|file>` — *Ported from antigravity-awesome-skills risk_classifier.py*. Regex-based risk classifier for skill/script content. Classifies files into 4 tiers: **offensive** (exploit/pentest language), **critical** (destructive commands, shell piping, secret handling), **safe** (read-only, diagnostic), or **none**. Supports single-file and batch directory scanning.
  - `cortexo audit skill-lint <path>` — *Ported from antigravity-awesome-skills validate-skills.js*. Validates SKILL.md files in a skills directory: YAML frontmatter validation (name, description, source_repo, source_type), folder naming convention enforcement, section detection ("When to Use", "Do not use", "Instructions"), file length limits, and unknown field detection.
  - All tools support `--json` for CI/CD pipeline integration and `-o <file>` for JSON export.

## Repository Structure
- `/apps/api/` - Fastify API server exposing `/v1` routes.
- `/packages/db/` - Drizzle ORM schema, migrations, and database connection logic.
- `/packages/cli/` - The executable `@cortexo/cli` utility.
  - `src/audit/` - Codebase audit engine (ported from claude-skills + antigravity-awesome-skills):
    - `dep-scanner.ts` — Multi-ecosystem dependency vulnerability scanner
    - `debt-scanner.ts` — Tech debt detection via regex + heuristic analysis
    - `secrets-scanner.ts` — Credential/secret leak scanner with auto-masking
    - `risk-classifier.ts` — Offline risk tier classifier (offensive/critical/safe/none)
    - `skill-validator.ts` — SKILL.md frontmatter & structure validator
    - `index.ts` — Barrel export for the audit module
  - `src/reports/` - Report generation engine (ported from frontend-slides):
    - `report-styles.ts` — CSS design system (Bold Signal tokens, clamp typography, print styles) + HTML template generator
    - `report-generator.ts` — Data transformers: test run, bug, audit, deployment → styled HTML
    - `pdf-exporter.ts` — HTML → PDF pipeline via Playwright (local server + headless Chromium)
    - `index.ts` — Barrel export for the reports module
  - `src/security/` - Security hardening layer:
    - `crypto.ts` — AES-256-GCM encryption, PII redaction, error truncation
    - `ssrf-guard.ts` — SSRF protection with DNS pinning and CIDR blocklist
    - `backup.ts` — Manifest-driven backup orchestrator with preflight checks
    - `index.ts` — Barrel export for the security module
  - `src/skills/` - SkillX engine (types, store, extraction/filter/merge AI engine).
  - `src/testing/` - Browser testing helpers (Playwright executor, test templates, BullionLite-ported modules):
    - `browser-helpers.ts` — Playwright smoke test executor, link scanner, responsive screenshots, port scanner (from playwright-skill)
    - `device-profiles.ts` — 8 predefined mobile/tablet/desktop device profiles with UA, DPR, viewport (from BullionLite/DeviceProfile.java)
    - `test-runner.ts` — Fail-forward module execution engine with ModuleStat tracking, PASS/FAIL/PARTIAL/SKIP, ANSI summary tables (from BullionLite/Main.java)
    - `responsive-validator.ts` — 6-check responsive validation suite: viewport meta, overflow, hamburger, body load, title, duplicate menus + popup/toast detection (from BullionLite/MobileScreenValidator.java + MobileViewUtil.java + Bfun.java)
    - `bug-reporter.ts` — Severity-tagged step tracking with auto-persistence and report pipeline integration (from BullionLite/BugReporter.java)
  - `src/commands/audit.ts` - CLI command interface for security + codebase audit tools.
  - `src/commands/report.ts` - CLI command interface for report generation/export.
  - `src/commands/security.ts` - CLI command interface for security tools.
  - `src/commands/skills.ts` - CLI command interface for the knowledge base.
  - `src/commands/test.ts` - Browser smoke testing command.
  - `examples/trajectory-deploy.json` - Sample trajectory file for learning.

## 🚀 Future Roadmap
- **Docker Sandbox Execution**: Isolated container-based code execution for deployment dry-runs (pattern documented from GoClaw scan).
- **Hook/Webhook System**: Event-driven webhook dispatcher with PII-aware audit logging for deployment notifications (Slack, PagerDuty).
- **Changelog Generator**: Auto-generate CHANGELOG.md from conventional commits with semver bump detection (pattern documented from claude-skills/engineering).
- **Runbook Generator**: Auto-scaffold operational runbooks for services with start/stop/health/rollback/escalation sections (pattern documented from claude-skills/engineering).
- **Audit-to-Report Pipeline**: Auto-pipe `cortexo audit debt/secrets/deps` JSON output into `cortexo report generate` for styled HTML/PDF audit reports.
- **Exploratory Sandbox Expansion**: Cortexo agents will be able to run in a "dry-run" or sandbox environment to autonomously discover new recovery skills for failure-prone tools, expanding the DevOps capability library without human intervention.
- **Skill Retrieval at Deployment Time**: Auto-inject relevant skills into prompts when the AI audit engine encounters similar deployment scenarios.

