'use client';
import { lbl } from './shared';

interface StepDatabaseProps {
  sourceDbInfo: { name: string; host: string; port: string; databaseName: string; username: string; password?: string } | null;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
}

export default function StepDatabase({ sourceDbInfo, dbHost, dbPort, dbName, dbUser, dbPass }: StepDatabaseProps) {
  return (
    <>
      {/* Source DB */}
      {sourceDbInfo && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <label style={{ ...lbl, color: '#A855F7', margin: '0 0 10px' }}>
            📦 SOURCE DB <span style={{ fontWeight: 400, fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'none' }}>Template database (clone from here)</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>Name</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{sourceDbInfo.name}</span></div>
            <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>DB</span><span style={{ color: '#A855F7', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{sourceDbInfo.databaseName || '—'}</span></div>
            <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>Host</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', wordBreak: 'break-all' }}>{sourceDbInfo.host}</span></div>
            <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '40px' }}>User</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{sourceDbInfo.username} • Port {sourceDbInfo.port}</span></div>
          </div>
        </div>
      )}

      {/* Client DB */}
      <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.12)' }}>
        <label style={{ ...lbl, color: '#22D3EE', margin: '0 0 10px', display: 'block' }}>
          🗄️ CLIENT DB <span style={{ fontWeight: 400, fontSize: '10px', color: 'rgb(var(--text-muted))', textTransform: 'none' }}>Auto-resolved from project</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Host</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{dbHost || '—'}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Port</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{dbPort || '3306'}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>DB Name</span><span style={{ color: '#22D3EE', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: 600 }}>{dbName || '—'}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>User</span><span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{dbUser || '—'}</span></div>
        </div>
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: 'rgb(var(--text-muted))', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', minWidth: '60px' }}>Pass</span>
          <span style={{ color: 'rgb(var(--text-primary))', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>{dbPass ? '••••••••' : '—'}</span>
        </div>
      </div>

      {/* DB setup SQL preview */}
      {dbName && (
        <div style={{ marginTop: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#EC4899', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚡ Database Setup Preview <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgb(var(--text-muted))', textTransform: 'none', letterSpacing: 0 }}>— 3-phase pipeline executed on deploy</span>
          </p>
          <pre style={{ margin: 0, padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(236,72,153,0.2)', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: 'rgb(var(--text-primary))', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7, maxHeight: '400px', overflow: 'auto' }}>
{`-- Phase 1: Create Client Database
CREATE DATABASE IF NOT EXISTS \`${dbName}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Phase 2: Clone from Source DB
-- mysqldump -h ${sourceDbInfo?.host || '<source_host>'} -u ${sourceDbInfo?.username || '<source_user>'} ${sourceDbInfo?.databaseName || '<source_db>'} | mysql -h ${dbHost || '<client_host>'} -u ${dbUser || '<client_user>'} ${dbName}

-- Phase 3: Truncate & Configure
USE ${dbName};
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE ci_sessions; TRUNCATE dt_admin_log; TRUNCATE dt_customer; TRUNCATE dt_transaction;
-- (full table list truncated for readability)
SET FOREIGN_KEY_CHECKS = 1;

UPDATE dt_generalsettings SET admin_company_name = '${dbName}' WHERE genid = 1;
UPDATE dt_admin_user SET admin_user_name = 'bullion', admin_user_password = MD5('<password>') WHERE admin_user_id = 3;`}
          </pre>
        </div>
      )}
    </>
  );
}
