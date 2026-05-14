// Cortexo Skill Validator — Offline frontmatter & structure validator for SKILL.md files
// Ported from antigravity-awesome-skills/tools/scripts/validate-skills.js
// Zero dependencies — uses built-in node:fs, node:path only

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';

// ── Validation Constants ───────────────────────────────────────────────────────

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_SKILL_LINES = 500;

const ALLOWED_FIELDS = new Set([
  'name',
  'description',
  'risk',
  'source',
  'source_repo',
  'source_type',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
  'package',
  'date_added',
]);

const VALID_SOURCE_TYPES = new Set(['official', 'community', 'self']);
const SOURCE_REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

const USE_SECTION_PATTERNS = [
  /^##\s+When\s+to\s+Use/im,
  /^##\s+Use\s+this\s+skill\s+when/im,
  /^##\s+When\s+to\s+Use\s+This\s+Skill/im,
];

// ── Types ──────────────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationFinding {
  severity: ValidationSeverity;
  skillId: string;
  message: string;
  field?: string;
}

export interface SkillValidationResult {
  scannedAt: string;
  skillsDir: string;
  totalSkills: number;
  errors: number;
  warnings: number;
  findings: ValidationFinding[];
  /** Skills that passed all checks */
  valid: string[];
  /** Skills with at least one error */
  invalid: string[];
  /** Summary of missing sections */
  missingSections: {
    useSection: string[];
    doNotUseSection: string[];
    instructionsSection: string[];
  };
  /** Skills exceeding line limit */
  longFiles: string[];
}

// ── Frontmatter Parser ─────────────────────────────────────────────────────────

interface FrontmatterResult {
  data: Record<string, any>;
  hasFrontmatter: boolean;
  errors: string[];
  body: string;
}

function parseFrontmatter(content: string): FrontmatterResult {
  const result: FrontmatterResult = { data: {}, hasFrontmatter: false, errors: [], body: content };

  if (!content.startsWith('---')) return result;

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    result.errors.push('Unterminated frontmatter block');
    return result;
  }

  result.hasFrontmatter = true;
  const yamlBlock = content.slice(3, endIndex).trim();
  result.body = content.slice(endIndex + 3).trim();

  // Simple YAML-like key: value parsing (no dependency on yaml parser)
  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      result.errors.push(`Invalid frontmatter line: "${trimmed}"`);
      continue;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    let value: string | Record<string, string> = trimmed.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    result.data[key] = value;
  }

  return result;
}

// ── Skill Discovery ────────────────────────────────────────────────────────────

function listSkillIds(skillsDir: string): string[] {
  if (!existsSync(skillsDir)) return [];

  return readdirSync(skillsDir)
    .filter((entry) => {
      const full = join(skillsDir, entry);
      return statSync(full).isDirectory() && !entry.startsWith('.');
    })
    .sort();
}

// ── Validators ─────────────────────────────────────────────────────────────────

function validateStringField(
  fieldName: string,
  value: unknown,
  opts: { min?: number; max?: number } = {}
): string | null {
  if (typeof value !== 'string') return `${fieldName} must be a string.`;

  const trimmed = value.trim();
  if (!trimmed) return `${fieldName} cannot be empty.`;
  if (opts.min !== undefined && trimmed.length < opts.min) return `${fieldName} must be >= ${opts.min} chars.`;
  if (opts.max !== undefined && trimmed.length > opts.max) return `${fieldName} must be <= ${opts.max} chars.`;

  return null;
}

// ── Main Validation Engine ─────────────────────────────────────────────────────

/**
 * Validate all SKILL.md files in a skills directory.
 * Checks frontmatter fields, naming conventions, section structure, and file length.
 */
