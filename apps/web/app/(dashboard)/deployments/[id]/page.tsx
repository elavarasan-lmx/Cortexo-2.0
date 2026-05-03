'use client';
import { Rocket, Clock, CheckCircle2, Server, GitBranch, User, ArrowLeft } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';
export default function DeploymentDetailPage() {
  useAutoLoadToken();
  const d = { id:'DEP-2847', version:'v2.4.1', branch:'main', server:'prod-web-01', status:'success', user:'LMX', started:'2026-05-02 12:45:00', finished:'2026-05-02 12:47:32', duration:'2m 32s',
    steps:[{name:'Pull Code',status:'done',time:'12s'},{name:'Build',status:'done',time:'45s'},{name:'Test',status:'done',time:'38s'},{name:'Deploy',status:'done',time:'57s'}]};
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <Link href="/deployments" style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'rgb(var(--text-muted))',textDecoration:'none',marginBottom:'16px'}}><ArrowLeft style={{width:'14px',height:'14px'}}/> Back to Deployments</Link>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'28px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:'#10B981'}}/>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'20px'}}>
        <div style={{width:'48px',height:'48px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'14px',backgroundColor:'#10B98112'}}><Rocket style={{width:'22px',height:'22px',color:'#10B981'}}/></div>
        <div><h1 style={{fontSize:'20px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>{d.id}</h1><p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>{d.version} → {d.server}</p></div>
        <span style={{marginLeft:'auto',fontSize:'11px',fontWeight:600,color:'#10B981',padding:'4px 12px',borderRadius:'8px',backgroundColor:'#10B98112'}}>✓ {d.status}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px',marginBottom:'24px'}}>
        {[{l:'Branch',v:d.branch,i:GitBranch},{l:'Server',v:d.server,i:Server},{l:'Deployed By',v:d.user,i:User},{l:'Duration',v:d.duration,i:Clock}].map(m=>{const I=m.i;return(
          <div key={m.l} style={{padding:'12px',borderRadius:'10px',backgroundColor:'rgba(var(--border),0.1)'}}>
            <p style={{fontSize:'10px',fontWeight:600,textTransform:'uppercase',color:'rgb(var(--text-muted))',margin:0,display:'flex',alignItems:'center',gap:'4px'}}><I style={{width:'10px',height:'10px'}}/>{m.l}</p>
            <p style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:'4px 0 0'}}>{m.v}</p>
          </div>);})}
      </div>
      <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:'0 0 12px'}}>Pipeline Steps</h3>
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {d.steps.map((s,i)=>(
          <div key={s.name} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'10px',backgroundColor:'rgba(var(--border),0.08)'}}>
            <CheckCircle2 style={{width:'16px',height:'16px',color:'#10B981',flexShrink:0}}/>
            <span style={{fontSize:'13px',fontWeight:500,color:'rgb(var(--text-primary))',flex:1}}>{s.name}</span>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>{s.time}</span>
          </div>))}
      </div>
    </div>
  </div>);
}
