'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, X, Plus, Minus, CheckCircle, Server, Trash2, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { api } from '@/lib/api';
import { inp, lbl, ta, g2, g3, STEPS, Toggle, octalToRwx } from './deploy/shared';
import type { FolderEntry } from './deploy/shared';
import DeployTerminal from './deploy/deploy-terminal';
import StepReview from './deploy/step-review';
import { useModal } from './modal-provider';

// Shared styles, types, constants, and components are now in ./deploy/shared.tsx
// Re-export the interface for backward compatibility
export type { DeployFormInitialData } from './deploy/shared';



export default function DeployForm({ onClose,onSuccess,initialData }:{ onClose:()=>void;onSuccess:()=>void;initialData?:DeployFormInitialData }) {
  const [step,setStep] = useState(0);
  const [projects,setProjects] = useState<any[]>([]);
  const [serverList,setServerList] = useState<any[]>([]);
  const [selectedProject,setSelectedProject] = useState(initialData?.projectId || '');
  const [resolving,setResolving] = useState(false);
  const [deploying,setDeploying] = useState(false);
  const [error,setError] = useState('');
  const [resolved,setResolved] = useState<any>(null);

  /* ─── Live terminal state ─── */
  const [deployId,setDeployId] = useState<string|null>(null);
  const [deployLogs,setDeployLogs] = useState<{step:string;command?:string;stdout:string;stderr:string;exitCode:number|null;durationMs:number;timestamp:string}[]>([]);
  const [deployResult,setDeployResult] = useState<{success:boolean;status:string;totalDurationMs:number;error?:string;commitSha?:string}|null>(null);
  const [isRunning,setIsRunning] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const [sourceProfiles,setSourceProfiles] = useState<any[]>([]);
  const [dbProfiles,setDbProfiles] = useState<any[]>([]);

  const [branch,setBranch]=useState(initialData?.branch || 'main');
  const [environment,setEnvironment]=useState(initialData?.environment || 'production');
  const [serverId,setServerId]=useState(initialData?.serverId || 0);
  const [remotePath,setRemotePath]=useState(initialData?.remotePath || '');

  const [nginxDomain,setNginxDomain]=useState(initialData?.nginxDomain || '');
  const [nginxPort,setNginxPort]=useState(initialData?.nginxPort || '80');
  const [nginxRoot,setNginxRoot]=useState(initialData?.nginxRoot || '');
  const [phpVer,setPhpVer]=useState(initialData?.phpVer || '8.3');
  const [socketPort,setSocketPort]=useState(initialData?.socketPort || '');
  const [rateSocketPort,setRateSocketPort]=useState(initialData?.rateSocketPort || '');
  const [wsPort,setWsPort]=useState(initialData?.wsPort || '');
  const [sslCert,setSslCert]=useState(initialData?.sslCert || '');
  const [sslKey,setSslKey]=useState(initialData?.sslKey || '');
  const [enableAdmin,setEnableAdmin]=useState(true);
  const [enableMobileApi,setEnableMobileApi]=useState(true);
  const [enableLaravel,setEnableLaravel]=useState(true);
  const [laravelPath,setLaravelPath]=useState('lmxtrade/winbullliteapi');
  const [nginxExtra,setNginxExtra]=useState('');
  const [nginxAutoGen,setNginxAutoGen]=useState(initialData?.nginxAutoGen !== false);



  const [permUser,setPermUser]=useState(initialData?.permUser || 'ubuntu');
  const [permGroup,setPermGroup]=useState(initialData?.permGroup || 'ubuntu');
  const [permFile,setPermFile]=useState(initialData?.permFile || '644');
  const [permDir,setPermDir]=useState(initialData?.permDir || '755');
  const [permWritable,setPermWritable]=useState(initialData?.permWritable || '');
  const [permRecursive,setPermRecursive]=useState(initialData?.permRecursive !== false);
  const [folders,setFolders]=useState<FolderEntry[]>(initialData?.folders || []);

  const [dbHost,setDbHost]=useState(initialData?.dbHost || '');
  const [dbPort,setDbPort]=useState(initialData?.dbPort || '3306');
  const [dbName,setDbName]=useState(initialData?.dbName || '');
  const [dbUser,setDbUser]=useState(initialData?.dbUser || '');
  const [dbPass,setDbPass]=useState(initialData?.dbPass || '');
  const [dbMigrate,setDbMigrate]=useState(initialData?.dbMigrate || false);
  const [dbMigrateCmd,setDbMigrateCmd]=useState(initialData?.dbMigrateCmd || 'php index.php migrate');
  const [dbImportSql,setDbImportSql]=useState(initialData?.dbImportSql || false);
  const [dbSqlPath,setDbSqlPath]=useState(initialData?.dbSqlPath || '');

  const [pm2Name,setPm2Name]=useState(initialData?.pm2Name || '');
  const [pm2Script,setPm2Script]=useState(initialData?.pm2Script || '');
  const [pm2Interpreter,setPm2Interpreter]=useState(initialData?.pm2Interpreter || 'node');
  const [pm2Instances,setPm2Instances]=useState(initialData?.pm2Instances || '1');
  const [pm2Restart,setPm2Restart]=useState(initialData?.pm2Restart !== false);
  const [pm2Args,setPm2Args]=useState(initialData?.pm2Args || '');

  const [preDeployCmd,setPreDeployCmd]=useState(initialData?.preDeployCmd || '');
  const [postDeployCmd,setPostDeployCmd]=useState(initialData?.postDeployCmd || '');
  const [healthCheckUrl,setHealthCheckUrl]=useState(initialData?.healthCheckUrl || '');
  const [notifyOnComplete,setNotifyOnComplete]=useState(initialData?.notifyOnComplete || false);
  const [truncateLogs,setTruncateLogs]=useState(initialData?.truncateLogs || false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem('cortexo_deploy_form');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.step !== undefined) setStep(d.step);
        if (d.selectedProject !== undefined) setSelectedProject(d.selectedProject);
        if (d.branch !== undefined) setBranch(d.branch);
        if (d.environment !== undefined) setEnvironment(d.environment);
        if (d.serverId !== undefined) setServerId(d.serverId);
        if (d.remotePath !== undefined) setRemotePath(d.remotePath);
        if (d.nginxDomain !== undefined) setNginxDomain(d.nginxDomain);
        if (d.nginxPort !== undefined) setNginxPort(d.nginxPort);
        if (d.nginxRoot !== undefined) setNginxRoot(d.nginxRoot);
        if (d.phpVer !== undefined) setPhpVer(d.phpVer);
        if (d.socketPort !== undefined) setSocketPort(d.socketPort);
        if (d.rateSocketPort !== undefined) setRateSocketPort(d.rateSocketPort);
        if (d.wsPort !== undefined) setWsPort(d.wsPort);
        if (d.sslCert !== undefined) setSslCert(d.sslCert);
        if (d.sslKey !== undefined) setSslKey(d.sslKey);
        if (d.enableAdmin !== undefined) setEnableAdmin(d.enableAdmin);
        if (d.enableMobileApi !== undefined) setEnableMobileApi(d.enableMobileApi);
        if (d.enableLaravel !== undefined) setEnableLaravel(d.enableLaravel);
        if (d.laravelPath !== undefined) setLaravelPath(d.laravelPath);
        if (d.nginxExtra !== undefined) setNginxExtra(d.nginxExtra);
        if (d.nginxAutoGen !== undefined) setNginxAutoGen(d.nginxAutoGen);

        if (d.permUser !== undefined) setPermUser(d.permUser);
        if (d.permGroup !== undefined) setPermGroup(d.permGroup);
        if (d.permFile !== undefined) setPermFile(d.permFile);
        if (d.permDir !== undefined) setPermDir(d.permDir);
        if (d.permWritable !== undefined) setPermWritable(d.permWritable);
        if (d.permRecursive !== undefined) setPermRecursive(d.permRecursive);
        if (d.folders !== undefined) setFolders(d.folders);
        if (d.dbHost !== undefined) setDbHost(d.dbHost);
        if (d.dbPort !== undefined) setDbPort(d.dbPort);
        if (d.dbName !== undefined) setDbName(d.dbName);
        if (d.dbUser !== undefined) setDbUser(d.dbUser);
        if (d.dbPass !== undefined) setDbPass(d.dbPass);
        if (d.dbMigrate !== undefined) setDbMigrate(d.dbMigrate);
        if (d.dbMigrateCmd !== undefined) setDbMigrateCmd(d.dbMigrateCmd);
        if (d.dbImportSql !== undefined) setDbImportSql(d.dbImportSql);
        if (d.dbSqlPath !== undefined) setDbSqlPath(d.dbSqlPath);
        if (d.pm2Name !== undefined) setPm2Name(d.pm2Name);
        if (d.pm2Script !== undefined) setPm2Script(d.pm2Script);
        if (d.pm2Interpreter !== undefined) setPm2Interpreter(d.pm2Interpreter);
        if (d.pm2Instances !== undefined) setPm2Instances(d.pm2Instances);
        if (d.pm2Restart !== undefined) setPm2Restart(d.pm2Restart);
        if (d.pm2Args !== undefined) setPm2Args(d.pm2Args);
        if (d.preDeployCmd !== undefined) setPreDeployCmd(d.preDeployCmd);
        if (d.postDeployCmd !== undefined) setPostDeployCmd(d.postDeployCmd);
        if (d.healthCheckUrl !== undefined) setHealthCheckUrl(d.healthCheckUrl);
        if (d.notifyOnComplete !== undefined) setNotifyOnComplete(d.notifyOnComplete);
        if (d.truncateLogs !== undefined) setTruncateLogs(d.truncateLogs);
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cortexo_deploy_form', JSON.stringify({
        step, selectedProject, branch, environment, serverId, remotePath,
        nginxDomain, nginxPort, nginxRoot, phpVer, socketPort, rateSocketPort, wsPort, sslCert, sslKey, enableAdmin, enableMobileApi, enableLaravel, laravelPath, nginxExtra, nginxAutoGen,
        crons: [], permUser, permGroup, permFile, permDir, permWritable, permRecursive, folders,
        dbHost, dbPort, dbName, dbUser, dbPass, dbMigrate, dbMigrateCmd, dbImportSql, dbSqlPath,
        pm2Name, pm2Script, pm2Interpreter, pm2Instances, pm2Restart, pm2Args,
        preDeployCmd, postDeployCmd, healthCheckUrl, notifyOnComplete, truncateLogs
      }));
    }
  }, [
    step, selectedProject, branch, environment, serverId, remotePath,
    nginxDomain, nginxPort, nginxRoot, phpVer, socketPort, rateSocketPort, wsPort, sslCert, sslKey, enableAdmin, enableMobileApi, enableLaravel, laravelPath, nginxExtra, nginxAutoGen,
    permUser, permGroup, permFile, permDir, permWritable, permRecursive, folders,
    dbHost, dbPort, dbName, dbUser, dbPass, dbMigrate, dbMigrateCmd, dbImportSql, dbSqlPath,
    pm2Name, pm2Script, pm2Interpreter, pm2Instances, pm2Restart, pm2Args,
    preDeployCmd, postDeployCmd, healthCheckUrl, notifyOnComplete, truncateLogs, isClient
  ]);

  const { confirm: confirmModal } = useModal();

  const clearDraft = async () => {
    const ok = await confirmModal({ title: 'Clear Draft', message: 'Are you sure you want to clear the draft deploy details?', variant: 'danger', confirmText: 'Clear All' });
    if (ok) {
      localStorage.removeItem('cortexo_deploy_form');
      setStep(0); setSelectedProject(''); setBranch('main'); setEnvironment('production'); setServerId(0); setRemotePath('');
      setNginxDomain(''); setNginxPort('80'); setNginxRoot(''); setPhpVer('8.3'); setSocketPort(''); setRateSocketPort(''); setWsPort(''); setSslCert(''); setSslKey(''); setEnableAdmin(true); setEnableMobileApi(true); setEnableLaravel(true); setLaravelPath('lmxtrade/winbullliteapi'); setNginxExtra(''); setNginxAutoGen(true);
      setPermUser('ubuntu'); setPermGroup('ubuntu'); setPermFile('644'); setPermDir('755'); setPermWritable(''); setPermRecursive(true); setFolders([]);
      setDbHost(''); setDbPort('3306'); setDbName(''); setDbUser(''); setDbPass(''); setDbMigrate(false); setDbMigrateCmd('php index.php migrate'); setDbImportSql(false); setDbSqlPath('');
      setPm2Name(''); setPm2Script(''); setPm2Interpreter('node'); setPm2Instances('1'); setPm2Restart(true); setPm2Args('');
      setPreDeployCmd(''); setPostDeployCmd(''); setHealthCheckUrl(''); setNotifyOnComplete(false); setTruncateLogs(false);
    }
  };

  useEffect(()=>{
    api.getProjects().then((r:any)=>setProjects((r?.data||r) as any[]));
    api.getServers().then((r:any)=>setServerList((r?.data||r) as any[]));
    api.getSourceProfiles().then((r:any)=>setSourceProfiles((r?.data||r) as any[])).catch(()=>{});
    api.getDbProfiles().then((r:any)=>setDbProfiles((r?.data||r) as any[])).catch(()=>{});
  },[]);

  const handleSourceProfile = (id:string) => {
    const p = sourceProfiles.find((s:any)=>s.id===id);
    if(!p) return;
    if(p.branch) setBranch(p.branch);
    // Note: p.repoUrl is the git URL (e.g. git@github.com:...), NOT the server filesystem path.
    // remotePath should only be set from the project's deploy info or manually.
  };

  const handleDbProfile = (id:string) => {
    const p = dbProfiles.find((s:any)=>s.id===id);
    if(!p) return;
    if(p.host) setDbHost(p.host);
    if(p.port) setDbPort(String(p.port));
    if(p.username) setDbUser(p.username);
    if(p.password) setDbPass(p.password);
  };

  const handleProjectChange = async(pid:string)=>{
    setSelectedProject(pid);
    if(!pid){setResolved(null);return;}
    setResolving(true);
    try{
      const [resolveRes, projectRes] = await Promise.all([
        api.resolveDeployInfo(pid) as Promise<any>,
        api.getProject(pid) as Promise<any>,
      ]);
      const info=resolveRes?.data||resolveRes;
      const project=projectRes?.data||projectRes;
      setResolved(info);

      // Parse project settings JSON
      let s: Record<string,any> = {};
      if(project.settings){
        try{ s = typeof project.settings==='string'?JSON.parse(project.settings):project.settings; }catch{}
      }
      const deploy = s.deploy||{};
      const db = s.database||{};
      const sock = s.socket||{};
      const slug = s.broadcast?.client || deploy.clientSlug || (project.description||'').split('|')[1]?.trim() || '';

      // Step 1: Project & Server — fallback to project.settings.deploy
      setBranch(info.branch||project.defaultBranch||'main');
      setServerId(Number(deploy.serverId)||info.matchedServerId||0);
      setRemotePath(deploy.serverPath||info.remotePath||'');
      setPostDeployCmd(info.postDeployCmd||'');
      setHealthCheckUrl(info.healthCheckUrl||(s.domain?`https://${s.domain}`:''));

      // Step 2: Nginx — domain, root, socket ports from project settings
      const domain = s.domain||info.domain||'';
      if(domain) setNginxDomain(domain);
      const root = deploy.serverPath||info.remotePath||'';
      if(root) setNginxRoot(root);
      // Socket ports — from settings.socket or URL parsing
      if(sock.socketIoPort) setSocketPort(sock.socketIoPort);
      else { const m = (sock.socketBaseUrl||'').match(/:(\d{4,5})/); if(m) setSocketPort(m[1]); }
      if(sock.wsPort) setWsPort(sock.wsPort);
      else { const m = (sock.nativeSocketUrl||'').match(/:(\d{4,5})/); if(m) setWsPort(m[1]); }
      // Rate socket = wsPort - 1 (convention)
      if(sock.wsPort && !rateSocketPort) setRateSocketPort(String(Number(sock.wsPort) - 1));

      // Step 4: Database — from project settings
      if(db.host) setDbHost(db.host);
      else if(info.dbHost) setDbHost(info.dbHost);
      if(db.port) setDbPort(db.port);
      if(db.name) setDbName(db.name);
      else if(info.dbName) setDbName(info.dbName);
      if(db.user) setDbUser(db.user);
      if(db.password) setDbPass(db.password);

      // Step 5: PM2 — auto-fill from slug
      if(slug && !pm2Name) setPm2Name(`${slug}-socket`);
    }catch{}
    setResolving(false);
  };

  const handleDeploy = async()=>{
    if(!selectedProject||!serverId||!remotePath){setError('Project, server, and remote path are required.');return;}
    setDeploying(true);setError('');
    try{
      const res = await api.triggerDeploy({
        projectId:selectedProject, branch, environment, serverId, remotePath,
        preDeployCmd: truncateLogs ? `${preDeployCmd ? preDeployCmd + ' && ' : ''}find ${remotePath}/application/logs -name '*.php' -type f -exec truncate -s 0 {} + 2>/dev/null; find ${remotePath}/lmxtrade/winbullliteapi/storage/logs -name '*.log' -type f -exec truncate -s 0 {} + 2>/dev/null; find ${remotePath}/logs -type f -exec truncate -s 0 {} + 2>/dev/null; echo '[cortexo] logs truncated'` : preDeployCmd,
        postDeployCmd, healthCheckUrl, notifyOnComplete, truncateLogs,
        nginx: { domain:nginxDomain, port:nginxPort, root:nginxRoot, phpVer, socketPort, rateSocketPort, wsPort, sslCert, sslKey, enableAdmin, enableMobileApi, enableLaravel, laravelPath, extraDirectives:nginxExtra, autoGenerate:nginxAutoGen },
        crons: [],
        permissions: { user:permUser, group:permGroup, fileMode:permFile, dirMode:permDir, writablePaths:permWritable, recursive:permRecursive, folders },
        database: { host:dbHost, port:dbPort, name:dbName, user:dbUser, password:dbPass, migrate:dbMigrate, migrateCmd:dbMigrateCmd, importSql:dbImportSql, sqlPath:dbSqlPath },
        pm2: { name:pm2Name, script:pm2Script, interpreter:pm2Interpreter, instances:pm2Instances, autoRestart:pm2Restart, args:pm2Args },
      });
      localStorage.removeItem('cortexo_deploy_form');
      const id = (res as any)?.data?.id || (res as any)?.id;
      if(id){ setDeployId(id); setIsRunning(true); setDeployLogs([]); setDeployResult(null); }
      else { onSuccess(); }
    }catch(e:any){setError(e.message||'Deploy failed');setDeploying(false);}
  };

  /* ─── Poll deployment logs when deployId is set ─── */
  useEffect(()=>{
    if(!deployId) return;
    let cancelled = false;
    const poll = async()=>{
      try{
        const res = await api.getDeploymentLogs(deployId);
        const d = (res as any)?.data || res;
        if(!cancelled){
          setDeployLogs(d.logs||[]);
          setIsRunning(d.isRunning !== false);
          if(d.result){ setDeployResult(d.result); setIsRunning(false); }
        }
      }catch{}
    };
    poll();
    const iv = setInterval(poll, 1000);
    return ()=>{ cancelled=true; clearInterval(iv); };
  },[deployId]);

  /* ─── Auto-scroll terminal ─── */
  useEffect(()=>{
    if(termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  },[deployLogs]);



  const addFolder=(path='',perm=permDir,owner=permUser,group=permGroup)=>setFolders(f=>[...f,{path,perm,owner,group}]);
  const removeFolder=(i:number)=>setFolders(f=>f.filter((_,idx)=>idx!==i));
  const updateFolder=(i:number,key:keyof FolderEntry,val:string)=>setFolders(f=>f.map((e,idx)=>idx===i?{...e,[key]:val}:e));

  const cur=STEPS[step];
  const isLast=step===STEPS.length-1;
  const isFirst=step===0;

  const stepCompleted=(idx:number):boolean=>{
    switch(idx){
      case 0:return!!(selectedProject&&serverId&&remotePath);
      case 1:return!!(nginxDomain&&nginxRoot);
      case 2:return!!(dbHost&&dbName);
      case 3:return true; // PM2 auto-generated from slug
      case 4:return!!(selectedProject&&serverId&&remotePath);
      default:return false;
    }
  };

  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.6)'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'780px',maxHeight:'88vh',display:'flex',flexDirection:'column',borderRadius:'20px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',boxShadow:'0 24px 64px rgba(0,0,0,0.4)',overflow:'hidden' }}>

        {/* ════════════ LIVE TERMINAL MODE ════════════ */}
        {deployId ? (
          <DeployTerminal
            deployLogs={deployLogs}
            deployResult={deployResult}
            isRunning={isRunning}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : (<>

        {/* Header — form mode only */}
        <div style={{padding:'20px 28px',borderBottom:'1px solid rgb(var(--border))',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <h2 style={{fontSize:'18px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>
              Deploy Configuration
            </h2>
            <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'4px 0 0'}}>Step {step+1} of {STEPS.length} — {cur.title}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button
              onClick={clearDraft}
              style={{
                display:'flex',alignItems:'center',gap:'6px',
                padding:'6px 10px',borderRadius:'8px',
                fontSize:'11px',fontWeight:600,
                backgroundColor:'rgba(239, 68, 68, 0.1)',
                color:'#EF4444',border:'none',cursor:'pointer',
                transition:'background-color 200ms',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            >
              <Trash2 style={{width:'12px',height:'12px'}}/> Clear
            </button>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'rgb(var(--text-muted))'}}><X style={{width:'18px',height:'18px'}}/></button>
          </div>
        </div>

        {/* ════════════ FORM MODE ════════════ */}

        {/* Step indicators */}
        <div style={{display:'flex',gap:'4px',padding:'16px 28px 0',flexShrink:0,overflowX:'auto'}}>
          {STEPS.map((s,i)=>{
            const active=i===step;
            const done=stepCompleted(i);
            const Icon=s.icon;
            return (
              <button key={s.id} onClick={()=>setStep(i)} style={{
                flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',
                padding:'10px 4px 12px',borderRadius:'12px',border:'none',cursor:'pointer',
                backgroundColor:active?`${s.color}12`:'transparent',
                transition:'all 200ms',position:'relative',minWidth:0,
              }}>
                <div style={{
                  width:'32px',height:'32px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',
                  backgroundColor:active?s.color:done?`${s.color}20`:'rgba(var(--border),0.5)',
                  transition:'all 200ms',position:'relative',
                }}>
                  {done && !active ? <CheckCircle style={{width:'15px',height:'15px',color:s.color}}/> : <Icon style={{width:'15px',height:'15px',color:active?'#fff':'rgb(var(--text-muted))'}}/>}
                </div>
                <span style={{fontSize:'10px',fontWeight:active?700:500,color:active?s.color:'rgb(var(--text-muted))',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',width:'100%',textAlign:'center'}}>
                  {s.title.split(' ')[0]}
                </span>
                {active && <div style={{position:'absolute',bottom:0,left:'20%',right:'20%',height:'3px',borderRadius:'2px',backgroundColor:s.color}}/>}
              </button>
            );
          })}
        </div>

        {/* Card title */}
        <div style={{padding:'20px 28px 0',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'4px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg, ${cur.color}20, ${cur.color}08)`}}>
              <cur.icon style={{width:'18px',height:'18px',color:cur.color}}/>
            </div>
            <div>
              <h3 style={{fontSize:'16px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>{cur.title}</h3>
              <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>{cur.desc}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:'16px 28px 24px',display:'flex',flexDirection:'column',gap:'14px'}}>

          {step===0&&(<>
            <div><label style={lbl}>Project</label>
              <select value={selectedProject} onChange={e=>handleProjectChange(e.target.value)} style={{...inp,fontFamily:'inherit'}}><option value="">Select a project...</option>{projects.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
            {resolving&&<div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'rgb(var(--text-muted))'}}><Loader2 style={{width:'14px',height:'14px',animation:'spin 1s linear infinite'}}/>Resolving...</div>}
            {resolved&&(
              <div style={{padding:'12px 14px',borderRadius:'10px',backgroundColor:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',fontSize:'12px',color:'#10B981',display:'flex',alignItems:'center',gap:'8px'}}>
                <Server style={{width:'14px',height:'14px',flexShrink:0}}/><strong>{resolved.projectName}</strong> → {resolved.matchedServerName||'No server'} ({resolved.matchedServerIp||'—'})
              </div>
            )}
            {sourceProfiles.length>0&&(
              <div style={{padding:'12px 14px',borderRadius:'10px',backgroundColor:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.15)'}}>
                <label style={{...lbl,color:'#818CF8'}}>Source Profile (auto-fill repo & branch)</label>
                <select onChange={e=>handleSourceProfile(e.target.value)} style={{...inp,fontFamily:'inherit'}}>
                  <option value="">— Manual entry —</option>
                  {sourceProfiles.map((p:any)=><option key={p.id} value={p.id}>{p.name} ({p.repoUrl})</option>)}
                </select>
              </div>
            )}
            <div style={g2}>
              <div><label style={lbl}>Branch</label><input value={branch} onChange={e=>setBranch(e.target.value)} style={inp}/></div>
              <div><label style={lbl}>Environment</label><select value={environment} onChange={e=>setEnvironment(e.target.value)} style={{...inp,fontFamily:'inherit'}}><option value="production">Production</option><option value="staging">Staging</option><option value="development">Development</option></select></div>
            </div>
            <div><label style={lbl}>Server</label><select value={serverId} onChange={e=>setServerId(parseInt(e.target.value))} style={{...inp,fontFamily:'inherit'}}><option value={0}>Select server...</option>{serverList.map((s:any)=><option key={s.id} value={s.id}>{s.name} ({s.privateIp})</option>)}</select></div>
            <div><label style={lbl}>Remote Path</label><input value={remotePath} onChange={e=>setRemotePath(e.target.value)} placeholder="/var/www/html/client" style={inp}/></div>

            {/* Health & Notifications */}
            <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'rgb(var(--primary))',margin:'6px 0 0',borderTop:'1px solid rgb(var(--border))',paddingTop:'14px'}}>Health & Notifications</p>
            <div><label style={lbl}>Health Check URL</label><input value={healthCheckUrl} onChange={e=>setHealthCheckUrl(e.target.value)} placeholder="https://your-app.com/api/health" style={inp}/></div>
            <Toggle checked={notifyOnComplete} onChange={setNotifyOnComplete} label="Send email notification on complete"/>
            <Toggle checked={truncateLogs} onChange={setTruncateLogs} label="Truncate logs on deploy"/>
            {truncateLogs && (
              <div style={{marginTop:'8px'}}>
                <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#F59E0B',margin:'0 0 6px',display:'flex',alignItems:'center',gap:'6px'}}>
                  ⚡ Log Cleanup Preview
                  <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none',letterSpacing:0}}>— executed after deployment</span>
                </p>
                <pre style={{margin:0,padding:'12px 14px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.2)',border:'1px solid rgba(245,158,11,0.2)',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-primary))',overflowX:'auto',whiteSpace:'pre-wrap',lineHeight:1.7}}>
{`# ===========================
# Truncate all log files
# ===========================

# Laravel logs
> ${remotePath || '/var/www/html/<slug>'}/lmxtrade/winbullliteapi/storage/logs/lumen.log

# CodeIgniter logs (truncate data, keep files)
find ${remotePath || '/var/www/html/<slug>'}/application/logs -name 'log-*.php' -exec truncate -s 0 {} +

# Admin logs (truncate data, keep files)
find ${remotePath || '/var/www/html/<slug>'}/admin/application/logs -name 'log-*.php' -exec truncate -s 0 {} +

# Laravel cache & sessions (safe to remove, framework regenerates)
rm -rf ${remotePath || '/var/www/html/<slug>'}/lmxtrade/winbullliteapi/storage/framework/cache/data/*
rm -rf ${remotePath || '/var/www/html/<slug>'}/lmxtrade/winbullliteapi/storage/framework/sessions/*
rm -rf ${remotePath || '/var/www/html/<slug>'}/lmxtrade/winbullliteapi/storage/framework/views/*

# PM2 logs
pm2 flush ${(remotePath || '').split('/').pop() || '<slug>'}-ws
pm2 flush ${(remotePath || '').split('/').pop() || '<slug>'}-socketio`}
                </pre>
              </div>
            )}
          </>)}

          {step===1&&(<>
            {/* Server basics */}
            <div style={g2}>
              <div><label style={lbl}>Server Name (Domain)</label><input value={nginxDomain} onChange={e=>setNginxDomain(e.target.value)} placeholder="www.maharajgoldsmith.com" style={inp}/></div>
              <div><label style={lbl}>Listen Port</label><input value={nginxPort} onChange={e=>setNginxPort(e.target.value)} placeholder="80" style={inp}/></div>
            </div>
            <div style={g2}>
              <div style={{gridColumn:'1 / -1'}}><label style={lbl}>Document Root</label><input value={nginxRoot} onChange={e=>setNginxRoot(e.target.value)} placeholder="/var/www/html/maharaj" style={inp}/></div>
            </div>

            {/* Socket proxies */}
            <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'rgb(var(--primary))',margin:'6px 0 0',borderTop:'1px solid rgb(var(--border))',paddingTop:'14px'}}>Socket Proxies</p>
            <div style={g3}>
              <div><label style={lbl}>Main Socket Port</label><input value={socketPort} onChange={e=>setSocketPort(e.target.value)} placeholder="7124" style={inp}/></div>
              <div><label style={lbl}>Rate Socket Port</label><input value={rateSocketPort} onChange={e=>setRateSocketPort(e.target.value)} placeholder="57123" style={inp}/></div>
              <div><label style={lbl}>WebSocket Port</label><input value={wsPort} onChange={e=>setWsPort(e.target.value)} placeholder="57124" style={inp}/></div>
            </div>
            <div style={{padding:'10px 12px',borderRadius:'8px',backgroundColor:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)',fontSize:'11px',color:'rgb(var(--text-muted))',lineHeight:1.6,fontFamily:"'JetBrains Mono',monospace"}}>
              {socketPort && <div>/socket.io/ → localhost:{socketPort}</div>}
              {rateSocketPort && <div>/ratesocket/ → localhost:{rateSocketPort}</div>}
              {wsPort && <div>/ws → 127.0.0.1:{wsPort}</div>}
              {!socketPort && !rateSocketPort && !wsPort && <div style={{opacity:0.5}}>Enter ports to preview proxy routes</div>}
            </div>

            {/* SSL */}
            <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'rgb(var(--primary))',margin:'6px 0 0',borderTop:'1px solid rgb(var(--border))',paddingTop:'14px'}}>SSL (Optional)</p>
            <div style={g2}>
              <div><label style={lbl}>SSL Certificate Path</label><input value={sslCert} onChange={e=>setSslCert(e.target.value)} placeholder="/etc/ssl/certs/domain.pem" style={inp}/></div>
              <div><label style={lbl}>SSL Key Path</label><input value={sslKey} onChange={e=>setSslKey(e.target.value)} placeholder="/etc/ssl/private/domain.key" style={inp}/></div>
            </div>

            <Toggle checked={nginxAutoGen} onChange={setNginxAutoGen} label="Auto-generate nginx config file on deploy"/>

            {/* Live Nginx Config Preview */}
            {(nginxDomain || nginxRoot) && (
              <div style={{marginTop:'8px'}}>
                <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#A855F7',margin:'0 0 6px',display:'flex',alignItems:'center',gap:'6px'}}>
                  ⚡ Nginx Config Preview
                  <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none',letterSpacing:0}}>— auto-generated from above fields</span>
                </p>
                <pre style={{margin:0,padding:'12px 14px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.2)',border:'1px solid rgba(168,85,247,0.2)',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-primary))',overflowX:'auto',whiteSpace:'pre-wrap',lineHeight:1.7}}>
{`server {
    listen ${nginxPort || '80'};
    server_name ${nginxDomain || '<domain>'};

    root ${nginxRoot || '<document-root>'};
    index index.php index.html;
${socketPort ? `
    # Main Socket (port ${socketPort})
    location /socket.io/ {
        proxy_pass http://localhost:${socketPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
` : ''}${rateSocketPort ? `
    # Rate Socket (port ${rateSocketPort})
    location /ratesocket/ {
        proxy_pass http://localhost:${rateSocketPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
` : ''}${wsPort ? `
    # Native WebSocket (port ${wsPort})
    location /ws {
        proxy_pass http://127.0.0.1:${wsPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_buffering off;
    }
` : ''}
    # Admin Panel
    location /admin/ {
        try_files $uri $uri/ /admin/index.php?$query_string;
    }

    # CodeIgniter routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Mobile API
    location /mobileapi/ {
        try_files $uri $uri/ /mobileapi/index.php?$query_string;
    }

    # Laravel
    location /lmxtrade/winbullliteapi/ {
        try_files $uri $uri/ /lmxtrade/winbullliteapi/index.php?$query_string;
    }

    location ~ /\\.ht {
        deny all;
    }
}`}
                </pre>
              </div>
            )}
          </>)}

          {step===2&&(<>
            {dbProfiles.length>0&&(
              <div style={{padding:'12px 14px',borderRadius:'10px',backgroundColor:'rgba(236,72,153,0.06)',border:'1px solid rgba(236,72,153,0.15)'}}>
                <label style={{...lbl,color:'#EC4899'}}>DB Profile (auto-fill host, port, user, password)</label>
                <select onChange={e=>handleDbProfile(e.target.value)} style={{...inp,fontFamily:'inherit'}}>
                  <option value="">— Manual entry —</option>
                  {dbProfiles.map((p:any)=><option key={p.id} value={p.id}>{p.name} ({p.host}:{p.port})</option>)}
                </select>
              </div>
            )}
            <div style={g3}>
              <div><label style={lbl}>DB Host</label><input value={dbHost} onChange={e=>setDbHost(e.target.value)} placeholder="localhost" style={inp}/></div>
              <div><label style={lbl}>DB Port</label><input value={dbPort} onChange={e=>setDbPort(e.target.value)} style={inp}/></div>
              <div><label style={lbl}>DB Name</label><input value={dbName} onChange={e=>setDbName(e.target.value)} style={inp}/></div>
            </div>
            <div style={g2}>
              <div><label style={lbl}>DB User</label><input value={dbUser} onChange={e=>setDbUser(e.target.value)} style={inp}/></div>
              <div><label style={lbl}>DB Password</label><input type="password" value={dbPass} onChange={e=>setDbPass(e.target.value)} style={inp}/></div>
            </div>

            {/* Live Database Setup Preview */}
            {dbName && (
              <div style={{marginTop:'8px'}}>
                <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#EC4899',margin:'0 0 6px',display:'flex',alignItems:'center',gap:'6px'}}>
                  ⚡ Database Setup Preview
                  <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none',letterSpacing:0}}>— 3-phase pipeline executed on deploy</span>
                </p>
                <pre style={{margin:0,padding:'12px 14px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.2)',border:'1px solid rgba(236,72,153,0.2)',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-primary))',overflowX:'auto',whiteSpace:'pre-wrap',lineHeight:1.7,maxHeight:'400px',overflow:'auto'}}>
{`-- ========================
-- Phase 1: Create Database
-- ========================
CREATE DATABASE IF NOT EXISTS \`${dbName}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================
-- Phase 2: Import Base Schema
-- ========================
-- mysqldump -h ${dbHost || '<host>'} -u ${dbUser || '<user>'} winbullSource | mysql ${dbName}

-- ========================
-- Phase 3: Truncate & Configure
-- ========================
USE ${dbName};
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE ci_usersessions;
TRUNCATE ci_sessions;
TRUNCATE dt_admin_log;
TRUNCATE dt_adminsessions;
TRUNCATE dt_cus_commodity;
TRUNCATE dt_booking;
TRUNCATE dt_booking_tracking;
TRUNCATE dt_transaction;
TRUNCATE dt_marginmanagement;
TRUNCATE dt_customerdelivery;
TRUNCATE dt_customer_deliveryinvoice;
TRUNCATE dt_customergroupitems;
TRUNCATE dt_customer;
TRUNCATE dt_customergroup;
TRUNCATE dt_historicaldata;
TRUNCATE dt_historical_avg;
TRUNCATE dt_ratealert;
TRUNCATE dt_hedge_log;
TRUNCATE dt_usersessions;
TRUNCATE dt_user_device;
TRUNCATE dt_quotation;
TRUNCATE dt_fundtransfer;
TRUNCATE dt_knockoff;
TRUNCATE dt_unfix;
TRUNCATE dt_coverupmcx;
TRUNCATE order_logs;
TRUNCATE dt_popup;
TRUNCATE dt_marqueetext;
TRUNCATE dt_news;
TRUNCATE dt_admininfo;
TRUNCATE dt_com_master;
TRUNCATE dt_appevents;
TRUNCATE dt_appvideos;
TRUNCATE dt_advertisements;
TRUNCATE dt_gallery;
TRUNCATE dt_events;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================
-- UPDATE (client config)
-- ========================
UPDATE dt_generalsettings SET
  admin_company_name = '${dbName}',
  admin_mail = '', admin_mail_server = '', admin_mail_password = '',
  admin_mob1 = '', admin_mob2 = '', admin_mob3 = '',
  admin_mob4 = '', admin_mob5 = '',
  is_admin_mob1 = 0, is_admin_mob2 = 0, is_admin_mob3 = 0,
  is_admin_mob4 = 0, is_admin_mob5 = 0,
  invoice_comp_name = '', address = '', city = '',
  state = '', pincode = 0, mobile = '', email = '',
  gst_no = '', pan_no = '',
  website_logo = 'logo.png', admin_logo = NULL,
  website_favicon = 'favicon.ico'
WHERE genid = 1;

UPDATE dt_admin_user SET
  admin_user_name = 'bullion',
  admin_user_password = MD5('<password>')
WHERE admin_user_id = 3;

UPDATE dt_email_settings SET
  email_content = REPLACE(email_content, 'LOGIMAX Bullion', '${dbName}'),
  email_signature = REPLACE(email_signature, 'LOGIMAX Bullion', '${dbName}');

UPDATE dt_sms_settings SET
  sms_footer = REPLACE(sms_footer, 'LOGIMAX BULLION', '${dbName.toUpperCase()}');

UPDATE dt_whatsapp_settings SET
  whatsapp_footer = REPLACE(whatsapp_footer, 'Logimax', '${dbName}');`}
                </pre>
              </div>
            )}
          </>)}

          {step===3&&(<>
            <Toggle checked={pm2Restart} onChange={setPm2Restart} label="Auto-restart process on deploy"/>

            {/* Live PM2 Preview */}
            <div style={{marginTop:'8px'}}>
              <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#8B5CF6',margin:'0 0 6px',display:'flex',alignItems:'center',gap:'6px'}}>
                ⚡ PM2 Commands Preview
                <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none',letterSpacing:0}}>— auto-generated from project slug</span>
              </p>
              <pre style={{margin:0,padding:'12px 14px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.2)',border:'1px solid rgba(139,92,246,0.2)',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-primary))',overflowX:'auto',whiteSpace:'pre-wrap',lineHeight:1.7}}>
{`# Native WebSocket — Rate file watcher (port ${wsPort || '?'})
pm2 start ${remotePath || '/var/www/html/<slug>'}/client/${(remotePath || '').split('/').pop() || '<slug>'}-ws.js --name "${(remotePath || '').split('/').pop() || '<slug>'}-ws"

# Socket.IO — Redis pub/sub events (port ${socketPort || '?'})
pm2 start ${remotePath || '/var/www/html/<slug>'}/lmxtrade/${(remotePath || '').split('/').pop() || '<slug>'}winlitesocket.js --name "${(remotePath || '').split('/').pop() || '<slug>'}-socketio"

pm2 save`}
              </pre>
            </div>
          </>)}

          {step===4&&(
            <StepReview
              selectedProject={selectedProject} projects={projects} branch={branch}
              environment={environment} serverId={serverId} serverList={serverList}
              remotePath={remotePath} healthCheckUrl={healthCheckUrl}
              nginxDomain={nginxDomain} nginxPort={nginxPort} nginxRoot={nginxRoot}
              phpVer={phpVer} socketPort={socketPort} wsPort={wsPort} sslCert={sslCert}
              crons={[]} dbHost={dbHost} dbPort={dbPort} dbName={dbName}
              dbUser={dbUser} dbMigrate={dbMigrate} dbMigrateCmd={dbMigrateCmd}
              pm2Restart={pm2Restart}
              permUser={permUser} permGroup={permGroup} permFile={permFile}
              permDir={permDir} folders={folders} permWritable={permWritable}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 28px',borderTop:'1px solid rgb(var(--border))',display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
          {error&&<div style={{flex:1,padding:'8px 12px',borderRadius:'8px',backgroundColor:'rgba(239,68,68,0.1)',color:'#EF4444',fontSize:'12px'}}>{error}</div>}
          <div style={{flex:error?0:1}}/>
          {!isFirst&&(
            <button onClick={()=>setStep(s=>s-1)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 20px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-secondary))',cursor:'pointer',fontSize:'13px',fontWeight:600}}>
              <ChevronLeft style={{width:'14px',height:'14px'}}/>Back
            </button>
          )}
          {isLast?(
            <button onClick={handleDeploy} disabled={deploying} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 28px',borderRadius:'10px',border:'none',cursor:deploying?'wait':'pointer',fontSize:'14px',fontWeight:600,color:'#fff',background:'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',opacity:deploying?0.6:1,boxShadow:'0 4px 16px rgba(var(--primary),0.3)'}}>
              {deploying?<Loader2 style={{width:'16px',height:'16px',animation:'spin 1s linear infinite'}}/>:<Rocket style={{width:'16px',height:'16px'}}/>}
              {deploying?'Deploying...':'🚀 Start Deployment'}
            </button>
          ):(
            <button onClick={()=>setStep(s=>s+1)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 24px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,color:'#fff',backgroundColor:`${cur.color}`,boxShadow:`0 4px 12px ${cur.color}40`}}>
              Next<ChevronRight style={{width:'14px',height:'14px'}}/>
            </button>
          )}
        </div>
        </>)}
      </div>
    </div>
  );
}
