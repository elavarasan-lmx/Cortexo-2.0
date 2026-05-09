'use client';
import React from 'react';

// ─── Shared Styles ──────────────────────────────────────────────────────────

export const inp: React.CSSProperties = { width:'100%',padding:'10px 14px',borderRadius:'10px',boxSizing:'border-box',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface-hover))',color:'rgb(var(--text-primary))',fontSize:'13px',outline:'none',fontFamily:"'JetBrains Mono',monospace",transition:'border-color 200ms' };
export const lbl: React.CSSProperties = { display:'block',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px',color:'rgb(var(--text-muted))' };
export const ta: React.CSSProperties = { ...inp,minHeight:'70px',resize:'vertical' as const };
export const g2: React.CSSProperties = { display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' };
export const g3: React.CSSProperties = { display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px' };

// ─── Step Definitions ───────────────────────────────────────────────────────

import { Rocket, Globe, FolderKey, Database, Cpu, Shield } from 'lucide-react';

export const STEPS = [
  { id:'project', num:1, title:'Project & Server',   desc:'Select project and target server',      icon:Rocket, color:'#818CF8' },
  { id:'nginx',   num:2, title:'Nginx Configuration', desc:'Domain, SSL, and proxy settings',       icon:Globe,  color:'#3B82F6' },
  { id:'perms',   num:3, title:'Folder Permissions',  desc:'Ownership and file access control',     icon:FolderKey,color:'#10B981' },
  { id:'db',      num:4, title:'Database',            desc:'DB config, migrations, SQL import',    icon:Database,color:'#EC4899' },
  { id:'pm2',     num:5, title:'PM2 / Services',      desc:'Process manager and service config',    icon:Cpu,    color:'#8B5CF6' },
  { id:'hooks',   num:6, title:'Review & Deploy',   desc:'Review all settings and launch',        icon:Shield, color:'#EF4444' },
] as const;

// ─── Shared Types ───────────────────────────────────────────────────────────

export type FolderEntry = { path:string; perm:string; owner:string; group:string };

export interface DeployFormInitialData {
  projectId?: string;
  branch?: string;
  environment?: string;
  serverId?: number;
  remotePath?: string;
  nginxDomain?: string; nginxPort?: string; nginxRoot?: string; phpVer?: string;
  socketPort?: string; rateSocketPort?: string; wsPort?: string;
  sslCert?: string; sslKey?: string; nginxAutoGen?: boolean;

  permUser?: string; permGroup?: string; permFile?: string; permDir?: string;
  permWritable?: string; permRecursive?: boolean;
  folders?: { path: string; perm: string; owner: string; group: string }[];
  dbHost?: string; dbPort?: string; dbName?: string; dbUser?: string; dbPass?: string;
  dbMigrate?: boolean; dbMigrateCmd?: string; dbImportSql?: boolean; dbSqlPath?: string;
  pm2Name?: string; pm2Script?: string; pm2Interpreter?: string; pm2Instances?: string;
  pm2Restart?: boolean; pm2Args?: string;
  preDeployCmd?: string; postDeployCmd?: string;
  healthCheckUrl?: string; notifyOnComplete?: boolean;
}

// ─── Shared Components ──────────────────────────────────────────────────────

export const Toggle = ({ checked,onChange,label }:{ checked:boolean;onChange:(v:boolean)=>void;label:string }) => (
  <label style={{ display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',fontSize:'12px',color:'rgb(var(--text-secondary))' }}>
    <div onClick={()=>onChange(!checked)} style={{ width:'38px',height:'20px',borderRadius:'10px',position:'relative',cursor:'pointer',backgroundColor:checked?'rgb(var(--primary))':'rgb(var(--border))',transition:'all 200ms' }}>
      <div style={{ width:'16px',height:'16px',borderRadius:'50%',backgroundColor:'#fff',position:'absolute',top:'2px',left:checked?'20px':'2px',transition:'left 200ms',boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </div>
    {label}
  </label>
);

/** Convert octal permission string to rwx format, e.g. "755" → "rwxr-xr-x" */
export function octalToRwx(octal:string):string {
  const map=['---','--x','-w-','-wx','r--','r-x','rw-','rwx'];
  const d=octal.split('').map(Number);
  if(d.length!==3||d.some(isNaN))return '---------';
  return d.map(n=>map[n]||'---').join('');
}
