'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, Search, MessageSquare, Send, Book, FileText, Settings, Bot, User, Loader2, Plus, Edit2, Trash2, X, ChevronDown } from 'lucide-react';
import { KnowledgeDoc, KnowledgeHistoryEntry, KnowledgeProvider, api } from '@/lib/api';
import { useCortexoQuery, timeAgo } from '@/lib/hooks';


export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'qa' | 'docs'>('qa');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: docs, isLoading: docsLoading, refetch: refetchDocs } = useCortexoQuery(
    ['knowledge-docs', searchQuery],
    () => api.getKnowledgeDocs({ q: searchQuery }),
  );


  // Doc CRUD state
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
      }) as any;
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

        {/* Custom Tabs */}
        <div className="cx-flex cx-surface cx-border cx-r-10" style={{ padding: '4px' }}>
          <button
            onClick={() => setActiveTab('qa')}
            className="cx-flex cx-items-center cx-gap-6 cx-fw-600"
            style={{
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px',
              backgroundColor: activeTab === 'qa' ? 'rgba(var(--primary), 0.1)' : 'transparent',
              color: activeTab === 'qa' ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
              transition: 'all 200ms'
            }}
          >
            <MessageSquare style={{ width: '14px', height: '14px' }} /> AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className="cx-flex cx-items-center cx-gap-6 cx-fw-600"
            style={{
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px',
              backgroundColor: activeTab === 'docs' ? 'rgba(var(--primary), 0.1)' : 'transparent',
              color: activeTab === 'docs' ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
              transition: 'all 200ms'
            }}
          >
            <Book style={{ width: '14px', height: '14px' }} /> Documentation
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="cx-surface cx-border cx-r-16" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {activeTab === 'qa' ? (
          // ─── Q&A Assistant View ───────────────────────────────
          <>
            {/* Chat History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.length === 0 && !historyLoading ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'rgb(var(--text-muted))', maxWidth: '400px' }}>
                  <Bot style={{ width: '48px', height: '48px', opacity: 0.5, margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: '8px' }}>How can I help you?</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.5 }}>Ask me anything about the platform's architecture, existing deployments, or troubleshooting procedures.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', gap: '16px', 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    maxWidth: '80%' 
                  }}>
                    {/* Avatar */}
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: msg.role === 'user' ? 'rgb(var(--primary))' : 'rgba(var(--agent), 0.1)',
                      color: msg.role === 'user' ? '#fff' : 'rgb(var(--agent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {msg.role === 'user' ? <User style={{ width: '18px', height: '18px' }} /> : <Bot style={{ width: '18px', height: '18px' }} />}
                    </div>

                    {/* Bubble */}
                    <div style={{ 
                      backgroundColor: msg.role === 'user' ? 'rgba(var(--primary), 0.1)' : 'rgba(var(--border), 0.3)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(var(--primary), 0.2)' : 'rgb(var(--border))'}`,
                      padding: '16px', borderRadius: '16px',
                      borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                      borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                    }}>
                      <div style={{ fontSize: '14px', color: 'rgb(var(--text-primary))', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </div>
                      
                      {/* References */}
                      {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(var(--border), 0.5)' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--text-muted))', textTransform: 'uppercase' }}>Sources Used:</span>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {msg.sources.map((src: string, i: number) => (
                              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-secondary))' }}>
                                <FileText style={{ width: '10px', height: '10px' }} /> Doc Ref
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isAsking && (
                <div style={{ display: 'flex', gap: '16px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, backgroundColor: 'rgba(var(--agent), 0.1)', color: 'rgb(var(--agent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div style={{ padding: '16px', borderRadius: '16px', borderTopLeftRadius: '4px', backgroundColor: 'rgba(var(--border), 0.3)', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgb(var(--text-muted))' }}>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Searching Knowledge Base...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', borderTop: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--surface-hover), 0.5)' }}>
              <form onSubmit={handleAsk} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Provider selector */}
                {providersData?.available?.length > 1 && (
                  <select
                    value={selectedProvider}
                    onChange={e => setSelectedProvider(e.target.value)}
                    style={{
                      padding: '14px 12px', borderRadius: '12px', border: '1px solid rgb(var(--border))',
                      backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '13px',
                      outline: 'none', cursor: 'pointer', minWidth: '160px', fontWeight: 500
                    }}
                  >
                    <option value="">Auto ({providersData?.default || 'none'})</option>
                    {providersData?.available?.map((p: KnowledgeProvider) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.free ? ' — Free' : ' — Paid'}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isAsking}
                  style={{
                    flex: 1, padding: '14px 20px', borderRadius: '12px', border: '1px solid rgb(var(--border))',
                    backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-primary))', fontSize: '15px',
                    outline: 'none', transition: 'border-color 200ms'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(var(--primary))'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(var(--border))'}
                />
                <button
                  type="submit"
                  disabled={isAsking || !input.trim()}
                  style={{
                    padding: '0 24px', borderRadius: '12px', border: 'none', cursor: isAsking || !input.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                    color: '#fff', opacity: isAsking || !input.trim() ? 0.6 : 1, transition: 'all 200ms'
                  }}
                >
                  <Send style={{ width: '18px', height: '18px' }} />
                </button>
              </form>
            </div>
          </>

        ) : (
          // ─── Documentation View ───────────────────────────────
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Search Bar + Create Button */}
            <div className="cx-flex cx-items-center cx-gap-12 cx-p-20 cx-border-b">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px' }} className="cx-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search documentation, guides, and runbooks..."
                  className="cx-input"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={() => { setDocForm({ title: '', content: '', category: 'general', tags: '' }); setEditingDocId(null); setShowDocModal(true); }}
                className="cx-btn-primary cx-flex cx-items-center cx-gap-6 cx-fw-600"
                style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} /> Create Doc
              </button>
            </div>

            {/* Docs Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {docsLoading ? (
                <div style={{ textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '40px' }}>Loading documentation...</div>
              ) : docs?.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '40px' }}>No documents found matching &quot;{searchQuery}&quot;</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {docs?.map((doc: KnowledgeDoc) => (
                    <div key={doc.id}
                      className="cx-card cx-flex-col"
                      style={{ padding: '20px', transition: 'all 200ms', position: 'relative' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--primary))'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; e.currentTarget.style.transform = 'none'; }}
                    >
                      {/* Category + Actions */}
                      <div className="cx-flex-between cx-mb-12">
                        <span className="cx-fw-600 cx-text-accent" style={{ fontSize: '10px', textTransform: 'uppercase', backgroundColor: 'rgba(var(--primary), 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                          {doc.category}
                        </span>
                        <div className="cx-flex cx-gap-4">
                          <button onClick={() => handleEditDoc(doc)} className="cx-icon-btn cx-text-muted" style={{ padding: '4px' }} title="Edit">
                            <Edit2 style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button onClick={() => handleDeleteDoc(doc.id)} className="cx-icon-btn cx-text-danger" style={{ padding: '4px' }} title="Delete">
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </div>

                      <h3 className="cx-fw-700 cx-text-primary" style={{ fontSize: '16px', margin: '0 0 8px 0' }}>{doc.title}</h3>
                      <p className="cx-text-secondary cx-text-13" style={{ lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                        {(doc.content ?? '').length > 120 ? `${(doc.content ?? '').substring(0, 120)}...` : (doc.content ?? '')}
                      </p>

                      <div className="cx-flex cx-gap-6" style={{ flexWrap: 'wrap', marginTop: 'auto' }}>
                        {doc.tags?.map((tag: string) => (
                          <span key={tag} className="cx-text-muted cx-text-11" style={{ backgroundColor: 'rgba(var(--border), 0.3)', padding: '2px 8px', borderRadius: '12px' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ─── Create/Edit Doc Modal ─── */}
      {showDocModal && (
        <div className="cx-modal-overlay" onClick={() => setShowDocModal(false)}>
          <div onClick={e => e.stopPropagation()} className="cx-surface cx-border cx-r-16" style={{ width: '560px', maxHeight: '80vh', overflow: 'auto', padding: '32px' }}>
            <div className="cx-flex-between cx-items-center cx-mb-24">
              <h2 className="cx-fw-700 cx-text-primary" style={{ margin: 0, fontSize: '20px' }}>
                {editingDocId ? 'Edit Document' : 'Create Document'}
              </h2>
              <button onClick={() => setShowDocModal(false)} className="cx-icon-btn cx-text-muted">
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div className="cx-flex-col cx-gap-16">
              <div>
                <label className="cx-label" style={{ marginBottom: '6px' }}>Title</label>
                <input value={docForm.title} onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Nginx Configuration Guide" className="cx-input" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label className="cx-label" style={{ marginBottom: '6px' }}>Content</label>
                <textarea value={docForm.content} onChange={e => setDocForm(f => ({ ...f, content: e.target.value }))} placeholder="Document content..."
                  rows={6} className="cx-input" style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
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
              <button onClick={handleSaveDoc} disabled={savingDoc || !docForm.title.trim() || !docForm.content.trim()}
                className="cx-fw-600"
                style={{
                  padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))',
                  color: '#fff', fontSize: '14px', marginTop: '8px',
                  opacity: savingDoc || !docForm.title.trim() ? 0.6 : 1, transition: 'all 200ms'
                }}
              >
                {savingDoc ? 'Saving...' : editingDocId ? 'Update Document' : 'Create Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
