/**
 * Cortexo Node.js SDK
 * Error tracking for server-side applications (<50KB)
 *
 * Usage:
 *   const Cortexo = require('@cortexo/node');
 *   Cortexo.init({ apiKey: 'ctx_proj_xxx', environment: 'production' });
 *   app.use(Cortexo.expressErrorHandler());
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

interface CortexoOptions {
  apiKey: string;
  environment?: string;
  release?: string;
  endpoint?: string;
  maxBreadcrumbs?: number;
  beforeSend?: (event: ErrorPayload) => ErrorPayload | null;
}

interface ErrorPayload {
  type: string;
  message: string;
  stack_trace?: string;
  severity: string;
  context: Record<string, unknown>;
  breadcrumbs: Breadcrumb[];
  environment: string;
  release?: string;
  timestamp: string;
  runtime: string;
  nodeVersion: string;
  user?: Record<string, unknown>;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

interface Breadcrumb {
  message: string;
  category: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class CortexoNodeSDK {
  private apiKey = '';
  private endpoint = 'https://ingest.cortexo.io/v1/errors';
  private environment = 'production';
  private release?: string;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private user?: Record<string, unknown>;
  private tags: Record<string, string> = {};
  private initialized = false;
  private beforeSend?: (event: ErrorPayload) => ErrorPayload | null;

  /**
   * Initialize the SDK
   */
  init(options: CortexoOptions): void {
    this.apiKey = options.apiKey;
    this.environment = options.environment || 'production';
    this.release = options.release;
    this.endpoint = options.endpoint || this.endpoint;
    this.maxBreadcrumbs = options.maxBreadcrumbs || 50;
    this.beforeSend = options.beforeSend;

    if (!this.apiKey) {
      console.warn('[Cortexo] Missing API key');
      return;
    }

    // Global uncaught exception handler
    process.on('uncaughtException', (error: Error) => {
      this.captureException(error, { mechanism: 'uncaughtException' });
      // Allow process to exit naturally
    });

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason: unknown) => {
      if (reason instanceof Error) {
        this.captureException(reason, { mechanism: 'unhandledRejection' });
      } else {
        this.captureMessage(String(reason), 'error');
      }
    });

    this.initialized = true;
    this.addBreadcrumb('Cortexo Node SDK initialized', 'sdk');
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, extra?: Record<string, unknown>): void {
    if (!this.initialized) return;

    const event = this.buildEvent({
      type: error.name || 'Error',
      message: error.message,
      stack_trace: error.stack,
      severity: 'error',
      extra,
    });

    this.send(event);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: string = 'info'): void {
    if (!this.initialized) return;

    const event = this.buildEvent({
      type: 'Message',
      message,
      severity: level,
    });

    this.send(event);
  }

  /**
   * Add a breadcrumb
   */
  addBreadcrumb(message: string, category: string = 'default', data?: Record<string, unknown>): void {
    this.breadcrumbs.push({
      message,
      category,
      data,
      timestamp: new Date().toISOString(),
    });

    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Set user context
   */
  setUser(user: Record<string, unknown>): void {
    this.user = user;
  }

  /**
   * Set a tag
   */
  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  /**
   * Set release version
   */
  setRelease(release: string): void {
    this.release = release;
  }

  /**
   * Express error handler middleware
   */
  expressErrorHandler() {
    return (err: Error, req: any, res: any, next: any) => {
      this.addBreadcrumb(`${req.method} ${req.url}`, 'http', {
        status: res.statusCode,
        method: req.method,
        url: req.url,
      });

      this.captureException(err, {
        request: {
          method: req.method,
          url: req.url,
          headers: req.headers,
          query: req.query,
          body: req.body,
          ip: req.ip,
        },
      });

      next(err);
    };
  }

  /**
   * Request handler middleware (adds breadcrumbs for each request)
   */
  requestHandler() {
    return (req: any, _res: any, next: any) => {
      this.addBreadcrumb(`${req.method} ${req.url}`, 'http', {
        method: req.method,
        url: req.url,
      });
      next();
    };
  }

  // ─── Private ───

  private buildEvent(partial: Partial<ErrorPayload>): ErrorPayload {
    return {
      type: partial.type || 'Error',
      message: partial.message || 'Unknown error',
      stack_trace: partial.stack_trace,
      severity: partial.severity || 'error',
      context: {},
      breadcrumbs: [...this.breadcrumbs],
      environment: this.environment,
      release: this.release,
      timestamp: new Date().toISOString(),
      runtime: 'node',
      nodeVersion: process.version,
      user: this.user,
      tags: { ...this.tags },
      extra: partial.extra,
    };
  }

  private send(event: ErrorPayload): void {
    if (this.beforeSend) {
      const filtered = this.beforeSend(event);
      if (!filtered) return;
      event = filtered;
    }

    try {
      const payload = JSON.stringify(event);
      const url = new URL(this.endpoint);
      const transport = url.protocol === 'https:' ? https : http;

      const req = transport.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'X-API-Key': this.apiKey,
          },
          timeout: 2000,
        },
        () => { /* response consumed */ }
      );

      req.on('error', () => { /* SDK errors never crash user app */ });
      req.write(payload);
      req.end();
    } catch {
      /* SDK errors never crash user app */
    }
  }
}

const Cortexo = new CortexoNodeSDK();
export = Cortexo;
