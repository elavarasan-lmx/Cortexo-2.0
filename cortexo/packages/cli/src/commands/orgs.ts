import { Command } from 'commander';
import chalk from 'chalk';
import { ApiClient } from '../client/api-client.js';
import { getConfig, setConfigValue } from '../config/config-manager.js';
import { printOutput, resolveOutputFormat } from '../formatters/output-formatter.js';
import { AppError, formatAppError } from '../client/app-error.js';

export function registerOrgsCommand(program: Command): void {
  const orgCmd = program.command('orgs').alias('org').description('Manage organizations (clients)');

  orgCmd
    .command('list')
    .description('List all accessible organizations')
    .action(async (_, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const config = getConfig(opts);
        const client = new ApiClient(config, opts.verbose);

        const data = await client.get<any[]>('/organizations');
        
        printOutput(data, resolveOutputFormat(opts.output), [
          { key: 'id', header: 'ID', width: 25 },
          { key: 'name', header: 'Name', width: 30 },
          { key: 'slug', header: 'Slug', width: 20 },
          { key: 'status', header: 'Status', width: 15 },
        ]);
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error(chalk.red(formatAppError(err)));
        } else {
          console.error(chalk.red('Error:'), err.message);
        }
        process.exit(1);
      }
    });

  orgCmd
    .command('create')
    .description('Create a new organization')
    .requiredOption('--name <name>', 'Organization name')
    .option('--slug <slug>', 'Organization slug')
    .action(async (_, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const config = getConfig(opts);
        const client = new ApiClient(config, opts.verbose);
        
        const payload: any = { name: opts.name };
        if (opts.slug) payload.slug = opts.slug;

        const data = await client.post<any>('/organizations', payload);
        console.log(chalk.green(`✔ Organization '${data.name}' created successfully.`));
        printOutput([data], resolveOutputFormat(opts.output), [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'slug', header: 'Slug' }
        ]);
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error(chalk.red(formatAppError(err)));
        } else {
          console.error(chalk.red('Error:'), err.message);
        }
        process.exit(1);
      }
    });

  orgCmd
    .command('switch <id>')
    .description('Switch active organization in configuration')
    .action(async (id: string, _, cmd) => {
      try {
        setConfigValue('orgId', id);
        console.log(chalk.green(`✔ Switched to organization: ${id}`));
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });
}
