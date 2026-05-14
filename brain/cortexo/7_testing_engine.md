# Cortexo — Testing Engine (Artifact 7)

> 3-level test engine: endpoint, business flow, security probes.

---

## Overview

`apps/api/src/routes/testing.ts` (87KB) powers the Testing Hub.
Located at `/v1/testing` endpoints.

---

## 3 Test Levels

### Level 1: Endpoint Tests (Quick)

```typescript
// GET /v1/testing/endpoint
{
  "url": "https://api.example.com/health",
  "method": "GET",
  "expectedStatus": 200,
  "expectedResponse": { "status": "ok" }
}
```

**Use**: Smoke tests, health checks, basic uptime

---

### Level 2: Business Flow Tests (Medium)

```typescript
// POST /v1/testing/flow
{
  "name": "User Login Flow",
  "steps": [
    { "url": "/login", "method": "POST", "body": {...} },
    { "url": "/profile", "method": "GET", "extract": "token" },
    { "url": "/orders", "method": "GET", "useToken": true }
  ]
}
```

**Use**: Multi-step workflows, auth chains, data pipelines

---

### Level 3: Security Probes (Deep)

| Probe Type | What It Checks |
|------------|----------------|
| SQL Injection | `' OR '1'='1` in params |
| XSS | `<script>alert(1)</script>` |
| CSRF | Missing token headers |
| Auth Bypass | Admin endpoints without auth |
| Rate Limit | Brute force protection |

```typescript
// POST /v1/testing/security
{
  "target": "https://api.example.com",
  "probes": ["sql_injection", "xss", "auth_bypass"]
}
```

---

## Test Results Schema

```typescript
interface TestResult {
  id: string;
  type: 'endpoint' | 'flow' | 'security';
  status: 'passed' | 'failed' | 'error';
  duration: number; // ms
  checks: Check[];
  screenshot?: string; // for browser tests
  logs: string[];
}

interface Check {
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
}
```

---

## Test Storage

| Table | What |
|-------|------|
| `testing_suites` | Test collections |
| `testing_cases` | Individual test cases |
| `testing_runs` | Execution history |
| `testing_results` | Per-check results |

---

## Running Tests

### Via API
```bash
curl -X POST http://localhost:4000/v1/testing/run \
  -H "Authorization: Bearer {token}" \
  -d '{"suite_id": "abc123"}'
```

### Via UI
Navigate to: `/testing` → Select suite → Click "Run"

### Via Schedule
Set cron in pipeline: `0 9 * * *` = daily at 9am

---

## Browser Tests (Puppeteer)

Located: `apps/api/src/routes/browser-tests.ts`

```typescript
await browser.goto(url);
await browser.click('#submit');
const result = await browser.evaluate(() => document.body.innerHTML);
```

Use: Complex UI flows, form submissions, JS-driven pages

---

## CI Integration

```yaml
# .github/workflows/test.yml
- name: Run Cortexo Tests
  run: |
    curl -X POST $CORTEXO_URL/v1/testing/run \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"suite_id": "$SUITE_ID"}'
```

---

## Known Limitations

| Issue | Workaround |
|-------|------------|
| No parallel test execution | Run multiple suites sequentially |
| Browser tests on headless Linux | Use xvfb or Docker |
| No test data isolation | Use separate test DB |

---

*Part of Cortexo brain — see 0_session_start.md for full index.*