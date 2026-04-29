import { exec, execSync } from 'child_process';
import { eq } from 'drizzle-orm';
import { getDb } from '../lib/db.js';
import { pipelineRuns, pipelines } from '@cortexo/db/schema';
import { deploySsh } from './ssh-deployer.js';

// Docker availability check (cached)
let dockerAvailable: boolean | null = null;
function isDockerAvailable(): boolean {
  if (dockerAvailable !== null) return dockerAvailable;
  try { execSync('docker info --format json', { stdio: 'pipe', timeout: 3000 }); dockerAvailable = true; }
  catch { dockerAvailable = false; }
  return dockerAvailable;
}

// Parse a simple YAML pipeline config into stage objects
function parseYamlStages(yaml: string): Array<{ name: string; type?: string; run?: string }> {
  const stages: Array<{ name: string; type?: string; run?: string }> = [];
  const lines = yaml.split('\n');
  let inStages = false;
  let current: { name?: string; type?: string; run?: string } = {};

  for (const rawLine of lines) {
    const line = rawLine;
    const trimmed = line.trimStart();

    if (trimmed.startsWith('stages:')) { inStages = true; continue; }
    if (inStages && !line.startsWith(' ') && !line.startsWith('\t') && trimmed && !trimmed.startsWith('-')) { inStages = false; }
    if (!inStages) continue;

    if (trimmed.startsWith('- name:')) {
      if (current.name) stages.push({ name: current.name, type: current.type, run: current.run });
      current = { name: trimmed.replace('- name:', '').trim() };
    } else if (trimmed.startsWith('run:')) {
      current.run = trimmed.replace('run:', '').trim();
    } else if (trimmed.startsWith('type:')) {
      current.type = trimmed.replace('type:', '').trim();
    }
  }
  if (current.name) stages.push({ name: current.name, type: current.type, run: current.run });
  return stages;
}

// Post Slack notification (non-blocking)
async function notifySlack(message: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  } catch { /* Slack is best-effort */ }
}

interface PipelineJob {
  runId: string;
  pipelineId: string;
  projectId: string;
  stages: Array<{
    name: string;
    type?: string;
    run?: string;
    config?: Record<string, unknown>;
  }>;
  branch: string;
  commitSha?: string;
  deployTargetId?: string;
}

interface StageResult {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  output?: string;
  error?: string;
}

/**
 * Execute a pipeline run: process each stage sequentially.
 * Updates DB status in real-time so the frontend can poll progress.
 */
