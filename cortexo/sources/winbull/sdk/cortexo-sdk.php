<?php
/**
 * Cortexo Error Tracking SDK for PHP
 * 
 * Single-file SDK that captures PHP errors, exceptions, and fatal crashes,
 * then sends them to the Cortexo error ingest API.
 * 
 * Requirements: PHP 7.4+, cURL extension
 * No Composer needed — just require_once this file.
 * 
 * Usage:
 *   require_once __DIR__ . '/cortexo-sdk.php';
 *   CortexoSDK::init([
 *       'apiKey'      => 'proj_xxx',
 *       'endpoint'    => 'https://your-cortexo-api.com/v1/ingest/error',
 *       'client'      => 'maharaj',
 *       'environment' => 'production',
 *   ]);
 * 
 * @version 1.0.0
 * @author  Logimax Team / Cortexo
 */

class CortexoSDK
{
    /** @var string SDK version */
    const VERSION = '1.0.0';

    /** @var int Max errors to buffer before flushing */
    const MAX_BUFFER = 10;

    /** @var int Max errors per minute (rate limit) */
    const RATE_LIMIT = 50;

    /** @var array SDK configuration */
    private static $config = [
        'apiKey'      => '',
        'endpoint'    => '',
        'client'      => '',
        'environment' => 'production',
        'release'     => '',
        'serverName'  => '',
        'enabled'     => true,
        'debug'       => false,
        'timeout'     => 3,         // cURL timeout in seconds
        'sampleRate'  => 1.0,       // 1.0 = capture 100% of errors
        'excludeTypes' => [],       // error types to ignore
        'excludePaths' => [],       // file paths to ignore
    ];

    /** @var array Buffered errors waiting to be sent */
    private static $buffer = [];

    /** @var int Error count in current minute (for rate limiting) */
    private static $errorCount = 0;

    /** @var int Timestamp of current rate limit window */
    private static $rateWindow = 0;

    /** @var array Breadcrumb trail (most recent actions) */
    private static $breadcrumbs = [];

    /** @var array User context */
    private static $userContext = [];

    /** @var array Extra context tags */
    private static $extraContext = [];

    /** @var bool Whether SDK has been initialized */
    private static $initialized = false;

    /** @var array Original error handler */
    private static $previousErrorHandler = null;

    /** @var callable|null Original exception handler */
    private static $previousExceptionHandler = null;

    /**
     * Initialize the SDK. Call once at app bootstrap.
     * 
     * @param array $options Configuration options
     */
    public static function init(array $options = [])
    {
        if (self::$initialized) return;

        self::$config = array_merge(self::$config, $options);

        if (empty(self::$config['apiKey']) || empty(self::$config['endpoint'])) {
            if (self::$config['debug']) {
                error_log('[CortexoSDK] Missing apiKey or endpoint — SDK disabled');
            }
            return;
        }

        if (!self::$config['enabled']) return;

        // Auto-detect server name if not set
        if (empty(self::$config['serverName'])) {
            self::$config['serverName'] = gethostname() ?: php_uname('n');
        }

        // Register error handlers
        self::$previousErrorHandler = set_error_handler([__CLASS__, 'handleError']);
        self::$previousExceptionHandler = set_exception_handler([__CLASS__, 'handleException']);
        register_shutdown_function([__CLASS__, 'handleShutdown']);

        self::$initialized = true;

        // Add initialization breadcrumb
        self::addBreadcrumb('SDK initialized', 'sdk', [
            'client' => self::$config['client'],
            'environment' => self::$config['environment'],
        ]);
    }

    /**
     * PHP error handler callback.
     */
    public static function handleError($errno, $errstr, $errfile = '', $errline = 0)
    {
        // Don't capture if error reporting is suppressed (@)
        if (!(error_reporting() & $errno)) {
            return false;
        }

        $severity = self::phpErrorToSeverity($errno);
        $type = self::phpErrorToType($errno);

        // Check exclusions
        if (self::shouldExclude($type, $errfile)) return false;

        self::captureError([
            'type'     => $type,
            'message'  => $errstr,
            'file'     => $errfile,
            'line'     => $errline,
            'severity' => $severity,
        ]);

        // Call previous handler if exists
        if (self::$previousErrorHandler) {
            return call_user_func(self::$previousErrorHandler, $errno, $errstr, $errfile, $errline);
        }

        return false; // Let PHP handle it normally too
    }

