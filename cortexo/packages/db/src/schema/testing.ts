import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Test Targets — Client deployments to test against.
 * Each target represents a deployed instance of the bullion trading platform.
 */
export const testTargets = pgTable(
  'test_targets',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    baseUrl: varchar('base_url', { length: 500 }).notNull(),
    environment: varchar('environment', { length: 30 }).default('staging'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('test_targets_name_idx').on(t.name)]
);

/**
 * Test Cases — Individual test endpoints (auto-discovered or manual).
 * Stores endpoint path, method, expected behavior.
 *
 * testType:
 *  - 'endpoint' = Level 1: simple HTTP status check
 *  - 'schema'   = Level 1+: validates response JSON schema
 *  - 'flow'     = Level 2: part of a business flow
 *  - 'security' = Level 3: security/auth bypass check
 *
 * businessModule — maps to the platform's business domain:
 *  auth, rates, trading, delivery, margin, kyc, reports, notifications, config, admin
 */
export const testCases = pgTable(
  'test_cases',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 300 }).notNull(),
    endpoint: varchar('endpoint', { length: 500 }).notNull(),
    method: varchar('method', { length: 10 }).default('GET').notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    payload: jsonb('payload'),
    expectedStatus: integer('expected_status').default(200),
    expectedContains: varchar('expected_contains', { length: 500 }),
    priority: varchar('priority', { length: 20 }).default('medium'),
    sourceFile: varchar('source_file', { length: 500 }),
    isAuto: boolean('is_auto').default(true),
    isActive: boolean('is_active').default(true),
    // Level 2/3 fields
    testType: varchar('test_type', { length: 20 }).default('endpoint'),
    businessModule: varchar('business_module', { length: 30 }),
    businessSeverity: varchar('business_severity', { length: 20 }),
    expectedSchema: jsonb('expected_schema'), // JSON schema validation for response
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('test_cases_category_idx').on(t.category),
    index('test_cases_endpoint_idx').on(t.endpoint),
    index('test_cases_test_type_idx').on(t.testType),
    index('test_cases_module_idx').on(t.businessModule),
  ]
);

/**
 * Test Runs — Each execution of a test suite against a target.
 * Now includes runType to distinguish endpoint/flow/security/full runs.
 */
export const testRuns = pgTable(
  'test_runs',
  {
    id: serial('id').primaryKey(),
    targetId: integer('target_id').notNull(),
    status: varchar('status', { length: 20 }).default('running').notNull(),
    runType: varchar('run_type', { length: 20 }).default('endpoint'), // endpoint, flow, security, full
    total: integer('total').default(0),
    passed: integer('passed').default(0),
    failed: integer('failed').default(0),
    skipped: integer('skipped').default(0),
    durationMs: integer('duration_ms').default(0),
    triggeredBy: varchar('triggered_by', { length: 100 }).default('manual'),
    summary: jsonb('summary'), // detailed summary per level
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('test_runs_target_idx').on(t.targetId),
    index('test_runs_created_idx').on(t.createdAt),
  ]
);

/**
 * Test Results — Per-endpoint result within a run.
 * Enhanced with business context fields.
 */
export const testResults = pgTable(
  'test_results',
  {
    id: serial('id').primaryKey(),
    runId: integer('run_id').notNull(),
    caseId: integer('case_id').notNull(),
    status: varchar('status', { length: 20 }).notNull(), // passed, failed, skipped, error
    statusCode: integer('status_code'),
    latencyMs: integer('latency_ms'),
    responseBody: text('response_body'),
    error: text('error'),
    // Level 2/3 enrichment
    testLevel: varchar('test_level', { length: 10 }).default('L1'), // L1, L2, L3
    businessModule: varchar('business_module', { length: 30 }),
    businessSeverity: varchar('business_severity', { length: 20 }),
    schemaValid: boolean('schema_valid'),
    schemaErrors: jsonb('schema_errors'),
    securityIssue: varchar('security_issue', { length: 100 }),
    flowStep: integer('flow_step'),
    flowName: varchar('flow_name', { length: 200 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('test_results_run_idx').on(t.runId),
    index('test_results_case_idx').on(t.caseId),
    index('test_results_level_idx').on(t.testLevel),
  ]
);

export type TestTarget = InferSelectModel<typeof testTargets>;
export type NewTestTarget = InferInsertModel<typeof testTargets>;
export type TestCase = InferSelectModel<typeof testCases>;
export type NewTestCase = InferInsertModel<typeof testCases>;
export type TestRun = InferSelectModel<typeof testRuns>;
export type NewTestRun = InferInsertModel<typeof testRuns>;
export type TestResult = InferSelectModel<typeof testResults>;
export type NewTestResult = InferInsertModel<typeof testResults>;
