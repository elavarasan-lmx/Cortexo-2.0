'use client';
import { Activity, Clock, User, Settings, GitBranch, Shield, Server } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const logs = [
  { id:'1', user:'LMX', action:'Deployed v2.4.1 to production', type:'deploy', time:'2m ago', icon:'🚀' },
  { id:'2', user:'Arun', action:'Updated nginx config on prod-web-01', type:'config', time:'15m ago', icon:'⚙️' },
  { id:'3', user:'System', action:'Auto-scaled workers from 2 to 4', type:'system', time:'30m ago', icon:'📈' },
  { id:'4', user:'Priya', action:'Merged PR #142: Fix rate sync', type:'git', time:'1h ago', icon:'🔀' },
  { id:'5', user:'LMX', action:'Enabled 2FA for team', type:'security', time:'2h ago', icon:'🔒' },
  { id:'6', user:'Ravi', action:'Created new cron job: Log Rotation', type:'config', time:'3h ago', icon:'⏰' },
  { id:'7', user:'System', action:'SSL certificate renewed for cortexo.dev', type:'security', time:'6h ago', icon:'🛡️' },
  { id:'8', user:'LMX', action:'Added webhook for Slack notifications', type:'config', time:'1d ago', icon:'🔗' },
];
const typeColors:Record<string,string> = { deploy:'#10B981', config:'#3B82F6', system:'#818CF8', git:'#F59E0B', security:'#EF4444' };
export default function ActivityPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'100%'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Activity style={{width:'22px',height:'22px',color:'#818CF8'}}/> Activity Log</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Complete audit trail of all platform activity</p>
    </div>
    <div style={{position:'relative',paddingLeft:'28px'}}>
      <div style={{position:'absolute',left:'13px',top:'0',bottom:'0',width:'2px',backgroundColor:'rgb(var(--border))'}}/>
      {logs.map(l=>{const col=typeColors[l.type]||'#6B7280';return(
        <div key={l.id} style={{position:'relative',marginBottom:'16px',padding:'14px 18px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'12px',marginLeft:'16px',transition:'all 200ms'}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px -2px rgba(0,0,0,0.1)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';}}>
          <div style={{position:'absolute',left:'-24px',top:'18px',width:'16px',height:'16px',borderRadius:'50%',backgroundColor:'rgb(var(--surface))',border:`2px solid ${col}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px'}}>{l.icon}</div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'12px',fontWeight:600,color:col}}>{l.user}</span>
            <span style={{fontSize:'13px',color:'rgb(var(--text-primary))'}}>{l.action}</span>
            <span style={{marginLeft:'auto',fontSize:'11px',color:'rgb(var(--text-muted))',whiteSpace:'nowrap'}}><Clock style={{width:'10px',height:'10px',display:'inline',verticalAlign:'middle',marginRight:'3px'}}/>{l.time}</span>
          </div>
        </div>);})}
    </div>
  </div>);
}
