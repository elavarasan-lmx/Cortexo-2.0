// Cortexo PDF Exporter — HTML → PDF via Playwright
// Ported from frontend-slides/scripts/export-pdf.sh → TypeScript
// Reuses existing Playwright infrastructure from browser-helpers.ts

import { existsSync, mkdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { homedir } from 'node:os';
import { isPlaywrightInstalled, executePlaywrightScript } from '../testing/browser-helpers.js';
import http from 'node:http';

const REPORTS_DIR = join(homedir(), '.cortexo', 'reports');

interface ExportOptions {
  /** Path to the HTML file to export */
  htmlPath: string;
  /** Custom output path for the PDF */
  outputPath?: string;
  /** Use compact 1280×720 viewport instead of 1920×1080 */
  compact?: boolean;
  /** Paper format for PDF generation */
  format?: 'A4' | 'Letter' | 'A3';
  /** Include background graphics in PDF */
  printBackground?: boolean;
}

interface ExportResult {
  success: boolean;
  pdfPath?: string;
  error?: string;
  durationMs: number;
}

/**
 * Export an HTML report to PDF using Playwright's headless Chromium.
 *
 * Strategy (ported from frontend-slides export-pdf.sh):
 * 1. Start a local HTTP server to serve the HTML file (fonts/JS require HTTP)
 * 2. Navigate Playwright to the served page
 * 3. Wait for animations to settle
 * 4. Use page.pdf() for native vector PDF generation
 * 5. Cleanup server
 */
export async function exportToPDF(opts: ExportOptions): Promise<ExportResult> {
  const startTime = Date.now();

  // ── Preflight ───────────────────────────────────────────────────────
  if (!existsSync(opts.htmlPath)) {
    return { success: false, error: `HTML file not found: ${opts.htmlPath}`, durationMs: 0 };
  }

  if (!isPlaywrightInstalled()) {
    return {
      success: false,
      error: 'Playwright is not installed. Run: npx playwright install chromium',
      durationMs: 0,
    };
  }

  const htmlPath = resolve(opts.htmlPath);
  const htmlDir = dirname(htmlPath);
  const htmlFilename = basename(htmlPath);

  // Determine output path
  const outputDir = opts.outputPath ? dirname(resolve(opts.outputPath)) : REPORTS_DIR;
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const pdfFilename = opts.outputPath
    ? basename(opts.outputPath)
    : htmlFilename.replace(/\.html?$/, '.pdf');
  const pdfPath = opts.outputPath ? resolve(opts.outputPath) : join(outputDir, pdfFilename);

  const viewport = opts.compact
    ? { width: 1280, height: 720 }
    : { width: 1920, height: 1080 };

  const format = opts.format ?? 'A4';
  const printBackground = opts.printBackground ?? true;

  // ── Serve + Export (via Playwright script) ──────────────────────────
  // We generate a Playwright script that:
  // 1. Serves the HTML directory on a local port
  // 2. Navigates to the file
  // 3. Waits for fonts + animations
  // 4. Exports PDF
  const script = generatePdfExportScript({
    htmlDir,
    htmlFilename,
    pdfPath,
    viewport,
    format,
    printBackground,
  });

  const result = executePlaywrightScript(script, {
    headless: true,
    timeout: 60_000,
    cwd: htmlDir,
  });

  const durationMs = Date.now() - startTime;

  if (result.success && existsSync(pdfPath)) {
    const sizeBytes = statSync(pdfPath).size;
    return {
      success: true,
      pdfPath,
      durationMs,
    };
  }

  return {
    success: false,
    error: result.error || 'PDF generation failed — check Playwright installation.',
    durationMs,
  };
}

/**
 * Quick check: can we run PDF export?
 */
export function canExportPDF(): { ok: boolean; reason?: string } {
  if (!isPlaywrightInstalled()) {
    return { ok: false, reason: 'Playwright is not installed. Run: npx playwright install chromium' };
  }
  return { ok: true };
}

// ── Playwright Script Generator ─────────────────────────────────────────────

function generatePdfExportScript(opts: {
  htmlDir: string;
  htmlFilename: string;
  pdfPath: string;
  viewport: { width: number; height: number };
  format: string;
  printBackground: boolean;
}): string {
  // Escape paths for JS strings
  const htmlDir = opts.htmlDir.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const htmlFilename = opts.htmlFilename.replace(/'/g, "\\'");
  const pdfPath = opts.pdfPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  return `
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Minimal static file server (from frontend-slides export-pdf.sh strategy)
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const HTML_DIR = '${htmlDir}';
const server = http.createServer((req, res) => {
  let filePath = path.join(HTML_DIR, req.url === '/' ? '${htmlFilename}' : req.url);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (e) {
    res.writeHead(500);
    res.end('Error');
  }
});

(async () => {
  // Find an available port
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  const url = 'http://127.0.0.1:' + port + '/${htmlFilename}';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: ${opts.viewport.width}, height: ${opts.viewport.height} },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    // Navigate and wait for content
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for fonts to load (critical for professional reports)
    await page.evaluate(() => document.fonts.ready);

    // Wait for reveal animations to settle
    await page.waitForTimeout(1500);

    // Trigger all reveals to visible (so PDF captures fully rendered content)
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });

    await page.waitForTimeout(500);

    // Generate PDF
    await page.pdf({
      path: '${pdfPath}',
      format: '${opts.format}',
      printBackground: ${opts.printBackground},
      margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' },
    });

    console.log(JSON.stringify({ success: true, pdfPath: '${pdfPath}' }));
  } catch (error) {
    console.error('PDF_ERROR:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
})();
`;
}
