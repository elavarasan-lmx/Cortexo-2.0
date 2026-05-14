// Cortexo Reports — Barrel Export
// Re-exports the report generation engine, style system, and PDF exporter.

export {
  generateReportHTML,
  generateTableHTML,
  badge,
  REPORT_CSS,
  type ReportSection,
  type ReportMetadata,
  type StatCard,
} from './report-styles.js';

export {
  generateTestRunReport,
  generateBugReport,
  generateAuditReport,
  generateDeploymentReport,
  generateFromJSON,
  type ReportType,
} from './report-generator.js';

export {
  exportToPDF,
  canExportPDF,
} from './pdf-exporter.js';
