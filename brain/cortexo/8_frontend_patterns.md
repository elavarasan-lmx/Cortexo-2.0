# Cortexo — Frontend Patterns (Artifact 8)

> Component patterns, state management, API client usage.

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/lib/api.ts` | API client (50KB) |
| `apps/web/lib/hooks.ts` | React hooks |
| `apps/web/lib/toast-store.ts` | Zustand notifications |
| `apps/web/proxy.ts` | Auth middleware (NOT middleware.ts) |

---

## Required Page Pattern

Every dashboard page must include:

```tsx
'use client';

import { useAutoLoadToken } from '@/lib/hooks';
import { api } from '@/lib/api';

export default function MyPage() {
  // ⚠️ REQUIRED - loads auth token
  useAutoLoadToken();

  // Your component logic
}
```

---

## API Calls

### Using hook (recommended for data)
```tsx
const { data, loading, error } = useApiData(() => api.getProjects());
```

### Using direct call (for actions)
```tsx
const handleDeploy = async () => {
  await api.createDeployment({ projectId, serverId });
};
```

---

## Toast Notifications

```tsx
// Success
useToastStore.getState().success('Deployed', 'Server is live');

// Error
useToastStore.getState().error('Failed', 'SSH connection refused');

// Warning
useToastStore.getState().warning('Warning', 'Cache cleared');
```

---

## Confirm Dialog

```tsx
import { useModal } from '@/components/modal-provider';

const { confirm } = useModal();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Server?',
    message: 'This will remove all associated deployments.',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  });

  if (confirmed) {
    await api.deleteServer(id);
  }
};
```

---

## Form Handling

```tsx
'use client';

import { useState } from 'react';

export default function CreateProject() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    await api.createProject(data);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

---

## Loading States

```tsx
// Skeleton while loading
if (loading) {
  return <CardSkeleton />;
}

// Error state
if (error) {
  return <div className="text-red-500">Error: {error.message}</div>;
}
```

---

## Navigation

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

// Redirect after action
router.push('/deployments');

// With query params
router.push(`/deployments/${id}?tab=logs`);
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `401 Unauthorized` | Add `useAutoLoadToken()` to page |
| ChunkLoadError | `rm -rf apps/web/.next` |
| API returns 500 | Check API logs at `/v1/health` |
| WebSocket not connecting | Check Redis connection |

---

## Component Library

Located: `apps/web/components/ui/`

| Component | Usage |
|-----------|-------|
| `Button` | Primary, secondary, danger variants |
| `Card` | Container with shadow |
| `Input` | Text, email, password, number |
| `Select` | Dropdown with options |
| `Table` | DataTable with sorting |
| `Badge` | Status indicators |
| `Modal` | Dialog overlay |

---

*Part of Cortexo brain — see 0_session_start.md for full index.*