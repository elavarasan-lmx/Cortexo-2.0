'use client';
import React from 'react';
import type { CronEntry, FolderEntry } from './shared';

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
  wsPort: string;
  sslCert: string;
  // Cron
  crons: CronEntry[];
  // Database
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbMigrate: boolean;
  dbMigrateCmd: string;
  // PM2
  pm2Name: string;
  pm2Interpreter: string;
  pm2Instances: string;
  pm2Restart: boolean;
  // Permissions
  permUser: string;
  permGroup: string;
  permFile: string;
  permDir: string;
  folders: FolderEntry[];
  permWritable: string;
}

export default function StepReview(props: ReviewStepProps) {
  const {
    selectedProject, projects, branch, environment, serverId, serverList,
    remotePath, healthCheckUrl, nginxDomain, nginxPort, nginxRoot, phpVer,
    socketPort, wsPort, sslCert, crons, dbHost, dbPort, dbName, dbUser,
    dbMigrate, dbMigrateCmd, pm2Name, pm2Interpreter, pm2Instances, pm2Restart,
    permUser, permGroup, permFile, permDir, folders, permWritable,
  } = props;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
      {/* Project & Server */}
      <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(129,140,248,0.06)',border:'1px solid rgba(129,140,248,0.15)'}}>
        <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#818CF8',margin:'0 0 8px'}}>Project & Server</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',fontSize:'12px',color:'rgb(var(--text-secondary))'}}>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Project:</span> {projects.find((p)=>p.id===selectedProject)?.name||'—'}</div>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Branch:</span> <span style={{color:'#10B981',fontWeight:600}}>{branch}</span></div>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Server:</span> {serverList.find((s)=>s.id===serverId)?.name||'—'}</div>
          <div><span style={{color:'rgb(var(--text-muted))'}}>Environment:</span> <span style={{color:environment==='production'?'#EF4444':environment==='staging'?'#F59E0B':'#3B82F6',fontWeight:600}}>{environment}</span></div>
          <div style={{gridColumn:'1/-1'}}><span style={{color:'rgb(var(--text-muted))'}}>Remote Path:</span> <code style={{fontSize:'11px',backgroundColor:'rgba(var(--border),0.3)',padding:'2px 6px',borderRadius:'4px'}}>{remotePath||'—'}</code></div>
          {healthCheckUrl&&<div style={{gridColumn:'1/-1'}}><span style={{color:'rgb(var(--text-muted))'}}>Health Check:</span> {healthCheckUrl}</div>}
        </div>
      </div>

      {/* Nginx */}
      {nginxDomain&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)'}}>
          <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#3B82F6',margin:'0 0 8px'}}>Nginx</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',fontSize:'12px',color:'rgb(var(--text-secondary))'}}>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Domain:</span> {nginxDomain}</div>
            <div><span style={{color:'rgb(var(--text-muted))'}}>PHP:</span> {phpVer}</div>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Root:</span> {nginxRoot||'—'}</div>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Port:</span> {nginxPort}</div>
            {socketPort&&<div><span style={{color:'rgb(var(--text-muted))'}}>Socket:</span> :{socketPort}</div>}
            {wsPort&&<div><span style={{color:'rgb(var(--text-muted))'}}>WS:</span> :{wsPort}</div>}
            {sslCert&&<div style={{gridColumn:'1/-1'}}><span style={{color:'rgb(var(--text-muted))'}}>SSL:</span> ✓ Configured</div>}
          </div>
        </div>
      )}

      {/* Cron */}
      {crons.length>0&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)'}}>
          <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#F59E0B',margin:'0 0 8px'}}>Cron Jobs ({crons.length})</p>
          <div style={{display:'flex',flexDirection:'column',gap:'4px',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-secondary))'}}>
            {crons.map((c,i)=><div key={i}><span style={{color:'#F59E0B'}}>{c.schedule}</span> → {c.command}</div>)}
          </div>
        </div>
      )}

      {/* Database */}
      {dbHost&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(236,72,153,0.06)',border:'1px solid rgba(236,72,153,0.15)'}}>
          <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#EC4899',margin:'0 0 8px'}}>Database</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',fontSize:'12px',color:'rgb(var(--text-secondary))'}}>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Host:</span> {dbHost}:{dbPort}</div>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Database:</span> {dbName||'—'}</div>
            <div><span style={{color:'rgb(var(--text-muted))'}}>User:</span> {dbUser||'—'}</div>
            {dbMigrate&&<div><span style={{color:'rgb(var(--text-muted))'}}>Migrate:</span> ✓ {dbMigrateCmd}</div>}
          </div>
        </div>
      )}

      {/* PM2 */}
      {pm2Name&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)'}}>
          <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#8B5CF6',margin:'0 0 8px'}}>PM2 Service</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',fontSize:'12px',color:'rgb(var(--text-secondary))'}}>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Name:</span> {pm2Name}</div>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Interpreter:</span> {pm2Interpreter}</div>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Instances:</span> {pm2Instances}</div>
            {pm2Restart&&<div><span style={{color:'rgb(var(--text-muted))'}}>Auto-restart:</span> ✓</div>}
          </div>
        </div>
      )}

      {/* Permissions */}
      {(folders.length>0||permWritable)&&(
        <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)'}}>
          <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#10B981',margin:'0 0 8px'}}>Permissions</p>
          <div style={{fontSize:'12px',color:'rgb(var(--text-secondary))'}}>
            <div><span style={{color:'rgb(var(--text-muted))'}}>Owner:</span> {permUser}:{permGroup} | Files: {permFile} | Dirs: {permDir}</div>
            {folders.length>0&&<div style={{marginTop:'4px'}}><span style={{color:'rgb(var(--text-muted))'}}>Folders:</span> {folders.length} to create</div>}
          </div>
        </div>
      )}

      {/* Nothing configured warning */}
      {!nginxDomain&&crons.length===0&&!dbHost&&!pm2Name&&folders.length===0&&(
        <div style={{padding:'20px',textAlign:'center',borderRadius:'12px',border:'1px dashed rgb(var(--border))',color:'rgb(var(--text-muted))',fontSize:'13px'}}>
          Only project, server, and git pull configured. Other steps are optional.
        </div>
      )}
    </div>
  );
}
