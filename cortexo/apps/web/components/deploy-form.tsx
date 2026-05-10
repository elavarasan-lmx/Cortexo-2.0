'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, X, Plus, Minus, CheckCircle, Server, Trash2, ChevronRight, ChevronLeft, Rocket, GitBranch, FolderPlus, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import { inp, lbl, ta, g2, g3, STEPS, Toggle, octalToRwx } from './deploy/shared';
import type { FolderEntry, DeployFormInitialData } from './deploy/shared';
import DeployTerminal from './deploy/deploy-terminal';
import StepReview from './deploy/step-review';
import { useModal } from './modal-provider';
import { useToastStore } from '@/lib/toast-store';

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
  const [clientGitProfiles,setClientGitProfiles] = useState<any[]>([]);
  const sourceProfilesRef = useRef<any[]>([]);
  const clientGitProfilesRef = useRef<any[]>([]);
  const [selectedSourceTemplate,setSelectedSourceTemplate] = useState('');
  const [showNewClientGit,setShowNewClientGit] = useState(false);
  const [newClientGit,setNewClientGit] = useState({name:'',repoUrl:'',branch:'main',templatePath:'',notes:''});
  const [savingClientGit,setSavingClientGit] = useState(false);
  const [selectedClientGit,setSelectedClientGit] = useState('');
  const [sourceDbInfo,setSourceDbInfo] = useState<{name:string;host:string;port:string;databaseName:string;username:string;password?:string}|null>(null);
  const [sourceTemplateInfo,setSourceTemplateInfo] = useState<{name:string;repoUrl:string;branch:string}|null>(null);
  const [clientGitInfo,setClientGitInfo] = useState<{name:string;repoUrl:string;branch:string;templatePath:string}|null>(null);

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
  const [pm2Restart]=useState(true);
  const [pm2Args,setPm2Args]=useState(initialData?.pm2Args || '');

  const [preDeployCmd,setPreDeployCmd]=useState(initialData?.preDeployCmd || '');
  const [postDeployCmd,setPostDeployCmd]=useState(initialData?.postDeployCmd || '');
  const [healthCheckUrl,setHealthCheckUrl]=useState(initialData?.healthCheckUrl || '');
  const [notifyOnComplete]=useState(true);
  const [truncateLogs]=useState(true);

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
        // pm2Restart is always true
        if (d.pm2Args !== undefined) setPm2Args(d.pm2Args);
        if (d.preDeployCmd !== undefined) setPreDeployCmd(d.preDeployCmd);
        if (d.postDeployCmd !== undefined) setPostDeployCmd(d.postDeployCmd);
        if (d.healthCheckUrl !== undefined) setHealthCheckUrl(d.healthCheckUrl);
        // notifyOnComplete is always true
        // truncateLogs is always true
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
  const toast = useToastStore();

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
    api.getSourceProfiles().then((r:any)=>{ const d=(r?.data||r) as any[]; setSourceProfiles(d); sourceProfilesRef.current=d; if(d.length>0){ setSourceTemplateInfo({name:d[0].name,repoUrl:d[0].repoUrl||'',branch:d[0].branch||'main'}); } }).catch(()=>{});
    api.getDbProfiles().then((r:any)=>setDbProfiles((r?.data||r) as any[])).catch(()=>{});
    // Auto-resolve Source DB info from first available profile (same for all clients)
    api.getDbProfiles().then((r2:any)=>{ const d2=(r2?.data||r2) as any[]; if(d2.length>0){ setSourceDbInfo({name:d2[0].name,host:d2[0].host,port:String(d2[0].port||3306),databaseName:d2[0].databaseName||'',username:d2[0].username||'',password:d2[0].password||undefined}); } }).catch(()=>{});
    api.getClientGitProfiles().then((r:any)=>{
      const d=(r?.data||r) as any[];
      setClientGitProfiles(d);
      clientGitProfilesRef.current=d;
      // If a project was restored from draft, trigger resolve to sync client git
      const saved = localStorage.getItem('cortexo_deploy_form');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (draft.selectedProject) {
            handleProjectChange(draft.selectedProject);
          }
        } catch {}
      }
    }).catch(()=>{});
  },[]);

  const handleSourceProfile = (id:string) => {
    setSelectedSourceTemplate(id);
    const p = sourceProfiles.find((s:any)=>s.id===id);
    if(!p) return;
    if(p.branch) setBranch(p.branch);
    // Pre-fill new client git form with template values
    setNewClientGit(prev => ({...prev, repoUrl: p.repoUrl || '', branch: p.branch || 'main'}));
  };

  const handleClientGitSelect = (id:string) => {
    setSelectedClientGit(id);
    const p = clientGitProfiles.find((s:any)=>s.id===id);
    if(!p) return;
    if(p.branch) setBranch(p.branch);
    if(p.templatePath) setRemotePath(p.templatePath);
  };

  const handleSaveNewClientGit = async () => {
    if(!newClientGit.name || !newClientGit.repoUrl) return;
    setSavingClientGit(true);
    try {
      const res = await api.createClientGitProfile(newClientGit) as any;
      const created = res?.data || res;
      setClientGitProfiles(prev => { const next = [...prev, created]; clientGitProfilesRef.current = next; return next; });
      setSelectedClientGit(created.id);
      if(created.branch) setBranch(created.branch);
      if(created.templatePath) setRemotePath(created.templatePath);
      setShowNewClientGit(false);
      setNewClientGit({name:'',repoUrl:'',branch:'main',templatePath:'',notes:''});
      toast.success('Client Git Created', `Profile "${created.name}" saved.`);
    } catch (e: any) {
      toast.error('Save Failed', e.message || 'Could not create client git profile.');
    }
    setSavingClientGit(false);
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

      // Auto-match Source Template by project repoUrl or settings.deploy.sourceProfileId
      // Use refs to get latest profiles (avoids stale closure from async fetch)
      const latestSP = sourceProfilesRef.current;
      const latestCG = clientGitProfilesRef.current;
      const projRepo = (project.repoUrl || '').replace(/\.git$/, '').toLowerCase();
      // Extract org/repo slug and just org name for matching
      const projSlugMatch = projRepo.match(/[:/]([^/]+\/[^/]+?)$/);
      const projRepoSlug = projSlugMatch ? projSlugMatch[1] : '';
      const projOrg = projRepoSlug.split('/')[0] || '';

      if (deploy.sourceProfileId && latestSP.find((sp:any) => sp.id === deploy.sourceProfileId)) {
        setSelectedSourceTemplate(deploy.sourceProfileId);
        const sp = latestSP.find((s:any) => s.id === deploy.sourceProfileId);
        if (sp?.branch) setBranch(sp.branch);
        setNewClientGit(prev => ({...prev, repoUrl: sp?.repoUrl || '', branch: sp?.branch || 'main'}));
      } else if (projRepo && latestSP.length > 0) {
        // Try exact repo match first, then same-org match
        const exactMatch = latestSP.find((sp:any) => {
          const spUrl = (sp.repoUrl || '').replace(/\.git$/, '').toLowerCase();
          const spSlugMatch = spUrl.match(/[:/]([^/]+\/[^/]+?)$/);
          const spSlug = spSlugMatch ? spSlugMatch[1] : '';
          return spSlug && projRepoSlug && spSlug === projRepoSlug;
        });
        const orgMatch = !exactMatch && projOrg ? latestSP.find((sp:any) => {
          const spUrl = (sp.repoUrl || '').replace(/\.git$/, '').toLowerCase();
          const spSlugMatch = spUrl.match(/[:/]([^/]+\/[^/]+?)$/);
          const spOrg = spSlugMatch ? spSlugMatch[1].split('/')[0] : '';
          return spOrg && spOrg === projOrg;
        }) : null;
        const matched = exactMatch || orgMatch;
        if (matched) {
          setSelectedSourceTemplate(matched.id);
          setNewClientGit(prev => ({...prev, repoUrl: matched.repoUrl || '', branch: matched.branch || 'main'}));
        }
      }

      // Auto-match Client Git by project repoUrl, settings.deploy.clientGitProfileId, or remotePath
      const projPath = deploy.serverPath || info.remotePath || '';
      let clientGitMatched = false;
      if (deploy.clientGitProfileId && latestCG.find((cg:any) => cg.id === deploy.clientGitProfileId)) {
        setSelectedClientGit(deploy.clientGitProfileId);
        const cg = latestCG.find((c:any) => c.id === deploy.clientGitProfileId);
        if (cg?.branch) setBranch(cg.branch);
        clientGitMatched = true;
      } else if ((projRepo || projPath) && latestCG.length > 0) {
        // Try exact repo match, then org match, then path match
        const exactMatch = latestCG.find((cg:any) => {
          const cgUrl = (cg.repoUrl || '').replace(/\.git$/, '').toLowerCase();
          const cgSlugMatch = cgUrl.match(/[:/]([^/]+\/[^/]+?)$/);
          const cgSlug = cgSlugMatch ? cgSlugMatch[1] : '';
          return cgSlug && projRepoSlug && cgSlug === projRepoSlug;
        });
        const orgMatch = !exactMatch && projOrg ? latestCG.find((cg:any) => {
          const cgUrl = (cg.repoUrl || '').replace(/\.git$/, '').toLowerCase();
          const cgSlugMatch = cgUrl.match(/[:/]([^/]+\/[^/]+?)$/);
          const cgOrg = cgSlugMatch ? cgSlugMatch[1].split('/')[0] : '';
          return cgOrg && cgOrg === projOrg;
        }) : null;
        const pathMatch = !exactMatch && !orgMatch && projPath ? latestCG.find((cg:any) => {
          const cgPath = (cg.templatePath || '').toLowerCase();
          return cgPath && cgPath === projPath.toLowerCase();
        }) : null;
        const matched = exactMatch || orgMatch || pathMatch;
        if (matched) {
          setSelectedClientGit(matched.id);
          if (matched.templatePath && !projPath) setRemotePath(matched.templatePath);
          clientGitMatched = true;
          setClientGitInfo({name:matched.name||'',repoUrl:matched.repoUrl||'',branch:matched.branch||'main',templatePath:matched.templatePath||''});
        }
      }

      // Fallback: if no client git profile matched, auto-create one from the project's repo info
      // so the user doesn't have to manually enter it every time
      if (!clientGitMatched && project.repoUrl) {
        const repoUrl = project.repoUrl;
        const repoSlug = repoUrl.replace(/\.git$/, '').match(/[:/]([^/]+\/[^/]+?)$/)?.[1] || '';
        const clientName = project.name || repoSlug.split('/').pop() || '';
        const profileData = {
          name: clientName,
          repoUrl: repoUrl,
          branch: info.branch || project.defaultBranch || 'main',
          templatePath: projPath,
          notes: `Auto-created from project "${project.name}"`,
        };
        try {
          const created = await api.createClientGitProfile(profileData) as any;
          const profile = created?.data || created;
          if (profile?.id) {
            setClientGitProfiles(prev => { const next = [...prev, profile]; clientGitProfilesRef.current = next; return next; });
            setSelectedClientGit(profile.id);
            setClientGitInfo({name:profile.name||clientName,repoUrl:profile.repoUrl||repoUrl,branch:profile.branch||'main',templatePath:profile.templatePath||projPath});
            toast.success('Client Git Synced', `Profile "${clientName}" auto-created from project.`);
          }
        } catch {
          // If auto-create fails, fall back to filling the form manually
          setNewClientGit(prev => ({
            ...prev,
            name: prev.name || clientName,
            repoUrl: prev.repoUrl || repoUrl,
            branch: prev.branch || info.branch || project.defaultBranch || 'main',
            templatePath: prev.templatePath || projPath,
          }));
          setShowNewClientGit(true);
        }
      }

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

      // Step 4: Client Database — from project settings
      if(db.host) setDbHost(db.host);
      else if(info.dbHost) setDbHost(info.dbHost);
      if(db.port) setDbPort(db.port);
      if(db.name) setDbName(db.name);
      else if(info.dbName) setDbName(info.dbName);
      if(db.user) setDbUser(db.user);
      if(db.password) setDbPass(db.password);

      // Source DB — auto-resolve from first db profile (same for all clients)
      if(!sourceDbInfo && dbProfiles.length > 0) {
        const src = dbProfiles[0];
        setSourceDbInfo({name:src.name,host:src.host,port:String(src.port||3306),databaseName:src.databaseName||'',username:src.username||'',password:(src as any).password||undefined});
      }


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
        sourceDatabase: sourceDbInfo ? { host:sourceDbInfo.host, port:sourceDbInfo.port, name:sourceDbInfo.databaseName, user:sourceDbInfo.username, password:sourceDbInfo.password } : undefined,
        pm2: { name:pm2Name, script:pm2Script, interpreter:pm2Interpreter, instances:pm2Instances, autoRestart:pm2Restart, args:pm2Args },
        sourceTemplate: sourceTemplateInfo ? { repoUrl:sourceTemplateInfo.repoUrl, branch:sourceTemplateInfo.branch } : undefined,
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
            {sourceTemplateInfo && (
              <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.15)'}}>
                <label style={{...lbl,color:'#818CF8',margin:'0 0 10px',display:'flex',alignItems:'center',gap:'6px'}}><Copy style={{width:'12px',height:'12px'}}/> SOURCE TEMPLATE <span style={{fontWeight:400,fontSize:'10px',color:'rgb(var(--text-muted))',textTransform:'none'}}>Same for all clients</span></label>
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px'}}>
                    <span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>Name</span>
                    <span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{sourceTemplateInfo.name}</span>
                  </div>
                  <div style={{padding:'8px 12px',borderRadius:'8px',backgroundColor:'rgba(99,102,241,0.08)',fontSize:'11px',color:'rgb(var(--text-muted))',fontFamily:"'JetBrains Mono',monospace",display:'flex',flexDirection:'column',gap:'4px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}><GitBranch style={{width:'11px',height:'11px',color:'#818CF8',flexShrink:0}}/><span style={{color:'#818CF8',fontWeight:600}}>{sourceTemplateInfo.branch}</span></div>
                    <div style={{wordBreak:'break-all',lineHeight:1.5,paddingLeft:'17px'}}>{sourceTemplateInfo.repoUrl}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Git — read-only info from project */}
            {clientGitInfo && (
              <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.15)'}}>
                <label style={{...lbl,color:'#10B981',margin:'0 0 10px',display:'flex',alignItems:'center',gap:'6px'}}><FolderPlus style={{width:'12px',height:'12px'}}/> CLIENT GIT <span style={{fontWeight:400,fontSize:'10px',color:'rgb(var(--text-muted))',textTransform:'none'}}>From project settings</span></label>
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px'}}>
                    <span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>Name</span>
                    <span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{clientGitInfo.name}</span>
                  </div>
                  <div style={{padding:'8px 12px',borderRadius:'8px',backgroundColor:'rgba(16,185,129,0.08)',fontSize:'11px',color:'rgb(var(--text-muted))',fontFamily:"'JetBrains Mono',monospace",display:'flex',flexDirection:'column',gap:'4px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}><GitBranch style={{width:'11px',height:'11px',color:'#10B981',flexShrink:0}}/><span style={{color:'#10B981',fontWeight:600}}>{clientGitInfo.branch}</span></div>
                    <div style={{wordBreak:'break-all',lineHeight:1.5,paddingLeft:'17px'}}>{clientGitInfo.repoUrl}</div>
                    {clientGitInfo.templatePath && <div style={{paddingLeft:'17px',color:'rgb(var(--text-primary))',fontWeight:500}}>{clientGitInfo.templatePath}</div>}
                  </div>
                </div>
              </div>
            )}
            {!clientGitInfo && !resolving && selectedProject && (
              <div style={{padding:'12px 16px',borderRadius:'12px',backgroundColor:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',fontSize:'11px',color:'#EF4444',fontWeight:600}}>
                ⚠️ No Client Git found for this project. Add repository info in project settings.
              </div>
            )}

            {/* Deploy Info — read-only from project settings */}
            <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(251,191,36,0.04)',border:'1px solid rgba(251,191,36,0.12)'}}>
              <label style={{...lbl,color:'#FBBF24',margin:'0 0 10px',display:'block'}}>⚙️ DEPLOY CONFIG <span style={{fontWeight:400,fontSize:'10px',color:'rgb(var(--text-muted))',textTransform:'none'}}>Auto-resolved from project</span></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',fontSize:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Branch</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{branch || '—'}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Env</span><span style={{color:'#FBBF24',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600,textTransform:'capitalize'}}>{environment}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Server</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{serverList.find((s:any)=>s.id===serverId)?.name || '—'} {serverId ? `(${serverList.find((s:any)=>s.id===serverId)?.privateIp || ''})` : ''}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Health</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',wordBreak:'break-all'}}>{healthCheckUrl || '—'}</span></div>
              </div>
              <div style={{marginTop:'8px',display:'flex',alignItems:'center',gap:'6px',fontSize:'12px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Path</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',wordBreak:'break-all'}}>{remotePath || '—'}</span></div>
            </div>

            {/* Log Cleanup Preview — always active */}
            <div style={{marginTop:'4px'}}>
              <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#F59E0B',margin:'0 0 6px',display:'flex',alignItems:'center',gap:'6px'}}>
                ⚡ Log Cleanup <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none',letterSpacing:0}}>— auto-executed on every deploy</span>
              </p>
              <pre style={{margin:0,padding:'12px 14px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.2)',border:'1px solid rgba(245,158,11,0.12)',fontSize:'10px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-muted))',overflowX:'auto',whiteSpace:'pre-wrap',lineHeight:1.6,maxHeight:'180px',overflow:'auto'}}>
{`> ${remotePath || '<path>'}/lmxtrade/winbullliteapi/storage/logs/lumen.log
find ${remotePath || '<path>'}/application/logs -name 'log-*.php' -exec truncate -s 0 {} +
find ${remotePath || '<path>'}/admin/application/logs -name 'log-*.php' -exec truncate -s 0 {} +
rm -rf ${remotePath || '<path>'}/lmxtrade/winbullliteapi/storage/framework/{cache,sessions,views}/*
pm2 flush ${(remotePath || '').split('/').pop() || '<slug>'}-ws
pm2 flush ${(remotePath || '').split('/').pop() || '<slug>'}-socketio`}
              </pre>
            </div>
          </>)}

          {step===1&&(<>
            {/* Nginx Config — read-only from project settings */}
            <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)'}}>
              <label style={{...lbl,color:'#3B82F6',margin:'0 0 10px',display:'block'}}>🌐 NGINX CONFIG <span style={{fontWeight:400,fontSize:'10px',color:'rgb(var(--text-muted))',textTransform:'none'}}>Auto-resolved from project</span></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',fontSize:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Domain</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600,wordBreak:'break-all'}}>{nginxDomain || '—'}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Port</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{nginxPort || '80'}</span></div>
              </div>
              <div style={{marginTop:'8px',display:'flex',alignItems:'center',gap:'6px',fontSize:'12px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'70px'}}>Root</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',wordBreak:'break-all'}}>{nginxRoot || '—'}</span></div>
            </div>

            {/* Socket Proxies — read-only */}
            <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(16,185,129,0.04)',border:'1px solid rgba(16,185,129,0.12)'}}>
              <label style={{...lbl,color:'#10B981',margin:'0 0 10px',display:'block'}}>🔌 SOCKET PROXIES <span style={{fontWeight:400,fontSize:'10px',color:'rgb(var(--text-muted))',textTransform:'none'}}>Port mapping</span></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',fontSize:'12px'}}>
                <div style={{display:'flex',flexDirection:'column',gap:'2px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase'}}>Socket</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{socketPort || '—'}</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:'2px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase'}}>Rate</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{rateSocketPort || '—'}</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:'2px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase'}}>WS</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{wsPort || '—'}</span></div>
              </div>
            </div>

            {/* SSL — read-only */}
            {(sslCert || sslKey) && (
              <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(251,191,36,0.04)',border:'1px solid rgba(251,191,36,0.12)'}}>
                <label style={{...lbl,color:'#FBBF24',margin:'0 0 10px',display:'block'}}>🔒 SSL</label>
                <div style={{display:'flex',flexDirection:'column',gap:'4px',fontSize:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>Cert</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',wordBreak:'break-all'}}>{sslCert || '—'}</span></div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>Key</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',wordBreak:'break-all'}}>{sslKey || '—'}</span></div>
                </div>
              </div>
            )}

            {/* Nginx Config Preview */}
            {(nginxDomain || nginxRoot) && (
              <div>
                <p style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#A855F7',margin:'0 0 6px',display:'flex',alignItems:'center',gap:'6px'}}>
                  ⚡ Nginx Config Preview
                  <span style={{fontSize:'9px',fontWeight:500,color:'rgb(var(--text-muted))',textTransform:'none',letterSpacing:0}}>— auto-generated on deploy</span>
                </p>
                <pre style={{margin:0,padding:'12px 14px',borderRadius:'8px',backgroundColor:'rgba(0,0,0,0.2)',border:'1px solid rgba(168,85,247,0.15)',fontSize:'10px',fontFamily:"'JetBrains Mono',monospace",color:'rgb(var(--text-muted))',overflowX:'auto',whiteSpace:'pre-wrap',lineHeight:1.6,maxHeight:'250px',overflow:'auto'}}>
{`server {
    listen ${nginxPort || '80'};
    server_name ${nginxDomain || '<domain>'};

    root ${nginxRoot || '<document-root>'};
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
}`}
                </pre>
              </div>
            )}
          </>)}

          {step===2&&(<>
            {/* Source DB — read-only info from Base Templates */}
            {sourceDbInfo && (
              <div style={{padding:'14px 16px',borderRadius:'10px',backgroundColor:'rgba(168,85,247,0.06)',border:'1px solid rgba(168,85,247,0.15)'}}>
                <label style={{...lbl,color:'#A855F7',margin:'0 0 10px'}}>📦 SOURCE DB <span style={{fontWeight:400,fontSize:'10px',color:'rgb(var(--text-muted))',textTransform:'none'}}>Template database (clone from here)</span></label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 16px',fontSize:'12px'}}>
                  <div style={{display:'flex',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>Name</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{sourceDbInfo.name}</span></div>
                  <div style={{display:'flex',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>DB</span><span style={{color:'#A855F7',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{sourceDbInfo.databaseName || '—'}</span></div>
                  <div style={{display:'flex',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>Host</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',wordBreak:'break-all'}}>{sourceDbInfo.host}</span></div>
                  <div style={{display:'flex',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'40px'}}>User</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{sourceDbInfo.username} • Port {sourceDbInfo.port}</span></div>
                </div>
              </div>
            )}

            {/* Client DB — read-only from project settings */}
            <div style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:'rgba(34,211,238,0.04)',border:'1px solid rgba(34,211,238,0.12)'}}>
              <label style={{...lbl,color:'#22D3EE',margin:'0 0 10px',display:'block'}}>🗄️ CLIENT DB <span style={{fontWeight:400,fontSize:'10px',color:'rgb(var(--text-muted))',textTransform:'none'}}>Auto-resolved from project</span></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',fontSize:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'60px'}}>Host</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{dbHost || '—'}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'60px'}}>Port</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{dbPort || '3306'}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'60px'}}>DB Name</span><span style={{color:'#22D3EE',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px',fontWeight:600}}>{dbName || '—'}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'60px'}}>User</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{dbUser || '—'}</span></div>
              </div>
              <div style={{marginTop:'8px',display:'flex',alignItems:'center',gap:'6px',fontSize:'12px'}}><span style={{color:'rgb(var(--text-muted))',fontWeight:600,fontSize:'10px',textTransform:'uppercase',minWidth:'60px'}}>Pass</span><span style={{color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{dbPass ? '••••••••' : '—'}</span></div>
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
-- Phase 1: Create Client Database
-- ========================
CREATE DATABASE IF NOT EXISTS \`${dbName}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================
-- Phase 2: Clone from Source DB
-- ========================
-- mysqldump -h ${sourceDbInfo?.host || '<source_host>'} -u ${sourceDbInfo?.username || '<source_user>'} ${sourceDbInfo?.databaseName || '<source_db>'} | mysql -h ${dbHost || '<client_host>'} -u ${dbUser || '<client_user>'} ${dbName}

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
              phpVer={phpVer} socketPort={socketPort} rateSocketPort={rateSocketPort} wsPort={wsPort} sslCert={sslCert}
              dbHost={dbHost} dbPort={dbPort} dbName={dbName}
              dbUser={dbUser} dbMigrate={dbMigrate} dbMigrateCmd={dbMigrateCmd}
              sourceDbInfo={sourceDbInfo}
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
