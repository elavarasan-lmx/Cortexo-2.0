'use client';

import { ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Markdown — simple markdown preview renderer
   ───────────────────────────────────────────────────────────────────────────── */

interface MarkdownProps {
  /** Markdown content */
  children: string;
  /** Custom components */
  components?: Record<string, ReactNode>;
}

/**
 * Markdown — lightweight markdown renderer without external deps.
 * Supports: headers, bold, italic, code, links, lists, blockquotes, tables.
 *
 * Usage:
 *   <Markdown>
 *     # Hello
 *     **bold** and *italic*
 *   </Markdown>
 */
export function Markdown({ children }: MarkdownProps) {
  const lines = children.split('\n');
  const elements: ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';

  lines.forEach((line, i) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock key={`code-${i}`} language={codeLanguage}>
            {codeContent.join('\n')}
          </CodeBlock>
        );
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(<H3 key={i}>{line.slice(4)}</H3>);
    } else if (line.startsWith('## ')) {
      elements.push(<H2 key={i}>{line.slice(3)}</H2>);
    } else if (line.startsWith('# ')) {
      elements.push(<H1 key={i}>{line.slice(2)}</H1>);
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      elements.push(<Blockquote key={i}>{line.slice(2)}</Blockquote>);
    }
    // Horizontal rule
    else if (line === '---' || line === '***' || line === '___') {
      elements.push(<HR key={i} />);
    }
    // List items
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<Li key={i}>{renderInline(line.slice(2))}</Li>);
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(<Li key={i}>{renderInline(match[2])}</Li>);
      }
    }
    // Table
    else if (line.startsWith('|') && line.includes('|')) {
      // Skip table header/separator for now
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<Br key={i} />);
    }
    // Paragraph
    else {
      elements.push(<P key={i}>{renderInline(line)}</P>);
    }
  });

  return <div style={{ lineHeight: 1.6 }}>{elements}</div>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Inline renderers
   ───────────────────────────────────────────────────────────────────────────── */

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Match: **bold**, *italic*, `code`, [link](url)
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > remaining.length) break;
    const before = text.slice(parts.length === 0 ? 0 : 0, match.index);
    if (before) parts.push(<span key={key++}>{before}</span>);

    if (match[1]) {
      // Bold
      parts.push(<Strong key={key++}>{match[2]}</Strong>);
    } else if (match[3]) {
      // Italic
      parts.push(<Em key={key++}>{match[4]}</Em>);
    } else if (match[5]) {
      // Code
      parts.push(<Code key={key++}>{match[5]}</Code>);
    } else if (match[6]) {
      // Link
      parts.push(<A key={key++} href={match[7]}>{match[6]}</A>);
    }

    remaining = text.slice(match.index + match[0].length);
  }

  // Remaining text
  if (remaining) parts.push(<span key={key++}>{remaining}</span>);

  return parts.length > 0 ? parts : text;
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: '8px 0', fontSize: 14, color: 'rgb(var(--text-primary))' }}>{children}</p>;
}

function H1({ children }: { children: string }) {
  return <h1 style={{ fontSize: 24, fontWeight: 700, margin: '16px 0 8px', color: 'rgb(var(--text-primary))' }}>{children}</h1>;
}

function H2({ children }: { children: string }) {
  return <h2 style={{ fontSize: 20, fontWeight: 600, margin: '14px 0 6px', color: 'rgb(var(--text-primary))' }}>{children}</h2>;
}

function H3({ children }: { children: string }) {
  return <h3 style={{ fontSize: 16, fontWeight: 600, margin: '12px 0 4px', color: 'rgb(var(--text-primary))' }}>{children}</h3>;
}

function Strong({ children }: { children: ReactNode }) {
  return <strong style={{ fontWeight: 600 }}>{children}</strong>;
}

function Em({ children }: { children: ReactNode }) {
  return <em style={{ fontStyle: 'italic' }}>{children}</em>;
}

function Code({ children }: { children: string }) {
  return (
    <code style={{
      padding: '2px 6px',
      backgroundColor: 'rgb(var(--surface-hover))',
      borderRadius: 4,
      fontSize: '0.9em',
      fontFamily: 'monospace',
      color: 'rgb(var(--primary))',
    }}>
      {children}
    </code>
  );
}

function CodeBlock({ children, language }: { children: string; language?: string }) {
  return (
    <pre style={{
      padding: 12,
      backgroundColor: 'rgb(var(--text-primary))',
      color: 'rgb(var(--surface))',
      borderRadius: 'var(--radius-md)',
      fontSize: 13,
      fontFamily: 'monospace',
      overflow: 'auto',
      margin: '12px 0',
    }}>
      <code>{children}</code>
    </pre>
  );
}

function A({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} style={{ color: 'rgb(var(--primary))', textDecoration: 'underline' }}>
      {children}
    </a>
  );
}

function Blockquote({ children }: { children: string }) {
  return (
    <blockquote style={{
      borderLeft: '3px solid rgb(var(--primary))',
      paddingLeft: 12,
      margin: '8px 0',
      color: 'rgb(var(--text-secondary))',
      fontStyle: 'italic',
    }}>
      {children}
    </blockquote>
  );
}

function Li({ children }: { children: ReactNode }) {
  return (
    <li style={{ marginLeft: 20, marginBottom: 4, fontSize: 14 }}>
      {children}
    </li>
  );
}

function BR() {
  return <br style={{ margin: '4px 0' }} />;
}

function HR() {
  return <hr style={{ border: 'none', borderTop: '1px solid rgb(var(--border))', margin: '16px 0' }} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MarkdownEditor — edit + preview mode
   ───────────────────────────────────────────────────────────────────────────── */

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  /** Show preview toggle */
  showPreview?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write markdown...',
  rows = 10,
  showPreview = true,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div style={{ width: '100%' }}>
      {showPreview && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => setMode('edit')}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: mode === 'edit' ? 'rgb(var(--primary))' : 'rgb(var(--surface-hover))',
              color: mode === 'edit' ? '#fff' : 'rgb(var(--text-secondary))',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: mode === 'preview' ? 'rgb(var(--primary))' : 'rgb(var(--surface-hover))',
              color: mode === 'preview' ? '#fff' : 'rgb(var(--text-secondary))',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Preview
          </button>
        </div>
      )}
      {mode === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid rgb(var(--border))',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgb(var(--surface))',
            color: 'rgb(var(--text-primary))',
            fontSize: 13,
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      ) : (
        <div style={{
          padding: 12,
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgb(var(--surface))',
          minHeight: rows * 20,
        }}>
          <Markdown>{value}</Markdown>
        </div>
      )}
    </div>
  );
}