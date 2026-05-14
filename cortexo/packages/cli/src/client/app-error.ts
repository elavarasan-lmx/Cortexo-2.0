// Cortexo API error class with actionable recovery hints
// Ported from AgentBrain's api-error.ts, adapted for Cortexo workflows

/** Structured error class for Cortexo API responses */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public apiMessage: string,
    public details?: unknown
  ) {
    super(`[${statusCode}] ${apiMessage}`);
    this.name = 'AppError';
  }
}

/**
 * Map HTTP status codes to user-friendly messages with recovery hints.
 * This transforms cryptic API errors into actionable CLI guidance.
 */
export function formatAppError(err: AppError): string {
  switch (err.statusCode) {
    case 401:
      return `Authentication failed: ${err.apiMessage}\n` +
        `  Fix: cortexo config set token <your-token>\n` +
        `  Or:  cortexo config init`;
    case 403:
      return `Permission denied: ${err.apiMessage}\n` +
        `  Check your organization access or API token permissions.`;
    case 404:
      return `Not found: ${err.apiMessage}`;
    case 409:
      return `Conflict: ${err.apiMessage}`;
    case 422:
      return `Validation error: ${err.apiMessage}` +
        (err.details ? `\n  Details: ${JSON.stringify(err.details)}` : '');
    case 429:
      return `Rate limited. Please wait and try again.`;
    default:
      if (err.statusCode >= 500) {
        return `Server error (${err.statusCode}): ${err.apiMessage}\n` +
          `  Check API status: cortexo health`;
      }
      return err.message;
  }
}