export async function executePipeline(job: PipelineJob): Promise<void> {
  const db = await getDb();
  const startTime = Date.now();
  const stageResults: StageResult[] = [];
  let overallStatus: 'success' | 'failed' = 'success';

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`▶ Pipeline Run: ${job.runId}`);
  console.log(`  Pipeline: ${job.pipelineId}`);
  console.log(`  Branch: ${job.branch}`);

  // Parse stages — first from yamlConfig if present, then from stages JSON
  let stages = job.stages;
  if (typeof stages === 'string') {
    try { stages = JSON.parse(stages as unknown as string); } catch { stages = []; }
  }

  // If no stages but yamlConfig exists → parse YAML at runtime
  if ((!Array.isArray(stages) || stages.length === 0) && (job as any).yamlConfig) {
    stages = parseYamlStages((job as any).yamlConfig);
    console.log(`  Parsed ${stages.length} stages from YAML config`);
  }

  if (!Array.isArray(stages) || stages.length === 0) {
    console.log('  ⚠  No stages defined — marking as failed');
    await db.update(pipelineRuns)
      .set({ status: 'failed', finishedAt: new Date(), durationMs: 0 })
      .where(eq(pipelineRuns.id, job.runId));
    return;
  }

  console.log(`  Stages: ${stages.map((s) => s.name).join(' → ')}`);
  console.log(`${'═'.repeat(60)}`);

  // Mark run as "running"
  await db.update(pipelineRuns)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(pipelineRuns.id, job.runId));

  // Execute each stage sequentially
  for (const stage of stages) {
    const stageStart = Date.now();
    console.log(`\n  ┌─ Stage: ${stage.name} (${stage.type || 'shell'})`);

    let result: StageResult;

    try {
      if (stage.type === 'deploy' && job.deployTargetId) {
        // SSH deployment stage
        console.log(`  │  Deploying via SSH...`);
        await deploySsh({
          runId: job.runId,
          projectId: job.projectId,
          deployTargetId: job.deployTargetId,
          branch: job.branch,
          commitSha: job.commitSha,
          command: stage.run,
        });
        result = {
          name: stage.name,
          status: 'success',
          startedAt: new Date(stageStart).toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: Date.now() - stageStart,
          output: 'SSH deployment completed',
        };
      } else if (stage.run) {
        // Docker-isolated stage (if Docker available) or shell fallback
        const useDocker = isDockerAvailable() && process.env.PIPELINE_DOCKER_IMAGE;
        const dockerImage = process.env.PIPELINE_DOCKER_IMAGE || 'alpine:latest';
        let cmdToRun = stage.run;
        if (useDocker) {
          cmdToRun = `docker run --rm --network=none --memory=512m --cpus=0.5 --pids-limit=50 -e CI=true ${dockerImage} sh -c ${JSON.stringify(stage.run)}`;
          console.log(`  │  🐳 Docker (${dockerImage}): ${stage.run}`);
        }
        const output = await execCommand(cmdToRun, 120_000);
        result = {
          name: stage.name,
          status: 'success',
          startedAt: new Date(stageStart).toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: Date.now() - stageStart,
          output: output.slice(0, 5000),
        };
      } else {
        // No command — skip
        result = {
          name: stage.name,
          status: 'skipped',
          startedAt: new Date(stageStart).toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 0,
        };
        console.log(`  │  ⏭  Skipped (no command)`);
      }
    } catch (err: any) {
      result = {
        name: stage.name,
        status: 'failed',
        startedAt: new Date(stageStart).toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - stageStart,
        error: err.message || 'Unknown error',
      };
      overallStatus = 'failed';
    }

    stageResults.push(result);

    // Update stages JSON in DB after each stage completes
    await db.update(pipelineRuns)
      .set({ stages: JSON.stringify(stageResults) as any })
      .where(eq(pipelineRuns.id, job.runId));

    const icon = result.status === 'success' ? '✅' : result.status === 'skipped' ? '⏭ ' : '❌';
    console.log(`  └─ ${icon} ${result.name} — ${result.durationMs}ms`);

    // Abort remaining stages on failure
    if (result.status === 'failed') {
      console.log(`\n  ⛔ Pipeline aborted — stage "${stage.name}" failed`);
      console.log(`     Error: ${result.error}`);
      break;
    }
  }

  // Mark any remaining stages as skipped
  const executedNames = new Set(stageResults.map((r) => r.name));
  for (const stage of stages) {
    if (!executedNames.has(stage.name)) {
      stageResults.push({
        name: stage.name,
        status: 'skipped',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
      });
    }
  }

  const totalDuration = Date.now() - startTime;

  // Finalize pipeline run
  await db.update(pipelineRuns)
    .set({
      status: overallStatus,
      stages: JSON.stringify(stageResults) as any,
      finishedAt: new Date(),
      durationMs: totalDuration,
    })
    .where(eq(pipelineRuns.id, job.runId));

  // Update pipeline's lastRunAt
  await db.update(pipelines)
    .set({ lastRunAt: new Date() })
    .where(eq(pipelines.id, job.pipelineId));

  const icon = overallStatus === 'success' ? '✅' : '❌';
  console.log(`\n${icon} Pipeline ${overallStatus} in ${totalDuration}ms`);
  console.log(`${'═'.repeat(60)}\n`);

  // Slack notification (non-blocking)
  const pipelineRow = await db.query.pipelines?.findFirst({ where: (p: any, { eq: eqFn }: any) => eqFn(p.id, job.pipelineId) } as any).catch(() => null);
  const projectName = (pipelineRow as any)?.name || 'Pipeline';
  const emoji = overallStatus === 'success' ? '✅' : '❌';
  notifySlack(`${emoji} *${projectName}* pipeline ${overallStatus} in ${Math.round(totalDuration / 1000)}s (branch: \`${job.branch}\`)\n<http://localhost:3000/pipelines/runs|View run →>`).catch(() => {});
}

/**
 * Execute a shell command with timeout.
 */
function execCommand(cmd: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`  │  $ ${cmd}`);

    const proc = exec(cmd, {
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data;
      const lines = data.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        console.log(`  │  ${line}`);
      }
    });

    proc.stderr?.on('data', (data) => {
      stderr += data;
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command exited with code ${code}: ${stderr || stdout}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to execute: ${err.message}`));
    });
  });
}
