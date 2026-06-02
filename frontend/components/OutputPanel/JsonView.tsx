'use client';

import React, { useEffect, useRef, useState } from 'react';
import { StreamEvent } from '@/types';
import styles from './JsonView.module.css';

interface JsonViewProps {
  rawEvents: StreamEvent[];
}

export const JsonView: React.FC<JsonViewProps> = ({ rawEvents }) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLPreElement>(null);

  const formattedJson = JSON.stringify(rawEvents, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [rawEvents.length]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>RAW STREAM JSON ({rawEvents.length} EVENTS)</span>
        <button
          id="copy-json-btn"
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          disabled={rawEvents.length === 0}
        >
          {copied ? 'COPIED' : 'COPY ALL JSON'}
        </button>
      </div>

      <div className={styles.scrollArea}>
        {rawEvents.length === 0 ? (
          <div className={styles.emptyState}>
            No stream events recorded yet. Start processing to view live JSON pipeline output.
          </div>
        ) : (
          <pre ref={containerRef} className={styles.jsonContent}>
            <code>{formattedJson}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
