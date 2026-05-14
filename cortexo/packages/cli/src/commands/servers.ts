// Servers API command: list, test
import { Command } from 'commander';
import chalk from 'chalk';
import { ApiClient } from '../client/api-client.js';
import { getConfig } from '../config/config-manager.js';
import { printOutput, resolveOutputFormat } from '../formatters/output-formatter.js';
import { AppError, formatAppError } from '../client/app-error.js';

export function registerServersCommand(program: Command): void {
  const serversCmd = program.command('servers').alias('server').description('Manage EC2 server inventory');

  serversCmd
    .command('list')
    .description('List all registered servers')
    .action(async (_, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const config = getConfig(opts);
        const client = new ApiClient(config, opts.verbose);

        const data = await client.get<any[]>('/servers');
        
        printOutput(data, resolveOutputFormat(opts.output), [
          { key: 'id', header: 'ID', width: 6 },
          { key: 'name', header: 'Name', width: 25 },
          { key: 'privateIp', header: 'Internal IP', width: 16 },
          { key: 'publicAddress', header: 'Public Addr', width: 25 },
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

  serversCmd
    .command('test <id>')
    .description('Test SSH connectivity to a server')
    .action(async (id: string, _, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const config = getConfig(opts);
        const client = new ApiClient(config, opts.verbose);
        
        console.log(chalk.blue(`Initiating SSH connection test for server ${id}...`));
        const data = await client.post<any>(`/servers/${id}/test-connection`);
        
        if (data.success) {
          console.log(chalk.green('✔ SSH Connection Successful'));
          console.log(chalk.dim(`Latency: ${data.latencyMs}ms`));
          if (data.hostname) console.log(`Hostname: ${data.hostname}`);
          if (data.uptime) console.log(`Uptime:   ${data.uptime}`);
        } else {
          console.error(chalk.red('✖ SSH Connection Failed'));
          console.error(`Error:   ${data.error}`);
          console.error(chalk.dim(`Latency: ${data.latencyMs}ms`));
          process.exit(1);
        }
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
