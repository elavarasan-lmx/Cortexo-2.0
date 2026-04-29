/**
 * Agent Execution Engine — /v1/agent
 * Runs autonomous AI agent tasks: code review, TDD, security scan, migration.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { detectDegradation, needsCompaction, checkTwoActionRule } from '../lib/degradation-detector.js';
import { runVerificationGate, formatVerificationReport } from '../lib/verification-gate.js';
import { incrementAiCallCount } from '../middleware/usage-limits.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AgentTask {
  id: string;
  type: 'code_review' | 'tdd' | 'security_scan' | 'migration_plan' | 'custom';
  status: 'queued' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output?: string;
  steps: { step: string; result: string; timestamp: string }[];
  createdAt: string;
  completedAt?: string;
  tokensUsed?: number;
  model: string;
}

// In-memory task store (use Redis/DB in production)
const taskStore = new Map<string, AgentTask>();

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  code_review: `You are a senior PHP DevOps engineer performing a code review. 
Follow PSR-12 standards, Uncle Bob's Clean Code principles, and OWASP security guidelines.
Structure your review as:
1. Security Issues (Critical/High/Medium)
2. Code Quality Issues
3. Performance Concerns
4. Positive Observations
5. Summary Score (0-100)`,

  tdd: `You are a TDD expert following Red-Green-Refactor cycle.
Given a feature description:
1. Write FAILING tests first (Red phase)
2. Write minimal code to make tests pass (Green phase)
3. Refactor for clean code (Refactor phase)
Use PHPUnit for PHP code.`,

  security_scan: `You are a security engineer performing a static analysis.
Identify: SQL injection, XSS, CSRF, path traversal, command injection, insecure deserialization.
Map findings to OWASP Top 10 and CWE IDs.
Provide severity (Critical/High/Medium/Low) and remediation for each finding.`,

  migration_plan: `You are a senior developer creating a migration plan.
Analyze the code and create a step-by-step migration guide with:
1. Breaking changes identified
2. Migration steps in order
3. Code examples for each step
4. Testing strategy
5. Estimated effort (hours)`,

  custom: `You are Cortexo AI, a DevOps intelligence agent.
Execute the given task following best practices for PHP/CodeIgniter development.
Be thorough, accurate, and actionable in your response.`,
};

async function runAgentTask(task: AgentTask): Promise<void> {
  task.status = 'running';
  taskStore.set(task.id, task);

  const systemPrompt = AGENT_SYSTEM_PROMPTS[task.type] || AGENT_SYSTEM_PROMPTS.custom;
  const userMessage = task.input.code
    ? `Task: ${task.input.description || 'Analyze this code'}\n\n\`\`\`php\n${task.input.code}\n\`\`\``
    : String(task.input.description || 'No input provided');

  if (!OPENAI_API_KEY) {
    // Demo mode
    const demoOutputs: Record<string, string> = {
      code_review: `## Code Review Report (Demo Mode)\n\n### 🔴 Security Issues\n- **[HIGH]** Potential SQL injection on line 45 — use prepared statements\n- **[MEDIUM]** User input not sanitized before HTML output — use htmlspecialchars()\n\n### 🟡 Code Quality\n- Function names don't follow PSR-12 (camelCase required)\n- Missing type declarations on method parameters\n- Magic numbers found — extract to named constants\n\n### 🟢 Positives\n- Good separation of concerns in controller\n- Database queries properly abstracted\n\n### Score: **72/100**`,
      tdd: `## TDD Cycle (Demo Mode)\n\n### 🔴 Red Phase — Failing Tests\n\`\`\`php\n/** @test */\npublic function it_throws_exception_for_invalid_user(): void\n{\n    $this->expectException(InvalidArgumentException::class);\n    $this->service->createUser(['email' => 'not-an-email']);\n}\n\`\`\`\n\n### 🟢 Green Phase — Minimal Code\n\`\`\`php\npublic function createUser(array $data): User\n{\n    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {\n        throw new InvalidArgumentException('Invalid email');\n    }\n    return new User($data);\n}\n\`\`\`\n\n### 🔵 Refactor Phase\n- Extract email validation to a ValueObject\n- Add more granular exception types`,
      security_scan: `## Security Scan Report (Demo Mode)\n\n### Critical Findings\n| ID | Issue | CWE | Line |\n|---|---|---|---|\n| S001 | SQL Injection via \`$_GET\` | CWE-89 | 23 |\n| S002 | XSS via unescaped output | CWE-79 | 45 |\n\n### Medium Findings\n- Missing CSRF token on form (CWE-352)\n- Session fixation risk (CWE-384)\n\n### Remediation Priority\n1. Parameterize all SQL queries immediately\n2. Add htmlspecialchars() to all output\n3. Implement CSRF middleware`,
      migration_plan: `## Migration Plan (Demo Mode)\n\n### CI3 → CI4 Steps\n1. **Update composer.json** — require codeigniter4/framework ^4.0\n2. **Move controllers** from application/controllers/ to app/Controllers/\n3. **Update namespace** — add namespace App\\Controllers;\n4. **Replace $this->input** → $this->request\n5. **Update routing** — config/routes.php syntax changed\n6. **Test each controller** after migration\n\n**Estimated effort:** 16-24 hours for medium-sized project`,
      custom: `## Agent Response (Demo Mode)\n\nI've analyzed your request. To enable real AI responses, add \`OPENAI_API_KEY\` to your \`apps/api/.env\` file.\n\nIn the meantime, here's a general response based on your input.`,
    };

    task.status = 'completed';
    task.output = demoOutputs[task.type] || demoOutputs.custom;
    task.completedAt = new Date().toISOString();
    task.model = 'demo';
    task.steps.push({ step: 'Analysis complete (demo mode)', result: 'success', timestamp: new Date().toISOString() });
    taskStore.set(task.id, task);
    return;
  }

  try {
    task.steps.push({ step: 'Calling OpenAI API', result: 'running', timestamp: new Date().toISOString() });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const data = await res.json() as any;
    task.output = data.choices?.[0]?.message?.content || 'No output generated';
    task.tokensUsed = data.usage?.total_tokens;
    task.status = 'completed';
    task.steps.push({ step: 'Analysis complete', result: 'success', timestamp: new Date().toISOString() });
  } catch (err: any) {
    task.status = 'failed';
    task.output = `Agent execution failed: ${err.message}`;
    task.steps.push({ step: 'Error', result: err.message, timestamp: new Date().toISOString() });
  }

  task.completedAt = new Date().toISOString();
  taskStore.set(task.id, task);
}

