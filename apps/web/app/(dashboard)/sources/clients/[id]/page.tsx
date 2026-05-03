'use client';
import { Building2, ArrowLeft, Globe, Phone, Mail, Calendar, Activity, Server } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import Link from 'next/link';
export default function ClientDetailPage() {
  useAutoLoadToken();
  const c = { name:'WinBull Trading', domain:'winbull.in', contact:'Suresh K', email:'suresh@winbull.in', phone:'+91 98765 43210', plan:'Enterprise', since:'2025-01-15', servers:4, deploys:342, uptime:'99.95%',
    servers_list:[{name:'wb-prod-01',ip:'10.0.2.10',status:'online'},{name:'wb-prod-02',ip:'10.0.2.11',status:'online'},{name:'wb-staging',ip:'10.0.3.5',status:'online'},{name:'wb-dev',ip:'10.0.4.1',status:'offline'}]};
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <Link href="/sources/clients" style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'rgb(var(--text-muted))',textDecoration:'none',marginBottom:'16px'}}><ArrowLeft style={{width:'14px',height:'14px'}}/> Back to Clients</Link>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'28px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:'#3B82F6'}}/>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px'}}>
        <div style={{width:'48px',height:'48px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'14px',backgroundColor:'#3B82F612'}}><Building2 style={{width:'22px',height:'22px',color:'#3B82F6'}}/></div>
        <div><h1 style={{fontSize:'20px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>{c.name}</h1><p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>{c.domain}</p></div>
        <span style={{marginLeft:'auto',fontSize:'11px',fontWeight:600,color:'#A78BFA',padding:'4px 12px',borderRadius:'8px',backgroundColor:'#A78BFA12'}}>{c.plan}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px',marginBottom:'24px'}}>
        {[{l:'Contact',v:c.contact},{l:'Email',v:c.email},{l:'Since',v:c.since},{l:'Uptime',v:c.uptime}].map(m=>(
          <div key={m.l} style={{padding:'12px',borderRadius:'10px',backgroundColor:'rgba(var(--border),0.1)'}}>
            <p style={{fontSize:'10px',fontWeight:600,textTransform:'uppercase',color:'rgb(var(--text-muted))',margin:0}}>{m.l}</p>
            <p style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',margin:'4px 0 0'}}>{m.v}</p>
          </div>))}
      </div>
      <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:'0 0 12px'}}>Servers ({c.servers})</h3>
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {c.servers_list.map(s=>(
          <div key={s.name} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'10px',backgroundColor:'rgba(var(--border),0.08)'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:s.status==='online'?'#10B981':'#EF4444'}}/>
            <span style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',flex:1}}>{s.name}</span>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))',fontFamily:"'JetBrains Mono',monospace"}}>{s.ip}</span>
            <span style={{fontSize:'10px',fontWeight:600,color:s.status==='online'?'#10B981':'#EF4444',textTransform:'capitalize'}}>{s.status}</span>
          </div>))}
      </div>
    </div>
  </div>);
}
