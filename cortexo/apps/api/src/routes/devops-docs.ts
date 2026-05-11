import { FastifyInstance, FastifyRequest } from 'fastify';

// ─── DevOps Documentation Reference ─────────────────────────────────────────
// Curated quick-reference docs for common DevOps tools.
// No DB needed — static content served with search/filter support.

interface DocEntry {
  id: string;
  tool: string;
  icon: string;
  color: string;
  category: string;
  title: string;
  description: string;
  commands: { cmd: string; desc: string; example?: string }[];
  configSnippets?: { title: string; lang: string; code: string }[];
  tips?: string[];
}

const DOCS: DocEntry[] = [
  // ─── Nginx ───────────────────────────────────────────────────────────
  {
    id: 'nginx-basics',
    tool: 'Nginx',
    icon: 'nginx',
    color: '#009639',
    category: 'Web Server',
    title: 'Nginx Essentials',
    description: 'Core commands and configuration for Nginx web server and reverse proxy.',
    commands: [
      { cmd: 'sudo systemctl start nginx', desc: 'Start Nginx service' },
      { cmd: 'sudo systemctl stop nginx', desc: 'Stop Nginx service' },
      { cmd: 'sudo systemctl restart nginx', desc: 'Restart Nginx (drops connections)' },
      { cmd: 'sudo systemctl reload nginx', desc: 'Reload config without downtime' },
      { cmd: 'sudo systemctl status nginx', desc: 'Check service status' },
      { cmd: 'sudo nginx -t', desc: 'Test configuration syntax' },
      { cmd: 'sudo nginx -T', desc: 'Test and dump full config' },
      { cmd: 'sudo nginx -s reload', desc: 'Signal running process to reload' },
      { cmd: 'sudo tail -f /var/log/nginx/access.log', desc: 'Follow access logs' },
      { cmd: 'sudo tail -f /var/log/nginx/error.log', desc: 'Follow error logs' },
    ],
    configSnippets: [
      {
        title: 'Reverse Proxy (Node.js App)',
        lang: 'nginx',
        code: `server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`,
      },
      {
        title: 'SSL with Certbot',
        lang: 'nginx',
        code: `server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}`,
      },
      {
        title: 'Static File Serving + Gzip',
        lang: 'nginx',
        code: `server {
    listen 80;
    server_name static.example.com;
    root /var/www/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}`,
      },
    ],
    tips: [
      'Always run nginx -t before reload to catch syntax errors',
      'Use sites-available + sites-enabled symlink pattern for multi-site',
      'Set worker_processes auto; to match CPU cores',
      'Enable gzip for 60-80% bandwidth savings on text content',
      'Use proxy_read_timeout 300s; for long-running API calls',
    ],
  },

  // ─── Apache ──────────────────────────────────────────────────────────
  {
    id: 'apache-basics',
    tool: 'Apache',
    icon: 'apache',
    color: '#D22128',
    category: 'Web Server',
    title: 'Apache HTTPD Essentials',
    description: 'Core commands and virtual host configuration for Apache HTTP Server.',
    commands: [
      { cmd: 'sudo systemctl start apache2', desc: 'Start Apache (Debian/Ubuntu)' },
      { cmd: 'sudo systemctl start httpd', desc: 'Start Apache (RHEL/CentOS)' },
      { cmd: 'sudo systemctl restart apache2', desc: 'Restart Apache' },
      { cmd: 'sudo systemctl reload apache2', desc: 'Reload config gracefully' },
      { cmd: 'sudo apachectl configtest', desc: 'Test configuration syntax' },
      { cmd: 'sudo a2ensite mysite.conf', desc: 'Enable a virtual host' },
      { cmd: 'sudo a2dissite mysite.conf', desc: 'Disable a virtual host' },
      { cmd: 'sudo a2enmod rewrite', desc: 'Enable mod_rewrite module' },
      { cmd: 'sudo a2enmod proxy proxy_http', desc: 'Enable reverse proxy modules' },
      { cmd: 'sudo tail -f /var/log/apache2/error.log', desc: 'Follow error logs' },
    ],
    configSnippets: [
      {
        title: 'Virtual Host + Reverse Proxy',
        lang: 'apache',
        code: `<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    ErrorLog \${APACHE_LOG_DIR}/example-error.log
    CustomLog \${APACHE_LOG_DIR}/example-access.log combined
</VirtualHost>`,
      },
      {
        title: '.htaccess Rewrite Rules',
        lang: 'apache',
        code: `RewriteEngine On
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slash
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)/$ /$1 [L,R=301]

# SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]`,
      },
    ],
    tips: [
      'Prefer Nginx for reverse proxy; Apache for .htaccess-heavy PHP apps',
      'Disable unused modules to reduce memory footprint',
      'Use mpm_event over mpm_prefork for better concurrency',
      'Check loaded modules: apachectl -M',
    ],
  },

  // ─── PM2 ─────────────────────────────────────────────────────────────
  {
    id: 'pm2-basics',
    tool: 'PM2',
    icon: 'pm2',
    color: '#2B037A',
    category: 'Process Manager',
    title: 'PM2 Process Manager',
    description: 'Production process manager for Node.js with clustering, monitoring, and auto-restart.',
    commands: [
      { cmd: 'pm2 start app.js', desc: 'Start an application' },
      { cmd: 'pm2 start app.js --name myapp', desc: 'Start with a custom name' },
      { cmd: 'pm2 start app.js -i max', desc: 'Cluster mode (all CPU cores)' },
      { cmd: 'pm2 start ecosystem.config.js', desc: 'Start from config file' },
      { cmd: 'pm2 list', desc: 'List all running processes' },
      { cmd: 'pm2 monit', desc: 'Real-time monitoring dashboard' },
      { cmd: 'pm2 logs', desc: 'Stream all application logs' },
      { cmd: 'pm2 logs myapp --lines 100', desc: 'Last 100 lines of app logs' },
      { cmd: 'pm2 restart myapp', desc: 'Restart an application' },
      { cmd: 'pm2 reload myapp', desc: 'Zero-downtime reload (cluster)' },
      { cmd: 'pm2 stop myapp', desc: 'Stop an application' },
      { cmd: 'pm2 delete myapp', desc: 'Remove from PM2 process list' },
      { cmd: 'pm2 save', desc: 'Save current process list for startup' },
      { cmd: 'pm2 startup', desc: 'Generate system startup script' },
      { cmd: 'pm2 flush', desc: 'Clear all log files' },
    ],
    configSnippets: [
      {
        title: 'ecosystem.config.js',
        lang: 'javascript',
        code: `module.exports = {
  apps: [
    {
      name: 'api-server',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      merge_logs: true,
      watch: false,
    },
  ],
};`,
      },
    ],
    tips: [
      'Always run pm2 save after adding/removing apps to persist across reboots',
      'Use pm2 reload for zero-downtime deploys in cluster mode',
      'Set max_memory_restart to auto-restart leaky apps',
      'pm2 monit gives real-time CPU/memory per process',
      'Use pm2 start npm -- start for npm-based projects',
    ],
  },

  // ─── Git ─────────────────────────────────────────────────────────────
  {
    id: 'git-basics',
    tool: 'Git',
    icon: 'git',
    color: '#F05032',
    category: 'Version Control',
    title: 'Git Quick Reference',
    description: 'Essential Git commands for daily development, branching, and collaboration.',
    commands: [
      { cmd: 'git init', desc: 'Initialize a new repository' },
      { cmd: 'git clone <url>', desc: 'Clone a remote repository' },
      { cmd: 'git status', desc: 'Check working tree status' },
      { cmd: 'git add .', desc: 'Stage all changes' },
      { cmd: 'git commit -m "msg"', desc: 'Commit staged changes' },
      { cmd: 'git push origin main', desc: 'Push commits to remote' },
      { cmd: 'git pull origin main', desc: 'Fetch and merge remote changes' },
      { cmd: 'git branch feature/x', desc: 'Create a new branch' },
      { cmd: 'git checkout -b feature/x', desc: 'Create and switch to branch' },
      { cmd: 'git merge feature/x', desc: 'Merge branch into current' },
      { cmd: 'git log --oneline -20', desc: 'Compact commit history' },
      { cmd: 'git stash', desc: 'Stash uncommitted changes' },
      { cmd: 'git stash pop', desc: 'Restore stashed changes' },
      { cmd: 'git reset --hard HEAD~1', desc: 'Undo last commit (destructive)' },
      { cmd: 'git diff --cached', desc: 'Show staged changes' },
      { cmd: 'git remote -v', desc: 'List remote URLs' },
      { cmd: 'git tag v1.0.0', desc: 'Create a lightweight tag' },
    ],
    tips: [
      'Use git pull --rebase to keep history linear',
      'Set git config --global pull.rebase true for default rebase',
      'Use .gitignore to exclude node_modules, .env, dist, etc.',
      'git cherry-pick <sha> to apply specific commits to another branch',
      'Use git bisect to find the commit that introduced a bug',
    ],
  },

  // ─── Docker ──────────────────────────────────────────────────────────
  {
    id: 'docker-basics',
    tool: 'Docker',
    icon: 'docker',
    color: '#2496ED',
    category: 'Containers',
    title: 'Docker Essentials',
    description: 'Container management, image building, and Docker Compose for multi-service apps.',
    commands: [
      { cmd: 'docker ps', desc: 'List running containers' },
      { cmd: 'docker ps -a', desc: 'List all containers (including stopped)' },
      { cmd: 'docker images', desc: 'List local images' },
      { cmd: 'docker build -t myapp .', desc: 'Build image from Dockerfile' },
      { cmd: 'docker run -d -p 3000:3000 myapp', desc: 'Run container in background' },
      { cmd: 'docker exec -it <id> bash', desc: 'Shell into running container' },
      { cmd: 'docker logs -f <id>', desc: 'Follow container logs' },
      { cmd: 'docker stop <id>', desc: 'Stop a container' },
      { cmd: 'docker rm <id>', desc: 'Remove a container' },
      { cmd: 'docker rmi <image>', desc: 'Remove an image' },
      { cmd: 'docker system prune -a', desc: 'Clean unused images/containers/volumes' },
      { cmd: 'docker compose up -d', desc: 'Start all services (detached)' },
      { cmd: 'docker compose down', desc: 'Stop and remove all services' },
      { cmd: 'docker compose logs -f api', desc: 'Follow logs for specific service' },
    ],
    configSnippets: [
      {
        title: 'Node.js Multi-Stage Dockerfile',
        lang: 'dockerfile',
        code: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
      },
    ],
    tips: [
      'Use multi-stage builds to reduce image size by 60-80%',
      'Never store secrets in Dockerfiles - use env vars or secrets',
      'Add .dockerignore to exclude node_modules, .git, etc.',
      'Use docker compose watch for dev hot-reload (Compose v2.22+)',
      'Pin image versions (node:20.11-alpine) instead of :latest',
    ],
  },

  // ─── Systemd ─────────────────────────────────────────────────────────
  {
    id: 'systemd-basics',
    tool: 'Systemd',
    icon: 'systemd',
    color: '#333333',
    category: 'System',
    title: 'Systemd Service Management',
    description: 'Create and manage Linux system services with systemd unit files.',
    commands: [
      { cmd: 'sudo systemctl start myapp', desc: 'Start a service' },
      { cmd: 'sudo systemctl stop myapp', desc: 'Stop a service' },
      { cmd: 'sudo systemctl restart myapp', desc: 'Restart a service' },
      { cmd: 'sudo systemctl status myapp', desc: 'Check service status' },
      { cmd: 'sudo systemctl enable myapp', desc: 'Enable on boot' },
      { cmd: 'sudo systemctl disable myapp', desc: 'Disable on boot' },
      { cmd: 'sudo systemctl daemon-reload', desc: 'Reload unit files after changes' },
      { cmd: 'sudo journalctl -u myapp -f', desc: 'Follow service logs' },
      { cmd: 'sudo journalctl -u myapp --since "1 hour ago"', desc: 'Logs from last hour' },
      { cmd: 'systemctl list-units --type=service', desc: 'List all services' },
    ],
    configSnippets: [
      {
        title: 'Node.js Service Unit File',
        lang: 'ini',
        code: `[Unit]
Description=My Node.js Application
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`,
      },
    ],
    tips: [
      'Always run daemon-reload after editing .service files',
      'Use Restart=on-failure for auto-recovery',
      'Place custom services in /etc/systemd/system/',
      'Use journalctl -u myapp -n 50 --no-pager for quick log check',
    ],
  },

  // ─── SSH ──────────────────────────────────────────────────────────────
  {
    id: 'ssh-basics',
    tool: 'SSH',
    icon: 'ssh',
    color: '#4EAA25',
    category: 'Remote Access',
    title: 'SSH Quick Reference',
    description: 'Secure shell access, key management, tunneling, and config shortcuts.',
    commands: [
      { cmd: 'ssh user@host', desc: 'Connect to remote server' },
      { cmd: 'ssh -p 2222 user@host', desc: 'Connect on custom port' },
      { cmd: 'ssh -i ~/.ssh/mykey.pem user@host', desc: 'Connect with specific key' },
      { cmd: 'ssh-keygen -t ed25519 -C "email"', desc: 'Generate ED25519 key pair' },
      { cmd: 'ssh-copy-id user@host', desc: 'Copy public key to server' },
      { cmd: 'ssh -L 3000:localhost:3000 user@host', desc: 'Local port forwarding (tunnel)' },
      { cmd: 'ssh -D 1080 user@host', desc: 'SOCKS proxy tunnel' },
      { cmd: 'scp file.txt user@host:/path/', desc: 'Copy file to remote' },
      { cmd: 'scp -r dir/ user@host:/path/', desc: 'Copy directory to remote' },
      { cmd: 'rsync -avz ./dist/ user@host:/var/www/', desc: 'Sync files efficiently' },
    ],
    configSnippets: [
      {
        title: 'SSH Config (~/.ssh/config)',
        lang: 'ssh-config',
        code: `Host prod-server
    HostName 13.201.238.28
    User deploy
    IdentityFile ~/.ssh/prod_key.pem
    Port 22

Host staging
    HostName 10.0.1.41
    User deploy
    IdentityFile ~/.ssh/staging_key.pem
    ProxyJump prod-server

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes`,
      },
    ],
    tips: [
      'Use ED25519 keys over RSA for better security and performance',
      'Set chmod 600 on private keys, chmod 700 on .ssh directory',
      'Use ProxyJump for bastion/jump host access',
      'Add ServerAliveInterval to prevent timeouts',
      'Use rsync instead of scp for large/incremental transfers',
    ],
  },

  // ─── Certbot / SSL ───────────────────────────────────────────────────
  {
    id: 'certbot-basics',
    tool: 'Certbot',
    icon: 'certbot',
    color: '#FFD700',
    category: 'Security',
    title: 'SSL/TLS with Certbot',
    description: "Free SSL certificates from Let's Encrypt with automatic renewal.",
    commands: [
      { cmd: 'sudo apt install certbot python3-certbot-nginx', desc: 'Install Certbot for Nginx' },
      { cmd: 'sudo certbot --nginx -d example.com', desc: 'Auto-configure SSL for Nginx' },
      { cmd: 'sudo certbot certonly --standalone -d example.com', desc: 'Standalone certificate' },
      { cmd: 'sudo certbot renew --dry-run', desc: 'Test renewal process' },
      { cmd: 'sudo certbot certificates', desc: 'List all certificates' },
      { cmd: 'sudo certbot revoke --cert-path /etc/letsencrypt/live/example.com/cert.pem', desc: 'Revoke a certificate' },
      { cmd: 'sudo certbot delete --cert-name example.com', desc: 'Delete certificate files' },
    ],
    tips: [
      'Certbot auto-renews via systemd timer - check with systemctl list-timers',
      'Use --nginx or --apache flags for automatic web server config',
      'Wildcard certs require DNS challenge: --preferred-challenges dns',
      'Rate limit: 50 certs per domain per week on production',
    ],
  },

  // ─── Git Server Setup (Internal Runbook) ─────────────────────────────
  {
    id: 'git-server-setup',
    tool: 'Git',
    icon: 'git',
    color: '#F05032',
    category: 'Deployment',
    title: 'Git Server Setup (EC2 + GitHub)',
    description: 'Step-by-step guide for connecting EC2 servers to GitHub via SSH for client project deployments.',
    commands: [
      { cmd: 'git --version', desc: 'Check Git version on server' },
      { cmd: 'cd ~ && ssh-keygen -t ed25519 -C "ec2-server"', desc: 'Generate ED25519 key on EC2' },
      { cmd: 'cd ~ && ssh-keygen -t rsa -b 4096 -C "ec2-server"', desc: 'Generate RSA key (alternative)' },
      { cmd: 'ls -l ~/.ssh', desc: 'Verify key files were created' },
      { cmd: 'cat ~/.ssh/id_ed25519.pub', desc: 'Display public key (ED25519)' },
      { cmd: 'cat ~/.ssh/id_rsa.pub', desc: 'Display public key (RSA)' },
      { cmd: 'ssh -T git@github.com', desc: 'Verify GitHub SSH authentication' },
      { cmd: 'git init', desc: 'Initialize repo in project directory' },
      { cmd: 'git config --global user.name "Your Name"', desc: 'Set Git identity (name)' },
      { cmd: 'git config --global user.email "your@email.com"', desc: 'Set Git identity (email)' },
      { cmd: 'git remote add origin git@github.com:Org/Repo.git', desc: 'Add remote origin (SSH URL)' },
      { cmd: 'git fetch', desc: 'Fetch latest branches from remote' },
      { cmd: 'git checkout -t origin/main', desc: 'Checkout and track main branch' },
      { cmd: 'git pull origin main', desc: 'Pull latest code from GitHub' },
    ],
    configSnippets: [
      {
        title: 'Server Setup Flow (EC2 / Ubuntu)',
        lang: 'bash',
        code: `# 1. Navigate to project directory
cd /var/www/html/ClientProject

# 2. Generate SSH key
cd ~ && ssh-keygen -t ed25519 -C "ec2-server"

# 3. Copy public key and add to GitHub
#    GitHub > Settings > SSH and GPG keys > New SSH key
cat ~/.ssh/id_ed25519.pub

# 4. Verify connection
ssh -T git@github.com

# 5. Initialize and connect repo
cd /var/www/html/ClientProject
git init
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git remote add origin git@github.com:Org/Repo.git
git fetch
git checkout -t origin/main
git pull origin main`,
      },
      {
        title: 'Local Setup (Windows)',
        lang: 'powershell',
        code: `# Generate ED25519 key
ssh-keygen -t ed25519 -C "dev@company.com"

# View public key
type %USERPROFILE%\\.ssh\\id_ed25519.pub

# Copy to clipboard
type %USERPROFILE%\\.ssh\\id_ed25519.pub | clip

# Then add to GitHub > Settings > SSH and GPG keys`,
      },
      {
        title: 'SSH Key Removal (Revoke Access)',
        lang: 'bash',
        code: `# --- Server (EC2) ---
cd ~/.ssh
ls -l ~/.ssh
rm id_ed25519 id_ed25519.pub    # Remove ED25519 keys
# OR
rm id_rsa id_rsa.pub            # Remove RSA keys
# Then: GitHub > Settings > SSH keys > Delete the key

# --- Local (Windows PowerShell) ---
cd $env:USERPROFILE\\.ssh
Remove-Item id_ed25519
Remove-Item id_ed25519.pub
# Then: GitHub > Settings > SSH keys > Delete the key`,
      },
    ],
    tips: [
      'Always use SSH URLs (git@github.com:...) not HTTPS for server deployments',
      'Verify with ssh -T git@github.com before attempting git operations',
      'Use ED25519 over RSA -- smaller keys, better security, faster auth',
      'Keep separate SSH keys per server -- easier to revoke access when needed',
      'Check if branch is main or master on GitHub before checkout',
      'Set chmod 600 on private key files or SSH will refuse to use them',
    ],
  },

  // ─── MySQL Event Scheduler (Internal Runbook) ────────────────────────
  {
    id: 'mysql-events',
    tool: 'MySQL',
    icon: 'mysql',
    color: '#4479A1',
    category: 'Database',
    title: 'MySQL Event Scheduler',
    description: 'Scheduled database maintenance tasks -- enable the event scheduler, create recurring truncate/cleanup jobs, and monitor execution.',
    commands: [
      { cmd: "SHOW VARIABLES LIKE 'event_scheduler';", desc: 'Check if event scheduler is running' },
      { cmd: 'SET GLOBAL event_scheduler = ON;', desc: 'Enable event scheduler globally' },
      { cmd: 'SHOW EVENTS FROM mydb;', desc: 'List all events in a database' },
      { cmd: 'ALTER EVENT mydb.my_event ENABLE;', desc: 'Enable a specific event' },
      { cmd: 'ALTER EVENT mydb.my_event DISABLE;', desc: 'Disable (pause) an event' },
      { cmd: 'ALTER EVENT mydb.my_event ON SCHEDULE EVERY 3 MINUTE;', desc: 'Change event frequency' },
      { cmd: 'DROP EVENT IF EXISTS mydb.my_event;', desc: 'Delete an event' },
      { cmd: 'SELECT @@global.time_zone;', desc: 'Check server timezone for events' },
    ],
    configSnippets: [
      {
        title: 'Query Event Details (information_schema)',
        lang: 'sql',
        code: `SELECT
  EVENT_SCHEMA AS database_name,
  EVENT_NAME,
  STATUS,
  LAST_EXECUTED,
  INTERVAL_VALUE,
  INTERVAL_FIELD
FROM information_schema.EVENTS
WHERE EVENT_SCHEMA = 'mydb'
ORDER BY EVENT_NAME;`,
      },
      {
        title: 'Create Hourly Truncate Event',
        lang: 'sql',
        code: `DELIMITER $$

-- Drop before creating to avoid "already exists" errors
DROP EVENT IF EXISTS mydb.Truncate_event $$

CREATE EVENT mydb.Truncate_event
ON SCHEDULE EVERY 1 HOUR
ON COMPLETION PRESERVE
ENABLE
DO
BEGIN
  -- Clear temporary/session tables to keep DB size in check
  TRUNCATE TABLE mydb.dt_user_device;
  TRUNCATE TABLE mydb.ci_sessions;
  TRUNCATE TABLE mydb.ci_usersessions;
END $$

DELIMITER ;`,
      },
      {
        title: 'Make Event Scheduler Permanent (my.cnf)',
        lang: 'ini',
        code: `[mysqld]
# Enable event scheduler on server start
event_scheduler = ON`,
      },
    ],
    tips: [
      'event_scheduler must be ON globally or no events will fire -- even if they are ENABLED',
      'Add event_scheduler=ON to my.cnf/my.ini to persist across MySQL restarts',
      'Use ON COMPLETION PRESERVE to keep the event after execution (default deletes it)',
      'TRUNCATE is faster than DELETE -- it drops and recreates the table structure instantly',
      'DELIMITER $$ is required because BEGIN...END blocks contain semicolons that would break the statement',
      'You need the EVENT privilege to create or modify events -- check with SHOW GRANTS',
      'If events fail silently, check /var/log/mysql/error.log for details',
      'Events run in the server timezone -- verify with SELECT @@global.time_zone',
    ],
  },

  // ─── Connect to Server (Internal Runbook) ────────────────────────────
  {
    id: 'connect-to-server',
    tool: 'SSH',
    icon: 'ssh',
    color: '#4EAA25',
    category: 'Remote Access',
    title: 'Connect to Remote Server (Windows)',
    description: 'SSH into EC2/Linux servers from Windows using PEM keys, with SSH config shortcuts and troubleshooting.',
    commands: [
      { cmd: 'ssh -i "C:\\Keys\\server.pem" ubuntu@54.123.45.67', desc: 'Connect with PEM key (basic syntax)' },
      { cmd: 'ssh -i "path\\to\\your-key.pem" username@server-ip', desc: 'Generic connection template' },
      { cmd: 'notepad $env:USERPROFILE\\.ssh\\config', desc: 'Open SSH config in Notepad (PowerShell)' },
      { cmd: 'ssh myserver', desc: 'Connect using SSH config shortcut' },
    ],
    configSnippets: [
      {
        title: 'SSH Config Shortcut (~/.ssh/config)',
        lang: 'text',
        code: `Host myserver
    HostName 54.123.45.67
    User ubuntu
    IdentityFile "C:\\Keys\\server.pem"

# Host     = Nickname you type (ssh myserver)
# HostName = Actual IP address
# User     = Server username (ubuntu / ec2-user)
# IdentityFile = Path to .pem key file`,
      },
      {
        title: 'Fix "Unprotected Private Key" on Windows',
        lang: 'powershell',
        code: `# Fix permissions on .pem file via PowerShell:
# 1. Right-click .pem file > Properties > Security > Advanced
# 2. Click "Disable Inheritance"
# 3. Remove all users except yourself
#
# Or via icacls:
icacls "C:\\Keys\\server.pem" /inheritance:r
icacls "C:\\Keys\\server.pem" /grant:r "%USERNAME%:R"`,
      },
    ],
    tips: [
      'Move .pem keys to a safe folder like C:\\Keys\\ or ~/.ssh/',
      'First connection will ask to confirm host fingerprint -- type "yes"',
      'Wrap key path in quotes if it contains spaces: -i "C:\\My Files\\key.pem"',
      '"Permission denied (publickey)" usually means wrong username or wrong .pem file',
      'Ubuntu EC2 uses "ubuntu" as default user; Amazon Linux uses "ec2-user"',
      'Set up SSH config shortcuts to avoid typing IP and key path every time',
      '"Unprotected Private Key" error: fix by removing other users from file permissions',
    ],
  },

  // ─── EC2 Server Monitoring (Internal Runbook) ────────────────────────
  {
    id: 'ec2-server-monitoring',
    tool: 'EC2',
    icon: 'ec2',
    color: '#FF9900',
    category: 'Server Ops',
    title: 'EC2 Server Monitoring & Diagnostics',
    description: 'Server health checks, connection counting, port monitoring, and process diagnostics for production EC2 instances.',
    commands: [
      { cmd: 'sudo systemctl status apache2', desc: 'Check Apache service status' },
      { cmd: 'sudo systemctl is-active apache2', desc: 'Quick active/inactive check' },
      { cmd: 'sudo systemctl is-enabled apache2', desc: 'Check if enabled on boot' },
      { cmd: 'sudo apache2ctl configtest', desc: 'Test Apache config syntax' },
      { cmd: 'sudo apache2ctl -S', desc: 'Show parsed Apache vhost config' },
      { cmd: 'sudo apache2ctl -t -D DUMP_VHOSTS', desc: 'Dump all virtual hosts' },
      { cmd: 'apache2ctl -M', desc: 'List loaded Apache modules' },
      { cmd: 'apache2 -v', desc: 'Check Apache version' },
      { cmd: 'ls /etc/apache2/sites-available/', desc: 'List available site configs' },
      { cmd: 'ls /etc/apache2/sites-enabled/', desc: 'List enabled site configs' },
      { cmd: 'curl -I http://localhost', desc: 'Quick health check (response headers)' },
      { cmd: 'sudo netstat -tuln | grep :80', desc: 'Check if port 80 is listening' },
      { cmd: 'sudo ss -tuln | grep :80', desc: 'Check port 80 (modern alternative)' },
      { cmd: 'ps aux | grep apache2', desc: 'Check Apache process status' },
      { cmd: 'htop', desc: 'Interactive CPU/RAM monitor' },
      { cmd: 'free -h', desc: 'Check memory usage (human readable)' },
      { cmd: 'pm2 show "my-app"', desc: 'PM2 app-specific details' },
      { cmd: 'pm2 update', desc: 'Update PM2 in-memory daemon' },
    ],
    configSnippets: [
      {
        title: 'Count Active Web Connections',
        lang: 'bash',
        code: `# Count connections on Port 80 (HTTP)
netstat -an | grep :80 | grep ESTABLISHED | wc -l

# Count connections on Port 443 (HTTPS)
netstat -an | grep :443 | grep ESTABLISHED | wc -l

# Count WebSocket connections (Node.js on port 3000)
netstat -an | grep :3000 | grep ESTABLISHED | wc -l

# Detailed: List IPs connected to Port 80 (sorted by count)
netstat -an | grep :80 | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr`,
      },
      {
        title: 'Apache Config File Locations',
        lang: 'bash',
        code: `# Site configs
ls /etc/apache2/sites-available/    # All site configs
ls /etc/apache2/sites-enabled/      # Active (symlinked) sites

# Module configs
ls /etc/apache2/mods-available/     # All module configs
ls /etc/apache2/mods-enabled/       # Active modules

# Enable/Disable sites
sudo a2ensite your-site.conf        # Enable
sudo a2dissite your-site.conf       # Disable

# Enable/Disable modules
sudo a2enmod rewrite                # Enable
sudo a2dismod rewrite               # Disable`,
      },
      {
        title: 'Quick Server Health Check Script',
        lang: 'bash',
        code: `#!/bin/bash
echo "=== Apache Status ==="
sudo systemctl is-active apache2
echo ""
echo "=== Memory ==="
free -h
echo ""
echo "=== Port 80 Connections ==="
netstat -an | grep :80 | grep ESTABLISHED | wc -l
echo ""
echo "=== Port 443 Connections ==="
netstat -an | grep :443 | grep ESTABLISHED | wc -l
echo ""
echo "=== WebSocket (3000) ==="
netstat -an | grep :3000 | grep ESTABLISHED | wc -l
echo ""
echo "=== PM2 Processes ==="
pm2 list`,
      },
    ],
    tips: [
      'Always run apache2ctl configtest before restarting -- returns "Syntax OK" if clean',
      'Use ss instead of netstat on newer systems -- faster and more detailed',
      'Install htop (sudo apt install htop) for interactive CPU/RAM monitoring',
      'Count connections by IP to identify traffic spikes or DDoS patterns',
      'WebSocket connections persist on custom ports -- check 3000/8080 not just 80/443',
      'pm2 show "app-name" gives detailed memory/restart/uptime stats per app',
      'Combine free -h with htop to diagnose if server is memory or CPU bound',
    ],
  },

  // ─── EC2 Full Setup (Internal Runbook) ───────────────────────────────
  {
    id: 'ec2-full-setup',
    tool: 'EC2',
    icon: 'ec2',
    color: '#FF9900',
    category: 'Deployment',
    title: 'EC2 Full Deployment Guide',
    description: 'Complete EC2 server setup -- packages, Apache vhosts with WebSocket proxy, PHP-FPM, PM2, cron jobs, monitoring, and emergency fixes.',
    commands: [
      { cmd: 'sudo apt update && sudo apt upgrade -y', desc: 'Update system packages' },
      { cmd: 'sudo apt install apache2 -y', desc: 'Install Apache' },
      { cmd: 'sudo apt install php php-cli php-mysql unzip curl git -y', desc: 'Install PHP + tools' },
      { cmd: 'sudo apt install nodejs npm -y', desc: 'Install Node.js + npm' },
      { cmd: 'sudo npm install pm2 -g', desc: 'Install PM2 globally' },
      { cmd: 'curl http://checkip.amazonaws.com', desc: 'Get EC2 public IP' },
      { cmd: 'sudo chown -R www-data:www-data /var/www/html/project', desc: 'Set web directory ownership' },
      { cmd: 'sudo chmod -R 755 /var/www/html/project', desc: 'Set web directory permissions' },
      { cmd: 'sudo a2enmod rewrite proxy proxy_http proxy_wstunnel headers', desc: 'Enable required Apache modules' },
      { cmd: 'sudo a2ensite mysite.conf', desc: 'Enable site config' },
      { cmd: 'sudo php-fpm8.3 -t', desc: 'Test PHP-FPM config' },
      { cmd: 'sudo systemctl reload php8.3-fpm', desc: 'Graceful PHP-FPM reload' },
      { cmd: 'sudo lsof -i :3000', desc: 'Find process using a port' },
      { cmd: 'ulimit -n', desc: 'Check file descriptor limit' },
      { cmd: 'mysqldump -u user -p database > backup.sql', desc: 'Backup MySQL database' },
      { cmd: 'mysql -u user -p database < updates.sql', desc: 'Restore/import SQL' },
    ],
    configSnippets: [
      {
        title: 'Apache VirtualHost with WebSocket Proxy',
        lang: 'apache',
        code: `<VirtualHost *:5000>
    ServerAdmin webmaster@localhost
    ServerName test.client.com
    ServerAlias test.client.com
    DocumentRoot /var/www/html/clientproject

    <Directory /var/www/html/clientproject>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    AllowEncodedSlashes NoDecode
    RewriteEngine On

    # WebSocket proxy (socket.io)
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/socket.io/(.*) ws://localhost:5001/socket.io/$1 [P,L]
    ProxyPass /socket.io/ http://localhost:5001/socket.io/ nocanon
    ProxyPassReverse /socket.io/ http://localhost:5001/socket.io/

    # Rate socket proxy
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/ratesocket/(.*) ws://localhost:55000/ratesocket/$1 [P,L]
    ProxyPass /ratesocket/ http://localhost:55000/ratesocket/ nocanon
    ProxyPassReverse /ratesocket/ http://localhost:55000/ratesocket/

    ProxyTimeout 30

    ErrorLog \${APACHE_LOG_DIR}/client_error.log
    CustomLog \${APACHE_LOG_DIR}/client_access.log combined
</VirtualHost>`,
      },
      {
        title: 'Server Health Check Script',
        lang: 'bash',
        code: `#!/bin/bash
echo "=== PHP-FPM Status ==="
sudo systemctl status php8.3-fpm | grep -i "status:"
echo "Worker Count: $(ps aux | grep php-fpm | grep -v grep | wc -l)"

echo "=== Apache Status ==="
sudo systemctl status apache2 | grep Active

echo "=== System Resources ==="
free -h | grep Mem
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"

echo "=== WebSocket Status ==="
pm2 status

echo "=== Active Connections ==="
netstat -an | grep :80 | wc -l`,
      },
      {
        title: 'Emergency Quick Fixes',
        lang: 'bash',
        code: `# 1. 504 Errors / High Load
sudo systemctl restart php8.3-fpm
sudo systemctl reload apache2

# 2. WebSocket Issues
pm2 restart all
pm2 logs app_name --lines 50

# 3. Clear Logs (Free Disk Space)
sudo truncate -s 0 /var/log/php8.3-fpm.log
sudo truncate -s 0 /var/log/apache2/error.log

# 4. Config Backup Before Changes
sudo cp /etc/php/8.3/fpm/pool.d/www.conf /etc/php/8.3/fpm/pool.d/www.conf.bak-$(date +%Y%m%d)`,
      },
      {
        title: 'Useful Server Aliases (~/.bashrc)',
        lang: 'bash',
        code: `alias logs="tail -f /var/log/apache2/error.log"
alias access_logs="tail -f /var/log/apache2/client_access.log"
alias restart_web="sudo systemctl restart php8.3-fpm && sudo systemctl reload apache2 && pm2 restart all"
alias status_all="sudo systemctl status php8.3-fpm; sudo systemctl status apache2; pm2 status"`,
      },
      {
        title: 'Traffic & WebSocket Monitoring',
        lang: 'bash',
        code: `# Watch requests per minute (live)
watch -n 5 'tail -n 5000 /var/log/apache2/client_access.log | grep "rate_data" | wc -l'

# Count polling vs WebSocket connections
echo "Polling:" && grep -c 'transport=polling' /var/log/apache2/client_access.log
echo "WebSocket:" && grep -c 'transport=websocket' /var/log/apache2/client_access.log

# Top 20 most-hit URLs
sudo awk '{print $7}' /var/log/apache2/client_access.log | sort | uniq -c | sort -nr | head -20

# Watch active connections on custom port
watch -n 2 "ss -ant | wc -l"

# Check file descriptors for a process
ls /proc/$(pgrep -f app_name)/fd | wc -l`,
      },
    ],
    tips: [
      'Open ports 80, 443, 3000, and custom ports in AWS Security Groups before deployment',
      'Always enable proxy_wstunnel for WebSocket support through Apache',
      'Use AllowEncodedSlashes NoDecode for APIs with encoded query strings',
      'Set ProxyTimeout to prevent WebSocket connections from timing out',
      'Use truncate -s 0 instead of rm to clear logs without breaking log rotation',
      'Backup configs before changes: cp file file.bak-$(date +%Y%m%d)',
      'Set up bash aliases for common monitoring commands to save time during incidents',
      'Check file descriptor limits (ulimit -n) if you hit connection limits under load',
    ],
  },

  // ─── Android App Publishing (Internal Runbook) ──────────────────────
  {
    id: 'android-app-publish',
    tool: 'Ionic',
    icon: 'ionic',
    color: '#3880FF',
    category: 'Mobile App',
    title: 'Android App Publishing (Ionic)',
    description: 'Complete checklist for building, signing, and publishing Ionic/Cordova Android apps -- platform setup, keystore, signing config, and status bar fixes.',
    commands: [
      { cmd: 'ionic cordova platform rm android', desc: 'Remove existing Android platform' },
      { cmd: 'ionic cordova platform add android@11.0.0', desc: 'Add specific Android platform version' },
      { cmd: 'npm install -g cordova-res', desc: 'Install icon/splash generator' },
      { cmd: 'ionic cordova resources', desc: 'Generate icons and splash screens' },
      { cmd: 'ionic cordova plugin rm onesignal-cordova-plugin', desc: 'Remove old OneSignal' },
      { cmd: 'ionic cordova plugin add onesignal-cordova-plugin@3.3.1', desc: 'Add specific OneSignal version' },
      { cmd: 'cordova plugin remove cordova-plugin-geolocation', desc: 'Remove unused plugins' },
      { cmd: 'ionic serve', desc: 'Test in browser first' },
      { cmd: 'ionic cordova build android --prod', desc: 'Production build (debug)' },
      { cmd: 'ionic cordova build android --prod --release', desc: 'Production release build' },
      { cmd: 'keytool -genkey -v -keystore client.keystore -alias client -keyalg RSA -keysize 2048 -validity 10000', desc: 'Generate signing keystore' },
      { cmd: 'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore client.keystore app-release.aab client', desc: 'Manual AAB signing' },
    ],
    configSnippets: [
      {
        title: 'config.xml Checklist',
        lang: 'xml',
        code: `<!-- Update these before every release: -->
<!-- 1. android-versionCode (increment each build) -->
<!-- 2. id (app package name) -->
<!-- 3. version (display version) -->
<!-- 4. android-targetSdkVersion (Play Store requirement) -->

<widget
  android-versionCode="33"
  id="client.bullion.app"
  version="3.0.11">

  <preference name="android-targetSdkVersion" value="33" />
  <name>Client Bullion</name>
  <description>Bullion trading app</description>
</widget>`,
      },
      {
        title: 'build.gradle Signing Config',
        lang: 'groovy',
        code: `// File: platforms/android/app/build.gradle
android {
    if (cdvReleaseSigningPropertiesFile) {
        signingConfigs {
            release {
                keyAlias = "client"
                keyPassword = "password"
                storeFile = file("client.keystore")
                storePassword = "password"
            }
        }
        buildTypes {
            release {
                signingConfig signingConfigs.release
            }
        }
    }
}`,
      },
      {
        title: 'gradle.properties (Cleaner Method)',
        lang: 'properties',
        code: `org.gradle.jvmargs=-Xmx2048m
android.useAndroidX=true
android.enableJetifier=true

# Signing Credentials
MYAPP_RELEASE_STORE_FILE=client.keystore
MYAPP_RELEASE_KEY_ALIAS=client
MYAPP_RELEASE_STORE_PASSWORD=password
MYAPP_RELEASE_KEY_PASSWORD=password`,
      },
      {
        title: 'iOS 15+ Status Bar Fix (app.component.ts)',
        lang: 'typescript',
        code: `// Dynamic safe area handling for iOS 15+
statusBar.show();
if (this.device.version >= "15") {
  document.documentElement.style.setProperty("--header-padding", "38px");
  document.documentElement.style.setProperty("--footer-padding", "40px");
  document.documentElement.style.setProperty("--viewer-margin-top", "88px");
  document.documentElement.style.setProperty("--fabs-margin-bottom", "130px");
} else {
  document.documentElement.style.setProperty("--fabs-margin-bottom", "95px");
}`,
      },
      {
        title: 'Deep Clean & Rebuild (When Stuck)',
        lang: 'bash',
        code: `# Kill stuck processes
taskkill /F /IM node.exe
taskkill /F /IM java.exe
taskkill /F /IM adb.exe

# Deep clean
cmd /c rd /s /q node_modules
cmd /c rd /s /q platforms
cmd /c rd /s /q plugins
cmd /c rd /s /q www
del package-lock.json

# Fresh install
npm cache clean --force
set NODE_OPTIONS=--openssl-legacy-provider
npm install --legacy-peer-deps

# Rebuild
npx ionic cordova platform add android@13.0.0
npx ionic cordova build android`,
      },
    ],
    tips: [
      'Always increment android-versionCode in config.xml before each Play Store upload',
      'Switch ALL test/staging URLs to production IPs before release build',
      'Check these files for URLs: liverates.ts, common-service.ts, socketsample.js, app.module.ts',
      'Use cordova-res for automatic icon/splash generation from source images',
      'Notification icons must be transparent -- use remove.bg and AndroidAssetStudio',
      'For node-sass errors: collapse multiline strings in ionic.functions.scss to single line',
      'Use --legacy-peer-deps flag for older Ionic projects with dependency conflicts',
      'Keep keystores backed up securely -- losing them means you cannot update the app',
    ],
  },

  // ─── Dev Environment Setup (Internal Runbook) ────────────────────────
  {
    id: 'dev-environment-setup',
    tool: 'Node.js',
    icon: 'nodejs',
    color: '#339933',
    category: 'Setup',
    title: 'Dev Environment Setup (Windows)',
    description: 'Environment variables, PATH config, and tool installation for Android/Ionic/Cordova development on Windows.',
    commands: [
      { cmd: 'node -v', desc: 'Check Node.js version' },
      { cmd: 'npm -v', desc: 'Check npm version' },
      { cmd: 'javac -version', desc: 'Check Java compiler version' },
      { cmd: 'gradle -v', desc: 'Check Gradle version' },
      { cmd: 'cordova --version', desc: 'Check Cordova version' },
      { cmd: 'npm install -g cordova', desc: 'Install Cordova globally' },
      { cmd: 'npm install -g cordova-res', desc: 'Install resource generator' },
      { cmd: 'npm install -g ionic@5.4.16', desc: 'Install specific Ionic CLI version' },
      { cmd: 'nvm list', desc: 'List installed Node versions (NVM)' },
      { cmd: 'echo $env:JAVA_HOME', desc: 'Verify JAVA_HOME (PowerShell)' },
      { cmd: 'echo $env:ANDROID_HOME', desc: 'Verify ANDROID_HOME (PowerShell)' },
    ],
    configSnippets: [
      {
        title: 'Required Environment Variables',
        lang: 'text',
        code: `Variable            Path
ANDROID_HOME        C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk
ANDROID_SDK_ROOT    C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk
GRADLE              C:\\gradle-7.4.2\\bin
JAVA_HOME           C:\\Program Files\\Java\\jdk-18.0.2.1`,
      },
      {
        title: 'System PATH Additions',
        lang: 'text',
        code: `# Java
C:\\Program Files\\Java\\jdk-18.0.2.1\\bin

# Gradle
C:\\gradle-7.4.2\\bin

# Android SDK
C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk
C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk\\tools

# Node.js
C:\\Program Files\\nodejs\\
C:\\Users\\<user>\\AppData\\Roaming\\npm`,
      },
      {
        title: 'PowerShell Setup Script (Run as Admin)',
        lang: 'powershell',
        code: `# Set environment variables permanently
setx ANDROID_HOME "C:\\Users\\elava\\AppData\\Local\\Android\\Sdk" /M
setx ANDROID_SDK_ROOT "C:\\Users\\elava\\AppData\\Local\\Android\\Sdk" /M
setx GRADLE "C:\\gradle\\gradle-7.4.2\\bin" /M
setx JAVA_HOME "C:\\Program Files\\Java\\jdk-18.0.2.1" /M

# Append to PATH
$CurrentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
$NewPath = $CurrentPath + ";C:\\Program Files\\Java\\jdk-18.0.2.1\\bin" +
           ";C:\\gradle-7.4.2\\bin" +
           ";C:\\Users\\elava\\AppData\\Local\\Android\\Sdk\\tools" +
           ";C:\\Users\\elava\\AppData\\Local\\Android\\Sdk"
[Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")`,
      },
    ],
    tips: [
      'Run setx commands as Administrator or they will only set user-level variables',
      'Open a NEW terminal window after setting env vars -- existing sessions will not see changes',
      'Use NVM to switch Node versions between legacy (v14) and modern (v20+) projects',
      'XAMPP v7.4.33 is required for local PHP testing alongside Ionic builds',
      'Check for duplicate PATH entries to avoid confusion with wrong tool versions',
      'Node v14.21.3 + npm 6.14.18 is the stable combo for legacy Ionic 3/4 projects',
    ],
  },

  // ─── Cron Jobs ───────────────────────────────────────────────────────
  {
    id: 'cron-jobs',
    tool: 'Cron',
    icon: 'cron',
    color: '#6C5CE7',
    category: 'System',
    title: 'Cron Jobs Reference',
    description: 'Schedule recurring tasks on Linux -- syntax guide, common patterns, Laravel scheduler, and log management.',
    commands: [
      { cmd: 'crontab -e', desc: 'Edit current user crontab' },
      { cmd: 'crontab -l', desc: 'List current cron jobs' },
      { cmd: 'sudo crontab -e', desc: 'Edit root crontab' },
      { cmd: 'sudo crontab -u www-data -l', desc: 'List cron for www-data user' },
      { cmd: 'systemctl status cron', desc: 'Check cron service status' },
      { cmd: 'sudo tail -f /var/log/syslog | grep CRON', desc: 'Watch cron execution logs' },
      { cmd: 'sudo grep CRON /var/log/syslog | tail -20', desc: 'Last 20 cron executions' },
    ],
    configSnippets: [
      {
        title: 'Cron Syntax Guide',
        lang: 'text',
        code: `# ┌───────────── minute (0 - 59)
# │ ┌───────────── hour (0 - 23)
# │ │ ┌───────────── day of month (1 - 31)
# │ │ │ ┌───────────── month (1 - 12)
# │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
# │ │ │ │ │
# * * * * *  command

# Examples:
* * * * *       Every minute
*/5 * * * *     Every 5 minutes
0 * * * *       Every hour (on the hour)
0 */2 * * *     Every 2 hours
0 0 * * *       Daily at midnight
0 0 * * 0       Weekly on Sunday at midnight
0 0 1 * *       Monthly on 1st at midnight
30 2 * * 1-5    Mon-Fri at 2:30 AM`,
      },
      {
        title: 'Common Cron Patterns',
        lang: 'bash',
        code: `# Laravel Scheduler (every minute)
* * * * * /usr/bin/php /var/www/html/project/artisan schedule:run >> /var/www/html/project/storage/logs/scheduler.log 2>&1

# MySQL backup daily at 2 AM
0 2 * * * mysqldump -u root -pPASSWORD mydb > /backups/mydb_$(date +\\%Y\\%m\\%d).sql 2>&1

# Clear temp files weekly
0 3 * * 0 find /tmp -type f -mtime +7 -delete

# Restart PM2 apps daily at 4 AM
0 4 * * * pm2 restart all >> /var/log/pm2-restart.log 2>&1

# SSL cert renewal check (twice daily)
0 0,12 * * * certbot renew --quiet

# Disk space alert
0 */6 * * * df -h / | awk 'NR==2 && $5+0 > 80 {print "DISK ALERT: " $5}' | mail -s "Disk Alert" admin@example.com`,
      },
    ],
    tips: [
      'Always redirect output (>> log 2>&1) or cron will try to email results',
      'Use full paths for commands (/usr/bin/php not just php) in crontab',
      'Test your command manually before adding to cron',
      'Use date +\\%Y\\%m\\%d (escaped %) for date in cron -- % has special meaning',
      'crontab -e for user jobs, /etc/cron.d/ for system jobs',
      'Check /var/log/syslog for cron execution history on Ubuntu',
    ],
  },

  // ─── MySQL Admin ─────────────────────────────────────────────────────
  {
    id: 'mysql-admin',
    tool: 'MySQL',
    icon: 'mysql',
    color: '#4479A1',
    category: 'Database',
    title: 'MySQL Administration',
    description: 'User management, backups, performance tuning, slow query debugging, and table maintenance for production MySQL.',
    commands: [
      { cmd: 'mysql -u root -p', desc: 'Connect to MySQL shell' },
      { cmd: 'mysql -u root -p database < file.sql', desc: 'Import SQL file' },
      { cmd: 'mysqldump -u root -p database > backup.sql', desc: 'Export database backup' },
      { cmd: 'mysqldump -u root -p --all-databases > full.sql', desc: 'Backup all databases' },
      { cmd: "SHOW DATABASES;", desc: 'List all databases' },
      { cmd: "SHOW TABLES;", desc: 'List tables in current DB' },
      { cmd: "SHOW PROCESSLIST;", desc: 'Show active queries/connections' },
      { cmd: "SHOW TABLE STATUS;", desc: 'Table sizes and row counts' },
      { cmd: "SHOW VARIABLES LIKE '%max_connections%';", desc: 'Check max connections' },
      { cmd: "SHOW GLOBAL STATUS LIKE 'Threads_connected';", desc: 'Current connection count' },
    ],
    configSnippets: [
      {
        title: 'User Management',
        lang: 'sql',
        code: `-- Create user
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'strongpassword';

-- Grant permissions
GRANT ALL PRIVILEGES ON mydb.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;

-- Show existing grants
SHOW GRANTS FOR 'appuser'@'localhost';

-- Change password
ALTER USER 'appuser'@'localhost' IDENTIFIED BY 'newpassword';

-- Remove user
DROP USER 'appuser'@'localhost';`,
      },
      {
        title: 'Slow Query Log Setup',
        lang: 'sql',
        code: `-- Check current settings
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;  -- Log queries taking > 2 seconds
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- Make permanent in my.cnf:
-- [mysqld]
-- slow_query_log = 1
-- long_query_time = 2
-- slow_query_log_file = /var/log/mysql/slow.log`,
      },
      {
        title: 'Table Maintenance & Optimization',
        lang: 'sql',
        code: `-- Check table size
SELECT table_name, 
  ROUND(data_length/1024/1024, 2) AS data_mb,
  ROUND(index_length/1024/1024, 2) AS index_mb,
  table_rows
FROM information_schema.tables 
WHERE table_schema = 'mydb' 
ORDER BY data_length DESC;

-- Optimize fragmented tables
OPTIMIZE TABLE mydb.large_table;

-- Repair corrupted table
REPAIR TABLE mydb.broken_table;

-- Check table integrity
CHECK TABLE mydb.important_table;`,
      },
    ],
    tips: [
      'Always backup before running ALTER TABLE on production',
      'Use mysqldump --single-transaction for InnoDB to avoid locking',
      'Enable slow query log to find performance bottlenecks',
      'OPTIMIZE TABLE reclaims space after large DELETE operations',
      'Set max_connections based on server RAM (roughly 1 connection = 10MB)',
      'Use SHOW PROCESSLIST to find and KILL long-running queries',
      'Schedule automated backups via cron, not manually',
    ],
  },
];

