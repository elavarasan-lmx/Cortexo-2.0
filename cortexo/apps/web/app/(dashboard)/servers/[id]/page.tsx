'use client';
import { Server, Cpu, HardDrive, Wifi, Activity, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';
export default function ServerDetailPage() {
  useAutoLoadToken();
  const s = { name:'prod-web-01', ip:'10.0.1.15', os:'Ubuntu 22.04', uptime:'42 days', cpu:'34%', ram:'6.2/16 GB', disk:'45/100 GB', status:'online',
    services:[{name:'nginx',status:'running',port:80},{name:'node',status:'running',port:3000},{name:'redis',status:'running',port:6379},{name:'pm2',status:'running',port:'-'}]};
  const bars = [{l:'CPU',v:34,c:'#3B82F6'},{l:'RAM',v:39,c:'#10B981'},{l:'Disk',v:45,c:'#F59E0B'}];
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <Link href="/servers" style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'rgb(var(--text-muted))',textDecoration:'none',marginBottom:'16px'}}><ArrowLeft style={{width:'14px',height:'14px'}}/> Back to Servers</Link>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'28px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:'#10B981'}}/>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px'}}>
        <div style={{width:'48px',height:'48px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'14px',backgroundColor:'#10B98112'}}><Server style={{width:'22px',height:'22px',color:'#10B981'}}/></div>
        <div><h1 style={{fontSize:'20px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>{s.name}</h1><p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>{s.ip} • {s.os} • Up {s.uptime}</p></div>
        <span style={{marginLeft:'auto',fontSize:'11px',fontWeight:600,color:'#10B981',padding:'4px 12px',borderRadius:'8px',backgroundColor:'#10B98112'}}>● Online</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'24px'}}>
        {bars.map(b=>(
          <div key={b.l}><div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}><span style={{fontWeight:600,color:'rgb(var(--text-secondary))'}}>{b.l}</span><span style={{color:b.c,fontWeight:600}}>{b.v}%</span></div>
            <div style={{height:'8px',borderRadius:'4px',backgroundColor:'rgb(var(--border))',overflow:'hidden'}}><div style={{height:'100%',width:`${b.v}%`,borderRadius:'4px',backgroundColor:b.c,transition:'width 500ms'}}/></div></div>))}
      </div>
      <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:'0 0 12px'}}>Services</h3>
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {s.services.map(sv=>(
          <div key={sv.name} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'10px',backgroundColor:'rgba(var(--border),0.08)'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#10B981'}}/>
            <span style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',flex:1}}>{sv.name}</span>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>Port {sv.port}</span>
            <span style={{fontSize:'10px',fontWeight:600,color:'#10B981'}}>Running</span>
          </div>))}
      </div>
    </div>
  </div>);
}
