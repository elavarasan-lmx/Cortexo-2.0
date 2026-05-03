/**
 * Cortexo Database Seed Script
 * Inserts sample data for development/testing.
 * Run: npx tsx apps/api/src/seed.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/cortexo';

async function seed() {
  console.log('🌱 Seeding Cortexo database...\n');

  const pool = mysql.createPool({ uri: DATABASE_URL });

  // Check if already seeded
  const [existing] = await pool.query('SELECT COUNT(*) as cnt FROM projects');
  if ((existing as any)[0].cnt > 0) {
    console.log('  ✅ Database already has data — skipping seed.');
    await pool.end();
    return;
  }

  const orgId = 'default-org';
  const userId = 'user-001';

  // --- Organizations ---
  await pool.query(
    `INSERT INTO organizations (id, name, slug) VALUES (?, ?, ?)`,
    [orgId, 'Acme Corp', 'acme-corp']
  );
  console.log('  ✅ Organization created');

  // --- Users ---
  await pool.query(
    `INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, orgId, 'Admin', 'admin@example.com', 'scrypt-hash-placeholder', 'admin']
  );
  console.log('  ✅ User created');

  // --- Projects ---
  const projects = [
    { id: 'proj-001', name: 'webapp-main', desc: 'Main client web application', repo: 'github.com/acme/webapp-main', branch: 'main', health: 89 },
    { id: 'proj-002', name: 'api-service', desc: 'REST API microservice', repo: 'github.com/acme/api-service', branch: 'develop', health: 72 },
    { id: 'proj-003', name: 'rate-engine', desc: 'Rate calculation microservice', repo: 'github.com/acme/rate-engine', branch: 'main', health: 95 },
    { id: 'proj-004', name: 'admin-panel', desc: 'Internal admin dashboard', repo: 'github.com/acme/admin-panel', branch: 'main', health: 64 },
  ];

  for (const p of projects) {
    const apiKey = `sdk_${crypto.randomBytes(24).toString('hex')}`;
    await pool.query(
      `INSERT INTO projects (id, org_id, name, description, repo_provider, repo_url, default_branch, sdk_api_key, health_score, is_active)
       VALUES (?, ?, ?, ?, 'github', ?, ?, ?, ?, true)`,
      [p.id, orgId, p.name, p.desc, p.repo, p.branch, apiKey, p.health]
    );
  }
  console.log(`  ✅ ${projects.length} projects created`);

  // --- Pipelines ---
  const pipelines = [
    {
      id: 'pipe-001', projectId: 'proj-001', name: 'Deploy Pipeline',
      description: 'Build, Test, Deploy to production',
      stages: JSON.stringify([
        { name: 'Install', type: 'shell', run: 'echo "Installing dependencies..."' },
        { name: 'Test', type: 'shell', run: 'echo "Running tests... all passed"' },
        { name: 'Build', type: 'shell', run: 'echo "Building project..."' },
        { name: 'Deploy', type: 'deploy', run: 'echo "Deploying to server..."' },
      ]),
    },
    {
      id: 'pipe-002', projectId: 'proj-002', name: 'CI Pipeline',
      description: 'Lint, Test, Scan',
      stages: JSON.stringify([
        { name: 'Lint', type: 'shell', run: 'echo "Linting code..."' },
        { name: 'Test', type: 'shell', run: 'echo "Running unit tests..."' },
        { name: 'Scan', type: 'shell', run: 'echo "Security scan complete"' },
      ]),
    },
    {
      id: 'pipe-003', projectId: 'proj-003', name: 'Rate API Deploy',
      description: 'Test, Build, Deploy',
      stages: JSON.stringify([
        { name: 'Test', type: 'shell', run: 'echo "API tests passing..."' },
        { name: 'Build', type: 'shell', run: 'echo "Docker build complete"' },
        { name: 'Deploy', type: 'deploy', run: 'echo "Deploying rate API..."' },
      ]),
    },
  ];

  for (const p of pipelines) {
    await pool.query(
      `INSERT INTO pipelines (id, project_id, org_id, name, description, stages)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p.id, p.projectId, orgId, p.name, p.description, p.stages]
    );
  }
  console.log(`  ✅ ${pipelines.length} pipelines created`);

  // --- Deploy Targets ---
  const targets = [
    { id: 'target-001', name: 'prod-server-01', host: '198.51.100.10', port: 22, username: 'deployer', remotePath: '/var/www/html/webapp' },
    { id: 'target-002', name: 'prod-server-02', host: '198.51.100.11', port: 22, username: 'deployer', remotePath: '/var/www/html/api' },
    { id: 'target-003', name: 'staging-server', host: '198.51.100.12', port: 22, username: 'deployer', remotePath: '/var/www/html/staging' },
  ];

  for (const t of targets) {
    await pool.query(
      `INSERT INTO deploy_targets (id, org_id, name, type, host, port, username, remote_path, is_active)
       VALUES (?, ?, ?, 'ssh', ?, ?, ?, ?, true)`,
      [t.id, orgId, t.name, t.host, t.port, t.username, t.remotePath]
    );
  }
  console.log(`  ✅ ${targets.length} deploy targets created`);

  // --- Deployments ---
  const now = new Date();
  const deployments = [
    { id: 'dep-001', projectId: 'proj-001', env: 'production', status: 'deploying', branch: 'main', sha: 'ghi9012', msg: 'feat: silver rate calculator', durationMs: null },
    { id: 'dep-002', projectId: 'proj-001', env: 'production', status: 'success', branch: 'main', sha: 'abc1234', msg: 'fix: booking API null check', durationMs: 45000 },
    { id: 'dep-003', projectId: 'proj-002', env: 'staging', status: 'failed', branch: 'develop', sha: 'def5678', msg: 'feat: rate history chart', durationMs: 72000 },
    { id: 'dep-004', projectId: 'proj-003', env: 'production', status: 'success', branch: 'main', sha: 'jkl3456', msg: 'chore: update rate cron', durationMs: 58000 },
  ];

  for (const d of deployments) {
    await pool.query(
      `INSERT INTO deployments (id, project_id, org_id, environment, status, branch, commit_sha, commit_message, duration_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.projectId, orgId, d.env, d.status, d.branch, d.sha, d.msg, d.durationMs]
    );
  }
  console.log(`  ✅ ${deployments.length} deployments created`);

  // --- Errors ---
  const errors = [
    { id: 'err-001', projectId: 'proj-003', type: 'Warning', severity: 'warning', message: 'Undefined array key "gold_rate" in rate calculation', file: 'app/Libraries/RateEngine.php', line: 56, status: 'unresolved', eventCount: 203 },
    { id: 'err-002', projectId: 'proj-001', type: 'Notice', severity: 'info', message: 'Deprecated: Method ReflectionParameter::getClass() is deprecated', file: 'system/CodeIgniter.php', line: 912, status: 'ignored', eventCount: 1204 },
    { id: 'err-003', projectId: 'proj-001', type: 'TypeError', severity: 'critical', message: 'Cannot read properties of null (reading "booking_id")', file: 'app/Controllers/Booking.php', line: 142, status: 'unresolved', eventCount: 47 },
    { id: 'err-004', projectId: 'proj-002', type: 'DatabaseException', severity: 'error', message: 'SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry', file: 'app/Models/RateModel.php', line: 89, status: 'unresolved', eventCount: 12 },
    { id: 'err-005', projectId: 'proj-001', type: 'HttpException', severity: 'error', message: 'cURL error 28: Connection timed out after 30000ms', file: 'app/Libraries/SmsGateway.php', line: 34, status: 'resolved', eventCount: 8 },
  ];

  for (const e of errors) {
    await pool.query(
      `INSERT INTO errors (id, project_id, org_id, type, severity, message, file, line, status, event_count, fingerprint)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.id, e.projectId, orgId, e.type, e.severity, e.message, e.file, e.line, e.status, e.eventCount, `fp-${e.id}`]
    );
  }
  console.log(`  ✅ ${errors.length} errors created`);

  await pool.end();
  console.log('\n🎉 Seed complete!\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
