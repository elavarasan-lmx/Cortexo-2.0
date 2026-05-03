/**
 * Iron Law Verification Gate — lib/verification-gate.ts
 * Implements the 5-step verification before any completion claim.
 *
 * IRON LAW: No completion claim without passing all 5 gates.
 * Steps: Requirements → Implementation → Tests → Docs → Integration
 */

export interface VerificationStep {
  step: number;
  name: string;
  description: string;
  status: 'pending' | 'pass' | 'fail' | 'skip';
  evidence?: string;
  failReason?: string;
}

export interface VerificationReport {
  taskId: string;
  taskDescription: string;
  passed: boolean;
  gatesPassed: number;
  gatesTotal: number;
  steps: VerificationStep[];
  verdict: 'approved' | 'blocked' | 'partial';
  blockers: string[];
  timestamp: string;
}

const VERIFICATION_STEPS = [
  { step: 1, name: 'Requirements Check',    description: 'All stated requirements addressed; no scope creep; PRD alignment verified' },
  { step: 2, name: 'Implementation Check',  description: 'Code executes without runtime errors; logic is correct; edge cases handled' },
  { step: 3, name: 'Test Check',            description: 'Unit/integration tests pass; E2E verified; no regressions' },
  { step: 4, name: 'Documentation Check',  description: 'Code comments present; API documented; README updated if needed' },
  { step: 5, name: 'Integration Check',    description: 'Feature works end-to-end in the full system; DB, API, and UI aligned' },
];

interface TaskEvidence {
  taskId: string;
  taskDescription: string;
  requirementsMet: boolean;
  implementationWorking: boolean;
  testsPass: boolean;
  documentationPresent: boolean;
  integrationVerified: boolean;
  evidence?: {
    requirements?: string;
    implementation?: string;
    tests?: string;
    documentation?: string;
    integration?: string;
  };
}

export function runVerificationGate(input: TaskEvidence): VerificationReport {
  const steps: VerificationStep[] = [
    {
      step: 1,
      name: VERIFICATION_STEPS[0].name,
      description: VERIFICATION_STEPS[0].description,
      status: input.requirementsMet ? 'pass' : 'fail',
      evidence: input.evidence?.requirements,
      failReason: input.requirementsMet ? undefined : 'Requirements not fully addressed — check PRD alignment',
    },
    {
      step: 2,
      name: VERIFICATION_STEPS[1].name,
      description: VERIFICATION_STEPS[1].description,
      status: input.implementationWorking ? 'pass' : 'fail',
      evidence: input.evidence?.implementation,
      failReason: input.implementationWorking ? undefined : 'Implementation not verified — run the code and confirm output',
    },
    {
      step: 3,
      name: VERIFICATION_STEPS[2].name,
      description: VERIFICATION_STEPS[2].description,
      status: input.testsPass ? 'pass' : 'fail',
      evidence: input.evidence?.tests,
      failReason: input.testsPass ? undefined : 'Tests not passing — run test suite and fix failures',
    },
    {
      step: 4,
      name: VERIFICATION_STEPS[3].name,
      description: VERIFICATION_STEPS[3].description,
      status: input.documentationPresent ? 'pass' : 'skip',  // Docs can be skipped for internal changes
      evidence: input.evidence?.documentation,
    },
    {
      step: 5,
      name: VERIFICATION_STEPS[4].name,
      description: VERIFICATION_STEPS[4].description,
      status: input.integrationVerified ? 'pass' : 'fail',
      evidence: input.evidence?.integration,
      failReason: input.integrationVerified ? undefined : 'Integration not verified — test full end-to-end flow',
    },
  ];

  const passed = steps.filter(s => s.status === 'pass').length;
  const failed = steps.filter(s => s.status === 'fail').length;
  const blockers = steps.filter(s => s.status === 'fail').map(s => `Gate ${s.step} (${s.name}): ${s.failReason}`);

  // IRON LAW: Must pass gates 1, 2, 5 at minimum (requirements, implementation, integration)
  const criticalGates = [steps[0], steps[1], steps[4]];
  const criticalPassed = criticalGates.every(s => s.status === 'pass');

  return {
    taskId: input.taskId,
    taskDescription: input.taskDescription,
    passed: criticalPassed && failed === 0,
    gatesPassed: passed,
    gatesTotal: 5,
    steps,
    verdict: criticalPassed && failed === 0 ? 'approved' : criticalPassed ? 'partial' : 'blocked',
    blockers,
    timestamp: new Date().toISOString(),
  };
}

export function formatVerificationReport(report: VerificationReport): string {
  const icons: Record<string, string> = { pass: '✅', fail: '❌', pending: '⏳', skip: '⏭' };
  const lines = [
    `## Verification Gate Report`,
    `**Task:** ${report.taskDescription}`,
    `**Verdict:** ${report.verdict.toUpperCase()} (${report.gatesPassed}/${report.gatesTotal} gates passed)`,
    '',
    ...report.steps.map(s => `${icons[s.status]} **Gate ${s.step}: ${s.name}**${s.evidence ? ` — ${s.evidence}` : ''}${s.failReason ? `\n   ⚠ ${s.failReason}` : ''}`),
  ];
  if (report.blockers.length) {
    lines.push('', '### 🚫 Blockers', ...report.blockers.map(b => `- ${b}`));
  }
  return lines.join('\n');
}
