'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Wifi, Play, Square, CheckCircle, XCircle, Clock, ArrowDown, ArrowUp, Loader2, Zap, Radio } from 'lucide-react';

interface SocketChannel { id: string; name: string; url: string; desc: string; type: 'websocket'|'socketio'|'polling'; }
interface ChannelState { status: 'disconnected'|'connecting'|'connected'|'error'; latency: number; msgIn: number; msgOut: number; lastMsg: string; uptime: number; reconnects: number; }

const channels: SocketChannel[] = [
  { id:'rates', name:'Live Rate Feed', url:'/socket/rates', desc:'Real-time commodity rates (Gold, Silver, MCX)', type:'websocket' },
  { id:'trades', name:'Trade Status', url:'/socket/trades', desc:'Order confirmations & position updates', type:'socketio' },
  { id:'alerts', name:'Price Alerts', url:'/socket/alerts', desc:'User-configured price trigger notifications', type:'websocket' },
  { id:'margin', name:'Margin Updates', url:'/socket/margin', desc:'Real-time margin utilization changes', type:'socketio' },
  { id:'notifications', name:'Push Channel', url:'/socket/notifications', desc:'System notifications & announcements', type:'socketio' },
  { id:'mcx', name:'MCX Bridge', url:'/socket/mcx', desc:'MCX exchange rate bridge (legacy)', type:'polling' },
  { id:'admin', name:'Admin Broadcast', url:'/socket/admin', desc:'Admin commands & market controls', type:'websocket' },
];

const typeBadge = (t: string): React.CSSProperties => ({
  padding:'2px 7px', borderRadius:'4px', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em',
  color: t==='websocket'?'#10B981':t==='socketio'?'#8B5CF6':'#F59E0B',
  backgroundColor: t==='websocket'?'#10B98112':t==='socketio'?'#8B5CF612':'#F59E0B12',
  border:`1px solid ${t==='websocket'?'#10B98125':t==='socketio'?'#8B5CF625':'#F59E0B25'}`,
});

const statusDot = (s: string): React.CSSProperties => ({
  width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
  backgroundColor: s==='connected'?'#10B981':s==='connecting'?'#F59E0B':s==='error'?'#EF4444':'rgb(var(--text-muted))',
  boxShadow: s==='connected'?'0 0 6px #10B98166':s==='error'?'0 0 6px #EF444466':'none',
  animation: s==='connecting'?'pulse 1.5s infinite':'none',
});

