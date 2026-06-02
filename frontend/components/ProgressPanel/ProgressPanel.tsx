import styles from './ProgressPanel.module.css';
import { PipelineStep, StepStatus } from '@/types';

interface ProgressPanelProps {
  steps: PipelineStep[];
  progress: number;
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'pending') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  if (status === 'running') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinIcon}>
        <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'done') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <polyline points="9,12 11,14 15,10" />
      </svg>
    );
  }
  // error
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
}

export default function ProgressPanel({ steps, progress }: ProgressPanelProps) {
  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>PIPELINE STATUS</span>
        {progress > 0 && (
          <span className={styles.pct}>{progress}%</span>
        )}
      </div>

      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.steps}>
        {steps.map((step, i) => (
          <div key={step.name} className={styles.stepRow}>
            {/* Connector line above (not for first) */}
            {i > 0 && (
              <div
                className={`${styles.connector} ${
                  steps[i - 1].status === 'done' ? styles.connectorDone : ''
                }`}
              />
            )}
            <div className={`${styles.step} ${styles[`step_${step.status}`]}`}>
              <div className={styles.iconWrap}>
                <StepIcon status={step.status} />
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              {step.status === 'running' && (
                <span className={styles.runningDots}>
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
