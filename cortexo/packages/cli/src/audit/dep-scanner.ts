// Cortexo Dependency Scanner — Zero-dependency multi-ecosystem audit tool
// Ported from claude-skills/engineering/dependency-auditor, adapted to TypeScript

import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Vulnerability {
  id: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number;
  affectedVersions: string;
  fixedVersion: string | null;
}

export interface DepEntry {
  name: string;
  version: string;
  ecosystem: string;
  direct: boolean;
  vulnerabilities: Vulnerability[];
}

export interface DepScanResult {
  root: string;
  totalDependencies: number;
  directDeps: number;
  transitDeps: number;
  ecosystems: string[];
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  dependencies: DepEntry[];
  scannedAt: string;
}

// ── Built-in Vulnerability Database (high-signal patterns) ──────────────────

const KNOWN_VULNS: Record<string, Vulnerability[]> = {
  lodash: [
    { id: 'CVE-2021-23337', summary: 'Prototype pollution in lodash', severity: 'HIGH', cvssScore: 7.2, affectedVersions: '<4.17.21', fixedVersion: '4.17.21' },
  ],
  axios: [
    { id: 'CVE-2023-45857', summary: 'CSRF bypass in axios', severity: 'MEDIUM', cvssScore: 6.1, affectedVersions: '>=1.0.0 <1.6.0', fixedVersion: '1.6.0' },
  ],
  'json5': [
    { id: 'CVE-2022-46175', summary: 'Prototype pollution in JSON5', severity: 'HIGH', cvssScore: 7.1, affectedVersions: '<2.2.2', fixedVersion: '2.2.2' },
  ],
  minimist: [
    { id: 'CVE-2021-44906', summary: 'Prototype pollution in minimist', severity: 'CRITICAL', cvssScore: 9.8, affectedVersions: '<1.2.6', fixedVersion: '1.2.6' },
  ],
  'node-fetch': [
    { id: 'CVE-2022-0235', summary: 'Exposure of sensitive info to unauthorized actor', severity: 'HIGH', cvssScore: 6.1, affectedVersions: '<2.6.7', fixedVersion: '2.6.7' },
  ],
  'express': [
    { id: 'CVE-2024-29041', summary: 'Open redirect in Express', severity: 'MEDIUM', cvssScore: 6.1, affectedVersions: '<4.19.2', fixedVersion: '4.19.2' },
  ],
  jsonwebtoken: [
    { id: 'CVE-2022-23529', summary: 'Insecure default algorithm in jsonwebtoken', severity: 'HIGH', cvssScore: 7.6, affectedVersions: '<9.0.0', fixedVersion: '9.0.0' },
  ],
  semver: [
    { id: 'CVE-2022-25883', summary: 'ReDoS vulnerability in semver', severity: 'MEDIUM', cvssScore: 5.3, affectedVersions: '<7.5.2', fixedVersion: '7.5.2' },
  ],
  // Python ecosystem
  requests: [
    { id: 'CVE-2023-32681', summary: 'Unintended leak of Proxy-Auth header', severity: 'MEDIUM', cvssScore: 6.1, affectedVersions: '<2.31.0', fixedVersion: '2.31.0' },
  ],
  django: [
    { id: 'CVE-2024-27351', summary: 'Potential ReDoS in django.utils.text.truncator', severity: 'MEDIUM', cvssScore: 5.3, affectedVersions: '<4.2.10', fixedVersion: '4.2.10' },
  ],
  flask: [
    { id: 'CVE-2023-30861', summary: 'Session cookie set even if session is not modified', severity: 'HIGH', cvssScore: 7.5, affectedVersions: '<2.3.2', fixedVersion: '2.3.2' },
  ],
};

// ── Parsers ─────────────────────────────────────────────────────────────────

function parsePackageJson(filePath: string): DepEntry[] {
  const deps: DepEntry[] = [];
  try {
    const pkg = JSON.parse(readFileSync(filePath, 'utf-8'));
    const addDeps = (section: Record<string, string> | undefined, direct: boolean) => {
      if (!section) return;
      for (const [name, version] of Object.entries(section)) {
        deps.push({
          name,
          version: version.replace(/^[\^~>=<]+/, ''),
          ecosystem: 'npm',
          direct,
          vulnerabilities: matchVulnerabilities(name, version),
        });
      }
    };
    addDeps(pkg.dependencies, true);
    addDeps(pkg.devDependencies, false);
    addDeps(pkg.peerDependencies, false);
  } catch { /* skip malformed */ }
  return deps;
}

function parseRequirementsTxt(filePath: string): DepEntry[] {
  const deps: DepEntry[] = [];
  try {
    const lines = readFileSync(filePath, 'utf-8').split('\n');
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || line.startsWith('-')) continue;

      // Handle: package==1.0.0, package>=1.0.0, package~=1.0.0
      const match = line.match(/^([a-zA-Z0-9_.-]+)\s*([>=<~!]+)?\s*([\d.]+)?/);
      if (match) {
        const name = match[1];
        const version = match[3] ?? 'latest';
        deps.push({
          name,
          version,
          ecosystem: 'pypi',
          direct: true,
          vulnerabilities: matchVulnerabilities(name, version),
        });
      }
    }
  } catch { /* skip */ }
  return deps;
}

