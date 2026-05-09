/**
 * Cortexo — Environment Validation
 *
 * Validates all required environment variables at startup.
 * Crashes immediately with a clear error if any are missing.
 * Import this at the TOP of index.ts before anything else.
 */

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REDIS_URL',
] as const;

const RECOMMENDED_VARS = [
  'NEXTAUTH_SECRET',
  'APP_URL',
  'API_URL',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of RECOMMENDED_VARS) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (warnings.length > 0) {
    console.warn(`⚠  Missing recommended env vars: ${warnings.join(', ')}`);
    console.warn('   These are optional but recommended. See .env.example');
  }

  if (missing.length > 0) {
    console.error('');
    console.error('╔══════════════════════════════════════════════════════╗');
    console.error('║  ❌ MISSING REQUIRED ENVIRONMENT VARIABLES          ║');
    console.error('╠══════════════════════════════════════════════════════╣');
    for (const key of missing) {
      console.error(`║  • ${key.padEnd(48)}║`);
    }
    console.error('╠══════════════════════════════════════════════════════╣');
    console.error('║  Copy .env.example → .env and fill in values       ║');
    console.error('╚══════════════════════════════════════════════════════╝');
    console.error('');
    process.exit(1);
  }
}
