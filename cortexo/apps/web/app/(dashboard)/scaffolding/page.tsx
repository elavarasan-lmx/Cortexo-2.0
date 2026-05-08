'use client';

import { useState } from 'react';
import { Layers, Plus, Terminal, Copy, ArrowRight, Check } from 'lucide-react';

export default function ScaffoldingPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const templates = [
    {
      id: 1,
      name: 'Next.js Frontend',
      description: 'Standard Next.js 14 setup with Tailwind CSS, Framer Motion, and lucide-react.',
      command: 'npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"',
      icon: Layers,
      color: '#7C3AED'
    },
    {
      id: 2,
      name: 'Node.js Backend',
      description: 'Express.js backend with TypeScript, Prisma ORM, and PostgreSQL setup.',
      command: 'git clone https://github.com/cortexo/node-starter.git && cd node-starter && npm install',
      icon: Terminal,
      color: '#10B981'
    },
    {
      id: 3,
      name: 'Agent Framework',
      description: 'Python-based AI agent framework with LangChain and vector database integrations.',
      command: 'pip install cortexo-agents langchain openai chromadb',
      icon: Layers,
      color: '#F59E0B'
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Scaffolding</h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>
            Generate new projects instantly using our optimized templates.
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', boxShadow: '0 4px 12px rgba(var(--primary), 0.3)' }}>
          <Plus style={{ width: '16px', height: '16px' }} /> Custom Template
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {templates.map((t, i) => (
          <div key={t.id} style={{ borderRadius: '14px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgb(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${t.color}20, ${t.color}08)`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.icon style={{ width: '24px', height: '24px', color: t.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: '0 0 4px 0' }}>{t.name}</h3>
                  <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0, lineHeight: 1.5 }}>{t.description}</p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '20px 24px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Run Command</span>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ padding: '12px 16px', paddingRight: '48px', borderRadius: '8px', backgroundColor: '#0F172A', color: '#38BDF8', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-all' }}>
                  {t.command}
                </div>
                <button 
                  onClick={() => handleCopy(t.command, i)}
                  style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', borderRadius: '6px', background: copiedIndex === i ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {copiedIndex === i ? 
                    <Check style={{ width: '14px', height: '14px', color: '#10B981' }} /> : 
                    <Copy style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
                  }
                </button>
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgb(var(--border))', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--primary))', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                View Documentation <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
