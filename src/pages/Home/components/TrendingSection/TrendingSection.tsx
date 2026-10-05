import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./TrendingSection.module.scss";
import { getFeaturedAttractions } from "../../../../services/highlightService";

interface TrendingItem {
  id: string | number;
  name: string;
  imageUrl: string;
  location: string;
}

const DEFAULT_TRENDING_DATA: TrendingItem[] = [
  {
    id: 9991,
    name: "Cầu Vàng - Bà Nà Hills",
    imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
    location: "Bà Nà Hills, Đà Nẵng"
  },
  {
    id: 8881,
    name: "Phố Cổ Hội An",
    imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
    location: "Hội An, Quảng Nam"
  },
  {
    id: 7771,
    name: "Đại Nội & Kinh Thành Huế",
    imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80",
    location: "TP. Huế, Thừa Thiên Huế"
  },
  {
    id: 9995,
    name: "Bán Đảo Sơn Trà & Chùa Linh Ứng",
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
    location: "Sơn Trà, Đà Nẵng"
  },
  {
    id: 9993,
    name: "Cầu Rồng Đà Nẵng",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    location: "Hải Châu, Đà Nẵng"
  },
  {
    id: 9994,
    name: "Bãi Biển Mỹ Khê",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    location: "Sơn Trà, Đà Nẵng"
  },
  {
    id: 8883,
    name: "Rừng Dừa Bảy Mẫu",
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
    location: "Cẩm Thanh, Hội An"
  },
  {
    id: 7773,
    name: "Chùa Thiên Mụ & Sông Hương",
    imageUrl: "https://images.unsplash.com/photo-1559592490-67245a494447?auto=format&fit=crop&w=800&q=80",
    location: "Hương Long, TP. Huế"
  }
];

const TrendingSection: React.FC = () => {
  const navigate = useNavigate();
  const [trendingData, setTrendingData] = useState<TrendingItem[]>(DEFAULT_TRENDING_DATA);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFeaturedAttractions(20);
        const data = response.data?.data || [];
        if (data.length > 0) {
          setTrendingData(data.map((item: any) => ({
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
            location: item.location || "Việt Nam"
          })));
        } else {
          setTrendingData(DEFAULT_TRENDING_DATA);
        }
      } catch {
        setTrendingData(DEFAULT_TRENDING_DATA);
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
                  onClick={() => navigate(`/attraction/${item.id}`)}
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
