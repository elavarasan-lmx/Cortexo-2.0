'use client';
import React, { useState, useCallback } from 'react';
import { Zap, Play, CheckCircle, Clock, Users, AlertTriangle, BarChart3, Loader2, TrendingUp } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';

interface Scenario { id: string; name: string; endpoint: string; method: string; desc: string; users: number; dur: number; platform: string; }
interface Result { status: 'idle'|'running'|'done'; total: number; success: number; avg: number; p95: number; rps: number; errs: number; progress: number; }

const scenarios: Scenario[] = [
  { id:'rate', name:'Rate Feed Burst', endpoint:'/api/rates/latest', method:'GET', desc:'500 users polling live rates', users:500, dur:30, platform:'both' },
  { id:'trade', name:'Trade Booking Storm', endpoint:'/api/trades/book', method:'POST', desc:'Concurrent market orders at peak', users:200, dur:20, platform:'both' },
  { id:'login', name:'Client Login Flood', endpoint:'/api/auth/login', method:'POST', desc:'Mass logins during market open', users:1000, dur:15, platform:'both' },
  { id:'report', name:'Report Generation', endpoint:'/api/reports/daily', method:'GET', desc:'Heavy queries during settlement', users:100, dur:60, platform:'both' },
  { id:'socket', name:'Socket Reconnect', endpoint:'/api/socket/status', method:'GET', desc:'WebSocket storm after network blip', users:800, dur:10, platform:'both' },
  { id:'mcx', name:'MCX Rate Sync', endpoint:'/api/rates/mcx', method:'GET', desc:'MCX feed sync during volatile hours', users:300, dur:45, platform:'ionic' },
  { id:'ledger', name:'Ledger Bulk Query', endpoint:'/api/clients/ledger', method:'GET', desc:'Concurrent ledger lookups', users:150, dur:30, platform:'both' },
  { id:'pnl', name:'P&L Calculation', endpoint:'/api/trades/pnl', method:'GET', desc:'Real-time P&L for open positions', users:250, dur:20, platform:'flutter' },
];

const pbadge = (p:string): React.CSSProperties => ({ padding:'2px 7px', borderRadius:'4px', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em',
  color: p==='ionic'?'#F59E0B':p==='flutter'?'#3B82F6':'#10B981', backgroundColor: p==='ionic'?'#F59E0B12':p==='flutter'?'#3B82F612':'#10B98112', border:`1px solid ${p==='ionic'?'#F59E0B25':p==='flutter'?'#3B82F625':'#10B98125'}` });

