'use client';

import React, { useState, useRef } from 'react';
import { Wifi, Play, Square, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SocketLog {
  time: string;
  type: 'connect' | 'message' | 'error' | 'disconnect' | 'info';
  data: string;
}

export default function SocketTestPage() {
  const [url, setUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<SocketLog[]>([]);
  const [message, setMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const addLog = (type: SocketLog['type'], data: string) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type, data }]);
  };

  const connect = () => {
    if (!url) return;
    try {
      addLog('info', `Connecting to ${url}...`);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => { setConnected(true); addLog('connect', 'Connected successfully'); };
      ws.onmessage = (e) => { addLog('message', typeof e.data === 'string' ? e.data : '[binary data]'); };
      ws.onerror = () => { addLog('error', 'Connection error'); };
      ws.onclose = (e) => { setConnected(false); addLog('disconnect', `Disconnected (code: ${e.code})`); wsRef.current = null; };
    } catch (err: any) {
      addLog('error', err.message);
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  };

  const sendMsg = () => {
    if (!message || !wsRef.current) return;
    wsRef.current.send(message);
    addLog('info', `Sent: ${message}`);
    setMessage('');
  };

  const typeColors: Record<string, string> = {
    connect: '#10B981', message: '#818CF8', error: '#EF4444', disconnect: '#F59E0B', info: 'rgb(var(--text-muted))',
  };
  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--background), 0.5)', color: 'rgb(var(--text-primary))', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", outline: 'none' };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Socket Test</h1>
      <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginBottom: '24px' }}>Test WebSocket connections — verify rate feed, trade, and native sockets</p>

      {/* Connection */}
      <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', marginBottom: '4px' }}>WebSocket URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="wss://vijaybullion.com/socket" style={{ ...inputStyle, width: '100%' }} disabled={connected} />
          </div>
          {connected ? (
            <button onClick={disconnect} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Square style={{ width: '14px', height: '14px' }} /> Disconnect
            </button>
          ) : (
            <button onClick={connect} disabled={!url} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: !url ? 0.5 : 1 }}>
              <Play style={{ width: '14px', height: '14px' }} /> Connect
            </button>
          )}
        </div>
        {/* Send message */}
        {connected && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input value={message} onChange={e => setMessage(e.target.value)} placeholder='{"event":"subscribe","channel":"rates"}' onKeyDown={e => e.key === 'Enter' && sendMsg()} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={sendMsg} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-secondary))', cursor: 'pointer' }}>Send</button>
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? '#10B981' : 'rgb(var(--text-muted))' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: connected ? '#10B981' : 'rgb(var(--text-muted))' }}>{connected ? 'Connected' : 'Disconnected'}</span>
        <span style={{ fontSize: '11px', color: 'rgb(var(--text-muted))' }}>· {logs.length} events</span>
      </div>

      {/* Log stream */}
      <div style={{ borderRadius: '12px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', maxHeight: '500px', overflow: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Wifi style={{ width: '32px', height: '32px', color: 'rgb(var(--text-muted))', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>Enter a WebSocket URL and connect to start testing</p>
          </div>
        ) : logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 14px', borderBottom: '1px solid rgba(var(--border), 0.2)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
            <span style={{ color: 'rgb(var(--text-muted))', flexShrink: 0, width: '70px' }}>{log.time}</span>
            <span style={{ color: typeColors[log.type], fontWeight: 600, flexShrink: 0, width: '80px', textTransform: 'uppercase', fontSize: '10px', paddingTop: '2px' }}>{log.type}</span>
            <span style={{ color: 'rgb(var(--text-primary))', wordBreak: 'break-all' }}>{log.data}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
