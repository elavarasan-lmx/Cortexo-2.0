'use client';

import { BookOpen, Search, FileText, Code2, Server, GitBranch, ChevronRight, ExternalLink } from 'lucide-react';
import { useAutoLoadToken } from '@/lib/hooks';
import { useState } from 'react';

const docSections = [
  { id: '1', title: 'Getting Started', icon: BookOpen, description: 'Platform setup, authentication, and first deployment', articles: 12, color: '#818CF8' },
  { id: '2', title: 'API Reference', icon: Code2, description: 'REST API endpoints, authentication, and rate limits', articles: 34, color: '#3B82F6' },
  { id: '3', title: 'Infrastructure', icon: Server, description: 'Server management, scaling, and monitoring setup', articles: 18, color: '#10B981' },
  { id: '4', title: 'CI/CD Pipelines', icon: GitBranch, description: 'Pipeline configuration, stages, and deployment strategies', articles: 22, color: '#F59E0B' },
  { id: '5', title: 'Agent Intelligence', icon: FileText, description: 'Agent configuration, skill development, and memory management', articles: 15, color: '#A78BFA' },
  { id: '6', title: 'Troubleshooting', icon: FileText, description: 'Common issues, debugging guides, and FAQ', articles: 28, color: '#EF4444' },
];

export default function DocsPage() {
  useAutoLoadToken();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = docSections.filter((d) => !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen style={{ width: '22px', height: '22px', color: '#818CF8' }} /> Documentation
        </h1>
        <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', marginTop: '4px' }}>Platform guides, API reference, and troubleshooting</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', marginBottom: '24px', maxWidth: '480px' }}>
        <Search style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))' }} />
        <input type="text" placeholder="Search documentation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: 'rgb(var(--text-primary))', width: '100%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {filtered.map((doc) => {
          const Icon = doc.icon;
          return (
            <div key={doc.id} style={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '14px', padding: '22px', transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 6px 20px -4px ${doc.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: doc.color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: `${doc.color}12`, flexShrink: 0 }}>
                  <Icon style={{ width: '18px', height: '18px', color: doc.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>{doc.title}</h3>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', margin: '6px 0 0', lineHeight: 1.5 }}>{doc.description}</p>
                  <p style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', margin: '8px 0 0' }}>{doc.articles} articles</p>
                </div>
                <ChevronRight style={{ width: '16px', height: '16px', color: 'rgb(var(--text-muted))', flexShrink: 0, marginTop: '4px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
