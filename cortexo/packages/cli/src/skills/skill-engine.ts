// Cortexo SkillX — AI-powered Skill Extraction Engine
// Ported from SkillX's extraction/skill_extractor.py + filtering/base.py + clustering/merger.py
// Adapted to use local Ollama instead of cloud LLMs

import type { ExtractionResult, SkillLevel, TrajectoryEntry } from './skill-types.js';

const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';

// ──────────────────────────────────────────────────────────────────────────────
// Prompt Templates — DevOps-adapted versions of SkillX's prompt registry
// ──────────────────────────────────────────────────────────────────────────────

const EXTRACT_PROMPT = `You are a DevOps knowledge engineer. Analyze the following server operation trajectory (a sequence of commands and their outputs) and extract reusable skills.

For each skill, classify it into one of three levels:
- "planning": A high-level playbook or multi-step strategy (e.g., "Database migration from staging to production")
- "functional": A reusable multi-step procedure using specific tools (e.g., "Safely restart Nginx with zero-downtime")
- "atomic": A single-command best practice or flag nuance (e.g., "Use --single-transaction with mysqldump on RDS")

Return ONLY a JSON array of extracted skills. Each skill object must have:
{
  "action": "add" | "modify",
  "skill": {
    "name": "<short descriptive name>",
    "level": "planning" | "functional" | "atomic",
    "description": "<what this skill accomplishes>",
    "content": "<step-by-step procedure or exact command with flags>",
    "tools": ["<tool1>", "<tool2>"],
    "tags": ["<tag1>", "<tag2>"]
  },
  "reasoning": "<why this is a reusable skill>"
}

Rules:
- Extract ONLY genuinely reusable patterns, not one-off operations
- For atomic skills, include exact flags and common pitfalls
- For functional skills, include the full multi-step sequence
- For planning skills, include decision points and branching logic
- Do NOT include hardcoded IPs, passwords, or sensitive values
- Tags should be generic categories (e.g., "database", "nginx", "deployment", "security")
- If a skill already exists in the provided library, use "modify" with improvements`;

const FILTER_PROMPT = `You are a DevOps skill quality auditor. Evaluate the following skill and determine if it is safe, reusable, and production-ready.

Check for:
1. SAFETY: Does it avoid destructive operations without safeguards? (rm -rf, DROP DATABASE, etc.)
2. REUSABILITY: Is it generic enough to apply across different servers/environments?
3. COMPLETENESS: Does it include necessary error handling or rollback steps?
4. NO SECRETS: Does it avoid hardcoded credentials, IPs, or sensitive data?
5. CORRECTNESS: Are the commands and flags accurate?

Respond with EXACTLY one word: "good" if the skill passes ALL checks, or "bad" if it fails any.`;

const MERGE_PROMPT = `You are a DevOps knowledge curator. The following skills are similar and should be merged into a single, comprehensive skill.

Combine them by:
1. Keeping the most complete and accurate procedure
2. Incorporating unique steps or flags from each variant
3. Preserving all relevant tags and tool references
4. Adding any missing error handling or edge cases

Return the merged skill as a JSON object wrapped in <skill> tags:
<skill>
{
  "name": "<merged name>",
  "level": "<planning|functional|atomic>",
  "description": "<comprehensive description>",
  "content": "<complete merged procedure>",
  "tools": ["<all tools>"],
  "tags": ["<all tags>"]
}
</skill>`;

// ──────────────────────────────────────────────────────────────────────────────
// Ollama Communication
// ──────────────────────────────────────────────────────────────────────────────

async function getAvailableModel(): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (data.models?.length > 0) return data.models[0].name;
    return null;
  } catch {
    return null;
  }
}

async function chatWithOllama(
  model: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      options: { temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed: ${res.statusText}`);
  }

  const data = (await res.json()) as any;
  return data.message?.content ?? '';
}

// ──────────────────────────────────────────────────────────────────────────────
// JSON Extraction Helpers (ported from SkillX's regex-based extraction)
// ──────────────────────────────────────────────────────────────────────────────

function extractJsonArray(text: string): any[] | null {
  // Try ```json blocks first
  const jsonBlock = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlock) {
    try { return JSON.parse(jsonBlock[1].trim()); } catch { /* fall through */ }
  }

  // Try plain ``` blocks
  const codeBlock = text.match(/```\s*([\s\S]*?)```/);
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()); } catch { /* fall through */ }
  }

  // Try raw JSON array
  const rawArray = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (rawArray) {
    try { return JSON.parse(rawArray[0]); } catch { /* fall through */ }
  }

  return null;
}

