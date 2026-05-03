'use client';
import React, { useState } from 'react';
import { ClipboardCheck, Check, Circle, ChevronDown, ChevronRight, AlertTriangle, Smartphone, Globe } from 'lucide-react';

interface CheckItem { id: string; label: string; desc: string; priority: 'high'|'medium'|'low'; platform: 'ionic'|'flutter'|'both'; }
interface CheckGroup { title: string; items: CheckItem[]; }

const CHECKLIST: CheckGroup[] = [
  { title: 'Pre-Deployment', items: [
    { id:'pd1', label:'DB Migration Scripts', desc:'Run pending migrations on staging', priority:'high', platform:'both' },
    { id:'pd2', label:'API Version Bump', desc:'Update API version in config', priority:'high', platform:'both' },
    { id:'pd3', label:'Environment Variables', desc:'Verify .env on production server', priority:'high', platform:'both' },
    { id:'pd4', label:'SSL Certificate Check', desc:'Ensure cert not expiring within 30 days', priority:'medium', platform:'both' },
    { id:'pd5', label:'Backup Database', desc:'Full mysqldump before deploy', priority:'high', platform:'both' },
  ]},
  { title: 'Rate Engine', items: [
    { id:'re1', label:'Rate Feed Connectivity', desc:'Verify WebSocket connects to rate provider', priority:'high', platform:'both' },
    { id:'re2', label:'MCX Bridge Status', desc:'Check MCX feed is receiving data', priority:'high', platform:'ionic' },
    { id:'re3', label:'Margin Config', desc:'Verify buy/sell margins match admin settings', priority:'high', platform:'both' },
    { id:'re4', label:'Rate Freeze Detection', desc:'Confirm stale rate alerts are working', priority:'medium', platform:'both' },
  ]},
  { title: 'Trade Module', items: [
    { id:'tm1', label:'Market Order Flow', desc:'Test full buy/sell market order cycle', priority:'high', platform:'both' },
    { id:'tm2', label:'Limit Order Flow', desc:'Place, modify, cancel limit order', priority:'high', platform:'both' },
    { id:'tm3', label:'Position Close', desc:'Close open position and verify ledger', priority:'high', platform:'both' },
    { id:'tm4', label:'Trade Notifications', desc:'Confirm push/SMS on trade execution', priority:'medium', platform:'flutter' },
    { id:'tm5', label:'Brokerage Calculation', desc:'Verify brokerage deducted correctly', priority:'high', platform:'both' },
  ]},
  { title: 'Client Module', items: [
    { id:'cm1', label:'Login Flow', desc:'OTP send, verify, session creation', priority:'high', platform:'both' },
    { id:'cm2', label:'Client Registration', desc:'New client signup with KYC', priority:'medium', platform:'flutter' },
    { id:'cm3', label:'Ledger Balance', desc:'Match ledger with actual balance', priority:'high', platform:'both' },
    { id:'cm4', label:'Ban/Unban Toggle', desc:'Test client access restriction', priority:'medium', platform:'ionic' },
  ]},
  { title: 'Reports', items: [
    { id:'rp1', label:'Daily Report Generation', desc:'Generate and verify day-end report', priority:'medium', platform:'both' },
    { id:'rp2', label:'Sauda Report', desc:'Verify trade-wise sauda statement', priority:'medium', platform:'ionic' },
    { id:'rp3', label:'Bill Generation', desc:'PDF bill creation and download', priority:'low', platform:'ionic' },
    { id:'rp4', label:'P&L Accuracy', desc:'Cross-check P&L with manual calc', priority:'high', platform:'both' },
  ]},
  { title: 'Mobile App', items: [
    { id:'ma1', label:'App Version Gate', desc:'Force update if version below minimum', priority:'high', platform:'flutter' },
    { id:'ma2', label:'Offline Handling', desc:'Show proper UI when no internet', priority:'medium', platform:'flutter' },
    { id:'ma3', label:'Push Notification', desc:'Receive FCM notification on device', priority:'medium', platform:'flutter' },
    { id:'ma4', label:'Biometric Login', desc:'Fingerprint/Face ID auth flow', priority:'low', platform:'flutter' },
    { id:'ma5', label:'Socket Reconnect', desc:'Auto-reconnect after app resume', priority:'high', platform:'flutter' },
  ]},
];

