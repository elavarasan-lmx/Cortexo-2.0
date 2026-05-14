# Cortexo Coding Conventions

## ⚠️ Critical: Things That Will Break Your Build

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Rename `proxy.ts` to `middleware.ts` | Auth breaks everywhere | Keep as `proxy.ts` — Next.js 16 convention |
| Use React Context for toasts | Conflicts with Zustand store | Use `useToastStore.getState().success()` |
| Forget `useAutoLoadToken()` in a page | API calls fail silently (no JWT) | Add to EVERY dashboard page component |
| ChunkLoadError after code change | Stale `.next` cache | `rm -rf apps/web/.next` then `npm run dev` |
| Delete a file without grepping | Breaks imports elsewhere | Always `grep -r "filename" apps/` first |

---

## Frontend Patterns (Next.js 16 + React 19)

### Toast Notifications
```typescript
// ✅ Correct — Zustand store
import { useToastStore } from '@/lib/toast-store';
useToastStore.getState().success('Title', 'Message');
useToastStore.getState().error('Error', 'Something failed');

// ❌ Wrong — Never use Context
// const { addToast } = useContext(ToastContext);
```

### API Calls in Components
```typescript
// ✅ Correct — useApiData hook
import { useApiData } from '@/lib/hooks';
import { api } from '@/lib/api';

const { data, loading, error, refetch } = useApiData(() => api.getProjects());

// ✅ Correct — Manual fetch with auth
const token = useAutoLoadToken();
const result = await api.createProject({ name, repo_url });
```

### Modal/Confirm Dialog
```typescript
// ✅ Correct
const { confirm } = useModal();
const confirmed = await confirm({
  title: 'Delete Server?',
  message: 'This action cannot be undone.',
  confirmText: 'Delete',
  variant: 'danger'
});
if (confirmed) { /* proceed */ }
```

### Auth Token (REQUIRED)
```typescript
// ✅ Must be in EVERY dashboard page
'use client';
import { useAutoLoadToken } from '@/lib/hooks';

export default function MyPage() {
  useAutoLoadToken(); // ← REQUIRED
  // ... rest of page
}
```

---

## Backend Patterns (Fastify 5)

### Route Structure
```typescript
// apps/api/src/routes/module.ts
import { FastifyInstance } from 'fastify';

export default async function moduleRoutes(app: FastifyInstance) {
  // GET /v1/module
  app.get('/module', { preHandler: [app.authenticate] }, async (req, reply) => {
    const items = await db.select().from(schema.module);
    return reply.send({ data: items });
  });
}
```

### Registering Routes
```typescript
// apps/api/src/index.ts
import moduleRoutes from './routes/module';
app.register(moduleRoutes, { prefix: '/v1' });
```

### Error Handling
```typescript
// ✅ Correct — Fastify error format
return reply.status(400).send({ 
  error: 'Validation failed', 
  message: 'Project name is required' 
});
```

---

## Database Patterns (Drizzle ORM)

### Query
```typescript
import { db } from '@cortexo/db';
import { projects } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';

const project = await db.select().from(projects).where(eq(projects.id, id));
```

### Insert
```typescript
const [newProject] = await db.insert(projects).values({
  name: 'My Project',
  org_id: orgId,
}).returning();
```

---

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Page component | `page.tsx` in route folder | `app/(dashboard)/projects/page.tsx` |
| Layout | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| API route file | kebab-case `.ts` | `deploy-configs.ts` |
| Schema file | kebab-case `.ts` | `winbull-configs.ts` |
| Component | PascalCase `.tsx` | `DeployForm.tsx` |
| Lib/utility | camelCase `.ts` | `toast-store.ts` |

---

## Git Conventions

```bash
# Feature
git commit -m "feat(module): add feature description"

# Bug fix  
git commit -m "fix(module): describe what was fixed"

# Never commit
.env, .env.local, node_modules/, .next/, .vault/
```
