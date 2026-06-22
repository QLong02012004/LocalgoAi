import React from 'react';
import styles from './CategoryTabs.module.scss';
import { SquaresFour, MapPin, Bed, ForkKnife, Storefront } from "@phosphor-icons/react";

const categories = [
  { id: 'all', label: 'TẤT CẢ', icon: <SquaresFour size={20} weight="bold" /> },
  { id: 'pin', label: 'ĐỊA ĐIỂM', icon: <MapPin size={20} weight="bold" /> },
  { id: 'bed', label: 'KHÁCH SẠN', icon: <Bed size={20} weight="bold" /> },
  { id: 'food', label: 'NHÀ HÀNG', icon: <ForkKnife size={20} weight="bold" /> },
  { id: 'service', label: 'DỊCH VỤ', icon: <Storefront size={20} weight="bold" /> },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onCategoryChange, className }) => {
  return (
    <div className={`${styles.tabsContainer} ${className || ''}`}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.tabItem} ${activeCategory === cat.id ? styles.active : ''}`}
          onClick={() => onCategoryChange(cat.id)}
        >
          <span className={styles.icon}>{cat.icon}</span>
          <span className={styles.label}>{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;