/**
 * DevOps Documentation Routes
 */
export async function devopsDocsRoutes(app: FastifyInstance) {

  // ─── GET /devops-docs — List all docs with optional search/filter ────
  app.get(
    '/devops-docs',
    async (request: FastifyRequest<{ Querystring: { q?: string; tool?: string; category?: string } }>) => {
      const { q, tool, category } = request.query;
      let results = DOCS;

      if (tool) {
        results = results.filter(d => d.tool.toLowerCase() === tool.toLowerCase());
      }
      if (category) {
        results = results.filter(d => d.category.toLowerCase() === category.toLowerCase());
      }
      if (q) {
        const query = q.toLowerCase();
        results = results.filter(d =>
          d.title.toLowerCase().includes(query) ||
          d.tool.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.commands.some(c => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)) ||
          d.tips?.some(t => t.toLowerCase().includes(query))
        );
      }

      return {
        data: results.map(d => ({
          id: d.id,
          tool: d.tool,
          icon: d.icon,
          color: d.color,
          category: d.category,
          title: d.title,
          description: d.description,
          commandCount: d.commands.length,
          snippetCount: d.configSnippets?.length || 0,
          tipCount: d.tips?.length || 0,
        })),
        total: results.length,
      };
    },
  );

  // ─── GET /devops-docs/:id — Get full doc by ID ──────────────────────
  app.get(
    '/devops-docs/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const doc = DOCS.find(d => d.id === request.params.id);
      if (!doc) return reply.code(404).send({ error: 'Document not found' });
      return { data: doc };
    },
  );

  // ─── GET /devops-docs/tools — List available tools ──────────────────
  app.get(
    '/devops-docs/tools',
    async () => {
      const tools = [...new Set(DOCS.map(d => d.tool))];
      const categories = [...new Set(DOCS.map(d => d.category))];
      return {
        data: {
          tools: tools.map(t => {
            const doc = DOCS.find(d => d.tool === t)!;
            return { name: t, icon: doc.icon, color: doc.color, category: doc.category };
          }),
          categories,
        },
      };
    },
  );

  // ─── CRUD: Custom Docs (DB-backed, user-created) ─────────────────────
  const { customDocs, deployChecklists } = await import('@cortexo/db/schema');
  const { eq, ilike, desc: descOrder } = await import('drizzle-orm');

  // List custom docs
  app.get('/devops-docs/custom', async () => {
    const rows = await app.db.select().from(customDocs).where(eq(customDocs.isActive, true)).orderBy(descOrder(customDocs.updatedAt));
    return { data: rows };
  });

  // Create custom doc
  app.post('/devops-docs/custom', async (request: FastifyRequest<{ Body: {
    tool: string; title: string; description: string; category?: string; color?: string;
    commands?: { cmd: string; desc: string }[];
    configSnippets?: { title: string; lang: string; code: string }[];
    tips?: string[];
  } }>) => {
    const b = request.body;
    const [row] = await app.db.insert(customDocs).values({
      tool: b.tool, title: b.title, description: b.description,
      category: b.category || 'Custom', color: b.color || '#6366F1',
      commands: b.commands || [], configSnippets: b.configSnippets || [], tips: b.tips || [],
    }).returning();
    return { data: row };
  });

  // Update custom doc
  app.put('/devops-docs/custom/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    const b = request.body as any;
    const [row] = await app.db.update(customDocs).set({
      ...b, updatedAt: new Date(),
    }).where(eq(customDocs.id, id)).returning();
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return { data: row };
  });

  // Delete custom doc (soft delete)
  app.delete('/devops-docs/custom/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    await app.db.update(customDocs).set({ isActive: false }).where(eq(customDocs.id, id));
    return { success: true };
  });

  // ─── Deployment Checklists (Item 8) ──────────────────────────────────

  // List checklists
  app.get('/devops-docs/checklists', async (request: FastifyRequest<{ Querystring: { status?: string } }>) => {
    const { status } = request.query;
    let query = app.db.select().from(deployChecklists).orderBy(descOrder(deployChecklists.updatedAt));
    const rows = await query;
    const filtered = status ? rows.filter(r => r.status === status) : rows;
    return { data: filtered };
  });

  // Create checklist
  app.post('/devops-docs/checklists', async (request: FastifyRequest<{ Body: {
    clientName: string; projectType?: string;
    steps?: { label: string; done: boolean; notes?: string }[];
  } }>) => {
    const b = request.body;
    const defaultSteps = [
      { label: 'Backup database (mysqldump)', done: false },
      { label: 'Update DNS records (A record → EC2 IP)', done: false },
      { label: 'Set file permissions (www-data, 755)', done: false },
      { label: 'Configure Apache vhost + WebSocket proxy', done: false },
      { label: 'Enable Apache modules (rewrite, proxy_wstunnel, headers)', done: false },
      { label: 'Deploy project files to /var/www/html/', done: false },
      { label: 'Install node dependencies + PM2 start', done: false },
      { label: 'Setup SSL with Certbot', done: false },
      { label: 'Update config.xml / app version codes', done: false },
      { label: 'Switch all URLs from test to production', done: false },
      { label: 'Run apache2ctl configtest', done: false },
      { label: 'Setup cron jobs (Laravel scheduler, backups)', done: false },
      { label: 'Test all endpoints + WebSocket connections', done: false },
      { label: 'Build release APK/AAB and sign', done: false },
      { label: 'Submit to Play Store', done: false },
    ];
    const [row] = await app.db.insert(deployChecklists).values({
      clientName: b.clientName,
      projectType: b.projectType || 'bullion',
      steps: b.steps || defaultSteps,
    }).returning();
    return { data: row };
  });

  // Update checklist (toggle steps, change status)
  app.put('/devops-docs/checklists/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    const b = request.body as any;
    const [row] = await app.db.update(deployChecklists).set({
      ...b, updatedAt: new Date(),
    }).where(eq(deployChecklists.id, id)).returning();
    if (!row) return reply.code(404).send({ error: 'Not found' });
    return { data: row };
  });

  // Delete checklist
  app.delete('/devops-docs/checklists/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const id = parseInt(request.params.id);
    if (isNaN(id)) return reply.code(400).send({ error: 'Invalid ID' });
    await app.db.delete(deployChecklists).where(eq(deployChecklists.id, id));
    return { success: true };
  });

  // ─── Global Search (Item 9) ──────────────────────────────────────────
  app.get('/devops-docs/search', async (request: FastifyRequest<{ Querystring: { q: string } }>) => {
    const { q } = request.query;
    if (!q || q.length < 2) return { data: { static: [], custom: [] } };
    const query = q.toLowerCase();

    // Search static docs
    const staticResults = DOCS.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.tool.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.commands.some(c => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)) ||
      d.configSnippets?.some(s => s.title.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)) ||
      d.tips?.some(t => t.toLowerCase().includes(query))
    ).map(d => ({
      id: d.id, type: 'static' as const, tool: d.tool, title: d.title,
      description: d.description, category: d.category, color: d.color,
    }));

    // Search custom docs
    const customRows = await app.db.select().from(customDocs).where(eq(customDocs.isActive, true));
    const customResults = customRows.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.tool.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query)
    ).map(d => ({
      id: `custom-${d.id}`, type: 'custom' as const, tool: d.tool, title: d.title,
      description: d.description, category: d.category, color: d.color,
    }));

    return { data: { static: staticResults, custom: customResults, total: staticResults.length + customResults.length } };
  });
}
