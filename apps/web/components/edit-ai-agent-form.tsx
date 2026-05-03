'use client';

import { useState } from 'react';
import { X, Bot, Save, Loader2, Zap, Brain, Settings, Sliders } from 'lucide-react';

interface EditAIAgentFormProps {
  agent: { id: number; name: string; model: string; temperature: number; maxTokens: number; systemPrompt: string; status: string; skills: string[] };
  onSave: (data: any) => void;
  onClose: () => void;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
  border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
  color: 'rgb(var(--text-primary))', fontSize: '13px', outline: 'none',
  fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '6px', color: 'rgb(var(--text-muted))',
};

const MODELS = ['gpt-4o', 'gpt-4-turbo', 'claude-3.5-sonnet', 'claude-3-opus', 'gemini-2.0-flash', 'deepseek-v3'];
const SKILL_OPTIONS = ['Code Review', 'Bug Detection', 'Deployment', 'Monitoring', 'Documentation', 'Security Scan', 'Performance Audit', 'Database Analysis'];

export default function EditAIAgentForm({ agent, onSave, onClose }: EditAIAgentFormProps) {
  const [name, setName] = useState(agent.name);
  const [model, setModel] = useState(agent.model);
  const [temperature, setTemperature] = useState(agent.temperature);
  const [maxTokens, setMaxTokens] = useState(agent.maxTokens);
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);
  const [status, setStatus] = useState(agent.status);
  const [skills, setSkills] = useState<string[]>(agent.skills);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onSave({ id: agent.id, name, model, temperature, maxTokens, systemPrompt, status, skills });
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 150ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '600px', maxWidth: '90vw', maxHeight: '85vh', borderRadius: '18px',
        backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)', overflow: 'hidden',
        animation: 'slideUp 200ms cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(var(--border),0.2)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot style={{ width: '16px', height: '16px', color: '#A855F7' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>Edit AI Agent</h3>
              <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: 0 }}>{agent.name} • {agent.model}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-muted))', padding: '4px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
          {/* Name + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Agent Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          {/* Model */}
          <div>
            <label style={lbl}><Brain style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Temperature + Max Tokens */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}><Sliders style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />Temperature: {temperature.toFixed(1)}</label>
              <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#A855F7' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgb(var(--text-muted))' }}>
                <span>Precise</span><span>Creative</span>
              </div>
            </div>
            <div>
              <label style={lbl}><Zap style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />Max Tokens</label>
              <input value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value) || 0)} type="number" style={inp} />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label style={lbl}><Settings style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />System Prompt</label>
            <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={4} style={{ ...inp, minHeight: '80px', resize: 'vertical' as const, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }} />
          </div>

          {/* Skills */}
          <div>
            <label style={lbl}>Skills & Capabilities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SKILL_OPTIONS.map(skill => {
                const active = skills.includes(skill);
                return (
                  <button key={skill} onClick={() => toggleSkill(skill)} style={{
                    padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                    border: active ? '1px solid #A855F7' : '1px solid rgb(var(--border))',
                    backgroundColor: active ? 'rgba(168,85,247,0.1)' : 'transparent',
                    color: active ? '#A855F7' : 'rgb(var(--text-muted))',
                    cursor: 'pointer', transition: 'all 150ms',
                  }}>
                    {active ? '✓ ' : ''}{skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(var(--border),0.15)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border))', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !name} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            color: '#fff', background: 'linear-gradient(135deg, #A855F7, #6366F1)', border: 'none', cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !name ? 0.6 : 1, boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
          }}>
            {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            Update Agent
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
