// Cortexo SSRF Protection — Safe HTTP Client Guard
// Ported from GoClaw's internal/security/ssrf.go
//
// Prevents Server-Side Request Forgery by blocking requests to internal
// IP ranges. Critical for outbound webhook/notification features where
// user-supplied URLs could probe internal AWS infrastructure.

import { isIPv4 } from 'node:net';
import dns from 'node:dns/promises';

/**
 * Private/internal CIDR ranges that must be blocked.
 * Covers RFC 1918, RFC 6598, RFC 3927, loopback, link-local, and AWS metadata.
 */
const BLOCKED_RANGES: Array<{ network: number; mask: number; label: string }> = [
  // Loopback: 127.0.0.0/8
  { network: ipToInt('127.0.0.0'), mask: 0xff000000, label: 'loopback' },
  // Private: 10.0.0.0/8
  { network: ipToInt('10.0.0.0'), mask: 0xff000000, label: 'private-10' },
  // Private: 172.16.0.0/12
  { network: ipToInt('172.16.0.0'), mask: 0xfff00000, label: 'private-172' },
  // Private: 192.168.0.0/16
  { network: ipToInt('192.168.0.0'), mask: 0xffff0000, label: 'private-192' },
  // Link-local: 169.254.0.0/16 (AWS metadata endpoint lives here)
  { network: ipToInt('169.254.0.0'), mask: 0xffff0000, label: 'link-local' },
  // CGN (Carrier-Grade NAT): 100.64.0.0/10
  { network: ipToInt('100.64.0.0'), mask: 0xffc00000, label: 'cgn' },
  // Docker default bridge: 172.17.0.0/16
  { network: ipToInt('172.17.0.0'), mask: 0xffff0000, label: 'docker' },
];

/** Specific IPs that are always blocked */
const BLOCKED_IPS = new Set([
  '0.0.0.0',
  '255.255.255.255',
  '169.254.169.254', // AWS EC2 metadata endpoint
  '169.254.170.2',   // AWS ECS task metadata
  'fd00::',          // IPv6 ULA
]);

/**
 * Convert dotted-quad IPv4 string to 32-bit integer.
 */
function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Check if an IPv4 address falls within any blocked CIDR range.
 */
function isBlockedIP(ip: string): { blocked: boolean; reason?: string } {
  // Direct blocklist check
  if (BLOCKED_IPS.has(ip)) {
    return { blocked: true, reason: `IP ${ip} is explicitly blocked` };
  }

  // IPv4 CIDR range check
  if (isIPv4(ip)) {
    const ipInt = ipToInt(ip);
    for (const range of BLOCKED_RANGES) {
      if ((ipInt & range.mask) === range.network) {
        return { blocked: true, reason: `IP ${ip} is in blocked range: ${range.label}` };
      }
    }
  }

  return { blocked: false };
}

/**
 * Validate a URL is safe for outbound requests.
 *
 * Defense-in-depth strategy (ported from GoClaw):
 * 1. Parse URL — reject non-HTTP(S) schemes
 * 2. Resolve hostname to IPs
 * 3. Check ALL resolved IPs against blocklist (prevents DNS round-robin bypass)
 * 4. Return the first safe IP for pinned dialing (prevents DNS rebinding)
 *
 * @throws Error if URL targets an internal/blocked address
 */
export async function validateURL(rawUrl: string): Promise<{
  url: URL;
  resolvedIP: string;
  hostname: string;
}> {
  // Step 1: Parse and validate scheme
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SSRFError(`Invalid URL: ${rawUrl}`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new SSRFError(`Blocked protocol: ${url.protocol} (only http/https allowed)`);
  }

  const hostname = url.hostname;

  // Step 2: Direct IP check (no DNS needed)
  if (isIPv4(hostname)) {
    const check = isBlockedIP(hostname);
    if (check.blocked) {
      throw new SSRFError(check.reason!);
    }
    return { url, resolvedIP: hostname, hostname };
  }

  // Step 3: DNS resolution with ALL-IP verification
  let addresses: string[];
  try {
    addresses = await dns.resolve4(hostname);
  } catch {
    throw new SSRFError(`DNS resolution failed for: ${hostname}`);
  }

  if (addresses.length === 0) {
    throw new SSRFError(`No DNS records found for: ${hostname}`);
  }

  // Check ALL resolved addresses — attacker might mix internal + external IPs
  for (const addr of addresses) {
    const check = isBlockedIP(addr);
    if (check.blocked) {
      throw new SSRFError(`${hostname} resolves to blocked IP: ${check.reason}`);
    }
  }

  // Step 4: Return first safe IP for pinned connection
  return { url, resolvedIP: addresses[0], hostname };
}

/**
 * Perform a safe HTTP fetch that validates the URL against SSRF attacks
 * before making the request. This is a drop-in wrapper around fetch().
 *
 * @param rawUrl - The URL to fetch
 * @param options - Standard fetch options
 * @param opts - Additional safety options
 */
export async function safeFetch(
  rawUrl: string,
  options: RequestInit = {},
  opts: { followRedirects?: boolean; timeoutMs?: number } = {},
): Promise<Response> {
  const { url } = await validateURL(rawUrl);
  const { followRedirects = false, timeoutMs = 10_000 } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      ...options,
      signal: controller.signal,
      redirect: followRedirects ? 'follow' : 'manual',
    });

    // If redirect is blocked and we got a redirect response, validate the target
    if (!followRedirects && response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Validate redirect target before allowing it
        await validateURL(new URL(location, url).toString());
      }
    }

    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Redact internal details from a URL for safe logging.
 * Strips auth credentials, preserves host + path for debugging.
 */
export function redactURL(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    url.username = '';
    url.password = '';
    // Strip query params that might contain tokens
    url.search = url.search ? '?[REDACTED]' : '';
    return url.toString();
  } catch {
    return '[INVALID_URL]';
  }
}

/**
 * Custom error class for SSRF validation failures.
 * Allows upstream code to distinguish SSRF blocks from network errors.
 */
export class SSRFError extends Error {
  readonly code = 'SSRF_BLOCKED';
  constructor(message: string) {
    super(`SSRF blocked: ${message}`);
    this.name = 'SSRFError';
  }
}
