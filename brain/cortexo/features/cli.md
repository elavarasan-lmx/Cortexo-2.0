# Modular Cortexo CLI

**Feature Type**: New (Introduced in Cortexo Monorepo Architecture)
**Package**: `@cortexo/cli`

## Overview
The Cortexo CLI is the primary developer interface for interacting with the Cortexo DevOps platform. Built using `commander`, it is designed to be highly scriptable, CI-friendly, and interactive.

## Core Capabilities

### 1. 4-Layer Config Resolution
Configuration is managed via a cascading resolution strategy, allowing maximum flexibility for both human developers and automated bash scripts:
1. **CLI Flags**: `--api-url`, `--token`, `--org-id` (Highest priority, per-command override)
2. **Environment Variables**: `CORTEXO_API_URL`, `CORTEXO_TOKEN` (Great for CI/CD pipelines)
3. **Config File**: `~/.cortexo/config.json` (Local developer state, secured with `0600` permissions)
4. **Defaults**: Hardcoded fallbacks (e.g., `http://localhost:4000/v1`)

### 2. Auto-Detected Output Formatter
Cortexo adjusts its output format based on how it is invoked:
- If a human runs `cortexo servers list` in a TTY terminal, it prints a stylized, colorful `cli-table3` output.
- If a script runs `cortexo servers list | jq '.[]'`, Cortexo detects the pipe (non-TTY) and outputs raw `json` instead.
- The output can always be overridden manually: `-o json|table|yaml`.

### 3. Actionable Error Recovery
The `ApiClient` extends `AppError` to capture Cortexo API HTTP responses. Instead of printing cryptic stack traces or raw `401 Unauthorized` strings, the CLI offers actionable hints:
```bash
# Example Output on 401
Authentication failed: Invalid Bearer Token
  Fix: cortexo config set token <your-token>
  Or:  cortexo config init
```

### 4. Interactive Setup Wizard
Running `cortexo config init` launches a `readline` wizard that prompts developers for their API URL and token, persisting it to disk and bootstrapping their environment instantly.
