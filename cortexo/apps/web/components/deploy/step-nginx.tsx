'use client';
import { lbl } from './shared';

interface StepNginxProps {
  nginxDomain: string;
  nginxPort: string;
  nginxRoot: string;
  socketPort: string;
  rateSocketPort: string;
  wsPort: string;
  sslCert: string;
  sslKey: string;
}

export default function StepNginx({
  nginxDomain, nginxPort, nginxRoot,
  socketPort, rateSocketPort, wsPort,
  sslCert, sslKey,
}: StepNginxProps) {
  return (
    <>
      {/* Nginx Config — read-only from project settings */}
      <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <label style={{ ...lbl, color: '#3B82F6', margin: '0 0 10px', display: 'block' }}>
          🌐 NGINX CONFIG <span style={{ fontWeight: 400, fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'none' }}>Auto-resolved from project</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Domain</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600, wordBreak: 'break-all' }}>{nginxDomain || '—'}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Port</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{nginxPort || '80'}</span></div>
        </div>
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '70px' }}>Root</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', wordBreak: 'break-all' }}>{nginxRoot || '—'}</span></div>
      </div>

      {/* Socket Proxies */}
      <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
        <label style={{ ...lbl, color: '#10B981', margin: '0 0 10px', display: 'block' }}>🔌 SOCKET PROXIES <span style={{ fontWeight: 400, fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'none' }}>Port mapping</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase' }}>Socket</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{socketPort || '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase' }}>Rate</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{rateSocketPort || '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase' }}>WS</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{wsPort || '—'}</span></div>
        </div>
      </div>

      {/* SSL */}
      {(sslCert || sslKey) && (
        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)' }}>
          <label style={{ ...lbl, color: '#FBBF24', margin: '0 0 10px', display: 'block' }}>🔒 SSL</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>Cert</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', wordBreak: 'break-all' }}>{sslCert || '—'}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>Key</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', wordBreak: 'break-all' }}>{sslKey || '—'}</span></div>
          </div>
        </div>
      )}

      {/* Nginx config preview */}
      {(nginxDomain || nginxRoot) && (
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A855F7', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚡ Nginx Config Preview <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgb(var(--text-muted))', textTransform: 'none', letterSpacing: 0 }}>— auto-generated on deploy</span>
          </p>
          <pre style={{ margin: 0, padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(168,85,247,0.15)', fontSize: '10px', fontFamily: "'JetBrains Mono',monospace", color: 'rgb(var(--text-muted))', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: '250px', overflow: 'auto' }}>
{`server {
    listen ${nginxPort || '80'};
    server_name ${nginxDomain || '<domain>'};

    root ${nginxRoot || '<document-root>'};
    index index.php index.html;
${socketPort ? `
    location /socket.io/ {
        proxy_pass http://localhost:${socketPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
` : ''}${rateSocketPort ? `
    location /ratesocket/ {
        proxy_pass http://localhost:${rateSocketPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
` : ''}${wsPort ? `
    location /ws {
        proxy_pass http://127.0.0.1:${wsPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
` : ''}
    location /admin/ { try_files $uri $uri/ /admin/index.php?$query_string; }
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location /mobileapi/ { try_files $uri $uri/ /mobileapi/index.php?$query_string; }
    location /lmxtrade/winbullliteapi/ { try_files $uri $uri/ /lmxtrade/winbullliteapi/index.php?$query_string; }
    location ~ /\\.ht { deny all; }
}`}
          </pre>
        </div>
      )}
    </>
  );
}
