import styles from './StatusBar.module.css';
import { WsState } from '@/types';

interface StatusBarProps {
  wsState: WsState;
  sessionId: string | null;
  chunksProcessed: number;
  totalChunks: number;
  avgLatencyMs: number;
  progress: number;
}

const WS_MESSAGES: Record<WsState, string> = {
  disconnected: 'No active session',
  connecting: 'Connecting to stream...',
  live: 'Stream active',
  error: 'Stream error',
};

export default function StatusBar({
  wsState,
  sessionId,
  chunksProcessed,
  totalChunks,
  avgLatencyMs,
  progress,
}: StatusBarProps) {
  return (
    <footer className={styles.bar}>
      <div className={styles.left}>
        <span className={`${styles.wsStatus} ${styles[wsState]}`}>
          {WS_MESSAGES[wsState]}
        </span>
        {sessionId && (
          <>
            <span className={styles.sep}>·</span>
            <span className={styles.item}>
              <span className={styles.key}>session</span>
              <span className={styles.val}>{sessionId}</span>
            </span>
          </>
        )}
      </div>
      <div className={styles.right}>
        {totalChunks > 0 && (
          <span className={styles.item}>
            <span className={styles.key}>chunks</span>
            <span className={styles.val}>
              {chunksProcessed}/{totalChunks}
            </span>
          </span>
        )}
        {avgLatencyMs > 0 && (
          <>
            <span className={styles.sep}>·</span>
            <span className={styles.item}>
              <span className={styles.key}>avg latency</span>
              <span className={styles.val}>{avgLatencyMs}ms</span>
            </span>
          </>
        )}
        {progress > 0 && (
          <>
            <span className={styles.sep}>·</span>
            <span className={`${styles.item} ${styles.progressItem}`}>
              {progress}%
            </span>
          </>
        )}
      </div>
    </footer>
  );
}
