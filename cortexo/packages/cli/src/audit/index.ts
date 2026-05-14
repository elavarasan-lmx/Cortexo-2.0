// Cortexo Audit Module — Barrel export
// Aggregates dependency scanning, tech debt analysis, secrets detection,
// risk classification, and skill validation

export { scanDependencies, type DepScanResult, type DepEntry, type Vulnerability } from './dep-scanner.js';
export { scanTechDebt, type DebtScanResult, type DebtItem, type DebtType, type DebtConfig } from './debt-scanner.js';
export { scanSecrets, type SecretsScanResult, type SecretFinding } from './secrets-scanner.js';
export { classifyRisk, classifyBatch, type RiskLevel, type RiskSuggestion } from './risk-classifier.js';
export { validateSkillsDir, validateSingleSkill, type SkillValidationResult, type ValidationFinding } from './skill-validator.js';
