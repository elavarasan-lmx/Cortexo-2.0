'use client';
import { Rocket, Server, GitBranch, ArrowRight } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
export default function DeployNewPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'600px',margin:'0 auto'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Rocket style={{width:'22px',height:'22px',color:'#10B981'}}/> New Deployment</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Deploy your application to an environment</p>
    </div>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'28px'}}>
      <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>
        <div><label style={{fontSize:'12px',fontWeight:600,color:'rgb(var(--text-secondary))',marginBottom:'6px',display:'block'}}>Repository</label>
          <select style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'rgba(var(--border),0.1)',color:'rgb(var(--text-primary))',fontSize:'13px',outline:'none'}}>
            <option>cortexo/idp-web</option><option>cortexo/idp-api</option><option>cortexo/infra-config</option></select></div>
        <div><label style={{fontSize:'12px',fontWeight:600,color:'rgb(var(--text-secondary))',marginBottom:'6px',display:'block'}}>Branch</label>
          <select style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'rgba(var(--border),0.1)',color:'rgb(var(--text-primary))',fontSize:'13px',outline:'none'}}>
            <option>main</option><option>develop</option><option>staging</option></select></div>
        <div><label style={{fontSize:'12px',fontWeight:600,color:'rgb(var(--text-secondary))',marginBottom:'6px',display:'block'}}>Target Server</label>
          <select style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'rgba(var(--border),0.1)',color:'rgb(var(--text-primary))',fontSize:'13px',outline:'none'}}>
            <option>prod-web-01</option><option>prod-app-02</option><option>staging-01</option></select></div>
        <div><label style={{fontSize:'12px',fontWeight:600,color:'rgb(var(--text-secondary))',marginBottom:'6px',display:'block'}}>Environment</label>
          <div style={{display:'flex',gap:'10px'}}>
            {['Production','Staging','Development'].map(e=><button key={e} style={{flex:1,padding:'10px',borderRadius:'10px',border:e==='Production'?'2px solid #10B981':'1px solid rgb(var(--border))',backgroundColor:e==='Production'?'#10B98112':'transparent',color:e==='Production'?'#10B981':'rgb(var(--text-secondary))',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>{e}</button>)}
          </div></div>
        <button style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#10B981,#059669)',color:'#fff',fontSize:'14px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'8px'}}><Rocket style={{width:'16px',height:'16px'}}/> Deploy Now</button>
      </div>
    </div>
  </div>);
}
