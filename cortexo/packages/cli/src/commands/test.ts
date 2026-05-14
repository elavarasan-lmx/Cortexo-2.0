// Cortexo Test Command — Browser-based smoke testing for deployed servers
// Ported from playwright-skill, adapted for DevOps server health validation

import { Command } from 'commander';
import chalk from 'chalk';
import { AppError } from '../client/app-error.js';
import { printOutput, resolveOutputFormat } from '../formatters/output-formatter.js';
import {
  probeUrl,
  detectLocalServers,
  isPlaywrightInstalled,
  executePlaywrightScript,
  generateSmokeTestScript,
  generateLoginTestScript,
  generateResponsiveTestScript,
  generateLinkCheckScript,
} from '../testing/browser-helpers.js';

export function registerTestCommand(program: Command): void {
  const testCmd = program
    .command('test')
    .description('Browser-based smoke testing for deployed servers (Playwright engine)');

  // ── cortexo test smoke <url> ─────────────────────────────────────────────
  testCmd
    .command('smoke <url>')
    .description('Run a smoke test against a URL — checks page load, title, JS errors, and takes screenshots')
    .option('--headed', 'Run with visible browser (default: headless)')
    .option('--timeout <ms>', 'Test timeout in milliseconds', '60000')
    .action(async (url: string, cmdOpts) => {
      try {
        ensurePlaywright();
        console.log(chalk.blue(`\n  Smoke Testing: ${url}`));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        // Quick probe first
        const probe = await probeUrl(url);
        if (probe === null) {
          console.log(chalk.red(`  ✖ Server unreachable: ${url}`));
          process.exit(1);
        }
        console.log(chalk.green(`  ✔ Server reachable (HTTP ${probe})`));

        // Run Playwright smoke test
        console.log(chalk.dim('  Launching browser test...'));
        const script = generateSmokeTestScript(url);
        const result = executePlaywrightScript(script, {
          headless: !cmdOpts.headed,
          timeout: parseInt(cmdOpts.timeout),
        });

        if (result.success) {
          const lines = result.output.trim().split('\n');
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.status === 'ok') {
                console.log(chalk.green(`\n  ✔ Page loaded successfully`));
                console.log(`  ${chalk.dim('Title:')}     ${data.title}`);
                console.log(`  ${chalk.dim('Load Time:')} ${data.loadTimeMs}ms`);
                console.log(`  ${chalk.dim('HTTP:')}      ${data.httpStatus}`);
              } else if (data.jsErrors) {
                console.log(chalk.yellow(`\n  ⚠ JS Errors: ${data.jsErrors.length}`));
                data.jsErrors.forEach((e: string) => console.log(chalk.red(`    - ${e}`)));
              } else if (data.consoleErrors) {
                console.log(chalk.yellow(`\n  ⚠ Console Errors: ${data.consoleErrors.length}`));
                data.consoleErrors.forEach((e: string) => console.log(chalk.red(`    - ${e}`)));
              }
            } catch {
              if (line.trim()) console.log(chalk.dim(`  ${line}`));
            }
          }
        } else {
          console.log(chalk.red(`\n  ✖ Smoke test failed`));
          if (result.error) console.log(chalk.dim(`  ${result.error.slice(0, 300)}`));
        }
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('  Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo test login <url> ─────────────────────────────────────────────
  testCmd
    .command('login <url>')
    .description('Test a login flow — fills form and checks redirect')
    .requiredOption('-u, --username <user>', 'Login username/email')
    .requiredOption('-p, --password <pass>', 'Login password')
    .option('--user-selector <sel>', 'CSS selector for username input')
    .option('--pass-selector <sel>', 'CSS selector for password input')
    .option('--submit-selector <sel>', 'CSS selector for submit button')
    .option('--headed', 'Run with visible browser')
    .action(async (url: string, cmdOpts) => {
      try {
        ensurePlaywright();
        console.log(chalk.blue(`\n  Login Flow Test: ${url}`));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        const script = generateLoginTestScript(url, {
          username: cmdOpts.username,
          password: cmdOpts.password,
        }, {
          username: cmdOpts.userSelector,
          password: cmdOpts.passSelector,
          submit: cmdOpts.submitSelector,
        });

        const result = executePlaywrightScript(script, { headless: !cmdOpts.headed });

        if (result.success) {
          const lines = result.output.trim().split('\n');
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.loginSuccess) {
                console.log(chalk.green(`  ✔ Login successful`));
              } else {
                console.log(chalk.red(`  ✖ Login failed (still on login page)`));
              }
              console.log(`  ${chalk.dim('Redirected To:')} ${data.redirectedTo}`);
              console.log(`  ${chalk.dim('Page Title:')}    ${data.pageTitle}`);
            } catch {
              if (line.trim()) console.log(chalk.dim(`  ${line}`));
            }
          }
        } else {
          console.log(chalk.red(`  ✖ Login test failed`));
          if (result.error) console.log(chalk.dim(`  ${result.error.slice(0, 300)}`));
        }
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('  Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo test responsive <url> ────────────────────────────────────────
  testCmd
    .command('responsive <url>')
    .description('Test responsive design across Desktop, Tablet, and Mobile viewports')
    .option('--headed', 'Run with visible browser')
    .action(async (url: string, cmdOpts) => {
      try {
        ensurePlaywright();
        console.log(chalk.blue(`\n  Responsive Test: ${url}`));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        const script = generateResponsiveTestScript(url);
        const result = executePlaywrightScript(script, { headless: !cmdOpts.headed });

        if (result.success) {
          const lines = result.output.trim().split('\n');
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.viewports) {
                console.log(chalk.green(`\n  ✔ All viewports tested`));
                for (const vp of data.viewports) {
                  console.log(`  ${chalk.dim(vp.viewport.padEnd(8))} ${vp.width}x${vp.height}  ${vp.loadTimeMs}ms  → ${vp.screenshot}`);
                }
              }
            } catch {
              if (line.trim()) console.log(chalk.dim(`  ${line}`));
            }
          }
        } else {
          console.log(chalk.red(`  ✖ Responsive test failed`));
          if (result.error) console.log(chalk.dim(`  ${result.error.slice(0, 300)}`));
        }
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('  Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo test links <url> ─────────────────────────────────────────────
  testCmd
    .command('links <url>')
    .description('Check for broken links on a page')
    .option('--headed', 'Run with visible browser')
    .action(async (url: string, cmdOpts) => {
      try {
        ensurePlaywright();
        console.log(chalk.blue(`\n  Link Checker: ${url}`));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        const script = generateLinkCheckScript(url);
        const result = executePlaywrightScript(script, { headless: !cmdOpts.headed, timeout: 120_000 });

        if (result.success) {
          const lines = result.output.trim().split('\n');
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              console.log(`  ${chalk.dim('Total Links:')}    ${data.total}`);
              console.log(`  ${chalk.dim('Internal:')}       ${data.internal}`);
              console.log(`  ${chalk.dim('External:')}       ${data.external}`);
              console.log(chalk.green(`  ${chalk.dim('Working:')}        ${data.working}`));
              if (data.broken?.length > 0) {
                console.log(chalk.red(`  ${chalk.dim('Broken:')}         ${data.broken.length}`));
                for (const b of data.broken) {
                  console.log(chalk.red(`    ✖ ${b.url} (${b.status || b.error})`));
                }
              } else {
                console.log(chalk.green(`  ✔ No broken links found`));
              }
            } catch {
              if (line.trim()) console.log(chalk.dim(`  ${line}`));
            }
          }
        } else {
          console.log(chalk.red(`  ✖ Link check failed`));
          if (result.error) console.log(chalk.dim(`  ${result.error.slice(0, 300)}`));
        }
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('  Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo test probe <url...> ──────────────────────────────────────────
  testCmd
    .command('probe')
    .description('Quick HTTP health probe for one or more URLs (no Playwright needed)')
    .argument('<urls...>', 'One or more URLs to probe')
    .option('-t, --timeout <ms>', 'Timeout per URL in milliseconds', '5000')
    .action(async (urls: string[], cmdOpts, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const timeout = parseInt(cmdOpts.timeout);

        console.log(chalk.blue(`\n  Health Probe — ${urls.length} target(s)`));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        const results = [];
        for (const url of urls) {
          const start = Date.now();
          const status = await probeUrl(url, timeout);
          const elapsed = Date.now() - start;

          const isUp = status !== null && status < 500;
          results.push({
            url,
            status: status ?? 'UNREACHABLE',
            latency: `${elapsed}ms`,
            healthy: isUp ? 'YES' : 'NO',
          });

          if (isUp) {
            console.log(chalk.green(`  ✔ ${url}  HTTP ${status}  (${elapsed}ms)`));
          } else {
            console.log(chalk.red(`  ✖ ${url}  ${status ?? 'UNREACHABLE'}  (${elapsed}ms)`));
          }
        }

        printOutput(results, resolveOutputFormat(opts.output), [
          { key: 'url', header: 'URL', width: 45 },
          { key: 'status', header: 'Status', width: 12 },
          { key: 'latency', header: 'Latency', width: 10 },
          { key: 'healthy', header: 'Healthy', width: 8 },
        ]);
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('  Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo test detect ──────────────────────────────────────────────────
  testCmd
    .command('detect')
    .description('Detect running dev servers on common ports (localhost)')
    .option('--ports <ports>', 'Additional ports to scan (comma-separated)')
    .action(async (cmdOpts) => {
      try {
        const extraPorts = cmdOpts.ports
          ? cmdOpts.ports.split(',').map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p))
          : [];

        console.log(chalk.blue('\n  Detecting local servers...'));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        const servers = await detectLocalServers(extraPorts);

        if (servers.length === 0) {
          console.log(chalk.yellow('  No running servers detected.'));
        } else {
          for (const s of servers) {
            console.log(chalk.green(`  ✔ Port ${s.port}: ${s.url}`));
          }
        }
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('  Error:'), err.message);
        process.exit(1);
      }
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensurePlaywright(): void {
  if (!isPlaywrightInstalled()) {
    console.log(chalk.yellow(
      '  Playwright not found. Install it with:\n' +
      '    npm install -g playwright\n' +
      '    npx playwright install chromium\n'
    ));
    throw new AppError(424, 'Playwright is required for browser tests. See instructions above.');
  }
}
