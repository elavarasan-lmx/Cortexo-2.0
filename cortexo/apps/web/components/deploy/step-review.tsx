'use client';
import React from 'react';
import type { FolderEntry } from './shared';

interface ReviewStepProps {
  // Project & Server
  selectedProject: string;
  projects: { id: string; name: string }[];
  branch: string;
  environment: string;
  serverId: number;
  serverList: { id: number; name: string }[];
  remotePath: string;
  healthCheckUrl: string;
  // Nginx
  nginxDomain: string;
  nginxPort: string;
  nginxRoot: string;
  phpVer: string;
  socketPort: string;
  rateSocketPort: string;
  wsPort: string;
  sslCert: string;
  // Database
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbMigrate: boolean;
  dbMigrateCmd: string;
  // Source DB
  sourceDbInfo: {name:string;host:string;port:string;databaseName:string;username:string}|null;
  // PM2 — auto-generated from slug
  pm2Restart: boolean;
  // Permissions
  permUser: string;
  permGroup: string;
  permFile: string;
  permDir: string;
  folders: FolderEntry[];
  permWritable: string;
}

const preStyle: React.CSSProperties = {margin:0,padding:'10px 12px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.2)',fontSize:'10px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-muted))',whiteSpace:'pre-wrap',lineHeight:1.6,maxHeight:'200px',overflow:'auto'};
const sectionLbl = (color:string): React.CSSProperties => ({fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color,margin:'0 0 6px',display:'flex',alignItems:'center',gap:'6px'});

