// Cortexo CLI — Security & Backup Commands
// Exposes credential encryption, SSRF validation, and backup/restore via CLI.

import { Command } from 'commander';
import chalk from 'chalk';
import { encrypt, decrypt, isEncrypted, generateKey, redactPII, validateURL, SSRFError } from '../security/index.js';
import { createBackup, listBackups, preflightCheck } from '../security/backup.js';

export function registerSecurityCommand(parent: Command): void {
  const security = parent
    .command('security')
    .description('Security tools: encryption, SSRF validation, PII redaction, backups');

  // ─── cortexo security keygen ───────────────────────────────────────
  security
    .command('keygen')
    .description('Generate a new 256-bit encryption key')
    .action(() => {
      const key = generateKey();
      console.log(chalk.green('✔ New AES-256-GCM encryption key generated:\n'));
      console.log(chalk.bold(key));
      console.log(chalk.dim('\nStore this key securely. Set it via:'));
      console.log(chalk.dim('  export CORTEXO_ENCRYPTION_KEY="' + key + '"'));
      console.log(chalk.dim('  # or'));
      console.log(chalk.dim('  cortexo config set encryptionKey "' + key.slice(0, 8) + '..."'));
    });

  // ─── cortexo security encrypt <value> ──────────────────────────────
  security
    .command('encrypt <value>')
    .description('Encrypt a sensitive value (API key, password, token)')
    .option('-k, --key <key>', 'Encryption key (or set CORTEXO_ENCRYPTION_KEY)')
    .action((value: string, opts: { key?: string }) => {
      const key = opts.key ?? process.env.CORTEXO_ENCRYPTION_KEY;
      if (!key) {
        console.error(chalk.red('✘ No encryption key provided.'));
        console.error(chalk.dim('  Use --key <key> or set CORTEXO_ENCRYPTION_KEY'));
        console.error(chalk.dim('  Generate one with: cortexo security keygen'));
        process.exit(1);
      }

      if (isEncrypted(value)) {
        console.log(chalk.yellow('⚠ Value is already encrypted'));
        return;
      }

      try {
        const encrypted = encrypt(value, key);
        console.log(chalk.green('✔ Encrypted value:\n'));
        console.log(encrypted);
      } catch (err) {
        console.error(chalk.red('✘ Encryption failed:'), (err as Error).message);
        process.exit(1);
      }
    });

  // ─── cortexo security decrypt <value> ──────────────────────────────
  security
    .command('decrypt <value>')
    .description('Decrypt a previously encrypted value')
    .option('-k, --key <key>', 'Encryption key (or set CORTEXO_ENCRYPTION_KEY)')
    .action((value: string, opts: { key?: string }) => {
      const key = opts.key ?? process.env.CORTEXO_ENCRYPTION_KEY;
      if (!key) {
        console.error(chalk.red('✘ No encryption key provided.'));
        process.exit(1);
      }

      if (!isEncrypted(value)) {
        console.log(chalk.yellow('⚠ Value is not encrypted (no aes-gcm: prefix)'));
        console.log(value);
        return;
      }

      try {
        const decrypted = decrypt(value, key);
        console.log(chalk.green('✔ Decrypted value:\n'));
        console.log(decrypted);
      } catch (err) {
        console.error(chalk.red('✘ Decryption failed:'), (err as Error).message);
        console.error(chalk.dim('  Check your encryption key is correct.'));
        process.exit(1);
      }
    });

  // ─── cortexo security redact <text> ────────────────────────────────
  security
    .command('redact <text>')
    .description('Strip PII (emails, tokens, API keys) from text')
    .action((text: string) => {
      const redacted = redactPII(text);
      console.log(redacted);
    });

  // ─── cortexo security check-url <url> ──────────────────────────────
  security
    .command('check-url <url>')
    .description('Validate a URL is safe for outbound requests (SSRF check)')
    .action(async (url: string) => {
      try {
        const result = await validateURL(url);
        console.log(chalk.green('✔ URL is safe for outbound requests'));
        console.log(chalk.dim(`  Hostname: ${result.hostname}`));
        console.log(chalk.dim(`  Resolved: ${result.resolvedIP}`));
        console.log(chalk.dim(`  Full URL: ${result.url.toString()}`));
      } catch (err) {
        if (err instanceof SSRFError) {
          console.error(chalk.red('✘ SSRF BLOCKED'));
          console.error(chalk.red(`  ${err.message}`));
          console.error(chalk.dim('\n  This URL targets an internal/private IP range.'));
          console.error(chalk.dim('  It cannot be used for webhooks, notifications, or outbound requests.'));
        } else {
          console.error(chalk.red('✘ URL validation failed:'), (err as Error).message);
        }
        process.exit(1);
      }
    });

  // ─── cortexo security backup ───────────────────────────────────────
  security
    .command('backup')
    .description('Create a full system backup (config + skills + optional DB)')
    .option('--include-db', 'Include PostgreSQL database dump')
    .option('--db-url <url>', 'Database connection URL (or set CORTEXO_DATABASE_URL)')
    .option('-o, --output <path>', 'Custom output path for archive')
    .action(async (opts: { includeDb?: boolean; dbUrl?: string; output?: string }) => {
      const dbUrl = opts.dbUrl ?? process.env.CORTEXO_DATABASE_URL;

      // Preflight
      console.log(chalk.cyan('⚡ Running preflight checks...'));
      const preflight = preflightCheck(!!opts.includeDb, dbUrl);

      for (const warning of preflight.warnings) {
        console.log(chalk.yellow(`  ⚠ ${warning}`));
      }

      if (!preflight.ok) {
        for (const issue of preflight.issues) {
          console.error(chalk.red(`  ✘ ${issue}`));
        }
        process.exit(1);
      }

      console.log(chalk.green('  ✔ Preflight passed\n'));
      console.log(chalk.cyan('📦 Creating backup...'));

      try {
        const { archivePath, manifest } = await createBackup({
          includeDb: opts.includeDb,
          dbUrl,
          outputPath: opts.output,
        });

        console.log(chalk.green('\n✔ Backup created successfully!\n'));
        console.log(chalk.bold(`  Archive: ${archivePath}`));
        console.log(chalk.dim(`  Files:   ${manifest.stats.totalFiles}`));
        console.log(chalk.dim(`  Size:    ${(manifest.stats.totalBytes / 1024).toFixed(1)} KB`));
        if (manifest.stats.databaseSize) {
          console.log(chalk.dim(`  DB Dump: ${manifest.stats.databaseSize}`));
        }
        console.log(chalk.dim(`  Time:    ${manifest.createdAt}`));

        console.log(chalk.dim('\n  Components included:'));
        console.log(chalk.dim(`    Config:   ${manifest.components.config ? '✔' : '✘'}`));
        console.log(chalk.dim(`    Skills:   ${manifest.components.skills ? '✔' : '✘'}`));
        console.log(chalk.dim(`    Database: ${manifest.components.database ? '✔' : '✘'}`));
      } catch (err) {
        console.error(chalk.red('✘ Backup failed:'), (err as Error).message);
        process.exit(1);
      }
    });

  // ─── cortexo security backup-list ──────────────────────────────────
  security
    .command('backup-list')
    .description('List available backup archives')
    .action(() => {
      const backups = listBackups();

      if (backups.length === 0) {
        console.log(chalk.yellow('No backups found.'));
        console.log(chalk.dim('  Create one with: cortexo security backup'));
        return;
      }

      console.log(chalk.bold(`\n📦 ${backups.length} backup(s) found:\n`));
      for (const b of backups) {
        console.log(`  ${chalk.cyan(b.name)}`);
        console.log(chalk.dim(`    Size: ${b.size}  |  Created: ${b.created}`));
        console.log(chalk.dim(`    Path: ${b.path}\n`));
      }
    });
}
