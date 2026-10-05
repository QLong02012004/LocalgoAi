import React, { useEffect, useState } from "react";
import styles from "./AIRecommendations.module.scss";
import { type AIRecommendation } from "../../../../services/aiRecommendationService";
import { getFeaturedAttractions } from "../../../../services/highlightService";
import AnimatedButton from "../../../../components/Ui/AnimatedButton/AnimatedButton";
import RecommendationCard from "../../../../components/Ui/RecommendationCard/RecommendationCard";

const DEFAULT_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 9991,
    name: "Cầu Vàng Bà Nà",
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80",
    matchPercentage: 98,
    rank: 1
  },
  {
    id: 8881,
    name: "Phố Cổ Hội An",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80",
    matchPercentage: 96,
    rank: 2
  },
  {
    id: 7771,
    name: "Đại Nội Huế",
    image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=600&q=80",
    matchPercentage: 95,
    rank: 3
  },
  {
    id: 9993,
    name: "Cầu Rồng Đà Nẵng",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    matchPercentage: 93,
    rank: 4
  },
  {
    id: 8883,
    name: "Rừng Dừa Bảy Mẫu",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    matchPercentage: 91,
    rank: 5
  }
];

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

        if (mappedData.length > 0) {
          setRecommendations(mappedData);
        } else {
          setRecommendations(DEFAULT_RECOMMENDATIONS);
        }
      } catch {
        console.error("Failed to fetch featured attractions for recommendations");
        setRecommendations(DEFAULT_RECOMMENDATIONS);
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
