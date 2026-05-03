'use client';
import { CreditCard, Check, Zap, Crown, Star } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const plans = [
  { name:'Starter', price:'Free', desc:'For personal projects', color:'#6B7280', features:['3 Servers','5 Deployments/day','Basic Monitoring','Community Support'], current:false },
  { name:'Pro', price:'₹2,999/mo', desc:'For growing teams', color:'#3B82F6', features:['25 Servers','Unlimited Deployments','Advanced Monitoring','AI Agents (3)','Priority Support','Webhooks'], current:true },
  { name:'Enterprise', price:'₹9,999/mo', desc:'Full platform access', color:'#A78BFA', features:['Unlimited Servers','Unlimited Deployments','Full AI Suite','Custom Integrations','24/7 Dedicated Support','SSO & SAML','Audit Logs','SLA Guarantee'], current:false },
];
export default function PricingPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'900px',margin:'0 auto'}}>
    <div style={{textAlign:'center',marginBottom:'32px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}><CreditCard style={{width:'22px',height:'22px',color:'#A78BFA'}}/> Pricing Plans</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Choose the plan that fits your infrastructure needs</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'18px'}}>
      {plans.map(p=>(
        <div key={p.name} style={{backgroundColor:'rgb(var(--surface))',border:`2px solid ${p.current?p.color:'rgb(var(--border))'}`,borderRadius:'16px',padding:'28px 22px',position:'relative',overflow:'hidden',transition:'all 200ms',transform:p.current?'scale(1.03)':'none'}}
          onMouseEnter={e=>{if(!p.current)e.currentTarget.style.transform='translateY(-4px)';}} onMouseLeave={e=>{if(!p.current)e.currentTarget.style.transform='none';}}>
          {p.current&&<div style={{position:'absolute',top:'12px',right:'12px'}}><span style={{fontSize:'10px',fontWeight:600,color:'#fff',padding:'3px 10px',borderRadius:'10px',backgroundColor:p.color}}>Current</span></div>}
          <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:p.color}}/>
          <div style={{marginBottom:'18px'}}>
            <h3 style={{fontSize:'18px',fontWeight:700,color:p.color,margin:0}}>{p.name}</h3>
            <p style={{fontSize:'28px',fontWeight:800,color:'rgb(var(--text-primary))',margin:'8px 0 0'}}>{p.price}</p>
            <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:'4px 0 0'}}>{p.desc}</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'20px'}}>
            {p.features.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'rgb(var(--text-secondary))'}}><Check style={{width:'14px',height:'14px',color:p.color,flexShrink:0}}/>{f}</div>)}
          </div>
          <button style={{width:'100%',padding:'10px',borderRadius:'10px',border:p.current?'none':`1px solid ${p.color}`,backgroundColor:p.current?p.color:'transparent',color:p.current?'#fff':p.color,fontSize:'13px',fontWeight:600,cursor:'pointer'}}>{p.current?'Current Plan':'Upgrade'}</button>
        </div>))}
    </div>
  </div>);
}
