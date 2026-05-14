# Server Management & Monitoring

**Feature Type**: Legacy Ported (Originally from `BullionDevops`, rewritten for Cortexo)
**Packages**: `@cortexo/api`, `@cortexo/db`, `@cortexo/cli`

## Overview
Server management is the foundational layer of Cortexo. It centralizes the inventory, credentials, and real-time health metrics of external servers (e.g., EC2 instances, bare-metal servers).

## Core Capabilities

### 1. Server Inventory API
A fully typed REST API (Fastify + Zod) allows CRUD operations on the server registry. 
- **Database Schema**: Managed by Drizzle ORM in PostgreSQL. Tracks `name`, `privateIp`, `publicAddress`, `region`, and timestamps.
- **Enveloping**: Responses are standardized inside a `{ data: T }` envelope.

### 2. SSH Connectivity Testing
Cortexo can remotely test connectivity to registered servers.
- **API Endpoint**: `POST /v1/servers/:id/test-connection`
- **CLI Command**: `cortexo servers test <id>`
- The backend initiates a lightweight SSH handshake to verify the server is online, returning `latencyMs`, `hostname`, and `uptime` metrics.

### 3. Metric Collection (Historical context)
Originally in `BullionDevops`, a suite of bash and Node.js scripts polled CPU, RAM, and Disk metrics. In Cortexo, this is being transitioned into scheduled jobs and dedicated API ingestion endpoints (`POST /v1/servers/:id/metrics`) for centralized trend analysis.
