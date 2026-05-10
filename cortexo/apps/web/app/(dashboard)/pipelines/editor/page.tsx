'use client';

import { useState } from 'react';
import { GitBranch, Code2, Play, Plus, Trash2, CheckCircle, Loader2, FileCode } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

const TEMPLATES = {
  blank: { name: 'Blank', yaml: `name: My Pipeline
trigger:
  push:
    branches: [main]
stages:
  - name: Test
    run: echo "Running tests"
  - name: Deploy
    run: echo "Deploying..."
` },
  php_ci3: { name: 'PHP / CodeIgniter 3', yaml: `name: PHP CI3 Pipeline
trigger:
  push:
    branches: [main, develop]
stages:
  - name: Install Dependencies
    run: composer install --no-dev --optimize-autoloader
  - name: Lint
    run: php -l application/controllers/*.php
  - name: Run Tests
    run: vendor/bin/phpunit --configuration phpunit.xml
  - name: Security Scan
    run: vendor/bin/phpcs --standard=PSR2 application/
  - name: Deploy to Production
    run: rsync -avz --delete . user@server:/var/www/html/
` },
  node: { name: 'Node.js', yaml: `name: Node.js Pipeline
trigger:
  push:
    branches: [main]
stages:
  - name: Install
    run: npm ci
  - name: Lint
    run: npm run lint
  - name: Test
    run: npm test
  - name: Build
    run: npm run build
  - name: Deploy
    run: npm run deploy
` },
};

/* ─── Shared Styles ─── */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '14px',
  padding: '16px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: 'rgb(var(--text-muted))',
  marginBottom: '10px',
  display: 'block',
};

export default function PipelineEditorPage() {
  const [yaml, setYaml] = useState(TEMPLATES.blank.yaml);
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [projectId, setProjectId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [lineCount, setLineCount] = useState(TEMPLATES.blank.yaml.split('\n').length);

  function handleYamlChange(val: string) {
    setYaml(val);
    setLineCount(val.split('\n').length);
    setSaved(false);
    setError('');
  }

  function applyTemplate(key: string) {
    setSelectedTemplate(key);
    const t = TEMPLATES[key as keyof typeof TEMPLATES];
    if (t) { handleYamlChange(t.yaml); }
  }

  function validateYaml(): boolean {
    if (!yaml.includes('name:')) { setError('Pipeline must have a name field'); return false; }
    if (!yaml.includes('stages:')) { setError('Pipeline must have at least one stage'); return false; }
    return true;
  }

  async function savePipeline() {
    if (!validateYaml()) return;
    setSaving(true); setError('');

    // Parse basic fields from YAML for the API
    const nameMatch = yaml.match(/^name:\s*(.+)$/m);
    const name = nameMatch?.[1]?.trim() || 'New Pipeline';
    const stageMatches = [...yaml.matchAll(/^\s+-\s+name:\s*(.+)$/gm)];
    const stages = stageMatches.map(m => ({ name: m[1].trim(), type: 'shell', run: '' }));

    try {
      const r = await fetch(`${API}/pipelines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cortexo_token')}` },
        body: JSON.stringify({ name, projectId: projectId || undefined, stages, yamlConfig: yaml }),
      });
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else { const d = await r.json(); setError(d.error || 'Failed to save pipeline'); }
    } catch { setError('Network error — check API is running'); }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Pipeline Editor</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Write pipeline YAML or start from a template</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <a href="/pipelines" style={{
            padding: '8px 16px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 500,
            color: 'rgb(var(--text-secondary))',
            border: '1px solid rgb(var(--border))',
            textDecoration: 'none',
            transition: 'all 200ms',
          }}>
            View All Pipelines
          </a>
          <button
            onClick={savePipeline}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600, color: '#fff',
              border: 'none', cursor: saving ? 'wait' : 'pointer',
              background: saved ? '#10B981' : 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
              boxShadow: '0 4px 14px rgba(var(--primary), 0.3)',
              opacity: saving ? 0.6 : 1,
              transition: 'all 200ms',
            }}
          >
            {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
            : saved ? <CheckCircle style={{ width: '14px', height: '14px' }} />
            : <Play style={{ width: '14px', height: '14px' }} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Pipeline'}
          </button>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px', minHeight: '70vh' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Templates */}
          <div style={cardStyle}>
            <p style={labelStyle}>Templates</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.entries(TEMPLATES).map(([key, t]) => {
                const isSelected = selectedTemplate === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: isSelected ? 600 : 400,
                      backgroundColor: isSelected ? 'rgba(var(--primary), 0.1)' : 'transparent',
                      color: isSelected ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                      border: isSelected ? '1px solid rgba(var(--primary), 0.3)' : '1px solid transparent',
                      cursor: 'pointer', textAlign: 'left' as const,
                      transition: 'all 200ms',
                      width: '100%',
                    }}
                  >
                    <FileCode style={{ width: '13px', height: '13px', flexShrink: 0 }} /> {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project ID */}
          <div style={cardStyle}>
            <label style={labelStyle}>Project ID (optional)</label>
            <input
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              placeholder="Optional — links pipeline to a project"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                fontSize: '12px', outline: 'none',
                backgroundColor: 'rgb(var(--surface-hover))',
                border: '1px solid rgb(var(--border))',
                color: 'rgb(var(--text-primary))',
              }}
            />
          </div>

          {/* YAML Reference */}
          <div style={cardStyle}>
            <p style={labelStyle}>YAML Keys</p>
            {[
              ['name', 'Pipeline name'],
              ['trigger.push', 'Branch triggers'],
              ['stages[].name', 'Stage name'],
              ['stages[].run', 'Shell command'],
              ['stages[].type', 'Stage type'],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: '8px' }}>
                <code style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgb(var(--primary))' }}>{k}</code>
                <p style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', margin: '1px 0 0' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Code Editor ─── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRadius: '14px', overflow: 'hidden',
          backgroundColor: '#0d0d14',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: '#141420',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', opacity: 0.6 }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B', opacity: 0.6 }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.6 }} />
              <span style={{ marginLeft: '10px', fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
                pipeline.yaml
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              <span>{lineCount} lines</span>
              <span>YAML</span>
            </div>
          </div>

          {/* Editor body */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Line numbers */}
            <div style={{
              minWidth: '44px', padding: '16px 10px',
              textAlign: 'right', fontSize: '12px',
              fontFamily: 'monospace', lineHeight: '24px',
              color: 'rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              userSelect: 'none',
            }}>
              {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>

            {/* Textarea */}
            <textarea
              value={yaml}
              onChange={e => handleYamlChange(e.target.value)}
              spellCheck={false}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newVal = yaml.substring(0, start) + '  ' + yaml.substring(end);
                  handleYamlChange(newVal);
                  setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2; });
                }
              }}
              style={{
                flex: 1,
                resize: 'none',
                backgroundColor: 'transparent',
                padding: '16px',
                fontSize: '12px',
                fontFamily: 'monospace',
                lineHeight: '24px',
                color: '#e2e8f0',
                caretColor: '#818CF8',
                outline: 'none',
                border: 'none',
                tabSize: 2,
              }}
            />
          </div>

          {/* Error bar */}
          {error && (
            <div style={{
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderTop: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
            }}>
              ⚠ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
