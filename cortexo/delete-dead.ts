import { getDb } from './apps/api/src/lib/db.js';
import { menuItems } from '@cortexo/db/schema';
import { inArray } from 'drizzle-orm';

async function run() {
  const db = await getDb();
  await db.delete(menuItems).where(
    inArray(menuItems.href, ['/reports', '/organizations', '/security', '/code-audit'])
  );
  console.log('Deleted dead menu items');
  process.exit(0);
}

run().catch(console.error);
