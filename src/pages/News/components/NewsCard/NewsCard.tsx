import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CalendarBlank, ArrowRight } from "@phosphor-icons/react";
import styles from './NewsCard.module.scss';
import type { NewsItem } from '../../types';

interface Props {
  item: NewsItem;
}

const NewsCard: React.FC<Props> = ({ item }) => {
  const navigate = useNavigate();
  return (
    <article className={styles.card} onClick={() => navigate(`/news/${item.id}`)} data-aos="fade-up">
      <div className={styles.thumb}>
        <img src={item.image ?? undefined} alt={item.title} />
        <span className={styles.badge}>{item.category}</span>
        <div className={styles.imageOverlay} />
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span>
            <CalendarBlank size={16} weight="bold" />
            {(() => {
              const dateVal = item.createdAt || item.date;
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
          <span>
            <Clock size={16} weight="bold" />
            {item.readTime && !isNaN(Number(item.readTime)) 
              ? `${item.readTime} phút đọc` 
              : item.readTime || "---"}
          </span>
        </div>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.excerpt}>{item.excerpt}</p>
        <button className={styles.link}>
          Đọc thêm <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </article>
  );
};

export default NewsCard;