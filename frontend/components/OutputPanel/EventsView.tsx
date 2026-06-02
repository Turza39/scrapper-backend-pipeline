'use client';

import React, { useState } from 'react';
import { ExtractedEvent } from '@/types';
import styles from './EventsView.module.css';

interface EventsViewProps {
  events: ExtractedEvent[];
}

type EventFilter = 'all' | 'decision_detected' | 'action_item_detected' | 'topic_update' | 'question_detected';

export const EventsView: React.FC<EventsViewProps> = ({ events }) => {
  const [filter, setFilter] = useState<EventFilter>('all');

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    return ev.type === filter;
  });

  const getEventLabel = (type: ExtractedEvent['type']) => {
    switch (type) {
      case 'decision_detected': return 'DECISION';
      case 'action_item_detected': return 'ACTION ITEM';
      case 'topic_update': return 'TOPIC';
      case 'question_detected': return 'QUESTION';
    }
  };

  const getEventTypeClass = (type: ExtractedEvent['type']) => {
    switch (type) {
      case 'decision_detected': return styles.decision;
      case 'action_item_detected': return styles.action;
      case 'topic_update': return styles.topic;
      case 'question_detected': return styles.question;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <button
            id="filter-all-btn"
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            ALL ({events.length})
          </button>
          <button
            id="filter-decision-btn"
            className={`${styles.filterBtn} ${filter === 'decision_detected' ? styles.active : ''}`}
            onClick={() => setFilter('decision_detected')}
          >
            DECISIONS ({events.filter((e) => e.type === 'decision_detected').length})
          </button>
          <button
            id="filter-action-btn"
            className={`${styles.filterBtn} ${filter === 'action_item_detected' ? styles.active : ''}`}
            onClick={() => setFilter('action_item_detected')}
          >
            ACTIONS ({events.filter((e) => e.type === 'action_item_detected').length})
          </button>
          <button
            id="filter-topic-btn"
            className={`${styles.filterBtn} ${filter === 'topic_update' ? styles.active : ''}`}
            onClick={() => setFilter('topic_update')}
          >
            TOPICS ({events.filter((e) => e.type === 'topic_update').length})
          </button>
          <button
            id="filter-question-btn"
            className={`${styles.filterBtn} ${filter === 'question_detected' ? styles.active : ''}`}
            onClick={() => setFilter('question_detected')}
          >
            QUESTIONS ({events.filter((e) => e.type === 'question_detected').length})
          </button>
        </div>
      </div>

      <div className={styles.scrollArea}>
        {filteredEvents.length === 0 ? (
          <div className={styles.emptyState}>
            {events.length === 0
              ? 'No events extracted yet. Events appear as the audio is processed.'
              : `No events of type '${getEventLabel(filter as ExtractedEvent['type'])}' found.`}
          </div>
        ) : (
          <div className={styles.eventGrid}>
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className={`${styles.card} ${getEventTypeClass(ev.type)}`}
                id={`event-card-${ev.id}`}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.badge}>{getEventLabel(ev.type)}</span>
                  <span className={styles.timestamp}>{ev.timestamp}</span>
                </div>
                <p className={styles.text}>{ev.text}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.speakerLabel}>Speaker:</span>
                  <span className={styles.speakerValue}>{ev.speaker}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
