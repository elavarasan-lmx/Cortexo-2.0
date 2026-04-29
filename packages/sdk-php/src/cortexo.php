<?php

/**
 * Cortexo PHP SDK — Error Tracking & Monitoring
 * Version: 1.0.0
 *
 * Drop-in error monitoring for PHP/CodeIgniter projects.
 * Captures PHP errors, exceptions, and manual events.
 *
 * Usage:
 *   require_once 'cortexo.php';
 *   Cortexo::init('sdk_your_api_key_here');
 *
 * Or with options:
 *   Cortexo::init('sdk_your_api_key_here', [
 *     'environment'  => 'production',
 *     'release'      => '1.2.3',
 *     'server_name'  => 'prod-server-01',
 *   ]);
 */

class Cortexo
{
    /** @var string SDK version */
    const VERSION = '1.0.0';

    /** @var string|null API key */
    private static $apiKey = null;

    /** @var string API endpoint */
    private static $endpoint = 'http://localhost:4000/v1/ingest/error';

    /** @var array SDK options */
    private static $options = [
        'environment'  => 'production',
        'release'      => null,
        'server_name'  => null,
        'capture_warnings' => true,
        'capture_notices'  => false,
        'timeout'      => 3,
    ];

    /** @var array Breadcrumb trail (last N events leading to an error) */
    private static $breadcrumbs = [];

    /** @var array User context set via setUser() */
    private static $userContext = null;

    /** @var bool Whether SDK is initialized */
    private static $initialized = false;

    /**
     * Initialize Cortexo SDK.
     *
     * @param string $apiKey   Your project SDK API key (from Cortexo dashboard)
     * @param array  $options  Optional configuration
     */
    public static function init(string $apiKey, array $options = []): void
    {
        self::$apiKey = $apiKey;
        self::$options = array_merge(self::$options, $options);

        if (isset($options['endpoint'])) {
            self::$endpoint = $options['endpoint'];
        }

        if (!self::$options['server_name']) {
            self::$options['server_name'] = gethostname();
        }

        // Register PHP error handlers
        set_error_handler([self::class, 'handlePhpError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleShutdown']);

        self::$initialized = true;
    }

    /**
     * Set the current user context.
     * Call this after user login so errors are linked to the user.
     */
    public static function setUser(array $user): void
    {
        self::$userContext = [
            'id'    => $user['id'] ?? null,
            'email' => $user['email'] ?? null,
            'name'  => $user['name'] ?? null,
        ];
    }

    /**
     * Add a breadcrumb — a trail of events leading up to an error.
     * Call this at key points in your code (e.g., before DB queries, API calls).
     */
    public static function addBreadcrumb(string $message, string $category = 'log', array $data = []): void
    {
        self::$breadcrumbs[] = [
            'message'   => $message,
            'category'  => $category,
            'data'      => $data,
            'timestamp' => date('c'),
        ];

        // Keep only the last 20 breadcrumbs
        if (count(self::$breadcrumbs) > 20) {
            self::$breadcrumbs = array_slice(self::$breadcrumbs, -20);
        }
    }

    /**
     * Capture an exception manually.
     * Use this for caught exceptions you still want to track.
     *
     * Example:
     *   try {
     *     $db->query($sql);
     *   } catch (Exception $e) {
     *     Cortexo::captureException($e);
     *   }
     */
    public static function captureException(\Throwable $e, array $extra = []): ?string
    {
        return self::send([
            'type'       => get_class($e),
            'message'    => $e->getMessage(),
            'file'       => $e->getFile(),
            'line'       => $e->getLine(),
            'stackTrace' => $e->getTraceAsString(),
            'severity'   => 'error',
            'context'    => array_merge(self::getRequestContext(), $extra),
        ]);
    }

    /**
     * Capture a custom message/event.
     *
     * Example:
     *   Cortexo::captureMessage('Payment gateway timeout', 'warning', ['gateway' => 'PayU']);
     */
    public static function captureMessage(string $message, string $severity = 'info', array $context = []): ?string
    {
        return self::send([
            'type'     => 'Message',
            'message'  => $message,
            'severity' => $severity,
            'context'  => array_merge(self::getRequestContext(), $context),
        ]);
    }

    // ─── Internal PHP Error Handlers ─────────────────────────────────────────

