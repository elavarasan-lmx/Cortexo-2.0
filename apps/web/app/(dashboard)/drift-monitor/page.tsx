'use client';
import { Eye, AlertTriangle, CheckCircle2, GitCompareArrows, Server } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const items = [
  { id:'1', resource:'nginx.conf', server:'prod-web-01', severity:'high', detected:'15m ago', expected:'worker_processes 4', actual:'worker_processes 2', resolved:false },
  { id:'2', resource:'php.ini', server:'prod-app-02', severity:'medium', detected:'1h ago', expected:'memory_limit=512M', actual:'memory_limit=256M', resolved:false },
  { id:'3', resource:'iptables', server:'prod-db-01', severity:'critical', detected:'30m ago', expected:'Port 3306 restricted', actual:'Port 3306 open', resolved:false },
  { id:'4', resource:'crontab', server:'prod-worker-01', severity:'low', detected:'2h ago', expected:'5 entries', actual:'3 entries', resolved:true },
  { id:'5', resource:'env vars', server:'staging-01', severity:'medium', detected:'4h ago', expected:'NODE_ENV=staging', actual:'NODE_ENV=dev', resolved:true },
];
const sc:Record<string,string> = { critical:'#EF4444', high:'#F97316', medium:'#F59E0B', low:'#6B7280' };
export default function DriftMonitorPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'100%'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Eye style={{width:'22px',height:'22px',color:'#F59E0B'}}/> Drift Monitor</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Detect and resolve infrastructure configuration drift</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'14px',marginBottom:'24px'}}>
      {[{l:'Total',v:String(items.length),c:'#818CF8'},{l:'Unresolved',v:String(items.filter(d=>!d.resolved).length),c:'#EF4444'},{l:'Critical',v:String(items.filter(d=>d.severity==='critical').length),c:'#F97316'},{l:'Resolved',v:String(items.filter(d=>d.resolved).length),c:'#10B981'}].map(c=>(
        <div key={c.l} style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'18px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:c.c}}/>
          <p style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',color:'rgb(var(--text-muted))',margin:0}}>{c.l}</p>
          <p style={{fontSize:'26px',fontWeight:700,color:c.c,margin:'10px 0 0',lineHeight:1}}>{c.v}</p>
        </div>))}
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
      {items.map(d=>{const col=sc[d.severity]||'#6B7280';return(
        <div key={d.id} style={{padding:'16px 20px',backgroundColor:'rgb(var(--surface))',border:`1px solid ${d.resolved?'rgb(var(--border))':col+'30'}`,borderRadius:'12px',cursor:'pointer',opacity:d.resolved?0.7:1}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            {d.resolved?<CheckCircle2 style={{width:'16px',height:'16px',color:'#10B981'}}/>:<AlertTriangle style={{width:'16px',height:'16px',color:col}}/>}
            <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:0}}>{d.resource}</h3>
            <span style={{fontSize:'10px',fontWeight:600,color:col,textTransform:'uppercase',padding:'2px 8px',borderRadius:'4px',backgroundColor:`${col}12`}}>{d.severity}</span>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))',marginLeft:'auto'}}><Server style={{width:'10px',height:'10px',display:'inline',verticalAlign:'middle',marginRight:'3px'}}/>{d.server}</span>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>{d.detected}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'10px',alignItems:'center'}}>
            <div style={{padding:'8px 12px',borderRadius:'8px',backgroundColor:'#10B98112'}}>
              <p style={{fontSize:'10px',color:'#10B981',margin:0,fontWeight:600}}>EXPECTED</p>
              <p style={{margin:'4px 0 0',color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{d.expected}</p>
            </div>
            <GitCompareArrows style={{width:'16px',height:'16px',color:'rgb(var(--text-muted))'}}/>
            <div style={{padding:'8px 12px',borderRadius:'8px',backgroundColor:'#EF444412'}}>
              <p style={{fontSize:'10px',color:'#EF4444',margin:0,fontWeight:600}}>ACTUAL</p>
              <p style={{margin:'4px 0 0',color:'rgb(var(--text-primary))',fontFamily:"'JetBrains Mono',monospace",fontSize:'11px'}}>{d.actual}</p>
            </div>
          </div>
        </div>);})}
    </div>
  </div>);
}