export function validateSkillsDir(skillsDir: string): SkillValidationResult {
  const absDir = resolve(skillsDir);
  const findings: ValidationFinding[] = [];
  const valid: string[] = [];
  const invalid: string[] = [];
  const missingSections = { useSection: [] as string[], doNotUseSection: [] as string[], instructionsSection: [] as string[] };
  const longFiles: string[] = [];

  const skillIds = listSkillIds(absDir);

  for (const skillId of skillIds) {
    const skillPath = join(absDir, skillId, 'SKILL.md');
    let hasError = false;

    const addFinding = (severity: ValidationSeverity, message: string, field?: string) => {
      findings.push({ severity, skillId, message, field });
      if (severity === 'error') hasError = true;
    };

    // Check SKILL.md exists
    if (!existsSync(skillPath)) {
      addFinding('error', 'Missing SKILL.md file');
      invalid.push(skillId);
      continue;
    }

    const content = readFileSync(skillPath, 'utf-8');
    const { data, hasFrontmatter, errors: fmErrors } = parseFrontmatter(content);
    const lineCount = content.split(/\r?\n/).length;

    // Frontmatter presence
    if (!hasFrontmatter) {
      addFinding('error', 'Missing YAML frontmatter block');
    }

    // Frontmatter parse errors
    for (const err of fmErrors) {
      addFinding('error', `Frontmatter parse error: ${err}`);
    }

    // Folder name convention
    if (!NAME_PATTERN.test(skillId)) {
      addFinding('error', `Folder name must match ${NAME_PATTERN.source}`, 'folder');
    }

    // Name field validation
    if (data.name !== undefined) {
      const nameErr = validateStringField('name', data.name, { min: 1, max: MAX_NAME_LENGTH });
      if (nameErr) {
        addFinding('error', nameErr, 'name');
      } else {
        const nameValue = String(data.name).trim();
        if (!NAME_PATTERN.test(nameValue)) {
          addFinding('error', `name must match ${NAME_PATTERN.source}`, 'name');
        }
        if (nameValue !== skillId) {
          addFinding('error', `name "${nameValue}" must match folder name "${skillId}"`, 'name');
        }
      }
    }

    // Description field (required)
    if (data.description === undefined) {
      addFinding('error', 'description is required', 'description');
    } else {
      const descErr = validateStringField('description', data.description, { min: 1, max: MAX_DESCRIPTION_LENGTH });
      if (descErr) addFinding('error', descErr, 'description');
    }

    // Source metadata
    if (data.source_repo !== undefined) {
      const srcErr = validateStringField('source_repo', data.source_repo, { min: 3, max: 256 });
      if (srcErr) {
        addFinding('error', srcErr, 'source_repo');
      } else if (!SOURCE_REPO_PATTERN.test(String(data.source_repo).trim())) {
        addFinding('error', 'source_repo must match OWNER/REPO format', 'source_repo');
      }
    }

    if (data.source_type !== undefined) {
      const stErr = validateStringField('source_type', data.source_type, { min: 4, max: 16 });
      if (stErr) {
        addFinding('error', stErr, 'source_type');
      } else if (!VALID_SOURCE_TYPES.has(String(data.source_type).trim())) {
        addFinding('error', 'source_type must be one of: official, community, self', 'source_type');
      }
    }

    // Unknown fields
    if (data && Object.keys(data).length > 0) {
      const unknown = Object.keys(data).filter((k) => !ALLOWED_FIELDS.has(k));
      if (unknown.length > 0) {
        addFinding('warning', `Unknown frontmatter fields: ${unknown.join(', ')}`);
      }
    }

    // File length
    if (lineCount > MAX_SKILL_LINES) {
      longFiles.push(skillId);
      addFinding('warning', `SKILL.md is ${lineCount} lines (max recommended: ${MAX_SKILL_LINES})`);
    }

    // Section detection
    if (!USE_SECTION_PATTERNS.some((p) => p.test(content))) {
      missingSections.useSection.push(skillId);
      addFinding('info', 'Missing "When to Use" section');
    }

    if (!content.includes('## Do not use')) {
      missingSections.doNotUseSection.push(skillId);
      addFinding('info', 'Missing "Do not use" section');
    }

    if (!content.includes('## Instructions')) {
      missingSections.instructionsSection.push(skillId);
      addFinding('info', 'Missing "Instructions" section');
    }

    if (hasError) {
      invalid.push(skillId);
    } else {
      valid.push(skillId);
    }
  }

  return {
    scannedAt: new Date().toISOString(),
    skillsDir: absDir,
    totalSkills: skillIds.length,
    errors: findings.filter((f) => f.severity === 'error').length,
    warnings: findings.filter((f) => f.severity === 'warning').length,
    findings,
    valid,
    invalid,
    missingSections,
    longFiles,
  };
}

/**
 * Validate a single skill file (standalone SKILL.md path).
 * Returns the same structure but scoped to one skill.
 */
export function validateSingleSkill(skillMdPath: string): SkillValidationResult {
  const absPath = resolve(skillMdPath);
  const skillId = basename(join(absPath, '..'));
  const parentDir = join(absPath, '..', '..');

  // Create a temporary single-skill context
  return validateSkillsDir(parentDir);
}
