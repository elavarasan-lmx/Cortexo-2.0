# Cortexo PHP SDK

Drop-in error monitoring for PHP/CodeIgniter applications.

## Quick Start

### 1. Copy the SDK file

Copy `src/cortexo.php` into your project:
- CodeIgniter: `application/third_party/cortexo.php`
- Plain PHP: anywhere accessible

### 2. Initialize in your app entry point

**CodeIgniter** — add to `application/config/config.php` or `application/hooks/post_controller_constructor.php`:

```php
require_once APPPATH . 'third_party/cortexo.php';

Cortexo::init('YOUR_SDK_API_KEY_HERE', [
    'environment' => ENVIRONMENT,  // 'development', 'staging', 'production'
    'release'     => '1.0.0',
    'endpoint'    => 'http://localhost:4000/v1/ingest/error',
]);
```

**Plain PHP** — add to `index.php` before any other code:

```php
require_once 'cortexo.php';
Cortexo::init('YOUR_SDK_API_KEY_HERE');
```

---

## Your Project SDK Keys

| Project | SDK Key |
|---|---|
| swarnaakarshnew | `sdk_e3a379a96ca05a97ec1a4ede743924cf619bcb9d0d67736c` |
| vijaybullion | `sdk_92c39354ee8e4806515aa8dfebbf111c882451a65cd461fe` |
| goldtech-rates | `sdk_c3f969bf171fc78337a0268c09173e4f63400de3cc2b503a` |
| bullion-admin | `sdk_0c0c26c12014579558a29acdc5fc851b13c473e2f790e6e8` |

---

## What Gets Captured Automatically

After `Cortexo::init()`:

| Error Type | Captured |
|---|---|
| PHP Warnings (`E_WARNING`) | ✅ |
| PHP Notices (`E_NOTICE`) | ✅ (configurable) |
| Uncaught Exceptions | ✅ |
| Fatal Errors (E_ERROR, E_PARSE) | ✅ |
| Deprecated Notices | ✅ |

---

## Manual Capture

### Capture a Caught Exception
```php
try {
    $this->db->query($sql);
} catch (Exception $e) {
    Cortexo::captureException($e, ['sql' => $sql]);
    show_error('Database error');
}
```

### Capture a Message / Warning
```php
Cortexo::captureMessage(
    'Gold rate API returned null — using cache',
    'warning',
    ['commodity' => 'gold', 'cache_age' => '45s']
);
```

### Set User Context (after login)
```php
// In your CI base controller __construct():
if ($this->session->userdata('user_id')) {
    Cortexo::setUser([
        'id'    => $this->session->userdata('user_id'),
        'email' => $this->session->userdata('email'),
        'name'  => $this->session->userdata('name'),
    ]);
}
```

### Add Breadcrumbs (for debugging context)
```php
Cortexo::addBreadcrumb('Rate API called', 'http', ['url' => $url]);
Cortexo::addBreadcrumb('Cache miss', 'cache');
Cortexo::addBreadcrumb('DB query', 'db', ['table' => 'rates']);
```

---

## Configuration Options

```php
Cortexo::init('sdk_...', [
    'environment'      => 'production',    // Environment label
    'release'          => '1.2.3',         // App version
    'server_name'      => 'prod-server-01',// Server label (auto-detected)
    'capture_warnings' => true,            // Capture PHP warnings
    'capture_notices'  => false,           // Capture PHP notices (noisy)
    'timeout'          => 3,               // cURL timeout (seconds)
    'endpoint'         => 'http://...',    // Cortexo API URL
]);
```

---

## Viewing Errors

Open the Cortexo dashboard: **http://localhost:3000/errors**

Errors are grouped by fingerprint (type + file + line), so the same error location counts once with an increasing event count rather than flooding your list.
