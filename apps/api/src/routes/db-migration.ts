import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import mysql from 'mysql2/promise';

// ── Helpers ─────────────────────────────────────────────────────

const dbConfigSchema = z.object({
  host: z.string().min(1),
  user: z.string().min(1),
  password: z.string(),
  database: z.string().min(1),
});

async function tempConnect(dbConfig: z.infer<typeof dbConfigSchema>) {
  return mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectTimeout: 10000,
  });
}

function parseConnError(msg: string): string {
  if (msg.includes('Access denied')) return 'Invalid username or password.';
  if (msg.includes('Unknown database')) return 'Database name does not exist.';
  if (msg.includes('getaddrinfo') || msg.includes('ENOTFOUND')) return 'Hostname not found.';
  if (msg.includes('ECONNREFUSED')) return 'Connection refused — check host/port.';
  if (msg.includes('ETIMEDOUT')) return 'Connection timed out.';
  return msg;
}

function extractLength(type: string): number | null {
  const m = type.match(/\((\d+)\)/);
  return m ? parseInt(m[1]) : null;
}

/**
 * DB Migration API — /v1/db-migration
 * Full database comparison and migration toolkit.
 * Compares tables, columns, indexes, keys, row counts, checksums, etc.
 * Ported from BullionDevops dbmigration.js (638 lines, 12 endpoints).
 */
