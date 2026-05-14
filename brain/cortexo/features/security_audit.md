# Local AI Security Audit

**Feature Type**: New (Introduced in Cortexo CLI v0.1.0)
**Command**: `cortexo audit repo <github-url>`
**Inspired By**: The VibeCode Bible

## Overview
The Local AI Security Audit is a CLI-native command that scans external codebases for hardcoded secrets, database credentials, JWT secrets, and API keys. To ensure absolute data privacy, it relies entirely on a **local** Large Language Model (LLM) powered by Ollama. No proprietary configuration files or source code are ever sent to OpenAI, Anthropic, or external providers.

## How It Works
1. **Repository Parsing**: The CLI accepts a GitHub URL and validates its format.
2. **Local Model Discovery**: Cortexo queries the local Ollama daemon (`http://localhost:11434/api/tags`) and automatically selects the first available model (e.g., `llama3` or `mistral`).
3. **Targeted Fetching**: It bypasses the need for `git clone` by directly fetching high-risk configuration files from `raw.githubusercontent.com`. The targeted files include:
   - `.env`, `.env.example`, `.env.local`, `.env.production`
   - `next.config.js`, `next.config.mjs`, `next.config.ts`
   - `docker-compose.yml`, `Dockerfile`
   - Framework-specific config files (e.g., `src/lib/supabase.ts`, `stripe.ts`, `config.js`)
4. **AI Analysis**: The downloaded file contents are packaged with a strict System Prompt designating the AI as a security auditor.
5. **Terminal Output**: The local AI responds with a structured security audit. Cortexo intercepts the response, applies terminal-based color highlighting (Red for CRITICAL, Magenta for HIGH, Yellow for MEDIUM), and renders the report natively in the CLI.

## Security Posture
- **Zero-Cost**: Uses local compute.
- **Privacy First**: Proprietary `.env.example` files or accidentally committed secrets never leave the developer's local machine.
- **Agentic**: Acts as an integrated DevSecOps agent running seamlessly inside the Cortexo DevOps pipeline.
