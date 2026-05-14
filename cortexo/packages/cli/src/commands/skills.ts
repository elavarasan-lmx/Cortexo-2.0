// Cortexo Skills Command — CLI interface for the SkillX-powered knowledge base
// Ported from SkillX's pipeline.py, adapted as interactive CLI commands

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { AppError } from '../client/app-error.js';
import { printOutput, resolveOutputFormat } from '../formatters/output-formatter.js';
import {
  loadSkillStore,
  addSkill,
  getSkills,
  getSkillById,
  getSkillStats,
  removeSkill,
  replaceWithMerged,
} from '../skills/skill-store.js';
import {
  extractSkillsFromTrajectory,
  filterSkill,
  mergeSkills,
} from '../skills/skill-engine.js';
import type { TrajectoryEntry, SkillLevel } from '../skills/skill-types.js';

export function registerSkillsCommand(program: Command): void {
  const skillsCmd = program
    .command('skills')
    .alias('skill')
    .description('AI-powered DevOps Skill Knowledge Base (SkillX engine)');

  // ── cortexo skills list ──────────────────────────────────────────────────
  skillsCmd
    .command('list')
    .description('List all skills in the knowledge base')
    .option('-l, --level <level>', 'Filter by level: planning, functional, atomic')
    .option('-t, --tag <tag>', 'Filter by tag')
    .option('-s, --search <query>', 'Search skills by name, description, or content')
    .action(async (cmdOpts, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const skills = getSkills({
          level: cmdOpts.level as SkillLevel | undefined,
          tag: cmdOpts.tag,
          orgId: opts.orgId || undefined,
          search: cmdOpts.search,
        });

        if (skills.length === 0) {
          console.log(chalk.yellow('No skills found. Run `cortexo skills learn` to extract skills from operational logs.'));
          return;
        }

        printOutput(
          skills.map((s) => ({
            id: s.id.slice(0, 8),
            name: s.name,
            level: s.level,
            tools: s.tools.join(', '),
            uses: s.useCount,
            updated: s.updatedAt.slice(0, 10),
          })),
          resolveOutputFormat(opts.output),
          [
            { key: 'id', header: 'ID', width: 10 },
            { key: 'name', header: 'Skill Name', width: 35 },
            { key: 'level', header: 'Level', width: 12 },
            { key: 'tools', header: 'Tools', width: 25 },
            { key: 'uses', header: 'Uses', width: 6 },
            { key: 'updated', header: 'Updated', width: 12 },
          ]
        );
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo skills show <id> ─────────────────────────────────────────────
  skillsCmd
    .command('show <id>')
    .description('Show detailed information about a specific skill')
    .action(async (id: string) => {
      try {
        // Support partial ID match
        const store = loadSkillStore();
        const skill = store.skills.find((s) => s.id.startsWith(id));

        if (!skill) {
          console.error(chalk.red(`Skill not found: ${id}`));
          process.exit(1);
        }

        console.log(chalk.bold.cyan(`\n  ${skill.name}`));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));
        console.log(`  ${chalk.dim('ID:')}          ${skill.id}`);
        console.log(`  ${chalk.dim('Level:')}       ${levelBadge(skill.level)}`);
        console.log(`  ${chalk.dim('Source:')}      ${skill.source}`);
        console.log(`  ${chalk.dim('Tools:')}       ${skill.tools.join(', ') || 'none'}`);
        console.log(`  ${chalk.dim('Tags:')}        ${skill.tags.join(', ') || 'none'}`);
        console.log(`  ${chalk.dim('Uses:')}        ${skill.useCount}`);
        console.log(`  ${chalk.dim('Created:')}     ${skill.createdAt.slice(0, 19)}`);
        console.log(`  ${chalk.dim('Updated:')}     ${skill.updatedAt.slice(0, 19)}`);
        if (skill.orgId) console.log(`  ${chalk.dim('Org:')}         ${skill.orgId}`);
        if (skill.serverIds?.length) console.log(`  ${chalk.dim('Servers:')}     ${skill.serverIds.join(', ')}`);

        console.log(`\n  ${chalk.dim('Description:')}`);
        console.log(`  ${skill.description || 'No description'}\n`);

        console.log(`  ${chalk.dim('Procedure:')}`);
        console.log(chalk.white(`  ${skill.content.split('\n').join('\n  ')}`));
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo skills stats ─────────────────────────────────────────────────
  skillsCmd
    .command('stats')
    .description('Show skill knowledge base statistics')
    .action(async () => {
      try {
        const stats = getSkillStats();

        console.log(chalk.bold.cyan('\n  Skill Knowledge Base Stats'));
        console.log(chalk.dim(`  ${'─'.repeat(35)}`));
        console.log(`  ${chalk.dim('Total Skills:')}   ${chalk.white.bold(String(stats.total))}`);
        console.log(`  ${chalk.blue('Planning:')}       ${stats.planning}`);
        console.log(`  ${chalk.green('Functional:')}     ${stats.functional}`);
        console.log(`  ${chalk.magenta('Atomic:')}         ${stats.atomic}`);
        console.log(`  ${chalk.dim('Last Updated:')}   ${stats.lastUpdated.slice(0, 19)}`);
        console.log('');
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo skills learn ─────────────────────────────────────────────────
  skillsCmd
    .command('learn <file>')
    .description('Extract skills from a trajectory log file (JSON) using local AI')
    .option('--no-filter', 'Skip AI quality filtering')
    .option('--dry-run', 'Show what would be extracted without saving')
    .action(async (file: string, cmdOpts, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();

        console.log(chalk.blue(`\n  Learning from trajectory: ${file}`));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        // Load trajectory file
        let trajectory: TrajectoryEntry;
        try {
          const raw = readFileSync(file, 'utf-8');
          trajectory = JSON.parse(raw);
        } catch (e: any) {
          throw new AppError(400, `Failed to parse trajectory file: ${e.message}`);
        }

        // Validate required fields
        if (!trajectory.task || !trajectory.steps?.length) {
          throw new AppError(400, 'Trajectory must have "task" and "steps" fields. See: cortexo skills learn --help');
        }

        // Get existing skill names to avoid duplicates
        const existing = getSkills().map((s) => s.name);

        // Step 1: Extract skills (ported from SkillX HybridSkillExtractor)
        const extracted = await extractSkillsFromTrajectory(
          trajectory,
          existing,
          (msg) => console.log(chalk.dim(`  ${msg}`))
        );

        if (extracted.length === 0) {
          console.log(chalk.yellow('\n  No reusable skills found in this trajectory.'));
          return;
        }

        console.log(chalk.green(`\n  Extracted ${extracted.length} skill(s):`));

        // Step 2: Quality filter each skill (ported from SkillX GeneralFilter)
        let approved = extracted;
        if (cmdOpts.filter !== false) {
          console.log(chalk.dim('  Running quality filter...'));
          const filtered: typeof extracted = [];

          for (const result of extracted) {
            const passes = await filterSkill(
              result.skill.content,
              (msg) => console.log(chalk.dim(`    ${msg}`))
            );

            if (passes) {
              filtered.push(result);
              console.log(chalk.green(`    ✔ ${result.skill.name}`));
            } else {
              console.log(chalk.red(`    ✖ ${result.skill.name} (filtered out — safety/quality)`));
            }
          }
          approved = filtered;
        }

        if (approved.length === 0) {
          console.log(chalk.yellow('\n  All skills were filtered out by quality checks.'));
          return;
        }

        // Step 3: Save or preview
        if (cmdOpts.dryRun) {
          console.log(chalk.yellow('\n  [DRY RUN] Skills that would be saved:\n'));
          for (const result of approved) {
            console.log(`  ${levelBadge(result.skill.level)} ${chalk.bold(result.skill.name)}`);
            console.log(chalk.dim(`    ${result.skill.description}`));
            console.log(chalk.dim(`    Tools: ${result.skill.tools.join(', ')}`));
            console.log('');
          }
        } else {
          for (const result of approved) {
            addSkill({
              name: result.skill.name,
              level: result.skill.level,
              description: result.skill.description,
              content: result.skill.content,
              tools: result.skill.tools,
              tags: result.skill.tags,
              source: 'extracted',
              orgId: opts.orgId || undefined,
              serverIds: trajectory.serverId ? [trajectory.serverId] : undefined,
            });
          }

          console.log(chalk.green(`\n  ✔ Saved ${approved.length} skill(s) to knowledge base.`));
          console.log(chalk.dim(`  View them with: cortexo skills list\n`));
        }
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error(chalk.red(`  [Error] ${err.apiMessage}`));
        } else {
          console.error(chalk.red('  Error:'), err.message);
        }
        process.exit(1);
      }
    });

  // ── cortexo skills add ───────────────────────────────────────────────────
  skillsCmd
    .command('add')
    .description('Manually add a skill to the knowledge base')
    .requiredOption('-n, --name <name>', 'Skill name')
    .requiredOption('-l, --level <level>', 'Skill level: planning, functional, atomic')
    .requiredOption('-c, --content <content>', 'Skill content / procedure')
    .option('-d, --description <desc>', 'Skill description')
    .option('--tools <tools>', 'Comma-separated tool names')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (cmdOpts, cmd) => {
      try {
        const opts = cmd.optsWithGlobals();
        const validLevels: SkillLevel[] = ['planning', 'functional', 'atomic'];
        if (!validLevels.includes(cmdOpts.level)) {
          throw new AppError(400, `Invalid level. Must be one of: ${validLevels.join(', ')}`);
        }

        const skill = addSkill({
          name: cmdOpts.name,
          level: cmdOpts.level,
          description: cmdOpts.description || '',
          content: cmdOpts.content,
          tools: cmdOpts.tools ? cmdOpts.tools.split(',').map((t: string) => t.trim()) : [],
          tags: cmdOpts.tags ? cmdOpts.tags.split(',').map((t: string) => t.trim()) : [],
          source: 'manual',
          orgId: opts.orgId || undefined,
        });

        console.log(chalk.green(`✔ Added skill: ${skill.name} (${skill.id.slice(0, 8)})`));
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error(chalk.red(`[Error] ${err.apiMessage}`));
        } else {
          console.error(chalk.red('Error:'), err.message);
        }
        process.exit(1);
      }
    });

  // ── cortexo skills remove <id> ──────────────────────────────────────────
  skillsCmd
    .command('remove <id>')
    .description('Remove a skill from the knowledge base')
    .action(async (id: string) => {
      try {
        // Support partial ID match
        const store = loadSkillStore();
        const skill = store.skills.find((s) => s.id.startsWith(id));
        if (!skill) {
          console.error(chalk.red(`Skill not found: ${id}`));
          process.exit(1);
        }

        const removed = removeSkill(skill.id);
        if (removed) {
          console.log(chalk.green(`✔ Removed skill: ${skill.name}`));
        } else {
          console.error(chalk.red(`Failed to remove skill: ${id}`));
          process.exit(1);
        }
      } catch (err: any) {
        console.error(chalk.red('Error:'), err.message);
        process.exit(1);
      }
    });

  // ── cortexo skills merge ─────────────────────────────────────────────────
  skillsCmd
    .command('merge')
    .description('Merge similar skills using AI (SkillX iterative refinement)')
    .option('-l, --level <level>', 'Only merge skills at this level')
    .option('-t, --tag <tag>', 'Only merge skills with this tag')
    .option('--dry-run', 'Preview merge candidates without executing')
    .action(async (cmdOpts) => {
      try {
        console.log(chalk.blue('\n  Skill Merge Pipeline (SkillX Iterative Refinement)'));
        console.log(chalk.dim(`  ${'─'.repeat(50)}`));

        const skills = getSkills({
          level: cmdOpts.level as SkillLevel | undefined,
          tag: cmdOpts.tag,
        });

        if (skills.length < 2) {
          console.log(chalk.yellow('  Need at least 2 skills to merge. Add more first.'));
          return;
        }

        // Group by similar tools (simple clustering — ported from SkillX's DBSCAN concept)
        const groups = new Map<string, typeof skills>();
        for (const skill of skills) {
          const key = skill.tools.sort().join('|') || skill.level;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(skill);
        }

        // Only process groups with 2+ skills
        const mergeable = [...groups.entries()].filter(([, g]) => g.length >= 2);

        if (mergeable.length === 0) {
          console.log(chalk.yellow('  No similar skills found to merge.'));
          return;
        }

        console.log(chalk.dim(`  Found ${mergeable.length} merge candidate group(s)\n`));

        for (const [key, group] of mergeable) {
          console.log(chalk.cyan(`  Group: ${key} (${group.length} skills)`));
          for (const s of group) {
            console.log(chalk.dim(`    - ${s.name}`));
          }

          if (cmdOpts.dryRun) {
            console.log(chalk.yellow('    [DRY RUN] Would merge these skills\n'));
            continue;
          }

          const merged = await mergeSkills(
            group.map((s) => ({
              name: s.name,
              content: s.content,
              level: s.level,
              tools: s.tools,
              tags: s.tags,
            })),
            (msg) => console.log(chalk.dim(`    ${msg}`))
          );

          if (merged) {
            const newSkill = replaceWithMerged(
              group.map((s) => s.id),
              {
                name: merged.name,
                level: merged.level,
                description: merged.description,
                content: merged.content,
                tools: merged.tools,
                tags: [...new Set([...merged.tags, ...group.flatMap((s) => s.tags)])],
                source: 'merged',
              }
            );
            console.log(chalk.green(`    ✔ Merged into: ${newSkill.name} (${newSkill.id.slice(0, 8)})\n`));
          } else {
            console.log(chalk.yellow('    ✖ AI merge failed, keeping originals\n'));
          }
        }

        const stats = getSkillStats();
        console.log(chalk.green(`  Done. Knowledge base now has ${stats.total} skill(s).\n`));
      } catch (err: any) {
        console.error(chalk.red('  Error:'), err.message);
        process.exit(1);
      }
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function levelBadge(level: string): string {
  switch (level) {
    case 'planning': return chalk.bgBlue.white(' PLAN ');
    case 'functional': return chalk.bgGreen.white(' FUNC ');
    case 'atomic': return chalk.bgMagenta.white(' ATOM ');
    default: return chalk.bgGray.white(` ${level.toUpperCase()} `);
  }
}
