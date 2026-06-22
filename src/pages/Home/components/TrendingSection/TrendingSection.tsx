import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./TrendingSection.module.scss";
import { getFeaturedAttractions } from "../../../../services/highlightService";

interface TrendingItem {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
}

const TrendingSection: React.FC = () => {
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFeaturedAttractions(20); // Lấy tối đa 20 mục để marquee phong phú
        const data = response.data?.data || [];
        setTrendingData(data.map((item: any) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          location: item.location || "Việt Nam"
        })));
      } catch (error) {
        console.error("Failed to fetch trending data:", error);
      }
    };
    fetchData();
  }, []);

  // Nhân đôi dữ liệu để tạo hiệu ứng lặp vô tận
  const marqueeData = [...trendingData, ...trendingData];

  return (
    <section className={styles.trendingSection}>
      <div className={styles.container}>
        {/* Top 3 Columns */}
        <div className={styles.topGrid}>
          {[
            { city: "Đà Nẵng", desc: "Thành phố của những ánh sáng lung linh, nơi biển xanh ôm trọn những công trình kiến trúc hiện đại và kỳ vĩ." },
            { city: "Hội An", desc: "Một nhịp thở ngưng đọng giữa dòng thời gian, nơi những chiếc đèn lồng kể về câu chuyện nghìn năm của phố cổ." },
            { city: "Cố đô Huế", desc: "Vẻ đẹp trầm mặc và uy nghiêm, nơi lưu giữ những dấu ấn vàng son của một thời hoàng tộc rực rỡ." }
          ].map((col, i) => (
            <motion.div 
              key={i} 
              className={styles.infoCol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p>{col.desc}</p>
              <div className={styles.divider} />
            </motion.div>
          ))}
        </div>

        {/* Center Title */}
        <div className={styles.centerHeader}>
          <span className={styles.subtitle}>HÀNH TRÌNH KHÁM PHÁ</span>
          <h2 className={styles.mainTitle}>Top địa điểm <span className={styles.highlight}>Thịnh Hành</span></h2>
        </div>

        {/* Infinite Marquee Cards */}
        <div className={styles.marqueeContainer}>
          <motion.div 
            className={styles.marqueeTrack}
            animate={{ x: [0, "-50%"] }}
            transition={{ 
              duration: 60, // Làm chậm lại gấp đôi để tạo cảm giác điện ảnh
              repeat: Infinity, 
              ease: "linear" 
            }}
            whileHover={{ animationPlayState: "paused" }} // Tạm dừng khi hover
          >
            {marqueeData.map((item, index) => {
              // Tính toán thứ hạng thực tế (vì dữ liệu được nhân đôi cho marquee)
              const actualRank = (index % trendingData.length) + 1;
              
              return (
                <motion.div 
                  key={`${item.id}-${index}`} 
                  className={styles.marqueeCard}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => window.location.href = `/attraction/${item.id}`}
                >
                  <div className={styles.rankBadge}>TOP {actualRank}</div>
                  <div className={styles.cardImage} style={{ backgroundImage: `url(${item.imageUrl})` }} />
                  <div className={styles.cardOverlay}>
                    <h3>{item.name}</h3>
                    <span className={styles.location}>{item.location.split(',').pop()}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
