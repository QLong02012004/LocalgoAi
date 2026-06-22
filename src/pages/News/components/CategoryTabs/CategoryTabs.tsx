import React from 'react';
import styles from './CategoryTabs.module.scss';

interface Props {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs: React.FC<Props> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <nav className={styles.tabsContainer}>
      {categories.map((cat) => (
        <button 
          key={cat}
          className={`${styles.tabBtn} ${activeCategory === cat ? styles.active : ''}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
};

export default CategoryTabs;
