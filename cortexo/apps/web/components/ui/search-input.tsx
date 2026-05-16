'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, User, Folder, Command } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  label: string;
  /** Icon or avatar */
  icon?: ReactNode;
  /** Category label */
  category?: string;
  /** Recent item */
  recent?: boolean;
  /** Popular item */
  popular?: boolean;
}

interface SearchInputProps {
  /** Search value */
  value?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Called when search is submitted */
  onSearch?: (value: string) => void;
  /** Suggestions to display */
  suggestions?: SearchSuggestion[];
  /** Called when suggestion is selected */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  /** Show recent searches */
  recentSearches?: string[];
  /** Called when recent search is clicked */
  onRecentClick?: (search: string) => void;
  /** Show popular searches */
  popularSearches?: string[];
  /** Called when popular search is clicked */
  onPopularClick?: (search: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Debounce delay in ms */
  debounce?: number;
  /** Loading state */
  loading?: boolean;
  /** Focus on mount */
  autoFocus?: boolean;
}

/**
 * SearchInput — search with autocomplete, recent & popular searches.
 *
 * Usage:
 *   <SearchInput
 *     value={query}
 *     onChange={setQuery}
 *     onSearch={handleSearch}
 *     suggestions={results}
 *     onSuggestionSelect={select}
 *     recentSearches={recent}
 *   />
 */
export function SearchInput({
  value = '',
  onChange,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  recentSearches = [],
  popularSearches = [],
  onRecentClick,
  onPopularClick,
  placeholder = 'Search...',
  fullWidth = false,
  debounce = 300,
  loading = false,
  autoFocus = false,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced onChange
  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (newValue.trim()) setShowDropdown(true);
    }, debounce);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allItems = [
      ...(inputValue ? suggestions : []),
      ...(inputValue ? [] : recentSearches.map((s) => ({ id: s, label: s, recent: true }))),
      ...(inputValue ? [] : popularSearches.map((s) => ({ id: s, label: s, popular: true }))),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allItems[selectedIndex]) {
        selectItem(allItems[selectedIndex]);
      } else if (inputValue) {
        onSearch?.(inputValue);
        setShowDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    } else if (e.key === 'Tab') {
      setShowDropdown(false);
    }
  };

  const selectItem = (item: SearchSuggestion | { id: string; label: string; recent?: boolean; popular?: boolean }) => {
    setInputValue(item.label);
    onChange?.(item.label);
    if ('category' in item) {
      onSuggestionSelect?.(item);
    } else if (item.recent) {
      onRecentClick?.(item.label);
    } else if (item.popular) {
      onPopularClick?.(item.label);
    } else {
      onSearch?.(item.label);
    }
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    inputRef.current?.focus();
  };

  const hasResults = inputValue && suggestions.length > 0;
  const showHistory = !inputValue && (recentSearches.length > 0 || popularSearches.length > 0);

  return (
    <div
      ref={useRef(null)}
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {/* Input */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            color: 'rgb(var(--text-muted))',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width: fullWidth ? '100%' : 320,
            padding: '10px 36px 10px 36px',
            border: '1px solid rgb(var(--border))',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgb(var(--surface))',
            color: 'rgb(var(--text-primary))',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 150ms',
          }}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 4,
              color: 'rgb(var(--text-muted))',
            }}
          >
            <X size={14} />
          </button>
        )}
        {loading && (
          <div style={{
            position: 'absolute',
            right: 36,
            width: 14,
            height: 14,
            border: '2px solid rgb(var(--border))',
            borderTopColor: 'rgb(var(--primary))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (hasResults || showHistory) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 8,
              backgroundColor: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            {/* Suggestions */}
            {hasResults && (
              <div style={{ padding: '8px 0' }}>
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => selectItem(s)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: selectedIndex === i ? 'rgb(var(--surface-hover))' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {s.icon || <Search size={14} style={{ color: 'rgb(var(--text-muted))' }} />}
                    <span style={{ flex: 1, fontSize: 13, color: 'rgb(var(--text-primary))' }}>
                      {s.label}
                    </span>
                    {s.category && (
                      <span style={{ fontSize: 11, color: 'rgb(var(--text-muted))' }}>{s.category}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Recent & Popular */}
            {showHistory && (
              <div style={{ padding: '8px 0' }}>
                {recentSearches.length > 0 && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgb(var(--text-muted))',
                      textTransform: 'uppercase',
                    }}>
                      <Clock size={12} /> Recent
                    </div>
                    {recentSearches.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => selectItem({ id: s, label: s, recent: true })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '6px 12px',
                          border: 'none',
                          background: selectedIndex === i ? 'rgb(var(--surface-hover))' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                          color: 'rgb(var(--text-primary))',
                        }}
                      >
                        <Clock size={14} style={{ color: 'rgb(var(--text-muted))' }} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {popularSearches.length > 0 && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgb(var(--text-muted))',
                      textTransform: 'uppercase',
                      marginTop: 8,
                    }}>
                      <TrendingUp size={12} /> Popular
                    </div>
                    {popularSearches.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => selectItem({ id: s, label: s, popular: true })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '6px 12px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 13,
                          color: 'rgb(var(--text-primary))',
                        }}
                      >
                        <TrendingUp size={14} style={{ color: 'rgb(var(--text-muted))' }} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SearchModal — command palette style search
   ───────────────────────────────────────────────────────────────────────────── */

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (s: SearchSuggestion) => void;
  placeholder?: string;
}

export function SearchModal({
  open,
  onOpenChange,
  value,
  onChange,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  placeholder = 'Search or type a command...',
}: SearchModalProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onOpenChange(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          backgroundColor: 'rgb(var(--surface))',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        <SearchInput
          value={value}
          onChange={onChange}
          onSearch={(v) => { onSearch?.(v); onOpenChange(false); }}
          suggestions={suggestions}
          onSuggestionSelect={(s) => { onSuggestionSelect?.(s); onOpenChange(false); }}
          placeholder={placeholder}
          fullWidth
          autoFocus
          debounce={0}
        />
      </motion.div>
    </motion.div>
  );
}