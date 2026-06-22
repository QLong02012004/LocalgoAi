import React from "react";
import styles from "./CategoryTabs.module.scss";

interface Props {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "Tất cả" },
  { id: "beach", label: "Nghỉ dưỡng Biển" },
  { id: "culture", label: "Văn hóa & Lịch sử" },
  { id: "nature", label: "Thiên nhiên" },
  { id: "adventure", label: "Khám phá & Thể thao" },
];

const CategoryTabs: React.FC<Props> = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className={styles.tabsContainer}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.active : ""}`}
          onClick={() => onCategoryChange(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
