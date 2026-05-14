// Cortexo typed HTTP client — handles auth, timeouts, envelope unwrap, and SSE streaming
// Ported from AgentBrain's http-client.ts, adapted for Cortexo's Fastify API

import { CortexoConfig } from '../config/config-schema.js';
import { AppError } from './app-error.js';

/**
 * Typed HTTP client for the Cortexo Fastify API.
 *
 * Features:
 * - Auto-injects Authorization header from config token
 * - Auto-unwraps Cortexo's `{ data: T }` response envelope
 * - Configurable timeout via AbortController
 * - SSE streaming support for live log viewer
 * - Verbose mode for debugging (prints to stderr)
 */
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;
  private verbose: boolean;

  constructor(config: CortexoConfig, verbose = false) {
    // Cortexo API is mounted at /v1 — baseUrl should include it
    this.baseUrl = config.apiUrl.replace(/\/$/, '');
    this.timeout = config.timeout;
    this.verbose = verbose;

    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (config.token) {
      this.headers['Authorization'] = `Bearer ${config.token}`;
    }
    if (config.orgId) {
      this.headers['X-Org-ID'] = config.orgId;
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>('GET', url);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>('POST', url, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>('PUT', url, body);
  }

  async delete<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>('DELETE', url);
  }

  /**
   * SSE streaming — connects to Cortexo's log-stream endpoint.
   * Uses Cortexo's existing named events (connected, log, done).
   */
  async stream(path: string, onEvent: (data: string) => void): Promise<void> {
    const url = this.buildUrl(path);
    const controller = new AbortController();

    if (this.verbose) {
      console.error(`SSE ${url}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { ...this.headers, Accept: 'text/event-stream' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(response.status, `SSE connection failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body for SSE stream');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            onEvent(line.slice(6));
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  private async request<T>(method: string, url: string, body?: unknown): Promise<T> {
    const start = Date.now();

    if (this.verbose) {
      console.error(`${method} ${url}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const duration = Date.now() - start;

      if (this.verbose) {
        console.error(`${response.status} ${response.statusText} (${duration}ms)`);
      }

      const text = await response.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!response.ok) {
        const msg = (data as Record<string, unknown>)?.error ??
          (data as Record<string, unknown>)?.message ??
          response.statusText;
        throw new AppError(response.status, String(msg), data);
      }

      // Unwrap Cortexo's { data: T } envelope (used by all routes like servers.ts)
      if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
        return (data as Record<string, unknown>).data as T;
      }
      return data as T;
    } catch (err) {
      if (err instanceof AppError) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new AppError(408, `Request timed out after ${this.timeout}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
