# Cortexo — API Patterns (Artifact 5)

> Request/response patterns, error handling, auth conventions.

---

## Request Headers

| Header | Required | Purpose |
|--------|----------|---------|
| `Authorization` | Yes | `Bearer {jwt_token}` |
| `Content-Type` | POST/PUT | `application/json` |
| `X-Request-Id` | No | Client-generated trace ID |

---

## Response Format

### Success (200-299)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}
```

### Error (400-599)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { "field": "email" }
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Auth Patterns

### Login
```typescript
POST /v1/auth/login
Body: { email, password }
Returns: { user, token, refreshToken }
```

### Refresh Token
```typescript
POST /v1/auth/refresh
Headers: Authorization: Bearer {refreshToken}
Returns: { token }
```

### Dev Auth Bypass
```env
UNSAFE_DEV_AUTH=true  # WARNING: Never in production
```

---

## Common Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Invalid/missing JWT |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal error |

---

## Fastify Route Pattern

```typescript
export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginBody }>('/login', {
    schema: {
      body: LoginSchema
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    // Validate
    const user = await findUserByEmail(email);
    if (!user || !await verifyPassword(password, user.password)) {
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
      });
    }

    // Generate token
    const token = fastify.jwt.sign({ id: user.id, email: user.email });

    return { success: true, data: { user: sanitizeUser(user), token } };
  });
}
```

---

## Rate Limiting

- Global: 100 requests/minute
- Auth routes: 5 requests/minute
- Deploy routes: 10 requests/minute

---

## WebSocket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `deploy:progress` | Server→Client | Deploy log stream |
| `log:tail` | Server→Client | Real-time log streaming |
| `metrics:update` | Server→Client | Server metrics push |

---

*Part of Cortexo brain — see 0_session_start.md for full index.*