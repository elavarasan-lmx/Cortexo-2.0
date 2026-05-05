'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, X, Plus, Minus, CheckCircle, Server, Trash2, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { api } from '@/lib/api';
import { inp, lbl, ta, g2, g3, STEPS, Toggle, octalToRwx } from './deploy/shared';
import type { CronEntry, FolderEntry } from './deploy/shared';
import DeployTerminal from './deploy/deploy-terminal';
import StepReview from './deploy/step-review';

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

  const [crons,setCrons]=useState<CronEntry[]>(initialData?.crons || []);

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
        if (d.crons !== undefined) setCrons(d.crons);
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
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cortexo_deploy_form', JSON.stringify({
        step, selectedProject, branch, environment, serverId, remotePath,
        nginxDomain, nginxPort, nginxRoot, phpVer, socketPort, rateSocketPort, wsPort, sslCert, sslKey, enableAdmin, enableMobileApi, enableLaravel, laravelPath, nginxExtra, nginxAutoGen,
        crons, permUser, permGroup, permFile, permDir, permWritable, permRecursive, folders,
        dbHost, dbPort, dbName, dbUser, dbPass, dbMigrate, dbMigrateCmd, dbImportSql, dbSqlPath,
        pm2Name, pm2Script, pm2Interpreter, pm2Instances, pm2Restart, pm2Args,
        preDeployCmd, postDeployCmd, healthCheckUrl, notifyOnComplete
      }));
    }
  }, [
    step, selectedProject, branch, environment, serverId, remotePath,
    nginxDomain, nginxPort, nginxRoot, phpVer, socketPort, rateSocketPort, wsPort, sslCert, sslKey, enableAdmin, enableMobileApi, enableLaravel, laravelPath, nginxExtra, nginxAutoGen,
    crons, permUser, permGroup, permFile, permDir, permWritable, permRecursive, folders,
    dbHost, dbPort, dbName, dbUser, dbPass, dbMigrate, dbMigrateCmd, dbImportSql, dbSqlPath,
    pm2Name, pm2Script, pm2Interpreter, pm2Instances, pm2Restart, pm2Args,
    preDeployCmd, postDeployCmd, healthCheckUrl, notifyOnComplete, isClient
  ]);

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear the draft deploy details?')) {
      localStorage.removeItem('cortexo_deploy_form');
      setStep(0); setSelectedProject(''); setBranch('main'); setEnvironment('production'); setServerId(0); setRemotePath('');
      setNginxDomain(''); setNginxPort('80'); setNginxRoot(''); setPhpVer('8.3'); setSocketPort(''); setRateSocketPort(''); setWsPort(''); setSslCert(''); setSslKey(''); setEnableAdmin(true); setEnableMobileApi(true); setEnableLaravel(true); setLaravelPath('lmxtrade/winbullliteapi'); setNginxExtra(''); setNginxAutoGen(true);
      setCrons([]); setPermUser('ubuntu'); setPermGroup('ubuntu'); setPermFile('644'); setPermDir('755'); setPermWritable(''); setPermRecursive(true); setFolders([]);
      setDbHost(''); setDbPort('3306'); setDbName(''); setDbUser(''); setDbPass(''); setDbMigrate(false); setDbMigrateCmd('php index.php migrate'); setDbImportSql(false); setDbSqlPath('');
      setPm2Name(''); setPm2Script(''); setPm2Interpreter('node'); setPm2Instances('1'); setPm2Restart(true); setPm2Args('');
      setPreDeployCmd(''); setPostDeployCmd(''); setHealthCheckUrl(''); setNotifyOnComplete(false);
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

      // Step 1: Project & Server
      setBranch(info.branch||project.defaultBranch||'main');
      setServerId(info.matchedServerId||0);
      setRemotePath(info.remotePath||'');
      setPostDeployCmd(info.postDeployCmd||'');
      setHealthCheckUrl(info.healthCheckUrl||'');

      // Parse project settings JSON
      let s: Record<string,any> = {};
      if(project.settings){
        try{ s = typeof project.settings==='string'?JSON.parse(project.settings):project.settings; }catch{}
      }
      const db = s.database||{};
      const sock = s.socket||{};

      // Step 2: Nginx — domain, root, socket ports
      if(s.domain) setNginxDomain(s.domain);
      else if(info.domain) setNginxDomain(info.domain);
      if(info.remotePath) setNginxRoot(info.remotePath);
      // Extract ports from socket URLs
      const mainSockMatch = (sock.socketBaseUrl||'').match(/:(\d{4,5})/);
      if(mainSockMatch) setSocketPort(mainSockMatch[1]);
      const wsSockMatch = (sock.nativeSocketUrl||'').match(/:(\d{4,5})/);
      if(wsSockMatch) setWsPort(wsSockMatch[1]);

      // Step 5: Database
      if(db.host) setDbHost(db.host);
      else if(info.dbHost) setDbHost(info.dbHost);
      if(db.port) setDbPort(db.port);
      if(db.name) setDbName(db.name);
      else if(info.dbName) setDbName(info.dbName);
      if(db.user) setDbUser(db.user);
      if(db.password) setDbPass(db.password);

      // Step 6: PM2 — auto-fill from slug
      const slug = s.clientSlug || (project.description||'').split('|')[1]?.trim() || '';
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
        preDeployCmd, postDeployCmd, healthCheckUrl, notifyOnComplete,
        nginx: { domain:nginxDomain, port:nginxPort, root:nginxRoot, phpVer, socketPort, rateSocketPort, wsPort, sslCert, sslKey, enableAdmin, enableMobileApi, enableLaravel, laravelPath, extraDirectives:nginxExtra, autoGenerate:nginxAutoGen },
        crons,
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
    const iv = setInterval(poll, 2000);
    return ()=>{ cancelled=true; clearInterval(iv); };
  },[deployId]);

  /* ─── Auto-scroll terminal ─── */
  useEffect(()=>{
    if(termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  },[deployLogs]);

  const addCron=()=>setCrons(c=>[...c,{schedule:'* * * * *',command:''}]);
  const removeCron=(i:number)=>setCrons(c=>c.filter((_,idx)=>idx!==i));
  const updateCron=(i:number,key:keyof CronEntry,val:string)=>setCrons(c=>c.map((e,idx)=>idx===i?{...e,[key]:val}:e));

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
      case 2:return crons.length>0;
      case 3:return folders.length>0||(!!permUser&&!!permGroup);
      case 4:return!!(dbHost&&dbName);
      case 5:return!!(pm2Name&&pm2Script);
      case 6:return!!(selectedProject&&serverId&&remotePath); // review ready if step 0 is valid
      default:return false;
    }
  };

  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.6)'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'780px',maxHeight:'88vh',display:'flex',flexDirection:'column',borderRadius:'20px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',boxShadow:'0 24px 64px rgba(0,0,0,0.4)',overflow:'hidden' }}>

        {/* Header */}
        <div style={{padding:'20px 28px',borderBottom:'1px solid rgb(var(--border))',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <h2 style={{fontSize:'18px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>
              {deployId ? <><Terminal style={{width:'18px',height:'18px',display:'inline',verticalAlign:'middle',marginRight:'8px',color:'#10B981'}}/>Live Deploy Terminal</> : 'Deploy Configuration'}
            </h2>
            {!deployId && <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'4px 0 0'}}>Step {step+1} of {STEPS.length} — {cur.title}</p>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            {!deployId && (
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
            )}
            <button onClick={deployId ? ()=>{onSuccess();} : onClose} style={{background:'none',border:'none',cursor:'pointer',color:'rgb(var(--text-muted))'}}><X style={{width:'18px',height:'18px'}}/></button>
          </div>
        </div>

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
            <div><label style={lbl}>Health Check URL</label><input value={healthCheckUrl} onChange={e=>setHealthCheckUrl(e.target.value)} placeholder="https://example.com" style={inp}/></div>
            <Toggle checked={notifyOnComplete} onChange={setNotifyOnComplete} label="Send email notification on complete"/>
          </>)}

          {step===1&&(<>
            {/* Server basics */}
            <div style={g2}>
              <div><label style={lbl}>Server Name (Domain)</label><input value={nginxDomain} onChange={e=>setNginxDomain(e.target.value)} placeholder="www.maharajgoldsmith.com" style={inp}/></div>
              <div><label style={lbl}>Listen Port</label><input value={nginxPort} onChange={e=>setNginxPort(e.target.value)} placeholder="80" style={inp}/></div>
            </div>
            <div style={g2}>
              <div><label style={lbl}>Document Root</label><input value={nginxRoot} onChange={e=>setNginxRoot(e.target.value)} placeholder="/var/www/html/maharaj" style={inp}/></div>
              <div><label style={lbl}>PHP-FPM Version</label><select value={phpVer} onChange={e=>setPhpVer(e.target.value)} style={{...inp,fontFamily:'inherit'}}><option value="8.3">PHP 8.3</option><option value="8.2">PHP 8.2</option><option value="8.1">PHP 8.1</option><option value="7.4">PHP 7.4</option></select></div>
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
          </>)}

          {step===2&&(<>
            {crons.map((c,i)=>(
              <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-end'}}>
                <div style={{width:'140px'}}><label style={lbl}>Schedule</label><input value={c.schedule} onChange={e=>updateCron(i,'schedule',e.target.value)} style={inp}/></div>
                <div style={{flex:1}}><label style={lbl}>Command</label><input value={c.command} onChange={e=>updateCron(i,'command',e.target.value)} placeholder="cd /var/www/html/client && php index.php cron run" style={inp}/></div>
                <button onClick={()=>removeCron(i)} style={{width:'38px',height:'38px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',backgroundColor:'rgba(239,68,68,0.06)',color:'#EF4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Minus style={{width:'14px',height:'14px'}}/></button>
              </div>
            ))}
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <button onClick={addCron} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'10px',border:'1px dashed rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-secondary))',cursor:'pointer',fontSize:'12px',fontWeight:600}}><Plus style={{width:'13px',height:'13px'}}/>Add Cron Entry</button>
              {[{label:'⚡ Rate Sync',schedule:'* * * * *',command:`cd ${remotePath||'/var/www/html/client'} && php index.php C_rates sync_rates`},{label:'💾 DB Backup',schedule:'0 2 * * *',command:`db_dump -u ${dbUser||'admin'} -p ${dbName||'dbname'} > /backup/${dbName||'db'}_$(date +\%F).sql`},{label:'📜 Log Cleanup',schedule:'0 0 * * 0',command:`find ${remotePath||'/var/www/html/client'}/application/logs -name '*.php' -mtime +30 -delete`}].map(p=>(
                <button key={p.label} onClick={()=>setCrons(c=>[...c,{schedule:p.schedule,command:p.command}])} style={{padding:'6px 12px',borderRadius:'8px',border:'1px solid rgba(var(--border),0.5)',backgroundColor:'rgba(var(--primary),0.04)',color:'rgb(var(--text-muted))',cursor:'pointer',fontSize:'11px',fontWeight:500}}>{p.label}</button>
              ))}
            </div>
            {crons.length===0&&<div style={{padding:'32px',textAlign:'center',borderRadius:'12px',border:'1px dashed rgb(var(--border))'}}><Webhook style={{width:'24px',height:'24px',color:'rgb(var(--text-muted))',opacity:0.4,margin:'0 auto 8px'}}/><p style={{fontSize:'13px',color:'rgb(var(--text-muted))',margin:0}}>No cron jobs — use presets or add custom entries</p></div>}
          </>)}

          {step===3&&(<>
            {/* Default ownership & permissions */}
            <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'rgb(var(--primary))',margin:'0 0 2px'}}>Default Ownership</p>
            <div style={g2}>
              <div><label style={lbl}>Owner User</label><input value={permUser} onChange={e=>setPermUser(e.target.value)} style={inp}/></div>
              <div><label style={lbl}>Owner Group</label><input value={permGroup} onChange={e=>setPermGroup(e.target.value)} style={inp}/></div>
            </div>
            <div style={g2}>
              <div><label style={lbl}>File Permission (octal)</label><input value={permFile} onChange={e=>setPermFile(e.target.value)} placeholder="644" style={inp}/></div>
              <div><label style={lbl}>Directory Permission (octal)</label><input value={permDir} onChange={e=>setPermDir(e.target.value)} placeholder="755" style={inp}/></div>
            </div>

            {/* Live preview */}
            <div style={{padding:'10px 14px',borderRadius:'8px',backgroundColor:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',color:'rgb(var(--text-secondary))',lineHeight:1.8}}>
              <div>d{octalToRwx(permDir)} {permUser} {permGroup} 4096 {new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit'})} {new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})} <span style={{color:'#3B82F6',fontWeight:600}}>project-root/</span></div>
              <div>-{octalToRwx(permFile)} {permUser} {permGroup}  128 {new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit'})} {new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})} <span style={{color:'rgb(var(--text-muted))'}}>index.php</span></div>
            </div>

            {/* Folder creation */}
            <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'rgb(var(--primary))',margin:'6px 0 0',borderTop:'1px solid rgb(var(--border))',paddingTop:'14px'}}>Folders to Create</p>
            {folders.map((f,i)=>(
              <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-end'}}>
                <div style={{flex:1}}><label style={lbl}>Path</label><input value={f.path} onChange={e=>updateFolder(i,'path',e.target.value)} placeholder="/var/www/html/client" style={inp}/></div>
                <div style={{width:'70px'}}><label style={lbl}>Perm</label><input value={f.perm} onChange={e=>updateFolder(i,'perm',e.target.value)} style={inp}/></div>
                <div style={{width:'90px'}}><label style={lbl}>Owner</label><input value={f.owner} onChange={e=>updateFolder(i,'owner',e.target.value)} style={inp}/></div>
                <button onClick={()=>removeFolder(i)} style={{width:'38px',height:'38px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',backgroundColor:'rgba(239,68,68,0.06)',color:'#EF4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Minus style={{width:'14px',height:'14px'}}/></button>
              </div>
            ))}

            {/* Folder preview */}
            {folders.length>0 && (
              <div style={{padding:'10px 14px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.15)',border:'1px solid rgb(var(--border))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',color:'rgb(var(--text-secondary))',lineHeight:1.8,overflowX:'auto'}}>
                <div style={{color:'rgb(var(--text-muted))',marginBottom:'4px'}}>$ ls -la</div>
                {folders.map((f,i)=>(
                  <div key={i}>d{octalToRwx(f.perm)} {f.owner} {f.group} 4096 {new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit'})} {new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})} <span style={{color:'#3B82F6',fontWeight:600}}>{f.path.split('/').pop()||f.path}</span></div>
                ))}
              </div>
            )}

            {/* Add + presets */}
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <button onClick={()=>addFolder()} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'10px',border:'1px dashed rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-secondary))',cursor:'pointer',fontSize:'12px',fontWeight:600}}><Plus style={{width:'13px',height:'13px'}}/>Add Folder</button>
              <button onClick={()=>{
                const slug=remotePath.split('/').pop()||'client';
                const base=`/var/www/html/${slug}`;
                const std=['admin','api','application','assets','client','lmxtrade','logs','mobileapi'];
                std.forEach(s=>addFolder(`${base}/${s}`,'775'));
              }} style={{padding:'6px 14px',borderRadius:'8px',border:'1px solid rgba(16,185,129,0.3)',backgroundColor:'rgba(16,185,129,0.08)',color:'#10B981',cursor:'pointer',fontSize:'11px',fontWeight:600}}>⚡ All Standard (8 folders)</button>
              {[
                {label:'📂 Root',sub:''},
                {label:'📁 admin',sub:'/admin'},
                {label:'📁 api',sub:'/api'},
                {label:'📁 application',sub:'/application'},
                {label:'📁 assets',sub:'/assets'},
                {label:'📁 client',sub:'/client'},
                {label:'📁 lmxtrade',sub:'/lmxtrade'},
                {label:'📁 logs',sub:'/logs'},
                {label:'📁 mobileapi',sub:'/mobileapi'},
              ].map(p=>(
                <button key={p.label} onClick={()=>addFolder(`/var/www/html/${remotePath.split('/').pop()||'client'}${p.sub}`)} style={{padding:'5px 10px',borderRadius:'8px',border:'1px solid rgba(var(--border),0.5)',backgroundColor:'rgba(var(--primary),0.04)',color:'rgb(var(--text-muted))',cursor:'pointer',fontSize:'11px'}}>{p.label}</button>
              ))}
            </div>

            {/* Writable paths */}
            <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'rgb(var(--primary))',margin:'6px 0 0',borderTop:'1px solid rgb(var(--border))',paddingTop:'14px'}}>Writable Paths (chmod 777)</p>
            <div><textarea value={permWritable} onChange={e=>setPermWritable(e.target.value)} placeholder={'/client\n/application/logs\n/application/cache\n/assets/uploads\n/logs'} style={ta}/></div>
            <Toggle checked={permRecursive} onChange={setPermRecursive} label="Apply permissions recursively (-R)"/>
          </>)}

          {step===4&&(<>
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
            <Toggle checked={dbMigrate} onChange={setDbMigrate} label="Run migrations on deploy"/>
            {dbMigrate&&<div><label style={lbl}>Migration Command</label><input value={dbMigrateCmd} onChange={e=>setDbMigrateCmd(e.target.value)} style={inp}/></div>}
            <Toggle checked={dbImportSql} onChange={setDbImportSql} label="Import SQL dump on deploy"/>
            {dbImportSql&&<div><label style={lbl}>SQL Dump Path</label><input value={dbSqlPath} onChange={e=>setDbSqlPath(e.target.value)} placeholder="/backup/initial.sql" style={inp}/></div>}
          </>)}

          {step===5&&(<>
            <div style={g2}>
              <div><label style={lbl}>Process Name</label><input value={pm2Name} onChange={e=>setPm2Name(e.target.value)} placeholder="jmj-socket" style={inp}/></div>
              <div><label style={lbl}>Script</label><input value={pm2Script} onChange={e=>setPm2Script(e.target.value)} placeholder="server.js" style={inp}/></div>
            </div>
            <div style={g3}>
              <div><label style={lbl}>Interpreter</label><select value={pm2Interpreter} onChange={e=>setPm2Interpreter(e.target.value)} style={{...inp,fontFamily:'inherit'}}><option value="node">Node.js</option><option value="php">PHP</option><option value="python">Python</option><option value="bash">Bash</option></select></div>
              <div><label style={lbl}>Instances</label><input value={pm2Instances} onChange={e=>setPm2Instances(e.target.value)} placeholder="1 or max" style={inp}/></div>
              <div><label style={lbl}>Extra Args</label><input value={pm2Args} onChange={e=>setPm2Args(e.target.value)} placeholder="--watch" style={inp}/></div>
            </div>
            <Toggle checked={pm2Restart} onChange={setPm2Restart} label="Auto-restart process on deploy"/>
          </>)}

          {step===6&&(
            <StepReview
              selectedProject={selectedProject} projects={projects} branch={branch}
              environment={environment} serverId={serverId} serverList={serverList}
              remotePath={remotePath} healthCheckUrl={healthCheckUrl}
              nginxDomain={nginxDomain} nginxPort={nginxPort} nginxRoot={nginxRoot}
              phpVer={phpVer} socketPort={socketPort} wsPort={wsPort} sslCert={sslCert}
              crons={crons} dbHost={dbHost} dbPort={dbPort} dbName={dbName}
              dbUser={dbUser} dbMigrate={dbMigrate} dbMigrateCmd={dbMigrateCmd}
              pm2Name={pm2Name} pm2Interpreter={pm2Interpreter}
              pm2Instances={pm2Instances} pm2Restart={pm2Restart}
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
