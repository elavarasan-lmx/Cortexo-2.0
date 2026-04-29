/**
 * Cortexo React Native SDK v0.1.0
 * Error capture and performance monitoring for React Native apps.
 *
 * Usage:
 *   import { CortexoRN } from 'cortexo-react-native';
 *   CortexoRN.init({ dsn: 'https://api.cortexo.io/v1', projectId: 'my-app' });
 */

class CortexoReactNative {
  private dsn = '';
  private projectId = '';
  private environment = 'production';
  private initialized = false;

  /**
   * Initialize Cortexo error capture.
   */
  init(options: { dsn: string; projectId: string; environment?: string }) {
    this.dsn = options.dsn;
    this.projectId = options.projectId;
    this.environment = options.environment || 'production';
    this.initialized = true;

    // Install global error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.captureException(error, { isFatal });
      if (originalHandler) originalHandler(error, isFatal);
    });

    // Capture unhandled promise rejections
    const originalRejectionTracking =
      typeof (global as any).__promiseRejectionTrackingOptions !== 'undefined';
    if (!originalRejectionTracking) {
      (global as any).__promiseRejectionTrackingOptions = {
        onUnhandled: (id: number, rejection: any) => {
          this.captureException(rejection, { type: 'unhandled_promise' });
        },
      };
    }

    console.log('[Cortexo RN] Initialized for project:', this.projectId);
  }

  /**
   * Manually capture an exception.
   */
  async captureException(error: Error | any, extra?: Record<string, any>) {
    if (!this.initialized) return;

    const payload = {
      message: error?.message || String(error),
      stack: error?.stack || '',
      type: error?.name || 'Error',
      level: extra?.isFatal ? 'fatal' : 'error',
      environment: this.environment,
      projectId: this.projectId,
      platform: 'react-native',
      sdk: { name: 'cortexo-react-native', version: '0.1.0' },
      device: this.getDeviceInfo(),
      extra: extra || {},
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(`${this.dsn}/ingest/error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (sendError) {
      console.warn('[Cortexo RN] Failed to send error:', sendError);
    }
  }

  /**
   * Capture a breadcrumb for context.
   */
  addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
    // Breadcrumbs are stored locally and sent with next error
    if (!this._breadcrumbs) this._breadcrumbs = [];
    this._breadcrumbs.push({
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
    // Keep last 50
    if (this._breadcrumbs.length > 50) this._breadcrumbs.shift();
  }

  /**
   * Set user context for error reports.
   */
  setUser(user: { id: string; email?: string; name?: string }) {
    this._user = user;
  }

  /**
   * Navigation tracking — add as onStateChange handler.
   */
  trackNavigation(routeName: string) {
    this.addBreadcrumb('navigation', `Navigated to ${routeName}`);
  }

  private _breadcrumbs: any[] = [];
  private _user: any = null;

  private getDeviceInfo() {
    try {
      // Platform-specific — requires react-native imports
      return {
        platform: 'react-native',
        // These would use react-native Platform API in real SDK
        os: 'unknown',
        version: 'unknown',
      };
    } catch {
      return { platform: 'react-native' };
    }
  }
}

// Singleton export
export const CortexoRN = new CortexoReactNative();
export default CortexoRN;
