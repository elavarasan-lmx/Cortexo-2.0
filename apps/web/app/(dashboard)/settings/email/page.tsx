'use client';
import { Mail, Send, Check, AlertCircle, Server } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
export default function EmailConfigPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Mail style={{width:'22px',height:'22px',color:'#3B82F6'}}/> Email Configuration</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Configure SMTP and email notification settings</p>
    </div>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'28px'}}>
      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        {[{l:'SMTP Host',v:'smtp.cortexo.dev'},{l:'Port',v:'587'},{l:'Username',v:'noreply@cortexo.dev'},{l:'Encryption',v:'TLS'}].map(f=>(
          <div key={f.l}><label style={{fontSize:'12px',fontWeight:600,color:'rgb(var(--text-secondary))',marginBottom:'6px',display:'block'}}>{f.l}</label>
            <input readOnly defaultValue={f.v} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'rgba(var(--border),0.1)',color:'rgb(var(--text-primary))',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",outline:'none',boxSizing:'border-box'}}/></div>))}
        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px',borderRadius:'10px',backgroundColor:'#10B98112',border:'1px solid #10B98130'}}>
          <Check style={{width:'16px',height:'16px',color:'#10B981'}}/><span style={{fontSize:'12px',color:'#10B981',fontWeight:600}}>SMTP Connection Verified</span>
        </div>
        <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
          <button style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-secondary))',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><Send style={{width:'12px',height:'12px'}}/> Test Email</button>
          <button style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#3B82F6,#2563EB)',color:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Save Changes</button>
        </div>
      </div>
    </div>
  </div>);
}
