import React, { useState } from "react";
import styles from "./RecommendationCard.module.scss";
import type { AIRecommendation } from "../../../services/aiRecommendationService";
import { anhmatdinh } from "../../../assets/images/img";

interface RecommendationCardProps {
  item: AIRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ item }) => {
  const [imgSrc, setImgSrc] = useState(item.image || anhmatdinh);

  React.useEffect(() => {
    setImgSrc(item.image || anhmatdinh);
  }, [item.image]);

  return (
    <div className={styles.miniCard}>
      <span className={styles.rankBg}>{item.rank}</span>
      <img 
        src={imgSrc} 
        alt={item.name} 
        loading="lazy" 
        onError={() => {
          if (imgSrc !== anhmatdinh) {
            setImgSrc(anhmatdinh);
          }
        }}
      />
      <div className={styles.miniInfo}>
        <h4>{item.name}</h4>
        <div className={styles.matchBadge}>
          {item.rank === 1 && <span className={styles.topIcon}>👑</span>}
          Rank #{item.rank}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
