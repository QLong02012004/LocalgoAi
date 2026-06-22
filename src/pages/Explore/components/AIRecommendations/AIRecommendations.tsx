import React, { useEffect, useState } from "react";
import styles from "./AIRecommendations.module.scss";
import { type AIRecommendation } from "../../../../services/aiRecommendationService";
import { getFeaturedAttractions } from "../../../../services/highlightService";
import AnimatedButton from "../../../../components/Ui/AnimatedButton/AnimatedButton";
import RecommendationCard from "../../../../components/Ui/RecommendationCard/RecommendationCard";

const AIRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await getFeaturedAttractions(8);
        const data = response.data?.data || [];
        
        // Map HighlightItem sang AIRecommendation (Hiển thị tất cả không lọc)
        const mappedData: AIRecommendation[] = data.map((item, idx) => ({
          id: item.id,
          name: item.name || "Địa điểm chưa đặt tên",
          image: item.imageUrl,
          matchPercentage: 90 + (idx % 10),
          rank: idx + 1,
        }));

        setRecommendations(mappedData);
      } catch {
        console.error("Failed to fetch featured attractions for recommendations");
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className={styles.aiSection} data-aos="fade-right">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.aiIcon}>🔥</span>
          <h3>Top thịnh hành</h3>
        </div>
        <AnimatedButton text="XEM TẤT CẢ" />
      </div>
      <div className={styles.marqueeContainer}>
        <div className={styles.scrollWrapper}>
          {recommendations.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
          {/* Duplicate for infinite marquee effect */}
          {recommendations.map((item) => (
            <RecommendationCard key={`dup-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
