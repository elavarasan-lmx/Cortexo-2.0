'use client';
import { Users, UserPlus, Search, Mail, Shield, MoreHorizontal } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const users = [
  { id:'1', name:'LMX', email:'lmx@cortexo.dev', role:'Owner', status:'active', lastLogin:'Just now', avatar:'L' },
  { id:'2', name:'Arun Kumar', email:'arun@cortexo.dev', role:'Admin', status:'active', lastLogin:'2h ago', avatar:'A' },
  { id:'3', name:'Priya S', email:'priya@cortexo.dev', role:'Developer', status:'active', lastLogin:'30m ago', avatar:'P' },
  { id:'4', name:'Ravi M', email:'ravi@cortexo.dev', role:'Developer', status:'active', lastLogin:'1d ago', avatar:'R' },
  { id:'5', name:'Deepa R', email:'deepa@cortexo.dev', role:'Viewer', status:'invited', lastLogin:'—', avatar:'D' },
];
const rc:Record<string,string> = { Owner:'#A78BFA', Admin:'#3B82F6', Developer:'#10B981', Viewer:'#6B7280' };
export default function UsersPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'100%'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px'}}>
      <div><h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Users style={{width:'22px',height:'22px',color:'#3B82F6'}}/> User Management</h1>
        <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Manage platform users and permissions</p></div>
      <button style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,rgb(var(--primary)),#818CF8)',color:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer'}}><UserPlus style={{width:'14px',height:'14px'}}/> Add User</button>
    </div>
    <div style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{borderBottom:'1px solid rgb(var(--border))'}}>
          {['User','Role','Status','Last Login',''].map(h=><th key={h} style={{padding:'12px 16px',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',color:'rgb(var(--text-muted))',textAlign:'left'}}>{h}</th>)}
        </tr></thead>
        <tbody>{users.map(u=>{const col=rc[u.role]||'#6B7280';return(
          <tr key={u.id} style={{borderBottom:'1px solid rgb(var(--border))',transition:'background 150ms',cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.backgroundColor='rgba(var(--border),0.08)';}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='transparent';}}>
            <td style={{padding:'14px 16px'}}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={{width:'32px',height:'32px',borderRadius:'50%',background:`linear-gradient(135deg,${col},${col}AA)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'13px',fontWeight:700}}>{u.avatar}</div><div><p style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',margin:0}}>{u.name}</p><p style={{fontSize:'11px',color:'rgb(var(--text-muted))',margin:'1px 0 0'}}>{u.email}</p></div></div></td>
            <td style={{padding:'14px 16px'}}><span style={{fontSize:'11px',fontWeight:600,color:col,padding:'3px 8px',borderRadius:'6px',backgroundColor:`${col}12`}}>{u.role}</span></td>
            <td style={{padding:'14px 16px'}}><span style={{fontSize:'11px',fontWeight:600,color:u.status==='active'?'#10B981':'#F59E0B',textTransform:'capitalize'}}>{u.status}</span></td>
            <td style={{padding:'14px 16px',fontSize:'12px',color:'rgb(var(--text-muted))'}}>{u.lastLogin}</td>
            <td style={{padding:'14px 16px'}}><button style={{padding:'4px',borderRadius:'6px',border:'1px solid rgb(var(--border))',backgroundColor:'transparent',cursor:'pointer',color:'rgb(var(--text-muted))'}}><MoreHorizontal style={{width:'14px',height:'14px'}}/></button></td>
          </tr>);})}</tbody>
      </table>
    </div>
  </div>);
}
