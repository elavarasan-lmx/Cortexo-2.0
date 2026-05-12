/**
 * Deploy Form Module — Component Barrel Export
 *
 * Modular deploy form split from the original 953-line monolith.
 * Components:
 *   - shared.tsx        → Styles, types, constants, Toggle, octalToRwx
 *   - deploy-terminal   → Live deployment terminal view
 *   - step-review       → Final review & deploy summary
 *   - step-project      → Step 0: Project & Server selection
 *   - step-nginx        → Step 1: Nginx configuration preview
 *   - step-database     → Step 2: Database configuration preview
 *   - step-pm2          → Step 3: PM2 configuration preview
 *   - deploy-form       → Main orchestrator (imports all sub-components)
 */

export { default as DeployTerminal } from './deploy-terminal';
export { default as StepReview } from './step-review';
export { default as StepProject } from './step-project';
export { default as StepNginx } from './step-nginx';
export { default as StepDatabase } from './step-database';
export { default as StepPm2 } from './step-pm2';
export { Toggle, STEPS, octalToRwx, inp, lbl, ta, g2, g3 } from './shared';
export type { DeployFormInitialData, FolderEntry } from './shared';