function extractSkillTag(text: string): any | null {
  const match = text.match(/<skill>([\s\S]*?)<\/skill>/);
  if (match) {
    try { return JSON.parse(match[1].trim()); } catch { /* fall through */ }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API — Skill Extraction Engine
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extract DevOps skills from a trajectory using local Ollama.
 * Ported from SkillX's HybridSkillExtractor — the main extraction pipeline.
 */
export async function extractSkillsFromTrajectory(
  trajectory: TrajectoryEntry,
  existingSkillNames: string[] = [],
  onProgress?: (msg: string) => void
): Promise<ExtractionResult[]> {
  const model = await getAvailableModel();
  if (!model) {
    throw new Error('Ollama is not running or no models installed. Run: ollama pull llama3');
  }

  onProgress?.(`Using model: ${model}`);

  // Format trajectory for the prompt
  const stepsText = trajectory.steps
    .map((s, i) => {
      const status = s.success ? '✔' : '✖';
      let line = `Step ${i + 1} [${status}]: $ ${s.command}`;
      if (s.output) line += `\nOutput: ${s.output.slice(0, 500)}`;
      if (s.notes) line += `\nNotes: ${s.notes}`;
      return line;
    })
    .join('\n\n');

  const userMessage = [
    `# Task: ${trajectory.task}`,
    `# Outcome: ${trajectory.success ? 'SUCCESS' : 'FAILED'}`,
    trajectory.serverId ? `# Server: ${trajectory.serverId}` : '',
    `\n# Command Sequence:\n${stepsText}`,
    existingSkillNames.length > 0
      ? `\n# Existing Skill Library:\n${existingSkillNames.join(', ')}`
      : '',
  ].filter(Boolean).join('\n');

  onProgress?.('Analyzing trajectory with AI...');

  const response = await chatWithOllama(model, EXTRACT_PROMPT, userMessage);
  const skills = extractJsonArray(response);

  if (!skills || !Array.isArray(skills)) {
    onProgress?.('AI returned no parseable skills');
    return [];
  }

  // Validate and normalize extracted skills
  const results: ExtractionResult[] = [];
  for (const item of skills) {
    if (!item?.skill?.name || !item?.skill?.level) continue;

    const validLevels: SkillLevel[] = ['planning', 'functional', 'atomic'];
    if (!validLevels.includes(item.skill.level)) continue;

    results.push({
      action: item.action === 'modify' ? 'modify' : 'add',
      skill: {
        name: item.skill.name,
        level: item.skill.level,
        description: item.skill.description || '',
        content: item.skill.content || '',
        tools: Array.isArray(item.skill.tools) ? item.skill.tools : [],
        tags: Array.isArray(item.skill.tags) ? item.skill.tags : [],
      },
      modifiedFrom: item.modified_from,
      reasoning: item.reasoning || '',
    });
  }

  onProgress?.(`Extracted ${results.length} raw skill(s)`);
  return results;
}

/**
 * Filter a skill through AI quality gate.
 * Ported from SkillX's GeneralFilter — checks safety, reusability, completeness.
 */
export async function filterSkill(
  skillContent: string,
  onProgress?: (msg: string) => void
): Promise<boolean> {
  const model = await getAvailableModel();
  if (!model) throw new Error('Ollama not available');

  onProgress?.('Running quality filter...');

  const response = await chatWithOllama(model, FILTER_PROMPT, `# Skill:\n${skillContent}`);
  return response.toLowerCase().includes('good');
}

/**
 * Merge multiple similar skills into one comprehensive skill via AI.
 * Ported from SkillX's SkillMerger.
 */
export async function mergeSkills(
  skills: Array<{ name: string; content: string; level: string; tools: string[]; tags: string[] }>,
  onProgress?: (msg: string) => void
): Promise<{
  name: string;
  level: SkillLevel;
  description: string;
  content: string;
  tools: string[];
  tags: string[];
} | null> {
  if (skills.length === 0) return null;
  if (skills.length === 1) {
    const s = skills[0];
    return {
      name: s.name,
      level: s.level as SkillLevel,
      description: '',
      content: s.content,
      tools: s.tools,
      tags: s.tags,
    };
  }

  const model = await getAvailableModel();
  if (!model) throw new Error('Ollama not available');

  onProgress?.(`Merging ${skills.length} skills...`);

  const skillsText = skills
    .map((s, i) => `Skill ${i + 1}: ${JSON.stringify(s, null, 2)}`)
    .join('\n\n');

  const response = await chatWithOllama(model, MERGE_PROMPT, skillsText);
  const merged = extractSkillTag(response);

  if (!merged?.name) {
    onProgress?.('AI failed to produce a merged skill');
    return null;
  }

  const validLevels: SkillLevel[] = ['planning', 'functional', 'atomic'];
  return {
    name: merged.name,
    level: validLevels.includes(merged.level) ? merged.level : skills[0].level as SkillLevel,
    description: merged.description || '',
    content: merged.content || '',
    tools: Array.isArray(merged.tools) ? merged.tools : [],
    tags: Array.isArray(merged.tags) ? merged.tags : [],
  };
}
