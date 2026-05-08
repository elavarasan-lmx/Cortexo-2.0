import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const securityScans = pgTable(
  'security_scans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    type: varchar('type', { length: 30 }), // 'dependency'|'secret'
    status: varchar('status', { length: 20 }).default('pending'),
    criticalCount: integer('critical_count').default(0),
    highCount: integer('high_count').default(0),
    mediumCount: integer('medium_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_security_scans_project').on(table.projectId),
    index('idx_security_scans_status').on(table.status)
  ]
);

export const securityFindings = pgTable(
  'security_findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scanId: uuid('scan_id').references(() => securityScans.id).notNull(),
    type: varchar('type', { length: 30 }),      // 'vulnerability'|'secret'
    severity: varchar('severity', { length: 20 }), // critical, high, medium, low
    package: varchar('package', { length: 200 }),
    installedVersion: varchar('installed_version', { length: 50 }),
    fixedVersion: varchar('fixed_version', { length: 50 }),
    cveId: varchar('cve_id', { length: 30 }),
    description: text('description'),
    file: text('file'),
    line: integer('line'),
    secretType: varchar('secret_type', { length: 50 }), // 'api-key'|'password'|'ssh-key'
    status: varchar('status', { length: 20 }).default('open'), // open|ignored|fixed
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_security_findings_scan').on(table.scanId),
    index('idx_security_findings_status').on(table.status)
  ]
);

export type SecurityScan = typeof securityScans.$inferSelect;
export type NewSecurityScan = typeof securityScans.$inferInsert;
export type SecurityFinding = typeof securityFindings.$inferSelect;
export type NewSecurityFinding = typeof securityFindings.$inferInsert;