    /**
     * Uncaught exception handler callback.
     */
    public static function handleException($exception)
    {
        $type = get_class($exception);
        
        if (self::shouldExclude($type, $exception->getFile())) {
            // Still call previous handler
            if (self::$previousExceptionHandler) {
                call_user_func(self::$previousExceptionHandler, $exception);
            }
            return;
        }

        self::captureError([
            'type'       => $type,
            'message'    => $exception->getMessage(),
            'file'       => $exception->getFile(),
            'line'       => $exception->getLine(),
            'severity'   => 'error',
            'stackTrace' => $exception->getTraceAsString(),
        ]);

        // Flush immediately for exceptions (they're usually fatal)
        self::flush();

        // Call previous handler
        if (self::$previousExceptionHandler) {
            call_user_func(self::$previousExceptionHandler, $exception);
        }
    }

    /**
     * Shutdown handler — catches fatal errors.
     */
    public static function handleShutdown()
    {
        $error = error_get_last();

        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            self::captureError([
                'type'     => 'FatalError:' . self::phpErrorToType($error['type']),
                'message'  => $error['message'],
                'file'     => $error['file'],
                'line'     => $error['line'],
                'severity' => 'critical',
            ]);
        }

        // Always flush remaining buffer on shutdown
        self::flush();
    }

    /**
     * Manually capture an exception.
     * 
     * @param \Throwable $exception
     * @param array $extra Additional context
     */
    public static function captureException($exception, array $extra = [])
    {
        self::captureError([
            'type'       => get_class($exception),
            'message'    => $exception->getMessage(),
            'file'       => $exception->getFile(),
            'line'       => $exception->getLine(),
            'severity'   => 'error',
            'stackTrace' => $exception->getTraceAsString(),
            'context'    => $extra,
        ]);
    }

    /**
     * Manually capture a message/warning.
     * 
     * @param string $message
     * @param string $severity 'info', 'warning', 'error', 'critical'
     * @param array $context
     */
    public static function captureMessage($message, $severity = 'info', array $context = [])
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
        $caller = $trace[0] ?? [];

        self::captureError([
            'type'     => 'CortexoSDK.Message',
            'message'  => $message,
            'file'     => $caller['file'] ?? '',
            'line'     => $caller['line'] ?? 0,
            'severity' => $severity,
            'context'  => $context,
        ]);
    }

    /**
     * Add a breadcrumb (action trail for debugging).
     * 
     * @param string $message
     * @param string $category e.g. 'http', 'db', 'user', 'navigation'
     * @param array $data Extra data
     */
    public static function addBreadcrumb($message, $category = 'default', array $data = [])
    {
        self::$breadcrumbs[] = [
            'message'   => $message,
            'category'  => $category,
            'data'      => $data,
            'timestamp' => date('c'),
        ];

        // Keep only last 20 breadcrumbs
        if (count(self::$breadcrumbs) > 20) {
            self::$breadcrumbs = array_slice(self::$breadcrumbs, -20);
        }
    }

    /**
     * Set user context for error attribution.
     * 
     * @param array $user ['id' => '...', 'email' => '...', 'name' => '...']
     */
    public static function setUser(array $user)
    {
        self::$userContext = $user;
    }

    /**
     * Set extra context that gets attached to every error.
     * 
     * @param string $key
     * @param mixed $value
     */
    public static function setContext($key, $value)
    {
        self::$extraContext[$key] = $value;
    }

    // ─── Internal Methods ─────────────────────────────────────────────────

    /**
     * Core capture method — buffers an error for sending.
     */
    private static function captureError(array $error)
    {
        if (!self::$initialized || !self::$config['enabled']) return;

        // Sampling
        if (self::$config['sampleRate'] < 1.0 && mt_rand() / mt_getrandmax() > self::$config['sampleRate']) {
            return;
        }

        // Rate limiting
        $now = time();
        if ($now - self::$rateWindow >= 60) {
            self::$rateWindow = $now;
            self::$errorCount = 0;
        }
        if (self::$errorCount >= self::RATE_LIMIT) {
            if (self::$config['debug']) {
                error_log('[CortexoSDK] Rate limit reached (' . self::RATE_LIMIT . '/min)');
            }
            return;
        }
        self::$errorCount++;

        // Build payload
        $payload = [
            'type'        => $error['type'] ?? 'UnknownError',
            'message'     => $error['message'] ?? '',
            'file'        => $error['file'] ?? null,
            'line'        => $error['line'] ?? null,
            'severity'    => $error['severity'] ?? 'error',
            'stackTrace'  => $error['stackTrace'] ?? null,
            'environment' => self::$config['environment'],
            'release'     => self::$config['release'] ?: null,
            'serverName'  => self::$config['serverName'],
            'sdkVersion'  => 'cortexo-php/' . self::VERSION,
            'url'         => self::getCurrentUrl(),
            'method'      => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
            'breadcrumbs' => self::$breadcrumbs,
            'context'     => array_merge(
                self::$extraContext,
                $error['context'] ?? [],
                [
                    'client'      => self::$config['client'],
                    'php_version' => PHP_VERSION,
                    'sapi'        => PHP_SAPI,
                    'memory_peak' => round(memory_get_peak_usage(true) / 1048576, 2) . 'MB',
                ]
            ),
        ];

        if (!empty(self::$userContext)) {
            $payload['userContext'] = self::$userContext;
        }

        self::$buffer[] = $payload;

        // Auto-flush when buffer is full
        if (count(self::$buffer) >= self::MAX_BUFFER) {
            self::flush();
        }
    }

    /**
     * Send all buffered errors to Cortexo API.
     */
    private static function flush()
    {
        if (empty(self::$buffer)) return;

        foreach (self::$buffer as $payload) {
            self::sendToApi($payload);
        }

        self::$buffer = [];
    }

    /**
     * Send a single error payload via cURL (non-blocking where possible).
     */
    private static function sendToApi(array $payload)
    {
        if (!function_exists('curl_init')) {
            if (self::$config['debug']) {
                error_log('[CortexoSDK] cURL not available');
            }
            return;
        }

        $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false) return;

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => self::$config['endpoint'],
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $json,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'X-Api-Key: ' . self::$config['apiKey'],
                'X-SDK-Version: cortexo-php/' . self::VERSION,
                'X-Client-Slug: ' . self::$config['client'],
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => self::$config['timeout'],
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_SSL_VERIFYPEER => true,
            // Don't wait for response body (fire-and-forget)
            CURLOPT_NOBODY         => false,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (self::$config['debug']) {
            if ($httpCode >= 200 && $httpCode < 300) {
                error_log("[CortexoSDK] Error sent successfully (HTTP $httpCode)");
            } else {
                $curlError = curl_error($ch);
                error_log("[CortexoSDK] Failed to send error (HTTP $httpCode): $curlError");
            }
        }

        curl_close($ch);
    }

    /**
     * Get current request URL.
     */
    private static function getCurrentUrl()
    {
        if (PHP_SAPI === 'cli') return 'cli://' . implode(' ', $_SERVER['argv'] ?? ['unknown']);

        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'unknown';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        return "$scheme://$host$uri";
    }

    /**
     * Check if an error should be excluded.
     */
    private static function shouldExclude($type, $file)
    {
        foreach (self::$config['excludeTypes'] as $excluded) {
            if (stripos($type, $excluded) !== false) return true;
        }
        foreach (self::$config['excludePaths'] as $excluded) {
            if (stripos($file, $excluded) !== false) return true;
        }
        return false;
    }

    /**
     * Map PHP error constants to severity levels.
     */
    private static function phpErrorToSeverity($errno)
    {
        switch ($errno) {
            case E_ERROR:
            case E_PARSE:
            case E_CORE_ERROR:
            case E_COMPILE_ERROR:
            case E_USER_ERROR:
                return 'critical';
            case E_WARNING:
            case E_CORE_WARNING:
            case E_COMPILE_WARNING:
            case E_USER_WARNING:
                return 'warning';
            case E_NOTICE:
            case E_USER_NOTICE:
            case E_STRICT:
            case E_DEPRECATED:
            case E_USER_DEPRECATED:
                return 'info';
            default:
                return 'error';
        }
    }

    /**
     * Map PHP error constants to readable type names.
     */
    private static function phpErrorToType($errno)
    {
        $map = [
            E_ERROR             => 'E_ERROR',
            E_WARNING           => 'E_WARNING',
            E_PARSE             => 'E_PARSE',
            E_NOTICE            => 'E_NOTICE',
            E_CORE_ERROR        => 'E_CORE_ERROR',
            E_CORE_WARNING      => 'E_CORE_WARNING',
            E_COMPILE_ERROR     => 'E_COMPILE_ERROR',
            E_COMPILE_WARNING   => 'E_COMPILE_WARNING',
            E_USER_ERROR        => 'E_USER_ERROR',
            E_USER_WARNING      => 'E_USER_WARNING',
            E_USER_NOTICE       => 'E_USER_NOTICE',
            E_STRICT            => 'E_STRICT',
            E_RECOVERABLE_ERROR => 'E_RECOVERABLE_ERROR',
            E_DEPRECATED        => 'E_DEPRECATED',
            E_USER_DEPRECATED   => 'E_USER_DEPRECATED',
        ];
        return $map[$errno] ?? "E_UNKNOWN($errno)";
    }
}
