'use client';
import { Lock, Users, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const roles = [
  { name:'Owner', perms:['Full Access','Billing','Delete Resources'], users:1, color:'#A78BFA' },
  { name:'Admin', perms:['Manage Servers','Deployments','Team Management'], users:1, color:'#3B82F6' },
  { name:'Developer', perms:['Deploy','View Logs','Edit Configs'], users:2, color:'#10B981' },
  { name:'Viewer', perms:['Read-Only Access'], users:1, color:'#6B7280' },
];
export default function AccessControlPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Lock style={{width:'22px',height:'22px',color:'#EF4444'}}/> Access Control</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Manage roles and permissions</p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
      {roles.map(r=>(
        <div key={r.name} style={{padding:'20px 22px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:r.color}}/>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <Shield style={{width:'16px',height:'16px',color:r.color}}/> 
            <h3 style={{fontSize:'15px',fontWeight:600,color:r.color,margin:0}}>{r.name}</h3>
            <span style={{fontSize:'11px',color:'rgb(var(--text-muted))',marginLeft:'auto'}}><Users style={{width:'10px',height:'10px',display:'inline',verticalAlign:'middle',marginRight:'3px'}}/>{r.users} user{r.users>1?'s':''}</span>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
            {r.perms.map(p=><span key={p} style={{fontSize:'11px',padding:'4px 10px',borderRadius:'6px',backgroundColor:`${r.color}10`,color:r.color,fontWeight:500}}>{p}</span>)}
          </div>
        </div>))}
    </div>
  </div>);
}
