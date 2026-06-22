import React from 'react';
import { useNavigate } from 'react-router-dom';
import {  TrendUp,  } from "@phosphor-icons/react";
import styles from './NewsSidebar.module.scss';
import type { NewsItem } from '../../types';

import ThreeDSearchInput from '../../../../components/Ui/ThreeDSearchInput/ThreeDSearchInput';

interface Props {
  trendingNews: NewsItem[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onSearch: (query: string) => void;
}

const NewsSidebar: React.FC<Props> = ({ 
  trendingNews, 
  onSearch 
}) => {
  const navigate = useNavigate();
  return (
    <aside className={styles.sidebar}>
      {/* Search Bar */}
      <div className={styles.searchSection}>
        <ThreeDSearchInput onChange={(e) => onSearch(e.target.value)} />
      </div>

      {/* Trending News */}
      <div className={styles.section}>
        <h3 className={styles.title}>
          <TrendUp size={24} weight="bold" /> Xu hướng
        </h3>
        <div className={styles.trendingList}>
          {trendingNews.map((news, index) => (
            <div key={news.id} className={styles.trendingItem} onClick={() => navigate(`/news/${news.id}`)} style={{ cursor: 'pointer' }}>
              <span className={styles.index}>{index + 1}</span>
              <div className={styles.info}>
                <h4>{news.title}</h4>
                <span>
                  {(() => {
                    const dateVal = news.createdAt || news.date;
                    if (!dateVal) return "---";
                    if (Array.isArray(dateVal)) {
                      const [year, month, day] = dateVal;
                      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                    }
                    const parsedDate = new Date(dateVal);
                    return !isNaN(parsedDate.getTime()) 
                      ? parsedDate.toLocaleDateString('vi-VN') 
                      : String(dateVal);
                  })()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Quick Link */}
      {/* <div className={styles.section} data-aos="fade-left" data-aos-delay="200">
        <h3 className={styles.title}>
          <Tag size={24} weight="bold" /> Danh mục
        </h3>
        <div className={styles.categoryLinks}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`${styles.catLink} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div> */}

      {/* Ad/Promo Placeholder */}
      <div className={styles.promoBanner}>
        <h4>Bắt đầu hành trình của bạn</h4>
        <p>Để AI thiết kế lịch trình du lịch hoàn hảo cho bạn chỉ trong 30 giây.</p>
        <button onClick={() => navigate("/planner")}>Thử ngay</button>
      </div>
    </aside>
  );
};

export default NewsSidebar;
