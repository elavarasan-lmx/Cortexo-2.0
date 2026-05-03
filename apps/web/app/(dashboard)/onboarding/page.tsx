'use client';
import { Rocket, Check, ArrowRight, Server, GitBranch, Shield, Users } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const steps = [
  { id:1, title:'Connect Infrastructure', desc:'Add your first server or cloud provider', icon:Server, done:true, color:'#10B981' },
  { id:2, title:'Setup Repository', desc:'Link a Git repository for deployments', icon:GitBranch, done:true, color:'#3B82F6' },
  { id:3, title:'Configure Security', desc:'Enable 2FA and set access controls', icon:Shield, done:false, color:'#F59E0B' },
  { id:4, title:'Invite Team', desc:'Add team members and assign roles', icon:Users, done:false, color:'#A78BFA' },
  { id:5, title:'First Deployment', desc:'Deploy your application to production', icon:Rocket, done:false, color:'#EF4444' },
];
export default function OnboardingPage() {
  useAutoLoadToken();
  const progress = Math.round((steps.filter(s=>s.done).length/steps.length)*100);
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <div style={{textAlign:'center',marginBottom:'32px'}}>
      <h1 style={{fontSize:'24px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0}}>Welcome to Cortexo 🚀</h1>
      <p style={{fontSize:'14px',color:'rgb(var(--text-secondary))',marginTop:'6px'}}>Complete these steps to get your platform ready</p>
      <div style={{marginTop:'18px',height:'8px',borderRadius:'4px',backgroundColor:'rgb(var(--border))',overflow:'hidden'}}>
        <div style={{height:'100%',width:`${progress}%`,borderRadius:'4px',background:'linear-gradient(90deg,#10B981,#3B82F6)',transition:'width 500ms ease'}}/>
      </div>
      <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',marginTop:'6px'}}>{progress}% complete</p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
      {steps.map(s=>{const Icon=s.icon;return(
        <div key={s.id} style={{display:'flex',alignItems:'center',gap:'16px',padding:'18px 22px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',cursor:'pointer',transition:'all 200ms',opacity:s.done?0.8:1}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px -2px rgba(0,0,0,0.12)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';}}>
          <div style={{width:'44px',height:'44px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'12px',backgroundColor:s.done?'#10B98115':`${s.color}12`,flexShrink:0}}>
            {s.done?<Check style={{width:'20px',height:'20px',color:'#10B981'}}/>:<Icon style={{width:'20px',height:'20px',color:s.color}}/>}
          </div>
          <div style={{flex:1}}><h3 style={{fontSize:'15px',fontWeight:600,color:'rgb(var(--text-primary))',margin:0}}>{s.title}</h3><p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>{s.desc}</p></div>
          {!s.done&&<ArrowRight style={{width:'16px',height:'16px',color:'rgb(var(--text-muted))'}}/>}
        </div>);})}
    </div>
  </div>);
}
