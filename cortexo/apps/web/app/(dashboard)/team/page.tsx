'use client';
import { Users, Mail, Shield, UserPlus, Crown, UserCheck } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const members = [
  { id:'1', name:'LMX', email:'lmx@cortexo.dev', role:'Owner', status:'active', avatar:'L', joined:'2025-01-15', lastActive:'Just now', color:'#A78BFA' },
  { id:'2', name:'Arun Kumar', email:'arun@cortexo.dev', role:'Admin', status:'active', avatar:'A', joined:'2025-03-20', lastActive:'2h ago', color:'#3B82F6' },
  { id:'3', name:'Priya S', email:'priya@cortexo.dev', role:'Developer', status:'active', avatar:'P', joined:'2025-06-10', lastActive:'30m ago', color:'#10B981' },
  { id:'4', name:'Ravi M', email:'ravi@cortexo.dev', role:'Developer', status:'active', avatar:'R', joined:'2025-08-05', lastActive:'1d ago', color:'#F59E0B' },
  { id:'5', name:'Deepa R', email:'deepa@cortexo.dev', role:'Viewer', status:'invited', avatar:'D', joined:'2026-04-28', lastActive:'Pending', color:'#6B7280' },
];
const roleIcons:Record<string,typeof Crown> = { Owner:Crown, Admin:Shield, Developer:UserCheck, Viewer:Users };
export default function TeamPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'100%'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px'}}>
      <div><h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Users style={{width:'22px',height:'22px',color:'#3B82F6'}}/> Team Members</h1>
        <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Manage team access and roles</p></div>
      <button style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,rgb(var(--primary)),#818CF8)',color:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer'}}><UserPlus style={{width:'14px',height:'14px'}}/> Invite Member</button>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
      {members.map(m=>{const Ic=roleIcons[m.role]||Users;return(
        <div key={m.id} style={{display:'flex',alignItems:'center',gap:'14px',padding:'16px 20px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'12px',transition:'all 200ms',cursor:'pointer'}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px -2px rgba(0,0,0,0.12)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';}}>
          <div style={{width:'42px',height:'42px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:`linear-gradient(135deg,${m.color},${m.color}AA)`,color:'#fff',fontSize:'16px',fontWeight:700}}>{m.avatar}</div>
          <div style={{flex:1}}>
            <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:0}}>{m.name}</h3>
            <p style={{fontSize:'11px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}><Mail style={{width:'10px',height:'10px',display:'inline',verticalAlign:'middle',marginRight:'3px'}}/>{m.email}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'4px 10px',borderRadius:'6px',backgroundColor:`${m.color}12`}}>
            <Ic style={{width:'12px',height:'12px',color:m.color}}/><span style={{fontSize:'11px',fontWeight:600,color:m.color}}>{m.role}</span>
          </div>
          <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>{m.lastActive}</span>
          <span style={{fontSize:'10px',fontWeight:600,color:m.status==='active'?'#10B981':'#F59E0B',textTransform:'capitalize',padding:'3px 8px',borderRadius:'6px',backgroundColor:m.status==='active'?'#10B98112':'#F59E0B12'}}>{m.status}</span>
        </div>);})}
    </div>
  </div>);
}
