import { getDb } from '../lib/db.js';
import { securityScans, securityFindings } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';
import { runDependencyScan } from '../lib/dependency-scanner.js';
import { runSecretScan } from '../lib/secret-scanner.js';

export async function processSecurityScan(job: { data: { scanId: string, projectId: string, type: 'dependency' | 'secret', dirPath: string } }) {
  const { scanId, projectId, type, dirPath } = job.data;
  console.log(`[Worker] Starting security scan ${scanId} of type ${type}`);

  try {
    const db = await getDb();
    let result;
    if (type === 'dependency') {
      result = await runDependencyScan(projectId, dirPath);
    } else {
      result = await runSecretScan(projectId, dirPath);
    }

    if (result.success) {
      await db.update(securityScans).set({
        status: 'completed',
        criticalCount: result.criticalCount,
        highCount: result.highCount,
        mediumCount: result.mediumCount
      }).where(eq(securityScans.id, scanId));

      for (const finding of result.findings) {
        await db.insert(securityFindings).values({
          scanId,
          type: type === 'dependency' ? 'vulnerability' : 'secret',
          ...finding,
          status: 'open'
        });
      }
    } else {
      await db.update(securityScans).set({ status: 'failed' }).where(eq(securityScans.id, scanId));
    }
  } catch (error) {
    console.error(`[Worker] Security scan failed:`, error);
    const db = await getDb();
    await db.update(securityScans).set({ status: 'failed' }).where(eq(securityScans.id, scanId));
  }
}
