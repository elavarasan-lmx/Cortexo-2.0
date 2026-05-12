'use client';

interface StepPm2Props {
  remotePath: string;
  wsPort: string;
  socketPort: string;
  pm2Name: string;
  pm2Script: string;
  pm2Interpreter: string;
  pm2Instances: string;
  pm2Args: string;
}

export default function StepPm2({ remotePath, wsPort, socketPort, pm2Name, pm2Script, pm2Interpreter, pm2Instances, pm2Args }: StepPm2Props) {
  const slug = (remotePath || '').split('/').pop() || '<slug>';
  const path = remotePath || '/var/www/html/<slug>';

  return (
    <>
      {/* PM2 Commands preview */}
      <div style={{ marginTop: '8px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B5CF6', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚡ PM2 Commands Preview
          <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgb(var(--text-muted))', textTransform: 'none', letterSpacing: 0 }}>— auto-generated from project slug</span>
        </p>
        <pre style={{ margin: 0, padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: 'rgb(var(--text-primary))', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
{`# Native WebSocket — Rate file watcher (port ${wsPort || '?'})
pm2 start ${path}/client/${slug}-ws.js --name "${slug}-ws"

# Socket.IO — Redis pub/sub events (port ${socketPort || '?'})
pm2 start ${path}/lmxtrade/${slug}winlitesocket.js --name "${slug}-socketio"

pm2 save`}
        </pre>
      </div>

      {/* Custom PM2 summary if set */}
      {(pm2Name || pm2Script) && (
        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', marginTop: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B5CF6', margin: '0 0 10px', display: 'block' }}>⚙️ Custom PM2 Config</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '12px' }}>
            {pm2Name && <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Name</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{pm2Name}</span></div>}
            {pm2Script && <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Script</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{pm2Script}</span></div>}
            {pm2Interpreter && <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Runtime</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{pm2Interpreter}</span></div>}
            {pm2Instances && <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Instances</span><span style={{ color: '#8B5CF6', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{pm2Instances}</span></div>}
          </div>
          {pm2Args && <div style={{ marginTop: '8px', display: 'flex', gap: '6px', fontSize: '12px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Args</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', wordBreak: 'break-all' }}>{pm2Args}</span></div>}
        </div>
      )}
    </>
  );
}
