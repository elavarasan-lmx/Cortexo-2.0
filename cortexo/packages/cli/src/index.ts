// Cortexo CLI Entry Point

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

import { registerConfigCommand } from './commands/config.js';
import { registerServersCommand } from './commands/servers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion(): string {
  try {
    const pkgPath = join(__dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch {
    return '0.1.0';
  }
}

const program = new Command();

program
  .name('cortexo')
  .description('Cortexo CLI - DevOps Automation Platform')
  .version(getVersion())
  .configureOutput({
    writeErr: (str) => process.stderr.write(chalk.red(str)),
  });

// Global options (4-layer config overrides)
program
  .option('-o, --output <format>', 'Output format (table, json, yaml)')
  .option('-v, --verbose', 'Enable verbose logging (stderr)')
  .option('--org-id <orgId>', 'Override organization ID for this request')
  .option('--token <token>', 'Override API token for this request')
  .option('--api-url <url>', 'Override API Base URL');

// Register modular commands
registerConfigCommand(program);
registerServersCommand(program);

// Hook unhandled errors
process.on('uncaughtException', (err) => {
  console.error(chalk.red('Fatal Error:'), err.message);
  if (program.opts().verbose && err.stack) console.error(chalk.dim(err.stack));
  process.exit(1);
});

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Execution Error:'), err.message);
  process.exit(1);
});
