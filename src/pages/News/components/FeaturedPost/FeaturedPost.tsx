import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from "@phosphor-icons/react";
import styles from './FeaturedPost.module.scss';
import type { NewsItem } from '../../types';

interface Props {
  data: NewsItem;
}

const FeaturedPost: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  return (
    <section className={styles.container} onClick={() => navigate(`/news/${data.id}`)} style={{ cursor: 'pointer' }} data-aos="fade-up">
      <div className={styles.imageBox}>
        <img src={data.image ?? undefined} alt={data.title} />
        <div className={styles.tagOverlay}>{data.category}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.date}>
            {(() => {
              const dateVal = data.createdAt || data.date;
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
          <span className={styles.divider}>•</span>
          <span className={styles.readTime}>
            <Clock size={16} weight="bold" />
            {data.readTime && !isNaN(Number(data.readTime)) 
              ? `${data.readTime} phút đọc` 
              : data.readTime || "---"}
          </span>
        </div>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.description}>{data.excerpt}</p>
        <button className={styles.btnAction}>
          Đọc chi tiết <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </section>
  );
};

export default FeaturedPost;