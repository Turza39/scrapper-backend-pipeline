import styles from './SessionInfo.module.css';

interface SessionInfoProps {
  sessionId: string;
  fileName: string | null;
  fileSize: number | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SessionInfo({ sessionId, fileName, fileSize }: SessionInfoProps) {
  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>SESSION</span>
      </div>
      <div className={styles.grid}>
        <div className={styles.row}>
          <span className={styles.key}>id</span>
          <span className={styles.value} title={sessionId}>{sessionId}</span>
        </div>
        {fileName && (
          <div className={styles.row}>
            <span className={styles.key}>file</span>
            <span className={styles.value} title={fileName}>{fileName}</span>
          </div>
        )}
        {fileSize !== null && (
          <div className={styles.row}>
            <span className={styles.key}>size</span>
            <span className={styles.value}>{formatSize(fileSize)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
