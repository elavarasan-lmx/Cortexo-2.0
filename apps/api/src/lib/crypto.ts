import crypto from 'crypto';

/**
 * Cortexo Credential Encryption — AES-256-GCM
 * Used for encrypting SSH keys, passwords, and other secrets at rest.
 * Key derived from ENCRYPTION_KEY or NEXTAUTH_SECRET env variable.
 */

function getKeyBuffer(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || '';
  if (!key) {
    throw new Error('No encryption key configured. Set ENCRYPTION_KEY or NEXTAUTH_SECRET.');
  }
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns format: `iv_hex:auth_tag_hex:ciphertext_hex`
 */
export function encrypt(plaintext: string): string {
  const keyBuffer = getKeyBuffer();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * Decrypt ciphertext that was encrypted with `encrypt()`.
 * Expects format: `iv_hex:auth_tag_hex:ciphertext_hex`
 */
export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format — expected iv:tag:data');
  }

  const [ivHex, tagHex, dataHex] = parts;
  const keyBuffer = getKeyBuffer();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(dataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
