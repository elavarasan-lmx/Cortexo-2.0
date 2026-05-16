'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface TagInputProps {
  /** Initial tags */
  value?: string[];
  /** Called when tags change */
  onChange?: (tags: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Suggestions for autocomplete */
  suggestions?: string[];
  /** Max tags */
  max?: number;
  /** Allow new tags */
  freeSolo?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * TagInput — input with tag chips and optional autocomplete.
 *
 * Usage:
 *   <TagInput
 *     value={tags}
 *     onChange={setTags}
 *     suggestions={['react', 'vue', 'angular']}
 *     freeSolo
 *   />
 */
export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag...',
  suggestions = [],
  max = 20,
  freeSolo = true,
  disabled = false,
  fullWidth = false,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.length >= max || value.includes(trimmed)) return;
    onChange?.([...value, trimmed]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredSuggestions[focusedIndex]) {
        addTag(filteredSuggestions[focusedIndex]);
      } else if (freeSolo && input) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: fullWidth ? '100%' : undefined }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: '6px 10px',
          backgroundColor: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          minHeight: 36,
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              backgroundColor: 'rgba(var(--primary), 0.1)',
              color: 'rgb(var(--primary))',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {tag}
            <button
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'inherit',
                opacity: 0.6,
              }}
            >
              <X size={12} />
            </button>
          </motion.span>
        ))}
        {value.length < max && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); setFocusedIndex(-1); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            style={{
              flex: 1,
              minWidth: 80,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              color: 'rgb(var(--text-primary))',
            }}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (filteredSuggestions.length > 0 || (freeSolo && input && !value.includes(input))) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            {filteredSuggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => addTag(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: i === focusedIndex ? 'rgb(var(--surface-hover))' : 'transparent',
                  color: 'rgb(var(--text-primary))',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {s}
                {i === focusedIndex && <Check size={14} style={{ color: 'rgb(var(--primary))' }} />}
              </button>
            ))}
            {freeSolo && input && !value.includes(input) && (
              <button
                onClick={() => addTag(input)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  borderTop: '1px solid rgb(var(--border))',
                  background: 'transparent',
                  color: 'rgb(var(--primary))',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>Create "</span>
                <span style={{ fontWeight: 600 }}>{input}</span>
                <span>"</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MentionInput — input with @mention support
   ───────────────────────────────────────────────────────────────────────────── */

interface MentionOption {
  id: string;
  name: string;
  avatar?: string;
}

interface MentionInputProps {
  value?: string;
  onChange?: (value: string) => void;
  mentionable?: MentionOption[];
  placeholder?: string;
  rows?: number;
}

export function MentionInput({
  value = '',
  onChange,
  mentionable = [],
  placeholder = 'Type @ to mention...',
  rows = 3,
}: MentionInputProps) {
  const [input, setInput] = useState(value);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredMentions = mentionable.filter((m) =>
    m.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setInput(val);
    setCursorPos(pos);

    // Detect @ trigger
    const beforeCursor = val.slice(0, pos);
    const lastAt = beforeCursor.lastIndexOf('@');
    if (lastAt !== -1) {
      const textAfterAt = beforeCursor.slice(lastAt + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionFilter(textAfterAt);
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (mention: MentionOption) => {
    const beforeCursor = input.slice(0, cursorPos);
    const lastAt = beforeCursor.lastIndexOf('@');
    const newValue = input.slice(0, lastAt) + `@${mention.name} ` + input.slice(cursorPos);
    setInput(newValue);
    onChange?.(newValue);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgb(var(--surface))',
          color: 'rgb(var(--text-primary))',
          fontSize: 13,
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
        }}
      />
      {showMentions && filteredMentions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            marginBottom: 4,
            backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {filteredMentions.slice(0, 5).map((m, i) => (
            <button
              key={m.id}
              onClick={() => insertMention(m)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: i === focusedIndex ? 'rgb(var(--surface-hover))' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {m.avatar && (
                <img src={m.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
              )}
              <span style={{ fontSize: 13, color: 'rgb(var(--text-primary))' }}>{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}