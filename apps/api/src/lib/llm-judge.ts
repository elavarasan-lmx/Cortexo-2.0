/**
 * LLM-as-a-Judge Scoring Engine — lib/llm-judge.ts
 * Implements quantitative 0-100 scoring for agent outputs.
 *
 * Scoring dimensions:
 *  1. Correctness  — Is the answer factually right?
 *  2. Completeness — Are all parts of the request addressed?
 *  3. Code quality  — Does generated code follow PSR-12, clean code?
 *  4. Security      — Are there any security issues in the output?
 *  5. Actionability — Can the user directly apply the suggestion?
 *
 * When OPENAI_API_KEY is set, uses GPT to judge. Otherwise uses heuristic scoring.
 */

export interface JudgeScore {
  overall: number;           // 0-100
  correctness: number;       // 0-100
  completeness: number;      // 0-100
  codeQuality: number;       // 0-100
  security: number;          // 0-100
  actionability: number;     // 0-100
  reasoning: string;         // Why this score
  confidence: number;        // How confident the judge is (0-100)
  model: string;             // Which model scored this
  scoredAt: string;
}

export interface JudgeInput {
  taskType: string;
  taskDescription: string;
  agentOutput: string;
  referenceAnswer?: string;  // Optional gold-standard answer
  context?: string;          // Additional context
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const JUDGE_PROMPT = `You are a strict but fair AI quality judge. Score the following agent output on 5 dimensions (0-100 each):

1. **Correctness** — Is the output factually correct? Does the code work?
2. **Completeness** — Does it address all parts of the request?
3. **Code Quality** — Does it follow PSR-12, clean code, no magic numbers?
4. **Security** — Are there SQL injection, XSS, or other vulnerabilities?
5. **Actionability** — Can the user directly copy-paste and use this?

Task type: {taskType}
Task: {taskDescription}

Agent output:
{agentOutput}

{reference}

Respond in JSON format:
{
  "correctness": <0-100>,
  "completeness": <0-100>,
  "codeQuality": <0-100>,
  "security": <0-100>,
  "actionability": <0-100>,
  "reasoning": "<2-3 sentences explaining the scores>"
}`;

/**
 * Score agent output using LLM-as-a-Judge (GPT) or heuristic fallback.
 */
export async function scoreWithJudge(input: JudgeInput): Promise<JudgeScore> {
  if (OPENAI_API_KEY) {
    return scoreWithLLM(input);
  }
  return scoreWithHeuristics(input);
}

/**
 * LLM-based scoring — calls OpenAI to judge quality.
 */
async function scoreWithLLM(input: JudgeInput): Promise<JudgeScore> {
  const prompt = JUDGE_PROMPT
    .replace('{taskType}', input.taskType)
    .replace('{taskDescription}', input.taskDescription)
    .replace('{agentOutput}', input.agentOutput.slice(0, 3000))
    .replace('{reference}', input.referenceAnswer ? `Reference answer:\n${input.referenceAnswer.slice(0, 1000)}` : '');

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI quality judge. Respond only in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    const data = await res.json() as any;
    const text = data.choices?.[0]?.message?.content || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const scores = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

    const overall = Math.round(
      (scores.correctness + scores.completeness + scores.codeQuality + scores.security + scores.actionability) / 5
    );

    return {
      overall,
      correctness: scores.correctness || 0,
      completeness: scores.completeness || 0,
      codeQuality: scores.codeQuality || 0,
      security: scores.security || 0,
      actionability: scores.actionability || 0,
      reasoning: scores.reasoning || 'Scored by LLM judge',
      confidence: 85,
      model: 'gpt-4o-mini-judge',
      scoredAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('[LLM Judge] Error:', err.message);
    return scoreWithHeuristics(input);
  }
}

/**
 * Heuristic-based scoring — no API call needed.
 * Uses text analysis to estimate quality.
 */
function scoreWithHeuristics(input: JudgeInput): JudgeScore {
  const output = input.agentOutput;
  const len = output.length;

  // Correctness: Check for code blocks, structured output
  const hasCodeBlocks = (output.match(/```/g) || []).length >= 2;
  const hasHeaders = (output.match(/^#{1,3} /gm) || []).length > 0;
  const correctness = Math.min(100, 40 + (hasCodeBlocks ? 25 : 0) + (hasHeaders ? 15 : 0) + Math.min(20, len / 100));

  // Completeness: Check length and sections
  const sectionCount = (output.match(/^#{1,3} /gm) || []).length;
  const completeness = Math.min(100, 30 + Math.min(30, sectionCount * 10) + Math.min(40, len / 50));

  // Code quality: Check for patterns
  const hasPHP = /\bfunction\b|\bclass\b|\bpublic\b|\bprivate\b/.test(output);
  const hasTypes = /\bstring\b|\bint\b|\bbool\b|\barray\b|\bvoid\b/.test(output);
  const codeQuality = Math.min(100, 50 + (hasPHP ? 20 : 0) + (hasTypes ? 15 : 0) + (hasCodeBlocks ? 15 : 0));

  // Security: Check for security mentions
  const securityTerms = ['injection', 'xss', 'csrf', 'sanitize', 'escape', 'parameterize', 'htmlspecialchars', 'prepared'];
  const securityMentions = securityTerms.filter(t => output.toLowerCase().includes(t)).length;
  const security = Math.min(100, 60 + securityMentions * 8);

  // Actionability: Check for concrete advice
  const hasSteps = /\b(step|1\.|2\.|3\.)\b/i.test(output);
  const hasCommands = /\$|composer|npm|php|git|curl/.test(output);
  const actionability = Math.min(100, 40 + (hasSteps ? 25 : 0) + (hasCommands ? 20 : 0) + (hasCodeBlocks ? 15 : 0));

  const overall = Math.round((correctness + completeness + codeQuality + security + actionability) / 5);

  return {
    overall,
    correctness: Math.round(correctness),
    completeness: Math.round(completeness),
    codeQuality: Math.round(codeQuality),
    security: Math.round(security),
    actionability: Math.round(actionability),
    reasoning: `Heuristic scoring: ${len} chars, ${sectionCount} sections, ${hasCodeBlocks ? 'has' : 'no'} code blocks`,
    confidence: 55,
    model: 'heuristic-v1',
    scoredAt: new Date().toISOString(),
  };
}

/**
 * Score history store (in-memory, replace with DB)
 */
const scoreHistory: Array<JudgeScore & { taskId: string }> = [];

export function recordScore(taskId: string, score: JudgeScore) {
  scoreHistory.push({ taskId, ...score });
  // Keep last 500
  if (scoreHistory.length > 500) scoreHistory.shift();
}

export function getScoreHistory(limit = 50) {
  return scoreHistory.slice(-limit).reverse();
}

export function getAverageScores() {
  if (scoreHistory.length === 0) return { overall: 0, count: 0 };
  const sum = scoreHistory.reduce((s, sc) => s + sc.overall, 0);
  return {
    overall: Math.round(sum / scoreHistory.length),
    count: scoreHistory.length,
    avgCorrectness: Math.round(scoreHistory.reduce((s, sc) => s + sc.correctness, 0) / scoreHistory.length),
    avgCompleteness: Math.round(scoreHistory.reduce((s, sc) => s + sc.completeness, 0) / scoreHistory.length),
    avgCodeQuality: Math.round(scoreHistory.reduce((s, sc) => s + sc.codeQuality, 0) / scoreHistory.length),
    avgSecurity: Math.round(scoreHistory.reduce((s, sc) => s + sc.security, 0) / scoreHistory.length),
    avgActionability: Math.round(scoreHistory.reduce((s, sc) => s + sc.actionability, 0) / scoreHistory.length),
  };
}
