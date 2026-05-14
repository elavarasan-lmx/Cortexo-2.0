import { Command } from 'commander';
import chalk from 'chalk';
import { ApiClient } from '../client/api-client.js';
import { getConfig } from '../config/config-manager.js';
import { printOutput, resolveOutputFormat } from '../formatters/output-formatter.js';
import { AppError, formatAppError } from '../client/app-error.js';

export function registerWorkflowsCommand(program: Command): void {
  const wfCmd = program.command('workflows').alias('wf').description('Manage automation workflows and ETL jobs');

  wfCmd
    .command('list')
    .description('List all workflows')
    .action(async (_, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const config = getConfig(opts);
        const client = new ApiClient(config, opts.verbose);

        const data = await client.get<any[]>('/workflows');
        
        printOutput(data, resolveOutputFormat(opts.output), [
          { key: 'id', header: 'ID', width: 25 },
          { key: 'name', header: 'Name', width: 30 },
          { key: 'enabled', header: 'Enabled', width: 10, transform: (v: any) => v ? 'yes' : 'no' },
          { key: 'cron_schedule', header: 'Schedule', width: 20 },
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

  wfCmd
    .command('run <id>')
    .description('Execute a workflow manually')
    .action(async (id: string, _, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const config = getConfig(opts);
        const client = new ApiClient(config, opts.verbose);

        console.log(chalk.blue(`Triggering workflow ${id}...`));
        const data = await client.post<any>(`/workflows/${id}/run`);
        
        console.log(chalk.green(`✔ Workflow run started (Run ID: ${data.id})`));
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error(chalk.red(formatAppError(err)));
        } else {
          console.error(chalk.red('Error:'), err.message);
        }
        process.exit(1);
      }
    });

  wfCmd
    .command('runs <id>')
    .description('List execution history for a workflow')
    .action(async (id: string, _, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const config = getConfig(opts);
        const client = new ApiClient(config, opts.verbose);

        const data = await client.get<any[]>(`/workflows/${id}/runs`);
        
        printOutput(data, resolveOutputFormat(opts.output), [
          { key: 'id', header: 'Run ID', width: 25 },
          { key: 'status', header: 'Status', width: 15 },
          { key: 'started_at', header: 'Started', width: 25 },
          { key: 'completed_at', header: 'Completed', width: 25 },
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
}
