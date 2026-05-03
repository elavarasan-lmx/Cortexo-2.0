'use client';
import { Bot, Activity, ArrowLeft, Clock, BarChart2, Zap, Brain } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';
export default function AgentDetailPage() {
  useAutoLoadToken();
  const a = { name:'DeployBot', type:'Deployment', status:'active', avatar:'🤖', runs:1247, accuracy:'99.2%', uptime:'99.8%', lastRun:'2m ago',
    recentRuns:[{id:'1',trigger:'Push to main',result:'success',time:'2m ago',duration:'45s'},{id:'2',trigger:'Manual deploy',result:'success',time:'1h ago',duration:'1m 12s'},{id:'3',trigger:'Push to main',result:'success',time:'3h ago',duration:'38s'},{id:'4',trigger:'Scheduled',result:'failed',time:'6h ago',duration:'2m 5s'},{id:'5',trigger:'Push to main',result:'success',time:'12h ago',duration:'42s'}]};
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <Link href="/agents" style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'rgb(var(--text-muted))',textDecoration:'none',marginBottom:'16px'}}><ArrowLeft style={{width:'14px',height:'14px'}}/> Back to Agents</Link>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'28px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:'#A78BFA'}}/>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px'}}>
        <div style={{width:'56px',height:'56px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'16px',backgroundColor:'#A78BFA12',fontSize:'28px'}}>{a.avatar}</div>
        <div><h1 style={{fontSize:'20px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>{a.name}</h1><p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>{a.type} Agent</p></div>
        <span style={{marginLeft:'auto',fontSize:'11px',fontWeight:600,color:'#10B981',padding:'4px 12px',borderRadius:'8px',backgroundColor:'#10B98112'}}>Active</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px',marginBottom:'24px'}}>
        {[{l:'Total Runs',v:String(a.runs),c:'#3B82F6'},{l:'Accuracy',v:a.accuracy,c:'#10B981'},{l:'Uptime',v:a.uptime,c:'#A78BFA'},{l:'Last Run',v:a.lastRun,c:'#F59E0B'}].map(m=>(
          <div key={m.l} style={{padding:'14px',borderRadius:'10px',backgroundColor:'rgba(var(--border),0.1)',textAlign:'center'}}>
            <p style={{fontSize:'10px',fontWeight:600,textTransform:'uppercase',color:'rgb(var(--text-muted))',margin:0}}>{m.l}</p>
            <p style={{fontSize:'22px',fontWeight:700,color:m.c,margin:'6px 0 0'}}>{m.v}</p>
          </div>))}
      </div>
      <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:'0 0 12px'}}>Recent Runs</h3>
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {a.recentRuns.map(r=>(
          <div key={r.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'10px',backgroundColor:'rgba(var(--border),0.08)'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:r.result==='success'?'#10B981':'#EF4444'}}/>
            <span style={{fontSize:'13px',fontWeight:500,color:'rgb(var(--text-primary))',flex:1}}>{r.trigger}</span>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>{r.duration}</span>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>{r.time}</span>
          </div>))}
      </div>
    </div>
  </div>);
}
