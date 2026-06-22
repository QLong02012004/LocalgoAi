import React from 'react';
import { ChartPieSlice, Wallet } from "@phosphor-icons/react";
import styles from './BudgetAnalysis.module.scss';

const BudgetAnalysis: React.FC = () => {
  // Dữ liệu giả lập ngân sách
  const data = [
    { label: "Di chuyển", value: 35, color: "#33d7d1" },
    { label: "Khách sạn", value: 30, color: "#2dd4bf" },
    { label: "Ăn uống", value: 20, color: "#0d9488" },
    { label: "Khác", value: 15, color: "#94a3b8" },
  ];

  return (
    <div className={styles.budgetCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.iconBox}>
            <ChartPieSlice size={20} weight="bold" />
          </div>
          <div className={styles.headerText}>
            <h3>Phân tích ngân sách</h3>
            <p>Dự kiến cho các chuyến đi tới</p>
          </div>
        </div>
        <div className={styles.totalBudget}>
          <Wallet size={16} />
          <span>15.5M VND</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.svgWrapper}>
          <svg viewBox="0 0 36 36" className={styles.donutChart}>
            <path
              className={styles.donutRing}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="3"
            />
            {/* Vẽ các phân đoạn - Giả lập đơn giản cho demo */}
            <path
              className={styles.donutSegment}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#33d7d1"
              strokeWidth="3"
              strokeDasharray="65, 100"
            />
          </svg>
          <div className={styles.chartLabel}>
             <span className={styles.labelNum}>65%</span>
             <span className={styles.labelText}>Đã lên kế hoạch</span>
          </div>
        </div>

        <div className={styles.legend}>
          {data.map((item, idx) => (
            <div key={idx} className={styles.legendItem}>
              <span className={styles.dot} style={{ backgroundColor: item.color }}></span>
              <span className={styles.name}>{item.label}</span>
              <span className={styles.value}>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalysis;