function parseGoMod(filePath: string): DepEntry[] {
  const deps: DepEntry[] = [];
  try {
    const content = readFileSync(filePath, 'utf-8');
    const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/);
    if (requireBlock) {
      const lines = requireBlock[1].split('\n');
      for (const line of lines) {
        const match = line.trim().match(/^(\S+)\s+v?([\d.]+\S*)/);
        if (match) {
          const name = match[1].split('/').pop() ?? match[1];
          deps.push({
            name,
            version: match[2],
            ecosystem: 'go',
            direct: !line.includes('// indirect'),
            vulnerabilities: matchVulnerabilities(name, match[2]),
          });
        }
      }
    }
  } catch { /* skip */ }
  return deps;
}

function parseCargoToml(filePath: string): DepEntry[] {
  const deps: DepEntry[] = [];
  try {
    const content = readFileSync(filePath, 'utf-8');
    // Simple TOML parser for [dependencies] section
    const depSection = content.match(/\[dependencies\]([\s\S]*?)(?:\[|$)/);
    if (depSection) {
      const lines = depSection[1].split('\n');
      for (const line of lines) {
        // name = "version" or name = { version = "x.y.z" }
        const simple = line.match(/^(\w[\w-]*)\s*=\s*"([^"]+)"/);
        if (simple) {
          deps.push({
            name: simple[1],
            version: simple[2].replace(/^[\^~>=<]+/, ''),
            ecosystem: 'cargo',
            direct: true,
            vulnerabilities: matchVulnerabilities(simple[1], simple[2]),
          });
          continue;
        }
        const complex = line.match(/^(\w[\w-]*)\s*=\s*\{.*version\s*=\s*"([^"]+)"/);
        if (complex) {
          deps.push({
            name: complex[1],
            version: complex[2].replace(/^[\^~>=<]+/, ''),
            ecosystem: 'cargo',
            direct: true,
            vulnerabilities: matchVulnerabilities(complex[1], complex[2]),
          });
        }
      }
    }
  } catch { /* skip */ }
  return deps;
}

function parseGemfile(filePath: string): DepEntry[] {
  const deps: DepEntry[] = [];
  try {
    const lines = readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/);
      if (match) {
        deps.push({
          name: match[1],
          version: match[2]?.replace(/^[~>=<]+\s*/, '') ?? 'latest',
          ecosystem: 'rubygems',
          direct: true,
          vulnerabilities: matchVulnerabilities(match[1], match[2] ?? ''),
        });
      }
    }
  } catch { /* skip */ }
  return deps;
}

function parseComposerJson(filePath: string): DepEntry[] {
  const deps: DepEntry[] = [];
  try {
    const pkg = JSON.parse(readFileSync(filePath, 'utf-8'));
    const addDeps = (section: Record<string, string> | undefined, direct: boolean) => {
      if (!section) return;
      for (const [name, version] of Object.entries(section)) {
        if (name.startsWith('php') || name.startsWith('ext-')) continue;
        deps.push({
          name,
          version: version.replace(/^[\^~>=<]+/, ''),
          ecosystem: 'composer',
          direct,
          vulnerabilities: matchVulnerabilities(name, version),
        });
      }
    };
    addDeps(pkg.require, true);
    addDeps(pkg['require-dev'], false);
  } catch { /* skip */ }
  return deps;
}

// ── Version Matching ────────────────────────────────────────────────────────

function matchVulnerabilities(pkgName: string, version: string): Vulnerability[] {
  const normalized = pkgName.toLowerCase();
  return KNOWN_VULNS[normalized] ?? [];
}

// ── File Discovery ──────────────────────────────────────────────────────────

const PARSERS: Record<string, (path: string) => DepEntry[]> = {
  'package.json': parsePackageJson,
  'requirements.txt': parseRequirementsTxt,
  'go.mod': parseGoMod,
  'Cargo.toml': parseCargoToml,
  'Gemfile': parseGemfile,
  'composer.json': parseComposerJson,
};

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'vendor',
  '.next', 'coverage', '__pycache__', '.venv', 'venv',
]);

function* walkDir(dir: string, depth = 0, maxDepth = 3): Generator<string> {
  if (depth > maxDepth) return;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          yield* walkDir(fullPath, depth + 1, maxDepth);
        } else if (PARSERS[entry]) {
          yield fullPath;
        }
      } catch { /* permission denied, etc */ }
    }
  } catch { /* skip unreadable dirs */ }
}

// ── Main Scanner ────────────────────────────────────────────────────────────

export function scanDependencies(rootDir: string): DepScanResult {
  const allDeps: DepEntry[] = [];
  const ecosystems = new Set<string>();

  for (const filePath of walkDir(rootDir)) {
    const fileName = basename(filePath);
    const parser = PARSERS[fileName];
    if (parser) {
      const deps = parser(filePath);
      for (const dep of deps) {
        ecosystems.add(dep.ecosystem);
        allDeps.push(dep);
      }
    }
  }

  // Deduplicate by name+ecosystem
  const seen = new Map<string, DepEntry>();
  for (const dep of allDeps) {
    const key = `${dep.ecosystem}:${dep.name}`;
    if (!seen.has(key)) {
      seen.set(key, dep);
    }
  }
  const uniqueDeps = Array.from(seen.values());

  const vulnCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const dep of uniqueDeps) {
    for (const v of dep.vulnerabilities) {
      const sev = v.severity.toLowerCase() as keyof typeof vulnCounts;
      if (sev in vulnCounts) vulnCounts[sev]++;
    }
  }

  return {
    root: rootDir,
    totalDependencies: uniqueDeps.length,
    directDeps: uniqueDeps.filter(d => d.direct).length,
    transitDeps: uniqueDeps.filter(d => !d.direct).length,
    ecosystems: Array.from(ecosystems),
    vulnerabilities: vulnCounts,
    dependencies: uniqueDeps,
    scannedAt: new Date().toISOString(),
  };
}