    /**
     * PHP set_error_handler callback.
     */
    public static function handlePhpError(int $errno, string $errstr, string $errfile, int $errline): bool
    {
        $severityMap = [
            E_ERROR        => 'critical',
            E_WARNING      => 'warning',
            E_NOTICE       => 'info',
            E_DEPRECATED   => 'info',
            E_USER_ERROR   => 'error',
            E_USER_WARNING => 'warning',
            E_USER_NOTICE  => 'info',
        ];

        $typeMap = [
            E_ERROR        => 'FatalError',
            E_WARNING      => 'Warning',
            E_NOTICE       => 'Notice',
            E_DEPRECATED   => 'Deprecated',
            E_USER_ERROR   => 'UserError',
            E_USER_WARNING => 'UserWarning',
            E_USER_NOTICE  => 'UserNotice',
        ];

        $severity = $severityMap[$errno] ?? 'error';
        $type     = $typeMap[$errno] ?? 'PHPError';

        // Skip notices unless configured
        if ($errno === E_NOTICE && !self::$options['capture_notices']) {
            return false;
        }

        // Skip warnings unless configured
        if ($errno === E_WARNING && !self::$options['capture_warnings']) {
            return false;
        }

        self::send([
            'type'     => $type,
            'message'  => $errstr,
            'file'     => $errfile,
            'line'     => $errline,
            'severity' => $severity,
            'context'  => self::getRequestContext(),
        ]);

        // Return false to allow PHP's built-in error handler to run too
        return false;
    }

    /**
     * PHP set_exception_handler callback.
     */
    public static function handleException(\Throwable $e): void
    {
        self::captureException($e);
    }

    /**
     * PHP register_shutdown_function callback — catches fatal errors.
     */
    public static function handleShutdown(): void
    {
        $error = error_get_last();
        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            self::send([
                'type'     => 'FatalError',
                'message'  => $error['message'],
                'file'     => $error['file'],
                'line'     => $error['line'],
                'severity' => 'critical',
                'context'  => self::getRequestContext(),
            ]);
        }
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Build HTTP request context from PHP superglobals.
     */
    private static function getRequestContext(): array
    {
        return [
            'server' => $_SERVER['SERVER_NAME'] ?? null,
            'php'    => PHP_VERSION,
        ];
    }

    /**
     * Send error payload to the Cortexo API.
     * Non-blocking: uses cURL with a short timeout to avoid slowing down the app.
     *
     * @return string|null The errorId returned by the API, or null on failure.
     */
    private static function send(array $payload): ?string
    {
        if (!self::$initialized || !self::$apiKey) {
            return null;
        }

        $body = array_filter([
            'type'        => $payload['type'] ?? 'Unknown',
            'message'     => $payload['message'] ?? '',
            'file'        => $payload['file'] ?? null,
            'line'        => $payload['line'] ?? null,
            'stackTrace'  => $payload['stackTrace'] ?? null,
            'severity'    => $payload['severity'] ?? 'error',
            'context'     => $payload['context'] ?? null,
            'breadcrumbs' => self::$breadcrumbs ?: null,
            'userContext' => self::$userContext,
            'environment' => self::$options['environment'],
            'release'     => self::$options['release'],
            'serverName'  => self::$options['server_name'],
            'url'         => self::getCurrentUrl(),
            'method'      => $_SERVER['REQUEST_METHOD'] ?? null,
            'sdkVersion'  => self::VERSION,
        ], fn($v) => $v !== null);

        $json = json_encode($body);

        $ch = curl_init(self::$endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $json,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'X-Api-Key: ' . self::$apiKey,
                'User-Agent: Cortexo-PHP/' . self::VERSION,
            ],
            CURLOPT_TIMEOUT        => self::$options['timeout'],
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response && $httpCode === 202) {
            $data = json_decode($response, true);
            return $data['errorId'] ?? null;
        }

        return null;
    }

    /**
     * Get the current request URL.
     */
    private static function getCurrentUrl(): ?string
    {
        if (empty($_SERVER['HTTP_HOST'])) {
            return null;
        }
        $scheme = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
        return $scheme . '://' . $_SERVER['HTTP_HOST'] . ($_SERVER['REQUEST_URI'] ?? '/');
    }
}
