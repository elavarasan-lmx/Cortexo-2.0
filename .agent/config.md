# Agent Project Configuration — Cortexo-2.0 Workspace

## Scan Rules

When scanning this project (e.g., "read my project", "explore the codebase"), ALWAYS follow these rules:

### ❌ NEVER Scan These Directories
```
node_modules/          # NPM dependencies (44,000+ files)
.next/                 # Next.js build cache
.turbo/                # Turborepo cache
dist/                  # Compiled output
build/                 # Build artifacts
.git/                  # Git internals
coverage/              # Test coverage reports
.screenshots/          # Browser test screenshots
.recordings/           # Browser test recordings
.test-results/         # Test result artifacts
www/                   # Ionic compiled output (android project)
platforms/             # Cordova/Ionic platform builds
plugins/               # Cordova/Ionic plugins
package-lock.json      # Lock files (huge, not useful)
tsconfig.tsbuildinfo   # TS build info
*.log                  # Log files
```

### ⚠️ Skip Unless Explicitly Asked
```
Project/               # SSHFS-mounted server mirrors (causes hangs!)
Server/                # Server config stubs (mostly empty)
cortexo/.vault/        # Encrypted credentials
system/                # CodeIgniter system core (vendor code)
core/                  # CodeIgniter core (vendor code)
third_party/           # CodeIgniter third-party libs
```

### ✅ ALWAYS Read These First (Project Entry Points)
```
cortexo/README.md                          # Cortexo platform overview
cortexo/package.json                       # Root monorepo config
cortexo/turbo.json                         # Build pipeline config
cortexo/apps/web/lib/api.ts                # API client (all endpoints)
cortexo/apps/web/lib/hooks.ts              # Custom React hooks
cortexo/apps/web/proxy.ts                  # Auth middleware (NOT middleware.ts!)
cortexo/apps/api/src/index.ts              # API server entry
cortexo/apps/api/src/routes/               # All 32 API route files
cortexo/packages/db/src/schema/            # 18 DB schema files
brain/winbull/0_session_start.md           # Winbull brain entry point
scripts/winbull_deploy.sh                  # Deploy automation
```

### 📋 Project Quick Map
```
Devops/                          # Workspace root
├── cortexo/                     # 🧠 Main product — Cortexo DevOps Platform
│   ├── apps/web/                # Next.js 16 frontend (Turbopack)
│   ├── apps/api/                # Fastify 5 backend
│   └── packages/db/             # @cortexo/db — Drizzle ORM schemas
├── Project/                     # ⚠️ SSHFS mounts — DO NOT SCAN
│   ├── winbullstaging/          # CodeIgniter 3 bullion trading app
│   └── android/                 # Ionic mobile app
├── Server/                      # Server infrastructure configs
│   ├── Clients/                 # Client-specific configs
│   └── server1-7/               # Per-server configs
├── brain/winbull/               # 🧠 Winbull knowledge base (17 artifacts)
├── scripts/                     # Deploy scripts & automation
├── database/migrations/         # SQL migration files
└── dev_notes/daily_reports/     # Daily sprint reports
```

## Scan Strategy

1. **Quick scan**: List directory → read `config.md` → read entry points only
2. **Module scan**: Focus on one module (e.g., `cortexo/apps/api/src/routes/testing.ts`)
3. **Full scan**: Read all source files, skip ignored dirs, use `find` with exclusions:
   ```bash
   find . -type f \
     -not -path '*/node_modules/*' \
     -not -path '*/.next/*' \
     -not -path '*/.turbo/*' \
     -not -path '*/.git/*' \
     -not -path '*/dist/*' \
     -not -path '*/platforms/*' \
     -not -path '*/plugins/*' \
     -not -path '*/www/*' \
     -not -path '*/coverage/*' \
     -not -name 'package-lock.json' \
     -not -name '*.log' \
     | head -200
   ```
