import {
  mysqlTable,
  char,
  varchar,
  text,
  int,
  boolean,
  datetime,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects';
import { organizations } from './organizations';

/**
 * Load Test Runs — individual load test executions.
 * Stores configuration + aggregated results for each test run.
 */
export const loadTestRuns = mysqlTable(
  'load_test_runs',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: char('project_id', { length: 36 })
      .references(() => projects.id),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id),
    name: varchar('name', { length: 200 }),
    url: varchar('url', { length: 1000 }).notNull(),
    method: varchar('method', { length: 10 }).default('GET'),
    headers: json('headers').$type<Record<string, string>>(),
    body: text('body'),
    concurrency: int('concurrency').default(10),
    duration: int('duration_seconds').default(10),
    timeout: int('timeout_ms').default(10000),
    status: varchar('status', { length: 20 }).default('pending'),
    results: json('results').$type<{
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
    startedAt: datetime('started_at'),
    finishedAt: datetime('finished_at'),
    durationMs: int('duration_ms'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
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
export const moduleTestSuites = mysqlTable(
  'module_test_suites',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: char('org_id', { length: 36 })
      .references(() => organizations.id),
    name: varchar('name', { length: 200 }).notNull(),
    baseUrl: varchar('base_url', { length: 500 }).notNull(),
    modules: json('modules').$type<Array<{
      name: string;
      endpoint: string;
      method?: string;
      expectedStatus?: number;
      headers?: Record<string, string>;
      body?: string;
    }>>(),
    lastRunAt: datetime('last_run_at'),
    lastPassCount: int('last_pass_count'),
    lastFailCount: int('last_fail_count'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime('updated_at')
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index('idx_suites_org').on(table.orgId)],
);

/**
 * Module Test Results — individual test execution results.
 * One row per module endpoint per test run.
 */
export const moduleTestResults = mysqlTable(
  'module_test_results',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    suiteId: char('suite_id', { length: 36 })
      .references(() => moduleTestSuites.id)
      .notNull(),
    runId: char('run_id', { length: 36 }).notNull(),
    moduleName: varchar('module_name', { length: 200 }).notNull(),
    endpoint: varchar('endpoint', { length: 500 }).notNull(),
    method: varchar('method', { length: 10 }).default('GET'),
    status: varchar('status', { length: 20 }).default('pending'),
    latencyMs: int('latency_ms'),
    statusCode: int('status_code'),
    responseSize: int('response_size'),
    error: text('error'),
    createdAt: datetime('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
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
