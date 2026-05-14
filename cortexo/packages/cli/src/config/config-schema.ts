// Cortexo CLI configuration schema and defaults
// Ported from AgentBrain's config-schema.ts, adapted for Cortexo's DevOps context

export interface CortexoConfig {
  /** Base URL for Cortexo API (e.g. http://localhost:4000/v1) */
  apiUrl: string;
  /** Authentication token (stored in ~/.cortexo/config.json) */
  token: string;
  /** Default organization ID */
  orgId: string;
  /** Default output format: table (interactive) | json (piping/CI) | yaml */
  output: 'json' | 'table' | 'yaml';
  /** Request timeout in milliseconds */
  timeout: number;
}

export const DEFAULT_CONFIG: CortexoConfig = {
  apiUrl: 'http://localhost:4000/v1',
  token: '',
  orgId: '',
  output: 'table',
  timeout: 30000,
};

// Maps config keys to environment variable names
export const ENV_VAR_MAP: Record<string, string> = {
  apiUrl: 'CORTEXO_API_URL',
  token: 'CORTEXO_TOKEN',
  orgId: 'CORTEXO_ORG_ID',
  output: 'CORTEXO_OUTPUT',
  timeout: 'CORTEXO_TIMEOUT',
};

// Valid config keys for set/get commands
export const VALID_CONFIG_KEYS = Object.keys(DEFAULT_CONFIG) as (keyof CortexoConfig)[];
