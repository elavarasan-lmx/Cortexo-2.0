/**
 * Cortexo Browser SDK
 * Lightweight error tracking for web applications (<10KB)
 *
 * Usage:
 *   import { Cortexo } from '@cortexo/browser';
 *   Cortexo.init('ctx_proj_xxxxxxxxxxxxxxxx');
 *
 * Or via CDN:
 *   <script src="https://cdn.cortexo.io/sdk.min.js" data-key="ctx_proj_xxx"></script>
 */

interface CortexoOptions {
  apiKey: string;
  environment?: string;
  release?: string;
  endpoint?: string;
  maxBreadcrumbs?: number;
  enableConsoleCapture?: boolean;
  enableNetworkCapture?: boolean;
  enableWebVitals?: boolean;
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null;
}

interface ErrorEvent {
  type: string;
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  context: Record<string, unknown>;
  breadcrumbs: Breadcrumb[];
  environment: string;
  release?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  user?: UserContext;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

interface Breadcrumb {
  message: string;
  category: string;
  data?: Record<string, unknown>;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
}

interface UserContext {
  id?: string | number;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

class CortexoSDK {
  private apiKey = '';
  private endpoint = 'https://ingest.cortexo.io/v1/errors';
  private environment = 'production';
  private release?: string;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 20;
  private user?: UserContext;
  private tags: Record<string, string> = {};
  private initialized = false;
  private beforeSend?: (event: ErrorEvent) => ErrorEvent | null;

  /**
   * Initialize the Cortexo SDK
   */
  init(apiKeyOrOptions: string | CortexoOptions): void {
    if (typeof apiKeyOrOptions === 'string') {
      this.apiKey = apiKeyOrOptions;
    } else {
      this.apiKey = apiKeyOrOptions.apiKey;
      this.environment = apiKeyOrOptions.environment || 'production';
      this.release = apiKeyOrOptions.release;
      this.endpoint = apiKeyOrOptions.endpoint || this.endpoint;
      this.maxBreadcrumbs = apiKeyOrOptions.maxBreadcrumbs || 20;
      this.beforeSend = apiKeyOrOptions.beforeSend;
    }

    if (!this.apiKey) {
      console.warn('[Cortexo] Missing API key');
      return;
    }

    this.setupGlobalHandlers();
    this.initialized = true;
    this.addBreadcrumb('Cortexo SDK initialized', 'sdk');
  }

  /**
   * Capture an exception manually
   */
  captureException(error: Error, extra?: Record<string, unknown>): void {
    if (!this.initialized) return;

    const event = this.buildEvent({
      type: error.name || 'Error',
      message: error.message,
      stack: error.stack,
      severity: 'error',
      extra,
    });

    this.send(event);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
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
      level: 'info',
    });

    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Set user context
   */
  setUser(user: UserContext): void {
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

  // ─── Private ───

  private setupGlobalHandlers(): void {
    // Unhandled exceptions
    window.addEventListener('error', (e) => {
      this.addBreadcrumb(`Uncaught ${e.error?.name || 'Error'}: ${e.message}`, 'error');
      const event = this.buildEvent({
        type: e.error?.name || 'Error',
        message: e.message,
        stack: e.error?.stack,
        file: e.filename,
        line: e.lineno,
        column: e.colno,
        severity: 'error',
      });
      this.send(event);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      const reason = e.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;

      this.addBreadcrumb(`Unhandled rejection: ${message}`, 'error');
      const event = this.buildEvent({
        type: 'UnhandledRejection',
        message,
        stack,
        severity: 'error',
      });
      this.send(event);
    });

    // Console error capture
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      this.addBreadcrumb(args.map(String).join(' '), 'console');
      originalError.apply(console, args);
    };

    // Network error capture (fetch)
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.addBreadcrumb(`HTTP ${response.status} ${url}`, 'http', {
            status: response.status,
            method: (args[1] as RequestInit)?.method || 'GET',
          });
        }
        return response;
      } catch (err) {
        this.addBreadcrumb(`Network error: ${url}`, 'http', { error: String(err) });
        throw err;
      }
    };
  }

  private buildEvent(partial: Partial<ErrorEvent>): ErrorEvent {
    return {
      type: partial.type || 'Error',
      message: partial.message || 'Unknown error',
      stack: partial.stack,
      file: partial.file,
      line: partial.line,
      column: partial.column,
      severity: partial.severity || 'error',
      context: {},
      breadcrumbs: [...this.breadcrumbs],
      environment: this.environment,
      release: this.release,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      user: this.user,
      tags: { ...this.tags },
      extra: partial.extra,
    };
  }

  private send(event: ErrorEvent): void {
    if (this.beforeSend) {
      const filtered = this.beforeSend(event);
      if (!filtered) return;
      event = filtered;
    }

    // Use sendBeacon for reliability, fallback to fetch
    const payload = JSON.stringify(event);

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(this.endpoint, blob);
      if (sent) return;
    }

    // Fallback
    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      /* SDK errors never crash the user's app */
    });
  }
}

// Singleton export
export const Cortexo = new CortexoSDK();
export default Cortexo;

// Auto-init from data attributes (CDN usage)
if (typeof document !== 'undefined') {
  const script = document.currentScript as HTMLScriptElement | null;
  if (script?.dataset.key) {
    Cortexo.init({
      apiKey: script.dataset.key,
      environment: script.dataset.environment || 'production',
    });
  }
}
