# Cortexo API Routes Reference

## Route Registration

All routes registered in `apps/api/src/index.ts`. Every route file exports an async function that receives the Fastify instance.

## 32 Route Files

### Core
| File | Size | Purpose |
|------|------|---------|
| `health.ts` | 1KB | Health check endpoint (`/v1/health`) |
| `auth.ts` | 20KB | Login, register, forgot password, JWT refresh |
| `profiles.ts` | 13KB | User profiles, avatar, preferences |
| `org.ts` | 4KB | Organization management |

### Projects & Deployments
| File | Size | Purpose |
|------|------|---------|
| `projects.ts` | 14KB | Project CRUD, GitHub/GitLab integration |
| `deployments.ts` | 28KB | SSH deployment engine (git pull, build, PM2 restart) |
| `deploy-configs.ts` | 6KB | Deployment configuration templates |
| `deploy-targets.ts` | 5KB | Server deploy target mapping |
| `file-push.ts` | 12KB | Push individual files to servers via SSH |
| `winbull-deploy.ts` | 23KB | Winbull-specific deploy automation |
| `winbull.ts` | 11KB | Winbull client-specific endpoints |

### Infrastructure
| File | Size | Purpose |
|------|------|---------|
| `servers.ts` | 13KB | Server CRUD, SSH connectivity test |
| `server-mounts.ts` | 28KB | NFS/SSHFS mount management |
| `provision.ts` | 9KB | Server provisioning automation |
| `metrics-stream.ts` | 5KB | Real-time server metrics via WebSocket |
| `log-stream.ts` | 5KB | Live SSH log streaming |
| `log-viewer.ts` | 11KB | Historical log viewer |

### Testing
| File | Size | Purpose |
|------|------|---------|
| `testing.ts` | **87KB** | 3-level test engine (endpoint, flow, security) |
| `browser-tests.ts` | 13KB | Puppeteer browser automation tests |
| `judge-scores.ts` | 9KB | Test scoring and grading system |

### Monitoring & Docs
| File | Size | Purpose |
|------|------|---------|
| `errors.ts` | 25KB | Bug tracker, error collection, AI root cause |
| `devops-docs.ts` | **91KB** | Built-in runbook hub (Nginx, Docker, PM2, etc.) |
| `knowledge.ts` | 16KB | AI-powered knowledge base Q&A |
| `audit.ts` | 6KB | Activity audit trail |

### Configuration
| File | Size | Purpose |
|------|------|---------|
| `credentials.ts` | 11KB | AES-256 encrypted credential vault |
| `pipelines.ts` | 8KB | CI/CD pipeline builder |
| `pipeline-runs.ts` | 4KB | Pipeline execution history |
| `webhooks.ts` | 6KB | GitHub/GitLab webhook handlers |
| `alert-channels.ts` | 11KB | Email/Slack/Discord alert routing |
| `notifications.ts` | 7KB | Push notification management |
| `menu-items.ts` | 5KB | Dynamic sidebar menu config |
| `menu-permissions.ts` | 2KB | Role-based menu access |

## API Prefix

All routes: `/v1/{route}` — e.g., `/v1/projects`, `/v1/deployments`

## Biggest Files (Watch Out)

| File | Size | Why Large |
|------|------|----------|
| `devops-docs.ts` | 91KB | Contains ALL runbook content inline |
| `testing.ts` | 87KB | Full 3-level test engine logic |
| `deployments.ts` | 28KB | SSH deploy orchestration |
| `server-mounts.ts` | 28KB | Mount management + health checks |
| `errors.ts` | 25KB | Bug tracker + AI analysis |
