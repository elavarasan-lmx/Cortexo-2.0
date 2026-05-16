import 'dotenv/config';
import { getDb } from './apps/api/src/lib/db.js';
import { menuItems } from '@cortexo/db/schema';
import { sql } from 'drizzle-orm';

async function run() {
  const db = await getDb();
  
  const duplicates = await db.execute(sql`
    SELECT href, count(*), array_agg(id) as ids 
    FROM menu_items 
    GROUP BY href 
    HAVING count(*) > 1;
  `);

  console.log('Duplicates:', duplicates.rows);
  
  if (duplicates.rows.length > 0) {
    console.log('Deleting duplicate entries keeping only the latest/first one...');
    for (const row of duplicates.rows) {
      const ids = row.ids as string[];
      // Keep the first one, delete the rest
      const idsToDelete = ids.slice(1);
      if (idsToDelete.length > 0) {
        await db.execute(sql`
          DELETE FROM menu_items WHERE id = ANY(${idsToDelete});
        `);
        console.log(`Deleted duplicates for href ${row.href}`);
      }
    }
  } else {
    console.log('No duplicates found.');
  }

  process.exit(0);
}

run().catch(console.error);
