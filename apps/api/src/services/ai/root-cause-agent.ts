import { getDb } from '../../lib/db.js';
import { eq, and, desc } from 'drizzle-orm';
import { errors, errorEvents, deployments, rootCauses } from '@cortexo/db/schema';

export async function analyzeRootCause(errorId: string, rootCauseId: string, projectId: string, orgId: string) {
  const db = await getDb();

  try {
    // 1. Fetch Error Details & Recent Events
    const errorGroup = await db.query.errors.findFirst({
      where: (e, { eq }) => eq(e.id, errorId)
    });

    if (!errorGroup) throw new Error('Error not found');

    const recentEvents = await db.query.errorEvents.findMany({
      where: (ev, { eq }) => eq(ev.errorId, errorId),
      orderBy: (ev, { desc }) => [desc(ev.createdAt)],
      limit: 5
    });

    // 2. Fetch Recent Deployment Info
    let deployContext = 'No recent deployment found.';
    if (errorGroup.linkedDeployId) {
      const deploy = await db.query.deployments.findFirst({
        where: (d, { eq }) => eq(d.id, errorGroup.linkedDeployId!)
      });
      if (deploy) {
        deployContext = `Recent Deployment Details:\nCommit: ${deploy.commitSha}\nMessage: ${deploy.commitMessage}\nStatus: ${deploy.status}\nDeployed At: ${deploy.createdAt}`;
      }
    }

    // 3. Construct Prompt
    const stackTraces = recentEvents.map(e => e.stackTrace).filter(Boolean).join('\n---\n');
    
    const prompt = `
      You are an expert DevOps AI consultant. Please analyze the following error to determine its root cause and suggest a fix.
      
      Error Type: ${errorGroup.type}
      Message: ${errorGroup.message}
      File: ${errorGroup.file} (Line ${errorGroup.line})
      
      ${deployContext}
      
      Recent Stack Traces:
      ${stackTraces || 'No stack trace provided.'}

      Provide a JSON response with exactly these fields:
      - "analysis": A clear, concise explanation of why this error happened.
      - "suggestedFix": A code snippet or config change to fix it.
      - "confidence": An integer between 0 and 100 representing your confidence.
    `;

    // 4. Call AI Provider (OpenAI)
    const apiKey = process.env.OPENAI_API_KEY;
    let analysisResult = {
      analysis: 'AI Analysis is currently disabled because OPENAI_API_KEY is not set. However, based on the stack trace, this appears to be a backend failure.',
      suggestedFix: 'Please check your environment variables and ensure OPENAI_API_KEY is configured.',
      confidence: 0,
      model: 'none'
    };
    let tokenUsage = { prompt: 0, completion: 0, total: 0 };

    if (apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        analysisResult = {
          analysis: content.analysis,
          suggestedFix: content.suggestedFix,
          confidence: content.confidence,
          model: 'gpt-4o-mini'
        };
        tokenUsage = {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens
        };
      } else {
        console.error('OpenAI Error:', await response.text());
        throw new Error('AI Provider failed to respond');
      }
    }

    // 5. Update Root Cause Record
    await db.update(rootCauses).set({
      analysis: analysisResult.analysis,
      suggestedFix: analysisResult.suggestedFix,
      confidence: analysisResult.confidence,
      model: analysisResult.model,
      tokenUsage,
      status: 'completed'
    } as any).where(eq(rootCauses.id, rootCauseId));

  } catch (err: any) {
    console.error('Root Cause Analysis Error:', err);
    // Mark as failed
    await db.update(rootCauses).set({
      status: 'failed',
      analysis: `Analysis failed: ${err.message}`
    } as any).where(eq(rootCauses.id, rootCauseId));
  }
}
