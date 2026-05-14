// Cortexo Report Styles — Design Token System & HTML Template
// Ported from frontend-slides Bold Signal preset + viewport-base.css
// Provides consistent, professional theming across all Cortexo reports

// ── Design Tokens ──────────────────────────────────────────────────────────

export const REPORT_CSS = `
/* ===========================================
   CORTEXO REPORT — DESIGN SYSTEM
   Ported from frontend-slides Bold Signal preset.
   Change :root variables to re-theme all reports.
   =========================================== */

:root {
  /* --- Colors (Bold Signal + DevOps Accent) --- */
  --bg-primary: #0f1117;
  --bg-secondary: #161922;
  --bg-card: #1c1f2e;
  --bg-card-hover: #242840;
  --border-color: #2a2e3f;
  --border-accent: #3b4060;

  --text-primary: #e8eaf0;
  --text-secondary: #9298a8;
  --text-muted: #5c6378;

  --accent-primary: #4f8cff;
  --accent-green: #2dd881;
  --accent-red: #ff5c6c;
  --accent-yellow: #ffb74d;
  --accent-orange: #ff8a50;
  --accent-purple: #a78bfa;
  --accent-cyan: #22d3ee;

  /* --- Typography (using clamp for responsiveness) --- */
  --font-display: 'Archivo Black', 'Inter', system-ui, sans-serif;
  --font-body: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;

  --title-size: clamp(1.75rem, 4vw, 3rem);
  --h2-size: clamp(1.25rem, 2.5vw, 1.75rem);
  --h3-size: clamp(1rem, 2vw, 1.35rem);
  --body-size: clamp(0.8rem, 1.2vw, 0.95rem);
  --small-size: clamp(0.7rem, 1vw, 0.85rem);
  --label-size: clamp(0.6rem, 0.8vw, 0.75rem);

  /* --- Spacing --- */
  --section-gap: clamp(1.5rem, 3vw, 3rem);
  --card-padding: clamp(1rem, 2vw, 1.5rem);
  --card-gap: clamp(0.75rem, 1.5vw, 1rem);
  --content-max-width: 1100px;

  /* --- Animation --- */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-normal: 0.6s;
}

/* --- Reset & Base --- */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  font-size: var(--body-size);
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: 1.6;
  padding: clamp(1rem, 3vw, 2.5rem);
}

/* --- Layout Container --- */
.report-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

/* ===========================================
   HEADER
   =========================================== */
.report-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--section-gap);
  margin-bottom: var(--section-gap);
}

.report-header h1 {
  font-family: var(--font-display);
  font-size: var(--title-size);
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.report-header .subtitle {
  font-size: var(--h3-size);
  color: var(--text-secondary);
  font-weight: 400;
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
}

.report-meta .meta-item {
  font-size: var(--small-size);
  color: var(--text-muted);
}

.report-meta .meta-item strong {
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===========================================
   SUMMARY DASHBOARD (top stats cards)
   =========================================== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: var(--card-gap);
  margin-bottom: var(--section-gap);
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: var(--card-padding);
  transition: border-color 0.25s ease, transform 0.25s ease;
}

.stat-card:hover {
  border-color: var(--border-accent);
  transform: translateY(-2px);
}

.stat-card .stat-label {
  font-size: var(--label-size);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
}

.stat-card .stat-value {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 900;
  line-height: 1;
}

.stat-card .stat-value.green { color: var(--accent-green); }
.stat-card .stat-value.red { color: var(--accent-red); }
.stat-card .stat-value.yellow { color: var(--accent-yellow); }
.stat-card .stat-value.blue { color: var(--accent-primary); }
.stat-card .stat-value.purple { color: var(--accent-purple); }
.stat-card .stat-value.cyan { color: var(--accent-cyan); }

/* ===========================================
   SECTION HEADINGS
   =========================================== */
.report-section {
  margin-bottom: var(--section-gap);
}

.report-section h2 {
  font-family: var(--font-display);
  font-size: var(--h2-size);
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-section h2 .section-icon {
  font-size: 1.2em;
}

.report-section h3 {
  font-size: var(--h3-size);
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

/* ===========================================
   DATA TABLE
   =========================================== */
.data-table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--body-size);
}

.data-table thead th {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: var(--label-size);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table tbody tr {
  transition: background 0.15s ease;
}

.data-table tbody tr:hover {
  background: var(--bg-card-hover);
}

.data-table tbody td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* ===========================================
   SEVERITY BADGES
   =========================================== */
.badge {
  display: inline-block;
  padding: 0.15em 0.55em;
  border-radius: 4px;
  font-size: var(--label-size);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge.critical { background: rgba(255, 92, 108, 0.18); color: var(--accent-red); border: 1px solid rgba(255, 92, 108, 0.3); }
.badge.high     { background: rgba(255, 138, 80, 0.18); color: var(--accent-orange); border: 1px solid rgba(255, 138, 80, 0.3); }
.badge.medium   { background: rgba(255, 183, 77, 0.18); color: var(--accent-yellow); border: 1px solid rgba(255, 183, 77, 0.3); }
.badge.low      { background: rgba(45, 216, 129, 0.18); color: var(--accent-green); border: 1px solid rgba(45, 216, 129, 0.3); }
.badge.info     { background: rgba(79, 140, 255, 0.18); color: var(--accent-primary); border: 1px solid rgba(79, 140, 255, 0.3); }
.badge.pass     { background: rgba(45, 216, 129, 0.18); color: var(--accent-green); border: 1px solid rgba(45, 216, 129, 0.3); }
.badge.fail     { background: rgba(255, 92, 108, 0.18); color: var(--accent-red); border: 1px solid rgba(255, 92, 108, 0.3); }
.badge.skip     { background: rgba(92, 99, 120, 0.18); color: var(--text-muted); border: 1px solid rgba(92, 99, 120, 0.3); }

/* ===========================================
   ANIMATIONS (from frontend-slides)
   =========================================== */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--duration-normal) var(--ease-out-expo),
              transform var(--duration-normal) var(--ease-out-expo);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal:nth-child(1) { transition-delay: 0.05s; }
.reveal:nth-child(2) { transition-delay: 0.1s; }
.reveal:nth-child(3) { transition-delay: 0.15s; }
.reveal:nth-child(4) { transition-delay: 0.2s; }
.reveal:nth-child(5) { transition-delay: 0.25s; }
.reveal:nth-child(6) { transition-delay: 0.3s; }

/* ===========================================
   FOOTER
   =========================================== */
.report-footer {
  margin-top: var(--section-gap);
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--small-size);
}

.report-footer a {
  color: var(--accent-primary);
  text-decoration: none;
}

/* ===========================================
   RESPONSIVE BREAKPOINTS
   =========================================== */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .report-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

/* ===========================================
   REDUCED MOTION
   =========================================== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.15s !important;
  }
  html { scroll-behavior: auto; }
}

/* ===========================================
   PRINT STYLES
   =========================================== */
@media print {
  body { background: #fff; color: #1a1a1a; padding: 0; }
  .report-container { max-width: 100%; }
  .stat-card { border-color: #ddd; }
  .data-table thead th { background: #f0f0f0; color: #333; }
  .data-table tbody tr:hover { background: transparent; }
  .reveal { opacity: 1 !important; transform: none !important; }
}
`;

