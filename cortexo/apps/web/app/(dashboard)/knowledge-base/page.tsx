'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, Search, MessageSquare, Send, Book, FileText, Settings, Bot, User, Loader2, Plus, Edit2, Trash2, X, ChevronDown, Copy, Download, RotateCcw, Sparkles, Clock, Filter, ArrowUpDown, FileJson, FileCode, FolderGit2 } from 'lucide-react';
import { KnowledgeDoc, KnowledgeHistoryEntry, KnowledgeProvider, api } from '@/lib/api';
import { useCortexoQuery, timeAgo as formatRelativeTime } from '@/lib/hooks';
import Link from 'next/link';
import ProjectKnowledgeTab from './ProjectKnowledgeTab';



function renderMarkdown(text: string): string {
  // Simple markdown rendering
  let html = text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:rgba(var(--border),0.3);padding:12px;border-radius:8px;overflow-x:auto;margin:8px 0;font-size:12px;"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(var(--border),0.3);padding:2px 6px;border-radius:4px;font-size:12px;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:20px;">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-left:20px;">$2</li>')
    .replace(/\n/g, '<br>');
  return html;
}

const STARTER_QUESTIONS = [
  "How do I deploy a new project?",
  "What servers are currently active?",
  "How to configure Nginx?",
  "Show recent deployments",
  "What is the platform architecture?",
];

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'qa' | 'docs' | 'project'>('qa');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');

  const { data: docs, isLoading: docsLoading, refetch: refetchDocs } = useCortexoQuery(
    ['knowledge-docs', searchQuery],
    () => api.getKnowledgeDocs({ q: searchQuery }),
  );

  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [savingDoc, setSavingDoc] = useState(false);

  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useCortexoQuery(
    ['knowledge-history'],
    () => api.getKnowledgeHistory(),
  );

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: providersData } = useCortexoQuery<any>(
    ['knowledge-providers'],
    () => api.getKnowledgeProviders(),
  );

  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Sync history with messages initially
  useEffect(() => {
    if (history && messages.length === 0) {
      const formatted = history.flatMap((h: KnowledgeHistoryEntry) => [
        { role: 'user', content: h.question, id: `q-${h.id}` },
        { role: 'assistant', content: h.answer, id: `a-${h.id}`, sources: h.sourcesUsed }
      ]);
      setMessages(formatted);
    }
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' && !e.shiftKey && activeTab === 'qa' && inputRef.current === document.activeElement) {
        e.preventDefault();
        const form = inputRef.current?.closest('form');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, input]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAsking) return;

    const userMessage = { role: 'user', content: input, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsAsking(true);

    try {
      const res = await api.askKnowledge({
        question: userMessage.content,
        provider: selectedProvider || undefined,
      }) as unknown as { data?: { answer?: string; id?: string; sourcesUsed?: string[] }; answer?: string; sources?: string[] };
      if (res && (res.data || res.answer)) {
        const answer = res.data?.answer || res.answer;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: answer,
          id: `a-${res.data?.id || Date.now()}`,
          sources: res.data?.sourcesUsed || res.sources
        }]);
        refetchHistory();
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error retrieving that information.', id: Date.now().toString() }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleStarterClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleSaveDoc = async () => {
    if (!docForm.title.trim() || !docForm.content.trim()) return;
    setSavingDoc(true);
    try {
      const payload = {
        title: docForm.title,
        content: docForm.content,
        category: docForm.category,
        tags: docForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editingDocId) {
        await api.updateKnowledgeDoc(editingDocId, payload);
      } else {
        await api.createKnowledgeDoc(payload);
      }
      setShowDocModal(false);
      setDocForm({ title: '', content: '', category: 'general', tags: '' });
      setEditingDocId(null);
      refetchDocs();
    } catch (err) { console.error(err); }
    setSavingDoc(false);
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.deleteKnowledgeDoc(id);
      refetchDocs();
    } catch (err) { console.error(err); }
  };

  const handleEditDoc = (doc: KnowledgeDoc) => {
    setDocForm({ title: doc.title, content: doc.content ?? '', category: doc.category || 'general', tags: (doc.tags || []).join(', ') });
    setEditingDocId(doc.id);
    setShowDocModal(true);
  };

  const handleExportDocs = (format: 'json' | 'markdown') => {
    if (!docs) return;
    if (format === 'json') {
      const data = docs.map(d => ({ title: d.title, content: d.content, category: d.category, tags: d.tags }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-docs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const content = docs.map(d => `# ${d.title}\n\n**Category:** ${d.category}\n**Tags:** ${(d.tags || []).join(', ')}\n\n${d.content}`).join('\n\n---\n\n');
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-docs-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Process docs with filter & sort
  const processedDocs = useMemo(() => {
    if (!docs) return [];
    let result = [...docs];
    if (categoryFilter !== 'all') {
      result = result.filter(d => d.category === categoryFilter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'updatedAt':
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });
    return result;
  }, [docs, categoryFilter, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: (docs || []).length };
    (docs || []).forEach(d => {
      const cat = d.category || 'general';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [docs]);

  // Loading skeleton
  if (docsLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
          <div style={{ flex: 1, backgroundColor: 'rgb(var(--surface))', borderRadius: '16px', border: '1px solid rgb(var(--border))', padding: '24px' }}>
            <div style={{ width: '200px', height: '20px', backgroundColor: 'rgb(var(--border))', borderRadius: '8px', marginBottom: '20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '80px', backgroundColor: 'rgb(var(--border))', borderRadius: '12px' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="cx-flex-between" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
        <div>
          <h1 className="cx-fw-700 cx-text-primary cx-page-title cx-flex cx-items-center cx-gap-10" style={{ margin: 0 }}>
            <BookOpen style={{ width: '24px', height: '24px' }} className="cx-text-accent" />
            Knowledge Base
          </h1>
          <p className="cx-text-secondary cx-text-14" style={{ marginTop: '6px', margin: 0 }}>
            Unified AI Q&A Engine and Systems Documentation
          </p>
        </div>

        <div className="cx-flex cx-surface cx-border cx-r-10" style={{ padding: '4px' }}>
          <button onClick={() => setActiveTab('qa')} className="cx-flex cx-items-center cx-gap-6 cx-fw-600" style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', backgroundColor: activeTab === 'qa' ? 'rgba(var(--primary), 0.1)' : 'transparent', color: activeTab === 'qa' ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))' }}>
            <MessageSquare style={{ width: '14px', height: '14px' }} /> AI Assistant
          </button>
          <button onClick={() => setActiveTab('docs')} className="cx-flex cx-items-center cx-gap-6 cx-fw-600" style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', backgroundColor: activeTab === 'docs' ? 'rgba(var(--primary), 0.1)' : 'transparent', color: activeTab === 'docs' ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))' }}>
            <Book style={{ width: '14px', height: '14px' }} /> Documentation
          </button>
          <button onClick={() => setActiveTab('project')} className="cx-flex cx-items-center cx-gap-6 cx-fw-600" style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', backgroundColor: activeTab === 'project' ? 'rgba(var(--primary), 0.1)' : 'transparent', color: activeTab === 'project' ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))' }}>
            <FolderGit2 style={{ width: '14px', height: '14px' }} /> Project Knowledge
          </button>
        </div>
      </div>

      <div className="cx-surface cx-border cx-r-16" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'qa' ? (
          // Q&A Assistant
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.length === 0 && !historyLoading ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'rgb(var(--text-muted))', maxWidth: '500px' }}>
                  <Bot style={{ width: '56px', height: '56px', opacity: 0.5, margin: '0 auto 20px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', marginBottom: '12px' }}>How can I help you?</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>Ask me anything about the platform's architecture, deployments, or troubleshooting.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {STARTER_QUESTIONS.map((q, i) => (
                      <button key={i} onClick={() => handleStarterClick(q)} style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-secondary))', fontSize: '12px', cursor: 'pointer' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                      <button onClick={handleClearChat} className="cx-flex cx-items-center cx-gap-6 cx-text-12 cx-text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' }}>
                        <RotateCcw style={{ width: '12px', height: '12px' }} /> Clear Chat
                      </button>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, backgroundColor: msg.role === 'user' ? 'rgb(var(--primary))' : 'rgba(var(--agent), 0.1)', color: msg.role === 'user' ? '#fff' : 'rgb(var(--agent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {msg.role === 'user' ? <User style={{ width: '18px', height: '18px' }} /> : <Bot style={{ width: '18px', height: '18px' }} />}
                      </div>
                      <div style={{ backgroundColor: msg.role === 'user' ? 'rgba(var(--primary), 0.1)' : 'rgba(var(--border), 0.3)', border: `1px solid ${msg.role === 'user' ? 'rgba(var(--primary), 0.2)' : 'rgb(var(--border))'}`, padding: '16px', borderRadius: '16px', borderTopRightRadius: msg.role === 'user' ? '4px' : '16px', borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px', position: 'relative' }}>
                        {msg.role === 'assistant' && (
                          <button onClick={() => handleCopyMessage(msg.content)} title="Copy" style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgb(var(--text-muted))' }}>
                            <Copy style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}
                        <div style={{ fontSize: '14px', color: 'rgb(var(--text-primary))', lineHeight: 1.6, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                        {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(var(--border), 0.5)' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>Sources:</span>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                              {msg.sources.map((src: string, i: number) => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-secondary))' }}>
                                  <FileText style={{ width: '10px', height: '10px' }} /> {src}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
              {isAsking && (
                <div style={{ display: 'flex', gap: '16px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, backgroundColor: 'rgba(var(--agent), 0.1)', color: 'rgb(var(--agent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div style={{ padding: '16px', borderRadius: '16px', borderTopLeftRadius: '4px', backgroundColor: 'rgba(var(--border), 0.3)', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgb(var(--text-muted))' }}>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--surface-hover), 0.5)' }}>
              <form onSubmit={handleAsk} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {providersData?.available?.length > 1 && (
                  <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '12px', cursor: 'pointer', minWidth: '120px' }}>
                    <option value="">Auto</option>
                    {providersData?.available?.map((p: KnowledgeProvider) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                )}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question... (Enter to send, Shift+Enter for newline)"
                  disabled={isAsking}
                  rows={1}
                  style={{
                    flex: 1, padding: '14px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))',
                    backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '15px',
                    outline: 'none', resize: 'none', minHeight: '48px', maxHeight: '120px',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(var(--primary))'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(var(--border))'}
                />
                <button type="submit" disabled={isAsking || !input.trim()} style={{ padding: '14px 24px', borderRadius: '12px', border: 'none', cursor: isAsking || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', opacity: isAsking || !input.trim() ? 0.6 : 1 }}>
                  <Send style={{ width: '18px', height: '18px' }} />
                </button>
              </form>
            </div>
          </>
        ) : activeTab === 'docs' ? (
          // Documentation
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="cx-flex cx-items-center cx-gap-12 cx-p-20 cx-border-b" style={{ flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px' }} className="cx-text-muted" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search docs..." className="cx-input" style={{ width: '100%', padding: '10px 16px 10px 44px', boxSizing: 'border-box' }} />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '12px', cursor: 'pointer' }}>
                <option value="all">All Categories ({categoryCounts.all})</option>
                {Object.entries(categoryCounts).filter(([k]) => k !== 'all').map(([cat, count]) => (
                  <option key={cat} value={cat}>{cat} ({count})</option>
                ))}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'updatedAt' | 'createdAt' | 'title')} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '12px', cursor: 'pointer' }}>
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
              </select>
              <div className="cx-flex cx-gap-4">
                <button onClick={() => handleExportDocs('json')} className="cx-icon-btn cx-text-muted" title="Export JSON" style={{ padding: '8px' }}>
                  <FileJson style={{ width: '16px', height: '16px' }} />
                </button>
                <button onClick={() => handleExportDocs('markdown')} className="cx-icon-btn cx-text-muted" title="Export Markdown" style={{ padding: '8px' }}>
                  <FileCode style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <button onClick={() => { setDocForm({ title: '', content: '', category: 'general', tags: '' }); setEditingDocId(null); setShowDocModal(true); }} className="cx-btn-primary cx-flex cx-items-center cx-gap-6 cx-fw-600" style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Create Doc
              </button>
            </div>

            {/* Stats */}
            <div className="cx-flex cx-gap-12 cx-p-16 cx-border-b" style={{ flexWrap: 'wrap', backgroundColor: 'rgba(var(--primary), 0.03)' }}>
              {Object.entries(categoryCounts).filter(([k]) => k !== 'all').slice(0, 5).map(([cat, count]) => (
                <span key={cat} className="cx-fw-600 cx-text-11" style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-secondary))' }}>
                  {cat}: {count}
                </span>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {docsLoading ? (
                <div style={{ textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '40px' }}>Loading...</div>
              ) : processedDocs.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '60px' }}>
                  <FileText style={{ width: '48px', height: '48px', opacity: 0.5, margin: '0 auto 16px' }} />
                  <p>No documents found{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                  {processedDocs.map((doc: KnowledgeDoc) => (
                    <div key={doc.id} className="cx-card cx-flex-col" style={{ display: 'flex', flexDirection: 'column', padding: '20px', transition: 'all 200ms', position: 'relative' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--primary))'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; }}
                    >
                      <div className="cx-flex-between cx-mb-12">
                        <span className="cx-fw-600 cx-text-accent" style={{ fontSize: '10px', textTransform: 'uppercase', backgroundColor: 'rgba(var(--primary), 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                          {doc.category}
                        </span>
                        <div className="cx-flex cx-gap-4">
                          <button onClick={() => handleEditDoc(doc)} className="cx-icon-btn cx-text-muted" style={{ padding: '4px' }} title="Edit"><Edit2 style={{ width: '14px', height: '14px' }} /></button>
                          <button onClick={() => handleDeleteDoc(doc.id)} className="cx-icon-btn cx-text-danger" style={{ padding: '4px' }} title="Delete"><Trash2 style={{ width: '14px', height: '14px' }} /></button>
                        </div>
                      </div>

                      <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 8px 0' }}>{doc.title}</h3>
                      <p className="cx-text-secondary cx-text-13" style={{ lineHeight: 1.5, margin: '0 0 12px 0', flex: 1 }}>
                        {(doc.content ?? '').length > 150 ? `${(doc.content ?? '').substring(0, 150)}...` : (doc.content ?? '')}
                      </p>

                      <div className="cx-flex cx-items-center cx-gap-8 cx-text-muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
                        <span className="cx-flex cx-items-center cx-gap-4"><Clock style={{ width: '10px', height: '10px' }} />{formatRelativeTime(doc.updatedAt || doc.createdAt || null)}</span>
                      </div>

                      <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap' }}>
                        {doc.tags?.map((tag: string) => (
                          <span key={tag} className="cx-text-muted cx-text-11" style={{ backgroundColor: 'rgba(var(--border), 0.3)', padding: '2px 8px', borderRadius: '12px' }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'project' ? (
          <ProjectKnowledgeTab />
        ) : null}
      </div>

      {showDocModal && (
        <div className="cx-modal-overlay" onClick={() => setShowDocModal(false)}>
          <div onClick={e => e.stopPropagation()} className="cx-surface cx-border cx-r-16" style={{ width: '560px', maxHeight: '80vh', overflow: 'auto', padding: '32px' }}>
            <div className="cx-flex-between cx-items-center cx-mb-24">
              <h2 className="cx-fw-700 cx-text-primary" style={{ margin: 0, fontSize: '20px' }}>{editingDocId ? 'Edit Document' : 'Create Document'}</h2>
              <button onClick={() => setShowDocModal(false)} className="cx-icon-btn cx-text-muted"><X style={{ width: '20px', height: '20px' }} /></button>
            </div>

            <div className="cx-flex-col cx-gap-16">
              <div>
                <label className="cx-label" style={{ marginBottom: '6px' }}>Title</label>
                <input value={docForm.title} onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Nginx Configuration Guide" className="cx-input" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label className="cx-label" style={{ marginBottom: '6px' }}>Content</label>
                <textarea value={docForm.content} onChange={e => setDocForm(f => ({ ...f, content: e.target.value }))} placeholder="Document content..." rows={8} className="cx-input" style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div className="cx-grid-2-sm">
                <div>
                  <label className="cx-label" style={{ marginBottom: '6px' }}>Category</label>
                  <select value={docForm.category} onChange={e => setDocForm(f => ({ ...f, category: e.target.value }))} className="cx-input" style={{ width: '100%' }}>
                    <option value="general">General</option>
                    <option value="architecture">Architecture</option>
                    <option value="deployment">Deployment</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="security">Security</option>
                    <option value="troubleshooting">Troubleshooting</option>
                  </select>
                </div>
                <div>
                  <label className="cx-label" style={{ marginBottom: '6px' }}>Tags</label>
                  <input value={docForm.tags} onChange={e => setDocForm(f => ({ ...f, tags: e.target.value }))} placeholder="nginx, config, deploy" className="cx-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button onClick={handleSaveDoc} disabled={savingDoc || !docForm.title.trim() || !docForm.content.trim()} className="cx-fw-600" style={{ padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff', fontSize: '14px', marginTop: '8px', opacity: savingDoc || !docForm.title.trim() ? 0.6 : 1 }}>
                {savingDoc ? 'Saving...' : editingDocId ? 'Update Document' : 'Create Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}