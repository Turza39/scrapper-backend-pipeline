import styles from './Header.module.css';
import { WsState } from '@/types';

interface HeaderProps {
  wsState: WsState;
}

const WS_LABELS: Record<WsState, string> = {
  disconnected: 'OFFLINE',
  connecting: 'CONNECTING',
  live: 'LIVE',
  error: 'ERROR',
};

export default function Header({ wsState }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.logo}>RTSIP</span>
        <span className={styles.subtitle}>Real-Time Streaming Intelligence Platform</span>
      </div>
      <div className={styles.right}>
        <div className={`${styles.badge} ${styles[wsState]}`}>
          <span className={styles.dot} />
          {WS_LABELS[wsState]}
        </div>
      </div>
    </header>
  );
}