// ── HTML Template Generator ─────────────────────────────────────────────────

export interface ReportSection {
  title: string;
  icon?: string;
  content: string;  // raw HTML for section body
}

export interface ReportMetadata {
  generatedAt: string;
  generatedBy?: string;
  server?: string;
  version?: string;
  orgId?: string;
  [key: string]: string | undefined;
}

export interface StatCard {
  label: string;
  value: string | number;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'cyan';
}

/**
 * Generate a complete, self-contained HTML report.
 * Zero dependencies — all CSS/JS inline. Works in any browser.
 */
export function generateReportHTML(opts: {
  title: string;
  subtitle?: string;
  metadata: ReportMetadata;
  stats?: StatCard[];
  sections: ReportSection[];
}): string {
  const { title, subtitle, metadata, stats, sections } = opts;

  // Build metadata row
  const metaHtml = Object.entries(metadata)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `<span class="meta-item"><strong>${escapeHtml(formatLabel(k))}:</strong> ${escapeHtml(v!)}</span>`)
    .join('\n            ');

  // Build stats dashboard
  const statsHtml = stats && stats.length > 0
    ? `
        <div class="summary-grid reveal">
          ${stats.map(s => `
          <div class="stat-card">
            <div class="stat-label">${escapeHtml(s.label)}</div>
            <div class="stat-value ${s.color ?? ''}">${escapeHtml(String(s.value))}</div>
          </div>`).join('')}
        </div>`
    : '';

  // Build sections
  const sectionsHtml = sections.map(s => `
        <section class="report-section reveal">
          <h2>${s.icon ? `<span class="section-icon">${s.icon}</span> ` : ''}${escapeHtml(s.title)}</h2>
          ${s.content}
        </section>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} — Cortexo Report</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <style>${REPORT_CSS}</style>
  </head>
  <body>
    <div class="report-container">

      <!-- Header -->
      <header class="report-header reveal">
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
        <div class="report-meta">
          ${metaHtml}
        </div>
      </header>

      <!-- Summary Stats -->
      ${statsHtml}

      <!-- Report Sections -->
      ${sectionsHtml}

      <!-- Footer -->
      <footer class="report-footer reveal">
        Generated by <strong>Cortexo DevOps Platform</strong> &middot;
        ${escapeHtml(metadata.generatedAt)}
      </footer>

    </div>

    <!-- Scroll-triggered reveal animation (from frontend-slides) -->
    <script>
      (function() {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      })();
    </script>
  </body>
</html>`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate an HTML data table from row objects */
export function generateTableHTML(
  headers: { key: string; label: string }[],
  rows: Record<string, unknown>[],
): string {
  const headHtml = headers.map(h => `<th>${escapeHtml(h.label)}</th>`).join('');
  const bodyHtml = rows.map(row => {
    const cells = headers.map(h => {
      const val = row[h.key];
      return `<td>${formatCellValue(val)}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n');

  return `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead><tr>${headHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>`;
}

/** Generate a severity badge */
export function badge(text: string, level: string): string {
  return `<span class="badge ${level.toLowerCase()}">${escapeHtml(text)}</span>`;
}

function formatCellValue(val: unknown): string {
  if (val === null || val === undefined) return '<span style="color:var(--text-muted)">—</span>';
  if (typeof val === 'boolean') return val ? badge('PASS', 'pass') : badge('FAIL', 'fail');
  return escapeHtml(String(val));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}
