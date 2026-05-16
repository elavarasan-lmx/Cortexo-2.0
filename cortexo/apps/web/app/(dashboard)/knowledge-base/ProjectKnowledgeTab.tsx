'use client';

import { useState } from 'react';
import { Folder, FileText, ChevronRight, ArrowLeft, Code, Server, Database, Cpu, Loader2, Send, Bot, User, Copy, FolderOpen } from 'lucide-react';
import { ProjectSource, ProjectFileEntry, ProjectFileContent, api } from '@/lib/api';
import { useCortexoQuery } from '@/lib/hooks';

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LANG_COLORS: Record<string, string> = {
  php: '#8892BF', javascript: '#F7DF1E', typescript: '#3178C6', json: '#292929',
  html: '#E34F26', css: '#1572B6', yaml: '#CB171E', bash: '#4EAA25',
  markdown: '#083FA1', sql: '#336791', env: '#ECD53F',
};

const STACK_ICONS: Record<string, typeof Server> = {
  'PHP 7.4': Code, 'CodeIgniter 3': Server, 'Lumen 8': Cpu,
  'MySQL (RDS)': Database, 'Redis (ElastiCache)': Database, 'Socket.IO': Cpu, 'Node.js': Server,
};

export default function ProjectKnowledgeTab() {
  const [currentDir, setCurrentDir] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<ProjectFileContent | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [projectQuestion, setProjectQuestion] = useState('');
  const [projectAnswer, setProjectAnswer] = useState('');
  const [askingProject, setAskingProject] = useState(false);
  const [dirHistory, setDirHistory] = useState<string[]>([]);

  const { data: summary, isLoading: summaryLoading } = useCortexoQuery<any>(
    ['project-summary'], () => api.getProjectSummary('winbull-staging'),
  );

  const { data: filesData, isLoading: filesLoading } = useCortexoQuery<any>(
    ['project-files', currentDir], () => api.browseProjectFiles('winbull-staging', currentDir),
  );

  const files: ProjectFileEntry[] = Array.isArray(filesData) ? filesData : (filesData as { data?: ProjectFileEntry[] } | undefined)?.data || filesData || [];

  const handleDirClick = (dirPath: string) => {
    setDirHistory(prev => [...prev, currentDir]);
    setCurrentDir(dirPath);
    setSelectedFile(null);
    setFileContent(null);
  };

  const handleBack = () => {
    const prev = dirHistory[dirHistory.length - 1] ?? '';
    setDirHistory(h => h.slice(0, -1));
    setCurrentDir(prev);
    setSelectedFile(null);
    setFileContent(null);
  };

  const handleFileClick = async (filePath: string) => {
    setSelectedFile(filePath);
    setLoadingFile(true);
    try {
      const res = await api.readProjectFile(filePath, 'winbull-staging') as unknown as { data?: ProjectFileContent };
      setFileContent(res?.data ?? null);
    } catch { setFileContent(null); }
    setLoadingFile(false);
  };

  const handleAskProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectQuestion.trim() || askingProject) return;
    setAskingProject(true);
    setProjectAnswer('');
    try {
      const res = await api.askProjectKnowledge({
        question: projectQuestion,
        projectId: 'winbull-staging',
        fileContext: selectedFile || undefined,
      }) as { data?: { answer?: string }; answer?: string };
      setProjectAnswer(res?.data?.answer || res?.answer || 'No response');
    } catch (err: unknown) {
      setProjectAnswer(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setAskingProject(false);
  };

  const projectData = summary?.data || summary;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: File Browser */}
      <div style={{ width: '340px', borderRight: '1px solid rgb(var(--border))', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Project Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgb(var(--border))', background: 'linear-gradient(135deg, rgba(var(--primary), 0.05), rgba(var(--agent), 0.05))' }}>
          <div className="cx-flex cx-items-center cx-gap-8 cx-mb-8">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Winbull Staging</h3>
              <p style={{ margin: 0, fontSize: 11, color: 'rgb(var(--text-muted))' }}>Bullion Trading Platform</p>
            </div>
          </div>
          {projectData?.stack && (
            <div className="cx-flex cx-gap-4" style={{ flexWrap: 'wrap' }}>
              {(projectData.stack as string[]).slice(0, 5).map((s: string) => (
                <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, backgroundColor: 'rgba(var(--primary), 0.1)', color: 'rgb(var(--primary))', fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          )}
          {projectData?.modules && (
            <div style={{ marginTop: 10 }}>
              {(projectData.modules as ProjectModule[]).map((m: any) => (
                <div key={m.name} className="cx-flex cx-items-center cx-gap-6 cx-text-12" style={{ padding: '3px 0', color: 'rgb(var(--text-secondary))' }}>
                  <FolderOpen style={{ width: 12, height: 12, color: 'rgb(var(--agent))' }} />
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  {m.fileCount > 0 && <span className="cx-text-muted" style={{ fontSize: 10 }}>({m.fileCount})</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Directory Navigation */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentDir && (
            <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgb(var(--primary))' }}>
              <ArrowLeft style={{ width: 14, height: 14 }} />
            </button>
          )}
          <span style={{ fontSize: 11, color: 'rgb(var(--text-muted))', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            /{currentDir || 'root'}
          </span>
        </div>

        {/* File List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {filesLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgb(var(--text-muted))' }}><Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} /></div>
          ) : (
            files.map((f: ProjectFileEntry) => (
              <button
                key={f.path}
                onClick={() => f.type === 'directory' ? handleDirClick(f.path) : handleFileClick(f.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 16px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13,
                  backgroundColor: selectedFile === f.path ? 'rgba(var(--primary), 0.1)' : 'transparent',
                  color: selectedFile === f.path ? 'rgb(var(--primary))' : 'rgb(var(--text-primary))',
                }}
              >
                {f.type === 'directory'
                  ? <Folder style={{ width: 14, height: 14, color: 'rgb(var(--agent))' }} />
                  : <FileText style={{ width: 14, height: 14, color: LANG_COLORS[f.extension?.replace('.', '') || ''] || 'rgb(var(--text-muted))' }} />
                }
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                {f.type === 'file' && f.size && <span style={{ fontSize: 10, color: 'rgb(var(--text-muted))' }}>{formatBytes(f.size)}</span>}
                {f.type === 'directory' && <ChevronRight style={{ width: 12, height: 12, color: 'rgb(var(--text-muted))' }} />}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Content + AI */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* File Content Viewer */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingFile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgb(var(--text-muted))' }}>
              <Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }} />
            </div>
          ) : fileContent ? (
            <div style={{ padding: 0 }}>
              {/* File Header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(var(--surface-hover), 0.5)' }}>
                <div className="cx-flex cx-items-center cx-gap-8">
                  <FileText style={{ width: 16, height: 16, color: LANG_COLORS[fileContent.language] || 'rgb(var(--text-muted))' }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'rgb(var(--text-primary))' }}>{fileContent.name}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, backgroundColor: 'rgba(var(--border), 0.3)', color: 'rgb(var(--text-muted))' }}>{fileContent.language}</span>
                  <span style={{ fontSize: 11, color: 'rgb(var(--text-muted))' }}>{formatBytes(fileContent.size)}</span>
                </div>
                <button onClick={() => navigator.clipboard.writeText(fileContent.content)} title="Copy" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgb(var(--text-muted))' }}>
                  <Copy style={{ width: 14, height: 14 }} />
                </button>
              </div>
              {/* Code Content */}
              <pre style={{
                margin: 0, padding: '16px 20px', fontSize: 12, lineHeight: 1.6, fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                backgroundColor: 'rgba(var(--border), 0.1)', color: 'rgb(var(--text-primary))', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                <code>{fileContent.content}</code>
              </pre>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgb(var(--text-muted))', gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, rgba(var(--primary), 0.1), rgba(var(--agent), 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code style={{ width: 36, height: 36, opacity: 0.5 }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'rgb(var(--text-primary))' }}>Winbull Staging Explorer</h3>
              <p style={{ margin: 0, fontSize: 13, maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
                Browse the project files on the left, or ask AI questions about the codebase below. The AI has full project context including configs, routes, and architecture.
              </p>
              <div className="cx-flex cx-gap-8" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {['What is the socket architecture?', 'List all API endpoints', 'How does rate broadcasting work?', 'What database tables exist?'].map(q => (
                  <button key={q} onClick={() => setProjectQuestion(q)} style={{ padding: '6px 14px', borderRadius: 16, border: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-secondary))', fontSize: 11, cursor: 'pointer' }}>{q}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Answer Display */}
        {projectAnswer && (
          <div style={{ maxHeight: '40%', overflowY: 'auto', borderTop: '1px solid rgb(var(--border))', padding: 20, backgroundColor: 'rgba(var(--agent), 0.03)' }}>
            <div className="cx-flex cx-items-center cx-gap-8 cx-mb-12">
              <Bot style={{ width: 18, height: 18, color: 'rgb(var(--agent))' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgb(var(--agent))' }}>AI Response</span>
              {selectedFile && <span style={{ fontSize: 10, color: 'rgb(var(--text-muted))', padding: '2px 8px', backgroundColor: 'rgba(var(--border), 0.3)', borderRadius: 6 }}>Context: {selectedFile}</span>}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgb(var(--text-primary))', whiteSpace: 'pre-wrap' }}>{projectAnswer}</div>
          </div>
        )}

        {/* AI Question Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgb(var(--border))', backgroundColor: 'rgba(var(--surface-hover), 0.5)' }}>
          <form onSubmit={handleAskProject} className="cx-flex cx-gap-10 cx-items-center">
            <div className="cx-flex cx-items-center cx-gap-6" style={{ fontSize: 11, color: 'rgb(var(--agent))', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <Bot style={{ width: 14, height: 14 }} />
              {selectedFile ? `Ask about ${selectedFile.split('/').pop()}` : 'Ask about project'}
            </div>
            <input
              type="text"
              value={projectQuestion}
              onChange={e => setProjectQuestion(e.target.value)}
              placeholder="How does the booking system work?"
              disabled={askingProject}
              className="cx-input"
              style={{ flex: 1, padding: '10px 16px', fontSize: 13 }}
            />
            <button type="submit" disabled={askingProject || !projectQuestion.trim()} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: askingProject ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--agent)))', color: '#fff',
              opacity: askingProject || !projectQuestion.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {askingProject ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 14, height: 14 }} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface ProjectModule { name: string; path: string; description: string; fileCount?: number; }
