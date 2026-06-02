'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TranscriptMessage } from '@/types';
import styles from './TranscriptView.module.css';

interface TranscriptViewProps {
  messages: TranscriptMessage[];
}

interface MessageRowProps {
  message: TranscriptMessage;
  onTypewriteComplete?: () => void;
}

const MessageRow: React.FC<MessageRowProps> = ({ message, onTypewriteComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const textRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // If it is not a new message (e.g. from an existing list loaded), show full text immediately
    if (!message.isNew) {
      setDisplayedText(message.text);
      onTypewriteComplete?.();
      return;
    }

    // Otherwise, perform typewriter animation character by character
    setDisplayedText('');
    textRef.current = '';
    if (timerRef.current) clearInterval(timerRef.current);

    let charIndex = 0;
    const targetText = message.text;

    timerRef.current = setInterval(() => {
      if (charIndex < targetText.length) {
        textRef.current += targetText[charIndex];
        setDisplayedText(textRef.current);
        charIndex++;
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onTypewriteComplete?.();
      }
    }, 25); // ~25ms per character for premium typewriter speed

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [message.id, message.text, message.isNew]);

  const speakerColorClass = styles[`speaker-${(message.speakerIndex % 4) + 1}`];

  return (
    <div className={styles.messageRow} id={`msg-${message.id}`}>
      <div className={styles.meta}>
        <span className={`${styles.speaker} ${speakerColorClass}`}>
          {message.speaker}
        </span>
        <span className={styles.timestamp}>{message.timestamp}</span>
      </div>
      <div className={styles.textContainer}>
        <p className={styles.text}>{displayedText}</p>
        {displayedText.length < message.text.length && (
          <span className={styles.cursor} aria-hidden="true" />
        )}
      </div>
    </div>
  );
};

export const TranscriptView: React.FC<TranscriptViewProps> = ({ messages }) => {
  const [pinToBottom, setPinToBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages list size changes
  useEffect(() => {
    if (pinToBottom) {
      scrollToBottom();
    }
  }, [messages.length, pinToBottom]);

  // Handle scroll events to detect if user scrolls up
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // Threshold of 15px to avoid small floating point discrepancies
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 15;
    
    if (isAtBottom !== pinToBottom) {
      setPinToBottom(isAtBottom);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>LIVE TRANSCRIPT</h3>
        <button
          id="pin-bottom-btn"
          className={`${styles.pinButton} ${pinToBottom ? styles.pinned : ''}`}
          onClick={() => {
            setPinToBottom(true);
            scrollToBottom();
          }}
          title="Pin to bottom"
        >
          {pinToBottom ? 'PINNED' : 'PIN TO BOTTOM'}
        </button>
      </div>

      <div
        ref={containerRef}
        className={styles.scrollArea}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            Waiting for audio streaming pipeline to start...
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <MessageRow
                key={msg.id}
                message={msg}
                onTypewriteComplete={() => {
                  if (pinToBottom) {
                    scrollToBottom();
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
