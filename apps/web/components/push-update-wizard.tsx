'use client';
import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Rocket, FolderSync, Users, FileCode, Database, Play, CheckCircle, Loader2, Shield, Search, Trash2, XCircle, Terminal, ChevronDown, RotateCcw, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

const inp: React.CSSProperties = { width:'100%',padding:'10px 14px',borderRadius:'10px',boxSizing:'border-box',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface-hover))',color:'rgb(var(--text-primary))',fontSize:'13px',outline:'none',fontFamily:"'JetBrains Mono',monospace",transition:'border-color 200ms' };
const lbl: React.CSSProperties = { display:'block',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px',color:'rgb(var(--text-muted))' };

const STEPS = [
  { id:'source', title:'Source', desc:'Select source version to push', icon:FolderSync, color:'#818CF8' },
  { id:'clients', title:'Clients', desc:'Choose target clients', icon:Users, color:'#3B82F6' },
  { id:'files', title:'Files', desc:'Review files & protected configs', icon:FileCode, color:'#10B981' },
  { id:'database', title:'Database', desc:'Schema diff & ALTER preview', icon:Database, color:'#EC4899' },
  { id:'execute', title:'Execute', desc:'Confirm and push update', icon:Play, color:'#EF4444' },
] as const;

const PROTECTED_FILES = [
  'global_configs.php',
  'application/config/database.php',
  '.env',
  'client/*.enc',
  'client/*.txt',
];

interface ClientItem { id:string; name:string; description?:string|null; repoUrl?:string|null; settings?:any; }

export default function PushUpdateWizard({ onClose, onSuccess }:{ onClose:()=>void; onSuccess:()=>void }) {
  const [step,setStep]=useState(0);
  const [projects,setProjects]=useState<ClientItem[]>([]);
  const [servers,setServers]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [executing,setExecuting]=useState(false);
  const [error,setError]=useState('');
  const [searchQ,setSearchQ]=useState('');

  // Step 1 - Source
  const [sourcePath,setSourcePath]=useState('/var/www/html/winbullSource');
  const [sourceDb,setSourceDb]=useState('winbullSource');
  const [sourceBranch,setSourceBranch]=useState('main');

  // Step 2 - Clients
  const [selectedClients,setSelectedClients]=useState<Set<string>>(new Set());

  // Step 3 - Files (mock for Phase 1 UI)
  const [excludedFiles,setExcludedFiles]=useState<Set<string>>(new Set());
  const mockFiles = [
    'application/controllers/C_rates.php','application/controllers/C_orders.php',
    'application/models/M_rates.php','application/views/admin/dashboard.php',
    'assets/js/app.js','assets/css/style.css','index.php',
    'application/controllers/C_users.php','application/models/M_users.php',
  ];

  // Step 4 - DB
  const [dbSyncEnabled,setDbSyncEnabled]=useState<Set<string>>(new Set());
  const mockDbChanges = [
    { table:'users', type:'ADD COLUMN', sql:'ALTER TABLE `users` ADD COLUMN `otp_verified` TINYINT(1) DEFAULT 0 AFTER `status`;' },
    { table:'orders', type:'ADD COLUMN', sql:'ALTER TABLE `orders` ADD COLUMN `gst_amount` DECIMAL(10,2) DEFAULT 0.00 AFTER `total`;' },
    { table:'rate_alerts', type:'NEW TABLE', sql:'CREATE TABLE `rate_alerts` (\n  `id` INT AUTO_INCREMENT PRIMARY KEY,\n  `user_id` INT NOT NULL,\n  `commodity` VARCHAR(50),\n  `target_price` DECIMAL(10,2),\n  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);' },
  ];

  // Step 5 - Execution
  type LogLine = { time:string; msg:string; type:'info'|'success'|'error'|'warn'|'cmd' };
  type ClientProgress = { status:'waiting'|'running'|'success'|'failed'; steps:{name:string;status:'pending'|'running'|'done'|'error';error?:string}[]; logs:LogLine[]; expanded:boolean };
  const [progress,setProgress]=useState<Record<string,ClientProgress>>({});
  const [expandedClient,setExpandedClient]=useState<string|null>(null);
  const [doneCount,setDoneCount]=useState(0);
  const [failCount,setFailCount]=useState(0);

  useEffect(()=>{
    Promise.all([
      api.getProjects().then((r:any)=>setProjects(((r?.data||r)||[]) as ClientItem[])),
      api.getServers().then((r:any)=>setServers(((r?.data||r)||[]) as any[])),
    ]).finally(()=>setLoading(false));
  },[]);

  const toggleClient=(id:string)=>{
    setSelectedClients(prev=>{
      const n=new Set(prev);
      n.has(id)?n.delete(id):n.add(id);
      return n;
    });
  };
  const selectAll=()=>setSelectedClients(new Set(projects.map(p=>p.id)));
  const selectNone=()=>setSelectedClients(new Set());

  const toggleFile=(f:string)=>{
    setExcludedFiles(prev=>{
      const n=new Set(prev);
      n.has(f)?n.delete(f):n.add(f);
      return n;
    });
  };

  const toggleDbSync=(table:string)=>{
    setDbSyncEnabled(prev=>{
      const n=new Set(prev);
      n.has(table)?n.delete(table):n.add(table);
      return n;
    });
  };

  const ts=()=>new Date().toLocaleTimeString('en-US',{hour12:false});
  const addLog=(cid:string,msg:string,type:LogLine['type']='info')=>{
    setProgress(p=>({...p,[cid]:{...p[cid],logs:[...p[cid].logs,{time:ts(),msg,type}]}}));
  };
  const setStepStatus=(cid:string,idx:number,status:'running'|'done'|'error',error?:string)=>{
    setProgress(p=>{const c={...p[cid]};const steps=[...c.steps];steps[idx]={...steps[idx],status,error};return{...p,[cid]:{...c,steps}};});
  };

  const EXEC_STEPS = [
    {name:'SSH Connect',simulate:async(cid:string,name:string)=>{addLog(cid,`$ ssh ubuntu@server -p 22`,'cmd');await new Promise(r=>setTimeout(r,600));addLog(cid,`Connected to ${name} server`,'success');}},
    {name:'Create Snapshot',simulate:async(cid:string,name:string)=>{addLog(cid,`$ tar -czf /backup/pre-sync-${Date.now()}.tar.gz ${sourcePath}`,'cmd');await new Promise(r=>setTimeout(r,800));addLog(cid,`Snapshot created: ${syncFiles.length} files backed up`,'success');}},
    {name:'Push Files',simulate:async(cid:string,name:string)=>{addLog(cid,`$ rsync -avz --exclude='global_configs.php' ${sourcePath}/ ${name}:/var/www/html/client/`,'cmd');await new Promise(r=>setTimeout(r,1200));for(const f of syncFiles.slice(0,3)){addLog(cid,`  → ${f}`,'info');await new Promise(r=>setTimeout(r,100));}if(syncFiles.length>3)addLog(cid,`  ... and ${syncFiles.length-3} more files`,'info');addLog(cid,`${syncFiles.length} files synced successfully`,'success');}},
    {name:'DB Schema Sync',simulate:async(cid:string)=>{if(dbSyncEnabled.size===0){addLog(cid,'DB sync skipped (no changes selected)','warn');return;}const sqls=mockDbChanges.filter(c=>dbSyncEnabled.has(c.table));for(const s of sqls){addLog(cid,`$ mysql -e "${s.sql.split('\n')[0]}..."`,'cmd');await new Promise(r=>setTimeout(r,400));addLog(cid,`  ✓ ${s.table}: ${s.type}`,'success');}addLog(cid,`${sqls.length} schema changes applied`,'success');}},
    {name:'Health Check',simulate:async(cid:string,name:string)=>{addLog(cid,`$ curl -s -o /dev/null -w "%{http_code}" https://${name.toLowerCase()}.com`,'cmd');await new Promise(r=>setTimeout(r,700));const ok=Math.random()>0.15;if(ok){addLog(cid,'HTTP 200 OK — site is healthy','success');}else{throw new Error(`Health check failed: HTTP 502 Bad Gateway for ${name}`);}}},
    {name:'Set Permissions',simulate:async(cid:string)=>{addLog(cid,`$ chown -R ubuntu:ubuntu /var/www/html/client && chmod -R 755 /var/www/html/client`,'cmd');await new Promise(r=>setTimeout(r,400));addLog(cid,'Permissions set successfully','success');}},
  ];

  const handleExecute=async()=>{
    setExecuting(true);setError('');setDoneCount(0);setFailCount(0);
    const clientIds=Array.from(selectedClients);
    // Init progress for all clients
    const init:Record<string,ClientProgress>={};
    for(const cid of clientIds){
      init[cid]={status:'waiting',steps:EXEC_STEPS.map(s=>({name:s.name,status:'pending' as const})),logs:[],expanded:false};
    }
    setProgress(init);
    if(clientIds.length>0)setExpandedClient(clientIds[0]);

    for(const cid of clientIds){
      const client=projects.find(p=>p.id===cid);
      const name=client?.name||cid;
      setProgress(p=>({...p,[cid]:{...p[cid],status:'running'}}));
      setExpandedClient(cid);
      addLog(cid,`━━━ Starting sync for ${name} ━━━`,'info');
      let failed=false;
      for(let i=0;i<EXEC_STEPS.length;i++){
        setStepStatus(cid,i,'running');
        addLog(cid,`▸ ${EXEC_STEPS[i].name}...`,'info');
        try{
          await EXEC_STEPS[i].simulate(cid,name);
          setStepStatus(cid,i,'done');
        }catch(e:any){
          setStepStatus(cid,i,'error',e.message);
          addLog(cid,`✖ ERROR: ${e.message}`,'error');
          addLog(cid,'Sync aborted — use rollback to restore','error');
          setProgress(p=>({...p,[cid]:{...p[cid],status:'failed'}}));
          setFailCount(c=>c+1);
          failed=true;
          break;
        }
      }
      if(!failed){
        addLog(cid,`✓ ${name} sync completed successfully`,'success');
        setProgress(p=>({...p,[cid]:{...p[cid],status:'success'}}));
        setDoneCount(c=>c+1);
      }
    }
    setExecuting(false);
  };

  const cur=STEPS[step];
  const isLast=step===STEPS.length-1;
  const isFirst=step===0;
  const filteredProjects=searchQ.trim()?projects.filter(p=>p.name.toLowerCase().includes(searchQ.toLowerCase())):projects;
  const syncFiles=mockFiles.filter(f=>!excludedFiles.has(f));

  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.6)'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:'860px',maxHeight:'90vh',display:'flex',flexDirection:'column',borderRadius:'20px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',boxShadow:'0 24px 64px rgba(0,0,0,0.4)',overflow:'hidden'}}>

        {/* Header */}
        <div style={{padding:'20px 28px',borderBottom:'1px solid rgb(var(--border))',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <h2 style={{fontSize:'18px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>Push Source Update</h2>
            <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'4px 0 0'}}>Step {step+1} of {STEPS.length} — {cur.title}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'rgb(var(--text-muted))'}}><X style={{width:'18px',height:'18px'}}/></button>
        </div>

        {/* Step indicators */}
        <div style={{display:'flex',gap:'4px',padding:'16px 28px 0',flexShrink:0}}>
          {STEPS.map((s,i)=>{
            const active=i===step;
            const done=i<step;
            const Icon=s.icon;
            return (
              <button key={s.id} onClick={()=>setStep(i)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',padding:'10px 4px 12px',borderRadius:'12px',border:'none',cursor:'pointer',backgroundColor:active?`${s.color}12`:'transparent',transition:'all 200ms',position:'relative'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:active?s.color:done?`${s.color}20`:'rgba(var(--border),0.5)',transition:'all 200ms'}}>
                  {done?<CheckCircle style={{width:'15px',height:'15px',color:s.color}}/>:<Icon style={{width:'15px',height:'15px',color:active?'#fff':'rgb(var(--text-muted))'}}/>}
                </div>
                <span style={{fontSize:'10px',fontWeight:active?700:500,color:active?s.color:'rgb(var(--text-muted))'}}>{s.title}</span>
                {active&&<div style={{position:'absolute',bottom:0,left:'20%',right:'20%',height:'3px',borderRadius:'2px',backgroundColor:s.color}}/>}
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

          {/* Step 1: Source */}
          {step===0&&(<>
            <div><label style={lbl}>Source Path (server)</label><input value={sourcePath} onChange={e=>setSourcePath(e.target.value)} placeholder="/var/www/html/winbullSource" style={inp}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
              <div><label style={lbl}>Source Database</label><input value={sourceDb} onChange={e=>setSourceDb(e.target.value)} placeholder="winbullSource" style={inp}/></div>
              <div><label style={lbl}>Branch / Version</label><input value={sourceBranch} onChange={e=>setSourceBranch(e.target.value)} placeholder="main" style={inp}/></div>
            </div>
            <div style={{padding:'14px',borderRadius:'10px',backgroundColor:'rgba(129,140,248,0.06)',border:'1px solid rgba(129,140,248,0.15)'}}>
              <p style={{fontSize:'11px',fontWeight:700,color:'#818CF8',margin:'0 0 8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Protected Files (never synced)</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {PROTECTED_FILES.map(f=>(
                  <span key={f} style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 10px',borderRadius:'6px',fontSize:'11px',fontWeight:600,backgroundColor:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)'}}>
                    <Shield style={{width:'10px',height:'10px'}}/>{f}
                  </span>
                ))}
              </div>
            </div>
          </>)}

          {/* Step 2: Clients */}
          {step===1&&(<>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
              <div style={{position:'relative',flex:1}}>
                <Search style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'rgb(var(--text-muted))'}}/>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search clients..." style={{...inp,paddingLeft:'34px',fontFamily:'inherit'}}/>
              </div>
              <button onClick={selectAll} style={{padding:'8px 14px',borderRadius:'8px',border:'1px solid rgba(16,185,129,0.3)',backgroundColor:'rgba(16,185,129,0.08)',color:'#10B981',cursor:'pointer',fontSize:'11px',fontWeight:600,whiteSpace:'nowrap'}}>Select All</button>
              <button onClick={selectNone} style={{padding:'8px 14px',borderRadius:'8px',border:'1px solid rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-muted))',cursor:'pointer',fontSize:'11px',fontWeight:600,whiteSpace:'nowrap'}}>Clear</button>
            </div>
            <p style={{fontSize:'11px',color:'rgb(var(--text-muted))',margin:0}}>{selectedClients.size} of {projects.length} selected</p>
            {loading?<div style={{textAlign:'center',padding:'40px',color:'rgb(var(--text-muted))'}}><Loader2 style={{width:'24px',height:'24px',animation:'spin 1s linear infinite',margin:'0 auto 8px'}}/><p>Loading clients...</p></div>:(
              <div style={{display:'flex',flexDirection:'column',gap:'6px',maxHeight:'340px',overflowY:'auto'}}>
                {filteredProjects.map(p=>{
                  const sel=selectedClients.has(p.id);
                  let serverInfo='';
                  try{const s=typeof p.settings==='string'?JSON.parse(p.settings):p.settings;serverInfo=s?.domain||'';}catch{}
                  return (
                    <div key={p.id} onClick={()=>toggleClient(p.id)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'10px',border:`1px solid ${sel?'rgba(var(--primary),0.4)':'rgb(var(--border))'}`,backgroundColor:sel?'rgba(var(--primary),0.04)':'rgb(var(--surface))',cursor:'pointer',transition:'all 150ms'}}>
                      <div style={{width:'20px',height:'20px',borderRadius:'6px',border:`2px solid ${sel?'rgb(var(--primary))':'rgb(var(--border))'}`,backgroundColor:sel?'rgb(var(--primary))':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 150ms'}}>
                        {sel&&<CheckCircle style={{width:'12px',height:'12px',color:'#fff'}}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',margin:0}}>{p.name}</p>
                        <p style={{fontSize:'11px',color:'rgb(var(--text-muted))',margin:'2px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{serverInfo||p.description||p.repoUrl||'—'}</p>
                      </div>
                    </div>
                  );
                })}
                {filteredProjects.length===0&&<p style={{textAlign:'center',padding:'24px',color:'rgb(var(--text-muted))',fontSize:'13px'}}>No clients found</p>}
              </div>
            )}
          </>)}

          {/* Step 3: Files */}
          {step===2&&(<>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px'}}>
              <p style={{fontSize:'12px',color:'rgb(var(--text-secondary))',margin:0}}>{syncFiles.length} files will be synced · {excludedFiles.size} excluded</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'4px',maxHeight:'320px',overflowY:'auto'}}>
              {mockFiles.map(f=>{
                const excluded=excludedFiles.has(f);
                const isProtected=PROTECTED_FILES.some(pf=>f.includes(pf.replace('*.','')));
                return (
                  <div key={f} onClick={()=>!isProtected&&toggleFile(f)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',borderRadius:'8px',border:'1px solid rgb(var(--border))',backgroundColor:isProtected?'rgba(239,68,68,0.04)':excluded?'rgba(var(--border),0.1)':'rgba(16,185,129,0.04)',cursor:isProtected?'not-allowed':'pointer',opacity:excluded?0.5:1,transition:'all 150ms'}}>
                    <div style={{width:'16px',height:'16px',borderRadius:'4px',border:`2px solid ${isProtected?'#EF4444':excluded?'rgb(var(--border))':'#10B981'}`,backgroundColor:isProtected?'rgba(239,68,68,0.2)':excluded?'transparent':'#10B981',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {!excluded&&!isProtected&&<CheckCircle style={{width:'10px',height:'10px',color:'#fff'}}/>}
                      {isProtected&&<Shield style={{width:'10px',height:'10px',color:'#EF4444'}}/>}
                    </div>
                    <code style={{fontSize:'12px',color:isProtected?'#EF4444':'rgb(var(--text-secondary))',fontFamily:"'JetBrains Mono',monospace",flex:1}}>{f}</code>
                    {isProtected&&<span style={{fontSize:'10px',fontWeight:600,color:'#EF4444',padding:'2px 6px',borderRadius:'4px',backgroundColor:'rgba(239,68,68,0.08)'}}>PROTECTED</span>}
                  </div>
                );
              })}
            </div>
          </>)}

          {/* Step 4: Database */}
          {step===3&&(<>
            <div style={{padding:'12px 14px',borderRadius:'10px',backgroundColor:'rgba(236,72,153,0.06)',border:'1px solid rgba(236,72,153,0.15)',marginBottom:'4px'}}>
              <p style={{fontSize:'11px',fontWeight:600,color:'#EC4899',margin:0}}>Source DB: <code style={{fontFamily:"'JetBrains Mono',monospace"}}>{sourceDb}</code> → Compare with each client DB</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {mockDbChanges.map((ch,i)=>{
                const enabled=dbSyncEnabled.has(ch.table);
                return (
                  <div key={i} style={{borderRadius:'10px',border:'1px solid rgb(var(--border))',overflow:'hidden'}}>
                    <div onClick={()=>toggleDbSync(ch.table)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',cursor:'pointer',backgroundColor:enabled?'rgba(16,185,129,0.04)':'rgb(var(--surface))'}}>
                      <div style={{width:'18px',height:'18px',borderRadius:'5px',border:`2px solid ${enabled?'#10B981':'rgb(var(--border))'}`,backgroundColor:enabled?'#10B981':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {enabled&&<CheckCircle style={{width:'10px',height:'10px',color:'#fff'}}/>}
                      </div>
                      <span style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',flex:1}}>{ch.table}</span>
                      <span style={{fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'4px',backgroundColor:ch.type==='NEW TABLE'?'rgba(129,140,248,0.1)':'rgba(245,158,11,0.1)',color:ch.type==='NEW TABLE'?'#818CF8':'#F59E0B'}}>{ch.type}</span>
                    </div>
                    <pre style={{margin:0,padding:'10px 14px',fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",color:'#c9d1d9',backgroundColor:'#0d1117',borderTop:'1px solid #21262d',overflowX:'auto',lineHeight:1.6}}>{ch.sql}</pre>
                  </div>
                );
              })}
            </div>
          </>)}

          {/* Step 5: Execute */}
          {step===4&&(<>
            {/* Summary bar */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'10px'}}>
              <div style={{textAlign:'center',padding:'12px',borderRadius:'10px',backgroundColor:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)'}}><p style={{fontSize:'22px',fontWeight:700,color:'#3B82F6',margin:0}}>{selectedClients.size}</p><p style={{fontSize:'10px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>Clients</p></div>
              <div style={{textAlign:'center',padding:'12px',borderRadius:'10px',backgroundColor:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)'}}><p style={{fontSize:'22px',fontWeight:700,color:'#10B981',margin:0}}>{doneCount}</p><p style={{fontSize:'10px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>Success</p></div>
              <div style={{textAlign:'center',padding:'12px',borderRadius:'10px',backgroundColor:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)'}}><p style={{fontSize:'22px',fontWeight:700,color:'#EF4444',margin:0}}>{failCount}</p><p style={{fontSize:'10px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>Failed</p></div>
              <div style={{textAlign:'center',padding:'12px',borderRadius:'10px',backgroundColor:'rgba(var(--primary),0.06)',border:'1px solid rgba(var(--primary),0.15)'}}><p style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--primary))',margin:0}}>{syncFiles.length}</p><p style={{fontSize:'10px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>Files</p></div>
            </div>

            {/* Client execution list */}
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              {projects.filter(p=>selectedClients.has(p.id)).map(p=>{
                const pr=progress[p.id];
                const isExpanded=expandedClient===p.id;
                const statusIcon=pr?.status==='running'?<Loader2 style={{width:'14px',height:'14px',color:'#3B82F6',animation:'spin 1s linear infinite'}}/>:pr?.status==='success'?<CheckCircle style={{width:'14px',height:'14px',color:'#10B981'}}/>:pr?.status==='failed'?<XCircle style={{width:'14px',height:'14px',color:'#EF4444'}}/>:<div style={{width:'14px',height:'14px',borderRadius:'50%',border:'2px solid rgb(var(--border))'}}/>;
                return (
                  <div key={p.id} style={{borderRadius:'10px',border:`1px solid ${pr?.status==='failed'?'rgba(239,68,68,0.3)':pr?.status==='success'?'rgba(16,185,129,0.2)':'rgb(var(--border))'}`,overflow:'hidden'}}>
                    {/* Client header */}
                    <div onClick={()=>setExpandedClient(isExpanded?null:p.id)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',cursor:'pointer',backgroundColor:pr?.status==='failed'?'rgba(239,68,68,0.04)':pr?.status==='success'?'rgba(16,185,129,0.03)':'rgb(var(--surface))',transition:'background-color 150ms'}}>
                      {statusIcon}
                      <span style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',flex:1}}>{p.name}</span>
                      {/* Mini step indicators */}
                      {pr&&<div style={{display:'flex',gap:'3px',marginRight:'8px'}}>{pr.steps.map((s,i)=>(<div key={i} title={s.name} style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:s.status==='done'?'#10B981':s.status==='error'?'#EF4444':s.status==='running'?'#3B82F6':'rgba(var(--border),0.5)',transition:'all 200ms'}}/>))}</div>}
                      <ChevronDown style={{width:'14px',height:'14px',color:'rgb(var(--text-muted))',transform:isExpanded?'rotate(180deg)':'none',transition:'transform 200ms'}}/>
                    </div>

                    {/* Expanded: steps + terminal */}
                    {isExpanded&&pr&&(
                      <div style={{borderTop:'1px solid rgb(var(--border))'}}>
                        {/* Step progress bar */}
                        <div style={{display:'flex',gap:'0',padding:'8px 14px',backgroundColor:'rgba(var(--border),0.03)'}}>
                          {pr.steps.map((s,i)=>{
                            const color=s.status==='done'?'#10B981':s.status==='error'?'#EF4444':s.status==='running'?'#3B82F6':'rgb(var(--text-muted))';
                            return (
                              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',position:'relative'}}>
                                <div style={{display:'flex',alignItems:'center',width:'100%'}}>
                                  {i>0&&<div style={{flex:1,height:'2px',backgroundColor:pr.steps[i-1].status==='done'?'#10B981':'rgba(var(--border),0.5)'}}/>}
                                  <div style={{width:'18px',height:'18px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:s.status==='done'?'#10B981':s.status==='error'?'#EF4444':s.status==='running'?'#3B82F6':'rgba(var(--border),0.3)',flexShrink:0,transition:'all 300ms'}}>
                                    {s.status==='done'&&<CheckCircle style={{width:'10px',height:'10px',color:'#fff'}}/>}
                                    {s.status==='error'&&<XCircle style={{width:'10px',height:'10px',color:'#fff'}}/>}
                                    {s.status==='running'&&<Loader2 style={{width:'10px',height:'10px',color:'#fff',animation:'spin 1s linear infinite'}}/>}
                                  </div>
                                  {i<pr.steps.length-1&&<div style={{flex:1,height:'2px',backgroundColor:s.status==='done'?'#10B981':'rgba(var(--border),0.5)'}}/>}
                                </div>
                                <span style={{fontSize:'8px',fontWeight:600,color,textAlign:'center',lineHeight:1.2}}>{s.name}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Terminal log */}
                        <div style={{maxHeight:'200px',overflowY:'auto',backgroundColor:'#0d1117',padding:'10px 14px',fontFamily:"'JetBrains Mono','Fira Code',monospace",fontSize:'11px',lineHeight:1.7}}>
                          {pr.logs.length===0&&<span style={{color:'#484f58'}}>Waiting to start...</span>}
                          {pr.logs.map((l,i)=>(
                            <div key={i} style={{display:'flex',gap:'8px'}}>
                              <span style={{color:'#484f58',flexShrink:0}}>{l.time}</span>
                              <span style={{color:l.type==='error'?'#f85149':l.type==='success'?'#3fb950':l.type==='warn'?'#d29922':l.type==='cmd'?'#79c0ff':'#c9d1d9',fontWeight:l.type==='error'?700:400}}>{l.msg}</span>
                            </div>
                          ))}
                        </div>

                        {/* Error banner if failed */}
                        {pr.status==='failed'&&(
                          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',backgroundColor:'rgba(239,68,68,0.08)',borderTop:'1px solid rgba(239,68,68,0.2)'}}>
                            <AlertTriangle style={{width:'14px',height:'14px',color:'#EF4444',flexShrink:0}}/>
                            <span style={{fontSize:'12px',fontWeight:600,color:'#EF4444',flex:1}}>{pr.steps.find(s=>s.error)?.error||'Sync failed'}</span>
                            <button style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 12px',borderRadius:'6px',border:'1px solid rgba(239,68,68,0.3)',backgroundColor:'rgba(239,68,68,0.06)',color:'#EF4444',cursor:'pointer',fontSize:'11px',fontWeight:600}}><RotateCcw style={{width:'10px',height:'10px'}}/>Rollback</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>)}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 28px',borderTop:'1px solid rgb(var(--border))',display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
          {error&&<div style={{flex:1,padding:'8px 12px',borderRadius:'8px',backgroundColor:'rgba(239,68,68,0.1)',color:'#EF4444',fontSize:'12px'}}>{error}</div>}
          <div style={{flex:error?0:1}}/>
          {!isFirst&&<button onClick={()=>setStep(s=>s-1)} disabled={executing} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 20px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-secondary))',cursor:'pointer',fontSize:'13px',fontWeight:600}}><ChevronLeft style={{width:'14px',height:'14px'}}/>Back</button>}
          {isLast?(
            <button onClick={handleExecute} disabled={executing||selectedClients.size===0} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 28px',borderRadius:'10px',border:'none',cursor:executing?'wait':'pointer',fontSize:'14px',fontWeight:600,color:'#fff',background:'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',opacity:executing||selectedClients.size===0?0.6:1,boxShadow:'0 4px 16px rgba(var(--primary),0.3)'}}>
              {executing?<Loader2 style={{width:'16px',height:'16px',animation:'spin 1s linear infinite'}}/>:<Rocket style={{width:'16px',height:'16px'}}/>}
              {executing?'Pushing...':'🚀 Push Update'}
            </button>
          ):(
            <button onClick={()=>setStep(s=>s+1)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 24px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,color:'#fff',backgroundColor:cur.color,boxShadow:`0 4px 12px ${cur.color}40`}}>
              Next<ChevronRight style={{width:'14px',height:'14px'}}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
