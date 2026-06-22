import React from 'react';
import styles from './StatCard.module.scss';
import * as Icons from "@phosphor-icons/react";

export type IconName = keyof typeof Icons;

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: IconName;
  colorClass: string;
  footerText?: string;
  onClick?: () => void;
  showSparkline?: boolean;
  isActive?: boolean;
}

const Sparkline = ({ up }: { up: boolean }) => (
  <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className={styles.sparkline}>
    <path 
      d={up ? "M0 20C5 18 10 12 15 14C20 16 25 22 30 18C35 14 40 4 45 6C50 8 55 2 60 4" : "M0 4C5 6 10 12 15 10C20 8 25 2 30 6C35 10 40 20 45 18C50 16 55 22 60 20"} 
      stroke={up ? "#10b981" : "#f59e0b"} 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// ─── CountUp Component ───────────────────────────────────────────────────────
const CountUp = ({ value }: { value: string | number }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const strValue = String(value);
  const numericValue = parseInt(strValue.replace(/[^0-9.]/g, '')) || 0;
  const suffix = strValue.replace(/[0-9,.]/g, '');
  const hasComma = strValue.includes(',');

  React.useEffect(() => {
    let start = 0;
    const end = numericValue;
    const duration = 1500;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue]);

  const formatted = hasComma ? displayValue.toLocaleString() : displayValue.toString();
  return <span>{formatted}{suffix}</span>;
};

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  trend, 
  trendUp, 
  icon, 
  colorClass, 
  footerText,
  onClick,
  showSparkline,
  isActive
}) => {
  const IconComponent = Icons[icon] as React.ElementType;

  return (
    <div 
      className={`${styles.statCard} ${onClick ? styles.clickable : ''} ${isActive ? styles.activeCard : ''}`}
      onClick={onClick}
    >
      <div className={styles.statHeader}>
        <div className={styles.statInfo}>
          <p className={styles.statLabel}>{label}</p>
          <div className={styles.valueRow}>
            <p className={styles.statValue}>
              <CountUp value={value} />
            </p>
            {showSparkline && trendUp !== undefined && <Sparkline up={trendUp} />}
          </div>
        </div>
        <div className={`${styles.statIcon} ${styles[colorClass]}`}>
          {IconComponent && <IconComponent size={24} weight="fill" />}
        </div>
      </div>
      {trend && (
        <div className={`${styles.statTrend} ${trendUp ? styles.textEmerald : styles.textAmber}`}>
          {trendUp ? <Icons.TrendUp size={14} weight="bold" /> : <Icons.TrendDown size={14} weight="bold" />}
          <span>{trend}</span>
        </div>
      )}
      {footerText && <p className={styles.footerLabel}>{footerText}</p>}
    </div>
  );
};

export default StatCard;
