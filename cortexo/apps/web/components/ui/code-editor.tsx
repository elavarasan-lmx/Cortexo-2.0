'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Code2, Maximize2, Minimize2, Play, Settings } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   CodeEditor — syntax highlighted code editor
   ───────────────────────────────────────────────────────────────────────────── */

interface CodeEditorProps {
  /** Code content */
  value: string;
  /** Called when code changes */
  onChange?: (value: string) => void;
  /** Language */
  language?: string;
  /** Read only mode */
  readOnly?: boolean;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Min height */
  minHeight?: number;
  /** Max height */
  maxHeight?: number;
  /** Theme */
  theme?: 'light' | 'dark';
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Simple syntax highlighting without external dependencies.
 * Supports: JavaScript, TypeScript, JSON, HTML, CSS, Python, Shell
 */
function highlightCode(code: string, language: string): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let highlighted = escapeHtml(code);

  // Keywords by language
  const keywords: Record<string, string[]> = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 'default', 'from', 'async', 'await', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined', 'true', 'false', 'void'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 'default', 'from', 'async', 'await', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined', 'true', 'false', 'void', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'implements', 'private', 'public', 'protected', 'readonly', 'static', 'as', 'is', 'keyof', 'infer', 'never', 'unknown', 'any'],
    python: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'raise', 'import', 'from', 'as', 'with', 'pass', 'break', 'continue', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'async', 'await', 'print'],
    html: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'script', 'style', 'link', 'meta', 'title', 'header', 'footer', 'nav', 'main', 'section', 'article', 'aside'],
    css: ['color', 'background', 'margin', 'padding', 'border', 'width', 'height', 'display', 'position', 'top', 'left', 'right', 'bottom', 'font', 'text', 'align', 'justify', 'flex', 'grid', 'transform', 'transition', 'animation', 'opacity', 'z-index', 'overflow', 'cursor', 'box-shadow', 'border-radius'],
    json: [],
    shell: ['echo', 'export', 'source', 'chmod', 'chown', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'sed', 'awk', 'find', 'xargs', 'curl', 'wget', 'ssh', 'scp', 'tar', 'zip', 'unzip', 'apt', 'yum', 'npm', 'pip', 'node', 'python', 'bash', 'sh', 'if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac', 'exit', 'return', 'local', 'cd', 'pwd', 'ls', 'dir'],
  };

  const lang = language?.toLowerCase() || 'javascript';
  const langKeywords = keywords[lang] || keywords.javascript || [];

  // Strings (double and single quotes, template literals)
  highlighted = highlighted.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span style="color: #10B981">$&</span>');

  // Comments (// and /* */ for JS/TS, # for Python/Shell)
  highlighted = highlighted.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span style="color: #6B7280; font-style: italic">$&</span>');

  // Numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #F59E0B">$1</span>');

  // Keywords
  langKeywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span style="color: #8B5CF6">$1</span>');
  });

  // Functions (word followed by parenthesis)
  highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span style="color: #3B82F6">$1</span>(');

  // HTML tags
  if (lang === 'html') {
    highlighted = highlighted.replace(/(&lt;\/?[\w-]+)/g, '<span style="color: #EF4444">$1</span>');
    highlighted = highlighted.replace(/\s([\w-]+)=/g, ' <span style="color: #8B5CF6">$1</span>=');
  }

  // CSS properties
  if (lang === 'css') {
    highlighted = highlighted.replace(/^(\s*[\w-]+)(?=:)/gm, '<span style="color: #8B5CF6">$1</span>');
  }

  return highlighted;
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  showLineNumbers = true,
  showToolbar = true,
  minHeight = 200,
  maxHeight = 500,
  theme = 'dark',
  style,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [height, setHeight] = useState(minHeight);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = value.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart;
      const end = textareaRef.current?.selectionEnd;
      if (start !== undefined && end !== undefined) {
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange?.(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    }
  };

  const bgColor = theme === 'dark' ? '#1e1e1e' : '#f8f9fa';
  const textColor = theme === 'dark' ? '#d4d4d4' : '#24292e';
  const lineNumColor = theme === 'dark' ? '#6e7681' : '#959da5';

  return (
    <motion.div
      animate={{ height: fullscreen ? '100vh' : height }}
      transition={{ duration: 0.2 }}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgb(var(--border))',
        overflow: 'hidden',
        backgroundColor: bgColor,
        ...style,
      }}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Code2 size={14} style={{ color: lineNumColor }} />
            <span style={{ fontSize: 12, color: lineNumColor, textTransform: 'uppercase' }}>
              {language}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={handleCopy}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
                color: lineNumColor,
              }}
              title="Copy"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
                color: lineNumColor,
              }}
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div style={{
        display: 'flex',
        minHeight: minHeight - (showToolbar ? 40 : 0),
        maxHeight: maxHeight - (showToolbar ? 40 : 0),
        overflow: 'auto',
      }}>
        {/* Line numbers */}
        {showLineNumbers && (
          <div style={{
            padding: '12px 12px 12px 16px',
            textAlign: 'right',
            backgroundColor: 'rgba(0,0,0,0.1)',
            color: lineNumColor,
            fontSize: 13,
            fontFamily: 'monospace',
            lineHeight: 1.5,
            userSelect: 'none',
            minWidth: 40,
          }}>
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* Code area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {readOnly ? (
            <pre
              style={{
                margin: 0,
                padding: 12,
                fontSize: 13,
                fontFamily: 'monospace',
                lineHeight: 1.5,
                color: textColor,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
              dangerouslySetInnerHTML={{ __html: highlightCode(value, language) }}
            />
          ) : (
            <>
              <pre
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  margin: 0,
                  padding: 12,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  color: 'transparent',
                  backgroundColor: 'transparent',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  pointerEvents: 'none',
                }}
                dangerouslySetInnerHTML={{ __html: highlightCode(value, language) + '<br/>' }}
              />
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: '200px',
                  padding: 12,
                  border: 'none',
                  background: 'transparent',
                  color: textColor,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  resize: 'none',
                  outline: 'none',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CodeBlock — read-only code display
   ───────────────────────────────────────────────────────────────────────────── */

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Show copy button */
  showCopy?: boolean;
  /** Filename header */
  filename?: string;
  /** Lines to highlight */
  highlightLines?: number[];
}

export function CodeBlock({
  code,
  language = 'javascript',
  showCopy = true,
  filename,
  highlightLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid rgb(var(--border))',
    }}>
      {/* Header */}
      {(filename || showCopy) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: 'rgb(var(--surface-hover))',
          borderBottom: '1px solid rgb(var(--border))',
        }}>
          {filename && (
            <span style={{ fontSize: 12, color: 'rgb(var(--text-secondary))' }}>
              {filename}
            </span>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
                color: 'rgb(var(--text-muted))',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
      )}

      {/* Code */}
      <pre style={{
        margin: 0,
        padding: 16,
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontSize: 13,
        fontFamily: 'monospace',
        lineHeight: 1.5,
        overflow: 'auto',
      }}>
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CodePlayground — runnable code editor
   ───────────────────────────────────────────────────────────────────────────── */

interface CodePlaygroundProps {
  initialCode: string;
  language?: string;
}

export function CodePlayground({
  initialCode,
  language = 'javascript',
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const runCode = () => {
    setOutput('');
    setError('');
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(code)();
      setOutput(result !== undefined ? String(result) : 'Executed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <CodeEditor
        value={code}
        onChange={setCode}
        language={language}
        showToolbar
        minHeight={200}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={runCode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'rgb(var(--primary))',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Play size={14} /> Run
        </button>
      </div>
      {(output || error) && (
        <div style={{
          padding: 12,
          borderRadius: 'var(--radius-md)',
          backgroundColor: error ? 'rgba(239,68,68,0.1)' : 'rgb(var(--surface-hover))',
          border: `1px solid ${error ? 'rgb(var(--danger))' : 'rgb(var(--border))'}`,
          fontSize: 12,
          fontFamily: 'monospace',
          color: error ? 'rgb(var(--danger))' : 'rgb(var(--text-primary))',
          whiteSpace: 'pre-wrap',
        }}>
          {error || output}
        </div>
      )}
    </div>
  );
}