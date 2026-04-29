# SKILL: SSH Deployment
## Metadata
- **ID:** deploy-ssh
- **Category:** deployment
- **Risk Level:** High
- **Tags:** ssh, sftp, deploy, production
- **Version:** 1.0.0
- **Author:** Cortexo Team

## Description
Deploys code to remote servers via SSH. Supports git pull, rsync, and custom deploy scripts. Includes rollback capability.

## Trigger
- Pipeline: Runs as deploy stage
- Manual: User triggers from deployments page

## Input
- Deploy target configuration (host, user, path, key)
- Branch and commit SHA
- Optional: custom deploy script

## Steps
1. **Connect** — SSH handshake with deploy target
2. **Pre-deploy** — Run pre-deploy hooks (backup, maintenance mode)
3. **Transfer** — Git pull or rsync files
4. **Post-deploy** — Run migrations, clear cache, restart services
5. **Verify** — Health check the deployed application
6. **Notify** — Send Slack/email notification

## Risk Classification
- **Risk Level:** High
- **Side Effects:** Modifies production server files
- **Requires Approval:** Yes (auto-approved in pipeline, manual otherwise)
