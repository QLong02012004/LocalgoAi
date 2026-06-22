import React from 'react';
import styles from './InterestItem.module.scss';

interface Props {
  label: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const InterestItem: React.FC<Props> = ({ label, icon, color, isActive, onClick }) => {
  return (
    <div 
      className={`${styles.item} ${isActive ? styles.active : ''}`} 
      onClick={onClick}
      style={{ '--item-color': color } as React.CSSProperties}
    >
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
};

export default InterestItem;