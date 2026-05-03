'use client';
import { Wand2, FolderPlus, GitBranch, FileCode, CheckCircle2 } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
const templates = [
  { id:'1', name:'React + Next.js', desc:'Full-stack React with App Router', lang:'TypeScript', uses:342, color:'#3B82F6' },
  { id:'2', name:'Node.js API', desc:'Express REST API with JWT auth', lang:'JavaScript', uses:218, color:'#10B981' },
  { id:'3', name:'Python FastAPI', desc:'Async Python API with auto docs', lang:'Python', uses:156, color:'#F59E0B' },
  { id:'4', name:'Laravel + Vue', desc:'PHP monolith with Vue SPA', lang:'PHP', uses:89, color:'#EF4444' },
  { id:'5', name:'Flutter App', desc:'Cross-platform mobile app', lang:'Dart', uses:67, color:'#818CF8' },
  { id:'6', name:'Go Microservice', desc:'Lightweight Go service template', lang:'Go', uses:45, color:'#06B6D4' },
];
export default function ScaffoldingPage() {
  useAutoLoadToken();
  return (<div style={{maxWidth:'100%'}}>
    <div style={{marginBottom:'24px'}}>
      <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:0,display:'flex',alignItems:'center',gap:'10px'}}><Wand2 style={{width:'22px',height:'22px',color:'#A78BFA'}}/> Scaffolding</h1>
      <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',marginTop:'4px'}}>Generate project boilerplates and starter templates</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'14px'}}>
      {templates.map(t=>(
        <div key={t.id} style={{backgroundColor:'rgb(var(--surface))',border:'1px solid rgb(var(--border))',borderRadius:'14px',padding:'22px',cursor:'pointer',position:'relative',overflow:'hidden',transition:'all 200ms'}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 6px 20px -4px ${t.color}25`;e.currentTarget.style.transform='translateY(-2px)';}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:t.color}}/>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
            <div style={{width:'42px',height:'42px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'12px',backgroundColor:`${t.color}12`}}><FolderPlus style={{width:'18px',height:'18px',color:t.color}}/></div>
            <div><h3 style={{fontSize:'15px',fontWeight:600,color:'rgb(var(--text-primary))',margin:0}}>{t.name}</h3><p style={{fontSize:'11px',color:'rgb(var(--text-muted))',margin:'2px 0 0'}}>{t.desc}</p></div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',gap:'10px'}}>
              <span style={{fontSize:'11px',padding:'3px 8px',borderRadius:'6px',backgroundColor:'rgba(var(--border),0.2)',color:'rgb(var(--text-secondary))'}}>{t.lang}</span>
              <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>{t.uses} uses</span>
            </div>
            <button style={{padding:'6px 14px',borderRadius:'8px',border:'none',background:`linear-gradient(135deg,${t.color},${t.color}CC)`,color:'#fff',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>Generate</button>
          </div>
        </div>))}
    </div>
  </div>);
}
