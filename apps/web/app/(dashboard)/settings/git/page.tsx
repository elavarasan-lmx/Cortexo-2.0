'use client';
import { GitBranch, Github, Check, Link, RefreshCw } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const repos = [
  { name:'cortexo/idp-web', branch:'main', provider:'GitHub', status:'connected', lastSync:'2m ago' },
  { name:'cortexo/idp-api', branch:'develop', provider:'GitHub', status:'connected', lastSync:'15m ago' },
  { name:'cortexo/infra-config', branch:'main', provider:'GitLab', status:'connected', lastSync:'1h ago' },
];
export default function GitConfigPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'700px',margin:'0 auto'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><GitBranch style={{width:'22px',height:'22px',color:'#F59E0B'}}/> Git Configuration</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Manage repository connections and sync settings</p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
      {repos.map(r=>(
        <div key={r.name} style={{padding:'18px 22px',backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <Github style={{width:'18px',height:'18px',color:'rgb(var(--text-primary))'}}/> 
            <div style={{flex:1}}>
              <h3 style={{fontSize:'14px',fontWeight:600,color:'rgb(var(--text-primary))',margin:0}}>{r.name}</h3>
              <div style={{display:'flex',gap:'10px',marginTop:'4px',fontSize:'11px',color:'rgb(var(--text-muted))'}}>
                <span><GitBranch style={{width:'10px',height:'10px',display:'inline',verticalAlign:'middle',marginRight:'3px'}}/>{r.branch}</span>
                <span>{r.provider}</span><span>Synced: {r.lastSync}</span>
              </div>
            </div>
            <span style={{fontSize:'10px',fontWeight:600,color:'#10B981',padding:'3px 8px',borderRadius:'6px',backgroundColor:'#10B98112'}}>Connected</span>
            <button style={{padding:'6px',borderRadius:'8px',border:'1px solid rgb(var(--border))',backgroundColor:'transparent',cursor:'pointer',color:'rgb(var(--text-muted))'}}><RefreshCw style={{width:'14px',height:'14px'}}/></button>
          </div>
        </div>))}
    </div>
    <button style={{marginTop:'16px',display:'flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'10px',border:'1px dashed rgb(var(--border))',backgroundColor:'transparent',color:'rgb(var(--text-secondary))',fontSize:'12px',fontWeight:600,cursor:'pointer',width:'100%',justifyContent:'center'}}><Link style={{width:'14px',height:'14px'}}/> Connect Repository</button>
  </div>);
}
