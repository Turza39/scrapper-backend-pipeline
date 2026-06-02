'use client';

import { useCallback, useRef, useState, DragEvent } from 'react';
import styles from './UploadPanel.module.css';

interface UploadPanelProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  disabled: boolean;
  currentFile: string | null;
}

const ACCEPTED_MIME = [
  'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg',
  'audio/flac', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/webm',
];
const ACCEPTED_EXT = '.wav,.mp3,.ogg,.flac,.m4a,.webm';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPanel({
  onUpload,
  isUploading,
  disabled,
  currentFile,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = (file: File) => {
    setError(null);
    const validMime = ACCEPTED_MIME.includes(file.type);
    const validExt = /\.(wav|mp3|ogg|flac|m4a|webm)$/i.test(file.name);
    if (!validMime && !validExt) {
      setError('Unsupported format. Accepted: wav · mp3 · ogg · flac · m4a · webm');
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [disabled] // eslint-disable-line
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleUpload = () => {
    if (selectedFile && !isUploading && !disabled) {
      onUpload(selectedFile);
    }
  };

  const isInteractive = !disabled && !isUploading;

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>AUDIO INPUT</span>
      </div>

      <div
        id="upload-dropzone"
        className={[
          styles.dropzone,
          isDragging ? styles.dragging : '',
          disabled ? styles.disabled : '',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => isInteractive && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          className={styles.hiddenInput}
          onChange={handleFileChange}
          disabled={!isInteractive}
        />

        {selectedFile ? (
          <div className={styles.fileInfo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <div className={styles.fileMeta}>
              <div className={styles.fileName}>{selectedFile.name}</div>
              <div className={styles.fileSize}>{formatSize(selectedFile.size)}</div>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.uploadIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className={styles.dropText}>Drop audio file here</span>
            <span className={styles.dropSubtext}>or click to browse</span>
            <span className={styles.formats}>wav · mp3 · ogg · flac · m4a</span>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {selectedFile && !currentFile && (
        <button
          id="upload-btn"
          className={styles.uploadBtn}
          onClick={handleUpload}
          disabled={!isInteractive}
        >
          {isUploading ? (
            <span className={styles.uploadingRow}>
              <span className={styles.spinner} />
              Uploading...
            </span>
          ) : (
            'Upload File'
          )}
        </button>
      )}

      {currentFile && (
        <div className={styles.uploadedBadge}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          File uploaded successfully
        </div>
      )}
    </div>
  );
}
