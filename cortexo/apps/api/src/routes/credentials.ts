/**
 * Credentials Vault API — /v1/credentials
 * Encrypted storage for tokens, API keys, SSH keys, and cloud credentials.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const VAULT_DIR = path.resolve(process.env.VAULT_DIR || '.vault');
const VAULT_FILE = path.join(VAULT_DIR, 'credentials.enc.json');
const ENCRYPTION_KEY = process.env.VAULT_KEY || 'cortexo-vault-default-key-32ch'; // 32 chars for AES-256

interface Credential {
  id: string;
  category: 'github' | 'aws' | 'ssh' | 'openai' | 'gemini' | 'groq' | 'docker' | 'slack' | 'custom';
  label: string;
  key: string;       // e.g. "GITHUB_TOKEN", "AWS_ACCESS_KEY_ID"
  value: string;     // encrypted at rest
  maskedValue: string; // for display
  createdAt: string;
  updatedAt: string;
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function maskValue(val: string): string {
  if (val.length <= 8) return '••••••••';
  return val.slice(0, 4) + '••••••••' + val.slice(-4);
}

async function readVault(): Promise<Credential[]> {
  try {
    const raw = await fs.readFile(VAULT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeVault(creds: Credential[]) {
  await fs.mkdir(VAULT_DIR, { recursive: true });
  await fs.writeFile(VAULT_FILE, JSON.stringify(creds, null, 2), 'utf-8');
}

const CATEGORY_CONFIG: Record<string, { keys: string[]; labels: Record<string, string> }> = {
  github: {
    keys: ['GITHUB_TOKEN'],
    labels: { GITHUB_TOKEN: 'GitHub Personal Access Token' },
  },
  openai: {
    keys: ['OPENAI_API_KEY'],
    labels: { OPENAI_API_KEY: 'OpenAI API Key' },
  },
  gemini: {
    keys: ['GEMINI_API_KEY'],
    labels: { GEMINI_API_KEY: 'Gemini API Key' },
  },
  groq: {
    keys: ['GROQ_API_KEY'],
    labels: { GROQ_API_KEY: 'Groq API Key' },
  },
  aws: {
    keys: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    labels: {
      AWS_ACCESS_KEY_ID: 'Access Key ID',
      AWS_SECRET_ACCESS_KEY: 'Secret Access Key',
      AWS_REGION: 'Default Region',
    },
  },
  ssh: {
    keys: ['SSH_PRIVATE_KEY', 'SSH_PASSPHRASE'],
    labels: { SSH_PRIVATE_KEY: 'Private Key (PEM)', SSH_PASSPHRASE: 'Key Passphrase' },
  },
  docker: {
    keys: ['DOCKER_REGISTRY', 'DOCKER_USERNAME', 'DOCKER_PASSWORD'],
    labels: {
      DOCKER_REGISTRY: 'Registry URL',
      DOCKER_USERNAME: 'Username',
      DOCKER_PASSWORD: 'Password/Token',
    },
  },
  slack: {
    keys: ['SLACK_WEBHOOK_URL'],
    labels: { SLACK_WEBHOOK_URL: 'Incoming Webhook URL' },
  },
  email: {
    keys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'],
    labels: {
      SMTP_HOST: 'SMTP Host',
      SMTP_PORT: 'SMTP Port',
      SMTP_USERNAME: 'Username',
      SMTP_PASSWORD: 'Password',
      SMTP_FROM_EMAIL: 'From Email Address',
    },
  },
};

export async function credentialsRoutes(app: FastifyInstance) {

  // List all credentials (values masked)
  app.get('/credentials', async () => {
    const creds = await readVault();
    return {
      data: creds.map(c => ({ ...c, value: undefined, maskedValue: c.maskedValue })),
      categories: Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => ({
        id,
        keys: cfg.keys.map(k => ({
          key: k,
          label: cfg.labels[k],
          configured: creds.some(c => c.key === k),
        })),
      })),
    };
  });

  // Upsert a credential
  const credentialSchema = z.object({
    category: z.string().default('custom'),
    key: z.string().min(1),
    value: z.string().min(1),
    label: z.string().optional(),
  });

  app.post('/credentials', async (request, reply) => {
    const parsed = credentialSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    const { category, key, value, label } = parsed.data;

    const creds = await readVault();
    const existing = creds.findIndex(c => c.key === key);
    const now = new Date().toISOString();

    const entry: Credential = {
      id: existing >= 0 ? creds[existing].id : crypto.randomUUID(),
      category: (category || 'custom') as Credential['category'],
      label: label || CATEGORY_CONFIG[category]?.labels[key] || key,
      key,
      value: encrypt(value),
      maskedValue: maskValue(value),
      createdAt: existing >= 0 ? creds[existing].createdAt : now,
      updatedAt: now,
    };

    if (existing >= 0) {
      creds[existing] = entry;
    } else {
      creds.push(entry);
    }

    await writeVault(creds);

    // Also set as env var for the running process
    process.env[key] = value;

    return reply.code(200).send({ data: { ...entry, value: undefined }, message: 'Credential saved' });
  });

  // Get decrypted value (for internal use — e.g., GitHub repo listing)
  app.get('/credentials/:key/reveal', async (request, reply) => {
    const { key } = request.params as { key: string };
    const creds = await readVault();
    const cred = creds.find(c => c.key === key);
    if (!cred) return reply.code(404).send({ error: 'Credential not found' });
    return { data: { key: cred.key, value: decrypt(cred.value) } };
  });

  // Delete a credential
  app.delete('/credentials/:key', async (request, reply) => {
    const { key } = request.params as { key: string };
    const creds = await readVault();
    const filtered = creds.filter(c => c.key !== key);
    if (filtered.length === creds.length) return reply.code(404).send({ error: 'Not found' });
    await writeVault(filtered);
    delete process.env[key];
    return { success: true };
  });

  /**
   * Fetch ALL pages from a paginated GitHub API endpoint.
   * GitHub returns max 100 items/page and provides a `Link` header
   * with `rel="next"` for subsequent pages. This follows that chain.
   */
  async function fetchAllGitHubPages(url: string, headers: Record<string, string>): Promise<any[]> {
    const all: any[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
      const res: Response = await fetch(nextUrl, { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error('GitHub token expired or invalid. Update it in Settings → Credentials.');
        break;
      }

      const page = await res.json() as any[];
      all.push(...page);

      // Parse Link header: <https://api.github.com/...?page=2>; rel="next"
      const linkHeader: string = res.headers.get('link') || '';
      const nextMatch: RegExpMatchArray | null = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      nextUrl = nextMatch ? nextMatch[1] : null;
    }

    return all;
  }

  // GitHub: list repos using stored token (personal + all orgs)
  app.get('/credentials/github/repos', async (_request, reply) => {
    const creds = await readVault();
    const tokenCred = creds.find(c => c.key === 'GITHUB_TOKEN');
    if (!tokenCred) return reply.code(400).send({ error: 'GitHub token not configured. Add it in Settings → Credentials.' });

    const token = decrypt(tokenCred.value);
    const ghHeaders: Record<string, string> = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'Cortexo' };

    try {
      // 0. Validate token first
      const testRes = await fetch('https://api.github.com/user', { headers: ghHeaders });
      if (!testRes.ok) {
        return reply.code(401).send({ error: 'GitHub token expired or invalid. Update it in Settings → Credentials.', tokenExpired: true });
      }

      // 1. Fetch ALL user repos (follows pagination automatically)
      const userReposPromise = fetchAllGitHubPages(
        'https://api.github.com/user/repos?per_page=100&sort=updated&type=all',
        ghHeaders,
      );

      // 2. Fetch all orgs the user belongs to
      const orgs = await fetchAllGitHubPages('https://api.github.com/user/orgs?per_page=100', ghHeaders) as { login: string }[];

      // 3. Fetch ALL repos for each org (follows pagination per org)
      const orgRepoPromises = orgs.map(org =>
        fetchAllGitHubPages(
          `https://api.github.com/orgs/${org.login}/repos?per_page=100&sort=updated`,
          ghHeaders,
        ),
      );

      // 4. Wait for all requests
      const [userRepos, ...orgReposArrays] = await Promise.all([userReposPromise, ...orgRepoPromises]);

      // 5. Combine and deduplicate
      const allRepos = [...userRepos, ...orgReposArrays.flat()];
      const seen = new Set<number>();
      const unique = allRepos.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });

      // Sort by updated_at desc
      unique.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      return {
        data: unique.map(r => ({
          id: r.id,
          name: r.full_name,
          url: r.html_url,
          cloneUrl: r.clone_url,
          defaultBranch: r.default_branch,
          private: r.private,
          updatedAt: r.updated_at,
          org: r.owner?.login,
        })),
      };
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // GitHub: list branches for a repository
  app.get('/credentials/github/repos/:owner/:repo/branches', async (request, reply) => {
    const { owner, repo } = request.params as { owner: string; repo: string };
    const creds = await readVault();
    const tokenCred = creds.find(c => c.key === 'GITHUB_TOKEN');
    if (!tokenCred) return reply.code(400).send({ error: 'GitHub token not configured.' });

    const token = decrypt(tokenCred.value);
    const ghHeaders: Record<string, string> = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'Cortexo' };

    try {
      const branches = await fetchAllGitHubPages(
        `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
        ghHeaders,
      ) as { name: string }[];
      return { data: branches.map(b => b.name) };
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });
}

/**
 * Exported helper: get a decrypted credential value from the vault.
 * Used by mailer, deploy hooks, etc.
 */
export async function getVaultCredential(key: string): Promise<string | null> {
  try {
    const creds = await readVault();
    const cred = creds.find(c => c.key === key);
    if (!cred) return null;
    return decrypt(cred.value);
  } catch {
    return null;
  }
}

/**
 * Exported helper: get multiple credentials at once.
 */
export async function getVaultCredentials(...keys: string[]): Promise<Record<string, string | null>> {
  try {
    const creds = await readVault();
    const result: Record<string, string | null> = {};
    for (const key of keys) {
      const cred = creds.find(c => c.key === key);
      result[key] = cred ? decrypt(cred.value) : null;
    }
    return result;
  } catch {
    const result: Record<string, string | null> = {};
    for (const key of keys) result[key] = null;
    return result;
  }
}
