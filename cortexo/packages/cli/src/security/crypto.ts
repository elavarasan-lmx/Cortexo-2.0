// Cortexo Credential Encryption — AES-256-GCM
// Ported from GoClaw's internal/crypto/aes.go pattern
//
// Encrypts sensitive values (SSH keys, API tokens, DB passwords) at rest.
// Uses a "aes-gcm:" prefix for ciphertext detection, allowing seamless
// backward-compatibility with legacy plaintext values.

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

/** Prefix prepended to all encrypted values for format detection */
const ENCRYPTED_PREFIX = 'aes-gcm:';

/** AES-256-GCM constants */
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96-bit nonce (recommended for GCM)
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derive a 32-byte AES key from arbitrary input.
 * Accepts hex (64 chars), base64 (44 chars), or raw passphrase.
 * Uses SHA-256 to normalize any input to exactly 32 bytes.
 */
export function deriveKey(input: string): Buffer {
  if (!input || input.length === 0) {
    throw new Error('Encryption key cannot be empty');
  }

  // If exactly 64 hex chars, decode directly
  if (/^[0-9a-fA-F]{64}$/.test(input)) {
    return Buffer.from(input, 'hex');
  }

  // If exactly 44 base64 chars (32 bytes encoded), decode directly
  if (/^[A-Za-z0-9+/]{43}=$/.test(input)) {
    const buf = Buffer.from(input, 'base64');
    if (buf.length === KEY_LENGTH) return buf;
  }

  // Otherwise, derive via SHA-256
  return createHash('sha256').update(input, 'utf8').digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: "aes-gcm:" + base64(iv + ciphertext + authTag)
 *
 * The output is safe for JSON storage, config files, and env vars.
 */
export function encrypt(plaintext: string, key: string): string {
  const derivedKey = deriveKey(key);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, derivedKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack: iv (12) + ciphertext (N) + authTag (16)
  const packed = Buffer.concat([iv, encrypted, authTag]);

  return ENCRYPTED_PREFIX + packed.toString('base64');
}

/**
 * Decrypt an AES-256-GCM ciphertext string.
 * If the value doesn't have the "aes-gcm:" prefix, returns it as-is
 * (backward compatibility with legacy plaintext values).
 */
export function decrypt(ciphertext: string, key: string): string {
  // Plaintext passthrough — legacy values without prefix
  if (!ciphertext.startsWith(ENCRYPTED_PREFIX)) {
    return ciphertext;
  }

  const derivedKey = deriveKey(key);
  const packed = Buffer.from(ciphertext.slice(ENCRYPTED_PREFIX.length), 'base64');

  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted value: too short');
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(packed.length - AUTH_TAG_LENGTH);
  const encrypted = packed.subarray(IV_LENGTH, packed.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, derivedKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Check if a value is already encrypted (has the aes-gcm: prefix).
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Generate a new random 256-bit encryption key as hex string.
 * Use this for initial key generation: `cortexo security keygen`
 */
export function generateKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Redact PII patterns from log/error strings.
 * Ported from GoClaw's hooks/audit.go RedactPII function.
 *
 * Strips:
 *  - Email addresses
 *  - Bearer tokens
 *  - sk-* API keys (OpenAI, Anthropic)
 *  - AWS access key IDs (AKIA*)
 *  - Generic long hex/base64 secrets (32+ chars)
 */
const PII_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/g, label: '[EMAIL_REDACTED]' },
  { pattern: /Bearer\s+[A-Za-z0-9._\-]{8,}/gi, label: '[TOKEN_REDACTED]' },
  { pattern: /sk-[A-Za-z0-9_\-]{8,}/g, label: '[APIKEY_REDACTED]' },
  { pattern: /AKIA[A-Z0-9]{16}/g, label: '[AWSKEY_REDACTED]' },
  { pattern: /(?:password|secret|token|key)\s*[=:]\s*["']?[^\s"']{12,}["']?/gi, label: '[SECRET_REDACTED]' },
];

export function redactPII(input: string): string {
  let result = input;
  for (const { pattern, label } of PII_PATTERNS) {
    result = result.replace(pattern, label);
  }
  return result;
}

/**
 * Truncate an error message to maxLen bytes without cutting mid-character.
 * Ported from GoClaw's hooks/audit.go TruncateError.
 */
export function truncateError(message: string, maxLen = 256): string {
  if (Buffer.byteLength(message, 'utf8') <= maxLen) return message;

  // Walk backward to avoid cutting mid-UTF8
  const buf = Buffer.from(message, 'utf8');
  let cut = maxLen;
  while (cut > 0 && (buf[cut] & 0xc0) === 0x80) {
    cut--;
  }
  return buf.subarray(0, cut).toString('utf8') + '…';
}
