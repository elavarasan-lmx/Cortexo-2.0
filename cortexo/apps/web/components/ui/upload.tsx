'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image, FileText, Film } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   FileUpload — drag & drop file upload
   ───────────────────────────────────────────────────────────────────────────── */

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status?: 'uploading' | 'complete' | 'error';
}

interface FileUploadProps {
  /** Accepted file types (e.g., '.png,.jpg' or 'image/*') */
  accept?: string;
  /** Multiple files allowed. Default: true */
  multiple?: boolean;
  /** Max file size in bytes */
  maxSize?: number;
  /** Max number of files */
  maxFiles?: number;
  /** Called when files are selected */
  onChange?: (files: File[]) => void;
  /** Show upload list */
  showList?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom labels */
  labels?: { title?: string; subtitle?: string; browse?: string };
}

const FILE_ICONS: Record<string, typeof File> = {
  'image/': Image,
  'video/': Film,
  'text/': FileText,
  'application/pdf': FileText,
};

function getFileIcon(type: string) {
  for (const [prefix, Icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(prefix)) return Icon;
  }
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  accept,
  multiple = true,
  maxSize,
  maxFiles = 10,
  onChange,
  showList = true,
  disabled = false,
  labels = {},
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles)
      .slice(0, maxFiles - files.length)
      .filter((f) => !maxSize || f.size <= maxSize)
      .map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        status: 'uploading',
        progress: 0,
      }));

    setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
    onChange?.(newFiles.map((f) => f.file));
  }, [files.length, maxSize, maxFiles, onChange]);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div style={{ width: '100%' }}>
      {/* Drop zone */}
      <motion.div
        animate={{
          borderColor: isDragging ? 'rgb(var(--primary))' : 'rgb(var(--border))',
          backgroundColor: isDragging ? 'rgba(var(--primary), 0.04)' : 'transparent',
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 200ms',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'rgb(var(--surface-hover))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Upload size={20} style={{ color: 'rgb(var(--primary))' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'rgb(var(--text-primary))' }}>
            {labels.title || 'Drag files here or click to browse'}
          </div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
            {labels.subtitle || (accept ? `Accepted: ${accept}` : 'Any file type')}
          </div>
        </div>
      </motion.div>

      {/* File list */}
      {showList && files.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {files.map((f) => {
              const Icon = getFileIcon(f.type);
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    backgroundColor: 'rgb(var(--surface))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Icon size={18} style={{ color: 'rgb(var(--primary))' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'rgb(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgb(var(--text-muted))' }}>
                      {formatFileSize(f.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(f.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: 'rgb(var(--text-muted))',
                    }}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ImageUpload — specialized image upload with preview
   ───────────────────────────────────────────────────────────────────────────── */

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  /** Max image size in MB */
  maxSizeMB?: number;
  /** Show remove button */
  removable?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 5,
  removable = true,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > maxSizeMB * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onChange?.(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (preview) {
    return (
      <div style={{ position: 'relative', width: 120, height: 120, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <img src={preview} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {removable && (
          <button
            onClick={() => { setPreview(''); onChange?.(''); }}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      animate={{ borderColor: isDragging ? 'rgb(var(--primary))' : 'rgb(var(--border))' }}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      style={{
        width: 120,
        height: 120,
        border: `2px dashed ${isDragging ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <div style={{ textAlign: 'center' }}>
        <Image size={24} style={{ color: 'rgb(var(--text-muted))', margin: '0 auto 4px' }} />
        <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))' }}>Upload</div>
      </div>
    </motion.div>
  );
}