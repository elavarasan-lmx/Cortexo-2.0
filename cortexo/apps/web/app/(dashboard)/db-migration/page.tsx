'use client';

import { Database, ArrowLeftRight, Construction } from 'lucide-react';

/**
 * DB Migration — Currently Disabled
 *
 * The legacy MySQL-based migration tool (mysql2) has been removed.
 * Cortexo is now fully PostgreSQL via Drizzle ORM.
 *
 * This page will be re-implemented as a PostgreSQL schema comparison
 * tool using Drizzle's introspection capabilities.
 */
export default function DbMigrationPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database style={{ width: '22px', height: '22px', color: 'rgb(var(--primary))' }} />
          DB Migration
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
          Compare and migrate database schemas across environments
        </p>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '64px 20px', border: '2px dashed rgb(var(--border))', borderRadius: '14px',
        backgroundColor: 'rgb(var(--surface))', textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '16px', backgroundColor: 'rgba(var(--primary), 0.08)', marginBottom: '16px',
        }}>
          <Construction style={{ width: '28px', height: '28px', color: 'rgb(var(--primary))' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>
          Migration Tool — Upgrading to PostgreSQL
        </h2>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', maxWidth: '420px', lineHeight: 1.6 }}>
          The legacy MySQL migration tool has been retired. A new PostgreSQL schema comparison tool
          powered by Drizzle ORM introspection is under development.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px',
          padding: '10px 20px', borderRadius: '10px', border: '1px solid rgb(var(--border))',
          backgroundColor: 'rgba(var(--background), 0.5)', fontSize: '12px', color: 'rgb(var(--text-muted))',
        }}>
          <ArrowLeftRight style={{ width: '14px', height: '14px' }} />
          <span>Use <code style={{ color: 'rgb(var(--primary))' }}>npx drizzle-kit push</code> for schema management</span>
        </div>
      </div>
    </div>
  );
}
