/**
 * Cortexo JavaScript SDK — Browser Error Tracking
 * Version: 1.0.0
 *
 * Drop-in error monitoring for any JavaScript/TypeScript project.
 * Captures unhandled errors, promise rejections, and manual events.
 *
 * Usage (plain HTML):
 *   <script src="cortexo.js"></script>
 *   <script>
 *     Cortexo.init('sdk_your_api_key_here', { environment: 'production' });
 *   </script>
 *
 * Usage (ES module / npm):
 *   import Cortexo from './cortexo.js';
 *   Cortexo.init('sdk_your_api_key_here');
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();          // CommonJS / Node
  } else if (typeof define === 'function' && define.amd) {
    define(factory);                     // AMD
  } else {
    root.Cortexo = factory();            // Browser global
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SDK_VERSION = '1.0.0';

  let _apiKey = null;
  let _endpoint = 'http://localhost:4000/v1/ingest/error';
  let _options = {
    environment: 'production',
    release: null,
    serverName: null,
    captureUnhandledErrors: true,
    captureUnhandledRejections: true,
    captureConsoleErrors: false,
    sampleRate: 1.0,      // 0.0–1.0 — send this fraction of events
    timeout: 4000,
  };

  let _breadcrumbs = [];
  let _userContext = null;
  let _tags = {};
  let _initialized = false;

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Initialize the SDK.
   * @param {string} apiKey  Your project SDK API key
   * @param {object} options Configuration options
   */
  function init(apiKey, options) {
    _apiKey = apiKey;
    if (options) Object.assign(_options, options);
    if (options && options.endpoint) _endpoint = options.endpoint;
    if (!_options.serverName && typeof window !== 'undefined') {
      _options.serverName = window.location.hostname;
    }

    if (_options.captureUnhandledErrors && typeof window !== 'undefined') {
      window.addEventListener('error', function (event) {
        captureException({
          type: 'Error',
          message: event.message,
          file: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error ? event.error.stack : null,
        });
      });
    }

    if (_options.captureUnhandledRejections && typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', function (event) {
        var reason = event.reason;
        captureException({
          type: 'UnhandledPromiseRejection',
          message: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : null,
        });
      });
    }

    _initialized = true;
    _addBreadcrumb('Cortexo SDK initialized', 'sdk');
  }

  /**
   * Set the current user context.
   * @param {{ id?: string, email?: string, name?: string }} user
   */
  function setUser(user) {
    _userContext = {
      id: user.id || null,
      email: user.email || null,
      name: user.name || null,
    };
  }

  /**
   * Set global tags included with every event.
   * @param {object} tags
   */
  function setTags(tags) {
    Object.assign(_tags, tags);
  }

  /**
   * Add a breadcrumb to the trail.
   * @param {string} message
   * @param {string} [category]
   * @param {object} [data]
   */
  function addBreadcrumb(message, category, data) {
    _addBreadcrumb(message, category, data);
  }

  /**
   * Capture an Error object or a plain object with error info.
   * @param {Error|object} errorOrObj
   * @param {object} [extra]  Additional context
   * @returns {Promise<string|null>} errorId or null
   */
  function captureException(errorOrObj, extra) {
    if (!_initialized || !_apiKey) {
      console.warn('[Cortexo] SDK not initialized. Call Cortexo.init() first.');
      return Promise.resolve(null);
    }

    if (Math.random() > _options.sampleRate) return Promise.resolve(null);

    var payload = {};

    if (errorOrObj instanceof Error) {
      payload.type = errorOrObj.constructor.name || 'Error';
      payload.message = errorOrObj.message;
      payload.stackTrace = errorOrObj.stack;
    } else {
      payload.type = errorOrObj.type || 'Error';
      payload.message = errorOrObj.message || 'Unknown error';
      payload.file = errorOrObj.file || null;
      payload.line = errorOrObj.line || null;
      payload.stackTrace = errorOrObj.stack || null;
    }

    payload.severity = errorOrObj.severity || 'error';
    payload.context = Object.assign({}, _tags, extra || {}, {
      url: typeof window !== 'undefined' ? window.location.href : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      viewport: typeof window !== 'undefined'
        ? { width: window.innerWidth, height: window.innerHeight }
        : null,
    });

    return _send(payload);
  }

  /**
   * Capture a manual message / event.
   * @param {string} message
   * @param {string} [severity]  'info' | 'warning' | 'error' | 'critical'
   * @param {object} [context]
   * @returns {Promise<string|null>}
   */
  function captureMessage(message, severity, context) {
    if (!_initialized || !_apiKey) return Promise.resolve(null);

    return _send({
      type: 'Message',
      message: message,
      severity: severity || 'info',
      context: Object.assign({}, _tags, context || {}),
    });
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  function _addBreadcrumb(message, category, data) {
    _breadcrumbs.push({
      message: message,
      category: category || 'log',
      data: data || undefined,
      timestamp: new Date().toISOString(),
    });
    if (_breadcrumbs.length > 20) _breadcrumbs = _breadcrumbs.slice(-20);
  }

  function _send(payload) {
    var body = JSON.stringify({
      type: payload.type,
      message: payload.message,
      file: payload.file || undefined,
      line: payload.line || undefined,
      stackTrace: payload.stackTrace || undefined,
      severity: payload.severity || 'error',
      context: payload.context || undefined,
      breadcrumbs: _breadcrumbs.length > 0 ? _breadcrumbs.slice() : undefined,
      userContext: _userContext || undefined,
      environment: _options.environment,
      release: _options.release || undefined,
      serverName: _options.serverName || undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      method: undefined,
      sdkVersion: SDK_VERSION,
    });

    // Use sendBeacon when available (non-blocking, survives page unload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      var blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(_endpoint + '?key=' + encodeURIComponent(_apiKey), blob);
      return Promise.resolve(null);
    }

    // Fall back to fetch
    return fetch(_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': _apiKey,
        'User-Agent': 'Cortexo-JS/' + SDK_VERSION,
      },
      body: body,
      keepalive: true,
    })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json().then(function (data) { return data.errorId || null; });
      })
      .catch(function () { return null; });
  }

  // ─── Public export ───────────────────────────────────────────────────────

  return {
    VERSION: SDK_VERSION,
    init: init,
    setUser: setUser,
    setTags: setTags,
    addBreadcrumb: addBreadcrumb,
    captureException: captureException,
    captureMessage: captureMessage,
  };
}));
