import React from 'react';
import { Sparkle, ArrowRight, Lightbulb } from "@phosphor-icons/react";
import styles from './AIInsightCard.module.scss';

const AIInsightCard: React.FC = () => {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <div className={styles.aiBadge}>
          <Sparkle size={16} weight="fill" />
          <span>AI INSIGHT</span>
        </div>
        <Lightbulb size={24} color="#33d7d1" weight="duotone" />
      </div>
      
      <div className={styles.cardContent}>
        <p className={styles.message}>
          AI nhận thấy bạn chưa đặt khách sạn cho chuyến đi <strong>Đà Nẵng</strong> sắp tới. 
          Bạn có muốn xem gợi ý các khách sạn gần <strong>bãi biển Mỹ Khê</strong> không?
        </p>
      </div>

      <button className={styles.actionBtn}>
        <span>Xem gợi ý ngay</span>
        <ArrowRight size={16} weight="bold" />
      </button>

      <div className={styles.bgDecoration}></div>
    </div>
  );
};

export default AIInsightCard;
