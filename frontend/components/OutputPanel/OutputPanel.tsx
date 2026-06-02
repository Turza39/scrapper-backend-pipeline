'use client';

import React, { useState, useEffect } from 'react';
import { StreamEvent, TranscriptMessage, ExtractedEvent } from '@/types';
import { TranscriptView } from './TranscriptView';
import { EventsView } from './EventsView';
import { JsonView } from './JsonView';
import styles from './OutputPanel.module.css';

interface OutputPanelProps {
  messages: TranscriptMessage[];
  events: ExtractedEvent[];
  rawEvents: StreamEvent[];
}

type TabType = 'transcript' | 'events' | 'json';

export const OutputPanel: React.FC<OutputPanelProps> = ({
  messages,
  events,
  rawEvents,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('transcript');
  const [unreadEvents, setUnreadEvents] = useState(0);

  // Track new events for badge notification
  useEffect(() => {
    if (activeTab === 'events') {
      setUnreadEvents(0);
    } else {
      // If we got a new event and the tab is not focused, increment
      setUnreadEvents((prev) => prev + 1);
    }
  }, [events.length]);

  // Reset badge when focusing events tab
  useEffect(() => {
    if (activeTab === 'events') {
      setUnreadEvents(0);
    }
  }, [activeTab]);

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist">
        <button
          id="tab-transcript"
          role="tab"
          aria-selected={activeTab === 'transcript'}
          className={`${styles.tab} ${activeTab === 'transcript' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          TRANSCRIPT
          {messages.length > 0 && (
            <span className={styles.badgeCount}>{messages.length}</span>
          )}
        </button>

        <button
          id="tab-events"
          role="tab"
          aria-selected={activeTab === 'events'}
          className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('events')}
        >
          EVENTS
          {unreadEvents > 0 && (
            <span className={styles.notificationBadge}>{unreadEvents}</span>
          )}
          {events.length > 0 && unreadEvents === 0 && (
            <span className={styles.badgeCount}>{events.length}</span>
          )}
        </button>

        <button
          id="tab-json"
          role="tab"
          aria-selected={activeTab === 'json'}
          className={`${styles.tab} ${activeTab === 'json' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('json')}
        >
          RAW STREAM
          {rawEvents.length > 0 && (
            <span className={styles.badgeCount}>{rawEvents.length}</span>
          )}
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'transcript' && <TranscriptView messages={messages} />}
        {activeTab === 'events' && <EventsView events={events} />}
        {activeTab === 'json' && <JsonView rawEvents={rawEvents} />}
      </div>
    </div>
  );
};