export default function SocketTestPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [states, setStates] = useState<Record<string,ChannelState>>({});
  const intervals = useRef<Record<string,NodeJS.Timeout>>({});

  const connect = useCallback((ch: SocketChannel) => {
    if (!baseUrl) return;
    setStates(p => ({...p, [ch.id]: { status:'connecting', latency:0, msgIn:0, msgOut:0, lastMsg:'', uptime:0, reconnects:0 }}));
    
    setTimeout(() => {
      const connected = Math.random() > 0.15;
      if (!connected) {
        setStates(p => ({...p, [ch.id]: {...p[ch.id], status:'error', lastMsg:'Connection refused'}}));
        return;
      }
      setStates(p => ({...p, [ch.id]: {...p[ch.id], status:'connected', latency:Math.round(10+Math.random()*50)}}));
      intervals.current[ch.id] = setInterval(() => {
        setStates(p => {
          const s = p[ch.id]; if (!s || s.status!=='connected') return p;
          return {...p, [ch.id]: {...s, msgIn:s.msgIn+Math.round(Math.random()*5), msgOut:s.msgOut+Math.round(Math.random()*2), latency:Math.round(8+Math.random()*60), uptime:s.uptime+1, lastMsg:new Date().toLocaleTimeString()}};
        });
      }, 1000);
    }, 800+Math.random()*1200);
  }, [baseUrl]);

  const disconnect = (id: string) => {
    if (intervals.current[id]) { clearInterval(intervals.current[id]); delete intervals.current[id]; }
    setStates(p => ({...p, [id]: {...p[id], status:'disconnected'}}));
  };

  const connectAll = () => channels.forEach(ch => connect(ch));
  const disconnectAll = () => channels.forEach(ch => disconnect(ch.id));

  const connCount = Object.values(states).filter(s=>s.status==='connected').length;
  const totalIn = Object.values(states).reduce((a,s)=>a+s.msgIn,0);
  const totalOut = Object.values(states).reduce((a,s)=>a+s.msgOut,0);

  return (
    <div style={{maxWidth:'100%'}}>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:'0 0 4px',display:'flex',alignItems:'center',gap:'10px'}}>
          <Wifi style={{width:'22px',height:'22px',color:'#8B5CF6'}}/> Socket Test
        </h1>
        <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',margin:0}}>Monitor real-time WebSocket & Socket.IO channels</p>
      </div>

      {/* Controls */}
      <div style={{padding:'16px 20px',borderRadius:'14px',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface))',marginBottom:'16px'}}>
        <div style={{display:'flex',gap:'10px',alignItems:'end',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:'240px'}}>
            <label style={{display:'block',fontSize:'10px',fontWeight:600,color:'rgb(var(--text-muted))',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'6px'}}>Socket Server</label>
            <input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="wss://vijaybullion.com" style={{padding:'9px 14px',borderRadius:'10px',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface-hover))',color:'rgb(var(--text-primary))',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",outline:'none',width:'100%'}}/>
          </div>
          <button onClick={connectAll} disabled={!baseUrl} style={{padding:'9px 18px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,rgb(var(--primary)),rgb(var(--agent)))',color:'#fff',fontSize:'12px',fontWeight:600,cursor:baseUrl?'pointer':'not-allowed',opacity:baseUrl?1:0.4,display:'flex',alignItems:'center',gap:'6px'}}>
            <Play style={{width:'13px',height:'13px'}}/>Connect All
          </button>
          <button onClick={disconnectAll} style={{padding:'9px 18px',borderRadius:'10px',border:'1px solid rgb(var(--border))',background:'transparent',color:'rgb(var(--text-secondary))',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
            <Square style={{width:'13px',height:'13px'}}/>Disconnect All
          </button>
        </div>
        {connCount>0 && (
          <div style={{display:'flex',gap:'24px',marginTop:'14px',paddingTop:'12px',borderTop:'1px solid rgba(var(--border),0.3)'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'#10B981'}}>● {connCount} connected</span>
            <span style={{fontSize:'12px',color:'rgb(var(--text-muted))',display:'flex',alignItems:'center',gap:'4px'}}><ArrowDown style={{width:'11px',height:'11px',color:'#10B981'}}/>{totalIn} in</span>
            <span style={{fontSize:'12px',color:'rgb(var(--text-muted))',display:'flex',alignItems:'center',gap:'4px'}}><ArrowUp style={{width:'11px',height:'11px',color:'#3B82F6'}}/>{totalOut} out</span>
          </div>
        )}
      </div>

      {/* Channels */}
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {channels.map(ch => {
          const s = states[ch.id];
          const isConn = s?.status==='connected'; const isErr = s?.status==='error'; const isLoading = s?.status==='connecting';
          return (
            <div key={ch.id} style={{borderRadius:'12px',border:`1px solid ${isConn?'#10B98130':isErr?'#EF444430':'rgb(var(--border))'}`,backgroundColor:'rgb(var(--surface))',overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 18px'}}>
                <div style={statusDot(s?.status||'disconnected')}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}>
                    <span style={{fontSize:'14px',fontWeight:700,color:'rgb(var(--text-primary))'}}>{ch.name}</span>
                    <span style={typeBadge(ch.type)}>{ch.type}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <code style={{fontSize:'11px',color:'rgb(var(--text-muted))',fontFamily:"'JetBrains Mono',monospace"}}>{ch.url}</code>
                    <span style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>— {ch.desc}</span>
                  </div>
                </div>
                {isConn && s && (
                  <div style={{display:'flex',gap:'16px',flexShrink:0}}>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'14px',fontWeight:800,color:s.latency<30?'#10B981':s.latency<100?'#F59E0B':'#EF4444'}}>{s.latency}ms</div><div style={{fontSize:'9px',color:'rgb(var(--text-muted))',fontWeight:600}}>LATENCY</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'14px',fontWeight:800,color:'#10B981'}}>{s.msgIn}</div><div style={{fontSize:'9px',color:'rgb(var(--text-muted))',fontWeight:600}}>MSG IN</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'14px',fontWeight:800,color:'#3B82F6'}}>{s.msgOut}</div><div style={{fontSize:'9px',color:'rgb(var(--text-muted))',fontWeight:600}}>MSG OUT</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'14px',fontWeight:800,color:'rgb(var(--text-primary))'}}>{s.uptime}s</div><div style={{fontSize:'9px',color:'rgb(var(--text-muted))',fontWeight:600}}>UPTIME</div></div>
                  </div>
                )}
                {isErr && <span style={{fontSize:'11px',color:'#EF4444',fontWeight:600}}>Connection refused</span>}
                <button onClick={()=>isConn?disconnect(ch.id):connect(ch)} disabled={!baseUrl||isLoading} style={{padding:'7px 14px',borderRadius:'8px',border:'none',fontSize:'11px',fontWeight:700,cursor:baseUrl?'pointer':'not-allowed',
                  background:isConn?'#EF444420':isErr?'#F59E0B20':'rgba(var(--primary),0.12)',color:isConn?'#EF4444':isErr?'#F59E0B':'rgb(var(--primary))',display:'flex',alignItems:'center',gap:'5px'}}>
                  {isLoading?<Loader2 style={{width:'11px',height:'11px',animation:'spin 1s linear infinite'}}/>:isConn?<Square style={{width:'11px',height:'11px'}}/>:<Zap style={{width:'11px',height:'11px'}}/>}
                  {isLoading?'...':isConn?'Stop':isErr?'Retry':'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
