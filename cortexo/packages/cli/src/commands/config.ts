// Cortexo configuration command: init, set, get, list
// Ported from AgentBrain's config.ts

import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { setConfigValue, getConfigValue, listConfig } from '../config/config-manager.js';
import { VALID_CONFIG_KEYS } from '../config/config-schema.js';
import { printOutput, resolveOutputFormat } from '../formatters/output-formatter.js';
import { AppError, formatAppError } from '../client/app-error.js';

export function registerConfigCommand(program: Command): void {
  const configCmd = program.command('config').description('Manage CLI configuration');

  configCmd
    .command('init')
    .description('Interactive setup wizard for CLI configuration')
    .action(async () => {
      try {
        console.log(chalk.bold.blue('Cortexo CLI Setup\n'));

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const defaultUrl = getConfigValue('apiUrl') || 'http://localhost:4000/v1';
        const urlAnswer = await rl.question(`API URL [${defaultUrl}]: `);
        if (urlAnswer.trim()) setConfigValue('apiUrl', urlAnswer.trim());
        else if (!getConfigValue('apiUrl')) setConfigValue('apiUrl', defaultUrl);

        const tokenAnswer = await rl.question('API Token: ');
        if (tokenAnswer.trim()) setConfigValue('token', tokenAnswer.trim());

        rl.close();
        console.log(chalk.green('\n✔ Configuration saved to ~/.cortexo/config.json'));
      } catch (err: any) {
        console.error(chalk.red('\nSetup failed:'), err.message);
        process.exit(1);
      }
    });

  configCmd
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action((key: string, value: string) => {
      try {
        setConfigValue(key, value);
        console.log(chalk.green(`✔ ${key} updated successfully`));
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });

  configCmd
    .command('get <key>')
    .description('Get a configuration value')
    .action((key: string) => {
      try {
        const val = getConfigValue(key);
        console.log(val);
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });

  configCmd
    .command('list')
    .description('List all configuration values and their sources')
    .action((_, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const output = resolveOutputFormat(opts.output);
        const data = listConfig();
        printOutput(data, output, [
          { key: 'key', header: 'Key' },
          { key: 'value', header: 'Value' },
          { key: 'source', header: 'Source' },
        ]);
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });
}
