import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects';
import { organizations } from './organizations';

/**
 * Load Test Runs — individual load test executions.
 * Stores configuration + aggregated results for each test run.
 */
export const loadTestRuns = pgTable(
  'load_test_runs',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id),
    orgId: uuid('org_id')
      .references(() => organizations.id),
    name: varchar('name', { length: 200 }),
    url: varchar('url', { length: 1000 }).notNull(),
    method: varchar('method', { length: 10 }).default('GET'),
    headers: jsonb('headers').$type<Record<string, string>>(),
    body: text('body'),
    concurrency: integer('concurrency').default(10),
    duration: integer('duration_seconds').default(10),
    timeout: integer('timeout_ms').default(10000),
    status: varchar('status', { length: 20 }).default('pending'),
    results: jsonb('results').$type<{
      totalRequests: number;
      successCount: number;
      failCount: number;
      avgLatency: number;
      minLatency: number;
      maxLatency: number;
      p50Latency: number;
      p95Latency: number;
      p99Latency: number;
      rps: number;
      errorRate: number;
      statusCodes: Record<string, number>;
      latencyBuckets: number[];
    }>(),
    startedAt: timestamp('started_at'),
    finishedAt: timestamp('finished_at'),
    durationMs: integer('duration_ms'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_load_runs_project').on(table.projectId),
    index('idx_load_runs_status').on(table.status),
    index('idx_load_runs_created').on(table.createdAt),
  ],
);

/**
 * Module Test Suites — reusable test configurations.
 * Each suite contains a base URL and a list of module endpoints to test.
 */
export const moduleTestSuites = pgTable(
  'module_test_suites',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id),
    name: varchar('name', { length: 200 }).notNull(),
    baseUrl: varchar('base_url', { length: 500 }).notNull(),
    modules: jsonb('modules').$type<Array<{
      name: string;
      endpoint: string;
      method?: string;
      expectedStatus?: number;
      headers?: Record<string, string>;
      body?: string;
    }>>(),
    lastRunAt: timestamp('last_run_at'),
    lastPassCount: integer('last_pass_count'),
    lastFailCount: integer('last_fail_count'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_suites_org').on(table.orgId)],
);

/**
 * Module Test Results — individual test execution results.
 * One row per module endpoint per test run.
 */
export const moduleTestResults = pgTable(
  'module_test_results',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),
    suiteId: uuid('suite_id')
      .references(() => moduleTestSuites.id)
      .notNull(),
    runId: uuid('run_id').notNull(),
    moduleName: varchar('module_name', { length: 200 }).notNull(),
    endpoint: varchar('endpoint', { length: 500 }).notNull(),
    method: varchar('method', { length: 10 }).default('GET'),
    status: varchar('status', { length: 20 }).default('pending'),
    latencyMs: integer('latency_ms'),
    statusCode: integer('status_code'),
    responseSize: integer('response_size'),
    error: text('error'),
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_results_suite').on(table.suiteId),
    index('idx_results_run').on(table.runId),
  ],
);

export type LoadTestRun = typeof loadTestRuns.$inferSelect;
export type NewLoadTestRun = typeof loadTestRuns.$inferInsert;
export type ModuleTestSuite = typeof moduleTestSuites.$inferSelect;
export type NewModuleTestSuite = typeof moduleTestSuites.$inferInsert;
export type ModuleTestResult = typeof moduleTestResults.$inferSelect;
export type NewModuleTestResult = typeof moduleTestResults.$inferInsert;

/**
 * Playwright / k6 Test Suites
 */
export const testSuites = pgTable(
  'test_suites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    name: varchar('name', { length: 200 }),
    type: varchar('type', { length: 30 }), // 'page-load'|'form'|'e2e'|'visual'|'performance'
    config: jsonb('config'),   // playwright config or k6 script
    schedule: varchar('schedule', { length: 50 }), // cron expression or null
    enabled: boolean('enabled').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('idx_test_suites_project').on(table.projectId)]
);

export const testRuns = pgTable(
  'test_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    suiteId: uuid('suite_id').references(() => testSuites.id).notNull(),
    triggeredBy: varchar('triggered_by', { length: 30 }), // 'deploy'|'schedule'|'manual'
    status: varchar('status', { length: 20 }).default('pending'),
    passed: integer('passed').default(0),
    failed: integer('failed').default(0),
    duration: integer('duration'), // ms
    screenshotUrl: text('screenshot_url'), // for visual regression
    reportJson: jsonb('report_json'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_test_runs_suite').on(table.suiteId),
    index('idx_test_runs_status').on(table.status)
  ]
);

export type TestSuite = typeof testSuites.$inferSelect;
export type NewTestSuite = typeof testSuites.$inferInsert;
export type TestRun = typeof testRuns.$inferSelect;
export type NewTestRun = typeof testRuns.$inferInsert;
