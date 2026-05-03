'use client';
import { AlertTriangle, RefreshCw } from 'lucide-react';
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',padding:'40px'}}>
      <div style={{width:'80px',height:'80px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'20px',backgroundColor:'#EF444412',marginBottom:'24px'}}>
        <AlertTriangle style={{width:'36px',height:'36px',color:'#EF4444'}}/>
      </div>
      <h1 style={{fontSize:'24px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>Something went wrong</h1>
      <p style={{fontSize:'14px',color:'rgb(var(--text-secondary))',marginTop:'8px',maxWidth:'400px'}}>{error.message || 'An unexpected error occurred. Please try again.'}</p>
      <button onClick={reset} style={{marginTop:'24px',display:'flex',alignItems:'center',gap:'8px',padding:'10px 24px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,rgb(var(--primary)),#818CF8)',color:'#fff',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
        <RefreshCw style={{width:'14px',height:'14px'}}/> Try Again
      </button>
    </div>
  );
}
