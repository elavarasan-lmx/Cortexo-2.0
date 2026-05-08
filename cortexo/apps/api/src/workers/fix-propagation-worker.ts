import { getDb } from '../lib/db.js';
import { fixRollouts, fixRecipes } from '@cortexo/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function processFixPropagation(job: { data: { rolloutId: string } }) {
  const { rolloutId } = job.data;
  console.log(`[Worker] Starting fix propagation for rollout ${rolloutId}`);

  try {
    const db = await getDb();
    const [rollout] = await db.select().from(fixRollouts).where(eq(fixRollouts.id, rolloutId)).limit(1);
    if (!rollout) throw new Error('Rollout not found');

    const [recipe] = await db.select().from(fixRecipes).where(eq(fixRecipes.id, rollout.recipeId)).limit(1);
    if (!recipe) throw new Error('Recipe not found');

    // In a real implementation:
    // 1. Fetch source code from client via SSH or Git
    // 2. Check if conflictType is 'safe'
    // 3. Apply the diffPatch
    // 4. Commit or deploy changes
    
    // Simulate successful apply
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await db.update(fixRollouts)
      .set({
        status: 'applied',
        appliedAt: new Date()
      })
      .where(eq(fixRollouts.id, rolloutId));

    // Update the parent recipe appliedCount
    await db.update(fixRecipes)
      .set({
        appliedCount: sql`${fixRecipes.appliedCount} + 1`
      })
      .where(eq(fixRecipes.id, recipe.id));

    console.log(`[Worker] Successfully applied rollout ${rolloutId}`);
  } catch (error: any) {
    console.error(`[Worker] Fix propagation failed for rollout ${rolloutId}:`, error);
    const db = await getDb();
    await db.update(fixRollouts)
      .set({
        status: 'failed',
        failureReason: error.message || 'Unknown error'
      })
      .where(eq(fixRollouts.id, rolloutId));
  }
}