export default function StepReview(props: ReviewStepProps) {
  const {
    selectedProject, projects, branch, environment, serverId, serverList,
    remotePath, healthCheckUrl, nginxDomain, nginxPort, nginxRoot,
    socketPort, rateSocketPort, wsPort, sslCert, dbHost, dbPort, dbName, dbUser,
    sourceDbInfo, pm2Restart,
    permUser, permGroup, permFile, permDir, folders, permWritable,
  } = props;

  const slug = (remotePath || '').split('/').pop() || '<slug>';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
      {/* Project & Server */}
      <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(129,140,248,0.06)',border:'1px solid rgba(129,140,248,0.15)'}}>
        <p style={sectionLbl('#818CF8')}>Project & Server</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',fontSize:'12px',color:'rgb(var(--text-secondary))'}}>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Project:</span> {projects.find((p)=>p.id===selectedProject)?.name||'—'}</div>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Branch:</span> <span style={{color:'#10B981',fontWeight:600}}>{branch}</span></div>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Server:</span> {serverList.find((s)=>s.id===serverId)?.name||'—'}</div>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Environment:</span> <span style={{color:environment==='production'?'#EF4444':environment==='staging'?'#F59E0B':'#3B82F6',fontWeight:600}}>{environment}</span></div>
          <div style={{gridColumn:'1/-1'}}><span style={{color:'rgb(var(--text-muted))'}}>Path:</span> <code style={{fontSize:'11px',backgroundColor:'rgba(var(--border),0.3)',padding:'2px 6px',borderRadius:'4px'}}>{remotePath||'—'}</code></div>
          {healthCheckUrl&&<div style={{gridColumn:'1/-1'}}><span style={{color:'rgb(var(--text-muted))'}}>Health:</span> {healthCheckUrl}</div>}
        </div>
      </div>


      {/* Nginx Config Preview */}
      {nginxDomain&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)'}}>
          <p style={sectionLbl('#3B82F6')}>⚡ Nginx Config <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none' as const,letterSpacing:0}}>— auto-generated on deploy</span></p>
          <pre style={{...preStyle,border:'1px solid rgba(59,130,246,0.12)'}}>
{`server {
    listen ${nginxPort || '80'};
    server_name ${nginxDomain};
    root ${nginxRoot || '<root>'};
    index index.php index.html;
${socketPort ? `
    location /socket.io/ {
        proxy_pass http://localhost:${socketPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
` : ''}${rateSocketPort ? `
    location /ratesocket/ {
        proxy_pass http://localhost:${rateSocketPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
` : ''}${wsPort ? `
    location /ws {
        proxy_pass http://127.0.0.1:${wsPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
` : ''}
    location /admin/ { try_files $uri $uri/ /admin/index.php?$query_string; }
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location /mobileapi/ { try_files $uri $uri/ /mobileapi/index.php?$query_string; }
    location /lmxtrade/winbullliteapi/ { try_files $uri $uri/ /lmxtrade/winbullliteapi/index.php?$query_string; }
    location ~ /\\.ht { deny all; }
${sslCert ? `
    ssl_certificate ${sslCert};` : ''}
}`}
          </pre>
        </div>
      )}

      {/* Database Setup Preview */}
      {dbName&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(236,72,153,0.04)',border:'1px solid rgba(236,72,153,0.12)'}}>
          <p style={sectionLbl('#EC4899')}>⚡ Database Setup <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none' as const,letterSpacing:0}}>— 3-phase pipeline</span></p>
          <pre style={{...preStyle,border:'1px solid rgba(236,72,153,0.12)'}}>
{`-- Phase 1: Create Client Database
CREATE DATABASE IF NOT EXISTS \`${dbName}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Phase 2: Clone from Source DB
-- mysqldump -h ${sourceDbInfo?.host || '<source_host>'} -u ${sourceDbInfo?.username || '<source_user>'} ${sourceDbInfo?.databaseName || '<source_db>'} | mysql -h ${dbHost || '<client_host>'} -u ${dbUser || '<client_user>'} ${dbName}

-- Phase 3: Truncate & Configure
USE ${dbName};
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE ci_usersessions;
TRUNCATE ci_sessions;
TRUNCATE dt_admin_log;
TRUNCATE dt_booking;
TRUNCATE dt_transaction;
TRUNCATE dt_customer;
-- ... (full cleanup)
SET FOREIGN_KEY_CHECKS = 1;`}
          </pre>
        </div>
      )}

      {/* Log Cleanup Preview */}
      {remotePath&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(245,158,11,0.04)',border:'1px solid rgba(245,158,11,0.12)'}}>
          <p style={sectionLbl('#F59E0B')}>⚡ Log Cleanup <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none' as const,letterSpacing:0}}>— auto-executed on every deploy</span></p>
          <pre style={{...preStyle,border:'1px solid rgba(245,158,11,0.12)'}}>
{`> ${remotePath}/lmxtrade/winbullliteapi/storage/logs/lumen.log
find ${remotePath}/application/logs -name 'log-*.php' -exec truncate -s 0 {} +
find ${remotePath}/admin/application/logs -name 'log-*.php' -exec truncate -s 0 {} +
rm -rf ${remotePath}/lmxtrade/winbullliteapi/storage/framework/{cache,sessions,views}/*
pm2 flush ${slug}-ws
pm2 flush ${slug}-socketio`}
          </pre>
        </div>
      )}

      {/* PM2 Processes Preview */}
      {remotePath&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(139,92,246,0.04)',border:'1px solid rgba(139,92,246,0.12)'}}>
          <p style={sectionLbl('#8B5CF6')}>⚡ PM2 Processes <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none' as const,letterSpacing:0}}>— auto-restart on deploy</span></p>
          <pre style={{...preStyle,border:'1px solid rgba(139,92,246,0.12)'}}>
{`pm2 start ${remotePath}/client/${slug}-ws.js --name "${slug}-ws"
pm2 start ${remotePath}/lmxtrade/${slug}winlitesocket.js --name "${slug}-socketio"
pm2 save`}
          </pre>
        </div>
      )}

      {/* Permissions */}
      {(folders.length>0||permWritable)&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(16,185,129,0.04)',border:'1px solid rgba(16,185,129,0.12)'}}>
          <p style={sectionLbl('#10B981')}>Permissions</p>
          <div style={{fontSize:'12px',color:'rgb(var(--text-secondary))'}}>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Owner:</span> {permUser}:{permGroup} | Files: {permFile} | Dirs: {permDir}</div>
            {folders.length>0&&<div style={{marginTop:'4px'}}><span style={{color:'rgb(var(--text-muted))'}}>Folders:</span> {folders.length} to create</div>}
          </div>
        </div>
      )}
    </div>
  );
}
