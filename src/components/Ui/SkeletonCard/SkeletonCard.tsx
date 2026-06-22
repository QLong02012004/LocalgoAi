import React from "react";
import styles from "./SkeletonCard.module.scss";

const SkeletonCard: React.FC = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.imageLoader}></div>
      <div className={styles.contentLoader}>
        <div className={styles.headerRow}>
          <div className={styles.typeBadge}></div>
          <div className={styles.ratingBadge}></div>
        </div>
        <div className={styles.line1}></div>
        <div className={styles.line2}></div>
        <div className={styles.footerRow}>
          <div className={styles.location}></div>
          <div className={styles.btn}></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
