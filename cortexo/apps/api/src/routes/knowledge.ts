import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../lib/db.js';
import { knowledgeDocs, qaHistory } from '@cortexo/db/schema';
import { eq, desc, ilike } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Knowledge Base & Q&A Engine Routes — Sprint 7 (F36)
 */
export async function knowledgeRoutes(app: FastifyInstance) {
  const db = await getDb();

  // ─── GET /knowledge/docs — Search/list docs ─────────────────────────
  app.get(
    '/knowledge/docs',
    async (request: FastifyRequest<{ Querystring: { q?: string; category?: string } }>) => {
      const { q, category } = request.query;

      // Ensure some default docs exist for demo purposes
      const existing = await db.select({ id: knowledgeDocs.id }).from(knowledgeDocs).limit(1);
      if (existing.length === 0) {
        await db.insert(knowledgeDocs).values([
          { title: 'System Architecture', content: 'Cortexo uses Fastify, BullMQ, and PostgreSQL.', category: 'architecture', tags: ['fastify', 'bullmq', 'postgres'] },
          { title: 'Troubleshooting Memory Leaks', content: 'Check node heap sizes and analyze the event loop lag.', category: 'troubleshooting', tags: ['memory', 'node'] },
          { title: 'Deploying a New Version', content: 'Use the CLI: npx @cortexo/cli deploy', category: 'deployment', tags: ['cli', 'deploy'] },
        ]);
      }

      let query = db.select().from(knowledgeDocs).$dynamic();
      
      if (q) {
        query = query.where(ilike(knowledgeDocs.title, `%${q}%`));
      }
      
      const docs = await query.orderBy(desc(knowledgeDocs.createdAt));
      return { data: docs };
    },
  );

  // ─── POST /knowledge/ask — Ask AI a question ────────────────────────
  const askSchema = z.object({
    question: z.string().min(1),
  });

  app.post(
    '/knowledge/ask',
    async (request: FastifyRequest) => {
      const { question } = askSchema.parse(request.body);

      // Simulate AI Answer Retrieval based on knowledge base
      let answer = "I couldn't find a specific answer in the knowledge base, but generally, you can check the logs for more details.";
      const sources: string[] = [];

      const qLower = question.toLowerCase();
      if (qLower.includes('architecture') || qLower.includes('stack')) {
        answer = "Cortexo is built using Fastify for the API, BullMQ for background jobs, and PostgreSQL with Drizzle ORM. The frontend is Next.js with React.";
        const doc = await db.select({ id: knowledgeDocs.id }).from(knowledgeDocs).where(ilike(knowledgeDocs.title, '%Architecture%')).limit(1);
        if (doc[0]) sources.push(doc[0].id);
      } else if (qLower.includes('memory') || qLower.includes('leak')) {
        answer = "For memory issues, we recommend checking Node.js heap sizes using APM tools and analyzing event loop lag using the `--inspect` flag.";
        const doc = await db.select({ id: knowledgeDocs.id }).from(knowledgeDocs).where(ilike(knowledgeDocs.title, '%Troubleshooting%')).limit(1);
        if (doc[0]) sources.push(doc[0].id);
      } else if (qLower.includes('deploy')) {
        answer = "You can deploy a new version using our CLI by running `npx @cortexo/cli deploy`. Ensure your environment variables are set.";
        const doc = await db.select({ id: knowledgeDocs.id }).from(knowledgeDocs).where(ilike(knowledgeDocs.title, '%Deploy%')).limit(1);
        if (doc[0]) sources.push(doc[0].id);
      } else {
        // generic
        answer = `Based on your question about "${question}", I recommend checking the "Troubleshooting" guides in our knowledge base.`;
      }

      const [record] = await db.insert(qaHistory).values({
        question,
        answer,
        sourcesUsed: sources,
      }).returning();

      return { data: record };
    },
  );

  // ─── GET /knowledge/history — Get previous Q&A session logs ─────────
  app.get(
    '/knowledge/history',
    async () => {
      const history = await db
        .select()
        .from(qaHistory)
        .orderBy(desc(qaHistory.createdAt))
        .limit(20);

      return { data: history.reverse() }; // Chronological order
    },
  );
}
