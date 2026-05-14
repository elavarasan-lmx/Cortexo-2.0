// Cortexo SkillX — Type definitions for the DevOps Skill Knowledge Base
// Ported from SkillX's core/skill.py, adapted for DevOps context

/**
 * Three-tier skill hierarchy (from SkillX paper):
 * - planning:   High-level playbooks (e.g., "How to migrate staging DB to prod")
 * - functional: Reusable multi-step procedures (e.g., "Safely restart Nginx")
 * - atomic:     Single-command nuances (e.g., "mysqldump flags for RDS")
 */
export type SkillLevel = 'planning' | 'functional' | 'atomic';

/**
 * Skill quality gate decisions — mirrors SkillX's add/modify/keep/discard flow.
 */
export type SkillAction = 'add' | 'modify' | 'keep' | 'discard';

/**
 * A single DevOps skill extracted from operational history.
 */
export interface DevOpsSkill {
  /** Unique identifier (auto-generated UUID) */
  id: string;
  /** Human-readable skill name */
  name: string;
  /** Tier in the 3-level hierarchy */
  level: SkillLevel;
  /** Detailed description of what this skill does */
  description: string;
  /** Step-by-step procedure or command sequence */
  content: string;
  /** Related CLI tools / commands (e.g., ["mysqldump", "nginx", "systemctl"]) */
  tools: string[];
  /** Tags for retrieval (e.g., ["database", "migration", "rds"]) */
  tags: string[];
  /** When was this skill first learned */
  createdAt: string;
  /** Last time this skill was refined or merged */
  updatedAt: string;
  /** How many times this skill has been used or referenced */
  useCount: number;
  /** Source of learning: manual input, log extraction, merge result */
  source: 'extracted' | 'manual' | 'merged';
  /** Optional: the orgId context this skill was learned from */
  orgId?: string;
  /** Optional: which server(s) this skill applies to */
  serverIds?: string[];
}

/**
 * A trajectory entry — represents a single operational event
 * that can be analyzed for skill extraction.
 */
export interface TrajectoryEntry {
  /** What the operator was trying to accomplish */
  task: string;
  /** Sequence of commands / actions taken */
  steps: TrajectoryStep[];
  /** Did the operation succeed? */
  success: boolean;
  /** When this happened */
  timestamp: string;
  /** Which server was involved */
  serverId?: string;
  /** Which org context */
  orgId?: string;
}

export interface TrajectoryStep {
  /** The command or action taken */
  command: string;
  /** stdout / result */
  output?: string;
  /** Was this step successful */
  success: boolean;
  /** Optional notes or error messages */
  notes?: string;
}

/**
 * Extraction result from the AI engine — before quality filtering.
 */
export interface ExtractionResult {
  action: SkillAction;
  skill: Omit<DevOpsSkill, 'id' | 'createdAt' | 'updatedAt' | 'useCount' | 'source'>;
  /** If modifying an existing skill, which one */
  modifiedFrom?: string;
  /** Reasoning from the AI for this decision */
  reasoning: string;
}

/**
 * The local skill knowledge base shape (persisted as JSON).
 */
export interface SkillStore {
  version: string;
  lastUpdated: string;
  skills: DevOpsSkill[];
}
