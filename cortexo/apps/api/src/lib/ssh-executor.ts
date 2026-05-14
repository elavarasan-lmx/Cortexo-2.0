/**
 * SSH Executor — Barrel re-export for backward compatibility.
 *
 * This module re-exports everything from the new modular SSH directory
 * so that existing imports like:
 *   import { sshConnect, runDeploySequence } from '../lib/ssh-executor.js'
 * continue to work without any changes.
 *
 * New code should import from the specific modules:
 *   import { sshConnect } from '../lib/ssh/connection.js'
 *   import { runDeploySequence } from '../lib/ssh/deploy.js'
 *
 * Module structure:
 *   ssh/types.ts       — Shared type definitions & progress helpers
 *   ssh/connection.ts  — SSH key resolution, connect, jump-host tunneling
 *   ssh/commands.ts    — Command execution (sshExec, runStep, testSSHConnection)
 *   ssh/deploy.ts      — Full deployment sequence (11 steps)
 *   ssh/provision.ts   — Full provisioning sequence (12 steps)
 */

// ── Types ──
export type {
  SSHCredentials,
  DeployOptions,
  DeployLog,
  DeployResult,
  ProvisionOptions,
  OnProgress,
} from './ssh/types.js';

// ── Connection ──
export { sshConnect, sshDisconnect } from './ssh/connection.js';

// ── Commands ──
export { sshExec, runStep, testSSHConnection } from './ssh/commands.js';

// ── Deploy ──
export { runDeploySequence } from './ssh/deploy.js';

// ── Provision ──
export { runProvisionSequence } from './ssh/provision.js';
