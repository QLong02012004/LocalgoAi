import React from "react";
import styles from "./AdminFeedback.module.scss";

// ─── Loading skeleton ──────────────────────────────────────────────────────────

export const LoadingRows: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <tbody>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i} className={styles.loadingRow}>
        {Array.from({ length: 5 }).map((_, j) => (
          <td key={j}>
            <div
              className={`${styles.skeletonBar} ${j === 0 ? styles.w60 : j === 4 ? styles.w40 : ""}`}
              style={{ "--delay": `${i * 0.1}s` } as React.CSSProperties}
            />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// ─── Error banner ──────────────────────────────────────────────────────────────

export const ErrorBanner: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className={styles.errorBanner}>
    <div className={styles.errorContent}>
      <div className={styles.errorIconBox}>⚠️</div>
      <div className={styles.errorText}>
        <h4>Lỗi kết nối</h4>
        <p>{message}</p>
      </div>
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry} className={styles.retryBtn}>
        Thử lại
      </button>
    )}
  </div>
);

// ─── Skeleton cards (for stat cards area) ─────────────────────────────────────

export const SkeletonCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.skeletonCard}>
        <div
          className={styles.skeletonTitle}
          style={{ "--delay": `${i * 0.1}s` } as React.CSSProperties}
        />
        <div
          className={styles.skeletonValue}
          style={{ "--delay": `${i * 0.1}s` } as React.CSSProperties}
        />
      </div>
    ))}
  </>
);
