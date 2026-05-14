// ─── DevOps Documentation Reference Data ────────────────────────────────────
// Curated quick-reference docs for common DevOps tools.
// Extracted from devops-docs.ts for better HMR and code splitting.

export interface DocEntry {
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

export const DOCS: DocEntry[] = [
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

  // ─── Flutter iOS App Publishing (Internal Runbook) ────────────────────
  {
    id: 'flutter-ios-publish',
    tool: 'Flutter',
    icon: 'flutter',
    color: '#027DFD',
    category: 'Mobile App',
    title: 'iOS App Publishing (Flutter) — New App',
    description: 'Complete end-to-end guide for publishing a brand new Flutter iOS app — Apple Developer enrollment, certificates, provisioning profiles, Xcode config, build, App Store Connect submission, TestFlight, and review.',
    commands: [
      { cmd: 'flutter doctor -v', desc: 'Verify Flutter + Xcode + CocoaPods setup' },
      { cmd: 'flutter clean', desc: 'Clean build artifacts (always do before release)' },
      { cmd: 'flutter pub get', desc: 'Install/update all Dart dependencies' },
      { cmd: 'cd ios && pod install --repo-update', desc: 'Install/update CocoaPods dependencies' },
      { cmd: 'cd ios && pod deintegrate && pod install', desc: 'Full CocoaPods reinstall (when stuck)' },
      { cmd: 'flutter build ios --release', desc: 'Build release IPA (requires signing)' },
      { cmd: 'flutter build ipa --release', desc: 'Build IPA + generate App Store archive' },
      { cmd: 'flutter build ipa --release --export-method=app-store', desc: 'Build IPA for App Store distribution' },
      { cmd: 'flutter build ipa --release --obfuscate --split-debug-info=build/symbols', desc: 'Build with code obfuscation (recommended)' },
      { cmd: 'open ios/Runner.xcworkspace', desc: 'Open Xcode workspace (NOT .xcodeproj!)' },
      { cmd: 'xcrun altool --upload-app -f build/ios/ipa/*.ipa -t ios -u "email" -p "app-specific-password"', desc: 'Upload IPA via command line (legacy)' },
      { cmd: 'xcrun notarytool submit build/ios/ipa/*.ipa --apple-id "email" --team-id "TEAM_ID"', desc: 'Submit for notarization (Xcode 14+)' },
      { cmd: 'open build/ios/archive/Runner.xcarchive', desc: 'Open archive in Xcode Organizer' },
      { cmd: 'security find-identity -v -p codesigning', desc: 'List available signing certificates' },
      { cmd: 'flutter devices', desc: 'List connected devices (check iOS device)' },
      { cmd: 'flutter run --release -d <device_id>', desc: 'Test release build on physical device' },
    ],
    configSnippets: [
      {
        title: 'Step 1: Apple Developer Account Setup',
        lang: 'text',
        code: `═══════════════════════════════════════════════════════════════════
  APPLE DEVELOPER PROGRAM ENROLLMENT (One-Time Setup)
═══════════════════════════════════════════════════════════════════

1. GO TO: https://developer.apple.com/programs/
2. Click "Enroll" → Sign in with Apple ID
3. Choose account type:
   - Individual ($99/year) → Personal apps
   - Organization ($99/year) → Company apps (needs D-U-N-S number)

4. For ORGANIZATION enrollment:
   - Need D-U-N-S Number (free from Dun & Bradstreet)
   - Apply at: https://developer.apple.com/enroll/duns-lookup/
   - Takes 5-7 business days to process
   - Need legal entity name, address, phone number

5. After enrollment approved (24-48 hours):
   - Access Apple Developer Portal: https://developer.apple.com/account
   - Access App Store Connect: https://appstoreconnect.apple.com
   - Note your TEAM ID (shown in Membership tab)

IMPORTANT: You MUST have a Mac with Xcode to build iOS apps.
           There is NO way around this requirement.`,
      },
      {
        title: 'Step 2: Create App ID (Bundle Identifier)',
        lang: 'text',
        code: `═══════════════════════════════════════════════════════════════════
  REGISTER APP ID IN APPLE DEVELOPER PORTAL
═══════════════════════════════════════════════════════════════════

1. Go to: https://developer.apple.com/account/resources/identifiers/list

2. Click "+" → Select "App IDs" → Continue

3. Select type: "App" → Continue

4. Fill in:
   - Description: "My App Name"
   - Bundle ID: Choose "Explicit"
   - Bundle ID value: com.companyname.appname
     Example: com.winbull.trustbullion

5. Enable Capabilities (check what your app needs):
   ☐ Push Notifications (for Firebase/OneSignal)
   ☐ Associated Domains (for deep links)
   ☐ Sign In with Apple (if using Apple login)
   ☐ Background Modes (for background tasks)
   ☐ Access WiFi Information
   ☐ App Groups (for widget/extensions)

6. Click "Continue" → "Register"

IMPORTANT: Bundle ID must EXACTLY match what's in:
  - ios/Runner.xcodeproj → PRODUCT_BUNDLE_IDENTIFIER
  - Flutter pubspec.yaml won't have this — it's Xcode-only`,
      },
      {
        title: 'Step 3: Create Certificates & Provisioning Profiles',
        lang: 'text',
        code: `═══════════════════════════════════════════════════════════════════
  CERTIFICATES (Signing Identity)
═══════════════════════════════════════════════════════════════════

--- Option A: Automatic Signing (RECOMMENDED for beginners) ---

1. Open Xcode → Runner.xcworkspace
2. Select Runner target → Signing & Capabilities tab
3. Check "Automatically manage signing"
4. Select your Team from dropdown
5. Xcode will auto-create certificates + profiles
   ✅ Done! Skip to Step 4.

--- Option B: Manual Signing (for CI/CD or team setups) ---

1. CREATE CERTIFICATE SIGNING REQUEST (CSR):
   - Open "Keychain Access" on Mac
   - Menu: Keychain Access → Certificate Assistant →
     "Request a Certificate From a Certificate Authority"
   - Email: Your Apple ID email
   - Common Name: Your name or company
   - CA Email: Leave blank
   - Request is: "Saved to disk"
   - Save the .certSigningRequest file

2. CREATE DISTRIBUTION CERTIFICATE:
   - Go to: https://developer.apple.com/account/resources/certificates/list
   - Click "+" → Select "Apple Distribution" → Continue
   - Upload the CSR file from step 1
   - Download the .cer file
   - Double-click .cer to install in Keychain Access

3. CREATE PROVISIONING PROFILE:
   - Go to: https://developer.apple.com/account/resources/profiles/list
   - Click "+" → Select "App Store Connect" (under Distribution)
   - Select your App ID (from Step 2)
   - Select your Distribution Certificate
   - Name it: "AppName App Store Profile"
   - Download and double-click to install

═══════════════════════════════════════════════════════════════════
  PUSH NOTIFICATION CERTIFICATE (If app uses notifications)
═══════════════════════════════════════════════════════════════════

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click "+" → Select "Apple Push Notification service SSL"
3. Choose your App ID
4. Upload CSR → Download .cer → Install in Keychain
5. Export as .p12 from Keychain (for Firebase/OneSignal)`,
      },
      {
        title: 'Step 4: Configure Flutter iOS Project (Xcode)',
        lang: 'bash',
        code: `# ═══════════════════════════════════════════════════════════
# XCODE PROJECT CONFIGURATION
# ═══════════════════════════════════════════════════════════

# 1. Open the project in Xcode (ALWAYS use .xcworkspace!)
open ios/Runner.xcworkspace

# In Xcode, select "Runner" in the left sidebar, then:

# ── General Tab ──────────────────────────────────────────
# Display Name:        Your App Name (shown under icon)
# Bundle Identifier:   com.companyname.appname (must match App ID)
# Version:             1.0.0 (user-facing version)
# Build:               1 (increment each upload to App Store Connect)
# Deployment Target:   iOS 13.0 or higher (check your min requirement)

# ── Signing & Capabilities Tab ───────────────────────────
# Team:                Select your Apple Developer team
# Bundle Identifier:   com.companyname.appname
# Provisioning Profile: Automatic or select manually
# Signing Certificate: Apple Distribution

# ── Build Settings Tab ───────────────────────────────────
# Search "PRODUCT_BUNDLE_IDENTIFIER"
# Ensure it matches across Debug, Release, Profile schemes
# Search "DEVELOPMENT_TEAM" → Set your Team ID

# ── Info.plist (Required Privacy Descriptions) ───────────
# Add these in ios/Runner/Info.plist for permissions:
# NSCameraUsageDescription         → "App needs camera for..."
# NSPhotoLibraryUsageDescription   → "App needs photos for..."
# NSLocationWhenInUseUsageDescription → "App needs location..."
# NSMicrophoneUsageDescription     → "App needs microphone..."`,
      },
      {
        title: 'Step 4b: Info.plist Configuration',
        lang: 'xml',
        code: `<?xml version="1.0" encoding="UTF-8"?>
<!-- File: ios/Runner/Info.plist -->
<!-- Add these keys INSIDE the existing <dict> block -->

<!-- App Transport Security (if using HTTP APIs) -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <!-- OR for specific domains only (recommended): -->
    <key>NSExceptionDomains</key>
    <dict>
        <key>yourdomain.com</key>
        <dict>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>

<!-- Camera -->
<key>NSCameraUsageDescription</key>
<string>This app requires camera access to capture photos</string>

<!-- Photo Library -->
<key>NSPhotoLibraryUsageDescription</key>
<string>This app requires photo library access to select images</string>

<!-- Location -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app requires location access for nearby services</string>

<!-- Notifications (if using push notifications) -->
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>

<!-- App Display Name -->
<key>CFBundleDisplayName</key>
<string>Your App Name</string>

<!-- Supported Orientations -->
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
</array>`,
      },
      {
        title: 'Step 5: Build & Archive',
        lang: 'bash',
        code: `# ═══════════════════════════════════════════════════════════
# BUILD FLUTTER IPA FOR APP STORE
# ═══════════════════════════════════════════════════════════

# 1. CLEAN EVERYTHING (always start fresh for release)
flutter clean
flutter pub get
cd ios && pod install --repo-update && cd ..

# 2. BUILD IPA (generates App Store ready archive)
flutter build ipa --release \\
  --export-method=app-store \\
  --obfuscate \\
  --split-debug-info=build/symbols

# Output: build/ios/ipa/YourApp.ipa
# Archive: build/ios/archive/Runner.xcarchive

# ─── OR: Build via Xcode (Manual Method) ─────────────────
# 1. Open Xcode: open ios/Runner.xcworkspace
# 2. Select "Any iOS Device (arm64)" as build target
# 3. Menu: Product → Scheme → Release
# 4. Menu: Product → Archive
# 5. Xcode Organizer opens → Click "Distribute App"
# 6. Select "App Store Connect" → Upload

# ─── Upload IPA via Transporter App ──────────────────────
# 1. Download "Transporter" from Mac App Store (free Apple app)
# 2. Sign in with your Apple ID
# 3. Drag & drop the .ipa file
# 4. Click "Deliver"
# This is the EASIEST way to upload!

# ─── OR: Upload via xcrun (Command Line) ─────────────────
xcrun altool --upload-app \\
  -f build/ios/ipa/YourApp.ipa \\
  -t ios \\
  -u "your@email.com" \\
  -p "xxxx-xxxx-xxxx-xxxx"  # App-specific password from appleid.apple.com

# Generate app-specific password:
# 1. Go to: https://appleid.apple.com/account/manage
# 2. Security → App-Specific Passwords → Generate
# 3. Label it "Transporter" or "xcrun"
# 4. Copy the generated password`,
      },
      {
        title: 'Step 6: App Store Connect — Create App Listing',
        lang: 'text',
        code: `═══════════════════════════════════════════════════════════════════
  APP STORE CONNECT SETUP
═══════════════════════════════════════════════════════════════════

1. Go to: https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"

3. Fill in New App form:
   - Platform: iOS
   - Name: Your App Name (unique on App Store, 30 char max)
   - Primary Language: English (or your language)
   - Bundle ID: Select from dropdown (created in Step 2)
   - SKU: Unique identifier (e.g., com.company.app.2024)
   - User Access: Full Access (or Limited)

4. APP INFORMATION TAB:
   - Subtitle (optional, 30 chars)
   - Category: Choose primary + secondary
   - Content Rights: "Does not contain third-party content"
   - Age Rating: Fill the questionnaire

5. PRICING AND AVAILABILITY:
   - Price: Free (or select price tier)
   - Availability: Select countries

6. APP PRIVACY:
   - Privacy Policy URL (REQUIRED — host on your website)
   - Data collection practices (answer the questionnaire)

═══════════════════════════════════════════════════════════════════
  PREPARE FOR SUBMISSION (Version page)
═══════════════════════════════════════════════════════════════════

SCREENSHOTS (REQUIRED — these specific sizes):
┌─────────────────────────┬──────────────┬─────────────┐
│ Device                  │ Size (px)    │ Required?   │
├─────────────────────────┼──────────────┼─────────────┤
│ iPhone 6.7" (15 Pro Max)│ 1290 × 2796  │ YES         │
│ iPhone 6.5" (11 Pro Max)│ 1284 × 2778  │ YES         │
│ iPhone 5.5" (8 Plus)    │ 1242 × 2208  │ YES         │
│ iPad Pro 12.9" (6th)    │ 2048 × 2732  │ If iPad app │
│ iPad Pro 12.9" (2nd)    │ 2048 × 2732  │ If iPad app │
└─────────────────────────┴──────────────┴─────────────┘

Provide 3-10 screenshots per device size.
TIP: Use tools like "Screenshots Pro" or Figma templates.

OTHER REQUIRED FIELDS:
- Promotional Text (optional, 170 chars, can change anytime)
- Description (up to 4000 chars, changed only on new version)
- Keywords (100 chars, comma-separated for ASO)
- Support URL (your website/support page)
- Marketing URL (optional)
- App Icon: 1024x1024px PNG (no alpha/transparency!)
- Build: Select the uploaded build (appears after processing)`,
      },
      {
        title: 'Step 7: TestFlight & Submission',
        lang: 'text',
        code: `═══════════════════════════════════════════════════════════════════
  TESTFLIGHT (Beta Testing)
═══════════════════════════════════════════════════════════════════

1. After uploading IPA, wait 15-30 minutes for processing
2. Go to App Store Connect → TestFlight tab
3. The build appears → Click it
4. Fill "Export Compliance" → Select "No" if no encryption
   (or "Yes, uses standard encryption" for HTTPS)
5. Manage Compliance shows ✅

INTERNAL TESTING (up to 100 Apple Developer team members):
- Go to "Internal Testing" → Create group
- Add testers by Apple ID email
- Select the build → Start Testing
- Testers get TestFlight notification

EXTERNAL TESTING (up to 10,000 testers):
- Create "External Testing" group
- Add testers or share public link
- Requires BETA APP REVIEW (24-48 hours)
- Share link: Apps → TestFlight → Public Link

═══════════════════════════════════════════════════════════════════
  SUBMIT FOR APP REVIEW
═══════════════════════════════════════════════════════════════════

1. Go to "App Store" tab → Version page
2. Ensure ALL fields are filled:
   ✅ Screenshots (all required sizes)
   ✅ Description, Keywords, Support URL
   ✅ App Icon (1024x1024)
   ✅ Privacy Policy URL
   ✅ Age Rating completed
   ✅ Build selected
   ✅ Pricing set
   ✅ App Privacy questionnaire done

3. Review Contact Information:
   - Name, email, phone (Apple may call during review)

4. App Review Notes (IMPORTANT for first submission):
   - Provide test account if app requires login
   - Explain any non-obvious features
   - Note if using background location, etc.

5. Click "Submit for Review"

REVIEW TIMELINE:
- First submission: 24-48 hours (can take up to 7 days)
- Updates: Usually 24 hours
- Expedited review: https://developer.apple.com/contact/app-store/

AFTER APPROVAL:
- Choose release method: Manual or Automatic
- Manual: You click "Release This Version" when ready
- Automatic: Goes live immediately after approval`,
      },
      {
        title: 'Step 8: App Icon & Launch Screen Setup',
        lang: 'bash',
        code: `# ═══════════════════════════════════════════════════════════
# APP ICON SETUP
# ═══════════════════════════════════════════════════════════

# Option A: flutter_launcher_icons package (RECOMMENDED)
# 1. Add to pubspec.yaml:
#   dev_dependencies:
#     flutter_launcher_icons: "^0.14.2"
#
#   flutter_launcher_icons:
#     ios: true
#     image_path: "assets/icon/app_icon.png"
#     remove_alpha_ios: true   # IMPORTANT: iOS rejects icons with transparency!

# 2. Run:
flutter pub get
dart run flutter_launcher_icons

# Option B: Manual (via Xcode)
# 1. Open ios/Runner/Assets.xcassets/AppIcon.appiconset/
# 2. Replace all icon sizes manually
# 3. Or use: https://appicon.co to generate all sizes

# ═══════════════════════════════════════════════════════════
# LAUNCH SCREEN (Splash Screen)
# ═══════════════════════════════════════════════════════════

# The iOS launch screen is configured in:
# ios/Runner/Base.lproj/LaunchScreen.storyboard

# Option A: flutter_native_splash package
# 1. Add to pubspec.yaml:
#   dev_dependencies:
#     flutter_native_splash: "^2.4.3"
#
#   flutter_native_splash:
#     color: "#FFFFFF"
#     image: assets/splash/logo.png
#     ios: true

# 2. Run:
dart run flutter_native_splash:create

# Option B: Edit LaunchScreen.storyboard in Xcode
# 1. Open ios/Runner.xcworkspace
# 2. Find LaunchScreen.storyboard in Runner folder
# 3. Edit visually in Interface Builder`,
      },
      {
        title: 'Common Xcode Errors & Fixes',
        lang: 'bash',
        code: `# ═══════════════════════════════════════════════════════════
# TROUBLESHOOTING GUIDE
# ═══════════════════════════════════════════════════════════

# ERROR: "No signing certificate found"
# FIX: Xcode → Preferences → Accounts → Download Manual Profiles
#      Or enable "Automatically manage signing"

# ERROR: "Provisioning profile doesn't match bundle identifier"
# FIX: Ensure bundle ID in Xcode matches App ID on developer portal
open ios/Runner.xcworkspace
# Check: Runner → Signing & Capabilities → Bundle Identifier

# ERROR: "Module 'xxx' not found" (CocoaPods issue)
cd ios
pod deintegrate
pod cache clean --all
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
flutter clean
flutter build ios

# ERROR: "The iOS deployment target is set to X.X"
# FIX: Update Podfile minimum iOS version:
# platform :ios, '13.0'
# Then: cd ios && pod install

# ERROR: "arm64 architecture" (Apple Silicon M1/M2)
# FIX: Add to Podfile post_install:
# post_install do |installer|
#   installer.pods_project.targets.each do |target|
#     target.build_configurations.each do |config|
#       config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
#     end
#   end
# end

# ERROR: "App Store icon must not contain alpha channel"
# FIX: Remove transparency from 1024x1024 icon
# Use: convert icon.png -background white -flatten icon_no_alpha.png
# Or set remove_alpha_ios: true in flutter_launcher_icons

# ERROR: "ITMS-90717: Invalid App Store Icon"
# FIX: Icon must be exactly 1024x1024, PNG, no rounded corners,
#      no transparency, no layers

# ERROR: "Missing Compliance" in App Store Connect
# FIX: Go to TestFlight → Select build → Export Compliance
#      Most apps: "No" for custom encryption (HTTPS is standard)

# ERROR: "Binary Rejected — Guideline X.X"
# Check: https://developer.apple.com/app-store/review/guidelines/
# Common reasons:
#   - 2.1: App crashes or has bugs
#   - 2.3: Incomplete or placeholder content
#   - 4.0: Missing privacy purpose strings in Info.plist
#   - 5.1.1: Missing privacy policy
#   - 5.1.2: Data collection not declared correctly`,
      },
      {
        title: 'Podfile Configuration (Reference)',
        lang: 'ruby',
        code: `# File: ios/Podfile
platform :ios, '13.0'

# CocoaPods analytics
ENV['COCOAPODS_DISABLE_STATS'] = 'true'

project 'Runner', {
  'Debug' => :debug,
  'Profile' => :release,
  'Release' => :release,
}

def flutter_root
  generated_xcode_build_settings_path = File.expand_path(
    File.join('..', 'Flutter', 'Generated.xcconfig'), __FILE__
  )
  unless File.exist?(generated_xcode_build_settings_path)
    raise "Missing Generated.xcconfig"
  end
  File.foreach(generated_xcode_build_settings_path) do |line|
    matches = line.match(/FLUTTER_ROOT\\=(.*)/)
    return matches[1].strip if matches
  end
  raise "FLUTTER_ROOT not found"
end

require File.expand_path(
  File.join('packages', 'flutter_tools', 'bin', 'podhelper'),
  flutter_root
)

target 'Runner' do
  use_frameworks!
  use_modular_headers!

  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))

  # Add any extra pods here:
  # pod 'FirebaseMessaging'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
      # Fix Xcode 15+ issues:
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'PERMISSION_CAMERA=1',
        'PERMISSION_PHOTOS=1',
      ]
    end
  end
end`,
      },
      {
        title: 'Pre-Release Checklist',
        lang: 'text',
        code: `═══════════════════════════════════════════════════════════════════
  FLUTTER iOS RELEASE CHECKLIST
═══════════════════════════════════════════════════════════════════

PRE-BUILD:
  □ All API URLs switched to PRODUCTION (no staging/localhost)
  □ Debug logs and print statements removed or disabled
  □ App version updated in pubspec.yaml (version: X.Y.Z+buildNumber)
  □ Bundle ID matches Apple Developer App ID
  □ App icon ready (1024x1024, no transparency)
  □ Launch screen configured
  □ Info.plist has all required privacy strings
  □ Minimum iOS deployment target set (13.0+)
  □ Test on PHYSICAL iPhone (simulator ≠ real device)

BUILD:
  □ flutter clean
  □ flutter pub get
  □ cd ios && pod install --repo-update
  □ flutter build ipa --release
  □ Archive builds successfully with no errors

UPLOAD:
  □ IPA uploaded via Transporter or xcrun
  □ Build appears in App Store Connect (15-30 min wait)
  □ Export Compliance answered (TestFlight)
  □ Internal TestFlight test passed

APP STORE CONNECT:
  □ Screenshots uploaded (all required sizes)
  □ App description, keywords, and support URL filled
  □ Privacy Policy URL provided
  □ Age rating questionnaire completed
  □ App Privacy section filled
  □ Pricing and availability configured
  □ Build selected for submission
  □ Review notes + test credentials provided (if login required)
  □ Submit for Review

POST-APPROVAL:
  □ Release to App Store (manual or automatic)
  □ Verify app appears in App Store search
  □ Download and test from App Store
  □ Monitor Crash Reports in Xcode Organizer
  □ Announce release to team/client`,
      },
    ],
    tips: [
      'ALWAYS open .xcworkspace (NOT .xcodeproj) — CocoaPods dependencies are only in the workspace',
      'iOS apps REQUIRE a Mac with Xcode — there are no workarounds for this',
      'Increment the build number (pubspec.yaml version: 1.0.0+BUILD) for every App Store Connect upload',
      'App Store icon must be 1024x1024 PNG with NO transparency and NO rounded corners',
      'Generate app-specific passwords at appleid.apple.com for xcrun/Transporter uploads',
      'Use Transporter app (free on Mac App Store) for the easiest IPA upload experience',
      'First App Store review takes 24-48 hours; expedited review available at developer.apple.com/contact',
      'Always test on a physical iPhone before submitting — simulator does not catch all issues',
      'If CocoaPods errors persist: pod deintegrate, delete Pods folder, Podfile.lock, then pod install --repo-update',
      'Firebase/Push Notifications need APNs key (.p8) uploaded to Firebase Console → Project Settings → Cloud Messaging',
      'Privacy strings (NSCameraUsageDescription etc.) in Info.plist are MANDATORY — missing ones = instant rejection',
      'For HTTPS-only APIs, you can remove NSAppTransportSecurity from Info.plist entirely',
      'Keep your Distribution Certificate and Provisioning Profile backed up — losing them is painful',
      'Use flutter build ipa (not flutter build ios) for App Store archives — it generates the proper .ipa file',
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
