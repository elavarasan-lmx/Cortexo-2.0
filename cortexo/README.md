# 🧠 Cortexo

**The brain for your code.** DevOps intelligence platform for small teams.

![Version](https://img.shields.io/badge/version-0.5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)
![Fastify](https://img.shields.io/badge/Fastify-5.x-white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

Cortexo is a self-hosted DevOps platform that unifies deployment management, infrastructure monitoring, testing, documentation, and knowledge management into a single dashboard. Built for teams managing multiple client projects across servers.

### Key Features

- 🚀 **SSH-Based Deployments** — Git pull, build, PM2 restart with real-time log streaming
- 🖥️ **Server Management** — Register servers, manage NFS mounts, monitor resources
- 🧪 **3-Level Testing Engine** — Endpoint validation, business flow testing, security probes
- 🐛 **Bug Tracker** — Auto-detect errors from deployed apps with AI root cause analysis
- 📚 **DevOps Docs** — Built-in runbook hub (Nginx, Docker, PM2, SSH, MySQL, and more)
- 🧠 **Knowledge Base** — AI-powered Q&A with OpenAI/Gemini/Groq integration
- 🔐 **Credentials Vault** — AES-256 encrypted storage for API keys and secrets
- 📊 **CI/CD Pipelines** — Visual pipeline builder with push-triggered deployments
- 📋 **Audit Trail** — Full activity log of all platform actions

---

## Tech Stack

| Component | Technology | Version |
|---|---|---|
| Monorepo | Turborepo | 2.9.12 |
| Frontend | Next.js (Turbopack) | 16.2.4 |
| Backend | Fastify | 5.x |
| Database | PostgreSQL + Drizzle ORM | 16 |
| Auth | NextAuth.js v5 (JWT) | 5.x |
| State | Zustand | latest |
| Queue | BullMQ + Redis | — |
| Icons | lucide-react | — |
| API Docs | Swagger (auto-generated) | — |

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- PostgreSQL 16
- Redis 7+

### 1. Clone & Install

```bash
git clone https://github.com/your-org/cortexo.git
cd cortexo
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

Required environment variables:
```env
DATABASE_URL=postgresql://cortexo:cortexo_dev_2026@localhost:5432/cortexo
JWT_SECRET=your-32-char-minimum-secret-here
NEXTAUTH_SECRET=your-nextauth-secret
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
```

### 3. Setup Database

```bash
npm run db:push     # Push schema to PostgreSQL
npm run seed        # Optional: populate demo data
```

### 4. Start Development

```bash
# Start both frontend + backend
npm run dev

# Or individually:
npm run dev:web     # Next.js → http://localhost:3000
npm run dev:api     # Fastify → http://localhost:4000
```

### 5. Dev Auth Bypass (Optional)

For local development without login:
```env
UNSAFE_DEV_AUTH=true  # ⚠️ NEVER in production
```

---

## Project Structure

```
cortexo/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   ├── proxy.ts            # Auth middleware (⚠️ NOT middleware.ts)
│   │   ├── lib/
│   │   │   ├── api.ts          # API client (all backend calls)
│   │   │   ├── hooks.ts        # Custom React hooks
│   │   │   ├── auth.ts         # NextAuth v5 config
│   │   │   ├── toast-store.ts  # Zustand toast notifications
│   │   │   └── nav-config.ts   # Sidebar navigation
│   │   ├── components/         # Shared UI components
│   │   └── app/(dashboard)/    # All page routes
│   │       ├── dashboard/
│   │       ├── projects/
│   │       ├── deployments/
│   │       ├── servers/
│   │       ├── pipelines/
│   │       ├── bug-tracker/
│   │       ├── testing/
│   │       ├── knowledge-base/
│   │       ├── devops-docs/
│   │       ├── audit-log/
│   │       └── settings/
│   └── api/                    # Fastify 5 backend
│       ├── src/
│       │   ├── index.ts        # Server entry + plugin registration
│       │   ├── routes/         # 31 route files
│       │   ├── middleware/     # Auth + usage limits
│       │   └── lib/            # DB, Redis, utils
│       └── .vault/             # Encrypted credentials storage
├── packages/
│   └── db/                     # @cortexo/db — Drizzle schema
│       └── src/schema/         # 18 schema files
├── .github/workflows/ci.yml   # CI pipeline
├── docker-compose.yml          # Full stack Docker setup
└── turbo.json                  # Turborepo config
```

---

## Modules

| Module | Description | Frontend | Backend |
|---|---|---|---|
| **Dashboard** | Overview with stats | `dashboard/` | Aggregated |
| **Projects** | Software project CRUD | `projects/` | `projects.ts` |
| **Deployments** | SSH deploy engine | `deployments/` | `deployments.ts` |
| **Servers** | Infrastructure mgmt | `servers/` | `servers.ts` |
| **Pipelines** | CI/CD builder | `pipelines/` | `pipelines.ts` |
| **Bug Tracker** | Error monitoring | `bug-tracker/` | `errors.ts` |
| **Testing Hub** | 3-level test engine | `testing/` | `testing.ts` |
| **Knowledge Base** | AI Q&A docs | `knowledge-base/` | `knowledge.ts` |
| **DevOps Docs** | Runbook hub | `devops-docs/` | `devops-docs.ts` |
| **Audit Log** | Activity trail | `audit-log/` | `audit.ts` |
| **Settings** | Config (6 sub-tabs) | `settings/` | Multiple |

---

## API Documentation

Swagger UI is auto-generated and available at:

```
http://localhost:4000/docs
```

All API routes are prefixed with `/v1/`.

---

## Development Conventions

### ⚠️ Critical Rules

1. **`proxy.ts` NOT `middleware.ts`** — Next.js 16 uses `proxy.ts` for middleware. Never rename it.
2. **Zustand for toasts** — Use `useToastStore`, NOT Context providers.
3. **Verify before deleting** — Always grep for imports before removing any file.
4. **ChunkLoadError fix** — Clear `.next` cache: `rm -rf apps/web/.next`

### Patterns

```typescript
// Toast
useToastStore.getState().success('Title', 'Message')

// Modal
const { confirm } = useModal()
await confirm({ title: '...', message: '...' })

// API calls in components
const { data, loading } = useApiData(() => api.getProjects())

// Auth token (required in every page)
useAutoLoadToken()
```

### Adding New Features

1. **DB Schema** → `packages/db/src/schema/module.ts` → export from `index.ts`
2. **API Route** → `apps/api/src/routes/module.ts` → register in `src/index.ts`
3. **Frontend Page** → `apps/web/app/(dashboard)/module/page.tsx`
4. **API Client** → Add methods to `apps/web/lib/api.ts`

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all services |
| `npm run dev:web` | Frontend only |
| `npm run dev:api` | Backend only |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:generate` | Generate migrations |
| `npm run clean` | Remove all build artifacts |
| `npm run seed` | Populate demo data |

---

## License

MIT — See [LICENSE](./LICENSE) for details.
