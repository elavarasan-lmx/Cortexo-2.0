import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join, resolve, extname, relative } from 'path';
import { homedir } from 'os';

const execFileAsync = promisify(execFile);

/**
 * Validate that a string is safe for use in shell contexts.
 * Rejects characters that could enable command injection.
 */
export function validateShellSafe(input: string, fieldName: string): void {
  const dangerous = /[;|&$`"'\\\\\\n\\r(){}\\[\\]<>!#~]/;
  if (dangerous.test(input)) {
    throw new Error(`Invalid characters in ${fieldName}`);
  }
}

/** Resolve ~ to home directory */
export function expandHome(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return join(homedir(), p.slice(1));
  }
  return p;
}

/** Check if a path is currently mounted via SSHFS (async — no user input in command) */
export async function isMounted(localPath: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('mount', [], { encoding: 'utf-8', timeout: 5000 });
    return (stdout || '').includes(expandHome(localPath));
  } catch {
    return false;
  }
}

/** Prevent directory traversal — ensure resolved path is within the mount */
export function safePath(basePath: string, requestedPath: string): string {
  const base = resolve(expandHome(basePath));
  const target = resolve(base, requestedPath);
  if (!target.startsWith(base)) {
    throw new Error('Path traversal detected');
  }
  return target;
}

/** Get file type icon hint based on extension */
export function getFileType(name: string): string {
  const ext = extname(name).toLowerCase();
  const map: Record<string, string> = {
    '.php': 'php', '.js': 'javascript', '.ts': 'typescript', '.jsx': 'react',
    '.tsx': 'react', '.css': 'css', '.scss': 'scss', '.html': 'html',
    '.json': 'json', '.xml': 'xml', '.sql': 'sql', '.md': 'markdown',
    '.yml': 'yaml', '.yaml': 'yaml', '.sh': 'shell', '.py': 'python',
    '.rb': 'ruby', '.java': 'java', '.go': 'go', '.rs': 'rust',
    '.dart': 'dart', '.swift': 'swift', '.kt': 'kotlin',
    '.png': 'image', '.jpg': 'image', '.jpeg': 'image', '.gif': 'image',
    '.svg': 'image', '.webp': 'image', '.ico': 'image',
    '.pdf': 'pdf', '.zip': 'archive', '.tar': 'archive', '.gz': 'archive',
    '.env': 'config', '.gitignore': 'config', '.htaccess': 'config',
  };
  return map[ext] || 'file';
}

export { execFileAsync };
