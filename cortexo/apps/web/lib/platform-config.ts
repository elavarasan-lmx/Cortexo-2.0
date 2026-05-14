/**
 * Platform Config — Dynamic branding for Logimax Bullion DevOps
 *
 * Central source of truth for platform naming and branding.
 * The Settings → General page reads/writes the platform name
 * to the Credentials Vault under the key `PLATFORM_NAME`.
 *
 * All UI components that display the platform name should
 * import from here instead of hardcoding.
 */

export const PLATFORM_DEFAULTS = {
  name: 'Logimax Bullion DevOps',
  shortName: 'LB DevOps',
  initials: 'LB',
  tagline: 'Internal Developer Platform',
  description: 'Manage deployments, servers, and AI agents — all in one place.',
  author: 'Logimax India',
  seoTitle: 'Logimax Bullion DevOps — The Brain for Your Code',
  seoDescription:
    'Deploy. Detect. Debug. The only DevOps tool that deploys your code, catches bugs automatically, and tells you WHY they happened — powered by AI.',
} as const;

export type PlatformConfig = typeof PLATFORM_DEFAULTS;
