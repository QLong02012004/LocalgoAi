import React from "react";
import styles from "./RecommendationCard.module.scss";
import type { AIRecommendation } from "../../../services/aiRecommendationService";

interface RecommendationCardProps {
  item: AIRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ item }) => {
  return (
    <div className={styles.miniCard}>
      <span className={styles.rankBg}>{item.rank}</span>
      <img src={item.image} alt={item.name} loading="lazy" />
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
