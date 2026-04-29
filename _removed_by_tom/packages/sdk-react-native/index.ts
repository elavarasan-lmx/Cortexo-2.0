/**
 * Cortexo React Native SDK
 * Version: 1.0.0
 *
 * Error monitoring for React Native apps (iOS + Android).
 *
 * Installation:
 *   npm install @cortexo/sdk-react-native
 *
 * Usage in App.tsx / index.js:
 *   import Cortexo from '@cortexo/sdk-react-native';
 *
 *   Cortexo.init({ apiKey: 'sdk_your_key', environment: 'production' });
 *
 *   // Wrap your root component:
 *   export default Cortexo.withErrorBoundary(App);
 */

import { Platform, AppState } from 'react-native';

const SDK_VERSION = '1.0.0';
const DEFAULT_ENDPOINT = 'https://api.cortexo.io/v1/ingest/error';

interface CortexoConfig {
  apiKey: string;
  endpoint?: string;
  environment?: string;
  release?: string;
  debug?: boolean;
}

interface Breadcrumb {
  message: string;
  category?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

interface UserContext {
  id?: string;
  email?: string;
  name?: string;
}

class CortexoSDK {
  private config: Required<CortexoConfig> | null = null;
  private breadcrumbs: Breadcrumb[] = [];
  private userContext: UserContext | null = null;
  private tags: Record<string, string> = {};
  private initialized = false;

  /**
   * Initialize the SDK. Call once in your app entry point.
   */
  init(config: CortexoConfig): void {
    this.config = {
      apiKey: config.apiKey,
      endpoint: config.endpoint || DEFAULT_ENDPOINT,
      environment: config.environment || 'production',
      release: config.release || '1.0.0',
      debug: config.debug || false,
    };
    this.initialized = true;

    // Install global error handlers
    this._installErrorHandlers();

    if (this.config.debug) {
      console.log(`[Cortexo] Initialized for ${this.config.environment}`);
    }

    this.addBreadcrumb('Cortexo SDK initialized', 'sdk');
  }

  /**
   * Set the current user (call after login).
   */
  setUser(user: UserContext): void {
    this.userContext = user;
  }

  /**
   * Clear user (call after logout).
   */
  clearUser(): void {
    this.userContext = null;
  }

  /**
   * Add a global tag included with every event.
   */
  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  /**
   * Add a breadcrumb to the trail (max 20 stored).
   */
  addBreadcrumb(message: string, category = 'log', data?: Record<string, unknown>): void {
    this.breadcrumbs.push({
      message,
      category,
      data,
      timestamp: new Date().toISOString(),
    });
    if (this.breadcrumbs.length > 20) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Capture an exception manually.
   */
  async captureException(
    error: Error | unknown,
    options?: { severity?: 'critical' | 'error' | 'warning' | 'info'; extra?: Record<string, unknown> }
  ): Promise<string | null> {
    if (!this.initialized || !this.config) {
      console.warn('[Cortexo] Not initialized. Call Cortexo.init() first.');
      return null;
    }

    const err = error instanceof Error ? error : new Error(String(error));

    return this._send({
      type: err.name || 'Error',
      message: err.message,
      stackTrace: err.stack,
      severity: options?.severity || 'error',
      extra: options?.extra,
    });
  }

  /**
   * Capture a message manually.
   */
  async captureMessage(
    message: string,
    severity: 'critical' | 'error' | 'warning' | 'info' = 'info'
  ): Promise<string | null> {
    if (!this.initialized) return null;
    return this._send({ type: 'Message', message, severity });
  }

  /**
   * Higher-order component — wraps a component with an error boundary.
   * Usage: export default Cortexo.withErrorBoundary(App);
   */
  withErrorBoundary<T extends object>(Component: React.ComponentType<T>) {
    const cortexo = this;

    // We import React lazily to avoid requiring it in non-React environments
    const React = require('react');

    return class CortexoErrorBoundary extends React.Component<T, { hasError: boolean }> {
      constructor(props: T) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError() {
        return { hasError: true };
      }

      componentDidCatch(error: Error, info: React.ErrorInfo) {
        cortexo.captureException(error, { extra: { componentStack: info.componentStack } });
      }

      render() {
        if (this.state.hasError) {
          return React.createElement(
            React.Fragment,
            null,
            // Fallback UI — customize as needed
            null
          );
        }
        return React.createElement(Component, this.props);
      }
    };
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private _installErrorHandlers(): void {
    // Handle unhandled JS errors
    const prevHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.captureException(error, { severity: isFatal ? 'critical' : 'error', extra: { isFatal } });
      prevHandler?.(error, isFatal);
    });

    // Handle unhandled promise rejections
    const origRejectionHandler = (global as any).onunhandledrejection;
    (global as any).onunhandledrejection = (event: PromiseRejectionEvent) => {
      this.captureException(event.reason, { severity: 'error', extra: { type: 'unhandledRejection' } });
      origRejectionHandler?.(event);
    };

    // Track app state changes as breadcrumbs
    AppState.addEventListener('change', (state) => {
      this.addBreadcrumb(`App state: ${state}`, 'app.lifecycle');
    });
  }

  private async _send(event: {
    type: string;
    message: string;
    stackTrace?: string;
    severity?: string;
    extra?: Record<string, unknown>;
  }): Promise<string | null> {
    if (!this.config) return null;

    const payload = {
      type: event.type,
      message: event.message,
      severity: event.severity || 'error',
      stackTrace: event.stackTrace,
      environment: this.config.environment,
      release: this.config.release,
      sdkVersion: SDK_VERSION,
      serverName: `RN-${Platform.OS}`,
      context: {
        ...this.tags,
        ...event.extra,
        platform: Platform.OS,
        platformVersion: String(Platform.Version),
        sdkType: 'react-native',
      },
      breadcrumbs: [...this.breadcrumbs],
      userContext: this.userContext,
    };

    if (this.config.debug) {
      console.log('[Cortexo] Sending event:', payload.type, payload.message);
    }

    try {
      const res = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.config.apiKey,
          'User-Agent': `Cortexo-ReactNative/${SDK_VERSION}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return data.errorId || null;
      }
    } catch (e) {
      // SDK must never crash the app
      if (this.config.debug) console.warn('[Cortexo] Failed to send event:', e);
    }
    return null;
  }
}

// Singleton export
const Cortexo = new CortexoSDK();
export default Cortexo;
export { CortexoSDK };