export async function agentRoutes(app: FastifyInstance) {

  // ─── List tasks ───────────────────────────────────────────────────────────
  app.get('/agent/tasks', async () => {
    const tasks = Array.from(taskStore.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
    return { data: tasks, total: tasks.length };
  });

  // ─── Get single task ──────────────────────────────────────────────────────
  app.get('/agent/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const task = taskStore.get(id);
    if (!task) return reply.code(404).send({ error: 'Task not found' });
    return { data: task };
  });

  // ─── Run agent task ───────────────────────────────────────────────────────
  const runAgentSchema = z.object({
    type: z.enum(['code_review', 'tdd', 'security_scan', 'migration_plan', 'custom']),
    description: z.string().optional(),
    code: z.string().optional(),
    language: z.string().optional(),
  });

  app.post('/agent/run', async (request, reply) => {
    const parsed = runAgentSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });

    const { type, description, code, language } = parsed.data;

    const task: AgentTask = {
      id: crypto.randomUUID(),
      type,
      status: 'queued',
      input: { description, code, language },
      steps: [{ step: 'Task queued', result: 'queued', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      model: OPENAI_API_KEY ? 'gpt-4o-mini' : 'demo',
    };

    taskStore.set(task.id, task);

    // Run async (don't await — return immediately, client polls for result)
    runAgentTask(task).catch(err => app.log.error(err, 'Agent task failed'));

    return reply.code(202).send({ data: task, message: 'Task queued — poll GET /v1/agent/tasks/:id for result' });
  });

  // ─── Available task types ─────────────────────────────────────────────────
  app.get('/agent/capabilities', async () => ({
    data: [
      { type: 'code_review',    name: 'PHP Code Review',       description: 'PSR-12, security, clean code analysis', requiresCode: true },
      { type: 'tdd',            name: 'TDD Red-Green-Refactor', description: 'Generate tests then implementation',    requiresCode: false },
      { type: 'security_scan',  name: 'Security Scan',          description: 'OWASP Top 10, CWE mapping',            requiresCode: true },
      { type: 'migration_plan', name: 'Migration Planner',      description: 'CI3→CI4, PHP 7.4→8.2 guidance',       requiresCode: false },
      { type: 'custom',         name: 'Custom Task',            description: 'Any custom DevOps AI task',            requiresCode: false },
    ],
    aiEnabled: !!OPENAI_API_KEY,
  }));
}

// ── Additional routes appended below ──────────────────────────────────────
// These are registered separately since agentRoutes function is already closed.

export async function agentAdvancedRoutes(app: FastifyInstance) {

  // ─── Degradation Detection ────────────────────────────────────────────────
  const degradationSchema = z.object({
    totalTokens: z.number().default(0),
    maxTokens: z.number().default(8000),
    messages: z.array(z.any()),
    memoryEntries: z.any().optional(),
  });

  app.post('/agent/degradation', async (request, reply) => {
    const parsed = degradationSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { totalTokens, maxTokens, messages, memoryEntries } = parsed.data;

    const result = detectDegradation({ totalTokens, maxTokens, messages, memoryEntries });
    const compactionNeeded = needsCompaction(totalTokens, maxTokens);
    const twoActionCheck = checkTwoActionRule([messages.filter((m: any) => m.role === 'assistant').length]);

    return { data: { degradation: result, compactionNeeded, compactionRatio: Math.round((totalTokens / maxTokens) * 100), twoActionRule: twoActionCheck } };
  });

  // ─── Iron Law Verification Gate ───────────────────────────────────────────
  const verifySchema = z.object({
    taskId: z.string().min(1),
    taskDescription: z.string().min(1),
    documentationPresent: z.boolean().default(true),
    testsPassed: z.boolean().optional(),
    codeReviewed: z.boolean().optional(),
  });

  app.post('/agent/verify', async (request, reply) => {
    const parsed = verifySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });

    const report = runVerificationGate({ ...parsed.data });
    return { data: report, formatted: formatVerificationReport(report) };
  });
}
