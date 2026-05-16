# 🏗️ Infrastructure Map

> Single source of truth for all servers, services, and connections.
> Update this file whenever infrastructure changes.

---

## Servers

| Server | Type | Purpose | Key Codebases |
|--------|------|---------|---------------|
| **Server 1** | AWS EC2 | Production hosting | Client web platforms |
| **Server 2** | AWS EC2 | Production hosting | Client web platforms |
| **Server 3** | AWS EC2 | Production hosting | Client web platforms |
| **Server 4** | AWS EC2 | Production hosting | Client web platforms |
| **Server 5** | AWS EC2 | Production hosting | Client web platforms |
| **Server 6** | AWS EC2 | Production hosting | Client web platforms |
| **Server 7** | AWS EC2 | Staging + New Clients | Ruby Staging, MKR Bullion |

> **TODO**: Fill in exact IPs, SSH key paths, and client assignments per server.
> Run `cat ~/.ssh/config` to populate SSH details.

---

## Shared Services

| Service | Type | Endpoint | Used By |
|---------|------|----------|---------|
| **AWS RDS** | MySQL | `ls-ed7d...ap-south-1.rds.amazonaws.com` | All Winbull-family platforms |
| **AWS ElastiCache** | Redis | `prod-cluster-001.78ozga...` | Rate caching, session storage |
| **LightStreamer** | Rate Feed | `72.52.178.11:8080` | MCX commodity rates |
| **Mailgun** | Email SaaS | Via Lumen API | Transactional emails |
| **OneSignal** | Push SaaS | Via mobile API | Push notifications |
| **WhatsApp API** | SMS SaaS | `whatsappsms.creativepoint.in` | WhatsApp messages |

---

## Databases on RDS

| Database Name | Client/Platform | Status |
|---------------|----------------|--------|
| `winbullstaging` | Winbull Staging | Active (dev/test) |
| `ruby_staging` | Ruby Staging | Active (created 2026-05-14) |
| `rubysilver` | Ruby Precious (prod) | Active (production) |
| _(add others as discovered)_ | | |

> **TODO**: Run `mysql -h <RDS_HOST> -u demotrade -p -e "SHOW DATABASES;"` to populate full list.

---

## Git Repositories (GitHub: Logimax-Technologies)

| Repo | Branch | Server | Purpose |
|------|--------|--------|---------|
| `WTWeb-Rubyprecious` | `ruby_staging` | Server 7 | Ruby Staging web codebase |
| _(add others)_ | | | |

> **TODO**: Run `gh repo list Logimax-Technologies` to populate full list.

---

## Socket Ports

| Platform | Socket Port | Protocol |
|----------|------------|----------|
| Winbull Staging | `57134` | WebSocket (NativeSocket.js) |
| Ruby Staging | _(check config)_ | WebSocket |
| _(add others)_ | | |

---

## Local Development

| Service | URL | Notes |
|---------|-----|-------|
| Cortexo Frontend | `http://localhost:3000` | Next.js 16 + Turbopack |
| Cortexo Backend | `http://localhost:4000` | Fastify 5 |
| Cortexo Swagger | `http://localhost:4000/docs` | API documentation |
| PostgreSQL | `localhost:5432` | Cortexo database |
| Redis | `localhost:6379` | Cortexo cache + BullMQ |

---

## SSH Access Pattern

```bash
# General pattern
ssh -i ~/.ssh/<server_key> ec2-user@<server-ip>

# Server 7 (Ruby/MKR Staging)
ssh -i ~/.ssh/server7_key ec2-user@<server7-ip>
```

> **TODO**: Document all SSH key paths and server IPs here for quick reference.

---

## Network Architecture

```
                    ┌─────────────────┐
                    │  LightStreamer   │
                    │ 72.52.178.11    │
                    └────────┬────────┘
                             │ MCX Rates
                    ┌────────▼────────┐
                    │   AWS RDS       │
                    │   (MySQL)       │◄──────── All Servers
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │ Server 1-6│     │ Server 7  │     │ ElastiCache│
    │ Production│     │  Staging  │     │  (Redis)   │
    └───────────┘     └───────────┘     └───────────┘
```

---

*Created: 2026-05-16*
*Maintained by: Elavarasan @ Logimax India*
*TODO items are marked — fill in during next infrastructure session.*
