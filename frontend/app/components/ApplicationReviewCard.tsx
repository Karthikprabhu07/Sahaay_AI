import React from 'react';
import { FileText, Edit2, CheckCircle } from 'lucide-react';
import styles from './ApplicationReviewCard.module.css';

interface ApplicationData {
  schemeName: string;
  applicantName: string;
  fields: Record<string, string>;
}

interface ApplicationReviewCardProps {
  application: ApplicationData;
  onApprove: () => void;
  onEdit: () => void;
}

export default function ApplicationReviewCard({ application, onApprove, onEdit }: ApplicationReviewCardProps) {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <div className={styles.headerIcon}>
          <FileText size={20} />
        </div>
        <div>
          <h3 className={styles.schemeName}>{application.schemeName}</h3>
          <p className={styles.subtext}>Application Review</p>
        </div>
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.fieldsList}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Applicant</span>
          <span className={styles.fieldValue}>{application.applicantName}</span>
        </div>
        {Object.entries(application.fields).map(([key, value]) => (
          <div key={key} className={styles.fieldRow}>
            <span className={styles.fieldLabel}>{key}</span>
            <span className={styles.fieldValue}>{value}</span>
          </div>
        ))}
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.actionButtons}>
        <button className={styles.editBtn} onClick={onEdit}>
          <Edit2 size={16} />
          Edit Details
        </button>
        <button className={styles.approveBtn} onClick={onApprove}>
          <CheckCircle size={16} />
          Approve
        </button>
      </div>
    </div>
  );
}
