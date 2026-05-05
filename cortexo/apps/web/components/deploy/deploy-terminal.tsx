'use client';
import React, { useRef, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Rocket, Terminal, Clock, X } from 'lucide-react';

interface DeployLogEntry {
  step: string;
  command?: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  timestamp: string;
}

interface DeployResult {
  success: boolean;
  status: string;
  totalDurationMs: number;
  error?: string;
  commitSha?: string;
}

interface DeployTerminalProps {
  deployLogs: DeployLogEntry[];
  deployResult: DeployResult | null;
  isRunning: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEP_LABELS: Record<string, string> = {
  connect: 'Connect',
  verify_path: 'Verify Path',
  pre_deploy: 'Pre-Deploy',
  git_pull: 'Git Pull',
  post_deploy: 'Post-Deploy',
  health_check: 'Health Check',
  commit_sha: 'Commit SHA',
};

export default function DeployTerminal({ deployLogs, deployResult, isRunning, onClose, onSuccess }: DeployTerminalProps) {
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [deployLogs]);

  return (
    <>
      {/* Header */}
      <div style={{padding:'20px 28px',borderBottom:'1px solid rgb(var(--border))',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div>
          <h2 style={{fontSize:'18px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>
            <Terminal style={{width:'18px',height:'18px',display:'inline',verticalAlign:'middle',marginRight:'8px',color:'#10B981'}}/>Live Deploy Terminal
          </h2>
        </div>
        <button onClick={()=>{onSuccess();}} style={{background:'none',border:'none',cursor:'pointer',color:'rgb(var(--text-muted))'}}><X style={{width:'18px',height:'18px'}}/></button>
      </div>

      {/* Status bar */}
      <div style={{padding:'16px 28px',borderBottom:'1px solid rgb(var(--border))',display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
        <div style={{width:'40px',height:'40px',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:deployResult?(deployResult.success?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)'):'rgba(59,130,246,0.12)'}}>
          {isRunning ? <Loader2 style={{width:'20px',height:'20px',color:'#3B82F6',animation:'spin 1s linear infinite'}}/> :
           deployResult?.success ? <CheckCircle style={{width:'20px',height:'20px',color:'#10B981'}}/> :
           <XCircle style={{width:'20px',height:'20px',color:'#EF4444'}}/>}
        </div>
        <div style={{flex:1}}>
          <h3 style={{fontSize:'15px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>
            {isRunning ? 'Deploying...' : deployResult?.success ? 'Deploy Successful' : 'Deploy Failed'}
          </h3>
          <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>
            {isRunning ? `${deployLogs.length} step${deployLogs.length!==1?'s':''} completed` :
             deployResult ? `Finished in ${((deployResult.totalDurationMs||0)/1000).toFixed(1)}s${deployResult.commitSha?` • ${deployResult.commitSha}`:''}` : 'Waiting...'}
          </p>
        </div>
        {deployResult && (
          <div style={{padding:'5px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',backgroundColor:deployResult.success?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)',color:deployResult.success?'#10B981':'#EF4444'}}>
            {deployResult.status}
          </div>
        )}
      </div>

      {/* Terminal body */}
      <div ref={termRef} style={{flex:1,overflowY:'auto',padding:'16px 28px',backgroundColor:'#0d1117',fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',lineHeight:1.7}}>
        {deployLogs.length === 0 && isRunning && (
          <div style={{color:'#8b949e',textAlign:'center',padding:'40px 0'}}>
            <Loader2 style={{width:'24px',height:'24px',animation:'spin 1s linear infinite',marginBottom:'8px'}}/><br/>
            Connecting to server...
          </div>
        )}
        {deployLogs.map((log,i) => {
          const ok = log.exitCode === 0;
          return (
            <div key={i} style={{marginBottom:'16px',borderLeft:`2px solid ${ok?'#238636':'#f85149'}`,paddingLeft:'14px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                {ok ? <CheckCircle style={{width:'13px',height:'13px',color:'#238636',flexShrink:0}}/> : <XCircle style={{width:'13px',height:'13px',color:'#f85149',flexShrink:0}}/>}
                <span style={{color:'#58a6ff',fontWeight:700,fontSize:'12px'}}>{STEP_LABELS[log.step]||log.step}</span>
                <span style={{color:'#484f58',fontSize:'11px',marginLeft:'auto',display:'flex',alignItems:'center',gap:'4px'}}>
                  <Clock style={{width:'10px',height:'10px'}}/> {(log.durationMs/1000).toFixed(1)}s
                </span>
              </div>
              {log.command && <div style={{color:'#484f58',fontSize:'11px',marginBottom:'4px'}}>$ {log.command}</div>}
              {log.stdout && <pre style={{color:'#c9d1d9',margin:'0 0 2px',whiteSpace:'pre-wrap',wordBreak:'break-all',fontSize:'11px'}}>{log.stdout}</pre>}
              {log.stderr && <pre style={{color:'#f85149',margin:0,whiteSpace:'pre-wrap',wordBreak:'break-all',fontSize:'11px'}}>{log.stderr}</pre>}
            </div>
          );
        })}
        {deployResult?.error && (
          <div style={{padding:'12px 16px',borderRadius:'10px',backgroundColor:'rgba(248,81,73,0.1)',border:'1px solid rgba(248,81,73,0.3)',color:'#f85149',fontSize:'12px',marginTop:'8px'}}>
            <strong>Error:</strong> {deployResult.error}
          </div>
        )}
        {deployResult?.success && (
          <div style={{padding:'12px 16px',borderRadius:'10px',backgroundColor:'rgba(35,134,54,0.1)',border:'1px solid rgba(35,134,54,0.3)',color:'#3fb950',fontSize:'12px',marginTop:'8px'}}>
            ✓ Deployment completed successfully{deployResult.commitSha?` — commit ${deployResult.commitSha}`:''}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{padding:'16px 28px',borderTop:'1px solid rgb(var(--border))',display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
        <div style={{flex:1}}/>
        {!isRunning && (
          <button onClick={()=>{onSuccess();}} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 24px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,color:'#fff',background:deployResult?.success?'linear-gradient(135deg, #10B981, #059669)':'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
            {deployResult?.success ? <><CheckCircle style={{width:'15px',height:'15px'}}/> Done</> : <><Rocket style={{width:'15px',height:'15px'}}/> Close</>}
          </button>
        )}
        {isRunning && (
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 24px',borderRadius:'10px',fontSize:'13px',fontWeight:600,color:'rgb(var(--text-muted))',backgroundColor:'rgb(var(--surface-hover))'}}>
            <Loader2 style={{width:'14px',height:'14px',animation:'spin 1s linear infinite'}}/> Deploying...
          </div>
        )}
      </div>
    </>
  );
}
