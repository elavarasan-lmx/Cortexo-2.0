# Cortexo DB Schema Reference

## ORM: Drizzle ORM 0.45.2

- Config: `packages/db/drizzle.config.ts`
- Schema dir: `packages/db/src/schema/`
- Exports: `packages/db/src/index.ts`
- Push: `npm run db:push`
- Studio: `npm run db:studio`

## 18 Schema Files

| File | Tables | Purpose |
|------|--------|---------|
| `users.ts` | users | Core user accounts (email, password hash, role) |
| `auth.ts` | sessions, verification_tokens | Auth sessions and email verification |
| `organizations.ts` | organizations, org_members | Multi-tenant organization support |
| `projects.ts` | projects | Software project definitions |
| `infrastructure.ts` | servers, server_metrics, server_mounts | Server infra and monitoring |
| `automation.ts` | deploy_configs, deploy_targets, deployments | Deployment automation |
| `pipelines.ts` | pipelines, pipeline_stages, pipeline_runs | CI/CD pipeline definitions |
| `testing.ts` | test_suites, test_cases, test_runs, test_results | 3-level testing engine |
| `errors.ts` | error_reports, error_occurrences | Bug tracking and error collection |
| `knowledge.ts` | knowledge_articles, knowledge_queries | AI knowledge base |
| `custom-docs.ts` | custom_docs, doc_categories | Custom documentation |
| `notifications.ts` | notifications, notification_prefs | Alert and notification system |
| `audit.ts` | audit_entries | Full activity audit trail |
| `profiles.ts` | user_profiles, api_keys, ssh_keys, user_settings | User preferences and keys |
| `menu-items.ts` | menu_items | Dynamic sidebar navigation |
| `menu-permissions.ts` | menu_permissions | Role-based menu access control |
| `winbull-configs.ts` | winbull_client_configs | Winbull-specific client configs |

## Database Connection

```typescript
// packages/db/src/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

## Adding a New Table

1. Create schema file: `packages/db/src/schema/new-module.ts`
2. Export from: `packages/db/src/index.ts`
3. Push to DB: `npm run db:push`
4. Create API route: `apps/api/src/routes/new-module.ts`
5. Register route in: `apps/api/src/index.ts`