const priorityStyle = (p: string): React.CSSProperties => ({
  padding:'2px 7px', borderRadius:'4px', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em',
  color: p==='high'?'#EF4444':p==='medium'?'#F59E0B':'#10B981',
  backgroundColor: p==='high'?'#EF444412':p==='medium'?'#F59E0B12':'#10B98112',
});
const platStyle = (p: string): React.CSSProperties => ({
  padding:'2px 7px', borderRadius:'4px', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em',
  color: p==='ionic'?'#F59E0B':p==='flutter'?'#3B82F6':'#10B981',
  backgroundColor: p==='ionic'?'#F59E0B12':p==='flutter'?'#3B82F612':'#10B98112',
});

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string,boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string,boolean>>({});

  const toggle = (id: string) => setChecked(p => ({...p, [id]:!p[id]}));
  const toggleGroup = (t: string) => setCollapsed(p => ({...p, [t]:!p[t]}));

  const allItems = CHECKLIST.flatMap(g=>g.items);
  const doneCount = allItems.filter(i=>checked[i.id]).length;
  const totalCount = allItems.length;
  const pct = totalCount>0?Math.round((doneCount/totalCount)*100):0;

  return (
    <div style={{maxWidth:'100%'}}>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px',fontWeight:700,color:'rgb(var(--text-primary))',margin:'0 0 4px',display:'flex',alignItems:'center',gap:'10px'}}>
          <ClipboardCheck style={{width:'22px',height:'22px',color:'#F59E0B'}}/> Deployment Checklist
        </h1>
        <p style={{fontSize:'13px',color:'rgb(var(--text-secondary))',margin:0}}>Pre-deployment verification for WinBull Ionic & Flutter releases</p>
      </div>

      {/* Progress */}
      <div style={{padding:'18px 20px',borderRadius:'14px',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface))',marginBottom:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
          <span style={{fontSize:'14px',fontWeight:700,color:'rgb(var(--text-primary))'}}>{doneCount} / {totalCount} completed</span>
          <span style={{fontSize:'18px',fontWeight:800,color:pct===100?'#10B981':pct>=50?'#F59E0B':'rgb(var(--text-muted))'}}>{pct}%</span>
        </div>
        <div style={{height:'8px',borderRadius:'4px',backgroundColor:'rgba(var(--border),0.15)',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:pct===100?'#10B981':'linear-gradient(90deg,rgb(var(--primary)),rgb(var(--agent)))',transition:'width 300ms',borderRadius:'4px'}}/>
        </div>
        {pct===100 && <div style={{marginTop:'10px',fontSize:'13px',fontWeight:600,color:'#10B981',display:'flex',alignItems:'center',gap:'6px'}}><Check style={{width:'16px',height:'16px'}}/>All checks passed! Ready to deploy 🚀</div>}
      </div>

      {/* Groups */}
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {CHECKLIST.map(g => {
          const isCollapsed = collapsed[g.title];
          const gDone = g.items.filter(i=>checked[i.id]).length;
          return (
            <div key={g.title} style={{borderRadius:'12px',border:'1px solid rgb(var(--border))',backgroundColor:'rgb(var(--surface))',overflow:'hidden'}}>
              <button onClick={()=>toggleGroup(g.title)} style={{display:'flex',alignItems:'center',gap:'10px',width:'100%',padding:'12px 16px',border:'none',backgroundColor:'transparent',cursor:'pointer',color:'rgb(var(--text-primary))'}}>
                {isCollapsed?<ChevronRight style={{width:'14px',height:'14px',color:'rgb(var(--text-muted))'}}/>:<ChevronDown style={{width:'14px',height:'14px',color:'rgb(var(--text-muted))'}}/>}
                <span style={{fontSize:'13px',fontWeight:700}}>{g.title}</span>
                <span style={{fontSize:'11px',color:'rgb(var(--text-muted))',fontWeight:500}}>{gDone}/{g.items.length}</span>
                {gDone===g.items.length && <Check style={{width:'14px',height:'14px',color:'#10B981',marginLeft:'auto'}}/>}
              </button>
              {!isCollapsed && g.items.map(item => (
                <div key={item.id} onClick={()=>toggle(item.id)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 16px',borderTop:'1px solid rgba(var(--border),0.1)',cursor:'pointer',opacity:checked[item.id]?0.6:1,transition:'opacity 150ms'}}>
                  <div style={{width:'20px',height:'20px',borderRadius:'6px',border:`2px solid ${checked[item.id]?'#10B981':'rgb(var(--border))'}`,backgroundColor:checked[item.id]?'#10B981':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 150ms'}}>
                    {checked[item.id] && <Check style={{width:'12px',height:'12px',color:'#fff'}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'13px',fontWeight:600,color:'rgb(var(--text-primary))',textDecoration:checked[item.id]?'line-through':'none'}}>{item.label}</div>
                    <div style={{fontSize:'11px',color:'rgb(var(--text-muted))'}}>{item.desc}</div>
                  </div>
                  <span style={priorityStyle(item.priority)}>{item.priority}</span>
                  <span style={platStyle(item.platform)}>{item.platform}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