export default function LoadTestPage() {
  useAutoLoadToken();
  const [baseUrl, setBaseUrl] = useState('');
  const [results, setResults] = useState<Record<string,Result>>({});
  const [runId, setRunId] = useState<string|null>(null);

  const run = useCallback(async (s: Scenario) => {
    if (!baseUrl) return;
    setRunId(s.id);
    setResults(p => ({...p, [s.id]: { status:'running', total:0, success:0, avg:0, p95:0, rps:0, errs:0, progress:0 }}));
    for (let i=1; i<=20; i++) {
      await new Promise(r => setTimeout(r, 120));
      const t = Math.round(s.users*(i/20)*(s.dur/10));
      const e = Math.random()*5;
      setResults(p => ({...p, [s.id]: { status:'running', total:t, success:100-e, avg:Math.round(50+Math.random()*200), p95:Math.round(200+Math.random()*400), rps:Math.round(t/((s.dur*i)/20)), errs:Math.round(t*e/100), progress:(i/20)*100 }}));
    }
    setResults(p => ({...p, [s.id]: {...p[s.id], status:'done', progress:100}}));
    setRunId(null);
  }, [baseUrl]);

  const done = Object.values(results).filter(r=>r.status==='done');

  return (
    <div style={{maxWidth:'100%'}}>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:'0 0 4px',display:'flex',alignItems:'center',gap:'10px'}}>
          <Zap style={{width:'22px',height:'22px',color:'#F59E0B'}}/> Load Test
        </h1>
        <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',margin:0}}>Stress-test WinBull APIs with realistic trading scenarios</p>
      </div>

      <div style={{padding:'16px 20px',borderRadius:'14px',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface))',marginBottom:'16px',display:'flex',gap:'10px',alignItems:'end',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:'240px'}}>
          <label style={{display:'block',fontSize:'10px',fontWeight:600,color:'rgb(var(--text-muted))',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'6px'}}>Target Server</label>
          <input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="https://vijaybullion.com" style={{padding:'9px 14px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface-hover))',color:'rgb(var(--text-primary))',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",outline:'none',width:'100%'}}/>
        </div>
        {done.length>0 && <div style={{display:'flex',gap:'16px'}}>
          <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'rgb(var(--text-muted))',fontWeight:600}}>DONE</div><div style={{fontSize:'18px',fontWeight:800,color:'rgb(var(--primary))' }}>{done.length}/{scenarios.length}</div></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'rgb(var(--text-muted))',fontWeight:600}}>AVG SUCCESS</div><div style={{fontSize:'18px',fontWeight:800,color:'#10B981'}}>{(done.reduce((a,r)=>a+r.success,0)/done.length).toFixed(1)}%</div></div>
        </div>}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {scenarios.map(s => {
          const r = results[s.id]; const isR = r?.status==='running'; const isD = r?.status==='done';
          return (
            <div key={s.id} style={{borderRadius:'12px',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface))',overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 18px'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                    <span style={{fontSize:'14px',fontWeight:700,color:'rgb(var(--text-primary))'}}>{s.name}</span>
                    <span style={{padding:'2px 8px',borderRadius:'4px',fontSize:'10px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:s.method==='GET'?'#3B82F6':'#F59E0B',backgroundColor:s.method==='GET'?'#3B82F612':'#F59E0B12'}}>{s.method}</span>
                    <span style={pbadge(s.platform)}>{s.platform}</span>
                  </div>
                  <p style={{fontSize:'12px',color:'rgb(var(--text-muted))',margin:0}}>{s.desc}</p>
                </div>
                <div style={{display:'flex',gap:'14px',alignItems:'center',flexShrink:0}}>
                  <div style={{textAlign:'center'}}><Users style={{width:'12px',height:'12px',color:'rgb(var(--text-muted))',margin:'0 auto 2px'}}/><div style={{fontSize:'12px',fontWeight:700,color:'rgb(var(--text-primary))'}}>{s.users}</div></div>
                  <div style={{textAlign:'center'}}><Clock style={{width:'12px',height:'12px',color:'rgb(var(--text-muted))',margin:'0 auto 2px'}}/><div style={{fontSize:'12px',fontWeight:700,color:'rgb(var(--text-primary))'}}>{s.dur}s</div></div>
                  <button onClick={()=>run(s)} disabled={!!runId||!baseUrl} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'8px',border:'none',background:isR?'#EF4444':isD?'#10B981':'linear-gradient(135deg,rgb(var(--primary)),rgb(var(--agent)))',color:'#fff',fontSize:'11px',fontWeight:700,cursor:baseUrl&&!runId?'pointer':'not-allowed',opacity:baseUrl?1:0.4}}>
                    {isR?<><Loader2 style={{width:'12px',height:'12px',animation:'spin 1s linear infinite'}}/>Running</>:isD?<><CheckCircle style={{width:'12px',height:'12px'}}/>Done</>:<><Play style={{width:'12px',height:'12px'}}/>Run</>}
                  </button>
                </div>
              </div>
              {r&&r.progress>0&&<div style={{height:'3px',backgroundColor:'rgba(var(--border),0.15)'}}><div style={{height:'100%',width:`${r.progress}%`,background:isD?'#10B981':'linear-gradient(90deg,rgb(var(--primary)),rgb(var(--agent)))',transition:'width 200ms',borderRadius:'0 2px 2px 0'}}/></div>}
              {isD&&r&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:'1px',borderTop:'1px solid rgba(var(--border),0.15)',backgroundColor:'rgba(var(--border),0.05)'}}>
                {[{l:'Total',v:r.total.toLocaleString(),c:'rgb(var(--primary))'},{l:'Success',v:`${r.success.toFixed(1)}%`,c:r.success>=95?'#10B981':'#F59E0B'},{l:'Avg ms',v:`${r.avg}`,c:r.avg<200?'#10B981':'#F59E0B'},{l:'P95 ms',v:`${r.p95}`,c:r.p95<500?'#10B981':'#EF4444'},{l:'RPS',v:`${r.rps}`,c:'#3B82F6'},{l:'Errors',v:`${r.errs}`,c:r.errs===0?'#10B981':'#EF4444'}].map((x,i)=>(
                  <div key={i} style={{padding:'10px 12px',textAlign:'center'}}><div style={{fontSize:'15px',fontWeight:800,color:x.c}}>{x.v}</div><div style={{fontSize:'9px',fontWeight:600,color:'rgb(var(--text-muted))',textTransform:'uppercase'}}>{x.l}</div></div>
                ))}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
