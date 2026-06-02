'use client';

import { useState } from 'react';
import styles from './PipelineControls.module.css';
import { ProcessOptions } from '@/lib/api';

interface PipelineControlsProps {
  onExtract: () => void;
  onReset: () => void;
  canExtract: boolean;
  isProcessing: boolean;
  isDone: boolean;
  options: ProcessOptions;
  onOptionsChange: (opts: ProcessOptions) => void;
}

export default function PipelineControls({
  onExtract,
  onReset,
  canExtract,
  isProcessing,
  isDone,
  options,
  onOptionsChange,
}: PipelineControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>CONTROLS</span>
        <button
          className={styles.settingsToggle}
          onClick={() => setShowSettings((v) => !v)}
          title="Pipeline settings"
          aria-expanded={showSettings}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
          </svg>
          {showSettings ? 'Hide settings' : 'Settings'}
        </button>
      </div>

      {showSettings && (
        <div className={styles.settings}>
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Chunk size</label>
            <div className={styles.settingControl}>
              <input
                id="chunk-size-slider"
                type="range"
                min="5"
                max="15"
                step="5"
                value={options.chunk_size_seconds ?? 5}
                onChange={(e) =>
                  onOptionsChange({ ...options, chunk_size_seconds: Number(e.target.value) })
                }
                className={styles.slider}
                disabled={isProcessing}
              />
              <span className={styles.sliderVal}>{options.chunk_size_seconds ?? 5}s</span>
            </div>
          </div>

          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Diarization</label>
            <button
              id="diarization-toggle"
              className={`${styles.toggle} ${options.enable_diarization ? styles.on : ''}`}
              onClick={() =>
                onOptionsChange({ ...options, enable_diarization: !options.enable_diarization })
              }
              disabled={isProcessing}
            >
              {options.enable_diarization ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Event Extraction</label>
            <button
              id="event-extraction-toggle"
              className={`${styles.toggle} ${options.enable_event_extraction ? styles.on : ''}`}
              onClick={() =>
                onOptionsChange({
                  ...options,
                  enable_event_extraction: !options.enable_event_extraction,
                })
              }
              disabled={isProcessing}
            >
              {options.enable_event_extraction ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button
          id="extract-btn"
          className={`${styles.extractBtn} ${isProcessing ? styles.processing : ''}`}
          onClick={onExtract}
          disabled={!canExtract}
        >
          {isProcessing ? (
            <>
              <span className={styles.spinner} />
              Processing...
            </>
          ) : isDone ? (
            'Re-run Extraction'
          ) : (
            'Run Extraction'
          )}
        </button>

        <button id="reset-btn" className={styles.resetBtn} onClick={onReset} title="Reset session">
          Reset
        </button>
      </div>
    </div>
  );
}
