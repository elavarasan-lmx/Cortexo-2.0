# SDK Design & API Reference — Cortexo DevOps Platform

> **Parent Document:** [PRD v134](file:///D:/Cortexo/docs/01_PRD.md)
> **Last Updated:** 2026-04-23 | **Status:** Synced with PRD v134 (134 features / 21 categories)

---

## 1. SDK Design

### Design Principles
- **One-line install** — Capturing errors within 2 minutes
- **Zero config** — Just the API key, everything else auto-detected
- **Lightweight** — <10KB for browser SDK, <50KB for server SDKs
- **Non-blocking** — SDK errors never crash the user's application
- **Privacy-first** — No PII captured by default

---

### 1.1 PHP SDK (Primary — 70+ client panels)

```bash
composer require cortexo/php-sdk
```

```php
<?php
require_once 'vendor/autoload.php';
\Cortexo\SDK::init('ctx_proj_xxxxxxxxxxxxxxxx');
```

#### How It Works
```php
namespace Cortexo;

class SDK {
    private static $apiKey;
    private static $endpoint = 'https://ingest.cortexo.io/v1/errors';
    
    public static function init(string $apiKey, array $options = []): void {
        self::$apiKey = $apiKey;
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleShutdown']);
    }
    
    public static function handleException(\Throwable $e): void {
        self::send([
            'type'        => get_class($e),
            'message'     => $e->getMessage(),
            'file'        => $e->getFile(),
            'line'        => $e->getLine(),
            'stack_trace' => $e->getTraceAsString(),
            'severity'    => 'error',
            'context'     => self::getContext(),
            'environment' => getenv('APP_ENV') ?: 'production',
            'timestamp'   => gmdate('c'),
        ]);
    }
    
    private static function getContext(): array {
        return [
            'url'        => $_SERVER['REQUEST_URI'] ?? '',
            'method'     => $_SERVER['REQUEST_METHOD'] ?? '',
            'ip'         => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'php_version'=> PHP_VERSION,
            'server'     => php_uname(),
        ];
    }
    
    private static function send(array $payload): void {
        $ch = curl_init(self::$endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'X-API-Key: ' . self::$apiKey,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT_MS     => 2000,
            CURLOPT_NOSIGNAL       => 1,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
}
```

#### Advanced Usage
```php
// Set user context
\Cortexo\SDK::setUser([
    'id'    => $user->id,
    'email' => $user->email,
    'name'  => $user->name,
]);

// Add breadcrumb
\Cortexo\SDK::addBreadcrumb('Clicked checkout button');
\Cortexo\SDK::addBreadcrumb('API call to /api/payment', ['amount' => 5000]);

// Manual error capture
try {
    processPayment($order);
} catch (\Exception $e) {
    \Cortexo\SDK::captureException($e, [
        'order_id' => $order->id,
        'amount'   => $order->amount,
    ]);
}

// Set release version
\Cortexo\SDK::setRelease('v1.2.3');
```

---

### 1.2 JavaScript (Browser) SDK

```html
<script 
  src="https://cdn.cortexo.io/sdk.min.js" 
  data-key="ctx_proj_xxxxxxxxxxxxxxxx"
  data-environment="production"
  crossorigin="anonymous"
></script>
```

Or via npm:
```bash
npm install @cortexo/browser
```
```javascript
import { Cortexo } from '@cortexo/browser';
Cortexo.init('ctx_proj_xxxxxxxxxxxxxxxx');
```

**Auto-captures:** Unhandled exceptions, promise rejections, console errors, network errors, Core Web Vitals, breadcrumbs (last 20).

---

### 1.3 Node.js SDK

```bash
npm install @cortexo/node
```

```javascript
const Cortexo = require('@cortexo/node');
Cortexo.init({
  apiKey: 'ctx_proj_xxxxxxxxxxxxxxxx',
  environment: process.env.NODE_ENV || 'production',
  release: process.env.APP_VERSION,
});

// Express middleware
app.use(Cortexo.expressErrorHandler());
```

---

### 1.4 Python SDK

```bash
pip install cortexo
```

```python
import cortexo
cortexo.init(api_key="ctx_proj_xxxxxxxxxxxxxxxx", environment="production")

# Django middleware
MIDDLEWARE = ['cortexo.django.CortexoMiddleware']

# Flask
from cortexo.flask import CortexoFlask
CortexoFlask(app, api_key="ctx_proj_xxxxxxxxxxxxxxxx")
```

---

### 1.5 Flutter SDK (NEW — F121)

```yaml
# pubspec.yaml
dependencies:
  cortexo_flutter: ^1.0.0
```

```dart
import 'package:cortexo_flutter/cortexo_flutter.dart';

void main() async {
  await Cortexo.init(
    apiKey: 'ctx_proj_xxxxxxxxxxxxxxxx',
    environment: 'production',
  );
  
  // Wraps app with error boundary
  runApp(CortexoErrorBoundary(child: MyApp()));
}

// Manual capture
try {
  await processBooking();
} catch (e, stackTrace) {
  Cortexo.captureException(e, stackTrace: stackTrace, extra: {
    'booking_id': booking.id,
  });
}
```

---

## 2. Pipeline Configuration (YAML)

### File: `cortexo.yml` (in repo root)

```yaml
name: Production Deploy

trigger:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  APP_ENV: production
  APP_VERSION: ${{ commit.sha.short }}

stages:
  - name: Install
    run: composer install --no-dev --optimize-autoloader
    cache:
      key: vendor-${{ hash('composer.lock') }}
      paths: [vendor]

  - name: Test
    run: php vendor/bin/phpunit
    artifacts:
      - coverage/clover.xml

  - name: Scan
    type: scan
    config:
      severity_threshold: high
      rules: [sql-injection, xss, csrf, psr-12]  # F24 security patterns

  - name: Deploy
    type: deploy
    only: [push]
    target: production-server
    strategy: rolling
    config:
      pre_deploy: "php artisan migrate --force"  # F17: pt-online-schema-change
      post_deploy: "php artisan cache:clear"

  - name: Verify
    type: health_check
    only: [push]
    config:
      url: https://myapp.com/health
      expected_status: 200
      timeout: 30s
      retries: 3

notifications:
  on_success:
    - slack: "#deployments"
  on_failure:
    - slack: "#deployments"
    - email: team@company.com
```

---

## 3. REST API Reference

### Base URL
```
https://api.cortexo.io/v1
```

### Authentication
```
Authorization: Bearer <jwt_token>
```
For SDK endpoints:
```
X-API-Key: ctx_proj_xxxxxxxxxxxxxxxx
```

---

### 3.1 Auth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Email/password login |
| `GET`  | `/auth/github` | GitHub OAuth redirect |
| `GET`  | `/auth/github/callback` | GitHub OAuth callback |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `POST` | `/auth/forgot-password` | Send reset email |
| `POST` | `/auth/reset-password` | Reset with token |

### 3.2 Project Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/projects` | List all projects |
| `POST`   | `/projects` | Create project (connect repo) |
| `GET`    | `/projects/:id` | Get project details |
| `PUT`    | `/projects/:id` | Update project settings |
| `DELETE` | `/projects/:id` | Delete project |
| `POST`   | `/projects/:id/regenerate-key` | Regenerate SDK API key |

### 3.3 Pipeline Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/projects/:id/pipelines` | List pipelines |
| `POST`   | `/projects/:id/pipelines` | Create pipeline |
| `PUT`    | `/pipelines/:id` | Update pipeline config |
| `DELETE` | `/pipelines/:id` | Delete pipeline |
| `POST`   | `/pipelines/:id/trigger` | Manually trigger run |

### 3.4 Pipeline Run Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/projects/:id/runs` | List pipeline runs |
| `GET`    | `/runs/:id` | Get run details + stages |
| `GET`    | `/runs/:id/logs` | Stream run logs (SSE) |
| `POST`   | `/runs/:id/cancel` | Cancel running pipeline |
| `POST`   | `/runs/:id/retry` | Retry failed run |

### 3.5 Deployment Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/projects/:id/deployments` | List deployments |
| `GET`    | `/deployments/:id` | Get deployment details |
| `POST`   | `/deployments/:id/rollback` | Rollback deployment |

### 3.6 Error Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/projects/:id/errors` | List errors (filterable) |
| `GET`    | `/errors/:id` | Get error detail + events |
| `PUT`    | `/errors/:id` | Update status |
| `POST`   | `/errors/:id/assign` | Assign to team member |
| `GET`    | `/errors/:id/events` | List individual occurrences |
| `GET`    | `/errors/:id/root-cause` | Get AI root cause report |
| `POST`   | `/errors/:id/root-cause` | Trigger new AI analysis |

### 3.7 Error Ingest (SDK → Platform)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ingest/error` | X-API-Key | Receive error from SDK |
| `POST` | `/ingest/performance` | X-API-Key | Receive perf metrics |
| `POST` | `/ingest/breadcrumb` | X-API-Key | Batch breadcrumbs |

### 3.8 Agent Endpoints (F107-F134) — NEW

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/agent/memories` | List agent memories (F110) |
| `POST`   | `/agent/memories` | Create memory entry |
| `PUT`    | `/agent/memories/:id` | Update memory quality score |
| `DELETE` | `/agent/memories/:id` | Delete memory |
| `POST`   | `/agent/memories/consolidate` | Trigger memory consolidation |
| `GET`    | `/agent/skills` | List installed skills (F117) |
| `POST`   | `/agent/skills/install` | Install new skill |
| `GET`    | `/agent/skills/:id/effectiveness` | Get skill effectiveness score |
| `GET`    | `/agent/context/active` | Get active context sessions (F127) |
| `GET`    | `/agent/context/:id/health` | Get context health (degradation check) |
| `POST`   | `/agent/context/:id/compact` | Trigger context compaction |
| `GET`    | `/agent/performance` | Get agent performance metrics (F110) |
| `GET`    | `/agent/sessions` | List agent execution sessions |
| `GET`    | `/agent/sessions/:id` | Get session details + scoring |

### 3.9 Webhook & Team & Billing Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/webhooks/github` | GitHub push/PR events |
| `POST` | `/webhooks/gitlab` | GitLab push/MR events |
| `GET`    | `/org/members` | List team members |
| `POST`   | `/org/members/invite` | Invite member by email |
| `PUT`    | `/org/members/:id/role` | Change member role |
| `DELETE` | `/org/members/:id` | Remove member |
| `GET`    | `/org/billing` | Current plan + usage |
| `POST`   | `/org/billing/upgrade` | Upgrade plan (Stripe) |
| `GET`    | `/org/billing/invoices` | List invoices |

---

## 4. Webhook Payload (Outgoing)

```json
{
  "event": "deploy.success",
  "project": "swarnaakarshnew",
  "timestamp": "2026-04-23T01:00:00Z",
  "data": {
    "deployment_id": "dep_abc123",
    "commit_sha": "abc1234",
    "branch": "main",
    "environment": "production",
    "duration_ms": 132000,
    "deployed_by": "user@email.com"
  }
}
```

**Available Events:**
| Event | Trigger |
|---|---|
| `pipeline.started` | Pipeline run begins |
| `pipeline.success` | Pipeline completed successfully |
| `pipeline.failed` | Pipeline failed |
| `deploy.success` | Deployment successful |
| `deploy.failed` | Deployment failed |
| `deploy.rollback` | Rollback triggered |
| `error.new` | New error type detected |
| `error.spike` | Error rate exceeds threshold |
| `root_cause.ready` | AI root cause report generated |
| `scan.critical` | Critical vulnerability found |
| `agent.session.complete` | Agent session finished (F108) |
| `agent.memory.consolidated` | Memory consolidation done (F110) |
| `agent.context.degraded` | Context degradation detected (F127) |
