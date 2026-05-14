// Cortexo CLI config manager — 4-layer resolution: defaults < file < env < CLI flags
// Ported from AgentBrain's config-manager.ts with Cortexo-specific paths

import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CortexoConfig, DEFAULT_CONFIG, ENV_VAR_MAP, VALID_CONFIG_KEYS } from './config-schema.js';

const CONFIG_DIR = join(homedir(), '.cortexo');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/** Load config from ~/.cortexo/config.json, returns empty object if not found */
function loadConfigFile(): Partial<CortexoConfig> {
  try {
    if (!existsSync(CONFIG_FILE)) return {};
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Load config from CORTEXO_* environment variables */
function loadEnvConfig(): Partial<CortexoConfig> {
  const result: Partial<CortexoConfig> = {};
  for (const [key, envVar] of Object.entries(ENV_VAR_MAP)) {
    const val = process.env[envVar];
    if (val !== undefined) {
      if (key === 'timeout') {
        (result as Record<string, unknown>)[key] = parseInt(val, 10);
      } else {
        (result as Record<string, unknown>)[key] = val;
      }
    }
  }
  return result;
}

/**
 * Resolve config with 4-layer priority: defaults < file < env < CLI overrides
 * This is the core resolution that makes `cortexo` scriptable across environments.
 */
export function getConfig(cliOverrides: Partial<CortexoConfig> = {}): CortexoConfig {
  const fileConfig = loadConfigFile();
  const envConfig = loadEnvConfig();

  // Filter out undefined/empty values from overrides
  const cleanOverrides: Partial<CortexoConfig> = {};
  for (const [k, v] of Object.entries(cliOverrides)) {
    if (v !== undefined && v !== '') {
      (cleanOverrides as Record<string, unknown>)[k] = v;
    }
  }

  return { ...DEFAULT_CONFIG, ...fileConfig, ...envConfig, ...cleanOverrides };
}

/** Write a single config key-value to config file (creates dir if needed) */
export function setConfigValue(key: string, value: string): void {
  if (!VALID_CONFIG_KEYS.includes(key as keyof CortexoConfig)) {
    throw new Error(`Invalid config key: "${key}". Valid keys: ${VALID_CONFIG_KEYS.join(', ')}`);
  }

  // Ensure config directory exists
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const config = loadConfigFile();
  if (key === 'timeout') {
    (config as Record<string, unknown>)[key] = parseInt(value, 10);
  } else {
    (config as Record<string, unknown>)[key] = value;
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  // Restrict permissions — config may contain auth tokens
  chmodSync(CONFIG_FILE, 0o600);
}

/** Get a single resolved config value */
export function getConfigValue(key: string): string {
  if (!VALID_CONFIG_KEYS.includes(key as keyof CortexoConfig)) {
    throw new Error(`Invalid config key: "${key}". Valid keys: ${VALID_CONFIG_KEYS.join(', ')}`);
  }
  const config = getConfig();
  return String(config[key as keyof CortexoConfig] ?? '');
}

/** List all resolved config with source information for `cortexo config list` */
export function listConfig(): Array<{ key: string; value: string; source: string }> {
  const fileConfig = loadConfigFile();
  const envConfig = loadEnvConfig();

  return VALID_CONFIG_KEYS.map((key) => {
    let source = 'default';
    let value = String(DEFAULT_CONFIG[key]);

    if (key in fileConfig) {
      source = 'config file';
      value = String(fileConfig[key as keyof typeof fileConfig]);
    }
    if (key in envConfig) {
      source = 'env var';
      value = String(envConfig[key as keyof typeof envConfig]);
    }

    // Mask token for display
    if (key === 'token' && value && value.length > 8) {
      value = value.slice(0, 4) + '****' + value.slice(-4);
    }

    return { key, value, source };
  });
}
