import React from 'react';
import { ShieldCheck } from 'lucide-react';
import styles from './TrustBadge.module.css';

interface TrustBadgeProps {
  source: string;
  confidence: number;
  lastVerified: string;
}

export default function TrustBadge({ source, confidence, lastVerified }: TrustBadgeProps) {
  // Simple helper to color code confidence
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'var(--success-color)';
    if (score >= 70) return 'var(--warning-color)';
    return '#ef4444'; // error color
  };

  return (
    <div className={styles.badgeContainer}>
      <div className={styles.iconWrapper}>
        <ShieldCheck size={16} color={getConfidenceColor(confidence)} />
      </div>
      <div className={styles.details}>
        <span className={styles.source}>{source}</span>
        <div className={styles.meta}>
          <span className={styles.confidence}>
            {confidence}% Match
          </span>
          <span className={styles.divider}>•</span>
          <span className={styles.verified}>
            Verified: {lastVerified}
          </span>
        </div>
      </div>
    </div>
  );
}
