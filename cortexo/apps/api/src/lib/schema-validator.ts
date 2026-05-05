/**
 * DB Schema Validator — Compares a client's PostgreSQL schema against the golden schema.
 *
 * Detects:
 *   - Missing tables
 *   - Missing columns
 *   - Extra tables (client-specific additions)
 *   - Column type mismatches
 *
 * Uses SSH to run information_schema queries on the remote DB.
 */
import { sshConnect, sshExec, type SSHCredentials } from './ssh-executor.js';
import type { Client } from 'ssh2';

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: string | null;
}

export interface SchemaDiff {
  table: string;
  status: 'missing' | 'extra' | 'matched' | 'differs';
  missingColumns?: string[];
  extraColumns?: string[];
  typeMismatches?: Array<{
    column: string;
    expected: string;
    actual: string;
  }>;
}

export interface SchemaValidationReport {
  clientSlug: string;
  scannedAt: string;
  durationMs: number;
  goldenTables: number;
  clientTables: number;
  summary: {
    matched: number;
    missing: number;
    extra: number;
    differs: number;
  };
  diffs: SchemaDiff[];
  error?: string;
}

/**
 * Get table list from a PostgreSQL database via SSH.
 */
async function getRemoteTables(conn: Client, dbName: string): Promise<string[]> {
  const cmd = `psql -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'" ${dbName} 2>/dev/null`;
  const { stdout } = await sshExec(conn, cmd, 15_000);
  return stdout.split('\n').map(t => t.trim()).filter(Boolean);
}

/**
 * Get column details for a table via SSH.
 */
async function getRemoteColumns(conn: Client, dbName: string, table: string): Promise<SchemaColumn[]> {
  const cmd = `psql -t -A -F'	' -c "SELECT column_name, data_type, is_nullable, '' as key, column_default FROM information_schema.columns WHERE table_name = '${table}'" ${dbName} 2>/dev/null`;
  const { stdout } = await sshExec(conn, cmd, 10_000);
  const columns: SchemaColumn[] = [];

  for (const line of stdout.split('\n')) {
    const parts = line.split('\t');
    if (parts.length >= 4) {
      columns.push({
        name: parts[0]?.trim() || '',
        type: parts[1]?.trim() || '',
        nullable: parts[2]?.trim() === 'YES',
        key: parts[3]?.trim() || '',
        default: parts[4]?.trim() || null,
      });
    }
  }
  return columns;
}

/**
 * Validate a client's database schema against a golden reference.
 *
 * @param creds SSH credentials for the golden DB server
 * @param goldenDb Golden/reference database name
 * @param clientCreds SSH credentials for the client's server
 * @param clientDb Client database name
 * @param clientSlug Client identifier
 */
export async function validateSchema(
  creds: SSHCredentials,
  goldenDb: string,
  clientCreds: SSHCredentials,
  clientDb: string,
  clientSlug: string,
): Promise<SchemaValidationReport> {
  const start = Date.now();
  let goldenConn: Client | null = null;
  let clientConn: Client | null = null;

  try {
    // Connect to both servers
    [goldenConn, clientConn] = await Promise.all([
      sshConnect(creds),
      sshConnect(clientCreds),
    ]);

    // Get table lists
    const [goldenTables, clientTables] = await Promise.all([
      getRemoteTables(goldenConn, goldenDb),
      getRemoteTables(clientConn, clientDb),
    ]);

    const goldenSet = new Set(goldenTables);
    const clientSet = new Set(clientTables);
    const diffs: SchemaDiff[] = [];
    let matched = 0, missing = 0, extra = 0, differs = 0;

    // Check golden tables against client
    for (const table of goldenTables) {
      if (!clientSet.has(table)) {
        diffs.push({ table, status: 'missing' });
        missing++;
        continue;
      }

      // Compare columns
      const [goldenCols, clientCols] = await Promise.all([
        getRemoteColumns(goldenConn, goldenDb, table),
        getRemoteColumns(clientConn, clientDb, table),
      ]);

      const goldenColMap = new Map(goldenCols.map(c => [c.name, c]));
      const clientColMap = new Map(clientCols.map(c => [c.name, c]));

      const missingColumns: string[] = [];
      const extraColumns: string[] = [];
      const typeMismatches: SchemaDiff['typeMismatches'] = [];

      for (const [name, col] of goldenColMap) {
        const clientCol = clientColMap.get(name);
        if (!clientCol) {
          missingColumns.push(name);
        } else if (col.type !== clientCol.type) {
          typeMismatches.push({ column: name, expected: col.type, actual: clientCol.type });
        }
      }

      for (const name of clientColMap.keys()) {
        if (!goldenColMap.has(name)) extraColumns.push(name);
      }

      if (missingColumns.length || extraColumns.length || typeMismatches.length) {
        diffs.push({ table, status: 'differs', missingColumns, extraColumns, typeMismatches });
        differs++;
      } else {
        matched++;
      }
    }

    // Check for extra tables (client has but golden doesn't)
    for (const table of clientTables) {
      if (!goldenSet.has(table)) {
        diffs.push({ table, status: 'extra' });
        extra++;
      }
    }

    return {
      clientSlug,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      goldenTables: goldenTables.length,
      clientTables: clientTables.length,
      summary: { matched, missing, extra, differs },
      diffs: diffs.sort((a, b) => {
        const order = { missing: 0, differs: 1, extra: 2, matched: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      }),
    };
  } catch (err: any) {
    return {
      clientSlug,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      goldenTables: 0,
      clientTables: 0,
      summary: { matched: 0, missing: 0, extra: 0, differs: 0 },
      diffs: [],
      error: err.message,
    };
  } finally {
    if (goldenConn) try { goldenConn.end(); } catch { /* ignore */ }
    if (clientConn) try { clientConn.end(); } catch { /* ignore */ }
  }
}
