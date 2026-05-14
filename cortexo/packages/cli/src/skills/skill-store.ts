// Cortexo SkillX — Local JSON-based Skill Store Manager
// Ported from SkillX's skillx_db module, adapted for filesystem-based persistence

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DevOpsSkill, SkillStore, SkillLevel } from './skill-types.js';

const SKILLS_DIR = join(homedir(), '.cortexo', 'skills');
const SKILLS_FILE = join(SKILLS_DIR, 'knowledge-base.json');

function ensureDir(): void {
  if (!existsSync(SKILLS_DIR)) {
    mkdirSync(SKILLS_DIR, { recursive: true });
  }
}

/** Load the full skill store from disk */
export function loadSkillStore(): SkillStore {
  ensureDir();
  if (!existsSync(SKILLS_FILE)) {
    return { version: '1.0.0', lastUpdated: new Date().toISOString(), skills: [] };
  }
  try {
    const raw = readFileSync(SKILLS_FILE, 'utf-8');
    return JSON.parse(raw) as SkillStore;
  } catch {
    return { version: '1.0.0', lastUpdated: new Date().toISOString(), skills: [] };
  }
}

/** Persist the full skill store to disk */
function saveSkillStore(store: SkillStore): void {
  ensureDir();
  store.lastUpdated = new Date().toISOString();
  writeFileSync(SKILLS_FILE, JSON.stringify(store, null, 2) + '\n', 'utf-8');
}

/** Add a new skill to the knowledge base */
export function addSkill(
  skill: Omit<DevOpsSkill, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>
): DevOpsSkill {
  const store = loadSkillStore();
  const now = new Date().toISOString();

  const newSkill: DevOpsSkill = {
    ...skill,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    useCount: 0,
  };

  store.skills.push(newSkill);
  saveSkillStore(store);
  return newSkill;
}

/** Update an existing skill by ID (for merging / refinement) */
export function updateSkill(id: string, updates: Partial<DevOpsSkill>): DevOpsSkill | null {
  const store = loadSkillStore();
  const idx = store.skills.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  store.skills[idx] = {
    ...store.skills[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveSkillStore(store);
  return store.skills[idx];
}

/** Remove a skill by ID */
export function removeSkill(id: string): boolean {
  const store = loadSkillStore();
  const before = store.skills.length;
  store.skills = store.skills.filter((s) => s.id !== id);
  if (store.skills.length < before) {
    saveSkillStore(store);
    return true;
  }
  return false;
}

/** Get all skills, optionally filtered by level or tags */
export function getSkills(filters?: {
  level?: SkillLevel;
  tag?: string;
  orgId?: string;
  search?: string;
}): DevOpsSkill[] {
  const store = loadSkillStore();
  let results = store.skills;

  if (filters?.level) {
    results = results.filter((s) => s.level === filters.level);
  }
  if (filters?.tag) {
    const tag = filters.tag.toLowerCase();
    results = results.filter((s) => s.tags.some((t) => t.toLowerCase().includes(tag)));
  }
  if (filters?.orgId) {
    results = results.filter((s) => s.orgId === filters.orgId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q) ||
        s.tools.some((t) => t.toLowerCase().includes(q))
    );
  }

  return results;
}

/** Get a single skill by ID */
export function getSkillById(id: string): DevOpsSkill | null {
  const store = loadSkillStore();
  return store.skills.find((s) => s.id === id) ?? null;
}

/** Increment use count for a skill */
export function recordSkillUsage(id: string): void {
  const store = loadSkillStore();
  const skill = store.skills.find((s) => s.id === id);
  if (skill) {
    skill.useCount += 1;
    saveSkillStore(store);
  }
}

/** Get skill store stats */
export function getSkillStats(): {
  total: number;
  planning: number;
  functional: number;
  atomic: number;
  lastUpdated: string;
} {
  const store = loadSkillStore();
  return {
    total: store.skills.length,
    planning: store.skills.filter((s) => s.level === 'planning').length,
    functional: store.skills.filter((s) => s.level === 'functional').length,
    atomic: store.skills.filter((s) => s.level === 'atomic').length,
    lastUpdated: store.lastUpdated,
  };
}

/**
 * Replace a set of skill IDs with a single merged skill.
 * Used by the merge pipeline after AI consolidation.
 */
export function replaceWithMerged(
  idsToRemove: string[],
  mergedSkill: Omit<DevOpsSkill, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>
): DevOpsSkill {
  const store = loadSkillStore();
  // Sum use counts from originals
  const totalUses = store.skills
    .filter((s) => idsToRemove.includes(s.id))
    .reduce((sum, s) => sum + s.useCount, 0);

  // Remove originals
  store.skills = store.skills.filter((s) => !idsToRemove.includes(s.id));

  const now = new Date().toISOString();
  const newSkill: DevOpsSkill = {
    ...mergedSkill,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    useCount: totalUses,
  };

  store.skills.push(newSkill);
  saveSkillStore(store);
  return newSkill;
}
