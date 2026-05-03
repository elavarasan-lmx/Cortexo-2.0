<?php

/**
 * Cortexo CodeIgniter Integration
 * ==================================
 * Drop this file into: application/config/cortexo.php
 *
 * Then in application/config/config.php (or autoload.php), add:
 *   require_once APPPATH . 'config/cortexo.php';
 *
 * Or load it in your main controller constructor:
 *   require_once APPPATH . 'config/cortexo.php';
 *
 * Get your API key from: Cortexo Dashboard → Projects → Your Project → SDK Key
 */

defined('BASEPATH') OR exit('No direct script access allowed');

// ── 1. Load the Cortexo SDK ─────────────────────────────────────────────────
require_once APPPATH . 'third_party/cortexo.php';
// OR if you placed it in the same folder:
// require_once APPPATH . 'config/cortexo-sdk.php';

// ── 2. Initialize with your project API key ──────────────────────────────────
Cortexo::init(

    // Your SDK API key — get this from Cortexo Dashboard → Projects → SDK Key
    'sdk_REPLACE_WITH_YOUR_SDK_KEY_HERE',

    [
        // Environment: 'production', 'staging', 'development'
        'environment' => ENVIRONMENT,

        // App version / git tag
        'release' => '1.0.0',

        // Server identifier (auto-detected if not set)
        'server_name' => gethostname(),

        // Capture PHP warnings (true) or only errors (false)
        'capture_warnings' => true,

        // Capture PHP notices (usually too noisy — keep false)
        'capture_notices' => false,

        // API server URL (change if Cortexo is on a different host)
        'endpoint' => 'http://localhost:4000/v1/ingest/error',

        // cURL timeout in seconds (keep low to not slow down requests)
        'timeout' => 3,
    ]
);

// ── 3. Set user context after CI session is available ───────────────────────
// Add this to your MY_Controller.php or base controller __construct():
//
//   if ($this->session->userdata('user_id')) {
//       Cortexo::setUser([
//           'id'    => $this->session->userdata('user_id'),
//           'email' => $this->session->userdata('email'),
//           'name'  => $this->session->userdata('name'),
//       ]);
//   }
//
// ── 4. Add breadcrumbs for better debugging ──────────────────────────────────
// Add these at key points in your code:
//
//   Cortexo::addBreadcrumb('Rate API called', 'http', ['url' => $url]);
//   Cortexo::addBreadcrumb('DB query: SELECT rates', 'db');
//   Cortexo::addBreadcrumb('Cache miss — fetching live rates', 'cache');
//
// ── 5. Catch known exceptions but still report them ──────────────────────────
//
//   try {
//       $this->db->query($sql);
//   } catch (Exception $e) {
//       Cortexo::captureException($e, ['sql' => $sql, 'user_id' => $userId]);
//       show_error('Database error — please try again.');
//   }
//
// ── 6. Manual messages / warnings ────────────────────────────────────────────
//
//   Cortexo::captureMessage(
//       'Gold rate API returned null price — using cache',
//       'warning',
//       ['commodity' => 'gold', 'cache_age' => '45s']
//   );