export async function dbMigrationRoutes(app: FastifyInstance) {

  // ── POST /connect — Test both connections ────────────────────
  app.post('/db-migration/connect', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    const result: Record<string, any> = { oldDb: { ok: false }, newDb: { ok: false } };

    try {
      const conn = await tempConnect(oldDb);
      result.oldDb = { ok: true, database: oldDb.database };
      await conn.end();
    } catch (e: any) {
      result.oldDb = { ok: false, error: parseConnError(e.message) };
    }

    try {
      const conn = await tempConnect(newDb);
      result.newDb = { ok: true, database: newDb.database };
      await conn.end();
    } catch (e: any) {
      result.newDb = { ok: false, error: parseConnError(e.message) };
    }

    return result;
  });

  // ── POST /tables — Tables comparison ─────────────────────────
  app.post('/db-migration/tables', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    let oldConn: any, newConn: any;
    try {
      oldConn = await tempConnect(oldDb);
      newConn = await tempConnect(newDb);

      const [oldRows] = await oldConn.query('SHOW TABLES');
      const [newRows] = await newConn.query('SHOW TABLES');

      const oldTables = (oldRows as any[]).map((r: any) => Object.values(r)[0] as string);
      const newTables = (newRows as any[]).map((r: any) => Object.values(r)[0] as string);

      const missingInNew = oldTables.filter(t => !newTables.includes(t));
      const missingInOld = newTables.filter(t => !oldTables.includes(t));

      const createQueries: Record<string, string> = {};
      for (const t of missingInNew) {
        const [rows] = await oldConn.query(`SHOW CREATE TABLE \`${t}\``);
        if ((rows as any[])[0]) createQueries[t] = (rows as any[])[0]['Create Table'] + ';';
      }
      for (const t of missingInOld) {
        const [rows] = await newConn.query(`SHOW CREATE TABLE \`${t}\``);
        if ((rows as any[])[0]) createQueries[t] = (rows as any[])[0]['Create Table'] + ';';
      }

      return { oldCount: oldTables.length, newCount: newTables.length, missingInNew, missingInOld, createQueries };
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    } finally {
      if (oldConn) await oldConn.end();
      if (newConn) await newConn.end();
    }
  });

  // ── POST /columns — Columns comparison ──────────────────────
  app.post('/db-migration/columns', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    let oldConn: any, newConn: any;
    try {
      oldConn = await tempConnect(oldDb);
      newConn = await tempConnect(newDb);

      const [oldTableRows] = await oldConn.query('SHOW TABLES');
      const oldTables = (oldTableRows as any[]).map((r: any) => Object.values(r)[0] as string);

      const alterQueries: Record<string, string[]> = {};
      let totalMissing = 0;

      for (const table of oldTables) {
        const [exists] = await newConn.query('SHOW TABLES LIKE ?', [table]);
        if ((exists as any[]).length === 0) continue;

        const [oldCols] = await oldConn.query(
          `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT
           FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [oldDb.database, table]
        );
        const [newCols] = await newConn.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [newDb.database, table]
        );

        const newColNames = (newCols as any[]).map((c: any) => c.COLUMN_NAME);

        for (const col of oldCols as any[]) {
          if (!newColNames.includes(col.COLUMN_NAME)) {
            let line = `ALTER TABLE \`${table}\` ADD COLUMN \`${col.COLUMN_NAME}\` ${col.COLUMN_TYPE}`;
            line += col.IS_NULLABLE === 'NO' ? ' NOT NULL' : ' NULL';
            if (col.COLUMN_DEFAULT !== null) {
              line += ` DEFAULT '${(col.COLUMN_DEFAULT || '').replace(/'/g, "\\'")}'`;
            }
            if (col.EXTRA) line += ' ' + col.EXTRA.toUpperCase();
            if (col.COLUMN_COMMENT) line += ` COMMENT '${col.COLUMN_COMMENT.replace(/'/g, "\\'")}'`;
            line += ';';

            if (!alterQueries[table]) alterQueries[table] = [];
            alterQueries[table].push(line);
            totalMissing++;
          }
        }
      }

      return { alterQueries, totalMissing, tableCount: Object.keys(alterQueries).length };
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    } finally {
      if (oldConn) await oldConn.end();
      if (newConn) await newConn.end();
    }
  });

  // ── POST /size — Column size mismatch ───────────────────────
  app.post('/db-migration/size', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    let oldConn: any, newConn: any;
    try {
      oldConn = await tempConnect(oldDb);
      newConn = await tempConnect(newDb);

      const [oldTableRows] = await oldConn.query('SHOW TABLES');
      const tables = (oldTableRows as any[]).map((r: any) => Object.values(r)[0] as string);
      const mismatches: any[] = [];

      for (const table of tables) {
        const [oldCols] = await oldConn.query(`SHOW COLUMNS FROM \`${table}\``);
        let newCols: any[];
        try {
          [newCols] = await newConn.query(`SHOW COLUMNS FROM \`${table}\``);
        } catch { continue; }

        const newMap: Record<string, string> = {};
        for (const c of newCols as any[]) newMap[c.Field] = c.Type;

        for (const c of oldCols as any[]) {
          if (!newMap[c.Field]) continue;
          const oldLen = extractLength(c.Type);
          const newLen = extractLength(newMap[c.Field]);
          if (oldLen !== null && newLen !== null && newLen < oldLen) {
            const baseType = c.Type.replace(/\(\d+\)/, '');
            mismatches.push({
              table, column: c.Field, oldType: c.Type, newType: newMap[c.Field],
              alterQuery: `ALTER TABLE \`${table}\` MODIFY \`${c.Field}\` ${baseType}(${oldLen});`,
            });
          }
        }
      }

      return { mismatches };
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    } finally {
      if (oldConn) await oldConn.end();
      if (newConn) await newConn.end();
    }
  });

  // ── POST /row-count — Row count comparison ──────────────────
  app.post('/db-migration/row-count', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    let oldConn: any, newConn: any;
    try {
      oldConn = await tempConnect(oldDb);
      newConn = await tempConnect(newDb);

      const [oldTableRows] = await oldConn.query('SHOW TABLES');
      const [newTableRows] = await newConn.query('SHOW TABLES');
      const oldTables = (oldTableRows as any[]).map((r: any) => Object.values(r)[0] as string);
      const newTables = (newTableRows as any[]).map((r: any) => Object.values(r)[0] as string);
      const common = oldTables.filter(t => newTables.includes(t));

      const results: any[] = [];
      for (const table of common) {
        const [[oldRow]] = await oldConn.query(`SELECT COUNT(*) as cnt FROM \`${table}\``) as any;
        const [[newRow]] = await newConn.query(`SELECT COUNT(*) as cnt FROM \`${table}\``) as any;
        results.push({
          table,
          oldCount: oldRow.cnt,
          newCount: newRow.cnt,
          status: oldRow.cnt === newRow.cnt ? 'Match' : 'Mismatch',
        });
      }

      return { results };
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    } finally {
      if (oldConn) await oldConn.end();
      if (newConn) await newConn.end();
    }
  });

  // ── POST /keys — Primary & Foreign key comparison ───────────
  app.post('/db-migration/keys', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    let oldConn: any, newConn: any;
    try {
      oldConn = await tempConnect(oldDb);
      newConn = await tempConnect(newDb);

      const getKeys = async (conn: any, dbName: string) => {
        const [pkRows] = await conn.query(
          `SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
           WHERE TABLE_SCHEMA = ? AND CONSTRAINT_NAME = 'PRIMARY'
           ORDER BY TABLE_NAME, ORDINAL_POSITION`, [dbName]
        );
        const [fkRows] = await conn.query(
          `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
           FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
           WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
           ORDER BY TABLE_NAME`, [dbName]
        );

        const primary: Record<string, string[]> = {};
        for (const r of pkRows as any[]) {
          if (!primary[r.TABLE_NAME]) primary[r.TABLE_NAME] = [];
          primary[r.TABLE_NAME].push(r.COLUMN_NAME);
        }
        const foreign: Record<string, string[]> = {};
        for (const r of fkRows as any[]) {
          if (!foreign[r.TABLE_NAME]) foreign[r.TABLE_NAME] = [];
          foreign[r.TABLE_NAME].push(`${r.COLUMN_NAME} -> ${r.REFERENCED_TABLE_NAME}(${r.REFERENCED_COLUMN_NAME})`);
        }
        return { primary, foreign };
      };

      const oldKeys = await getKeys(oldConn, oldDb.database);
      const newKeys = await getKeys(newConn, newDb.database);

      const compareKeys = (old: Record<string, string[]>, nw: Record<string, string[]>) => {
        const missingInNew: Record<string, string[]> = {};
        const missingInOld: Record<string, string[]> = {};
        for (const [table, cols] of Object.entries(old)) {
          if (!nw[table]) { missingInNew[table] = cols; continue; }
          const diff = cols.filter(c => !nw[table].includes(c));
          if (diff.length) missingInNew[table] = diff;
        }
        for (const [table, cols] of Object.entries(nw)) {
          if (!old[table]) { missingInOld[table] = cols; continue; }
          const diff = cols.filter(c => !old[table].includes(c));
          if (diff.length) missingInOld[table] = diff;
        }
        return { missingInNew, missingInOld };
      };

      return {
        primaryKeys: compareKeys(oldKeys.primary, newKeys.primary),
        foreignKeys: compareKeys(oldKeys.foreign, newKeys.foreign),
      };
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    } finally {
      if (oldConn) await oldConn.end();
      if (newConn) await newConn.end();
    }
  });

  // ── POST /indexes — Index comparison ────────────────────────
  app.post('/db-migration/indexes', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    let oldConn: any, newConn: any;
    try {
      oldConn = await tempConnect(oldDb);
      newConn = await tempConnect(newDb);

      const getIndexes = async (conn: any, dbName: string) => {
        const [rows] = await conn.query(
          `SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, COLUMN_NAME, INDEX_TYPE
           FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ?
           ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`, [dbName]
        );
        const indexes: Record<string, Record<string, any>> = {};
        for (const r of rows as any[]) {
          if (!indexes[r.TABLE_NAME]) indexes[r.TABLE_NAME] = {};
          if (!indexes[r.TABLE_NAME][r.INDEX_NAME]) {
            indexes[r.TABLE_NAME][r.INDEX_NAME] = { type: r.INDEX_TYPE, unique: r.NON_UNIQUE === 0, columns: [] };
          }
          indexes[r.TABLE_NAME][r.INDEX_NAME].columns.push(r.COLUMN_NAME);
        }
        return indexes;
      };

      const oldIdx = await getIndexes(oldConn, oldDb.database);
      const newIdx = await getIndexes(newConn, newDb.database);

      const allTables = [...new Set([...Object.keys(oldIdx), ...Object.keys(newIdx)])];
      const results: Record<string, any[]> = {};
      const summary = { matched: 0, missing: 0, extra: 0, mismatch: 0 };

      for (const table of allTables) {
        const oldTbl = oldIdx[table] || {};
        const newTbl = newIdx[table] || {};
        const allIndexNames = [...new Set([...Object.keys(oldTbl), ...Object.keys(newTbl)])];

        for (const idx of allIndexNames) {
          const oldDef = oldTbl[idx] || null;
          const newDef = newTbl[idx] || null;
          if (!results[table]) results[table] = [];

          if (oldDef && !newDef) {
            const colList = oldDef.columns.map((c: string) => `\`${c}\``).join(', ');
            results[table].push({
              index: idx, status: 'Missing in New DB', details: oldDef,
              sql: `CREATE ${oldDef.unique ? 'UNIQUE ' : ''}${oldDef.type === 'FULLTEXT' ? 'FULLTEXT ' : ''}INDEX \`${idx}\` ON \`${table}\` (${colList});`,
            });
            summary.missing++;
          } else if (!oldDef && newDef) {
            results[table].push({ index: idx, status: 'Extra in New DB', details: newDef });
            summary.extra++;
          } else if (oldDef && newDef) {
            if (JSON.stringify(oldDef.columns) !== JSON.stringify(newDef.columns) || oldDef.unique !== newDef.unique) {
              summary.mismatch++;
              results[table].push({ index: idx, status: 'Mismatch', detailsOld: oldDef, detailsNew: newDef });
            } else {
              summary.matched++;
            }
          }
        }
      }

      return { results, summary };
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    } finally {
      if (oldConn) await oldConn.end();
      if (newConn) await newConn.end();
    }
  });

  // ── POST /checksum — Checksum validation ────────────────────
  app.post('/db-migration/checksum', async (request, reply) => {
    const { oldDb, newDb } = request.body as any;
    let oldConn: any, newConn: any;
    try {
      oldConn = await tempConnect(oldDb);
      newConn = await tempConnect(newDb);

      const [oldTableRows] = await oldConn.query('SHOW TABLES');
      const [newTableRows] = await newConn.query('SHOW TABLES');
      const oldTables = (oldTableRows as any[]).map((r: any) => Object.values(r)[0] as string);
      const newTables = (newTableRows as any[]).map((r: any) => Object.values(r)[0] as string);
      const common = oldTables.filter(t => newTables.includes(t));

      const results: Record<string, any> = {};
      for (const table of common) {
        try {
          const [[oldCS]] = await oldConn.query(`CHECKSUM TABLE \`${table}\``) as any;
          const [[newCS]] = await newConn.query(`CHECKSUM TABLE \`${table}\``) as any;
          results[table] = { oldChecksum: oldCS.Checksum, newChecksum: newCS.Checksum, match: oldCS.Checksum === newCS.Checksum };
        } catch {
          results[table] = { oldChecksum: null, newChecksum: null, match: false, error: 'Could not checksum' };
        }
      }

      return { results };
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    } finally {
      if (oldConn) await oldConn.end();
      if (newConn) await newConn.end();
    }
  });
}
