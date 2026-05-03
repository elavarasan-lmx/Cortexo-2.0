'use client';
import { Shield, Smartphone, Key, QrCode, Check } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
export default function TwoFactorPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'600px',margin:'0 auto'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Shield style={{width:'22px',height:'22px',color:'#10B981'}}/> Two-Factor Authentication</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Add an extra layer of security to your account</p>
    </div>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'28px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px',padding:'16px',borderRadius:'12px',backgroundColor:'#10B98112',border:'1px solid #10B98130'}}>
        <Check style={{width:'20px',height:'20px',color:'#10B981'}}/><div><p style={{fontSize:'14px',fontWeight:600,color:'#10B981',margin:0}}>2FA is Enabled</p><p style={{fontSize:'11px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>Your account is protected with authenticator app</p></div>
      </div>
      <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:'0 0 14px'}}>Recovery Codes</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'20px'}}>
        {['A8F2-X9K1','B3D7-M5N2','C6H4-P8Q3','D1J9-R7S4','E5L3-T2U6','F4W8-V9Y7'].map(c=>(
          <code key={c} style={{padding:'8px 12px',borderRadius:'8px',backgroundColor:'rgba(var(--border),0.15)',fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',color:'rgb(var(--text-secondary))',textAlign:'center'}}>{c}</code>))}
      </div>
      <div style={{display:'flex',gap:'10px'}}>
        <button style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-secondary))',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Regenerate Codes</button>
        <button style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',backgroundColor:'#EF4444',color:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Disable 2FA</button>
      </div>
    </div>
  </div>);
}
