'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, Search, MessageSquare, Send, Book, FileText, Settings, Bot, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

export default function KnowledgeBasePage() {
  useAutoLoadToken();
  const [activeTab, setActiveTab] = useState<'qa' | 'docs'>('qa');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Docs Tab Data
  const { data: docs, loading: docsLoading } = useApiData(() => api.request<any>('GET', `/knowledge/docs?q=${encodeURIComponent(searchQuery)}`), [searchQuery]);

  // Q&A Tab Data
  const { data: history, loading: historyLoading, refetch: refetchHistory } = useApiData(() => api.request<any>('GET', '/knowledge/history'));
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync history with messages initially
  useEffect(() => {
    if (history && messages.length === 0) {
      const formatted = history.flatMap((h: any) => [
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
      const res = await api.request<any>('POST', '/knowledge/ask', { question: userMessage.content });
      if (res && res.data) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.answer,
          id: `a-${res.data.id}`,
          sources: res.data.sourcesUsed
        }]);
        refetchHistory();
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error retrieving that information.', id: Date.now().toString() }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen style={{ width: '24px', height: '24px', color: 'rgb(var(--primary))' }} />
            Knowledge Base
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(var(--text-secondary))', marginTop: '6px', margin: 0 }}>
            Unified AI Q&A Engine and Systems Documentation
          </p>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'rgb(var(--surface))', padding: '4px', borderRadius: '10px', border: '1px solid rgb(var(--border))' }}>
          <button
            onClick={() => setActiveTab('qa')}
            style={{
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: activeTab === 'qa' ? 'rgba(var(--primary), 0.1)' : 'transparent',
              color: activeTab === 'qa' ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
              transition: 'all 200ms'
            }}
          >
            <MessageSquare style={{ width: '14px', height: '14px' }} /> AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            style={{
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
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
      <div style={{ 
        flex: 1, backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', 
        borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' 
      }}>
        
        {activeTab === 'qa' ? (
          // ─── Q&A Assistant View ───────────────────────────────
          <>
            {/* Chat History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.length === 0 && !historyLoading ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'rgb(var(--text-muted))', maxWidth: '400px' }}>
                  <Bot style={{ width: '48px', height: '48px', opacity: 0.5, margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: '8px' }}>How can I help you?</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.5 }}>Ask me anything about Cortexo's architecture, existing deployments, or troubleshooting procedures.</p>
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
              <form onSubmit={handleAsk} style={{ display: 'flex', gap: '12px' }}>
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
            {/* Search Bar */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgb(var(--border))' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgb(var(--text-muted))' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search documentation, guides, and runbooks..."
                  style={{
                    width: '100%', padding: '12px 16px 12px 48px', borderRadius: '10px',
                    border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface-hover))',
                    color: 'rgb(var(--text-primary))', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Docs List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {docsLoading ? (
                <div style={{ textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '40px' }}>Loading documentation...</div>
              ) : docs?.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgb(var(--text-muted))', padding: '40px' }}>No documents found matching "{searchQuery}"</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {docs?.map((doc: any) => (
                    <div key={doc.id} style={{
                      backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))',
                      borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column',
                      transition: 'all 200ms', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--primary))'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; e.currentTarget.style.transform = 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'rgb(var(--primary))', backgroundColor: 'rgba(var(--primary), 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                          {doc.category}
                        </span>
                      </div>
                      
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px 0' }}>{doc.title}</h3>
                      <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                        {doc.content.length > 120 ? `${doc.content.substring(0, 120)}...` : doc.content}
                      </p>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                        {doc.tags?.map((tag: string) => (
                          <span key={tag} style={{ fontSize: '11px', color: 'rgb(var(--text-muted))', backgroundColor: 'rgba(var(--border), 0.3)', padding: '2px 8px', borderRadius: '12px' }}>
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
    </div>
  );
}
